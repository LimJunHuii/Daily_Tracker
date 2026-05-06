// GLOBAL UI FUNCTIONS
window.switchTab = function(tabName, event) {
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (event) {
        const item = event.currentTarget || event.target.closest('.tab-item');
        if (item) item.classList.add('active');
    }
    if (tabName === 'trends') window.updateTrends();
};

window.updateWater = function(val) {
    waterBottles = Math.max(0, waterBottles + val);
    refreshUI();
};

window.resetDay = function() {
    if(confirm("Clear today's progress? This won't affect your Trends history.")) {
        localStorage.removeItem('fOS_habits');
        localStorage.removeItem('fOS_water');
        location.reload();
    }
};

window.clearHistory = function() {
    if(confirm("PERMANENTLY delete all trend history? This cannot be undone.")) {
        localStorage.clear();
        location.reload();
    }
};

// APP LOGIC
const habits = [
    { name: "Clean Eating", desc: "No sugar. Finish by 9 PM." },
    { name: "Protein Power", desc: "Palm-sized portion per meal." },
    { name: "8k-10k Steps", desc: "Keep moving throughout day." },
    { name: "Strength Training", desc: "Squats, Pushups, Rows." },
    { name: "HIIT Session", desc: "10-15 mins high intensity." },
    { name: "Post-Meal Walk", desc: "10 mins after eating." },
    { name: "Quality Sleep", desc: "7-8h. Bed before 11 PM." }
];

let waterBottles = 0;

function initApp() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('fOS_lastDate');
    
    // Auto-archive and reset if it's a new day
    if (lastVisit && lastVisit !== today) {
        archiveDay(lastVisit);
        localStorage.removeItem('fOS_habits');
        localStorage.removeItem('fOS_water');
    }
    localStorage.setItem('fOS_lastDate', today);

    const dateLabel = document.getElementById('current-date');
    if (dateLabel) {
        dateLabel.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
    }

    const savedHabits = JSON.parse(localStorage.getItem('fOS_habits')) || {};
    waterBottles = parseInt(localStorage.getItem('fOS_water')) || 0;

    const list = document.getElementById('habit-list');
    if (list) {
        list.innerHTML = habits.map((h, i) => `
            <div class="habit-item">
                <input type="checkbox" id="h-${i}" ${savedHabits[i] ? 'checked' : ''} onchange="window.refreshUI()">
                <div style="margin-left:15px">
                    <div style="font-weight:600">${h.name}</div>
                    <div style="font-size:12px; color:#8E8E93">${h.desc}</div>
                </div>
            </div>`).join('');
    }
    refreshUI();
}

function refreshUI() {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    let count = 0;
    checks.forEach((c, i) => {
        state[i] = c.checked;
        if(c.checked) count++;
    });

    localStorage.setItem('fOS_habits', JSON.stringify(state));
    localStorage.setItem('fOS_water', waterBottles);

    const total = habits.length + 4; 
    const score = count + Math.min(waterBottles, 4);
    const percent = Math.round((score / total) * 100);

    const circle = document.getElementById('progress-circle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        circle.style.stroke = percent < 35 ? "#FF9500" : (percent < 100 ? "#007AFF" : "#34C759");
    }

    document.getElementById('progress-percent').innerText = percent;
    document.getElementById('water-count').innerText = waterBottles;
    document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
}

// TRENDS LOGIC
function archiveDay(dateStr) {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    const score = document.getElementById('progress-percent').innerText;
    history.push({ date: dateStr, score: parseInt(score) });
    localStorage.setItem('fOS_history', JSON.stringify(history));
}

window.updateTrends = function() {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    if (document.getElementById('stat-streak')) document.getElementById('stat-streak').innerText = history.length;
    
    if (history.length > 0) {
        const avg = Math.round(history.reduce((a, b) => a + b.score, 0) / history.length);
        if (document.getElementById('stat-avg')) document.getElementById('stat-avg').innerText = avg + "%";
    }
};

window.refreshUI = refreshUI;
window.onload = initApp;