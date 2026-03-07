// --- AI: Gemini API, Chat, Global Plan ---

window._aiDebugLogs = [];
window.addAIDebugLog = (type, data) => {
    window._aiDebugLogs.push({ timestamp: new Date().toISOString(), type, ...data });
    if (window._aiDebugLogs.length > 20) window._aiDebugLogs.shift();
};

window.downloadAIDebugLogs = () => {
    if (window._aiDebugLogs.length === 0) { alert("Keine Logs vorhanden."); return; }
    const blob = new Blob([JSON.stringify(window._aiDebugLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hybrid_coach_ai_debug_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click(); URL.revokeObjectURL(url);
};

async function fetchGemini(systemPrompt, apiKey) {
    const models = ['gemini-2.5-flash'];
    const errors = [];
    window.addAIDebugLog('request_start', { systemPrompt });
    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });
            const resData = await response.json();
            window.addAIDebugLog('response_raw', { model, resData });
            if (resData.error) throw new Error(resData.error.message);
            if (!resData.candidates || !resData.candidates[0]) throw new Error("Keine Antwort von der KI erhalten.");
            let textObj = resData.candidates[0].content.parts[0].text;
            textObj = textObj.replace(/```json/gi, '').replace(/```/g, '').trim();
            const startIndex = textObj.indexOf('{');
            const endIndex = textObj.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const jsonStr = textObj.substring(startIndex, endIndex + 1);
                try {
                    const responseObj = JSON.parse(jsonStr);
                    const planArr = responseObj.plan || responseObj.weeks;
                    if (responseObj && Array.isArray(planArr) && planArr.length === 7) {
                        window.addAIDebugLog('parsed_success', { model, reasoning: responseObj.reasoning });
                        return { model: model, reasoning: responseObj.reasoning || "Keine Begründung angegeben.", plan: planArr };
                    }
                    throw new Error(`Formatfehler: KI hat ${Array.isArray(planArr) ? planArr.length : 0} Tage statt 7 generiert.`);
                } catch (parseErr) {
                    throw new Error("Fehler beim Verarbeiten des JSON: " + parseErr.message);
                }
            } else {
                throw new Error("JSON-Objekt in Antwort nicht gefunden.");
            }
        } catch (e) {
            errors.push(`${model}: ${e.message}`);
            console.warn(`Fehler mit ${model}:`, e);
            window.addAIDebugLog('model_error', { model, error: e.message });
            if (e.message && e.message.toLowerCase().includes('api key not valid')) break;
        }
    }
    window.addAIDebugLog('request_fail', { errors });
    throw new Error("KI-Modelle fehlgeschlagen:\n" + errors.join("\n"));
}

