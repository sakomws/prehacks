import { useState, useEffect } from 'react';
import { 
  CalendarEvent, 
  MentorSchedule, 
  TimeOffPeriod, 
  CalendarStats, 
  Mentor, 
  AvailabilitySlot 
} from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const CalendarAndScheduleManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "schedule">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [mentorSchedules, setMentorSchedules] = useState<MentorSchedule[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [calendarStats, setCalendarStats] = useState<CalendarStats>({
    total_sessions_today: 0,
    total_sessions_week: 0,
    active_mentors: 0,
    upcoming_sessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showScheduleSessionModal, setShowScheduleSessionModal] = useState(false);
  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOffPeriod[]>([]);

  useEffect(() => {
    fetchMentors();
    if (activeSubTab === "calendar") {
      fetchCalendarData();
      fetchCalendarStats();
    } else {
      fetchMentorSchedules();
    }
  }, [activeSubTab, currentDate, viewMode]);

  const fetchMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors?status=active`);
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
        if (data.length > 0 && !selectedMentor) {
          setSelectedMentor(data[0]);
        }
      } else {
        throw new Error('Failed to fetch mentors');
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      showErrorAlert('fetch mentors', error);
      setMentors([]);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const response = await fetch(
        `${API_URL}/api/admin/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data);
      } else {
        throw new Error('Failed to fetch calendar data');
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      showErrorAlert('fetch calendar events', error);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/calendar/stats`);
      if (response.ok) {
        const data = await response.json();
        setCalendarStats(data);
      } else {
        throw new Error('Failed to fetch calendar stats');
      }
    } catch (error) {
      console.error("Error fetching calendar stats:", error);
      showErrorAlert('fetch calendar statistics', error);
      setCalendarStats({
        total_sessions_today: 0,
        total_sessions_week: 0,
        active_mentors: 0,
        upcoming_sessions: 0
      });
    }
  };

  const fetchMentorSchedules = async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const response = await fetch(
        `${API_URL}/api/admin/schedule/mentors?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMentorSchedules(data);
      } else {
        throw new Error('Failed to fetch mentor schedules');
      }
    } catch (error) {
      console.error("Error fetching mentor schedules:", error);
      showErrorAlert('fetch mentor schedules', error);
      setMentorSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeOffPeriods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/time-off`);
      if (response.ok) {
        const data = await response.json();
        setTimeOffPeriods(data);
      } else {
        throw new Error('Failed to fetch time-off periods');
      }
    } catch (error) {
      console.error("Error fetching time-off periods:", error);
      showErrorAlert('fetch time-off periods', error);
      setTimeOffPeriods([]);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case "month":
        return new Date(date.getFullYear(), date.getMonth(), 1);
      case "week":
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
      case "day":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      default:
        return date;
    }
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case "month":
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case "week":
        const startOfWeek = getViewStartDate();
        return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
      case "day":
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      default:
        return date;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case "day":
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };

  const formatDate = (date: Date) => {
    switch (viewMode) {
      case "month":
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case "week":
        const endOfWeek = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case "day":
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading calendar..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📆 Calendar Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScheduleSessionModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Schedule Session
          </button>
          <button
            onClick={() => setShowTimeOffModal(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Manage Time Off
          </button>
          <button
            onClick={() => {
              const data = activeSubTab === "calendar" ? calendarEvents : mentorSchedules;
              exportToCSV(data, activeSubTab === "calendar" ? 'calendar_events' : 'mentor_schedules');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSubTab("calendar")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "calendar"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            📅 Calendar Overview
          </button>
          <button
            onClick={() => setActiveSubTab("schedule")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "schedule"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            🗓️ Mentor Schedules
          </button>
        </div>
      </div>

      {/* Calendar Overview Tab */}
      {activeSubTab === "calendar" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{calendarStats.total_sessions_today}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{calendarStats.total_sessions_week}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Mentors</p>
                  <p className="text-2xl font-bold text-gray-900">{calendarStats.active_mentors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{calendarStats.upcoming_sessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ← Previous
                </button>
                <h3 className="text-xl font-bold">{formatDate(getViewStartDate())}</h3>
                <button
                  onClick={() => navigateDate('next')}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Next →
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Today
                </button>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as "month" | "week" | "day")}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Sessions & Events</h3>
            <div className="space-y-4">
              {calendarEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        event.type === 'session' ? 'bg-blue-500' :
                        event.type === 'availability' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.mentor_name && (
                          <p className="text-sm text-gray-600">
                            Mentor: {event.mentor_name}
                            {event.student_name && ` • Student: ${event.student_name}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {event.status && (
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {calendarEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No events scheduled for this period</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mentor Schedules Tab */}
      {activeSubTab === "schedule" && (
        <>
          {/* Mentor Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-600">Select Mentor:</label>
                <select
                  value={selectedMentor?.id || ""}
                  onChange={(e) => {
                    const mentor = mentors.find(m => m.id === parseInt(e.target.value));
                    setSelectedMentor(mentor || null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name} - {mentor.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMentor && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAvailabilityModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Manage Availability
                  </button>
                  <button
                    onClick={() => {
                      fetchTimeOffPeriods();
                      setShowTimeOffModal(true);
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Time Off
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Individual Mentor Schedule */}
          {selectedMentor && (
            <div className="space-y-6">
              {mentorSchedules
                .filter(schedule => schedule.mentor_id === selectedMentor.id)
                .map((schedule) => (
                <MentorScheduleView 
                  key={schedule.mentor_id} 
                  schedule={schedule} 
                  viewMode={viewMode}
                  currentDate={currentDate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showTimeOffModal && (
        <TimeOffModal 
          mentors={mentors}
          timeOffPeriods={timeOffPeriods}
          onClose={() => setShowTimeOffModal(false)}
          onUpdate={() => {
            fetchTimeOffPeriods();
            fetchMentorSchedules();
          }}
        />
      )}

      {showAvailabilityModal && selectedMentor && (
        <AvailabilityModal 
          mentor={selectedMentor}
          onClose={() => setShowAvailabilityModal(false)}
          onUpdate={fetchMentorSchedules}
        />
      )}

      {showScheduleSessionModal && (
        <ScheduleSessionModal 
          mentors={mentors}
          onClose={() => setShowScheduleSessionModal(false)}
          onUpdate={() => {
            fetchCalendarData();
            fetchMentorSchedules();
          }}
        />
      )}
    </div>
  );
};

// Individual Mentor Schedule Component
const MentorScheduleView = ({ 
  schedule, 
  viewMode, 
  currentDate 
}: { 
  schedule: MentorSchedule; 
  viewMode: string; 
  currentDate: Date; 
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">{schedule.mentor_name}</h3>
          <p className="text-gray-600">{schedule.mentor_title}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{schedule.sessions.length}</div>
          <div className="text-sm text-gray-600">Sessions This Period</div>
        </div>
      </div>

      {/* Weekly Availability Overview */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Weekly Availability</h4>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day, index) => {
            const daySlots = schedule.availability_slots.filter(slot => slot.day_of_week === index);
            return (
              <div key={index} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-2">{day.slice(0, 3)}</div>
                {daySlots.length > 0 ? (
                  <div className="space-y-1">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {slot.start_time}-{slot.end_time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No availability</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Sessions */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Scheduled Sessions</h4>
        {schedule.sessions.length > 0 ? (
          <div className="space-y-3">
            {schedule.sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div>
                  <p className="font-semibold">{session.title}</p>
                  <p className="text-sm text-gray-600">with {session.student_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-sm ${
                    STATUS_COLORS[session.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
                  }`}>
                    {session.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">${session.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <div className="text-2xl mb-2">📅</div>
            <p>No sessions scheduled</p>
          </div>
        )}
      </div>

      {/* Time Off Periods */}
      {schedule.time_off_periods.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Time Off</h4>
          <div className="space-y-2">
            {schedule.time_off_periods.map((timeOff) => (
              <div key={timeOff.id} className="p-3 bg-red-50 rounded">
                <p className="font-semibold text-red-700">{timeOff.reason}</p>
                <p className="text-sm text-red-600">
                  {new Date(timeOff.start_date).toLocaleDateString()} - {new Date(timeOff.end_date).toLocaleDateString()}
                </p>
                {timeOff.notes && (
                  <p className="text-sm text-red-600 mt-1">{timeOff.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Time Off Management Modal
const TimeOffModal = ({ 
  mentors, 
  timeOffPeriods, 
  onClose, 
  onUpdate 
}: { 
  mentors: Mentor[]; 
  timeOffPeriods: TimeOffPeriod[]; 
  onClose: () => void; 
  onUpdate: () => void; 
}) => {
  const [newTimeOff, setNewTimeOff] = useState({
    mentor_id: mentors[0]?.id || 0,
    start_date: "",
    end_date: "",
    reason: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/time-off`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimeOff)
      });

      if (response.ok) {
        showToast("Time off period added successfully!", 'success');
        onUpdate();
        setNewTimeOff({
          mentor_id: mentors[0]?.id || 0,
          start_date: "",
          end_date: "",
          reason: "",
          notes: ""
        });
      } else {
        throw new Error('Failed to add time off period');
      }
    } catch (error) {
      showErrorAlert('add time off period', error);
    } finally {
      setLoading(false);
    }
  };

  const approveTimeOff = async (timeOffId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/time-off/${timeOffId}/approve`, {
        method: 'PUT'
      });

      if (response.ok) {
        showToast("Time off approved!", 'success');
        onUpdate();
      } else {
        throw new Error('Failed to approve time off');
      }
    } catch (error) {
      showErrorAlert('approve time off', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🏖️ Time Off & Holiday Management</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Add New Time Off */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Add Time Off Period</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mentor</label>
                  <select
                    value={newTimeOff.mentor_id}
                    onChange={(e) => setNewTimeOff({...newTimeOff, mentor_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    {mentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <input
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Vacation, Sick Leave, Holiday"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTimeOff.start_date}
                    onChange={(e) => setNewTimeOff({...newTimeOff, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTimeOff.end_date}
                    onChange={(e) => setNewTimeOff({...newTimeOff, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={newTimeOff.notes}
                  onChange={(e) => setNewTimeOff({...newTimeOff, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                  placeholder="Additional notes..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Time Off"}
              </button>
            </form>
          </div>

          {/* Existing Time Off Periods */}
          <div>
            <h3 className="text-lg font-bold mb-4">Current Time Off Periods</h3>
            {timeOffPeriods.length > 0 ? (
              <div className="space-y-4">
                {timeOffPeriods.map((timeOff) => {
                  const mentor = mentors.find(m => m.id === timeOff.mentor_id);
                  return (
                    <div key={timeOff.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{timeOff.reason}</h4>
                          <p className="text-sm text-gray-600">
                            {mentor?.name} • {new Date(timeOff.start_date).toLocaleDateString()} - {new Date(timeOff.end_date).toLocaleDateString()}
                          </p>
                          {timeOff.notes && (
                            <p className="text-sm text-gray-500 mt-1">{timeOff.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            timeOff.status === 'approved' ? 'bg-green-100 text-green-700' :
                            timeOff.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {timeOff.status}
                          </span>
                          {timeOff.status === 'pending' && (
                            <button
                              onClick={() => approveTimeOff(timeOff.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏖️</div>
                <p>No time off periods scheduled</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Availability Management Modal (reusing from MentorsAndApplicationsManager)
const AvailabilityModal = ({ mentor, onClose, onUpdate }: { 
  mentor: Mentor; 
  onClose: () => void; 
  onUpdate: () => void; 
}) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    timezone: "UTC"
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/${mentor.id}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability_slots || []);
      } else {
        throw new Error('Failed to fetch availability');
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      showErrorAlert('fetch mentor availability', error);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/${mentor.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });

      if (response.ok) {
        showToast("Availability slot added successfully!", 'success');
        fetchAvailability();
        onUpdate();
        setNewSlot({ day_of_week: 1, start_time: "09:00", end_time: "17:00", timezone: "UTC" });
      } else {
        throw new Error('Failed to add availability slot');
      }
    } catch (error) {
      showErrorAlert('add availability slot', error);
    }
  };

  const removeAvailabilitySlot = async (slotId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/${mentor.id}/availability/${slotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast("Availability slot removed successfully!", 'success');
        fetchAvailability();
        onUpdate();
      } else {
        throw new Error('Failed to remove availability slot');
      }
    } catch (error) {
      showErrorAlert('remove availability slot', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🕒 Manage Availability - {mentor.name}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Add New Availability Slot */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Add Availability Slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Day</label>
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({...newSlot, day_of_week: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addAvailabilitySlot}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Add Slot
                </button>
              </div>
            </div>
          </div>

          {/* Current Availability */}
          <div>
            <h3 className="text-lg font-bold mb-4">Current Availability</h3>
            {loading ? (
              <LoadingSpinner message="Loading availability..." />
            ) : (
              <div className="space-y-4">
                {dayNames.map((dayName, dayIndex) => {
                  const daySlots = availability.filter(slot => slot.day_of_week === dayIndex);
                  return (
                    <div key={dayIndex} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{dayName}</h4>
                      {daySlots.length > 0 ? (
                        <div className="space-y-2">
                          {daySlots.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between bg-green-50 p-3 rounded">
                              <span className="font-medium">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <button
                                onClick={() => removeAvailabilitySlot(slot.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No availability set</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Session Modal
const ScheduleSessionModal = ({ 
  mentors, 
  onClose, 
  onUpdate 
}: { 
  mentors: Mentor[]; 
  onClose: () => void; 
  onUpdate: () => void; 
}) => {
  const [sessionData, setSessionData] = useState({
    mentor_id: mentors[0]?.id || 0,
    student_email: "",
    title: "",
    scheduled_at: "",
    duration_minutes: 60,
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        showToast("Session scheduled successfully!", 'success');
        onUpdate();
        onClose();
      } else {
        throw new Error('Failed to schedule session');
      }
    } catch (error) {
      showErrorAlert('schedule session', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📅 Schedule New Session</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mentor *</label>
              <select
                value={sessionData.mentor_id}
                onChange={(e) => setSessionData({...sessionData, mentor_id: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                {mentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name} - {mentor.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Student Email *</label>
              <input
                type="email"
                value={sessionData.student_email}
                onChange={(e) => setSessionData({...sessionData, student_email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="student@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Session Title *</label>
            <input
              type="text"
              value={sessionData.title}
              onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Career Guidance Session"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                value={sessionData.scheduled_at}
                onChange={(e) => setSessionData({...sessionData, scheduled_at: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
              <select
                value={sessionData.duration_minutes}
                onChange={(e) => setSessionData({...sessionData, duration_minutes: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={sessionData.notes}
              onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Additional notes for the session..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
            >
              {loading ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};