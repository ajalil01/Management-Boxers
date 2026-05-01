const ATHLETE_ID = 1;
let currentDate = new Date(2026, 0, 1);
let allSessions = [];
let athleteData = {};

function mockFetchAthlete(athleteId, year, month) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: athleteId,
        name: "Zephyr",
        sessions: [
          { id: 101, date: "2026-01-01", start_time: "10:00", end_time: "12:00", type: "Session-training", coach: "Coach pep", status: "present" },
          { id: 102, date: "2026-01-01", start_time: "20:00", end_time: "21:00", type: "Session-Boxing",   coach: "Coach pep", status: "absent"  },
          { id: 103, date: "2026-01-08", start_time: "10:00", end_time: "12:00", type: "Session-training", coach: "Coach pep", status: "pending" },
          { id: 104, date: "2026-01-08", start_time: "18:00", end_time: "19:30", type: "Session-Cardio",   coach: "Coach pep", status: "present" },
          { id: 105, date: "2026-01-15", start_time: "10:00", end_time: "12:00", type: "Session-training", coach: "Coach Ali", status: "present" },
          { id: 106, date: "2026-01-22", start_time: "09:00", end_time: "11:00", type: "Session-Boxing",   coach: "Coach pep", status: "absent"  },
        ]
      });
    }, 600);
  });
}

async function loadData() {
  showLoading(true);
  clearError();

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  try {
    const data = await mockFetchAthlete(ATHLETE_ID, year, month);

    athleteData = data;
    allSessions = data.sessions || [];

    document.getElementById('athlete-name').textContent = data.name;

    const initials = data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('athlete-initials').textContent = initials;

    updateMonthLabel();
    applyFilter();
    updateStats();

    document.getElementById('stats-bar').style.display = 'flex';

  } catch (err) {
    showError('Erreur de connexion à l\'API : ' + err.message);
  } finally {
    showLoading(false);
  }
}

function applyFilter() {
  const filter = document.getElementById('filter-select').value;

  const filtered = filter === 'all'
    ? allSessions
    : allSessions.filter(s => s.status === filter);

  renderSessions(filtered);
}

function renderSessions(sessions) {
  const container = document.getElementById('sessions-container');
  container.innerHTML = '';

  if (!sessions.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:32px 0;">Aucune session trouvée.</p>';
    return;
  }

  const grouped = {};
  sessions.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  Object.keys(grouped).sort().forEach(date => {
    const group = document.createElement('div');
    group.className = 'day-group';

    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = formatDate(date);
    group.appendChild(label);

    grouped[date].forEach(session => group.appendChild(buildSessionCard(session)));

    container.appendChild(group);
  });
}

function buildSessionCard(session) {
  const card = document.createElement('div');
  card.className = 'session';

  const timeStr = session.start_time + '–' + session.end_time;

  const statusClass = {
    present: 'status-present',
    absent:  'status-absent',
    pending: 'status-pending'
  }[session.status] || 'status-pending';

  const statusLabel = {
    present: 'Present',
    absent:  'Absent',
    pending: '—'
  }[session.status] || '—';

  card.innerHTML = `
    <div class="session-time">${timeStr}</div>
    <div class="session-divider"></div>
    <div class="session-info">
      <div class="session-name">${session.type}</div>
      <div class="session-coach">${session.coach}</div>
    </div>
    <div class="status-badge ${statusClass}">${statusLabel}</div>
  `;

  return card;
}

function updateStats() {
  document.getElementById('stat-present').textContent = allSessions.filter(s => s.status === 'present').length;
  document.getElementById('stat-absent').textContent  = allSessions.filter(s => s.status === 'absent').length;
  document.getElementById('stat-total').textContent   = allSessions.length;
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  loadData();
}

function updateMonthLabel() {
  document.getElementById('month-label').textContent =
    currentDate
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function showLoading(v) {
  document.getElementById('loading').style.display = v ? 'flex' : 'none';
}

function clearError() {
  document.getElementById('error-container').innerHTML = '';
}

function showError(msg) {
  document.getElementById('error-container').innerHTML =
    `<div class="error-box">⚠ ${msg}</div>`;
}

loadData();