window.openAIChat = () => {
    if (!state.user.apiKey) { alert("Bitte hinterlege zuerst deinen Gemini API Key im Setup."); return; }
    let html = `
        <div class="mb-4">
            <p class="text-sm dark:text-slate-300 mb-2">Wie möchtest du den Plan anpassen?</p>
            <textarea id="ai-prompt" rows="3" class="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="z.B. 'Ich bin krank, mach Mo und Di zu Rest Days...'"></textarea>
        </div>
        <div id="ai-loading" class="hidden flex flex-col items-center justify-center py-4">
            <div class="spinner border-indigo-500 border-t-indigo-200"></div>
            <p class="text-xs mt-2 text-indigo-500 font-bold">KI analysiert und schreibt den Plan um...</p>
        </div>
        <div class="space-y-2">
            <button id="ai-submit-btn" onclick="window.fetchAIPlan()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
                ${I.brain} Nur Woche ${state.week + 1} anpassen
            </button>
            <button id="ai-global-submit-btn" onclick="window.fetchAIGlobalFollowupPlan()" class="w-full bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
                ${I.sparkle} Ganze Restplanung anpassen
            </button>
        </div>
    `;
    if (state.configs[state.week] && state.configs[state.week].aiPlan) {
        html += `<button onclick="window.resetAIPlan()" class="w-full mt-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-3 rounded-xl font-bold text-xs">Zurück zum Standard-Algorithmus (W${state.week + 1})</button>`;
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
    const globalBtn = document.getElementById('ai-global-submit-btn');
    if (globalBtn) globalBtn.style.display = 'none';
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
       WICHTIG bei Gym: Du musst keine "exercises" erfinden. Behalte typische Split-Übungen (Push/Pull/Leg oder Upper/Lower) aus dem Standard-Plan bei oder nutze etablierte Standards.
    5. Keine Markdown-Blöcke (wie \`\`\`json) außer dem reinen JSON-Text string.`;
    try {
        const aiResult = await fetchGemini(systemPrompt, state.user.apiKey);
        window.showAIConfirmation(aiResult);
    } catch (e) {
        window.addAIDebugLog('request_fail', { error: e.message });
        document.getElementById('ai-loading').classList.add('hidden');
        document.getElementById('modal-body').innerHTML += `
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p class="text-xs text-red-600 dark:text-red-400 font-bold mb-2">KI Fehler: ${e.message}</p>
                <button onclick="window.downloadAIDebugLogs()" class="w-full p-2 bg-red-600 text-white rounded-lg text-[10px] font-bold">Debug-Log für Entwickler herunterladen</button>
            </div>
        `;
        document.getElementById('ai-submit-btn').style.display = 'flex';
        if (globalBtn) globalBtn.style.display = 'flex';
    }
};

window.fetchAIGlobalFollowupPlan = async () => {
    const promptInput = document.getElementById('ai-prompt').value;
    if (!promptInput) return;
    document.getElementById('ai-submit-btn').style.display = 'none';
    document.getElementById('ai-global-submit-btn').style.display = 'none';
    document.getElementById('ai-loading').classList.remove('hidden');

    const totalWeeks = getTotalWeeks(state.user);
    const skeletonWeeks = [];
    for (let w = state.week; w < totalWeeks; w++) {
        const plan = generatePlan(w);
        skeletonWeeks.push(plan.map(d => ({ id: d.id, type: d.type, title: d.title, desc: d.desc, exercises: d.exercises || [] })));
    }

    const systemPrompt = `Du bist ein elitärer Hybrid-Coach. Du modifizierst die RESTLICHE Trainingsplanung (Woche ${state.week + 1} bis Woche ${totalWeeks}) basierend auf Nutzeranfragen.
    Nutzerprofil: ${state.user.fitness}, Goal: ${state.user.goal}.
    Nutzer-Anfrage: "${promptInput}"
    
    Hier ist der restliche Plan als Array von ${skeletonWeeks.length} Wochen: ${JSON.stringify(skeletonWeeks)}
    
    Regeln:
    1. Antworte AUSSCHLIESSLICH mit einem JSON-Objekt.
    2. Keys: "reasoning" (kurz auf Deutsch) und "weeks" (Array von exakt ${skeletonWeeks.length} Wochen).
    3. Die erste Woche im "weeks" Array MUSS die Woche mit den IDs w${state.week}d0 bis w${state.week}d6 sein.
    4. Behalte alle IDs strikt bei.
    5. WICHTIG bei Gym: Behalte das Array "exercises" bei. Erfinde keine Übungen.
    6. Passe Volumen, Läufe und Aufteilung sinnvoll an die Nutzeranfrage an.
    7. Keine Markdown-Blöcke (wie \`\`\`json) außer dem reinen JSON-Text string.`;

    try {
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        let success = false;
        window.addAIDebugLog('request_start', { systemPrompt });
        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.user.apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                });
                const resData = await response.json();
                window.addAIDebugLog('response_raw', { model, resData });
                if (resData.error) throw new Error(resData.error.message);

                let textObj = resData.candidates[0].content.parts[0].text;
                textObj = textObj.replace(/```json/gi, '').replace(/```/g, '').trim();
                const startIdx = textObj.indexOf('{'); const endIdx = textObj.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    const responseObj = JSON.parse(textObj.substring(startIdx, endIdx + 1));
                    const weeksArr = responseObj.weeks || responseObj.plan;
                    if (Array.isArray(weeksArr) && weeksArr.length === skeletonWeeks.length) {
                        window.addAIDebugLog('parsed_success', { model, reasoning: responseObj.reasoning });
                        showGlobalAIConfirmation({ model, reasoning: responseObj.reasoning || 'Restliche Planung angepasst.', weeks: weeksArr }, state.week);
                        success = true;
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Followup error with ${model}:`, e);
                window.addAIDebugLog('model_error', { model, error: e.message });
            }
        }
        if (!success) throw new Error("Ganze Planung anpassen fehlgeschlagen.");
    } catch (e) {
        window.addAIDebugLog('request_fail', { error: e.message });
        document.getElementById('ai-loading').classList.add('hidden');
        document.getElementById('modal-body').innerHTML += `
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p class="text-xs text-red-600 dark:text-red-400 font-bold mb-2">KI Fehler: ${e.message}</p>
                <button onclick="window.downloadAIDebugLogs()" class="w-full p-2 bg-red-600 text-white rounded-lg text-[10px] font-bold">Debug-Log für Entwickler herunterladen</button>
            </div>
        `;
        document.getElementById('ai-submit-btn').style.display = 'flex';
        document.getElementById('ai-global-submit-btn').style.display = 'flex';
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
    3. IDs: w${state.week}d0 bis w${state.week}d6. Types: gym, run, vol, bike, rest. Optional "exercises" für Gym.
       WICHTIG bei Gym: Erfinde keine Übungen. Behalte typische Split-Übungen (wie Push/Pull/Legs) bei.
    4. Keine Markdown-Blöcke (wie \`\`\`json) außer dem reinen JSON-Text string.`;
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
        skeletonWeeks.push(plan.map(d => ({ id: d.id, type: d.type, title: d.title, desc: d.desc, exercises: d.exercises || [] })));
    }
    const systemPrompt = `Du bist ein zertifizierter Sportwissenschaftler und erstellst einen personalisierten ${totalWeeks}-Wochen Hybrid-Trainingsplan.
Nutzerprofil:
- Erfahrungslevel: ${state.user.fitness}
- Primäres Ziel: ${state.user.goal}
- Max. Herzfrequenz: ${state.user.maxHR} bpm
${state.user.goalTime ? `- Zielzeit: ${state.user.goalTime}\n` : ''}${state.user.benchmarkDist ? `- Benchmark Lauf: ${state.user.benchmarkDist}km in ${state.user.benchmarkTime || '?'} @ ${state.user.benchmarkAvgHR || '?'} bpm (${state.user.benchmarkNotes || 'keine Notizen'})\n` : ''}
Hier ist der Standard-Plan (${totalWeeks} Wochen à 7 Tage): ${JSON.stringify(skeletonWeeks)}
Prinzipien: Progressive Überlastung (max 10%/Woche), 80/20 Regel, Periodisierung (Base→Build→Peak→Taper), Superkompensation.
Antwort: JSON.
- "reasoning" (3-5 Sätze): Analysiere kurz das Ziel. ${state.user.goalTime && state.user.benchmarkDist ? 'Bewerte unbedingt die Machbarkeit der Zielzeit basierend auf dem Benchmark-Lauf!' : ''}
- "weeks" (Array mit ${totalWeeks} × 7 Tagen). IDs: w0d0 bis w${totalWeeks - 1}d6. Das Tag-Objekt MUSS "id", "type", "title", "desc" enthalten. 
WICHTIG bei Gym-Tagen: Übernimm ZWINGEND das Array "exercises" aus dem Standard-Plan (typische Splits wie Push/Pull/Legs oder Upper/Lower). Erfinde keine neuen Übungen! Passe lediglich das Pensum, die Aufteilung der Gym-Tage sowie das Lauftraining strukturiert an.
Gib absolut KEINEN Markdown-Codeblock (wie \`\`\`json) zurück, sondern reinen JSON-Text string.`;
    try {
        const models = ['gemini-2.5-flash'];
        const errors = [];
        window.addAIDebugLog('request_start', { systemPrompt });
        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.user.apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                });
                const resData = await response.json();
                window.addAIDebugLog('response_raw', { model, resData });
                if (resData.error) throw new Error(resData.error.message);
                if (!resData.candidates || !resData.candidates[0]) throw new Error("Keine Antwort von der KI erhalten.");
                let textObj = resData.candidates[0].content.parts[0].text;
                textObj = textObj.replace(/```json/gi, '').replace(/```/g, '').trim();
                const startIdx = textObj.indexOf('{'); const endIdx = textObj.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    try {
                        const responseObj = JSON.parse(textObj.substring(startIdx, endIdx + 1));
                        const weeksArr = responseObj.weeks || responseObj.plan;
                        if (responseObj && Array.isArray(weeksArr) && weeksArr.length === totalWeeks) {
                            let valid = true;
                            for (const week of weeksArr) { if (!Array.isArray(week) || week.length !== 7) { valid = false; break; } }
                            if (valid) {
                                window.addAIDebugLog('parsed_success', { model, reasoning: responseObj.reasoning });
                                showGlobalAIConfirmation({ model, reasoning: responseObj.reasoning || 'Kein Reasoning.', weeks: weeksArr });
                                return;
                            }
                        }
                        throw new Error(`Formatfehler: KI hat ${Array.isArray(weeksArr) ? weeksArr.length : 0} Wochen statt ${totalWeeks} generiert.`);
                    } catch (parseErr) {
                        throw new Error('JSON Parse Fehler: ' + parseErr.message);
                    }
                } else {
                    throw new Error('JSON-Objekt in Antwort nicht gefunden.');
                }
            } catch (e) {
                errors.push(`${model}: ${e.message}`);
                window.addAIDebugLog('model_error', { model, error: e.message });
                console.warn('Global AI Plan Fehler:', e);
            }
        }
        window.addAIDebugLog('request_fail', { errors });
        throw new Error('Alle Modelle fehlgeschlagen:\n' + errors.join('\n'));
    } catch (e) {
        console.error("KI Onboarding Exception:", e);
        alert('KI-Planung fehlgeschlagen: ' + e.message + '\nDer Standard-Plan wird genutzt.');
        document.getElementById('onboarding-overlay').style.display = 'none';
    }
}

