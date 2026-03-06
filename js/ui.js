// --- UI: Renderer, Stats, Modals ---

// Mobility helpers
function getMobKey(w, dIdx) { return `mob_w${w}_d${dIdx}`; }
function calculateTotalMobility() {
    let total = 0;
    for (const key in state.logs) {
        if (key.startsWith('mob_w') && Array.isArray(state.logs[key]) && state.logs[key].length >= 5) total++;
    } return total;
}

window.openMobilityDay = (w, dIdx) => {
    const key = getMobKey(w, dIdx); const doneList = state.logs[key] || [];
    document.getElementById('modal-title').innerText = `Mobility: ${weekDays[dIdx]}`;
    let html = `<p class="text-xs opacity-60 mb-4 dark:text-slate-400">Routine für ${weekDays[dIdx]} (Woche ${w + 1})</p><div class="space-y-3">`;
    mobilityRoutine.forEach((ex, i) => {
        const isChecked = doneList.includes(i);
        html += `<div onclick="window.toggleMobilityCheck('${key}', ${i}, ${w}, ${dIdx})" class="flex items-center p-3 rounded-xl border cursor-pointer ${isChecked ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}">
            <div class="w-6 h-6 rounded flex items-center justify-center mr-4 border ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500'}">${isChecked ? I.check : ''}</div>
            <div><div class="font-bold text-sm dark:text-white ${isChecked ? 'line-through opacity-50' : ''}">${ex.n}</div><div class="text-[10px] opacity-60 dark:text-slate-400">${ex.d}</div></div>
        </div>`;
    });
    html += `</div>`;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = `<button onclick="window.closeModal(); window.render()" class="w-full bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-xl font-bold text-sm">Fertig</button>`;
    document.getElementById('modal-overlay').style.display = 'flex';
};

window.toggleMobilityCheck = (key, exIdx, w, dIdx) => {
    if (!state.logs[key]) state.logs[key] = [];
    if (state.logs[key].includes(exIdx)) state.logs[key] = state.logs[key].filter(i => i !== exIdx); else state.logs[key].push(exIdx);
    save(); window.openMobilityDay(w, dIdx);
};

