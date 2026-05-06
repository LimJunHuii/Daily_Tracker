// Ensure functions are available globally before anything else
window.switchTab = function(tabName, event) {
    console.log("Navigating to:", tabName);
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (event) {
        const item = event.currentTarget || event.target.closest('.tab-item');
        if (item) item.classList.add('active');
    }
};

window.updateWater = function(val) {
    waterBottles = Math.max(0, waterBottles + val);
    refresh();
};

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
    
    if (lastVisit && lastVisit !== today) {
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
    
    renderHabits(savedHabits);
    refresh();
}

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
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        circle.style.stroke = percent < 35 ? "#FF9500" : (percent < 100 ? "#007AFF" : "#34C759");
    }

    if (document.getElementById('progress-percent')) document.getElementById('progress-percent').innerText = percent;
    if (document.getElementById('water-count')) document.getElementById('water-count').innerText = waterBottles;
    if (document.getElementById('water-ml')) document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
}

window.onload = init;
window.refresh = refresh;