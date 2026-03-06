// --- PLAN GENERATION, PHASES, HISTORY ---

function getPhaseInfo(w) {
    const total = getTotalWeeks(state.user);
    const pct = w / total;
    if (pct < 0.35) return { t: "Base Phase", d: "Grundlagenausdauer & Gewöhnung" };
    if (pct < 0.7) return { t: "Build Phase", d: "Steigerung von Volumen & Intensität" };
    if (pct < 0.85) return { t: "Peak Phase", d: "Maximale Belastung vor dem Rennen" };
    if (pct < 0.95) return { t: "Taper Phase", d: "Erholung & Speicher füllen" };
    return { t: "Race Week", d: "Minimale Belastung. Race Day!" };
}

function getAdaptFactor(w) {
    if (w === 0) return 1.0;
    let sum = 0, cnt = 0; const prefix = `w${w - 1}`;
    for (let k in state.logs) {
        if (k.startsWith(prefix) && state.logs[k].run && state.logs[k].run.rpe) {
            const rpe = parseFloat(state.logs[k].run.rpe); if (!isNaN(rpe)) { sum += rpe; cnt++; }
        }
    }
    if (cnt === 0) return 1.0;
    const avg = sum / cnt; return avg > 8 ? 0.9 : avg < 4 ? 1.1 : 1.0;
}

