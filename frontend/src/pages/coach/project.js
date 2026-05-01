const API_BASE_URL = "http://localhost:8000";

// وظيفة التنقل العامة
function goTo(page) {
    window.location.href = page;
}

// إظهار/إخفاء نموذج الإضافة
function toggleForm(formId, btnId) {
    const form = document.getElementById(formId);
    const btn = document.getElementById(btnId);
    if(form) form.style.display = form.style.display === "none" ? "block" : "none";
    if(btn) btn.style.display = btn.style.display === "none" ? "block" : "none";
}

// 1. جلب التمارين (لصفحة session-details)
async function loadExercises() {
    try {
        const res = await fetch(`${API_BASE_URL}/sessions/exercises`);
        const data = await res.json();
        const container = document.getElementById('exerciseList');
        if(container) {
            container.innerHTML = data.map((ex, i) => `
                <div class="card">
                    <strong>${i+1}. ${ex.name}</strong>
                    <p style="font-size:12px; color:#a0a0a0;">${ex.description}</p>
                </div>
            `).join('');
        }
    } catch (e) { console.log("Backend offline"); }
}

// 2. جلب المراجعات والحضور (لصفحة session-reviews)
async function loadReviews() {
    try {
        const res = await fetch(`${API_BASE_URL}/sessions/reviews`);
        const data = await res.json();
        const container = document.getElementById('reviewsList');
        if(container) {
            container.innerHTML = data.map(rev => `
                <div class="card" style="display:flex; gap:12px;">
                    <div style="width:35px; height:35px; border-radius:50%; background:#444;"></div>
                    <div>
                        <strong>${rev.player_name}</strong> 
                        <span style="color:${rev.difficulty === 'HARD' ? '#e62e3d' : '#00ff00'}; font-size:10px;">${rev.difficulty}</span>
                        <p style="font-size:12px; color:#a0a0a0; margin-top:4px;">${rev.comment}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { console.log("Error loading reviews"); }
}