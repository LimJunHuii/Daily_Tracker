// GLOBAL FUNCTIONS - Attached to window to ensure HTML can find them
window.switchTab = function(tabName, event) {
    console.log("Switching to:", tabName);
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.style.display = 'none');
    
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';

    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (event) {
        const item = event.currentTarget || event.target.closest('.tab-item');
        if (item) item.classList.add('active');
    }
};

window.updateWater = function(val) {
    waterBottles = Math.max(0, waterBottles + val);
    refreshUI();
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
    console.log("FitnessOS Loaded");
    
    // Set Date Header
    const dateLabel = document.getElementById('current-date');
    if (dateLabel) {
        dateLabel.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
    }

    // Load Data
    const savedHabits = JSON.parse(localStorage.getItem('fOS_habits')) || {};
    waterBottles = parseInt(localStorage.getItem('fOS_water')) || 0;

    // Render Habit List
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

    // Save state
    localStorage.setItem('fOS_habits', JSON.stringify(state));
    localStorage.setItem('fOS_water', waterBottles);

    // Calculate Percent
    const total = habits.length + 4; 
    const score = count + Math.min(waterBottles, 4);
    const percent = Math.round((score / total) * 100);

    // Update Circle & Colors
    const circle = document.getElementById('progress-circle');
    const body = document.getElementById('app-body');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        if (percent < 35) {
            circle.style.stroke = "var(--ios-orange)";
            body.style.background = "#F2F2F7";
        } else if (percent < 100) {
            circle.style.stroke = "var(--ios-blue)";
            body.style.background = "#E1F5FE";
        } else {
            circle.style.stroke = "var(--ios-green)";
            body.style.background = "#E8F5E9";
        }
    }

    // Update Text
    if (document.getElementById('progress-percent')) document.getElementById('progress-percent').innerText = percent;
    if (document.getElementById('water-count')) document.getElementById('water-count').innerText = waterBottles;
    if (document.getElementById('water-ml')) document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
}

// Global UI trigger
window.refreshUI = refreshUI;
window.onload = initApp;