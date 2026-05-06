// 1. Firebase Imports (Using CDN for GitHub Pages compatibility)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 2. Your Firebase Configuration (From your screenshot)
const firebaseConfig = {
    apiKey: "AIzaSyBv911trXTVrZKvLGdLorWfGi8BGAssgZU",
    authDomain: "fitnessos-cb0b8.firebaseapp.com",
    // COPY THIS EXACTLY:
    databaseURL: "https://fitnessos-cb0b8-default-rtdb.asia-southeast1.firebasedatabase.app", 
    projectId: "fitnessos-cb0b8",
    storageBucket: "fitnessos-cb0b8.firebasestorage.app",
    messagingSenderId: "916907242195",
    appId: "1:916907242195:web:f8999a86d0a8eafd3e5a26"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const syncKey = "my-private-fitness-track"; // Change this to any secret word you want

// 4. Global UI State
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

// 5. Navigation Logic
window.switchTab = function(tabName, event) {
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    const target = document.getElementById('view-' + tabName);
    if (target) target.style.display = 'block';
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (event) (event.currentTarget || event.target.closest('.tab-item')).classList.add('active');
};

// 6. Sync Functions (Saves to Cloud)
window.updateWater = function(val) {
    waterBottles = Math.max(0, waterBottles + val);
    saveToCloud();
};

window.refreshUI = function() {
    saveToCloud();
};

function saveToCloud() {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const habitState = {};
    let count = 0;
    checks.forEach((c, i) => {
        habitState[i] = c.checked;
        if(c.checked) count++;
    });

    // Write to Firebase
    set(ref(db, 'users/' + syncKey + '/today'), {
        habits: habitState,
        water: waterBottles,
        date: new Date().toDateString()
    });
}

// 7. Listen for Cloud Changes (The Magic Sync)
const todayRef = ref(db, 'users/' + syncKey + '/today');
onValue(todayRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        waterBottles = data.water || 0;
        updateUIElements(data.habits || {}, data.water || 0);
    }
});

function updateUIElements(savedHabits, water) {
    // Update Habits List
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

    // Update Progress Circle & Text
    let habitCount = Object.values(savedHabits).filter(v => v === true).length;
    const percent = Math.round(((habitCount + Math.min(water, 4)) / 11) * 100);
    
    document.getElementById('progress-percent').innerText = percent;
    document.getElementById('water-count').innerText = water;
    document.getElementById('water-ml').innerText = `${water * 900}/3600ml`;
    
    const circle = document.getElementById('progress-circle');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
        circle.style.stroke = percent < 35 ? "#FF9500" : (percent < 100 ? "#007AFF" : "#34C759");
    }
}

// Start
window.onload = () => {
    window.switchTab('today');
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}).toUpperCase();
};