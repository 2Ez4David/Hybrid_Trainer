// --- ACTIONS: Logging, Toggles, Export/Import ---

window.logGym = (id, k, idx, f, v) => {
    if (!state.logs[id]) state.logs[id] = { exercises: {} }; if (!state.logs[id].exercises) state.logs[id].exercises = {};
    if (!state.logs[id].exercises[k]) state.logs[id].exercises[k] = [{ w: '', r: '' }, { w: '', r: '' }, { w: '', r: '' }]; state.logs[id].exercises[k][idx][f] = v; save();
};

window.logRun = (id, f, v) => { if (!state.logs[id]) state.logs[id] = { run: {} }; if (!state.logs[id].run) state.logs[id].run = {}; state.logs[id].run[f] = v; save(); };
window.logSteps = (id, v) => { if (!state.logs[id]) state.logs[id] = {}; state.logs[id].steps = v; save(); };
window.finishDay = (id) => { if (!state.logs[id]) state.logs[id] = {}; state.logs[id].done = true; save(); window.closeModal(); };

window.toggleAltMachine = (dayId, k) => {
    if (!state.logs[dayId]) state.logs[dayId] = {};
    if (!state.logs[dayId].altMachine) state.logs[dayId].altMachine = {};
    state.logs[dayId].altMachine[k] = !state.logs[dayId].altMachine[k];
    save();
    // Re-open the day
    const updatedPlan = generatePlan(state.week).find(d => d.id === dayId);
    if (updatedPlan) window.openDay(encodeURIComponent(JSON.stringify(updatedPlan)));
};

window.toggleUni = (d) => {
    if (!state.configs[state.week].uni) state.configs[state.week].uni = [];
    const doneDays = [];
    for (let i = 0; i < 7; i++) {
        const dayId = `w${state.week}d${i}`;
        if (state.logs[dayId] && state.logs[dayId].done) doneDays.push(weekDays[i]);
    }
    if (doneDays.length > 0) {
        if (!confirm(`Achtung: Du hast diese Woche bereits Trainingstage abgeschlossen (${doneDays.join(', ')}). Trotzdem ändern?`)) return;
    }
    const list = state.configs[state.week].uni;
    if (list.includes(d)) state.configs[state.week].uni = list.filter(x => x !== d); else state.configs[state.week].uni.push(d);
    state.configs[state.week].aiPlan = null;
    save(); window.openSetup();
};

window.toggleVol = (d) => {
    const doneDays = [];
    for (let i = 0; i < 7; i++) {
        const dayId = `w${state.week}d${i}`;
        if (state.logs[dayId] && state.logs[dayId].done) doneDays.push(weekDays[i]);
    }
    if (doneDays.length > 0) {
        if (!confirm(`Achtung: Du hast bereits Trainingstage abgeschlossen (${doneDays.join(', ')}). Trotzdem ändern?`)) return;
    }
    if (!Array.isArray(state.configs[state.week].vol)) {
        // If it's not an array, initialize it. If it had a single value, convert it to an array.
        state.configs[state.week].vol = state.configs[state.week].vol ? [state.configs[state.week].vol] : [];
    }
    const list = state.configs[state.week].vol;
    if (list.includes(d)) state.configs[state.week].vol = list.filter(x => x !== d); else state.configs[state.week].vol.push(d);
    state.configs[state.week].aiPlan = null;
    save(); window.openSetup();
};

window.toggleBike = (id) => {
    if (!state.configs[state.week].bike) state.configs[state.week].bike = [];
    const list = state.configs[state.week].bike;
    if (list.includes(id)) state.configs[state.week].bike = list.filter(x => x !== id); else state.configs[state.week].bike.push(id);
    save(); window.closeModal(); window.render();
};

