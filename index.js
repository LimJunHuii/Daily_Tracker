import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBv911trXTVrZKvLGdLorWfGi8BGAssgZU",
    authDomain: "fitnessos-cb0b8.firebaseapp.com",
    databaseURL: "https://fitnessos-cb0b8-default-rtdb.asia-southeast1.firebasedatabase.app", 
    projectId: "fitnessos-cb0b8",
    storageBucket: "fitnessos-cb0b8.firebasestorage.app",
    messagingSenderId: "916907242195",
    appId: "1:916907242195:web:f8999a86d0a8eafd3e5a26"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const syncKey = "user_one_tracker"; // Changed to a simpler key

const habits = [
    { name: "Morning Protein", desc: "2 eggs + milk/soy milk. Avoid heavy carbs." },
    { name: "Lunch Strategy", desc: "Veg/Meat first, Carbs last. Use corn/sweet potato." },
    { name: "Post-Workout Fuel", desc: "Protein within 1hr. No sugary drinks/cola." },
    { name: "20 Squats", desc: "Daily squats for leg power (can do while brushing teeth)." },
    { name: "Push-Up Set", desc: "One set to failure. Start on knees if needed." },
    { name: "Daily Plank", desc: "Hold for 30s+ to build core strength and posture." },
    { name: "Sleep (Before 11PM)", desc: "7+ hours. Phone away from bed." },
    { name: "Active Habits", desc: "Walk every 45m, 10m sunlight, no alcohol." }
];

let waterBottles = 0;

// Force Global Functions
window.switchTab = (tabName, event) => {
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (event) (event.currentTarget || event.target.closest('.tab-item')).classList.add('active');
};

window.updateWater = (val) => {
    waterBottles = Math.max(0, waterBottles + val);
    saveData();
};

window.refreshUI = () => {
    saveData();
};

function saveData() {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const habitState = {};
    let count = 0;
    checks.forEach((c, i) => {
        habitState[i] = c.checked;
        if(c.checked) count++;
    });

    const percent = Math.round(((count + Math.min(waterBottles, 4)) / (habits.length + 4)) * 100);

    set(ref(db, `users/${syncKey}/today`), {
        habits: habitState,
        water: waterBottles,
        date: new Date().toDateString(),
        percent: percent
    });
}

// THE LISTENER
onValue(ref(db, `users/${syncKey}/today`), (snapshot) => {
    console.log("Data received from Cloud...");
    const data = snapshot.val() || {};
    const savedHabits = data.habits || {};
    waterBottles = data.water || 0;
    const percent = data.percent || 0;

    // Render Habits
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

    // Update Text
    document.getElementById('progress-percent').innerText = percent;
    document.getElementById('water-count').innerText = waterBottles;
    document.getElementById('water-ml').innerText = `${waterBottles * 900}/3600ml`;
    
    const circle = document.getElementById('progress-circle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        circle.style.stroke = percent < 35 ? "#FF9500" : (percent < 100 ? "#007AFF" : "#34C759");
    }
});

async function updateDayCount() {
    const histSnap = await get(ref(db, `users/${syncKey}/history`));
    const historyData = histSnap.val() || {};
    const count = Object.keys(historyData).length + 1;
    const counterEl = document.getElementById('day-counter');
    if (counterEl) counterEl.innerText = `DAY ${count}`;
}

window.onload = () => {
    window.switchTab('today');
    updateDayCount();
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}).toUpperCase();
};