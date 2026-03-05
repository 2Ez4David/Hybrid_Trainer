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
        document.getElementById('modal-title').innerText = '🏆 Ziel erreicht!';
        document.getElementById('modal-body').innerHTML = `
            <div class="text-center py-6">
                <div class="text-5xl mb-4">🎉</div>
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
                    localStorage.setItem(STORE.USER, JSON.stringify(importedUser));
                    localStorage.setItem(STORE.THEME, JSON.stringify(data.theme || false));
                    alert('Import erfolgreich!'); location.reload();
                }
            } else alert('Ungültige Datei.');
        } catch (err) { alert('Fehler beim Lesen.'); }
    }; reader.readAsText(file);
};