// --- SETUP ---
window.openSetup = () => {
    const cfg = state.configs[state.week] || { uni: [], vol: true };
    let html = `<p class="text-xs font-bold opacity-50 mb-3 dark:text-slate-400">GYM TAGE AUSWÄHLEN</p><div class="flex gap-1.5 mb-6">`;
    weekDays.forEach(d => {
        const act = cfg.uni.includes(d);
        const short = d.substring(0, 2);
        html += `<button onclick="window.toggleUni('${d}')" class="flex flex-col items-center py-2 px-1 rounded-lg border-2 flex-1 min-w-0 transition-all ${act ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md shadow-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}"><span class="text-sm mb-0.5">${act ? I.gym : '·'}</span><span class="text-[10px] font-bold ${act ? 'text-blue-700 dark:text-blue-300' : 'opacity-50 dark:text-slate-400'}">${short}</span></button>`;
    });
    const zones = window.getHRZones(state.user);
    html += `</div>
    <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 mb-4">
        <label class="block text-xs font-bold dark:text-white mb-2">${I.target} Fokus & Ziele</label>
        <div class="grid grid-cols-2 gap-2 mb-2">
            <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Event ($Ziel)</label><input type="text" value="${state.user.goal}" onchange="state.user.goal=this.value; save()" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs"></div>
            <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Zielzeit</label><input type="text" value="${state.user.goalTime || ''}" onchange="state.user.goalTime=this.value; save()" placeholder="z.B. 1:45:00" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs"></div>
        </div>
        <label class="block text-xs font-bold dark:text-white mt-4 mb-2">${I.flame} Aktueller Benchmark</label>
        <div class="grid grid-cols-2 gap-2 mb-2">
            <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Distanz (km)</label><input type="number" step="0.1" value="${state.user.benchmarkDist || ''}" onchange="state.user.benchmarkDist=this.value; save()" placeholder="z.B. 5" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs"></div>
            <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Zeit (Pace)</label><input type="text" value="${state.user.benchmarkTime || ''}" onchange="state.user.benchmarkTime=this.value; save()" placeholder="z.B. 00:25:30" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs"></div>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mb-2">
        <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Max HR (${I.heart})</label><input type="number" value="${state.user.maxHR}" onchange="state.user.maxHR=this.value; save()" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs text-center"></div>
        <div><label class="text-[10px] font-bold opacity-60 dark:text-slate-400 block mb-1">Ruhepuls (${I.sleep})</label><input type="number" value="${state.user.restHR}" onchange="state.user.restHR=this.value; save()" class="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 text-xs text-center"></div>
    </div>
    <div class="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 text-center">
        <div class="flex-1"><div class="text-[10px] font-bold opacity-60 dark:text-slate-400">Zone 2</div><div class="text-xs font-bold text-blue-500">${zones.z2}</div></div>
        <div class="flex-1 border-l border-r border-slate-200 dark:border-slate-700"><div class="text-[10px] font-bold opacity-60 dark:text-slate-400">Zone 3</div><div class="text-xs font-bold text-orange-500">${zones.z3}</div></div>
        <div class="flex-1"><div class="text-[10px] font-bold opacity-60 dark:text-slate-400">Zone 4</div><div class="text-xs font-bold text-red-500">${zones.z4}</div></div>
    </div>
    <div class="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <label class="block text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-1 flex gap-1 items-center">${I.sparkle} Gemini API Key</label>
        <input type="password" value="${state.user.apiKey || ''}" onchange="state.user.apiKey=this.value; save()" placeholder="Dein API Key..." class="w-full p-2 text-xs border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700 focus:outline-none">
    </div>
    <div class="mb-4">
        <button type="button" id="ai-setup-btn" onclick="window.fetchSetupAIPlan()" class="w-full flex justify-center items-center gap-2 p-3 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform" ${!state.user.apiKey ? 'disabled style="opacity:0.5"' : ''}>
            ${I.brain} Training smart planen (KI)
        </button>
        <div class="text-[10px] text-center mt-1 opacity-60 dark:text-slate-400">Nutzt Woche ${state.week} Daten & aktuelles Setup</div>
    </div>`;

    const tsName = state.user.teamSport && state.user.teamSport !== 'none' ? state.user.teamSport.charAt(0).toUpperCase() + state.user.teamSport.slice(1) : 'Teamsport';
    html += `<p class="text-xs font-bold opacity-50 mb-3 mt-6 dark:text-slate-400"> ${tsName.toUpperCase()} TAGE AUSWÄHLEN</p><div class="flex gap-1.5 mb-6">`;
    if (!Array.isArray(cfg.vol)) cfg.vol = cfg.vol ? (state.user.teamSportDays || [state.user.teamSportDay || 'Dienstag']) : [];
    weekDays.forEach(d => {
        const act = cfg.vol.includes(d);
        const short = d.substring(0, 2);
        html += `<button onclick="window.toggleVol('${d}')" class="flex flex-col items-center py-2 px-1 rounded-lg border-2 flex-1 min-w-0 transition-all ${act ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 shadow-md shadow-pink-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'}"><span class="text-sm mb-0.5">${act ? I.vol : '·'}</span><span class="text-[10px] font-bold ${act ? 'text-pink-700 dark:text-pink-300' : 'opacity-50 dark:text-slate-400'}">${short}</span></button>`;
    });
    html += `</div>
    <p class="text-xs font-bold opacity-50 mb-3 mt-6 dark:text-slate-400">EFFEKTE</p>
    <div class="space-y-2 mb-4">
    <div class="flex items-center justify-between p-3 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div class="flex items-center gap-2">
            <div class="w-5 h-5">${I.sparkle}</div>
            <span class="text-xs font-bold dark:text-white">Partikeleffekte</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" ${state.user.particlesEnabled !== false ? 'checked' : ''} onchange="state.user.particlesEnabled = this.checked; save()" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-300 peer-checked:bg-indigo-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
    </div>
    <div class="flex flex-col gap-2 p-3 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div class="text-xs font-bold dark:text-white mb-2">Partikel Style</div>
        <div class="flex gap-2">
            <button onclick="state.user.particleStyle='classic'; save(); window.initParticles(); window.openSetup()" class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${state.user.particleStyle !== 'strings' ? 'bg-indigo-500 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">Klassisch</button>
            <button onclick="state.user.particleStyle='strings'; save(); window.initParticles(); window.openSetup()" class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${state.user.particleStyle === 'strings' ? 'bg-indigo-500 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">Schwarm</button>
        </div>
    </div>
    <div class="flex items-center justify-between p-3 rounded-xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div class="flex items-center gap-2">
            <div class="w-5 h-5">${I.gradient}</div>
            <span class="text-xs font-bold dark:text-white">Farbverlauf</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" ${state.user.gradientEnabled !== false ? 'checked' : ''} onchange="state.user.gradientEnabled = this.checked; save(); document.querySelector('.gradient-bg').style.display = this.checked ? '' : 'none'" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-300 peer-checked:bg-indigo-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
    </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-2 mb-6">
        <button onclick="window.exportData()" class="p-3 rounded-xl bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-2">${I.dl} Backup</button>
        <button onclick="document.getElementById('import-input').click()" class="p-3 rounded-xl bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2">${I.ul} Laden</button>
    </div>
    <div onclick="if(confirm('Alles zurücksetzen?')){localStorage.clear();location.reload()}" class="mt-2 text-center text-xs text-red-500 cursor-pointer">App Reset</div>`;
    document.getElementById('modal-title').innerText = `Setup W${state.week + 1} `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-footer').innerHTML = '';
    document.getElementById('modal-overlay').style.display = 'flex';
};

