import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserCircle,
  CalendarPlus,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { API_BASE_URL } from "../../../api/config";
import "./AdminHome.scss";

interface DashboardStats {
  total_coaches: number;
  total_boxers: number;
  coaches_this_month: number;
  avg_boxers_per_coach: number;
}

interface CoachAthlete {
  coach_id: string;
  full_name: string;
  boxers_count: number;
}

interface MonthlyCoachData {
  month: number;
  count: number;
}

interface ActivityData {
  label: string;
  count: number;
}

export default function AdminHome() {
  const { t } = useTranslation();
  const [memberActivityView, setMemberActivityView] = useState<"monthly" | "weekly">("monthly");
  const [coachLoadView, setCoachLoadView] = useState<"loaded" | "available">("loaded");
  
  // State for API data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [coaches, setCoaches] = useState<CoachAthlete[]>([]);
  const [monthlyRecruits, setMonthlyRecruits] = useState<number[]>(Array(12).fill(0));
  const [activityData, setActivityData] = useState<number[]>([]);
  const [activityLabels, setActivityLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };

  // Fetch initial dashboard data (stats, coaches, monthly recruits)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentYear = new Date().getFullYear();
        const headers = getAuthHeaders();
        
        // Check if token exists
        if (!headers.Authorization) {
          throw new Error("No authentication token found");
        }

        console.log("Fetching initial dashboard data...");

        // Fetch stats, coaches, and monthly data
        const [statsRes, coachesRes, monthlyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analytics/admin/dashboard`, { headers }),
          fetch(`${API_BASE_URL}/api/analytics/admin/coach-athletes`, { headers }),
          fetch(`${API_BASE_URL}/api/analytics/admin/coaches-year?year=${currentYear}`, { headers })
        ]);

        // Check response statuses
        if (!statsRes.ok) {
          console.error("Stats response not OK:", statsRes.status);
          if (statsRes.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
        }
        if (!coachesRes.ok) console.error("Coaches response not OK:", coachesRes.status);
        if (!monthlyRes.ok) console.error("Monthly response not OK:", monthlyRes.status);

        const statsData = await statsRes.json();
        const coachesData = await coachesRes.json();
        const monthlyData = await monthlyRes.json();

        console.log("Stats Data:", statsData);
        console.log("Coaches Data:", coachesData);
        console.log("Monthly Data:", monthlyData);

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (coachesData.success) {
          setCoaches(coachesData.data);
        }

        if (monthlyData.success) {
          // Convert monthly data to array of counts
          const monthlyCounts = Array(12).fill(0);
          monthlyData.data.forEach((item: MonthlyCoachData) => {
            if (item.month >= 1 && item.month <= 12) {
              monthlyCounts[item.month - 1] = item.count;
            }
          });
          setMonthlyRecruits(monthlyCounts);
        }

      } catch (err) {
        console.error("Error fetching initial dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array - only run once on mount

  // Fetch activity data separately - runs when memberActivityView changes
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setActivityLoading(true);
        const headers = getAuthHeaders();
        
        if (!headers.Authorization) {
          console.error("No authentication token found");
          return;
        }

        console.log(`Fetching activity data for ${memberActivityView} view...`);

        const activityRes = await fetch(
          `${API_BASE_URL}/api/analytics/admin/boxers?filter_type=${memberActivityView}`, 
          { headers }
        );

        if (!activityRes.ok) {
          console.error("Activity response not OK:", activityRes.status);
          return;
        }

        const activityDataRes = await activityRes.json();
        console.log("Activity Data:", activityDataRes);

        if (activityDataRes.success) {
          const counts = activityDataRes.data.map((item: ActivityData) => item.count);
          const labels = activityDataRes.data.map((item: ActivityData) => item.label);
          setActivityData(counts);
          setActivityLabels(labels);
        }
      } catch (err) {
        console.error("Error fetching activity data:", err);
      } finally {
        setActivityLoading(false);
      }
    };

    if (!loading) { // Only fetch activity after initial data is loaded
      fetchActivityData();
    }
  }, [memberActivityView, loading]); // Re-run when view changes

  const filteredCoaches = coaches.filter((coach) =>
    coachLoadView === "loaded" ? coach.boxers_count >= 50 : coach.boxers_count < 50
  );

  const getBarHeight = (value: number) => {
    const maxRecruit = Math.max(...monthlyRecruits, 1);
    return (value / maxRecruit) * 100;
  };

  const getActivityPoints = () => {
    const data = activityData.length > 0 ? activityData : [0];
    const maxValue = Math.max(...data, 1);
    const width = 100;
    const height = 120;
    const step = width / (data.length - 1 || 1);
    
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

  if (loading) {
    return (
      <div className="admin-home loading">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-home error">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          {error.includes("authentication") && (
            <button onClick={() => window.location.href = "/login"}>
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

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
          <div className="card-value">{stats?.total_coaches || 0}</div>
          <div className="card-note">{t("home.active_season", "Active this season")}</div>
        </div>

        {/* Card 2 - Total Athletes */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.total_athletes", "Total athletes")}</span>
            <UserCircle className="card-icon" size={20} />
          </div>
          <div className="card-value">{stats?.total_boxers || 0}</div>
          <div className="card-note">{t("home.registered_active", "Registered & active")}</div>
        </div>

        {/* Card 3 - New this month */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.new_this_month", "New coaches this month")}</span>
            <CalendarPlus className="card-icon" size={20} />
          </div>
          <div className="card-value">{stats?.coaches_this_month || 0}</div>
          <div className="card-note positive">
            <TrendingUp size={12} />
            {t("home.new_coaches", "New coaches")}
          </div>
        </div>

        {/* Card 4 - Avg per coach */}
        <div className="stat-card">
          <div className="card-header">
            <span className="card-title">{t("home.avg_per_coach", "Avg per coach")}</span>
            <UsersRound className="card-icon" size={20} />
          </div>
          <div className="card-value">{stats?.avg_boxers_per_coach?.toFixed(1) || "0.0"}</div>
          <div className="card-note">{t("home.athletes_per_coach", "Boxers / coach")}</div>
        </div>
      </div>

      {/* BOTTOM SECTION - Left (70%) + Right (30%) */}
      <div className="bottom-section">
        {/* LEFT SIDE (70%) */}
        <div className="left-panel">
          {/* Chart 1 - Coach recruited per month (Bar chart) */}
          <div className="chart-card">
            <div className="chart-title">{t("home.coach_recruited", "Coaches recruited per month")}</div>
            <div className="chart-divider" />
            <div className="bar-chart-container">
              <div className="y-axis-labels">
                {[Math.max(...monthlyRecruits, 10), 
                  Math.floor(Math.max(...monthlyRecruits, 10) * 0.66), 
                  Math.floor(Math.max(...monthlyRecruits, 10) * 0.33), 
                  0].map((label) => (
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
              <span className="chart-title">{t("home.member_activity", "Boxer Activity")}</span>
              <div className="toggle-switch">
                <button
                  className={`toggle-btn ${memberActivityView === "monthly" ? "active" : ""}`}
                  onClick={() => setMemberActivityView("monthly")}
                  disabled={activityLoading}
                >
                  {t("home.monthly", "Monthly")}
                </button>
                <button
                  className={`toggle-btn ${memberActivityView === "weekly" ? "active" : ""}`}
                  onClick={() => setMemberActivityView("weekly")}
                  disabled={activityLoading}
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
                    {activityLabels.map((_, i) => <div key={i} className="vertical-line"></div>)}
                  </div>
                </div>
                
                {activityLoading ? (
                  <div className="chart-loading">Loading activity data...</div>
                ) : activityData.length > 0 ? (
                  <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="curve-svg">
                    {/* Filled area under curve */}
                    <path d={areaPathD} fill="var(--color-red)" fillOpacity="0.2" />
                    {/* The smooth curve line */}
                    <path d={pathD} fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="chart-no-data">No activity data available</div>
                )}
                <div className="x-axis-labels">
                  {activityLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
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
                filteredCoaches.map((coach) => (
                  <div key={coach.coach_id} className="coach-row">
                    <span className="coach-name">{coach.full_name}</span>
                    <div className="coach-stats">
                      <span className="coach-number">{coach.boxers_count}</span>
                      <span className="coach-label">
                        {coach.boxers_count === 1 
                          ? t("home.boxer", "Boxer") 
                          : t("home.boxers", "Boxers")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-coaches">
                  {coachLoadView === "loaded"
                    ? t("home.no_loaded_coaches", "No coaches with 50+ boxers")
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

