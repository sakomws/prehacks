import { useState, useEffect } from 'react';
import { Mentee } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const MenteesDirectory = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [showAddMenteeModal, setShowAddMenteeModal] = useState(false);
  const [showEditMenteeModal, setShowEditMenteeModal] = useState(false);
  const [showViewMenteeModal, setShowViewMenteeModal] = useState(false);

  useEffect(() => {
    fetchMentees();
  }, [filter, experienceFilter]);

  const fetchMentees = async () => {
    try {
      let url = `${API_URL}/api/admin/mentees`;
      const params = new URLSearchParams();
      
      if (filter !== "all") params.append('status', filter);
      if (experienceFilter !== "all") params.append('experience_level', experienceFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
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

  const createMentee = async (menteeData: Omit<Mentee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menteeData)
      });

      if (response.ok) {
        showToast("Mentee added successfully!", 'success');
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
      advanced: 'bg-purple-100 text-purple-700'
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

  // Filter mentees based on search term
  const filteredMentees = mentees.filter(mentee => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      mentee.name?.toLowerCase().includes(searchLower) ||
      mentee.email?.toLowerCase().includes(searchLower) ||
      mentee.occupation?.toLowerCase().includes(searchLower) ||
      mentee.company?.toLowerCase().includes(searchLower) ||
      mentee.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <LoadingSpinner message="Loading mentees directory..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">👥 Mentees Directory</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddMenteeModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Add Mentee
          </button>
          <button
            onClick={() => {
              exportToCSV(filteredMentees.map(mentee => ({
                id: mentee.id,
                name: mentee.name,
                email: mentee.email,
                phone: mentee.phone,
                occupation: mentee.occupation,
                company: mentee.company,
                location: mentee.location,
                experience_level: mentee.experience_level,
                status: mentee.status,
                created_at: mentee.created_at
              })), 'mentees_directory');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Directory
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Mentees</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Search by name, email, company..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
                setExperienceFilter("all");
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="grid gap-6">
        {filteredMentees.map((mentee) => (
          <div key={mentee.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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
                  {mentee.location && (
                    <p className="text-sm text-gray-500">📍 {mentee.location}</p>
                  )}
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

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-semibold">{mentee.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Timezone</p>
                <p className="font-semibold">{mentee.timezone || 'UTC'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Communication</p>
                <p className="font-semibold capitalize">{mentee.preferred_communication || 'video'}</p>
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

            {mentee.interests && mentee.interests.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {mentee.interests.slice(0, 4).map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                  {mentee.interests.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      +{mentee.interests.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Joined: {new Date(mentee.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedMentee(mentee);
                    setShowViewMenteeModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedMentee(mentee);
                    setShowEditMenteeModal(true);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  Edit
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

        {filteredMentees.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentees Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== "all" || experienceFilter !== "all"
                ? "No mentees match the current search criteria."
                : "No mentees have been added to the directory yet."}
            </p>
            {(!searchTerm && filter === "all" && experienceFilter === "all") && (
              <button
                onClick={() => setShowAddMenteeModal(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
              >
                Add Your First Mentee
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredMentees.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📊 Directory Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{filteredMentees.length}</div>
              <div className="text-sm text-gray-600">Total Mentees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredMentees.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {filteredMentees.filter(m => m.experience_level === 'beginner').length}
              </div>
              <div className="text-sm text-gray-600">Beginners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {filteredMentees.filter(m => m.experience_level === 'advanced').length}
              </div>
              <div className="text-sm text-gray-600">Advanced</div>
            </div>
          </div>
        </div>
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

      {showViewMenteeModal && selectedMentee && (
        <MenteeDetailsModal 
          mentee={selectedMentee}
          onClose={() => {
            setShowViewMenteeModal(false);
            setSelectedMentee(null);
          }}
          onEdit={() => {
            setShowViewMenteeModal(false);
            setShowEditMenteeModal(true);
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
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., New York, NY"
                />
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
                <label className="block text-sm font-medium mb-2">Availability</label>
                <textarea
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                  placeholder="e.g., Weekdays 6-8 PM EST, Weekends flexible"
                />
              </div>
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
              {loading ? "Saving..." : (mentee ? "Update Mentee" : "Add Mentee")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mentee Details Modal Component
const MenteeDetailsModal = ({ 
  mentee, 
  onClose, 
  onEdit 
}: { 
  mentee: Mentee; 
  onClose: () => void; 
  onEdit: () => void; 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">👤 {mentee.name}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
          <p className="text-blue-100 mt-2">{mentee.email}</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-semibold">{mentee.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date of Birth</p>
                <p className="font-semibold">
                  {mentee.date_of_birth ? new Date(mentee.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-semibold">{mentee.location || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Timezone</p>
                <p className="font-semibold">{mentee.timezone || 'UTC'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Occupation</p>
                <p className="font-semibold">{mentee.occupation || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Company</p>
                <p className="font-semibold">{mentee.company || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Experience Level</p>
                <p className="font-semibold capitalize">{mentee.experience_level}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  mentee.status === 'active' ? 'bg-green-100 text-green-700' :
                  mentee.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {mentee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Goals and Interests */}
          {(mentee.goals?.length > 0 || mentee.interests?.length > 0) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Goals & Interests</h3>
              {mentee.goals && mentee.goals.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {mentee.goals.map((goal, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mentee.interests && mentee.interests.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {mentee.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Communication Preferences */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Communication Preferences</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Preferred Communication</p>
                <p className="font-semibold capitalize">{mentee.preferred_communication || 'video'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Availability</p>
                <p className="font-semibold">{mentee.availability || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {mentee.bio && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Bio</h3>
              <p className="text-gray-700">{mentee.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {(mentee.linkedin_url || mentee.github_url || mentee.portfolio_url) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="flex flex-wrap gap-4">
                {mentee.linkedin_url && (
                  <a
                    href={mentee.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                {mentee.github_url && (
                  <a
                    href={mentee.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm"
                  >
                    GitHub
                  </a>
                )}
                {mentee.portfolio_url && (
                  <a
                    href={mentee.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Joined</p>
                <p className="font-semibold">{new Date(mentee.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Last Updated</p>
                <p className="font-semibold">
                  {mentee.updated_at ? new Date(mentee.updated_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};