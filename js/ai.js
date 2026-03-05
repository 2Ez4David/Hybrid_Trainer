// --- AI: Gemini API, Chat, Global Plan ---

async function fetchGemini(systemPrompt, apiKey) {
    const models = ['gemini-2.5-flash'];
    const errors = [];
    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });
            const resData = await response.json();
            if (resData.error) throw new Error(resData.error.message);
            let textObj = resData.candidates[0].content.parts[0].text;
            const startIndex = textObj.indexOf('{');
            const endIndex = textObj.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const jsonStr = textObj.substring(startIndex, endIndex + 1);
                try {
                    const responseObj = JSON.parse(jsonStr);
                    if (responseObj && Array.isArray(responseObj.plan) && responseObj.plan.length === 7) {
                        return { model: model, reasoning: responseObj.reasoning || "Keine Begründung angegeben.", plan: responseObj.plan };
                    }
                    throw new Error("Formatfehler: KI hat kein 'plan' Array mit 7 Tagen generiert.");
                } catch (parseErr) {
                    throw new Error("Fehler beim Verarbeiten des JSON: " + parseErr.message);
                }
            } else throw new Error("JSON-Objekt in Antwort nicht gefunden.");
        } catch (e) {
            errors.push(`${model}: ${e.message}`);
            console.warn(`Fehler mit ${model}:`, e);
            if (e.message && e.message.toLowerCase().includes('api key not valid')) break;
        }
    }
    throw new Error("Models fehlgeschlagen:\\n" + errors.join("\\n"));
}

window.openAIChat = () => {
    if (!state.user.apiKey) { alert("Bitte hinterlege zuerst deinen Gemini API Key im Setup."); return; }
    let html = `
        <div class="mb-4">
            <p class="text-sm dark:text-slate-300 mb-2">Wie möchtest du den Plan für <b>Woche ${state.week + 1}</b> anpassen?</p>
            <textarea id="ai-prompt" rows="3" class="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="z.B. 'Ich bin krank, mach Mo und Di zu Rest Days...'"></textarea>
        </div>
        <div id="ai-loading" class="hidden flex flex-col items-center justify-center py-4">
            <div class="spinner border-indigo-500 border-t-indigo-200"></div>
            <p class="text-xs mt-2 text-indigo-500 font-bold">KI analysiert und schreibt den Plan um...</p>
        </div>
        <button id="ai-submit-btn" onclick="window.fetchAIPlan()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
            ${I.brain} Plan neu generieren
        </button>
    `;
    if (state.configs[state.week] && state.configs[state.week].aiPlan) {
        html += `<button onclick="window.resetAIPlan()" class="w-full mt-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-3 rounded-xl font-bold text-xs">Zurück zum Standard-Algorithmus</button>`;
    }
    document.getElementById('modal-title').innerText = `KI Plan-Anpassung`;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-overlay').style.display = 'flex';
};

window.resetAIPlan = () => {
    state.configs[state.week].aiPlan = null;
    save(); window.closeModal(); window.render();
}

window.showAIConfirmation = (aiResult) => {
    document.getElementById('modal-title').innerHTML = `<span class="inline-flex items-center gap-2"><span class="w-5 h-5">${I.sparkle}</span> KI Plan generiert</span>`;
    const html = `
        <div class="mb-4 flex flex-col items-center">
            <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300 mb-4">
                Modell: ${aiResult.model}
            </span>
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 text-sm italic text-slate-600 dark:text-slate-300 w-full text-center">
                "${aiResult.reasoning}"
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-6">
            <button class="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs" onclick="window.closeModal()">
                <span class="w-4 h-4 inline-block">${I.crossX}</span> Verwerfen
            </button>
            <button class="p-3 rounded-xl bg-green-600 text-white font-bold text-xs shadow-md" onclick='window.applyAIPlan(${JSON.stringify(aiResult.plan).replace(/'/g, "&#39;")})'>
                <span class="w-4 h-4 inline-block">${I.check}</span> Plan übernehmen
            </button>
        </div>
    `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-overlay').style.display = 'flex';
}

window.applyAIPlan = (planArray) => {
    state.configs[state.week].aiPlan = planArray;
    save(); window.closeModal(); window.render();
}

