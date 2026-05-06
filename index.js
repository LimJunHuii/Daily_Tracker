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
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}).toUpperCase();
    
    // Load saved data
    const savedHabits = JSON.parse(localStorage.getItem('fOS_habits')) || {};
    waterBottles = parseInt(localStorage.getItem('fOS_water')) || 0;
    
    renderHabits(savedHabits);
    refresh();
}

function renderHabits(saved) {
    const list = document.getElementById('habit-list');
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

    // Save to phone memory
    localStorage.setItem('fOS_habits', JSON.stringify(state));
    localStorage.setItem('fOS_water', waterBottles);

    const total = habits.length + 4; 
    const score = count + Math.min(waterBottles, 4);
    const percent = Math.round((score / total) * 100);

    const circle = document.getElementById('progress-circle');
    const body = document.getElementById('app-body');

    // Visual feedback
    if (percent < 35) {
        circle.style.stroke = "#FF9500"; body.style.background = "#F2F2F7";
    } else if (percent < 100) {
        circle.style.stroke = "#007AFF"; body.style.background = "#E1F5FE";
    } else {
        circle.style.stroke = "#34C759"; body.style.background = "#E8F5E9";
    }

    document.getElementById('progress-percent').innerText = percent;
    document.getElementById('water-count').innerText = waterBottles;
    document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
    circle.setAttribute('stroke-dasharray', `${percent}, 100`);
}

init();