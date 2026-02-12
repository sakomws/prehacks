import { useState, useEffect } from 'react';
import { Mentee, MenteeAnalytics, MenteeProgress, GiftSession, RevenueAnalytics } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const MenteesManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'mentees' | 'sessions' | 'gifts' | 'analytics'>('mentees');
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [menteeAnalytics, setMenteeAnalytics] = useState<MenteeAnalytics | null>(null);
  const [menteeProgress, setMenteeProgress] = useState<MenteeProgress | null>(null);
  const [giftSessions, setGiftSessions] = useState<GiftSession[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAddMenteeModal, setShowAddMenteeModal] = useState(false);
  const [showEditMenteeModal, setShowEditMenteeModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'mentees') {
      fetchMentees();
    } else if (activeSubTab === 'sessions') {
      fetchMentees(); // Still need mentees for session management
    } else if (activeSubTab === 'gifts') {
      fetchGiftSessions();
    } else if (activeSubTab === 'analytics') {
      fetchRevenueAnalytics();
    }
  }, [activeSubTab, filter]);

  const fetchMentees = async () => {
    try {
      let url = `${API_URL}/api/admin/mentees`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMentees(data);
      } else {
        throw new Error('Failed to fetch mentees');
      }
    } catch (error) {
      console.error("Error fetching mentees:", error);
      showErrorAlert('fetch mentees', error);
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenteeAnalytics = async (menteeId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${menteeId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setMenteeAnalytics(data);
        setShowAnalyticsModal(true);
      } else {
        throw new Error('Failed to fetch mentee analytics');
      }
    } catch (error) {
      console.error("Error fetching mentee analytics:", error);
      showErrorAlert('fetch mentee analytics', error);
    }
  };

  const fetchMenteeProgress = async (menteeId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${menteeId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setMenteeProgress(data);
        setShowProgressModal(true);
      } else {
        throw new Error('Failed to fetch mentee progress');
      }
    } catch (error) {
      console.error("Error fetching mentee progress:", error);
      showErrorAlert('fetch mentee progress', error);
    }
  };

  const fetchGiftSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/gifts`);
      if (response.ok) {
        const data = await response.json();
        setGiftSessions(data);
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

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/revenue/analytics`);
      if (response.ok) {
        const data = await response.json();
        setRevenueAnalytics(data);
      } else {
        throw new Error('Failed to fetch revenue analytics');
      }
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      showErrorAlert('fetch revenue analytics', error);
      setRevenueAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const createMentee = async (menteeData: Omit<Mentee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menteeData)
      });

      if (response.ok) {
        showToast("Mentee created successfully!", 'success');
        fetchMentees();
        setShowAddMenteeModal(false);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to create mentee');
      }
    } catch (error) {
      showErrorAlert('create mentee', error);
    }
  };

  const updateMentee = async (menteeId: number, menteeData: Partial<Mentee>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${menteeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menteeData)
      });

      if (response.ok) {
        showToast("Mentee updated successfully!", 'success');
        fetchMentees();
        setShowEditMenteeModal(false);
        setSelectedMentee(null);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to update mentee');
      }
    } catch (error) {
      showErrorAlert('update mentee', error);
    }
  };

  const updateMenteeStatus = async (menteeId: number, status: Mentee['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${menteeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Mentee ${status} successfully!`, 'success');
        fetchMentees();
      } else {
        throw new Error(`Failed to ${status} mentee`);
      }
    } catch (error) {
      showErrorAlert(`${status} mentee`, error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
      beginner: 'bg-blue-100 text-blue-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-purple-100 text-purple-700',
      redeemed: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getExperienceIcon = (level: string) => {
    const icons = {
      beginner: '🌱',
      intermediate: '🌿',
      advanced: '🌳'
    };
    return icons[level as keyof typeof icons] || '👤';
  };

  if (loading) {
    return <LoadingSpinner message="Loading mentees management..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">👥 Mentees Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddMenteeModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Add Mentee
          </button>
          <button
            onClick={() => {
              if (activeSubTab === 'mentees') {
                exportToCSV(mentees.map(mentee => ({
                  id: mentee.id,
                  name: mentee.name,
                  email: mentee.email,
                  status: mentee.status,
                  experience_level: mentee.experience_level,
                  total_sessions: mentee.total_sessions,
                  total_spent: mentee.total_spent,
                  created_at: mentee.created_at
                })), 'mentees_data');
              } else if (activeSubTab === 'gifts') {
                exportToCSV(giftSessions.map(gift => ({
                  gift_code: gift.gift_code,
                  recipient_name: gift.recipient_name,
                  sender_name: gift.sender_name,
                  status: gift.status,
                  value: gift.value,
                  purchased_at: gift.purchased_at
                })), 'gift_sessions_data');
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
            onClick={() => setActiveSubTab('mentees')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'mentees'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            👥 Mentees
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'sessions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📅 Sessions
          </button>
          <button
            onClick={() => setActiveSubTab('gifts')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'gifts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            🎁 Gift Sessions
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'analytics'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📊 Revenue Analytics
          </button>
        </div>
      </div>

      {/* Mentees Tab */}
      {activeSubTab === 'mentees' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Mentees</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Mentees List */}
          <div className="grid gap-6">
            {mentees.map((mentee) => (
              <div key={mentee.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                      {getExperienceIcon(mentee.experience_level)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{mentee.name}</h3>
                      <p className="text-gray-600">{mentee.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {mentee.occupation} {mentee.company && `at ${mentee.company}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mentee.status)}`}>
                      {mentee.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mentee.experience_level)}`}>
                      {mentee.experience_level}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total Sessions</p>
                    <p className="font-semibold text-lg">{mentee.total_sessions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Completed</p>
                    <p className="font-semibold text-lg">{mentee.completed_sessions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Spent</p>
                    <p className="font-semibold text-lg">${mentee.total_spent}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Avg Rating Given</p>
                    <p className="font-semibold text-lg">
                      {mentee.avg_rating_given > 0 ? `⭐ ${mentee.avg_rating_given.toFixed(1)}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {mentee.goals && mentee.goals.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {mentee.goals.slice(0, 3).map((goal, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                      {mentee.goals.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          +{mentee.goals.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(mentee.created_at).toLocaleDateString()}
                    {mentee.last_session_date && (
                      <span className="ml-4">
                        Last session: {new Date(mentee.last_session_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMentee(mentee);
                        setShowEditMenteeModal(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => fetchMenteeProgress(mentee.id)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                    >
                      View Progress
                    </button>
                    <button
                      onClick={() => fetchMenteeAnalytics(mentee.id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                    >
                      Analytics
                    </button>
                    {mentee.status === 'active' && (
                      <button
                        onClick={() => updateMenteeStatus(mentee.id, 'inactive')}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                      >
                        Deactivate
                      </button>
                    )}
                    {mentee.status === 'inactive' && (
                      <button
                        onClick={() => updateMenteeStatus(mentee.id, 'active')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {mentees.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentees Found</h3>
                <p className="text-gray-600 mb-4">
                  {filter === "all" ? "No mentees have been added yet." : `No ${filter} mentees found.`}
                </p>
                <button
                  onClick={() => setShowAddMenteeModal(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Add Your First Mentee
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeSubTab === 'sessions' && (
        <SessionsManagement mentees={mentees} />
      )}

      {/* Gift Sessions Tab */}
      {activeSubTab === 'gifts' && (
        <GiftSessionsManagement giftSessions={giftSessions} />
      )}

      {/* Revenue Analytics Tab */}
      {activeSubTab === 'analytics' && revenueAnalytics && (
        <RevenueAnalyticsView analytics={revenueAnalytics} />
      )}

      {/* Modals */}
      {showAddMenteeModal && (
        <MenteeFormModal 
          onClose={() => setShowAddMenteeModal(false)}
          onSubmit={createMentee}
          title="Add New Mentee"
        />
      )}

      {showEditMenteeModal && selectedMentee && (
        <MenteeFormModal 
          mentee={selectedMentee}
          onClose={() => {
            setShowEditMenteeModal(false);
            setSelectedMentee(null);
          }}
          onSubmit={(data) => updateMentee(selectedMentee.id, data)}
          title="Edit Mentee Profile"
        />
      )}

      {showAnalyticsModal && selectedMentee && menteeAnalytics && (
        <MenteeAnalyticsModal 
          mentee={selectedMentee}
          analytics={menteeAnalytics}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedMentee(null);
            setMenteeAnalytics(null);
          }}
        />
      )}

      {showProgressModal && selectedMentee && menteeProgress && (
        <MenteeProgressModal 
          mentee={selectedMentee}
          progress={menteeProgress}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedMentee(null);
            setMenteeProgress(null);
          }}
        />
      )}
    </div>
  );
};

// Mentee Form Modal Component
const MenteeFormModal = ({ 
  mentee, 
  onClose, 
  onSubmit, 
  title 
}: { 
  mentee?: Mentee; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  title: string; 
}) => {
  const [formData, setFormData] = useState({
    name: mentee?.name || '',
    email: mentee?.email || '',
    phone: mentee?.phone || '',
    date_of_birth: mentee?.date_of_birth || '',
    location: mentee?.location || '',
    timezone: mentee?.timezone || 'UTC',
    occupation: mentee?.occupation || '',
    company: mentee?.company || '',
    experience_level: mentee?.experience_level || 'beginner',
    goals: mentee?.goals?.join(', ') || '',
    interests: mentee?.interests?.join(', ') || '',
    preferred_communication: mentee?.preferred_communication || 'video',
    availability: mentee?.availability || '',
    bio: mentee?.bio || '',
    linkedin_url: mentee?.linkedin_url || '',
    github_url: mentee?.github_url || '',
    portfolio_url: mentee?.portfolio_url || '',
    status: mentee?.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        goals: formData.goals.split(',').map(g => g.trim()).filter(g => g),
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        date_of_birth: formData.date_of_birth || null
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Tech Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level *</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals and Interests */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Goals & Interests</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goals (comma-separated)</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  placeholder="e.g., Learn React, Get promoted, Start a business"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Interests (comma-separated)</label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  placeholder="e.g., Web Development, Machine Learning, Entrepreneurship"
                />
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Communication Preferences</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Communication</label>
                <select
                  value={formData.preferred_communication}
                  onChange={(e) => setFormData({...formData, preferred_communication: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="chat">Chat Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., America/New_York"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Availability</label>
              <textarea
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                placeholder="e.g., Weekdays 6-8 PM EST, Weekends flexible"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  placeholder="Brief description about the mentee..."
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://github.com/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
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
              {loading ? "Saving..." : (mentee ? "Update Mentee" : "Create Mentee")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sessions Management Component
const SessionsManagement = ({ mentees }: { mentees: Mentee[] }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMentee, setSelectedMentee] = useState<string>("all");

  useEffect(() => {
    fetchSessions();
  }, [filter, statusFilter, selectedMentee]);

  const fetchSessions = async () => {
    try {
      let url = `${API_URL}/api/admin/sessions`;
      const params = new URLSearchParams();
      
      if (filter !== "all") params.append('date_filter', filter);
      if (statusFilter !== "all") params.append('status', statusFilter);
      if (selectedMentee !== "all") params.append('mentee_id', selectedMentee);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
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

  const updateSessionStatus = async (sessionId: number, status: Session['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Session ${status} successfully!`, 'success');
        fetchSessions();
      } else {
        throw new Error(`Failed to ${status} session`);
      }
    } catch (error) {
      showErrorAlert(`${status} session`, error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <LoadingSpinner message="Loading sessions..." />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mentee</label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Mentees</option>
              {mentees.map((mentee) => (
                <option key={mentee.id} value={mentee.id.toString()}>
                  {mentee.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                exportToCSV(sessions.map(session => ({
                  id: session.id,
                  title: session.title,
                  mentor_name: session.mentor_name,
                  student_name: session.student_name,
                  scheduled_at: session.scheduled_at,
                  duration_minutes: session.duration_minutes,
                  status: session.status,
                  price: session.price,
                  payment_status: session.payment_status,
                  rating: session.rating
                })), 'sessions_data');
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Export Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{session.title}</h3>
                <p className="text-gray-600">
                  {session.mentor_name} → {session.student_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(session.scheduled_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(session.payment_status)}`}>
                  {session.payment_status}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Duration</p>
                <p className="font-semibold">{session.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="font-semibold">${session.price}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="font-semibold">
                  {session.rating ? `⭐ ${session.rating.toFixed(1)}` : 'Not rated'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Session ID</p>
                <p className="font-semibold">#{session.id}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {session.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => updateSessionStatus(session.id, 'completed')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateSessionStatus(session.id, 'cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Cancel Session
                  </button>
                </>
              )}
              {session.status === 'pending' && (
                <button
                  onClick={() => updateSessionStatus(session.id, 'scheduled')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Confirm Session
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600">
              {filter === "all" && statusFilter === "all" && selectedMentee === "all"
                ? "No sessions have been scheduled yet."
                : "No sessions match the current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Gift Sessions Management Component
const GiftSessionsManagement = ({ giftSessions }: { giftSessions: GiftSession[] }) => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateGiftModal, setShowCreateGiftModal] = useState(false);

  const filteredGiftSessions = giftSessions.filter(gift => {
    if (filter === "all") return true;
    return gift.status === filter;
  });

  const updateGiftStatus = async (giftId: number, status: GiftSession['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/gifts/${giftId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Gift session ${status} successfully!`, 'success');
        window.location.reload(); // Refresh to get updated data
      } else {
        throw new Error(`Failed to ${status} gift session`);
      }
    } catch (error) {
      showErrorAlert(`${status} gift session`, error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      active: 'bg-blue-100 text-blue-700',
      redeemed: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🎁 Gift Sessions Management</h3>
          <button
            onClick={() => setShowCreateGiftModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Create Gift Session
          </button>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Gift Sessions</option>
            <option value="active">Active</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              exportToCSV(filteredGiftSessions.map(gift => ({
                gift_code: gift.gift_code,
                recipient_name: gift.recipient_name,
                sender_name: gift.sender_name,
                mentor_name: gift.mentor_name,
                status: gift.status,
                value: gift.value,
                purchased_at: gift.purchased_at,
                expires_at: gift.expires_at,
                redeemed_at: gift.redeemed_at
              })), 'gift_sessions_data');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Gift Sessions List */}
      <div className="space-y-4">
        {filteredGiftSessions.map((gift) => (
          <div key={gift.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Gift Code: {gift.gift_code}</h3>
                <p className="text-gray-600">
                  From: {gift.sender_name} → To: {gift.recipient_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Mentor: {gift.mentor_name} ({gift.mentor_title})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(gift.status)}`}>
                  {gift.status}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  ${gift.value}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Purchased</p>
                <p className="font-semibold">{new Date(gift.purchased_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Expires</p>
                <p className="font-semibold">{new Date(gift.expires_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Redeemed</p>
                <p className="font-semibold">
                  {gift.redeemed_at ? new Date(gift.redeemed_at).toLocaleDateString() : 'Not redeemed'}
                </p>
              </div>
            </div>

            {gift.message && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Message:</p>
                <p className="italic">"{gift.message}"</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Recipient: {gift.recipient_email}
                {gift.session_id && (
                  <span className="ml-4">Session ID: #{gift.session_id}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {gift.status === 'active' && (
                  <>
                    <button
                      onClick={() => updateGiftStatus(gift.id, 'redeemed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      Mark Redeemed
                    </button>
                    <button
                      onClick={() => updateGiftStatus(gift.id, 'cancelled')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Cancel Gift
                    </button>
                  </>
                )}
                {gift.status === 'expired' && (
                  <button
                    onClick={() => updateGiftStatus(gift.id, 'active')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredGiftSessions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Gift Sessions Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === "all" ? "No gift sessions have been created yet." : `No ${filter} gift sessions found.`}
            </p>
            <button
              onClick={() => setShowCreateGiftModal(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              Create Your First Gift Session
            </button>
          </div>
        )}
      </div>

      {/* Create Gift Modal */}
      {showCreateGiftModal && (
        <CreateGiftModal 
          onClose={() => setShowCreateGiftModal(false)}
          onSuccess={() => {
            setShowCreateGiftModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Create Gift Modal Component
const CreateGiftModal = ({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: () => void; 
}) => {
  const [formData, setFormData] = useState({
    mentor_id: '',
    recipient_name: '',
    recipient_email: '',
    sender_name: '',
    sender_email: '',
    message: '',
    value: '',
    expires_at: ''
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors`);
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mentor_id: parseInt(formData.mentor_id),
          value: parseFloat(formData.value)
        })
      });

      if (response.ok) {
        showToast("Gift session created successfully!", 'success');
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to create gift session');
      }
    } catch (error) {
      showErrorAlert('create gift session', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🎁 Create Gift Session</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mentor *</label>
              <select
                required
                value={formData.mentor_id}
                onChange={(e) => setFormData({...formData, mentor_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name} - ${mentor.hourly_rate}/hr
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gift Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name *</label>
              <input
                type="text"
                required
                value={formData.recipient_name}
                onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email *</label>
              <input
                type="email"
                required
                value={formData.recipient_email}
                onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Sender Name *</label>
              <input
                type="text"
                required
                value={formData.sender_name}
                onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sender Email *</label>
              <input
                type="email"
                required
                value={formData.sender_email}
                onChange={(e) => setFormData({...formData, sender_email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expiration Date *</label>
            <input
              type="date"
              required
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personal Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Happy birthday! Hope you enjoy this mentoring session..."
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
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
            >
              {loading ? "Creating..." : "Create Gift Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Revenue Analytics Component
const RevenueAnalyticsView = ({ analytics }: { analytics: RevenueAnalytics }) => {
  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${analytics.total_revenue.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-blue-600">${analytics.monthly_revenue.toLocaleString()}</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue Growth</p>
              <p className={`text-3xl font-bold ${analytics.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.revenue_growth >= 0 ? '+' : ''}{analytics.revenue_growth.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">{analytics.revenue_growth >= 0 ? '📊' : '📉'}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Session Value</p>
              <p className="text-3xl font-bold text-purple-600">${analytics.avg_session_value.toFixed(2)}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>
      </div>

      {/* Top Mentors by Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">🏆 Top Mentors by Revenue</h3>
        <div className="space-y-4">
          {analytics.top_mentors_by_revenue.slice(0, 10).map((mentor, index) => (
            <div key={mentor.mentor_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{mentor.mentor_name}</p>
                  <p className="text-sm text-gray-600">{mentor.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${mentor.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">${(mentor.revenue / mentor.sessions).toFixed(2)}/session</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Month Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">📅 Revenue by Month</h3>
        <div className="space-y-4">
          {analytics.revenue_by_month.slice(-12).map((month) => (
            <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{month.month}</p>
                <p className="text-sm text-gray-600">{month.sessions} sessions</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">${month.revenue.toLocaleString()}</p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((month.revenue / Math.max(...analytics.revenue_by_month.map(m => m.revenue))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">💳 Payment Methods</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {analytics.payment_methods.map((method) => (
            <div key={method.method} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold capitalize">{method.method}</p>
                <p className="text-sm text-gray-600">{method.count} transactions</p>
              </div>
              <p className="text-2xl font-bold text-green-600">${method.revenue.toLocaleString()}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${(method.revenue / analytics.total_revenue) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((method.revenue / analytics.total_revenue) * 100).toFixed(1)}% of total revenue
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">📊 Export Analytics</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              exportToCSV(analytics.top_mentors_by_revenue.map(mentor => ({
                mentor_name: mentor.mentor_name,
                revenue: mentor.revenue,
                sessions: mentor.sessions,
                avg_per_session: (mentor.revenue / mentor.sessions).toFixed(2)
              })), 'top_mentors_revenue');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Top Mentors
          </button>
          <button
            onClick={() => {
              exportToCSV(analytics.revenue_by_month.map(month => ({
                month: month.month,
                revenue: month.revenue,
                sessions: month.sessions,
                avg_per_session: (month.revenue / month.sessions).toFixed(2)
              })), 'monthly_revenue');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Export Monthly Data
          </button>
          <button
            onClick={() => {
              exportToCSV(analytics.payment_methods.map(method => ({
                payment_method: method.method,
                transaction_count: method.count,
                revenue: method.revenue,
                percentage: ((method.revenue / analytics.total_revenue) * 100).toFixed(1)
              })), 'payment_methods');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Export Payment Methods
          </button>
        </div>
      </div>
    </div>
  );
};

// Mentee Analytics Modal Component
const MenteeAnalyticsModal = ({ 
  mentee, 
  analytics, 
  onClose 
}: { 
  mentee: Mentee; 
  analytics: MenteeAnalytics; 
  onClose: () => void; 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Analytics - {mentee.name}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-700">{analytics.total_sessions}</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-700">{analytics.completion_rate.toFixed(1)}%</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-700">${analytics.total_spent.toLocaleString()}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Engagement Score</p>
                  <p className="text-2xl font-bold text-yellow-700">{analytics.engagement_score}/100</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </div>
          </div>

          {/* Session Performance */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">📈 Session Performance</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Completed Sessions</p>
                <p className="text-xl font-bold text-green-600">{analytics.completed_sessions}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Cancelled Sessions</p>
                <p className="text-xl font-bold text-red-600">{analytics.cancelled_sessions}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-xl font-bold text-blue-600">
                  {analytics.avg_session_rating > 0 ? `⭐ ${analytics.avg_session_rating.toFixed(1)}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Favorite Topics */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">🎯 Favorite Topics</h3>
            <div className="space-y-3">
              {analytics.favorite_topics.slice(0, 5).map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{topic.count} sessions</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(topic.count / Math.max(...analytics.favorite_topics.map(t => t.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">🎯 Progress Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-2">Goals Achievement</p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ 
                        width: `${(analytics.progress_metrics.goals_achieved / analytics.progress_metrics.total_goals) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.progress_metrics.goals_achieved}/{analytics.progress_metrics.total_goals}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Session Frequency</p>
                <p className="text-lg font-bold">{analytics.session_frequency.toFixed(1)} sessions/month</p>
              </div>
            </div>
            
            {analytics.progress_metrics.skill_improvements.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-600 text-sm mb-3">Skill Improvements</p>
                <div className="space-y-2">
                  {analytics.progress_metrics.skill_improvements.slice(0, 3).map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-green-600 font-bold">+{skill.improvement_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Session History */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">📚 Recent Session History</h3>
            <div className="space-y-3">
              {analytics.session_history.slice(0, 5).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.topic}</p>
                    <p className="text-sm text-gray-600">with {session.mentor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        session.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {session.status}
                      </span>
                      {session.rating > 0 && (
                        <span className="text-sm">⭐ {session.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
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

// Mentee Progress Modal Component
const MenteeProgressModal = ({ 
  mentee, 
  progress, 
  onClose 
}: { 
  mentee: Mentee; 
  progress: MenteeProgress; 
  onClose: () => void; 
}) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const updateGoalStatus = async (goalId: number, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${mentee.id}/goals/${goalId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Goal ${status.replace('_', ' ')} successfully!`, 'success');
        window.location.reload(); // Refresh to get updated data
      } else {
        throw new Error(`Failed to update goal status`);
      }
    } catch (error) {
      showErrorAlert('update goal status', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📈 Progress - {mentee.name}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Goals Section */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🎯 Goals</h3>
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                Add Goal
              </button>
            </div>
            
            <div className="space-y-4">
              {progress.goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${goal.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {goal.target_date && (
                        <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                      )}
                      {goal.completion_date && (
                        <span className="ml-4 text-green-600">
                          Completed: {new Date(goal.completion_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {goal.status !== 'completed' && (
                      <div className="flex space-x-2">
                        {goal.status === 'not_started' && (
                          <button
                            onClick={() => updateGoalStatus(goal.id, 'in_progress')}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            Start
                          </button>
                        )}
                        {goal.status === 'in_progress' && (
                          <button
                            onClick={() => updateGoalStatus(goal.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {progress.goals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>No goals set yet. Add a goal to start tracking progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">🚀 Skills Development</h3>
            <div className="space-y-4">
              {progress.skills.map((skill) => (
                <div key={skill.skill} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{skill.skill}</h4>
                    <span className="text-sm text-gray-600">
                      Level {skill.current_level}/{skill.target_level}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress to Target</span>
                      <span>{skill.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${skill.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(skill.last_updated).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {progress.skills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🚀</div>
                  <p>No skills being tracked yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Section */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">🏆 Milestones</h3>
            <div className="space-y-4">
              {progress.milestones.map((milestone) => (
                <div key={milestone.id} className={`p-4 rounded-lg ${
                  milestone.is_achieved ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        milestone.is_achieved ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {milestone.is_achieved ? '✓' : '○'}
                      </div>
                      <div>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                        {milestone.achieved_date && (
                          <p className="text-green-600 text-sm mt-1">
                            Achieved: {new Date(milestone.achieved_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {progress.milestones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>No milestones set yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <AddGoalModal 
          menteeId={mentee.id}
          onClose={() => setShowAddGoalModal(false)}
          onSuccess={() => {
            setShowAddGoalModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Add Goal Modal Component
const AddGoalModal = ({ 
  menteeId, 
  onClose, 
  onSuccess 
}: { 
  menteeId: number; 
  onClose: () => void; 
  onSuccess: () => void; 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/mentees/${menteeId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast("Goal added successfully!", 'success');
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to add goal');
      }
    } catch (error) {
      showErrorAlert('add goal', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🎯 Add New Goal</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Goal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Learn React.js"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
              placeholder="Describe the goal in detail..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Target Date</label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({...formData, target_date: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};