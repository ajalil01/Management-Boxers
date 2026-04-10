import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserCircle,
  CalendarPlus,
  TrendingUp,
  UsersRound,
  Activity,
} from "lucide-react";
import "./AdminHome.scss";

export default function AdminHome() {
  const { t } = useTranslation();
  const [memberActivityView, setMemberActivityView] = useState<"monthly" | "weekly">("monthly");
  const [coachLoadView, setCoachLoadView] = useState<"loaded" | "available">("loaded");

  // Mock data for charts
  const monthlyRecruits = [5, 8, 12, 7, 10, 15, 18, 14, 20, 22, 25, 28];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Mock data for member activity curve (monthly)
  const monthlyActivity = [15, 22, 18, 25, 30, 35, 32, 40, 38, 45, 50, 55];
  const weeklyActivity = [8, 12, 10, 15, 18, 20, 22];

  // Mock coaches data
  const coaches = [
    { name: "Cristiano Ronaldo", athletes: 50 },
    { name: "Lionel Messi", athletes: 18 },
    { name: "Neymar", athletes: 10 },
    { name: "Kylian Mbappé", athletes: 25 },
    { name: "Erling Haaland", athletes: 30 },
  ];

  const filteredCoaches = coaches.filter((coach) =>
    coachLoadView === "loaded" ? coach.athletes >= 50 : coach.athletes < 50
  );

  const maxAthletes = Math.max(...coaches.map((c) => c.athletes), 10);

  const getBarHeight = (value: number) => {
    return (value / 30) * 100; // Max 30 for coach recruits
  };

  const getActivityPoints = () => {
    const data = memberActivityView === "monthly" ? monthlyActivity : weeklyActivity;
    const maxValue = Math.max(...data, 10);
    const width = 100;
    const height = 120;
    const step = width / (data.length - 1);
    
    // Create smooth curve path using bezier curves
    const points = data.map((value, index) => {
      const x = index * step;
      const y = height - (value / maxValue) * height;
      return { x, y, value };
    });
    
    // Generate SVG path with bezier curves for smooth line
    let pathD = "";
    let areaPathD = "";
    
    if (points.length > 0) {
      pathD = `M ${points[0].x},${points[0].y}`;
      areaPathD = `M ${points[0].x},${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        // Calculate control points for smooth curve
        const cp1x = prev.x + (curr.x - prev.x) / 3;
        const cp1y = prev.y;
        const cp2x = curr.x - (curr.x - prev.x) / 3;
        const cp2y = curr.y;
        
        pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
        areaPathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
      }
      
      areaPathD += ` L ${width},${height} L 0,${height} Z`;
    }
    
    return { pathD, areaPathD, maxValue, points };
  };

  const { pathD, areaPathD, maxValue } = getActivityPoints();

  return (
    <div className="admin-home">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>{t("home.dashboard", "Dashboard")}</h1>
      </div>

      <div className="header-divider" />

      {/* 4 CARDS ROW */}
      <div className="cards-grid">
        {/* Card 1 - Total Coaches */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.total_coaches", "Total coaches")}</span>
            <Users className="card-icon" size={20} />
          </div>
          <div className="card-value">8</div>
          <div className="card-note">{t("home.active_season", "Active this season")}</div>
        </div>

        {/* Card 2 - Total Athletes */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.total_athletes", "Total athletes")}</span>
            <UserCircle className="card-icon" size={20} />
          </div>
          <div className="card-value">47</div>
          <div className="card-note">{t("home.registered_active", "Registered & active")}</div>
        </div>

        {/* Card 3 - New this month */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.new_this_month", "New this month")}</span>
            <CalendarPlus className="card-icon" size={20} />
          </div>
          <div className="card-value">6</div>
          <div className="card-note positive">
            <TrendingUp size={12} />
            {t("home.vs_last_month", "+3 vs last month")}
          </div>
        </div>

        {/* Card 4 - Avg per coach */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.avg_per_coach", "Avg per coach")}</span>
            <UsersRound className="card-icon" size={20} />
          </div>
          <div className="card-value">5.9</div>
          <div className="card-note">{t("home.athletes_per_coach", "Athletes / coach")}</div>
        </div>
      </div>

      {/* BOTTOM SECTION - Left (70%) + Right (30%) */}
      <div className="bottom-section">
        {/* LEFT SIDE (70%) */}
        <div className="left-panel">
          {/* Chart 1 - Coach recruited per month (Bar chart) */}
          <div className="chart-card">
            <div className="chart-title">{t("home.coach_recruited", "Coach recruited per month")}</div>
            <div className="chart-divider" />
            <div className="bar-chart-container">
              <div className="y-axis-labels">
                {[30, 20, 10, 0].map((label) => (
                  <span key={label} className="y-label">{label}</span>
                ))}
              </div>
              <div className="bar-chart">
                {/* Grid lines */}
                <div className="grid-lines">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                
                {monthlyRecruits.map((value, index) => (
                  <div key={index} className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${getBarHeight(value)}%` }}
                    >
                      <div className="bar-hover-tooltip">{value}</div>
                    </div>
                    <span className="x-label">{months[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2 - Member Activity (Curve chart) */}
          <div className="chart-card">
            <div className="chart-title-row">
              <span className="chart-title">{t("home.member_activity", "Member Activity")}</span>
              <div className="toggle-switch">
                <button
                  className={`toggle-btn ${memberActivityView === "monthly" ? "active" : ""}`}
                  onClick={() => setMemberActivityView("monthly")}
                >
                  {t("home.monthly", "Monthly")}
                </button>
                <button
                  className={`toggle-btn ${memberActivityView === "weekly" ? "active" : ""}`}
                  onClick={() => setMemberActivityView("weekly")}
                >
                  {t("home.weekly", "Weekly")}
                </button>
              </div>
            </div>
            <div className="chart-divider" />
            <div className="curve-chart-container">
              <div className="y-axis-labels">
                {[maxValue, Math.floor(maxValue * 0.66), Math.floor(maxValue * 0.33), 0].map((label) => (
                  <span key={label} className="y-label">{label}</span>
                ))}
              </div>
              <div className="curve-chart">
                {/* Grid lines */}
                <div className="grid-lines">
                  <div className="horizontal-grid-line"></div>
                  <div className="horizontal-grid-line"></div>
                  <div className="horizontal-grid-line"></div>
                  <div className="horizontal-grid-line"></div>
                  <div className="vertical-grid-lines">
                    {memberActivityView === "monthly" 
                      ? months.map((_, i) => <div key={i} className="vertical-line"></div>)
                      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((_, i) => <div key={i} className="vertical-line"></div>)
                    }
                  </div>
                </div>
                
                <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="curve-svg">
                  {/* Filled area under curve */}
                  <path d={areaPathD} fill="var(--color-red)" fillOpacity="0.2" />
                  {/* The smooth curve line */}
                  <path d={pathD} fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="x-axis-labels">
                  {memberActivityView === "monthly"
                    ? months.map((m, i) => <span key={i}>{m}</span>)
                    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => <span key={i}>{d}</span>)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (30%) - Coach Load */}
        <div className="right-panel">
          <div className="coach-load-card">
            <div className="coach-load-header">
              <span className="chart-title">{t("home.coach_load", "Coach Load")}</span>
              <div className="toggle-switch">
                <button
                  className={`toggle-btn ${coachLoadView === "loaded" ? "active" : ""}`}
                  onClick={() => setCoachLoadView("loaded")}
                >
                  {t("home.loaded", "Loaded")}
                </button>
                <button
                  className={`toggle-btn ${coachLoadView === "available" ? "active" : ""}`}
                  onClick={() => setCoachLoadView("available")}
                >
                  {t("home.available", "Available")}
                </button>
              </div>
            </div>
            <div className="chart-divider" />
            <div className="coach-list">
              {filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach, index) => (
                  <div key={index} className="coach-row">
                    <span className="coach-name">{coach.name}</span>
                    <div className="coach-stats">
                      <span className="coach-number">{coach.athletes}</span>
                      <span className="coach-label">{t("home.athlete", "Athlete")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-coaches">
                  {coachLoadView === "loaded"
                    ? t("home.no_loaded_coaches", "No coaches with 50+ athletes")
                    : t("home.no_available_coaches", "No coaches available")
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



