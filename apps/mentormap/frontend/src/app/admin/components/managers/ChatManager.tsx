import { useState, useEffect } from 'react';
import { ChatConversation, ChatMessage, MessageAnalytics, SupportTicket, TicketResponse } from '../../types';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ChatManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'conversations' | 'analytics' | 'tickets'>('conversations');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analytics, setAnalytics] = useState<MessageAnalytics | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'conversations') {
      fetchConversations();
    } else if (activeSubTab === 'analytics') {
      fetchMessageAnalytics();
    } else if (activeSubTab === 'tickets') {
      fetchSupportTickets();
    }
  }, [activeSubTab, filter]);

  const fetchConversations = async () => {
    try {
      let url = `${API_URL}/api/admin/chat/conversations`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      showErrorAlert('fetch conversations', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/chat/messages/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setShowMessageModal(true);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      showErrorAlert('fetch messages', error);
      setMessages([]);
    }
  };

  const fetchMessageAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/chat/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        throw new Error('Failed to fetch message analytics');
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showErrorAlert('fetch message analytics', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      let url = `${API_URL}/api/admin/support/tickets`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        throw new Error('Failed to fetch support tickets');
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      showErrorAlert('fetch support tickets', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/responses`);
      if (response.ok) {
        const data = await response.json();
        setTicketResponses(data);
        setShowResponseModal(true);
      } else {
        throw new Error('Failed to fetch ticket responses');
      }
    } catch (error) {
      console.error("Error fetching ticket responses:", error);
      showErrorAlert('fetch ticket responses', error);
      setTicketResponses([]);
    }
  };

  const flagMessage = async (messageId: number, reason: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/chat/messages/${messageId}/flag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_reason: reason })
      });

      if (response.ok) {
        showToast("Message flagged successfully!", 'success');
        if (selectedConversation) {
          fetchMessages(selectedConversation.session_id);
        }
      } else {
        throw new Error('Failed to flag message');
      }
    } catch (error) {
      showErrorAlert('flag message', error);
    }
  };

  const moderateMessage = async (messageId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/chat/messages/${messageId}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderation_status: status })
      });

      if (response.ok) {
        showToast(`Message ${status} successfully!`, 'success');
        if (selectedConversation) {
          fetchMessages(selectedConversation.session_id);
        }
      } else {
        throw new Error(`Failed to ${status} message`);
      }
    } catch (error) {
      showErrorAlert(`${status} message`, error);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: SupportTicket['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Ticket ${status} successfully!`, 'success');
        fetchSupportTickets();
      } else {
        throw new Error(`Failed to update ticket status`);
      }
    } catch (error) {
      showErrorAlert('update ticket status', error);
    }
  };

  const assignTicket = async (ticketId: number, assignedTo: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assignedTo })
      });

      if (response.ok) {
        showToast("Ticket assigned successfully!", 'success');
        fetchSupportTickets();
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (error) {
      showErrorAlert('assign ticket', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      active: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
      flagged: 'bg-red-100 text-red-700',
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getPriorityIcon = (priority: SupportTicket['priority']) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };
    return icons[priority];
  };

  if (loading) {
    return <LoadingSpinner message="Loading chat management..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">💬 Chat Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (activeSubTab === 'conversations') {
                exportToCSV(conversations.map(conv => ({
                  id: conv.id,
                  session_id: conv.session_id,
                  mentee: conv.mentee_name,
                  mentor: conv.mentor_name,
                  topic: conv.topic,
                  status: conv.status,
                  unread_count: conv.unread_count,
                  created_at: conv.created_at
                })), 'conversations_data');
              } else if (activeSubTab === 'tickets') {
                exportToCSV(tickets.map(ticket => ({
                  id: ticket.id,
                  user_name: ticket.user_name,
                  subject: ticket.subject,
                  category: ticket.category,
                  priority: ticket.priority,
                  status: ticket.status,
                  created_at: ticket.created_at
                })), 'support_tickets_data');
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
            onClick={() => setActiveSubTab('conversations')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'conversations'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            💬 Conversations
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
            onClick={() => setActiveSubTab('tickets')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'tickets'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            🎫 Support Tickets
          </button>
        </div>
      </div>

      {/* Conversations Tab */}
      {activeSubTab === 'conversations' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Conversations</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(conversation?.mentee_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{conversation?.topic || 'No Topic'}</h3>
                      <p className="text-gray-600">
                        {conversation?.mentee_name || 'Unknown'} ↔ {conversation?.mentor_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {conversation?.last_message || 'No messages'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(conversation?.unread_count || 0) > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                        {conversation?.unread_count || 0}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(conversation?.status || 'unknown')}`}>
                      {conversation?.status || 'unknown'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Last message: {conversation?.last_message_time ? new Date(conversation.last_message_time).toLocaleString() : 'Unknown'}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchMessages(conversation?.session_id || 0);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Messages
                    </button>
                    {(conversation?.status || 'unknown') === 'active' && (
                      <button
                        onClick={() => {
                          // Archive conversation logic would go here
                          showToast("Conversation archived!", 'success');
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Conversations Found</h3>
                <p className="text-gray-600">
                  {filter === "all" ? "No conversations have been started yet." : `No ${filter} conversations found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeSubTab === 'analytics' && analytics && (
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.total_conversations}</div>
              <div className="text-sm text-blue-600">Total Conversations</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.total_messages}</div>
              <div className="text-sm text-green-600">Total Messages</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.messages_today}</div>
              <div className="text-sm text-purple-600">Messages Today</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{analytics.avg_response_time}h</div>
              <div className="text-sm text-orange-600">Avg Response Time</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{analytics.flagged_messages}</div>
              <div className="text-sm text-red-600">Flagged Messages</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">{analytics.active_conversations}</div>
              <div className="text-sm text-indigo-600">Active Conversations</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-teal-600">{analytics.engagement_rate}%</div>
              <div className="text-sm text-teal-600">Engagement Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-pink-600">{analytics.messages_this_week}</div>
              <div className="text-sm text-pink-600">Messages This Week</div>
            </div>
          </div>

          {/* Charts and Trends */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Top Mentors by Messages</h3>
              <div className="space-y-3">
                {analytics.top_mentors_by_messages.map((mentor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{mentor.mentor_name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(mentor.message_count / Math.max(...analytics.top_mentors_by_messages.map(m => m.message_count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{mentor.message_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Daily Message Trend</h3>
              <div className="space-y-2">
                {analytics.daily_message_trend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(day.message_count / Math.max(...analytics.daily_message_trend.map(d => d.message_count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{day.message_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeSubTab === 'tickets' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Tickets</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      {getPriorityIcon(ticket.priority)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{ticket.subject}</h3>
                      <p className="text-gray-600">{ticket.user_name} • {ticket.user_email}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Category</p>
                    <p className="font-semibold capitalize">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Assigned To</p>
                    <p className="font-semibold">{ticket.assigned_to_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Responses</p>
                    <p className="font-semibold">{ticket.response_count}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                    {ticket.resolved_at && (
                      <span className="ml-4">
                        Resolved: {new Date(ticket.resolved_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        fetchTicketResponses(ticket.id);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Responses
                    </button>
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                      >
                        Start Progress
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Support Tickets Found</h3>
                <p className="text-gray-600">
                  {filter === "all" ? "No support tickets have been created yet." : `No ${filter} tickets found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {showMessageModal && selectedConversation && (
        <MessagesModal 
          conversation={selectedConversation}
          messages={messages}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedConversation(null);
            setMessages([]);
          }}
          onFlagMessage={flagMessage}
          onModerateMessage={moderateMessage}
        />
      )}

      {/* Ticket Responses Modal */}
      {showResponseModal && selectedTicket && (
        <TicketResponsesModal 
          ticket={selectedTicket}
          responses={ticketResponses}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedTicket(null);
            setTicketResponses([]);
          }}
        />
      )}
    </div>
  );
};

// Messages Modal Component
const MessagesModal = ({ 
  conversation, 
  messages, 
  onClose, 
  onFlagMessage, 
  onModerateMessage 
}: { 
  conversation: ChatConversation; 
  messages: ChatMessage[]; 
  onClose: () => void; 
  onFlagMessage: (messageId: number, reason: string) => void; 
  onModerateMessage: (messageId: number, status: 'approved' | 'rejected') => void; 
}) => {
  const getStatusColor = (status: string) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">💬 {conversation?.topic || 'Conversation'}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
          <p className="text-purple-100 mt-2">
            {conversation?.mentee_name || 'Unknown'} ↔ {conversation?.mentor_name || 'Unknown'}
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender_role === 'mentor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_role === 'mentor' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{message.sender_name}</span>
                    <div className="flex items-center space-x-1">
                      {message.is_flagged && <span className="text-red-500">🚩</span>}
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(message.moderation_status)}`}>
                        {message.moderation_status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{message.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {new Date(message.sent_at).toLocaleString()}
                    </span>
                    <div className="flex space-x-1">
                      {!message.is_flagged && (
                        <button
                          onClick={() => onFlagMessage(message.id, 'inappropriate')}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Flag
                        </button>
                      )}
                      {message.moderation_status === 'pending' && (
                        <>
                          <button
                            onClick={() => onModerateMessage(message.id, 'approved')}
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onModerateMessage(message.id, 'rejected')}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages in this conversation</p>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
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

// Ticket Responses Modal Component
const TicketResponsesModal = ({ 
  ticket, 
  responses, 
  onClose 
}: { 
  ticket: SupportTicket; 
  responses: TicketResponse[]; 
  onClose: () => void; 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🎫 {ticket.subject}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
          <p className="text-blue-100 mt-2">
            {ticket.user_name} • {ticket.category} • {ticket.priority} priority
          </p>
        </div>
        
        <div className="p-6">
          {/* Original Ticket */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2">Original Request</h3>
            <p className="text-gray-700">{ticket.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Created: {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          {/* Responses */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {responses.map((response) => (
              <div key={response.id} className={`flex ${response.responder_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  response.responder_role === 'admin' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{response.responder_name}</span>
                    <span className="text-xs opacity-75 capitalize">{response.responder_role}</span>
                  </div>
                  <p className="text-sm">{response.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {new Date(response.created_at).toLocaleString()}
                    </span>
                    {response.is_internal && (
                      <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded">
                        Internal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {responses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎫</div>
              <p>No responses yet</p>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
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