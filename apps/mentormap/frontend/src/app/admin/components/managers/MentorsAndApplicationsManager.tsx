import { useState, useEffect } from 'react';
import { Mentor, MentorApplication, MentorPerformance, AvailabilitySlot } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Helper function to ensure expertise is always an array
const getExpertiseArray = (expertise: string[] | string | undefined): string[] => {
  if (Array.isArray(expertise)) {
    return expertise;
  }
  if (typeof expertise === 'string') {
    return expertise.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
};

// Helper function to get expertise as string
const getExpertiseString = (expertise: string[] | string | undefined): string => {
  if (Array.isArray(expertise)) {
    return expertise.join(', ');
  }
  if (typeof expertise === 'string') {
    return expertise;
  }
  return '';
};

export const MentorsAndApplicationsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<"mentors" | "applications">("mentors");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<MentorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [performanceData, setPerformanceData] = useState<MentorPerformance[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    if (activeSubTab === "mentors") {
      fetchMentors();
    } else {
      fetchApplications();
    }
  }, [activeSubTab, filter]);

  const fetchMentors = async () => {
    try {
      let url = `${API_URL}/api/admin/mentors`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      } else {
        throw new Error('Failed to fetch mentors');
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      showErrorAlert('fetch mentors', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      let url = `${API_URL}/api/admin/mentor-applications`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      showErrorAlert('fetch applications', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorPerformance = async () => {
    setLoadingPerformance(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/performance`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      } else {
        throw new Error('Failed to fetch performance data');
      }
    } catch (error) {
      console.error("Error fetching performance:", error);
      showErrorAlert('fetch mentor performance data', error);
      setPerformanceData([]);
    } finally {
      setLoadingPerformance(false);
      setShowPerformanceModal(true);
    }
  };

  const updateMentorStatus = async (mentorId: number, status: 'active' | 'inactive') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/${mentorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Mentor ${status === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
        fetchMentors();
      } else {
        throw new Error(`Failed to ${status === 'active' ? 'activate' : 'deactivate'} mentor`);
      }
    } catch (error) {
      showErrorAlert(`${status === 'active' ? 'activate' : 'deactivate'} mentor`, error);
    }
  };

  const reviewApplication = async (applicationId: number, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/mentor-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewer_notes: notes })
      });

      if (response.ok) {
        showToast(`Application ${status} successfully!`, 'success');
        fetchApplications();
        setSelectedApplication(null);
      } else {
        throw new Error(`Failed to ${status} application`);
      }
    } catch (error) {
      showErrorAlert(`${status} application`, error);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">🎓 Mentors Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddMentorModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Add Mentor
          </button>
          <button
            onClick={fetchMentorPerformance}
            disabled={loadingPerformance}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loadingPerformance ? "Loading..." : "Performance Report"}
          </button>
          <button
            onClick={() => {
              const data = activeSubTab === "mentors" ? mentors : applications;
              exportToCSV(data, activeSubTab === "mentors" ? 'mentors_data' : 'applications_data');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export {activeSubTab === "mentors" ? "Mentors" : "Applications"}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSubTab("mentors")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "mentors"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            🎓 Mentors ({mentors.length})
          </button>
          <button
            onClick={() => setActiveSubTab("applications")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "applications"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            📋 Applications ({applications.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All {activeSubTab === "mentors" ? "Mentors" : "Applications"}</option>
            {activeSubTab === "mentors" ? (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Mentors Tab */}
      {activeSubTab === "mentors" && (
        <div className="grid gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(mentor.name || 'M').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{mentor.name}</h3>
                    <p className="text-gray-600">{mentor.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{mentor.email}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-semibold">{mentor.rating}</span>
                      <span className="ml-2 text-gray-500">({mentor.total_sessions} sessions)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mentor.status)}`}>
                    {mentor.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Expertise</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getExpertiseArray(mentor.expertise).slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {getExpertiseArray(mentor.expertise).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{getExpertiseArray(mentor.expertise).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Hourly Rate</p>
                  <p className="font-semibold text-lg">${mentor.hourly_rate}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Member Since</p>
                  <p className="font-semibold">{new Date(mentor.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{mentor.bio}</p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowAvailabilityModal(true);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Manage Schedule
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  {mentor.status === 'active' ? (
                    <button
                      onClick={() => updateMentorStatus(mentor.id, 'inactive')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => updateMentorStatus(mentor.id, 'active')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {mentors.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentors Found</h3>
              <p className="text-gray-600">
                {filter === "all" ? "No mentors have been added yet." : `No ${filter} mentors found.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeSubTab === "applications" && (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(application.name || 'A').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{application.name}</h3>
                    <p className="text-gray-600">{application.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{application.email}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(application.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Expertise</p>
                  <p className="font-semibold">{application.expertise}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Proposed Hourly Rate</p>
                  <p className="font-semibold text-lg">${application.hourly_rate}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{application.bio}</p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Review Application
                  </button>
                  {application.linkedin_url && (
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
                
                {application.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => reviewApplication(application.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewApplication(application.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {filter === "all" ? "No applications have been submitted yet." : `No ${filter} applications found.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedMentor && !showAvailabilityModal && (
        <MentorProfileModal 
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onUpdate={fetchMentors}
        />
      )}

      {selectedApplication && (
        <ApplicationReviewModal 
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onReview={reviewApplication}
        />
      )}

      {showAddMentorModal && (
        <AddMentorModal 
          onClose={() => setShowAddMentorModal(false)}
          onSuccess={() => {
            setShowAddMentorModal(false);
            fetchMentors();
          }}
        />
      )}

      {showPerformanceModal && (
        <PerformanceReportModal 
          data={performanceData}
          onClose={() => setShowPerformanceModal(false)}
        />
      )}

      {showAvailabilityModal && selectedMentor && (
        <AvailabilityModal 
          mentor={selectedMentor}
          onClose={() => {
            setShowAvailabilityModal(false);
            setSelectedMentor(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Components
const MentorProfileModal = ({ mentor, onClose, onUpdate }: { 
  mentor: Mentor; 
  onClose: () => void; 
  onUpdate: () => void; 
}) => {
  const [formData, setFormData] = useState({
    name: mentor.name,
    email: mentor.email,
    title: mentor.title,
    bio: mentor.bio,
    expertise: getExpertiseString(mentor.expertise),
    hourly_rate: mentor.hourly_rate.toString(),
    linkedin_url: mentor.linkedin_url || '',
    website_url: mentor.website_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/mentors/${mentor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise.split(',').map(s => s.trim()),
          hourly_rate: parseFloat(formData.hourly_rate)
        })
      });

      if (response.ok) {
        showToast("Mentor profile updated successfully!", 'success');
        onUpdate();
        onClose();
      } else {
        throw new Error('Failed to update mentor');
      }
    } catch (error) {
      showErrorAlert('update mentor profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Mentor Profile</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professional Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio *</label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Areas of Expertise *</label>
            <input
              type="text"
              required
              value={formData.expertise}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="React, Node.js, TypeScript"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (USD) *</label>
              <input
                type="number"
                required
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="25"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website/Portfolio</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ApplicationReviewModal = ({ application, onClose, onReview }: { 
  application: MentorApplication; 
  onClose: () => void; 
  onReview: (id: number, status: 'approved' | 'rejected', notes?: string) => void; 
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReview = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    await onReview(application.id, status, notes);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Review Application</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <p className="font-semibold">{application.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="font-semibold">{application.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Professional Title</label>
            <p className="font-semibold">{application.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Bio</label>
            <p className="text-gray-700">{application.bio}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Expertise</label>
              <p className="font-semibold">{application.expertise}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Proposed Hourly Rate</label>
              <p className="font-semibold text-lg">${application.hourly_rate}</p>
            </div>
          </div>

          {application.linkedin_url && (
            <div>
              <label className="block text-sm font-medium text-gray-600">LinkedIn Profile</label>
              <a 
                href={application.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {application.linkedin_url}
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Review Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Add notes about your decision..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={() => handleReview('rejected')}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Reject"}
            </button>
            <button
              onClick={() => handleReview('approved')}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddMentorModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    bio: "",
    expertise: "",
    hourly_rate: "",
    linkedin_url: "",
    website_url: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/mentors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise.split(',').map(s => s.trim()),
          hourly_rate: parseFloat(formData.hourly_rate)
        })
      });

      if (response.ok) {
        showToast("Mentor added successfully!", 'success');
        onSuccess();
      } else {
        throw new Error('Failed to create mentor');
      }
    } catch (error) {
      showErrorAlert('create mentor', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Add New Mentor</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
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
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professional Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio *</label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Brief professional background and experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Areas of Expertise *</label>
            <input
              type="text"
              required
              value={formData.expertise}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Software Development, Product Management, Leadership"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (USD) *</label>
              <input
                type="number"
                required
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="150"
                min="25"
                max="1000"
              />
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website/Portfolio</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://johndoe.com"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mentor will receive an invitation email</li>
              <li>• They'll need to complete their profile setup</li>
              <li>• Account will be activated after verification</li>
              <li>• You can manage their availability from this panel</li>
            </ul>
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
              {loading ? "Creating..." : "Add Mentor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PerformanceReportModal = ({ data, onClose }: { data: MentorPerformance[]; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Mentor Performance Report</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left">Mentor</th>
                  <th className="border p-3 text-center">Total Sessions</th>
                  <th className="border p-3 text-center">Completed</th>
                  <th className="border p-3 text-center">Completion Rate</th>
                  <th className="border p-3 text-center">Avg Rating</th>
                  <th className="border p-3 text-center">Revenue</th>
                  <th className="border p-3 text-center">Hourly Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((mentor) => (
                  <tr key={mentor.mentor_id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      <div>
                        <p className="font-semibold">{mentor.mentor_name}</p>
                        <p className="text-sm text-gray-600">{mentor.mentor_title}</p>
                      </div>
                    </td>
                    <td className="border p-3 text-center font-semibold">{mentor.total_sessions}</td>
                    <td className="border p-3 text-center">{mentor.completed_sessions}</td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${
                        mentor.completion_rate >= 90 ? 'bg-green-100 text-green-700' :
                        mentor.completion_rate >= 80 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {mentor.completion_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 font-semibold">{mentor.avg_rating}</span>
                      </div>
                    </td>
                    <td className="border p-3 text-center font-semibold">${mentor.total_revenue.toLocaleString()}</td>
                    <td className="border p-3 text-center">${mentor.hourly_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Total mentors: {data.length} | 
              Total revenue: ${data.reduce((sum, m) => sum + m.total_revenue, 0).toLocaleString()} |
              Avg completion rate: {(data.reduce((sum, m) => sum + m.completion_rate, 0) / data.length).toFixed(1)}%
            </div>
            <button
              onClick={() => exportToCSV(data, 'mentor_performance_report')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AvailabilityModal = ({ mentor, onClose }: { mentor: Mentor; onClose: () => void }) => {
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