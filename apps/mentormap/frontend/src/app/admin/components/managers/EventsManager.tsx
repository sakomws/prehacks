import { useState, useEffect } from 'react';
import { Event, EventRegistration, EventAnalytics } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, handleApiResponse, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      let url = `${API_URL}/api/admin/events`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filter out cancelled events unless specifically viewing cancelled events
        const filteredEvents = filter === "cancelled" ? data : data.filter((event: Event) => event.status !== "cancelled");
        setEvents(filteredEvents);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      showErrorAlert('fetch events', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
        setShowRegistrationsModal(true);
      } else {
        throw new Error('Failed to fetch event registrations');
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      showErrorAlert('fetch event registrations', error);
      setRegistrations([]);
    }
  };

  const fetchEventAnalytics = async (eventId: number) => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setShowAnalyticsModal(true);
      } else {
        throw new Error('Failed to fetch event analytics');
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showErrorAlert('fetch event analytics', error);
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      // Transform frontend data to match backend EventCreate schema
      const transformedData = {
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        date: eventData.start_date ? new Date(eventData.start_date).toISOString().split('T')[0] : '', // YYYY-MM-DD
        time: eventData.start_date ? new Date(eventData.start_date).toTimeString().slice(0, 5) : '', // HH:MM
        duration_minutes: eventData.duration_minutes || 60,
        location: eventData.location,
        is_virtual: !eventData.location || eventData.virtual_link ? true : false,
        meeting_url: eventData.virtual_link,
        max_attendees: eventData.max_attendees,
        price: eventData.price || 0
      };

      const response = await fetch(`${API_URL}/api/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData)
      });

      if (response.ok) {
        showToast("Event created successfully!", 'success');
        fetchEvents();
        setShowCreateModal(false);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : (typeof errorData.detail === 'object' 
              ? JSON.stringify(errorData.detail) 
              : 'Failed to create event');
        throw new Error(errorMessage);
      }
    } catch (error) {
      showErrorAlert('create event', error);
    }
  };

  const updateEvent = async (eventId: number, eventData: Partial<Event>) => {
    try {
      // Transform frontend data to match backend EventCreate schema
      const transformedData = {
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        date: eventData.start_date ? new Date(eventData.start_date).toISOString().split('T')[0] : undefined, // YYYY-MM-DD
        time: eventData.start_date ? new Date(eventData.start_date).toTimeString().slice(0, 5) : undefined, // HH:MM
        duration_minutes: eventData.duration_minutes || 60,
        location: eventData.location,
        is_virtual: !eventData.location || eventData.virtual_link ? true : false,
        meeting_url: eventData.virtual_link,
        max_attendees: eventData.max_attendees,
        price: eventData.price || 0
      };

      // Remove undefined values
      Object.keys(transformedData).forEach(key => 
        transformedData[key as keyof typeof transformedData] === undefined && delete transformedData[key as keyof typeof transformedData]
      );

      const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData)
      });

      if (response.ok) {
        showToast("Event updated successfully!", 'success');
        fetchEvents();
        setShowEditModal(false);
        setSelectedEvent(null);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : (typeof errorData.detail === 'object' 
              ? JSON.stringify(errorData.detail) 
              : 'Failed to update event');
        throw new Error(errorMessage);
      }
    } catch (error) {
      showErrorAlert('update event', error);
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.message || "Event deleted successfully!", 'success');
        fetchEvents();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      showErrorAlert('delete event', error);
    }
  };

  const updateEventStatus = async (eventId: number, status: Event['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Event ${status} successfully!`, 'success');
        fetchEvents();
      } else {
        throw new Error(`Failed to ${status} event`);
      }
    } catch (error) {
      showErrorAlert(`${status} event`, error);
    }
  };

  const updateAttendanceStatus = async (registrationId: number, status: EventRegistration['attendance_status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/registrations/${registrationId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_status: status })
      });

      if (response.ok) {
        showToast(`Attendance status updated to ${status}!`, 'success');
        if (selectedEvent) {
          fetchEventRegistrations(selectedEvent.id);
        }
      } else {
        throw new Error('Failed to update attendance status');
      }
    } catch (error) {
      showErrorAlert('update attendance status', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      registered: 'bg-blue-100 text-blue-700',
      attended: 'bg-green-100 text-green-700',
      no_show: 'bg-red-100 text-red-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getEventTypeIcon = (type: Event['event_type']) => {
    const icons = {
      workshop: '🛠️',
      webinar: '💻',
      networking: '🤝',
      conference: '🎤',
      other: '📅'
    };
    return icons[type] || '📅';
  };

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">🎯 Events Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Create Event
          </button>
          <button
            onClick={() => {
              exportToCSV(events.map(event => ({
                id: event.id,
                title: event.title,
                type: event.event_type,
                date: event.date,
                time: event.time,
                duration_minutes: event.duration_minutes,
                status: event.status,
                max_attendees: event.max_attendees,
                price: event.price
              })), 'events_data');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Events
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
            <option value="all">All Events</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  {getEventTypeIcon(event.event_type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-gray-600 capitalize">{event.event_type}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Date</p>
                <p className="font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-500 text-sm">{event.time}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Duration</p>
                <p className="font-semibold">{event.duration_minutes} minutes</p>
                <p className="text-gray-500 text-sm">
                  {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Capacity</p>
                <p className="font-semibold">
                  {event.max_attendees ? `${event.max_attendees} attendees` : 'Unlimited'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="font-semibold text-lg">
                  {event.price > 0 ? `$${event.price}` : 'Free'}
                </p>
              </div>
            </div>

            {(event.location || event.meeting_url) && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm">Location</p>
                {event.location && (
                  <p className="font-semibold">📍 {event.location}</p>
                )}
                {event.meeting_url && (
                  <p className="font-semibold">🔗 Virtual Event</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    fetchEventRegistrations(event.id);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Registrations
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    fetchEventAnalytics(event.id);
                  }}
                  disabled={loadingAnalytics}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm disabled:opacity-50"
                >
                  {loadingAnalytics ? "Loading..." : "Analytics"}
                </button>
              </div>
              
              <div className="flex space-x-2">
                {event.status === 'draft' && (
                  <button
                    onClick={() => updateEventStatus(event.id, 'published')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    Publish
                  </button>
                )}
                {event.status === 'published' && (() => {
                  const eventDateTime = new Date(`${event.date}T${event.time}`);
                  const eventEndTime = new Date(eventDateTime.getTime() + event.duration_minutes * 60000);
                  return eventEndTime < new Date();
                })() && (
                  <button
                    onClick={() => updateEventStatus(event.id, 'completed')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Mark Complete
                  </button>
                )}
                {(event.status === 'draft' || event.status === 'published') && (
                  <button
                    onClick={() => updateEventStatus(event.id, 'cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              {filter === "all" ? "No events have been created yet." : `No ${filter} events found.`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <EventFormModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={createEvent}
          title="Create New Event"
        />
      )}

      {showEditModal && selectedEvent && (
        <EventFormModal 
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSubmit={(data) => updateEvent(selectedEvent.id, data)}
          title="Edit Event"
        />
      )}

      {showRegistrationsModal && selectedEvent && (
        <EventRegistrationsModal 
          event={selectedEvent}
          registrations={registrations}
          onClose={() => {
            setShowRegistrationsModal(false);
            setSelectedEvent(null);
          }}
          onUpdateAttendance={updateAttendanceStatus}
        />
      )}

      {showAnalyticsModal && selectedEvent && analytics && (
        <EventAnalyticsModal 
          event={selectedEvent}
          analytics={analytics}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedEvent(null);
            setAnalytics(null);
          }}
        />
      )}
    </div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ 
  event, 
  onClose, 
  onSubmit, 
  title 
}: { 
  event?: Event; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  title: string; 
}) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'workshop',
    start_date: event ? `${event.date}T${event.time}` : '',
    end_date: event ? (() => {
      const startDateTime = new Date(`${event.date}T${event.time}`);
      const endDateTime = new Date(startDateTime.getTime() + (event.duration_minutes || 60) * 60000);
      return endDateTime.toISOString().slice(0, 16);
    })() : '',
    location: event?.location || '',
    virtual_link: event?.meeting_url || '',
    max_attendees: event?.max_attendees?.toString() || '',
    registration_deadline: event?.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
    price: event?.price?.toString() || '0',
    status: event?.status || 'draft'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate duration from start and end dates
      const startDateTime = new Date(formData.start_date);
      const endDateTime = new Date(formData.end_date);
      const durationMinutes = Math.max(1, Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)));

      const submitData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date, // This will be transformed in createEvent/updateEvent
        end_date: formData.end_date,
        duration_minutes: durationMinutes,
        location: formData.location,
        virtual_link: formData.virtual_link,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        registration_deadline: formData.registration_deadline || null
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., React Workshop for Beginners"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Event Type *</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value as Event['event_type']})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="networking">Networking</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Detailed description of the event..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Physical Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Conference Room A, 123 Main St"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Virtual Link</label>
              <input
                type="url"
                value={formData.virtual_link}
                onChange={(e) => setFormData({...formData, virtual_link: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Max Attendees</label>
              <input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({...formData, max_attendees: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price (USD)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0 for free events"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Event['status']})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Registration Deadline</label>
            <input
              type="datetime-local"
              value={formData.registration_deadline}
              onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty if no deadline</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Event Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Events in draft status are not visible to users</li>
              <li>• Published events will appear on the events page</li>
              <li>• Virtual events should include a meeting link</li>
              <li>• Set registration deadlines to manage capacity</li>
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
              {loading ? "Saving..." : (event ? "Update Event" : "Create Event")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Registrations Modal Component
const EventRegistrationsModal = ({ 
  event, 
  registrations, 
  onClose, 
  onUpdateAttendance 
}: { 
  event: Event; 
  registrations: EventRegistration[]; 
  onClose: () => void; 
  onUpdateAttendance: (registrationId: number, status: EventRegistration['attendance_status']) => void; 
}) => {
  const getStatusColor = (status: string) => {
    const statusColors = {
      registered: 'bg-blue-100 text-blue-700',
      attended: 'bg-green-100 text-green-700',
      no_show: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  const attendanceStats = {
    total: registrations.length,
    attended: registrations.filter(r => r.attendance_status === 'attended').length,
    no_show: registrations.filter(r => r.attendance_status === 'no_show').length,
    registered: registrations.filter(r => r.attendance_status === 'registered').length
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📋 Event Registrations - {event.title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Registration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{attendanceStats.total}</div>
              <div className="text-sm text-blue-600">Total Registrations</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{attendanceStats.attended}</div>
              <div className="text-sm text-green-600">Attended</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.registered}</div>
              <div className="text-sm text-yellow-600">Registered</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{attendanceStats.no_show}</div>
              <div className="text-sm text-red-600">No Show</div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-3 text-left">Attendee</th>
                  <th className="border p-3 text-center">Registration Date</th>
                  <th className="border p-3 text-center">Payment Status</th>
                  <th className="border p-3 text-center">Attendance Status</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      <div>
                        <p className="font-semibold">{registration.user_name}</p>
                        <p className="text-sm text-gray-600">{registration.user_email}</p>
                        {registration.notes && (
                          <p className="text-xs text-gray-500 mt-1">{registration.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="border p-3 text-center">
                      {new Date(registration.registration_date).toLocaleDateString()}
                    </td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(registration.payment_status)}`}>
                        {registration.payment_status}
                      </span>
                    </td>
                    <td className="border p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(registration.attendance_status)}`}>
                        {registration.attendance_status}
                      </span>
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        {registration.attendance_status === 'registered' && (
                          <>
                            <button
                              onClick={() => onUpdateAttendance(registration.id, 'attended')}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Mark Attended
                            </button>
                            <button
                              onClick={() => onUpdateAttendance(registration.id, 'no_show')}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              No Show
                            </button>
                          </>
                        )}
                        {registration.attendance_status === 'no_show' && (
                          <button
                            onClick={() => onUpdateAttendance(registration.id, 'attended')}
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Mark Attended
                          </button>
                        )}
                        {registration.attendance_status === 'attended' && (
                          <button
                            onClick={() => onUpdateAttendance(registration.id, 'registered')}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {registrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No registrations yet</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Attendance Rate: {attendanceStats.total > 0 ? 
                ((attendanceStats.attended / attendanceStats.total) * 100).toFixed(1) : 0}%
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportToCSV(registrations.map(r => ({
                  name: r.user_name,
                  email: r.user_email,
                  registration_date: r.registration_date,
                  attendance_status: r.attendance_status,
                  payment_status: r.payment_status,
                  notes: r.notes
                })), `${event.title.replace(/\s+/g, '_')}_registrations`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Export Registrations
              </button>
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
    </div>
  );
};

// Event Analytics Modal Component
const EventAnalyticsModal = ({ 
  event, 
  analytics, 
  onClose 
}: { 
  event: Event; 
  analytics: EventAnalytics; 
  onClose: () => void; 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Event Analytics - {event.title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.total_registrations}</div>
              <div className="text-sm text-blue-600">Total Registrations</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.total_attendees}</div>
              <div className="text-sm text-green-600">Total Attendees</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.attendance_rate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Attendance Rate</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">${analytics.total_revenue}</div>
              <div className="text-sm text-yellow-600">Total Revenue</div>
            </div>
          </div>

          {/* Registration Trend */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Registration Trend</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2">
                {analytics.registration_trend.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="bg-blue-500 rounded" style={{ height: `${Math.max(day.registrations * 10, 4)}px` }}></div>
                    <div className="text-xs font-semibold mt-1">{day.registrations}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Attendees by Role</h3>
              <div className="space-y-3">
                {analytics.demographics.by_role.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{role.role}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(role.count / analytics.total_registrations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{role.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Attendees by Location</h3>
              <div className="space-y-3">
                {analytics.demographics.by_location.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{location.location}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(location.count / analytics.total_registrations) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Event Performance: {analytics.attendance_rate >= 80 ? 'Excellent' : 
                                 analytics.attendance_rate >= 60 ? 'Good' : 
                                 analytics.attendance_rate >= 40 ? 'Average' : 'Needs Improvement'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportToCSV([{
                  event_title: event.title,
                  total_registrations: analytics.total_registrations,
                  total_attendees: analytics.total_attendees,
                  attendance_rate: analytics.attendance_rate,
                  total_revenue: analytics.total_revenue
                }], `${event.title.replace(/\s+/g, '_')}_analytics`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Export Analytics
              </button>
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
    </div>
  );
};