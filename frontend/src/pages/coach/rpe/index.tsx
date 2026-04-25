import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Activity, TrendingUp, TrendingDown, Minus, 
  Plus, Loader2,
  ChevronDown, ChevronUp, BarChart3, Zap, Moon, 
  Battery, Heart, Brain
} from "lucide-react";
import Alert from "@mui/material/Alert";
import "./RPEDashboard.css";
import { API_BASE_URL } from "../../../api/config";

interface Boxer {
  id: string;
  firstName: string;
  lastName: string;
  picture: string | null;
}

interface RPEEntry {
  id: string;
  session_rpe: number;
  fatigue: number | null;
  sleep_quality: number | null;
  soreness: number | null;
  stress: number | null;
  notes: string | null;
  entry_date: string;
  boxer_id: string;
  created_at: string;
}

interface BoxerStats {
  boxer_id: string;
  boxer_name: string;
  avg_session_rpe: number;
  avg_fatigue: number | null;
  avg_sleep: number | null;
  avg_soreness: number | null;
  avg_stress: number | null;
  total_entries: number;
  trend: "improving" | "stable" | "declining";
}

export default function RPEDashboard() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [boxers, setBoxers] = useState<Boxer[]>([]);
  const [selectedBoxer, setSelectedBoxer] = useState<string | null>(null);
  const [entries, setEntries] = useState<RPEEntry[]>([]);
  const [stats, setStats] = useState<BoxerStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{type: "success" | "error"; message: string} | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [sessionRPE, setSessionRPE] = useState<number>(5);
  const [fatigue, setFatigue] = useState<number | "">("");
  const [sleepQuality, setSleepQuality] = useState<number | "">("");
  const [soreness, setSoreness] = useState<number | "">("");
  const [stress, setStress] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-dismiss alert
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const fetchBoxers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/boxers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setBoxers(json.data.map((b: any) => ({
          id: b.id,
          firstName: b.first_name,
          lastName: b.last_name,
          picture: b.picture,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch boxers", err);
    }
  };

  const fetchEntries = async (boxerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rpe/boxer/${boxerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setEntries(json.data);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (boxerId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rpe/stats/${boxerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setStats(json.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchBoxers();
  }, []);

  useEffect(() => {
    if (selectedBoxer) {
      fetchEntries(selectedBoxer);
      fetchStats(selectedBoxer);
    }
  }, [selectedBoxer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoxer) return;

    setIsSubmitting(true);
    try {
      const payload = {
        boxer_id: selectedBoxer,
        session_rpe: sessionRPE,
        entry_date: entryDate,
        fatigue: fatigue || null,
        sleep_quality: sleepQuality || null,
        soreness: soreness || null,
        stress: stress || null,
        notes: notes || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/rpe/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: data.detail || "Failed to create entry" });
        return;
      }

      setAlert({ type: "success", message: "RPE entry added!" });
      setShowForm(false);
      resetForm();
      fetchEntries(selectedBoxer);
      fetchStats(selectedBoxer);
    } catch (err) {
      setAlert({ type: "error", message: "Network error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSessionRPE(5);
    setFatigue("");
    setSleepQuality("");
    setSoreness("");
    setStress("");
    setNotes("");
    setEntryDate(new Date().toISOString().split('T')[0]);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingDown size={16} className="text-green" />;
    if (trend === "declining") return <TrendingUp size={16} className="text-red" />;
    return <Minus size={16} className="text-yellow" />;
  };

  const getRPEColor = (value: number) => {
    if (value <= 3) return "#22c55e";
    if (value <= 6) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="rpe-dashboard-page animate-fadeIn">
      {alert && (
        <div className="fixed-toast">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      {/* Header */}
      <div className="rpe-dashboard-header">
        <h1>
          <Activity size={20} />
          RPE Monitoring
        </h1>
        <span className="header-subtitle">Track fatigue, recovery & injury risk</span>
      </div>

      {/* Boxer Selector */}
      <div className="boxer-selector-container animate-slideUp">
        <label className="selector-label">Select Boxer</label>
        <select 
          value={selectedBoxer || ""} 
          onChange={(e) => setSelectedBoxer(e.target.value || null)}
          className="boxer-select"
        >
          <option value="">Choose a boxer...</option>
          {boxers.map(b => (
            <option key={b.id} value={b.id}>
              {b.firstName} {b.lastName}
            </option>
          ))}
        </select>
      </div>

      {selectedBoxer && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="rpe-stats-grid">
              {/* Main RPE Card - Spans 2 cols */}
              <div className="stat-card rpe-main-card animate-slideUp">
                <div className="stat-card-header">
                  <span className="stat-card-label">Avg Session RPE</span>
                  <span className="trend-badge">
                    {getTrendIcon(stats.trend)}
                    <span>{stats.trend}</span>
                  </span>
                </div>
                <div 
                  className="stat-card-value-large"
                  style={{ color: getRPEColor(stats.avg_session_rpe) }}
                >
                  {stats.avg_session_rpe}
                </div>
                <div className="stat-card-subtitle">Total entries: {stats.total_entries}</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.1s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">Fatigue</span>
                  <div className="stat-card-icon">
                    <Battery size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_fatigue ?? "-"}</div>
                <div className="stat-card-subtitle">Avg level</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.15s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">Sleep Quality</span>
                  <div className="stat-card-icon">
                    <Moon size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_sleep ?? "-"}</div>
                <div className="stat-card-subtitle">Avg rating</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.2s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">Soreness</span>
                  <div className="stat-card-icon">
                    <Zap size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_soreness ?? "-"}</div>
                <div className="stat-card-subtitle">Avg level</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.25s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">Stress</span>
                  <div className="stat-card-icon">
                    <Brain size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.avg_stress ?? "-"}</div>
                <div className="stat-card-subtitle">Avg level</div>
              </div>

              <div className="stat-card animate-slideUp" style={{ animationDelay: "0.3s" }}>
                <div className="stat-card-header">
                  <span className="stat-card-label">Total Entries</span>
                  <div className="stat-card-icon">
                    <BarChart3 size={16} />
                  </div>
                </div>
                <div className="stat-card-value">{stats.total_entries}</div>
                <div className="stat-card-subtitle">Recorded sessions</div>
              </div>
            </div>
          )}

          {/* Add Entry Button */}
          <button 
            className="add-entry-btn animate-slideUp"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={18} />
            {showForm ? "Cancel" : "Add RPE Entry"}
          </button>

          {/* Entry Form */}
          {showForm && (
            <form className="rpe-form-container animate-slideUp" onSubmit={handleSubmit}>
              <div className="form-top-row">
                <div className="form-group slider-group">
                  <label>Session RPE *</label>
                  <div className="slider-wrapper">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={sessionRPE} 
                      onChange={(e) => setSessionRPE(Number(e.target.value))}
                      className="rpe-slider"
                    />
                    <span 
                      className="slider-value" 
                      style={{ color: getRPEColor(sessionRPE) }}
                    >
                      {sessionRPE}/10
                    </span>
                  </div>
                </div>

                <div className="form-group date-group">
                  <label>Date *</label>
                  <input 
                    type="date" 
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="date-input"
                  />
                </div>
              </div>

              <div className="form-metrics-row">
                <div className="form-group">
                  <label>Fatigue (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={fatigue}
                    onChange={(e) => setFatigue(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>Sleep Quality (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>Soreness (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={soreness}
                    onChange={(e) => setSoreness(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>

                <div className="form-group">
                  <label>Stress (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={stress}
                    onChange={(e) => setStress(e.target.value ? Number(e.target.value) : "")}
                    placeholder="1-10"
                    className="metric-input"
                  />
                </div>
              </div>

              <div className="form-group notes-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="How did the session feel? Any pain or concerns?"
                  className="notes-input"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner-icon" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Save Entry
                  </>
                )}
              </button>
            </form>
          )}

          {/* History Table */}
          <div className="history-section animate-slideUp" style={{ animationDelay: "0.35s" }}>
            <div className="history-header">
              <h3>
                <BarChart3 size={18} />
                RPE History
              </h3>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <Loader2 className="spinner-loading" size={24} />
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-table-state">No RPE entries recorded yet</div>
            ) : (
              <div className="table-wrapper">
                <table className="rpe-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>RPE</th>
                      <th>Fatigue</th>
                      <th>Sleep</th>
                      <th>Soreness</th>
                      <th>Stress</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => (
                      <tr key={entry.id}>
                        <td className="date-cell">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </td>
                        <td>
                          <span 
                            className="rpe-badge"
                            style={{ 
                              color: getRPEColor(entry.session_rpe),
                              background: `${getRPEColor(entry.session_rpe)}20`
                            }}
                          >
                            {entry.session_rpe}
                          </span>
                        </td>
                        <td>{entry.fatigue ?? "-"}</td>
                        <td>{entry.sleep_quality ?? "-"}</td>
                        <td>{entry.soreness ?? "-"}</td>
                        <td>{entry.stress ?? "-"}</td>
                        <td className="notes-cell">{entry.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