function showGlobalAIConfirmation(aiResult, startWeek = 0) {
    document.getElementById('onboarding-overlay').style.display = 'none';
    document.getElementById('modal-title').innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-5 h-5">' + I.sparkle + '</span> ' + (startWeek > 0 ? 'Plan-Anpassung fertig' : 'Dein Master-Plan ist fertig') + '</span>';
    const html = `
        <div class="mb-4 flex flex-col items-center">
            <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300 mb-4">
                Generiert mit ${aiResult.model}
            </span>
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 w-full">
                <p class="font-bold text-xs text-indigo-700 dark:text-indigo-400 mb-2">Analyse:</p>
                <p class="text-xs leading-relaxed">${aiResult.reasoning}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-6">
            <button class="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs flex items-center justify-center gap-1" onclick="window.closeModal()"><span class="w-4 h-4">${I.crossX}</span> ${startWeek > 0 ? 'Verwerfen' : 'Standard-Plan'}</button>
            <button class="p-3 rounded-xl bg-green-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1" onclick="window.applyGlobalAIPlan(${startWeek})"><span class="w-4 h-4">${I.check}</span> Plan übernehmen</button>
        </div>
    `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-overlay').style.display = 'flex';
    window._pendingGlobalPlan = aiResult.weeks;
}

window.applyGlobalAIPlan = (startWeek = 0) => {
    if (window._pendingGlobalPlan) {
        for (let i = 0; i < window._pendingGlobalPlan.length; i++) {
            const w = startWeek + i;
            if (!state.configs[w]) state.configs[w] = { uni: [], vol: true, bike: [], aiPlan: null };
            state.configs[w].aiPlan = window._pendingGlobalPlan[i];
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
