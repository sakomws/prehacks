import { useState, useEffect } from 'react';
import { Session, GiftSession, SessionAnalytics, MentorPerformance } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const SessionsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'gift-sessions' | 'analytics' | 'mentor-performance'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [giftSessions, setGiftSessions] = useState<GiftSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [mentorPerformance, setMentorPerformance] = useState<MentorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("30");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedGiftSession, setSelectedGiftSession] = useState<GiftSession | null>(null);

  useEffect(() => {
    if (activeSubTab === 'sessions') {
      fetchSessions();
    } else if (activeSubTab === 'gift-sessions') {
      fetchGiftSessions();
    } else if (activeSubTab === 'analytics') {
      fetchSessionsAnalytics();
    } else if (activeSubTab === 'mentor-performance') {
      fetchMentorPerformance();
    }
  }, [activeSubTab, filter, dateFilter]);

  const fetchSessions = async () => {
    try {
      let url = `${API_URL}/api/admin/sessions`;
      const params = new URLSearchParams();
      
      if (filter !== "all") {
        params.append("status", filter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      showErrorAlert('fetch sessions', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftSessions = async () => {
    try {
      let url = `${API_URL}/api/admin/gift-sessions`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGiftSessions(data.gift_sessions);
      } else {
        throw new Error('Failed to fetch gift sessions');
      }
    } catch (error) {
      console.error("Error fetching gift sessions:", error);
      showErrorAlert('fetch gift sessions', error);
      setGiftSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sessions/analytics/overview?days=${dateFilter}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showErrorAlert('fetch analytics', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorPerformance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/performance?days=${dateFilter}`);
      if (response.ok) {
        const data = await response.json();
        setMentorPerformance(data.mentors);
      } else {
        throw new Error('Failed to fetch mentor performance');
      }
    } catch (error) {
      console.error("Error fetching mentor performance:", error);
      showErrorAlert('fetch mentor performance', error);
      setMentorPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        showToast(`Session ${status} successfully!`, 'success');
        fetchSessions();
      } else {
        throw new Error(`Failed to update session status`);
      }
    } catch (error) {
      showErrorAlert('update session status', error);
    }
  };

  const updatePaymentStatus = async (sessionId: number, paymentStatus: string, notes?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sessions/${sessionId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus, payment_notes: notes })
      });

      if (response.ok) {
        showToast(`Payment status updated to ${paymentStatus}!`, 'success');
        fetchSessions();
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      showErrorAlert('update payment status', error);
    }
  };

  const createGiftSession = async (giftData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/gift-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftData)
      });

      if (response.ok) {
        showToast("Gift session created successfully!", 'success');
        fetchGiftSessions();
        setShowGiftModal(false);
      } else {
        throw new Error('Failed to create gift session');
      }
    } catch (error) {
      showErrorAlert('create gift session', error);
    }
  };

  const redeemGiftSession = async (giftSessionId: number, redeemData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/gift-sessions/${giftSessionId}/redeem`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redeemData)
      });

      if (response.ok) {
        showToast("Gift session redeemed successfully!", 'success');
        fetchGiftSessions();
        setShowRedeemModal(false);
        setSelectedGiftSession(null);
      } else {
        throw new Error('Failed to redeem gift session');
      }
    } catch (error) {
      showErrorAlert('redeem gift session', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      scheduled: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-gray-100 text-gray-700',
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
      redeemed: 'bg-green-100 text-green-700',
      active: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getSessionTypeIcon = (isGiftSession: boolean) => {
    return isGiftSession ? '🎁' : '💼';
  };

  if (loading) {
    return <LoadingSpinner message="Loading sessions management..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">💼 Sessions Management</h2>
        <div className="flex space-x-2">
          {activeSubTab === 'gift-sessions' && (
            <button
              onClick={() => setShowGiftModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Create Gift Session
            </button>
          )}
          <button
            onClick={() => {
              if (activeSubTab === 'sessions') {
                exportToCSV(sessions.map(session => ({
                  id: session.id,
                  title: session.title,
                  student_name: session.student_name,
                  mentor_name: session.mentor_name,
                  status: session.status,
                  payment_status: session.payment_status,
                  price: session.price,
                  duration_hours: session.duration_hours,
                  scheduled_at: session.scheduled_at,
                  completed_at: session.completed_at,
                  revenue: session.revenue
                })), 'sessions_data');
              } else if (activeSubTab === 'gift-sessions') {
                exportToCSV(giftSessions.map(gift => ({
                  id: gift.id,
                  purchaser_name: gift.purchaser_name,
                  recipient_name: gift.recipient_name,
                  amount: gift.amount,
                  status: gift.status,
                  created_at: gift.created_at,
                  redeemed_at: gift.redeemed_at,
                  expires_at: gift.expires_at
                })), 'gift_sessions_data');
              } else if (activeSubTab === 'mentor-performance') {
                exportToCSV(mentorPerformance.map(mentor => ({
                  mentor_name: mentor.mentor_name,
                  total_sessions: mentor.total_sessions,
                  completed_sessions: mentor.completed_sessions,
                  completion_rate: mentor.completion_rate,
                  total_revenue: mentor.total_revenue,
                  avg_rating: mentor.avg_rating,
                  hourly_rate: mentor.hourly_rate
                })), 'mentor_performance_data');
              }
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
            onClick={() => setActiveSubTab('sessions')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'sessions'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            💼 Sessions
          </button>
          <button
            onClick={() => setActiveSubTab('gift-sessions')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'gift-sessions'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            🎁 Gift Sessions
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'analytics'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveSubTab('mentor-performance')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'mentor-performance'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            🏆 Mentor Performance
          </button>
        </div>
      </div>

      {/* Sessions Tab */}
      {activeSubTab === 'sessions' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Sessions</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>

          {/* Sessions List */}
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      {getSessionTypeIcon(session.is_gift_session)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{session.title}</h3>
                      <p className="text-gray-600">
                        {session.student_name} → {session.mentor_name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.duration_hours}h session • ${session.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.payment_status)}`}>
                      {session.payment_status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Scheduled</p>
                    <p className="font-semibold">
                      {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Duration</p>
                    <p className="font-semibold">{session.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Revenue</p>
                    <p className="font-semibold text-green-600">${session.revenue}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Created</p>
                    <p className="font-semibold">{new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {session.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{session.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowSessionModal(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    {session.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => updateSessionStatus(session.id, 'in_progress')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                        >
                          Start Session
                        </button>
                        <button
                          onClick={() => updateSessionStatus(session.id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {session.status === 'in_progress' && (
                      <button
                        onClick={() => updateSessionStatus(session.id, 'completed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Complete
                      </button>
                    )}
                    {session.payment_status === 'pending' && (
                      <>
                        <button
                          onClick={() => updatePaymentStatus(session.id, 'paid')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(session.id, 'failed')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Mark Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Sessions Found</h3>
                <p className="text-gray-600">
                  {filter === "all" ? "No sessions have been created yet." : `No ${filter} sessions found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Sessions Tab */}
      {activeSubTab === 'gift-sessions' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Gift Sessions</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Gift Sessions List */}
          <div className="grid gap-4">
            {giftSessions.map((giftSession) => (
              <div key={giftSession.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      🎁
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Gift Session - ${giftSession.amount}</h3>
                      <p className="text-gray-600">
                        From: {giftSession.purchaser_name} ({giftSession.purchaser_email})
                      </p>
                      <p className="text-gray-600">
                        To: {giftSession.recipient_name} ({giftSession.recipient_email})
                      </p>
                      {giftSession.message && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{giftSession.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(giftSession.status)}`}>
                      {giftSession.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Created</p>
                    <p className="font-semibold">{new Date(giftSession.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Expires</p>
                    <p className="font-semibold">
                      {giftSession.expires_at ? new Date(giftSession.expires_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Redeemed</p>
                    <p className="font-semibold">
                      {giftSession.redeemed_at ? new Date(giftSession.redeemed_at).toLocaleDateString() : 'Not yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Session</p>
                    <p className="font-semibold">
                      {giftSession.session_title || 'Not scheduled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex space-x-2">
                    {giftSession.status === 'active' && (
                      <button
                        onClick={() => {
                          setSelectedGiftSession(giftSession);
                          setShowRedeemModal(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Redeem Gift
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {giftSessions.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Gift Sessions Found</h3>
                <p className="text-gray-600 mb-4">
                  {filter === "all" ? "No gift sessions have been created yet." : `No ${filter} gift sessions found.`}
                </p>
                <button
                  onClick={() => setShowGiftModal(true)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
                >
                  Create Gift Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === 'analytics' && analytics && (
        <div>
          {/* Date Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.total_sessions}</div>
              <div className="text-sm text-blue-600">Total Sessions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.completed_sessions}</div>
              <div className="text-sm text-green-600">Completed Sessions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.completion_rate}%</div>
              <div className="text-sm text-purple-600">Completion Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">${analytics.total_revenue}</div>
              <div className="text-sm text-orange-600">Total Revenue</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">${analytics.pending_revenue}</div>
              <div className="text-sm text-yellow-600">Pending Revenue</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600">${analytics.avg_session_price}</div>
              <div className="text-sm text-indigo-600">Avg Session Price</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-2xl font-bold text-teal-600">{analytics.status_breakdown.cancelled}</div>
              <div className="text-sm text-teal-600">Cancelled Sessions</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Sessions by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analytics.status_breakdown).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Daily Sessions Trend</h3>
            <div className="space-y-2">
              {analytics.daily_trend.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(day.sessions / Math.max(...analytics.daily_trend.map(d => d.sessions))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{day.sessions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mentor Performance Tab */}
      {activeSubTab === 'mentor-performance' && (
        <div>
          {/* Date Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          {/* Mentor Performance List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mentor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hourly Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mentorPerformance.map((mentor) => (
                    <tr key={mentor.mentor_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mentor.mentor_name}</div>
                          <div className="text-sm text-gray-500">{mentor.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mentor.total_sessions}</div>
                        <div className="text-xs text-gray-500">
                          {mentor.completed_sessions} completed
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${mentor.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{mentor.completion_rate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">${mentor.total_revenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{mentor.avg_rating}</span>
                          <span className="text-yellow-400 ml-1">⭐</span>
                          <span className="text-xs text-gray-500 ml-1">({mentor.total_ratings})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${mentor.hourly_rate}/hr</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mentorPerformance.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏆</div>
                <p>No mentor performance data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showSessionModal && selectedSession && (
        <SessionDetailsModal 
          session={selectedSession}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSession(null);
          }}
          onUpdateStatus={updateSessionStatus}
          onUpdatePayment={updatePaymentStatus}
        />
      )}

      {showGiftModal && (
        <GiftSessionFormModal 
          onClose={() => setShowGiftModal(false)}
          onSubmit={createGiftSession}
        />
      )}

      {showRedeemModal && selectedGiftSession && (
        <RedeemGiftModal 
          giftSession={selectedGiftSession}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedGiftSession(null);
          }}
          onRedeem={redeemGiftSession}
        />
      )}
    </div>
  );
};

// Session Details Modal Component
const SessionDetailsModal = ({ 
  session, 
  onClose, 
  onUpdateStatus, 
  onUpdatePayment 
}: { 
  session: Session; 
  onClose: () => void; 
  onUpdateStatus: (sessionId: number, status: string, notes?: string) => void; 
  onUpdatePayment: (sessionId: number, paymentStatus: string, notes?: string) => void; 
}) => {
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">💼 {session.title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold mb-2">Session Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Student:</span> {session.student_name}</p>
                <p><span className="font-medium">Mentor:</span> {session.mentor_name}</p>
                <p><span className="font-medium">Duration:</span> {session.duration_minutes} minutes</p>
                <p><span className="font-medium">Price:</span> ${session.price}</p>
                <p><span className="font-medium">Status:</span> {session.status}</p>
                <p><span className="font-medium">Payment:</span> {session.payment_status}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Timing</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Created:</span> {new Date(session.created_at).toLocaleString()}</p>
                <p><span className="font-medium">Scheduled:</span> {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'Not scheduled'}</p>
                <p><span className="font-medium">Completed:</span> {session.completed_at ? new Date(session.completed_at).toLocaleString() : 'Not completed'}</p>
              </div>
            </div>
          </div>

          {session.notes && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Notes</h3>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {session.notes}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold mb-2">Add Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
              placeholder="Add notes about this session..."
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdateStatus(session.id, e.target.value, notes);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Update Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdatePayment(session.id, e.target.value, notes);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Update Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
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

// Gift Session Form Modal Component
const GiftSessionFormModal = ({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) => {
  const [formData, setFormData] = useState({
    purchaser_name: '',
    purchaser_email: '',
    recipient_name: '',
    recipient_email: '',
    message: '',
    amount: '',
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        expires_at: formData.expires_at || null
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🎁 Create Gift Session</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Purchaser Name *</label>
              <input
                type="text"
                required
                value={formData.purchaser_name}
                onChange={(e) => setFormData({...formData, purchaser_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Purchaser Email *</label>
              <input
                type="email"
                required
                value={formData.purchaser_email}
                onChange={(e) => setFormData({...formData, purchaser_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name *</label>
              <input
                type="text"
                required
                value={formData.recipient_name}
                onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email *</label>
              <input
                type="email"
                required
                value={formData.recipient_email}
                onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gift Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
              placeholder="Optional message for the recipient..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expires At</label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for 1 year expiration</p>
            </div>
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
              {loading ? "Creating..." : "Create Gift Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Redeem Gift Modal Component
const RedeemGiftModal = ({ 
  giftSession, 
  onClose, 
  onRedeem 
}: { 
  giftSession: GiftSession; 
  onClose: () => void; 
  onRedeem: (giftSessionId: number, data: any) => void; 
}) => {
  const [formData, setFormData] = useState({
    title: 'Gift Session',
    description: '',
    student_id: '',
    mentor_id: '',
    scheduled_at: '',
    duration_minutes: '60'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        mentor_id: parseInt(formData.mentor_id),
        duration_minutes: parseInt(formData.duration_minutes)
      };
      
      await onRedeem(giftSession.id, submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🎁 Redeem Gift Session</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
          <p className="text-green-100 mt-2">
            ${giftSession.amount} gift from {giftSession.purchaser_name}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Session Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
              placeholder="Session description..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student ID *</label>
              <input
                type="number"
                required
                value={formData.student_id}
                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter student user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mentor ID *</label>
              <input
                type="number"
                required
                value={formData.mentor_id}
                onChange={(e) => setFormData({...formData, mentor_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter mentor ID"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Scheduled At</label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Gift Details</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p><span className="font-medium">From:</span> {giftSession.purchaser_name}</p>
              <p><span className="font-medium">To:</span> {giftSession.recipient_name}</p>
              <p><span className="font-medium">Amount:</span> ${giftSession.amount}</p>
              {giftSession.message && (
                <p><span className="font-medium">Message:</span> "{giftSession.message}"</p>
              )}
            </div>
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
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
            >
              {loading ? "Redeeming..." : "Redeem Gift Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};