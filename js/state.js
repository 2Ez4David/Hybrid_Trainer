// --- CONFIG, STATE & STORAGE ---
const STORE = { CONF: 'h50_conf', LOGS: 'h50_logs', USER: 'h50_user', THEME: 'h50_dark' };

(function migrate() {
    if (!localStorage.getItem(STORE.CONF) && (localStorage.getItem('h49_conf') || localStorage.getItem('h47_conf'))) {
        localStorage.setItem(STORE.CONF, localStorage.getItem('h49_conf') || localStorage.getItem('h48_conf') || localStorage.getItem('h47_conf'));
        localStorage.setItem(STORE.LOGS, localStorage.getItem('h49_logs') || localStorage.getItem('h48_logs') || localStorage.getItem('h47_logs'));
        localStorage.setItem(STORE.USER, localStorage.getItem('h49_user') || localStorage.getItem('h48_user') || localStorage.getItem('h47_user'));
        localStorage.setItem(STORE.THEME, localStorage.getItem('h49_dark') || localStorage.getItem('h48_dark') || localStorage.getItem('h47_dark'));
    }
})();

function getSafe(key, def) { try { return JSON.parse(localStorage.getItem(key)) || def; } catch (e) { return def; } }

// --- DYNAMIC WEEKS ---
function getTotalWeeks(user) {
    if (!user) user = getSafe(STORE.USER, {});
    // If goal date is set, calculate weeks from now
    if (user.goalDate) {
        const now = new Date();
        const goal = new Date(user.goalDate);
        const diffMs = goal - now;
        const weeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
        return Math.max(4, Math.min(30, weeks));
    }
    // Default based on goal type
    const goalDefaults = {
        'Halbmarathon': 14,
        '10k Lauf': 10,
        'Marathon': 18,
        'Allgemeine Fitness': 12
    };
    return goalDefaults[user.goal] || 12;
}

function buildDefaultConfigs(count) {
    return Array(count).fill(null).map(() => ({ uni: ['Montag', 'Donnerstag'], vol: true, bike: [], aiPlan: null }));
}

// --- STATE ---
const totalWeeks = getTotalWeeks();
const defaultConfigs = buildDefaultConfigs(totalWeeks);

let state = {
    week: 0, view: 'plan', statsSubView: 'overview', selectedExercise: null, selDay: null,
    configs: getSafe(STORE.CONF, defaultConfigs),
    logs: getSafe(STORE.LOGS, {}),
    user: getSafe(STORE.USER, { initialized: false, maxHR: 190, fitness: 'Beginner', goal: 'Halbmarathon', goalDate: '', apiKey: '', tutorialDone: false }),
    darkMode: getSafe(STORE.THEME, false)
};

// Repair / extend state if needed
(function repairState() {
    const needed = getTotalWeeks(state.user);
    if (!Array.isArray(state.configs)) state.configs = buildDefaultConfigs(needed);
    // Extend if plan grew
    while (state.configs.length < needed) {
        state.configs.push({ uni: ['Montag', 'Donnerstag'], vol: true, bike: [], aiPlan: null });
    }
    for (let i = 0; i < state.configs.length; i++) {
        if (!state.configs[i] || typeof state.configs[i] !== 'object') state.configs[i] = { uni: ['Montag', 'Donnerstag'], vol: true, bike: [], aiPlan: null };
        if (!Array.isArray(state.configs[i].uni)) state.configs[i].uni = [];
        if (!Array.isArray(state.configs[i].bike)) state.configs[i].bike = [];
    }
})();

// --- SAVE ---
function save(key, val) {
    if (key) localStorage.setItem(STORE[key], JSON.stringify(val));
    else {
        localStorage.setItem(STORE.CONF, JSON.stringify(state.configs));
        localStorage.setItem(STORE.LOGS, JSON.stringify(state.logs));
        localStorage.setItem(STORE.USER, JSON.stringify(state.user));
        localStorage.setItem(STORE.THEME, JSON.stringify(state.darkMode));
    }
    window.render();
}