function generatePlan(wIdx) {
    // CHECK FOR AI OVERRIDE
    if (state.configs[wIdx] && state.configs[wIdx].aiPlan) {
        return state.configs[wIdx].aiPlan.map(d => ({ ...d, done: state.logs[d.id]?.done }));
    }

    const total = getTotalWeeks(state.user);
    const cfg = state.configs[wIdx] || { uni: [], vol: true, bike: [] };
    const days = Array(7).fill(null);
    const factor = getAdaptFactor(wIdx);
    const isLastWeek = wIdx === total - 1;
    const isTaper = wIdx >= total - 2;

    // Dynamische Distanzen basierend auf Wochen-Position
    const pct = wIdx / total;
    let lrDist, easyDist;
    if (state.user.goal === 'Marathon') {
        lrDist = isLastWeek ? 42.2 : (7 + pct * 28) * factor;
        easyDist = (5 + pct * 5) * factor;
    } else if (state.user.goal === '10k Lauf') {
        lrDist = isLastWeek ? 10 : (4 + pct * 8) * factor;
        easyDist = (3 + pct * 4) * factor;
    } else if (state.user.goal === 'Allgemeine Fitness') {
        lrDist = (5 + pct * 5) * factor;
        easyDist = (3 + pct * 3) * factor;
    } else { // Halbmarathon default
        lrDist = isLastWeek ? 21.1 : (7 + pct * 14) * factor;
        easyDist = (5 + pct * 4) * factor;
    }

    const isRecovery = (wIdx % 4 === 3);

    // Recovery Week / Cutback Week (reduce volume)
    if (isRecovery && !isLastWeek && !isTaper) {
        lrDist *= 0.75; // 25% reduction for long runs
        easyDist *= 0.80; // 20% reduction for easy runs
    }

    // Tapering logic
    if (isTaper && !isLastWeek) { lrDist *= 0.6; easyDist *= 0.7; }

    lrDist = parseFloat(lrDist.toFixed(1));
    easyDist = parseFloat(easyDist.toFixed(1));

    // Multi-Day Teamsport Support
    let volDays = [];
    if (cfg.vol) {
        if (Array.isArray(cfg.vol)) volDays = cfg.vol.map(d => weekDays.indexOf(d)).filter(i => i !== -1);
        else if (cfg.vol === true) volDays = [weekDays.indexOf(state.user.teamSportDay || 'Dienstag')].filter(i => i !== -1);
    }

    // Fallback falls leer aber eigentlich aktiv war
    if (cfg.vol === true && volDays.length === 0) volDays = [1];

    const tsName = state.user.teamSport && state.user.teamSport !== 'none' ? state.user.teamSport.charAt(0).toUpperCase() + state.user.teamSport.slice(1) : "Teamsport";

    volDays.forEach(tsIdx => {
        days[tsIdx] = { type: 'vol', title: tsName, desc: "HIIT & Teamsport", id: `w${wIdx}d${tsIdx}` };
    });

    const zones = window.getHRZones(state.user);
    const z2 = zones.z2;
    const z3 = zones.z3;
    const lrTitle = isLastWeek && state.user.goal !== 'Allgemeine Fitness' ? `${state.user.goal}` : `Long Run (${lrDist} km)`;

    let lrDesc = `Zone 2: ${z2}`;
    if (isRecovery && !isLastWeek) {
        lrDesc = `Cutback Week: Erholung! (Z2: ${z2})`;
    } else if (isLastWeek && state.user.goal !== 'Allgemeine Fitness') {
        lrDesc = "Race Day! Viel Erfolg!";
    }

    const lr = { type: 'run', subtype: 'long', title: lrTitle, desc: lrDesc };
    if (!days[6]) days[6] = { ...lr, id: `w${wIdx}d6` }; else days[5] = { ...lr, id: `w${wIdx}d5` };

    const availGym = cfg.uni ? cfg.uni.filter(d => days[weekDays.indexOf(d)] === null) : [];
    const gymCount = availGym.length >= 3 ? 3 : 2; let placed = 0;
    availGym.forEach(d => {
        if (placed >= gymCount) return;
        const idx = weekDays.indexOf(d);
        let wo = splits.Full;
        if (gymCount === 2) wo = (placed === 0) ? splits.Upper : splits.Lower;
        if (gymCount === 3) wo = [splits.Push, splits.Pull, splits.Legs][placed];
        if (isTaper) wo = { ...splits.Full, t: "Gym: Mobility & Core", d: "Tapering", ex: ["Planks", "Stretching", "Leichte Kniebeugen", "Facepulls"] };

        const baseExercises = wo.ex || [];
        const dayId = `w${wIdx}d${idx}`;
        days[idx] = { type: 'gym', ...wo, id: dayId, exercises: baseExercises, baseExercises: baseExercises };
        placed++;
    });

    let needed = (cfg.vol ? 2 : 3) - 1; if (isLastWeek) needed = 1;
    const score = (i) => {
        if (days[i]) return -99;
        let s = 10;
        if (days[i - 1]?.type?.match(/run|vol/)) s -= 5;
        if (days[i + 1]?.type?.match(/run|vol/)) s -= 5;
        if (days[i - 1]?.type === 'gym' && days[i - 1].t?.includes('Beine')) s -= 3;
        return s;
    };

    while (needed > 0) {
        let best = -1, max = -99;
        for (let i = 0; i < 7; i++) { const s = score(i); if (s > max) { max = s; best = i; } }
        if (best === -1) break;
        let runTitle = `Easy Run (${easyDist} km)`; let runDesc = `Locker (Zone 2: ${z2})`;
        if (pct > 0.35 && !isTaper && needed === 1) runDesc = `Pace (Zone 3: ${z3}) inkl. 4x 100m Steigerung`;
        let wo = { type: 'run', subtype: 'easy', title: runTitle, desc: runDesc };
        if (cfg.bike && cfg.bike.includes(`w${wIdx}d${best}`)) wo = { type: 'bike', title: "Ergometer 45min", desc: "Active Recovery (Z1)" };

        // Merge if it's placed on a team sport day
        if (days[best] && days[best].type === 'vol') {
            wo.hasVol = true;
        }
        days[best] = { ...wo, id: `w${wIdx}d${best}` };
        needed--;
    }

    // Merge Gym and Teamsport if they overlap
    for (let i = 0; i < 7; i++) {
        if (days[i] && volDays.includes(i) && days[i].type !== 'vol') {
            days[i].hasVol = true;
        }
    }

    for (let i = 0; i < 7; i++) if (!days[i]) days[i] = { type: 'rest', title: "Recovery", desc: "Erholungstag", id: `w${wIdx}d${i}` };
    return days.map(d => ({ ...d, done: state.logs[d.id]?.done, title: d.title || d.t, desc: d.desc || d.d, exercises: d.exercises || d.ex, baseExercises: d.baseExercises }));
}

function getHistory(type, name, currentId) {
    try {
        const wMatch = currentId.match(/w(\d+)/); const dMatch = currentId.match(/d(\d+)/);
        if (!wMatch || !dMatch) return null;
        const currW = parseInt(wMatch[1]); const currD = parseInt(dMatch[1]);
        for (let w = currW; w >= 0; w--) {
            for (let d = 6; d >= 0; d--) {
                if (w === currW && d >= currD) continue;
                const id = `w${w}d${d}`; const log = state.logs[id];
                if (!log) continue;
                if (type === 'gym' && log.exercises && log.exercises[name]) {
                    const sets = log.exercises[name]; if (sets.some(s => s.w)) return sets;
                }
                if (type === 'run' && log.run && log.run.dist && log.run.time) return log.run;
            }
        }
    } catch (e) { }
    return null;
}