// --- OPEN DAY ---
window.openDay = (json) => {
    try {
        const day = JSON.parse(decodeURIComponent(json)); state.selDay = day;
        const log = state.logs[day.id] || {}; const run = log.run || { time: '', dist: '', bpm: '', rpe: 5 };
        document.getElementById('modal-title').innerText = day.title || 'Recovery';
        let html = `<p class="text-xs opacity-60 mb-4 dark:text-slate-400"> ${day.desc || 'Erholungstag'}</p> `;

        if (day.type === 'gym') {
            (day.exercises || []).forEach((ex, i) => {
                const k = ex.replace(/\s/g, '');
                const sets = log.exercises?.[k] || [{ w: '', r: '' }, { w: '', r: '' }, { w: '', r: '' }]; const hist = getHistory('gym', k, day.id);
                let histText = ''; if (hist) { const weights = hist.map(s => s.w || '-').join(' / '); histText = `<div class="text-xs text-blue-500 dark:text-blue-400 mb-1"> Letztes Mal: ${weights} kg</div> `; }
                const isAlt = log.altMachine && log.altMachine[k];
                html += `<div class="mb-4 pb-2 border-b dark:border-slate-800">
        <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-bold dark:text-white">${ex}</span>
            <label class="flex items-center gap-1 cursor-pointer text-xs ${isAlt ? 'text-amber-600 dark:text-amber-400' : 'opacity-40 dark:text-slate-500'}">
                <input type="checkbox" ${isAlt ? 'checked' : ''} onchange="window.toggleAltMachine('${day.id}','${k}')" class="w-3.5 h-3.5 accent-amber-500">
                    <div class="w-4 h-4">${I.alert}</div> andere Maschine
            </label>
        </div>
                    ${histText}
    <div class="flex gap-2">${sets.map((s, idx) => `<div class="flex gap-1"><input type="number" placeholder="kg" class="w-12 p-1 text-center text-xs border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" value="${s.w}" onchange="window.logGym('${day.id}','${k}',${idx},'w',this.value)"><input type="number" placeholder="rp" class="w-10 p-1 text-center text-xs border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" value="${s.r}" onchange="window.logGym('${day.id}','${k}',${idx},'r',this.value)"></div>`).join('')}</div>
                </div> `;
            });
        } else if (day.type === 'vol') {
            const rpe = log.run?.rpe || 5;
            html += `<div class="space-y-4">
                <p class="opacity-60 text-sm dark:text-slate-400 flex items-center gap-1"><span class="w-4 h-4 inline-block">${I.bolt}</span> Gib dein Belastungsempfinden an.</p>
                <div><label class="text-xs opacity-60 dark:text-slate-400">RPE (1-10): <span id="rpe-d">${rpe}</span></label><input type="range" min="1" max="10" class="w-full" value="${rpe}" oninput="document.getElementById('rpe-d').innerText=this.value; window.logRun('${day.id}','rpe',this.value)"></div>
            </div> `;
        } else if (day.type !== 'rest') {
            const hist = getHistory('run', null, day.id); let histText = '';
            if (hist) {
                const dist = parseFloat(hist.dist); const t = hist.time.split(':'); const m = parseFloat(t[0]) + (parseFloat(t[1] || 0) / 60); let pace = '-';
                if (dist > 0 && m > 0) { const pVal = m / dist; if (isFinite(pVal)) { const min = Math.floor(pVal); const sec = Math.round((pVal - min) * 60); pace = `${min}:${sec < 10 ? '0' + sec : sec} `; } }
                histText = `<div class="mb-4 text-xs text-blue-500 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded"> Letzter Lauf: ${hist.dist} km in ${hist.time} (${pace} /km)</div> `;
            }
            html += `${histText}<div class="grid grid-cols-2 gap-4 mb-4" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><label class="text-xs opacity-60 dark:text-slate-400">Zeit</label><input class="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value="${run.time}" onchange="window.logRun('${day.id}','time',this.value)" placeholder="45:00"></div><div><label class="text-xs opacity-60 dark:text-slate-400">km</label><input type="number" class="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value="${run.dist}" onchange="window.logRun('${day.id}','dist',this.value)" placeholder="5.0"></div></div><div class="mb-4"><label class="text-xs opacity-60 dark:text-slate-400">Ø BPM</label><input type="number" class="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" value="${run.bpm}" onchange="window.logRun('${day.id}','bpm',this.value)" placeholder="145"></div><div class="mb-4"><label class="text-xs opacity-60 dark:text-slate-400">RPE (1-10): <span id="rpe-d">${run.rpe}</span></label><input type="range" min="1" max="10" class="w-full" value="${run.rpe}" oninput="document.getElementById('rpe-d').innerText=this.value; window.logRun('${day.id}','rpe',this.value)"></div>`;
            if (day.subtype === 'easy' || day.type === 'bike') {
                const isBike = state.configs[state.week].bike ? state.configs[state.week].bike.includes(day.id) : false;
                html += `<button class="w-full p-2 mt-2 border border-teal-500 text-teal-500 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center justify-center gap-1" onclick = "window.toggleBike('${day.id}')"> <span class="w-4 h-4">${I.bike}</span> ${isBike ? 'Zu Laufen ändern' : 'Zu Rad ändern'}</button> `;
            }
        } else {
            const steps = log.steps || '';
            html += `<div class="space-y-4">
                <p class="opacity-60 text-sm dark:text-slate-400 flex items-center gap-1"><span class="w-4 h-4 inline-block">${I.sleep}</span> Erhol dich gut! Nutze den Tag für Regeneration.</p>
                <div>
                    <label class="text-xs font-bold opacity-60 dark:text-slate-400 block mb-1 flex items-center gap-1"><span class="w-3.5 h-3.5">${I.walk}</span> Schritte heute</label>
                    <input type="number" class="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" value="${steps}" onchange="window.logSteps('${day.id}', this.value)" placeholder="z.B. 8000">
                </div>
            </div> `;
        }
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('modal-footer').innerHTML = `<button onclick = "window.finishDay('${day.id}')" class="w-full bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"> ${I.save} Speichern & Fertig</button> `;
        document.getElementById('modal-overlay').style.display = 'flex';
    } catch (e) { console.error(e); alert('Fehler: ' + e.message); }
}

