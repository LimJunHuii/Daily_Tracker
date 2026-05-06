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

function init() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('fOS_lastDate');
    
    // Auto-reset logic
    if (lastVisit && lastVisit !== today) {
        archiveDay(lastVisit);
        localStorage.removeItem('fOS_habits');
        localStorage.removeItem('fOS_water');
    }
    localStorage.setItem('fOS_lastDate', today);

    // Set Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();

    // Load Data
    const savedHabits = JSON.parse(localStorage.getItem('fOS_habits')) || {};
    waterBottles = parseInt(localStorage.getItem('fOS_water')) || 0;
    
    renderHabits(savedHabits);
    refresh();
}

function renderHabits(savedHabits) {
    const list = document.getElementById('habit-list');
    if(!list) return;
    list.innerHTML = habits.map((h, i) => `
        <div class="habit-item">
            <input type="checkbox" id="h-${i}" ${savedHabits[i] ? 'checked' : ''} onchange="refresh()">
            <div style="margin-left:15px">
                <div style="font-weight:600">${h.name}</div>
                <div style="font-size:12px; color:#8E8E93">${h.desc}</div>
            </div>
        </div>`).join('');
}

function updateWater(val) {
    waterBottles = Math.max(0, waterBottles + val);
    refresh();
}

// THIS WAS MISSING IN YOUR ERRORS:
function switchTab(tabName, event) {
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    const targetView = document.getElementById('view-' + tabName);
    if(targetView) targetView.style.display = 'block';
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');
    
    if(tabName === 'trends') updateTrends();
}

function refresh() {
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
    if(circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        // Color shifts
        if (percent < 35) circle.style.stroke = "#FF9500";
        else if (percent < 100) circle.style.stroke = "#007AFF";
        else circle.style.stroke = "#34C759";
    }

    document.getElementById('progress-percent').innerText = percent;
    document.getElementById('water-count').innerText = waterBottles;
    document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
}

function archiveDay(dateString) {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    const currentScore = document.getElementById('progress-percent').innerText;
    history.push({ date: dateString, score: parseInt(currentScore) });
    localStorage.setItem('fOS_history', JSON.stringify(history));
}

function updateTrends() {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    const streakEl = document.getElementById('stat-streak');
    const avgEl = document.getElementById('stat-avg');
    
    if(history.length > 0) {
        const totalScore = history.reduce((sum, item) => sum + item.score, 0);
        if(streakEl) streakEl.innerText = history.length;
        if(avgEl) avgEl.innerText = Math.round(totalScore / history.length) + "%";
    }
}

init();