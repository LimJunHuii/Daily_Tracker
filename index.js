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

// 1. Core initialization
function init() {
    console.log("FitnessOS Initializing...");
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('fOS_lastDate');
    
    if (lastVisit && lastVisit !== today) {
        archiveDay(lastVisit);
        localStorage.removeItem('fOS_habits');
        localStorage.removeItem('fOS_water');
    }
    localStorage.setItem('fOS_lastDate', today);

    const dateLabel = document.getElementById('current-date');
    if (dateLabel) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateLabel.innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
    }

    const savedHabits = JSON.parse(localStorage.getItem('fOS_habits')) || {};
    waterBottles = parseInt(localStorage.getItem('fOS_water')) || 0;
    
    renderHabits(savedHabits);
    refresh();
}

// 2. Navigation Logic (Fixes your console error)
function switchTab(tabName, event) {
    console.log("Switching to tab:", tabName);
    // Hide all views
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    
    // Show target view
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';

    // Update Tab Bar UI
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else if (event && event.target) {
        event.target.closest('.tab-item').classList.add('active');
    }

    if (tabName === 'trends') updateTrends();
}

// 3. UI Updates
function renderHabits(saved) {
    const list = document.getElementById('habit-list');
    if (!list) return;
    list.innerHTML = habits.map((h, i) => `
        <div class="habit-item">
            <input type="checkbox" id="h-${i}" ${saved[i] ? 'checked' : ''} onchange="refresh()">
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

    // Update Progress Circle
    const circle = document.getElementById('progress-circle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        if (percent < 35) circle.style.stroke = "#FF9500";
        else if (percent < 100) circle.style.stroke = "#007AFF";
        else circle.style.stroke = "#34C759";
    }

    // Update Text Elements
    const percentEl = document.getElementById('progress-percent');
    const waterCountEl = document.getElementById('water-count');
    const waterMlEl = document.getElementById('water-ml');

    if (percentEl) percentEl.innerText = percent;
    if (waterCountEl) waterCountEl.innerText = waterBottles;
    if (waterMlEl) waterMlEl.innerText = `${waterBottles * 900}/3600ml`;
}

// 4. Persistence & Trends
function archiveDay(dateString) {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    const score = document.getElementById('progress-percent')?.innerText || 0;
    history.push({ date: dateString, score: parseInt(score) });
    localStorage.setItem('fOS_history', JSON.stringify(history));
}

function updateTrends() {
    const history = JSON.parse(localStorage.getItem('fOS_history')) || [];
    const streakEl = document.getElementById('stat-streak');
    const avgEl = document.getElementById('stat-avg');
    
    if (history.length > 0) {
        const totalScore = history.reduce((sum, item) => sum + item.score, 0);
        if (streakEl) streakEl.innerText = history.length;
        if (avgEl) avgEl.innerText = Math.round(totalScore / history.length) + "%";
    }
}

// Start the app
window.onload = init;