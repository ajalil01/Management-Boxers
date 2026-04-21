// CoachSchedule.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock } from "lucide-react";
import "./CoachSchedule.scss";

interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  exercises?: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  description: string;
}

interface DaySession {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
}

export default function CoachSchedule() {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<"monthly" | "daily">("monthly");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0)); // January 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 1));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [selectedDateForm, setSelectedDateForm] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [currentExercise, setCurrentExercise] = useState({ name: "", description: "" });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Mock sessions data with examples across different days
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockSessions: Session[] = [
          // January 1 - 4 sessions
          {
            id: "1",
            title: "Session 1",
            startTime: "10:00",
            endTime: "12:00",
            date: "2026-01-01",
          },
          {
            id: "2",
            title: "Session 2",
            startTime: "13:00",
            endTime: "15:00",
            date: "2026-01-01",
          },
          {
            id: "3",
            title: "Session 3",
            startTime: "15:30",
            endTime: "17:30",
            date: "2026-01-01",
          },
          {
            id: "4",
            title: "Session 4",
            startTime: "18:00",
            endTime: "20:00",
            date: "2026-01-01",
          },
          // January 5 - 1 session
          {
            id: "5",
            title: "Morning Training",
            startTime: "09:00",
            endTime: "11:00",
            date: "2026-01-05",
          },
          // January 10 - 2 sessions
          {
            id: "6",
            title: "Session 1",
            startTime: "10:00",
            endTime: "12:00",
            date: "2026-01-10",
          },
          {
            id: "7",
            title: "Session 2",
            startTime: "14:00",
            endTime: "16:00",
            date: "2026-01-10",
          },
          // January 15 - 3 sessions
          {
            id: "8",
            title: "Session 1",
            startTime: "08:00",
            endTime: "10:00",
            date: "2026-01-15",
          },
          {
            id: "9",
            title: "Session 2",
            startTime: "11:00",
            endTime: "13:00",
            date: "2026-01-15",
          },
          {
            id: "10",
            title: "Session 3",
            startTime: "15:00",
            endTime: "17:00",
            date: "2026-01-15",
          },
          // January 20 - 5 sessions
          {
            id: "11",
            title: "Session 1",
            startTime: "09:00",
            endTime: "10:30",
            date: "2026-01-20",
          },
          {
            id: "12",
            title: "Session 2",
            startTime: "11:00",
            endTime: "12:30",
            date: "2026-01-20",
          },
          {
            id: "13",
            title: "Session 3",
            startTime: "13:00",
            endTime: "14:30",
            date: "2026-01-20",
          },
          {
            id: "14",
            title: "Session 4",
            startTime: "15:00",
            endTime: "16:30",
            date: "2026-01-20",
          },
          {
            id: "15",
            title: "Session 5",
            startTime: "17:00",
            endTime: "18:30",
            date: "2026-01-20",
          },
          // January 25 - 1 session
          {
            id: "16",
            title: "Evening Session",
            startTime: "19:00",
            endTime: "21:00",
            date: "2026-01-25",
          },
          // February 1 (next month) - 2 sessions
          {
            id: "17",
            title: "Session 1",
            startTime: "10:00",
            endTime: "12:00",
            date: "2026-02-01",
          },
          {
            id: "18",
            title: "Session 2",
            startTime: "14:00",
            endTime: "16:00",
            date: "2026-02-01",
          },
          // December 29 (previous month) - 1 session
          {
            id: "19",
            title: "Year End Session",
            startTime: "10:00",
            endTime: "12:00",
            date: "2025-12-29",
          },
        ];
        setSessions(mockSessions);
        setLoading(false);
      }, 500);
    };

    fetchSessions();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    setCurrentDate(new Date(prevDay));
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    setCurrentDate(new Date(nextDay));
  };

  const handleAddSession = () => {
    setIsSidebarOpen(true);
    // Set selected date to current month's first day when opening from monthly view
    if (viewType === "monthly") {
      setSelectedDateForm(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    } else {
      setSelectedDateForm(new Date(selectedDate));
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSessionName("");
    setSelectedDateForm(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setExercises([]);
    setIsAddingExercise(false);
    setCurrentExercise({ name: "", description: "" });
    setEditingExerciseId(null);
    setShowDatePicker(false);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewType("daily");
  };

  const handleMoreSessionsClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(date);
    setViewType("daily");
  };

  const handleAddExercise = () => {
    if (currentExercise.name.trim() && currentExercise.description.trim()) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: currentExercise.name,
        description: currentExercise.description,
      };
      setExercises([...exercises, newExercise]);
      setCurrentExercise({ name: "", description: "" });
      setIsAddingExercise(false);
    }
  };

  const handleCancelExercise = () => {
    setCurrentExercise({ name: "", description: "" });
    setIsAddingExercise(false);
    setEditingExerciseId(null);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setCurrentExercise({ name: exercise.name, description: exercise.description });
    setEditingExerciseId(exercise.id);
    setIsAddingExercise(true);
  };

  const handleUpdateExercise = () => {
    if (currentExercise.name.trim() && currentExercise.description.trim() && editingExerciseId) {
      setExercises(exercises.map(ex => 
        ex.id === editingExerciseId 
          ? { ...ex, name: currentExercise.name, description: currentExercise.description }
          : ex
      ));
      setCurrentExercise({ name: "", description: "" });
      setIsAddingExercise(false);
      setEditingExerciseId(null);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleCreateSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionName,
      startTime: startTime,
      endTime: endTime,
      date: selectedDateForm.toISOString().split('T')[0],
      exercises: exercises,
    };
    setSessions([...sessions, newSession]);
    handleCloseSidebar();
  };

  const getDaysInMonth = (date: Date): DaySession[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: DaySession[] = [];
    const currentDateCopy = new Date(startDate);
    
    while (currentDateCopy <= endDate) {
      const dateStr = currentDateCopy.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateStr);
      
      days.push({
        date: new Date(currentDateCopy),
        sessions: daySessions,
        isCurrentMonth: currentDateCopy.getMonth() === month,
      });
      
      currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    
    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getDaysInMonth(currentDate);

  const isFirstRow = (index: number) => index < 7;

  const getSessionsForSelectedDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const calculateSessionPosition = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startPosition = startHour + (startMinute / 60);
    const endPosition = endHour + (endMinute / 60);
    const duration = endPosition - startPosition;
    
    return {
      top: `${(startPosition / 24) * 100}%`,
      height: `${(duration / 24) * 100}%`,
    };
  };

  const formatSessionTime = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hour, minute] = time.split(':');
      const h = parseInt(hour);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const formatDate = (date: Date) => {
    return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const generateDateOptions = () => {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="coach-home loading">
        <div className="loading-spinner">Loading calendar...</div>
      </div>
    );
  }

  const selectedDateSessions = getSessionsForSelectedDate();

  return (
    <>
      <div className={`coach-home ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Overlay */}
        {isSidebarOpen && <div className="overlay" onClick={handleCloseSidebar} />}
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            {viewType === "monthly" ? (
              <>
                <button className="month-nav-btn" onClick={handlePreviousMonth}>
                  <ChevronLeft size={20} />
                </button>
                <button className="month-nav-btn" onClick={handleNextMonth}>
                  <ChevronRight size={20} />
                </button>
                <h2 className="current-month">
                  {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
                </h2>
              </>
            ) : (
              <>
                <button className="month-nav-btn" onClick={handlePreviousDay}>
                  <ChevronLeft size={20} />
                </button>
                <button className="month-nav-btn" onClick={handleNextDay}>
                  <ChevronRight size={20} />
                </button>
                <h2 className="current-month">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h2>
              </>
            )}
          </div>
          
          <div className="header-right">
            <button className="add-session-btn" onClick={handleAddSession}>
              <Plus size={18} />
              <span>Add Session</span>
            </button>
            
            <div className="toggle-switch">
              <button
                className={`toggle-btn ${viewType === "monthly" ? "active" : ""}`}
                onClick={() => setViewType("monthly")}
              >
                Monthly
              </button>
              <button
                className={`toggle-btn ${viewType === "daily" ? "active" : ""}`}
                onClick={() => setViewType("daily")}
              >
                Daily
              </button>
            </div>
          </div>
        </div>

        <div className="header-divider" />

        {/* Calendar View */}
        {viewType === "monthly" && (
          <div className="calendar-wrapper">
            <div className="calendar-grid">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="calendar-day"
                  onClick={() => handleDayClick(day.date)}
                >
                  {isFirstRow(index) && (
                    <div className="day-header">
                      <span className="week-day-name">{weekDays[index % 7]}</span>
                      <span className="day-number">{day.date.getDate()}</span>
                    </div>
                  )}
                  
                  {!isFirstRow(index) && (
                    <div className="day-number-only">{day.date.getDate()}</div>
                  )}
                  
                  <div className={`day-content ${!day.isCurrentMonth ? "other-month" : ""}`}>
                    {day.sessions.length > 0 && (
                      <div className="sessions-container">
                        {day.sessions.slice(0, 2).map((session) => (
                          <div key={session.id} className="session-item">
                            <div className="session-title">{session.title}</div>
                            <div className="session-time">
                              {session.startTime} - {session.endTime}
                            </div>
                          </div>
                        ))}
                        
                        {day.sessions.length > 2 && (
                          <button
                            className="more-sessions-btn"
                            onClick={(e) => handleMoreSessionsClick(day.date, e)}
                          >
                            +{day.sessions.length - 2} more session{day.sessions.length - 2 > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily View */}
        {viewType === "daily" && (
          <div className="daily-view-wrapper">
            <div className="daily-timeline">
              <div className="hour-labels">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 || 12;
                  return (
                    <div key={i} className="hour-label">
                      {displayHour}:00 {ampm}
                    </div>
                  );
                })}
              </div>

              <div className="timeline-grid">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="hour-line"></div>
                ))}

                {selectedDateSessions.map((session) => {
                  const position = calculateSessionPosition(session.startTime, session.endTime);
                  return (
                    <div
                      key={session.id}
                      className="daily-session-item"
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                    >
                      <div className="session-header">
                        <span className="session-name">{session.title}</span>
                        <span className="session-duration">
                          {formatSessionTime(session.startTime, session.endTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {selectedDateSessions.length === 0 && (
                  <div className="no-sessions-message">
                    No sessions scheduled for this day
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className={`session-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-btn" onClick={handleCloseSidebar}>
            <X size={20} />
          </button>
          <h2 className="sidebar-title">New Session</h2>
        </div>

        <div className="sidebar-content">
          {/* Session Name */}
          <div className="form-group">
            <label className="form-label">Session name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter session name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          {/* Date and Time Row */}
          <div className="datetime-row">
            <div className="date-picker-wrapper">
              <button 
                className="datetime-box"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar size={18} />
                <span>{formatDate(selectedDateForm)}</span>
              </button>
              {showDatePicker && (
                <div className="date-picker-dropdown">
                  {generateDateOptions().map((date) => (
                    <button
                      key={date.toISOString()}
                      className="date-option"
                      onClick={() => {
                        setSelectedDateForm(date);
                        setShowDatePicker(false);
                      }}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="divider-vertical" />
            
            <div className="time-box">
              <Clock size={18} />
              <input
                type="time"
                className="time-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="time-box">
              <Clock size={18} />
              <input
                type="time"
                className="time-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Exercises Section */}
          <div className="exercises-section">
            <h3 className="section-title">Exercises</h3>
            
            {/* Exercise Cards */}
            {exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-card-header">
                  <h4 className="exercise-name">{exercise.name}</h4>
                  <div className="exercise-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditExercise(exercise)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteExercise(exercise.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="exercise-description">{exercise.description}</p>
              </div>
            ))}

            {/* Add Exercise Form */}
            {isAddingExercise ? (
              <div className="add-exercise-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Exercise name"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                />
                <textarea
                  className="form-textarea"
                  placeholder="Exercise description"
                  value={currentExercise.description}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                  rows={3}
                />
                <div className="exercise-form-actions">
                  <button className="cancel-exercise-btn" onClick={handleCancelExercise}>
                    Cancel
                  </button>
                  <button 
                    className="add-exercise-btn"
                    onClick={editingExerciseId ? handleUpdateExercise : handleAddExercise}
                  >
                    {editingExerciseId ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="add-exercise-dashed-btn"
                onClick={() => setIsAddingExercise(true)}
              >
                <Plus size={18} />
                <span>Add Exercise</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="cancel-btn" onClick={handleCloseSidebar}>
            Cancel
          </button>
          <button 
            className="create-btn"
            onClick={handleCreateSession}
            disabled={!sessionName.trim()}
          >
            Create Session
          </button>
        </div>
      </div>
    </>
  );
}