window.changeWeek = (d) => {
    const total = getTotalWeeks(state.user);
    const newWeek = state.week + d;
    if (newWeek >= total) {
        document.getElementById('modal-title').innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-6 h-6">' + I.trophy + '</span> Ziel erreicht!</span>';
        document.getElementById('modal-body').innerHTML = `
            <div class="text-center py-6">
                <div class="w-12 h-12 mx-auto mb-4">${I.party}</div>
                <h3 class="font-bold text-lg dark:text-white mb-2">Du bist am Ende deines Plans!</h3>
                <p class="text-sm opacity-60 dark:text-slate-400 mb-6">Setze ein neues Ziel oder Datum im Setup, um weiterzutrainieren.</p>
                <button onclick="window.openSetup(); window.closeModal();" class="w-full p-3 bg-blue-600 text-white rounded-xl font-bold">Neues Ziel setzen</button>
            </div>
        `;
        document.getElementById('modal-footer').innerHTML = '';
        document.getElementById('modal-overlay').style.display = 'flex';
        return;
    }
    state.week = Math.max(0, newWeek);
    window.render();
};

window.toggleTheme = () => { state.darkMode = !state.darkMode; save('THEME', state.darkMode); window.render(); }
window.closeModal = () => { document.getElementById('modal-overlay').style.display = 'none'; }

window.exportData = () => {
    const data = { conf: state.configs, logs: state.logs, user: state.user, theme: state.darkMode };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hybrid_coach_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
};

window.importData = (input) => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.conf && data.logs) {
                if (confirm('Daten überschreiben?')) {
                    localStorage.setItem(STORE.CONF, JSON.stringify(data.conf));
                    localStorage.setItem(STORE.LOGS, JSON.stringify(data.logs));
                    const importedUser = data.user || { maxHR: 190 };
                    if (!importedUser.apiKey && state.user.apiKey) importedUser.apiKey = state.user.apiKey;
                    importedUser.initialized = true;

                    // Show Date Picker Modal
                    document.getElementById('modal-title').innerText = 'Dein Backup Setup';
                    const sDate = importedUser.startDate || new Date().toISOString().split('T')[0];
                    const gDate = importedUser.goalDate || '';
                    const uGoal = importedUser.goal || '';
                    document.getElementById('modal-body').innerHTML = `
                        <p class="text-xs opacity-60 mb-4 dark:text-slate-400">Damit dein Plan in der richtigen Woche startet, überprüfe bitte dein Ziel und die Daten.</p>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold opacity-60 dark:text-slate-400 block mb-1">Startdatum deines Plans</label>
                                <input type="date" id="import-start-date" value="${sDate}" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="text-xs font-bold opacity-60 dark:text-slate-400 block mb-1">Zieldatum (Optional, Race Day)</label>
                                <input type="date" id="import-goal-date" value="${gDate}" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="text-xs font-bold opacity-60 dark:text-slate-400 block mb-1">Dein Ziel</label>
                                <select id="import-goal" class="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none">
                                    <option value="Halbmarathon" ${uGoal === 'Halbmarathon' ? 'selected' : ''}>Halbmarathon</option>
                                    <option value="10k Lauf" ${uGoal === '10k Lauf' ? 'selected' : ''}>10k Lauf</option>
                                    <option value="Marathon" ${uGoal === 'Marathon' ? 'selected' : ''}>Marathon</option>
                                    <option value="Allgemeine Fitness" ${uGoal === 'Allgemeine Fitness' ? 'selected' : ''}>Allgemeine Fitness (Hybrid)</option>
                                </select>
                            </div>
                        </div>
                    `;
                    document.getElementById('modal-footer').innerHTML = `<button onclick="window.finishImport('${encodeURIComponent(JSON.stringify(importedUser))}', ${data.theme || false})" class="w-full bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-xl font-bold text-sm">Jetzt importieren laden</button>`;
                    document.getElementById('modal-overlay').style.display = 'flex';
                }
            } else alert('Ungültige Datei.');
        } catch (err) { alert('Fehler beim Lesen.'); }
    }; reader.readAsText(file);
};

window.finishImport = (userStr, themeStr) => {
    try {
        const importedUser = JSON.parse(decodeURIComponent(userStr));
        const sDate = document.getElementById('import-start-date').value;
        const gDate = document.getElementById('import-goal-date').value;
        const goalVal = document.getElementById('import-goal').value;

        importedUser.startDate = sDate;
        importedUser.goalDate = gDate;
        if (goalVal) importedUser.goal = goalVal;

        localStorage.setItem(STORE.USER, JSON.stringify(importedUser));
        localStorage.setItem(STORE.THEME, JSON.stringify(themeStr));
        alert('Import erfolgreich!');
        location.reload();
    } catch (e) {
        alert('Fehler beim Speichern der Daten.');
    }
};