// --- RENDERER ---
window.render = function () {
    try {
        if (state.darkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
        const splashBtn = document.getElementById('splash-theme-icon'); if (splashBtn) splashBtn.innerHTML = state.darkMode ? I.sun : I.moon;
        const gradBg = document.querySelector('.gradient-bg'); if (gradBg) gradBg.style.display = state.user.gradientEnabled === false ? 'none' : '';

        const splash = document.getElementById('splash-screen');
        const ob = document.getElementById('onboarding-overlay');
        if ((splash && splash.style.display !== 'none') || (ob && ob.style.display !== 'none')) return;

        const app = document.getElementById('app');
        const phase = getPhaseInfo(state.week);
        const total = getTotalWeeks(state.user);

        let html = `
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-3 mb-6 relative overflow-hidden">
            <div class="flex justify-between items-start mb-4">
                <div><h1 class="text-xl font-bold dark:text-white leading-none mb-1">Hybrid Coach</h1><div class="text-xs opacity-60 dark:text-slate-400 leading-none">${total} Wochen Plan · ${state.user.goal}</div></div>
                <button onclick="window.toggleTheme()" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-full z-10">${state.darkMode ? I.sun : I.moon}</button>
            </div>
                ${state.view === 'plan' ? `<div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center gap-3 relative z-10"><div class="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">${I.gym}</div><div><h3 class="font-bold text-sm dark:text-white leading-tight mb-0.5">${phase.t}: Woche ${state.week + 1}</h3><p class="text-xs opacity-70 dark:text-slate-400 leading-tight">${phase.d}</p></div></div>` : ''}
            </div>
        `;

        const isMob = state.view === 'mobility';
        html += `
        <div class="flex justify-between items-center mb-6">
                <div id="tut-week-nav" class="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border dark:border-slate-800">
                    <button onclick="window.changeWeek(-1)" class="p-2">${I.left}</button>
                    <span class="text-sm font-bold w-12 text-center dark:text-white">W${state.week + 1}</span>
                    <button onclick="window.changeWeek(1)" class="p-2">${I.right}</button>
                </div>
                <div id="tut-tabs" class="flex gap-2">
                    <button id="tut-setup" onclick="window.openSetup()" class="bg-slate-900 dark:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold">Setup</button>
                    <button onclick="state.view='${isMob ? 'plan' : 'mobility'}'; window.render()" class="${isMob ? 'bg-indigo-600' : 'bg-emerald-500'} text-white px-3 py-2 rounded-lg text-xs font-bold flex gap-1 items-center shadow-md transition-colors">${isMob ? I.plan : I.yoga} ${isMob ? 'Training' : 'Mob'}</button>
                    <button onclick="state.view = (state.view === 'stats' ? 'plan' : 'stats'); window.render()" class="bg-white dark:bg-slate-900 border dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-bold shadow-sm">${state.view === 'stats' ? I.plan : I.chart}</button>
                </div>
            </div>
        `;

        if (state.view === 'mobility') {
            const totalSessions = calculateTotalMobility();
            html += `<div class="fade-in"><div class="mb-6 p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-900/40 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 flex justify-between items-center"><div><h2 class="font-bold text-lg text-emerald-800 dark:text-emerald-400 leading-tight">Mobility</h2><p class="text-xs text-emerald-600 dark:text-emerald-500 leading-tight">Woche ${state.week + 1}</p></div><div class="text-center bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm"><div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">${totalSessions}</div><div class="text-[10px] uppercase font-bold opacity-60 dark:text-slate-400">Total</div></div></div><div class="space-y-3">
                ${Array(7).fill(0).map((_, i) => {
                const key = getMobKey(state.week, i); const doneCount = state.logs[key] ? state.logs[key].length : 0; const isDone = doneCount >= 5;
                return `<div onclick="window.openMobilityDay(${state.week}, ${i})" class="flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isDone ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30' : 'bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800'}"><div class="w-12 text-xs font-bold opacity-50 uppercase text-slate-400 dark:text-slate-500 text-center">${weekDays[i].substring(0, 2).toUpperCase()}</div><div class="flex-1 ml-4"><div class="font-bold text-sm dark:text-white">Tägliche Routine</div><div class="text-xs opacity-60 dark:text-slate-400">${doneCount} / ${mobilityRoutine.length} Übungen</div></div><div class="w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}">${isDone ? I.check : I.yoga}</div></div>`;
            }).join('')}</div></div> `;
        } else if (state.view === 'plan') {
            if (state.configs[state.week] && state.configs[state.week].aiPlan) {
                html += `<div class="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-700 flex gap-2 items-center justify-between"><div>${I.brain} KI-Plan aktiv!</div> <button onclick="window.openAIChat()" class="underline">Ändern</button></div> `;
            } else if (state.user.apiKey) {
                html += `<button onclick = "window.openAIChat()" class="w-full mb-4 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex gap-2 items-center justify-center transition-colors"> ${I.brain} Plan mit KI anpassen</button> `;
            }
            const days = generatePlan(state.week);
            html += `<div class="space-y-3 fade-in"> `;
            const tsName = state.user.teamSport && state.user.teamSport !== 'none' ? state.user.teamSport.charAt(0).toUpperCase() + state.user.teamSport.slice(1) : 'Teamsport';
            days.forEach((day, i) => {
                let borderColor = '#cbd5e1'; let icon = I.rest; let t = day.type || '';
                if (t === 'gym' || t === 'Kraft') { borderColor = '#3b82f6'; icon = I.gym; }
                else if (t === 'run' || t === 'Ausdauer') { borderColor = '#f97316'; icon = I.run; }
                else if (t === 'vol' || t === 'Teamsport' || t === 'team') { borderColor = '#ec4899'; icon = I.vol; }
                else if (t === 'bike' || t === 'Rad') { borderColor = '#14b8a6'; icon = I.bike; }
                else if (t !== 'rest' && t !== '') { borderColor = '#6366f1'; icon = I.gym; }

                let dTitle = day.title;
                let dDesc = day.desc;
                const hasVolTitle = day.hasVol ? ` + ${tsName} ` : '';

                // Show actual runtime/distance if log exists and day is done
                if (day.done && (t === 'run' || t === 'bike' || t === 'Ausdauer' || t === 'Rad')) {
                    const log = state.logs[day.id];
                    if (log && log.run) {
                        const dist = parseFloat(log.run.dist) || 0;
                        const time = log.run.time || '-';
                        if (dist > 0 || time !== '-') {
                            // Extrahieren des Typs (z.B. "Easy Run" oder "Ergometer") aus dem ursprünglichen Titel
                            const baseTitleSplit = day.title.split('(')[0].trim();
                            dTitle = `${baseTitleSplit} (${dist} km)`;
                            // Ursprüngliche, geplante Distanz anhängen
                            const plannedMatch = day.title.match(/(\d+(?:\.\d+)?\s*km)/);
                            const planned = plannedMatch ? plannedMatch[1] : '';
                            dDesc = `${dist} km in ${time} ${planned ? `(Geplant: ${planned})` : ''} `;
                        }
                    }
                }

                const bg = day.done ? (state.darkMode ? 'background:rgba(22,163,74,0.15)' : 'background:#f0fdf4') : (state.darkMode ? 'background:rgba(30,41,59,0.95)' : 'background:rgba(255,255,255,0.8)');
                const dayJson = encodeURIComponent(JSON.stringify(day));

                html += `<div onclick = "window.openDay('${dayJson}')" class="flex items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-sm cursor-pointer" style = "${bg}; border-left: 4px solid ${borderColor}">
                    <div class="w-12 text-xs font-bold opacity-50 uppercase text-slate-400 dark:text-slate-500">${weekDays[i].substr(0, 2)}</div>
                    <div class="flex-1"><div class="font-bold text-sm dark:text-white">${dTitle}${hasVolTitle}</div>${day.type !== 'rest' ? `<div class="text-xs opacity-60 dark:text-slate-400">${dDesc}</div>` : ''}</div>
                    <div class="text-slate-300 dark:text-slate-600 flex gap-1 items-center">${day.done ? `<div class="bg-green-500 rounded-full p-1">${I.check}</div>` : icon}${day.hasVol && !day.done ? `<div class="w-4 h-4 ml-1 opacity-50">${I.vol}</div>` : ''}</div>
                </div> `;
            }); html += `</div> `;
        } else { html += renderStats(); }
        app.innerHTML = html;
    } catch (e) { console.error(e); document.getElementById('error-msg').style.display = 'block'; }
}

// --- STATS ---
function renderStats() {
    let gymData = [], runData = []; let totalKm = 0, totalKg = 0, totalRPE = 0, rpeCnt = 0;
    for (let w = 0; w <= state.week; w++) {
        let v = 0, d = 0;
        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const l = state.logs[`w${w}d${dayIdx}`];
            if (!l) continue;
            if (l.exercises) {
                Object.keys(l.exercises).forEach(exKey => {
                    if (l.altMachine && l.altMachine[exKey]) return;
                    l.exercises[exKey].forEach(x => v += (x.w * x.r) || 0);
                });
            }
            if (l.run) {
                const dist = parseFloat(l.run.dist) || 0;
                d += dist;
                if (l.run.rpe) { totalRPE += parseFloat(l.run.rpe); rpeCnt++; }
            }
        }
        totalKg += v; totalKm += d; gymData.push(v); runData.push(d);
    }
    const maxGym = Math.max(...gymData, 1); const maxRun = Math.max(...runData, 1);
    let html = `<div class="fade-in space-y-6"> <div class="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg border dark:border-slate-800 mb-4"><button onclick="state.statsSubView='overview';window.render()" class="flex-1 py-1 text-xs font-bold rounded ${state.statsSubView === 'overview' ? 'bg-slate-900 text-white dark:bg-blue-600' : 'opacity-60 dark:text-slate-400'}">Übersicht</button><button onclick="state.statsSubView='details';window.render()" class="flex-1 py-1 text-xs font-bold rounded ${state.statsSubView === 'details' ? 'bg-slate-900 text-white dark:bg-blue-600' : 'opacity-60 dark:text-slate-400'}">Details</button></div>`;
    if (state.statsSubView === 'overview') {
        html += `<div class="grid grid-cols-3 gap-3 mb-4"><div class="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border dark:border-slate-800 text-center"><div class="text-xs opacity-50 mb-1 dark:text-slate-400">Km</div><div class="font-bold text-lg text-orange-500">${totalKm.toFixed(1)}</div></div><div class="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border dark:border-slate-800 text-center"><div class="text-xs opacity-50 mb-1 dark:text-slate-400">Tonnen</div><div class="font-bold text-lg text-blue-500">${(totalKg / 1000).toFixed(1)}</div></div><div class="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border dark:border-slate-800 text-center"><div class="text-xs opacity-50 mb-1 dark:text-slate-400">Ø RPE</div><div class="font-bold text-lg text-purple-500">${rpeCnt ? (totalRPE / rpeCnt).toFixed(1) : '-'}</div></div></div>
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border dark:border-slate-800 mb-4"><h3 class="font-bold mb-4 flex gap-2 text-sm dark:text-white">${I.gym} Gym Volumen</h3><div class="flex items-end gap-1 h-24">${gymData.map(v => `<div class="flex-1 bg-blue-500 rounded-t" style="height:${(v / maxGym) * 100}%; min-height:4px;"></div>`).join('')}</div></div>
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border dark:border-slate-800"><h3 class="font-bold mb-4 flex gap-2 text-sm dark:text-white">${I.run} Lauf Distanz</h3><div class="flex items-end gap-1 h-24">${runData.map(v => `<div class="flex-1 bg-orange-500 rounded-t" style="height:${(v / maxRun) * 100}%; min-height:4px;"></div>`).join('')}</div></div>`;
    } else {
        const gymSet = new Set(); Object.values(splits).forEach(s => s.ex.forEach(e => gymSet.add(e))); const gymList = Array.from(gymSet).sort();
        html += `<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border dark:border-slate-800"><h3 class="font-bold mb-2 text-sm dark:text-white">Übung wählen</h3><select onchange="state.selectedExercise=this.value;window.render()" class="w-full p-2 mb-4 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white"><option value="" disabled ${!state.selectedExercise ? 'selected' : ''}>Wählen...</option><option value="Long Run" ${state.selectedExercise === 'Long Run' ? 'selected' : ''}>Long Run (Pace)</option><option value="Easy Run" ${state.selectedExercise === 'Easy Run' ? 'selected' : ''}>Easy Run (Pace)</option><optgroup label="Gym">${gymList.map(e => `<option value="${e}" ${state.selectedExercise === e ? 'selected' : ''}>${e}</option>`).join('')}</optgroup></select>`;
        if (state.selectedExercise) {
            let hist = [], maxVal = 0;
            const maxWeek = state.week + 1;
            for (let w = 0; w < maxWeek; w++) {
                const weekPlan = generatePlan(w); let best = 0;
                for (let d = 0; d < 7; d++) {
                    const l = state.logs[`w${w}d${d}`]; const dayPlan = weekPlan[d]; if (!l) continue;
                    const k = state.selectedExercise.replace(/\s/g, '');
                    // Skip alt machine
                    if (l.altMachine && l.altMachine[k]) continue;
                    if (l.exercises && l.exercises[k]) { const vol = l.exercises[k].reduce((sum, s) => sum + ((parseFloat(s.w) || 0) * (parseFloat(s.r) || 0)), 0); if (vol > best) best = vol; }
                    if (l.run && l.run.dist && l.run.time) {
                        const dist = parseFloat(l.run.dist); const t = l.run.time.split(':'); const m = parseFloat(t[0]) + (parseFloat(t[1] || 0) / 60);
                        if (dist > 0 && m > 0) {
                            const p = m / dist;
                            if (state.selectedExercise === 'Long Run' && dayPlan && dayPlan.subtype === 'long') best = p;
                            else if (state.selectedExercise === 'Easy Run' && dayPlan && (dayPlan.subtype === 'easy' || dayPlan.type === 'run' && dayPlan.subtype !== 'long')) best = p;
                        }
                    }
                }
                if (best > maxVal) maxVal = best; hist.push({ w: w + 1, val: best });
            }
            const formatVal = (val, type) => { if (type.includes('Run')) { const min = Math.floor(val); const sec = Math.round((val - min) * 60); return `${min}:${sec < 10 ? '0' + sec : sec} `; } return val >= 1000 ? (val / 1000).toFixed(1) + 't' : val + 'kg'; }
            if (maxVal > 0) {
                const h = 100, w = 280;
                const validHist = hist.filter(d => d.val > 0);
                const points = validHist.map(d => {
                    const origIdx = hist.indexOf(d);
                    const x = (origIdx / Math.max(hist.length - 1, 1)) * w;
                    const y = h - (d.val / maxVal) * h;
                    return `${x},${y} `;
                }).join(' ');
                html += `<div class="mt-4"><svg width="100%" height="130" viewBox="-10 0 ${w + 20} ${h + 30}" class="overflow-visible" ontouchstart=""><polyline points="${points}" class="fill-none stroke-blue-500 dark:stroke-blue-400 stroke-2" />${hist.map((d, i) => {
                    if (!d.val) return ''; const x = (i / Math.max(hist.length - 1, 1)) * w; const y = h - (d.val / maxVal) * h; const lbl = formatVal(d.val, state.selectedExercise);
                    return `<g class="chart-group" style="cursor:pointer" onclick="this.querySelector('.tooltip').classList.toggle('opacity-0');this.querySelector('.tooltip').classList.toggle('opacity-100')"><circle cx="${x}" cy="${y}" r="18" fill="transparent" /><circle cx="${x}" cy="${y}" r="4" class="dot fill-blue-500 dark:fill-blue-400 transition-all" /><text x="${x}" y="${h + 20}" font-size="10" text-anchor="middle" fill="#94a3b8">W${d.w}</text><g class="tooltip opacity-0 transition-opacity duration-200 pointer-events-none"><rect x="${x - 22}" y="${y - 35}" width="44" height="25" rx="4" fill="#1e293b" /><text x="${x}" y="${y - 19}" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${lbl}</text><path d="M${x - 4},${y - 10} L${x + 4},${y - 10} L${x},${y - 6} Z" fill="#1e293b" /></g></g>`;
                }).join('')}</svg><div class="text-center text-xs opacity-50 mt-2 dark:text-slate-400">Verlauf ${maxWeek} Wochen</div></div> `;
            } else { html += `<div class="text-center py-10 opacity-40 text-sm dark:text-slate-400"> Keine Daten verfügbar</div> `; }
        }
        html += `</div> `;
    } html += `</div> `; return html;
}

// --- INIT ---
window.onload = function () {
    initParticles(); animateParticles(0); initGyro();
    if (!state.user.initialized) { document.getElementById('splash-screen').style.display = 'flex'; window.render(); }
    else if (!state.user.tutorialDone) { showTutorial(); }
    else { setTimeout(window.render, 10); }
};