window.fetchAIPlan = async () => {
    const promptInput = document.getElementById('ai-prompt').value;
    if (!promptInput) return;
    document.getElementById('ai-submit-btn').style.display = 'none';
    document.getElementById('ai-loading').classList.remove('hidden');
    const currentBasePlan = generatePlan(state.week);
    const contextPlan = currentBasePlan.map(d => ({ id: d.id, type: d.type, title: d.title, desc: d.desc, exercises: d.exercises || [] }));
    const systemPrompt = `Du bist ein elitärer Hybrid-Coach. Du modifizierst Trainingspläne basierend auf Nutzeranfragen.
    Hier ist der Standard-Plan für die aktuelle Woche (Woche ${state.week + 1}): 
    ${JSON.stringify(contextPlan)}
    Nutzer-Anfrage: "${promptInput}"
    Regeln:
    1. Antworte AUSSCHLIESSLICH mit einem JSON-Objekt.
    2. Das JSON MUSS exakt zwei Keys haben:
       - "reasoning": Ein kurzer einprägsamer Satz auf Deutsch, der erklärt WARUM du die Änderungen gemacht hast.
       - "plan": Ein JSON-Array, das exakt 7 Objekte (Tag 0 bis 6) enthält.
    3. Erhalte die "id" Felder (w${state.week}d0 bis w${state.week}d6) exakt so.
    4. Passe "type", "title", "desc" und "exercises" (Array von Strings, falls gym) sinnvoll an. Erlaubte types: 'gym', 'run', 'vol', 'bike', 'rest'.
    5. Keine Markdown-Blöcke außer dem reinen JSON.`;
    try {
        const aiResult = await fetchGemini(systemPrompt, state.user.apiKey);
        window.showAIConfirmation(aiResult);
    } catch (e) {
        alert("KI Fehler: " + e.message);
        document.getElementById('ai-submit-btn').style.display = 'flex';
        document.getElementById('ai-loading').classList.add('hidden');
    }
};

window.fetchSetupAIPlan = async () => {
    if (!state.user.apiKey) { alert('Bitte gib zuerst deinen API Key ein und speichere.'); return; }
    const btn = document.getElementById('ai-setup-btn');
    btn.innerHTML = `<span class="animate-pulse">Lädt...</span>`; btn.disabled = true;
    let lastWeekLog = "Keine vorherigen Daten.";
    if (state.week > 0) {
        const logs = [];
        for (let i = 0; i < 7; i++) {
            const dId = `w${state.week - 1}d${i}`;
            const l = state.logs[dId];
            if (l && l.done) {
                let txt = `Tag ${i}: `;
                if (l.run && l.run.dist) txt += `Lauf ${l.run.dist}km in ${l.run.time || '?'}. `;
                if (l.exercises) txt += `Gym: ${Object.keys(l.exercises).length} Übung(en) gemacht. `;
                logs.push(txt);
            }
        }
        if (logs.length) lastWeekLog = logs.join(' | ');
    }
    const contextPlan = generatePlan(state.week).map(d => ({ id: d.id, type: d.type, title: d.title, desc: d.desc, exercises: d.exercises || [] }));
    const systemPrompt = `Du bist ein elitärer Hybrid-Coach. Du modifizierst den Trainingsplan für Woche ${state.week + 1}.
    Standard-Plan: ${JSON.stringify(contextPlan)}
    Letzte Woche: ${lastWeekLog}
    Regeln:
    1. Antworte AUSSCHLIESSLICH mit einem JSON-Objekt.
    2. Keys: "reasoning" (1 Satz auf Deutsch) und "plan" (7 Tage Array).
    3. IDs: w${state.week}d0 bis w${state.week}d6. Types: gym, run, vol, bike, rest.
    4. Keine Markdown-Blöcke.`;
    try {
        const aiResult = await fetchGemini(systemPrompt, state.user.apiKey);
        window.showAIConfirmation(aiResult);
    } catch (e) {
        alert("KI Fehler: " + e.message);
        btn.innerHTML = `${I.brain} Training smart planen (KI)`; btn.disabled = false;
    }
};

// --- INITIAL GLOBAL AI PLAN ---
async function fetchInitialGlobalAIPlan() {
    const totalWeeks = getTotalWeeks(state.user);
    const skeletonWeeks = [];
    for (let w = 0; w < totalWeeks; w++) {
        const plan = generatePlan(w);
        skeletonWeeks.push(plan.map(d => ({ id: d.id, type: d.type, title: d.title, desc: d.desc })));
    }
    const systemPrompt = `Du bist ein zertifizierter Sportwissenschaftler und erstellst einen personalisierten ${totalWeeks}-Wochen Hybrid-Trainingsplan.
Nutzerprofil:
- Erfahrungslevel: ${state.user.fitness}
- Primäres Ziel: ${state.user.goal}
- Max. Herzfrequenz: ${state.user.maxHR} bpm
Hier ist der Standard-Plan (${totalWeeks} Wochen à 7 Tage): ${JSON.stringify(skeletonWeeks)}
Prinzipien: Progressive Überlastung (max 10%/Woche), 80/20 Regel, Periodisierung (Base→Build→Peak→Taper), Superkompensation.
Antwort: JSON mit "reasoning" (3-5 Sätze) und "weeks" (Array mit ${totalWeeks} × 7 Tagen). IDs: w0d0 bis w${totalWeeks - 1}d6. Kein Markdown.`;
    try {
        const models = ['gemini-2.5-flash'];
        const errors = [];
        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.user.apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                });
                const resData = await response.json();
                if (resData.error) throw new Error(resData.error.message);
                let textObj = resData.candidates[0].content.parts[0].text;
                const startIdx = textObj.indexOf('{'); const endIdx = textObj.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    const responseObj = JSON.parse(textObj.substring(startIdx, endIdx + 1));
                    if (responseObj && Array.isArray(responseObj.weeks) && responseObj.weeks.length === totalWeeks) {
                        let valid = true;
                        for (const week of responseObj.weeks) { if (!Array.isArray(week) || week.length !== 7) { valid = false; break; } }
                        if (valid) {
                            showGlobalAIConfirmation({ model, reasoning: responseObj.reasoning || 'Kein Reasoning.', weeks: responseObj.weeks });
                            return;
                        }
                    }
                    throw new Error('Formatfehler: KI hat nicht ' + totalWeeks + ' Wochen à 7 Tage generiert.');
                } else throw new Error('JSON-Objekt nicht gefunden.');
            } catch (e) {
                errors.push(`${model}: ${e.message}`);
                console.warn('Global AI Plan Fehler:', e);
            }
        }
        throw new Error('Alle Modelle fehlgeschlagen:\n' + errors.join('\n'));
    } catch (e) {
        alert('KI-Planung fehlgeschlagen: ' + e.message + '\nDer Standard-Plan wird genutzt.');
        document.getElementById('onboarding-overlay').style.display = 'none';
    }
}

function showGlobalAIConfirmation(aiResult) {
    document.getElementById('onboarding-overlay').style.display = 'none';
    document.getElementById('modal-title').innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-5 h-5">' + I.sparkle + '</span> Dein Master-Plan ist fertig</span>';
    const html = `
        <div class="mb-4 flex flex-col items-center">
            <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300 mb-4">
                Generiert mit ${aiResult.model}
            </span>
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 w-full">
                <p class="font-bold text-xs text-indigo-700 dark:text-indigo-400 mb-2">Trainingsplan-Analyse:</p>
                <p class="text-xs leading-relaxed">${aiResult.reasoning}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-6">
            <button class="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs flex items-center justify-center gap-1" onclick="window.skipGlobalAIPlan()"><span class="w-4 h-4">${I.crossX}</span> Standard-Plan</button>
            <button class="p-3 rounded-xl bg-green-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1" onclick="window.applyGlobalAIPlan()"><span class="w-4 h-4">${I.check}</span> Plan übernehmen</button>
        </div>
    `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-overlay').style.display = 'flex';
    window._pendingGlobalPlan = aiResult.weeks;
}

window.applyGlobalAIPlan = () => {
    if (window._pendingGlobalPlan) {
        for (let w = 0; w < window._pendingGlobalPlan.length; w++) {
            if (!state.configs[w]) state.configs[w] = { uni: [], vol: true, bike: [], aiPlan: null };
            state.configs[w].aiPlan = window._pendingGlobalPlan[w];
        }
        delete window._pendingGlobalPlan; save();
    }
    window.closeModal(); window.render();
    if (window._showTutorialAfterPlan) {
        showTutorial();
        delete window._showTutorialAfterPlan;
    }
};

window.skipGlobalAIPlan = () => {
    delete window._pendingGlobalPlan;
    window.closeModal(); window.render();
    if (window._showTutorialAfterPlan) {
        showTutorial();
        delete window._showTutorialAfterPlan;
    }
};
