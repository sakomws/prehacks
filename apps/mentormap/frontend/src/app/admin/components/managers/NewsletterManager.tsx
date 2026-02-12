import { useState, useEffect } from 'react';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Types
interface NewsletterSubscriber {
  id: number;
  email: string;
  full_name: string;
  user_type: string;
  location?: string;
  preferences: string[];
  tags: string[];
  is_active: boolean;
  engagement_score: number;
  subscribed_at: string;
  last_opened?: string;
  unsubscribed_at?: string;
}

interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  total_recipients: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  open_rate: number;
  click_rate: number;
  template_name?: string;
  creator_name: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  description: string;
  subject_template: string;
  template_type: string;
  is_active: boolean;
  variables: string[];
  created_at: string;
  creator_name: string;
}

interface AnalyticsOverview {
  period_days: number;
  campaign_metrics: {
    total_campaigns: number;
    total_emails_sent: number;
    total_emails_delivered: number;
    total_emails_opened: number;
    total_emails_clicked: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
  };
  subscriber_metrics: {
    new_subscribers: number;
    unsubscribed: number;
    net_growth: number;
  };
  top_campaigns: Array<{
    id: number;
    name: string;
    subject: string;
    emails_opened: number;
    open_rate: number;
    sent_at?: string;
  }>;
}

export const NewsletterManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'subscribers' | 'campaigns' | 'templates' | 'analytics'>('subscribers');
  const [loading, setLoading] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberFilters, setSubscriberFilters] = useState({
    status: 'all',
    user_type: 'all',
    segment: 'all'
  });
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [showEditSubscriberModal, setShowEditSubscriberModal] = useState(false);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [campaignFilters, setCampaignFilters] = useState({ status: 'all' });
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateFilters, setTemplateFilters] = useState({ template_type: 'all', is_active: null });
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    if (activeSubTab === 'subscribers') {
      fetchSubscribers();
    } else if (activeSubTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeSubTab === 'templates') {
      fetchTemplates();
    } else if (activeSubTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeSubTab, subscriberFilters, campaignFilters, templateFilters]);

  // Fetch functions
  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(subscriberFilters).forEach(([key, value]) => {
        if (value !== 'all' && value !== null) params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/api/admin/newsletter/subscribers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } else {
        throw new Error('Failed to fetch subscribers');
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      showErrorAlert('fetch subscribers', error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const params = new URLSearchParams();
      if (campaignFilters.status !== 'all') params.append('status', campaignFilters.status);
      
      const response = await fetch(`${API_URL}/api/admin/newsletter/campaigns?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      showErrorAlert('fetch campaigns', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(templateFilters).forEach(([key, value]) => {
        if (value !== 'all' && value !== null) params.append(key, value.toString());
      });
      
      const response = await fetch(`${API_URL}/api/admin/newsletter/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        throw new Error('Failed to fetch templates');
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      showErrorAlert('fetch templates', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/analytics/overview`);
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

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      draft: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-orange-100 text-orange-700',
      sent: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      mentee: 'bg-purple-100 text-purple-700',
      mentor: 'bg-blue-100 text-blue-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getEngagementIcon = (score: number) => {
    if (score >= 70) return '🔥';
    if (score >= 50) return '👍';
    if (score >= 30) return '😐';
    return '😴';
  };

  // Unsubscribe handler
  const handleUnsubscribe = async (subscriberId: number) => {
    if (!confirm("Are you sure you want to unsubscribe this subscriber?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/newsletter/subscribers/${subscriberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: false,
            unsubscribed_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        showToast("Subscriber unsubscribed successfully", "success");
        fetchSubscribers(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({ detail: "Failed to unsubscribe" }));
        throw new Error(errorData.detail || "Failed to unsubscribe");
      }
    } catch (error) {
      showErrorAlert("unsubscribe subscriber", error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading newsletter management..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📧 Newsletter Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (activeSubTab === 'subscribers') setShowAddSubscriberModal(true);
              else if (activeSubTab === 'campaigns') setShowCreateCampaignModal(true);
              else if (activeSubTab === 'templates') setShowCreateTemplateModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {activeSubTab === 'subscribers' && 'Add Subscriber'}
            {activeSubTab === 'campaigns' && 'Create Campaign'}
            {activeSubTab === 'templates' && 'Create Template'}
            {activeSubTab === 'analytics' && 'Export Report'}
          </button>
          <button
            onClick={() => {
              if (activeSubTab === 'subscribers') {
                exportToCSV(subscribers.map(sub => ({
                  email: sub.email,
                  full_name: sub.full_name,
                  user_type: sub.user_type,
                  location: sub.location,
                  engagement_score: sub.engagement_score,
                  is_active: sub.is_active,
                  subscribed_at: sub.subscribed_at
                })), 'newsletter_subscribers');
              } else if (activeSubTab === 'campaigns') {
                exportToCSV(campaigns.map(campaign => ({
                  name: campaign.name,
                  subject: campaign.subject,
                  status: campaign.status,
                  total_recipients: campaign.total_recipients,
                  open_rate: campaign.open_rate,
                  click_rate: campaign.click_rate,
                  sent_at: campaign.sent_at
                })), 'email_campaigns');
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
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'subscribers'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            👥 Subscribers
          </button>
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'campaigns'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📬 Campaigns
          </button>
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'templates'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📝 Templates
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'analytics'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Subscribers Tab */}
      {activeSubTab === 'subscribers' && (
        <SubscribersManagement 
          subscribers={subscribers}
          filters={subscriberFilters}
          setFilters={setSubscriberFilters}
          onEdit={(subscriber: NewsletterSubscriber) => {
            setSelectedSubscriber(subscriber);
            setShowEditSubscriberModal(true);
          }}
          onUnsubscribe={handleUnsubscribe}
          getStatusColor={getStatusColor}
          getEngagementIcon={getEngagementIcon}
        />
      )}

      {/* Campaigns Tab */}
      {activeSubTab === 'campaigns' && (
        <CampaignsManagement 
          campaigns={campaigns}
          filters={campaignFilters}
          setFilters={setCampaignFilters}
          onEdit={(campaign: EmailCampaign) => setSelectedCampaign(campaign)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Templates Tab */}
      {activeSubTab === 'templates' && (
        <TemplatesManagement 
          templates={templates}
          filters={templateFilters}
          setFilters={setTemplateFilters}
          onEdit={(template: EmailTemplate) => setSelectedTemplate(template)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Analytics Tab */}
      {activeSubTab === 'analytics' && analytics && (
        <AnalyticsView analytics={analytics} />
      )}

      {/* Modals */}
      {showAddSubscriberModal && (
        <SubscriberFormModal 
          onClose={() => setShowAddSubscriberModal(false)}
          onSuccess={() => {
            setShowAddSubscriberModal(false);
            fetchSubscribers();
          }}
          title="Add New Subscriber"
        />
      )}

      {showEditSubscriberModal && selectedSubscriber && (
        <SubscriberFormModal 
          subscriber={selectedSubscriber}
          onClose={() => {
            setShowEditSubscriberModal(false);
            setSelectedSubscriber(null);
          }}
          onSuccess={() => {
            setShowEditSubscriberModal(false);
            setSelectedSubscriber(null);
            fetchSubscribers();
          }}
          title="Edit Subscriber"
        />
      )}

      {showCreateCampaignModal && (
        <CampaignFormModal 
          onClose={() => setShowCreateCampaignModal(false)}
          onSuccess={() => {
            setShowCreateCampaignModal(false);
            fetchCampaigns();
          }}
          title="Create Email Campaign"
        />
      )}

      {showCreateTemplateModal && (
        <TemplateFormModal 
          onClose={() => setShowCreateTemplateModal(false)}
          onSuccess={() => {
            setShowCreateTemplateModal(false);
            fetchTemplates();
          }}
          title="Create Email Template"
        />
      )}
    </div>
  );
};

// Subscribers Management Component
const SubscribersManagement = ({ 
  subscribers, 
  filters, 
  setFilters, 
  onEdit,
  onUnsubscribe,
  getStatusColor,
  getEngagementIcon 
}: any) => {
  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">User Type</label>
            <select
              value={filters.user_type}
              onChange={(e) => setFilters({...filters, user_type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="mentee">Mentees</option>
              <option value="mentor">Mentors</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Engagement</label>
            <select
              value={filters.segment}
              onChange={(e) => setFilters({...filters, segment: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Segments</option>
              <option value="high_engagement">High Engagement</option>
              <option value="low_engagement">Low Engagement</option>
              <option value="recent_subscribers">Recent Subscribers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="space-y-4">
        {subscribers.map((subscriber: NewsletterSubscriber) => (
          <div key={subscriber.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                  {getEngagementIcon(subscriber.engagement_score)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{subscriber.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{subscriber.email}</p>
                  {subscriber.location && (
                    <p className="text-sm text-gray-500">📍 {subscriber.location}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscriber.is_active ? 'active' : 'inactive')}`}>
                  {subscriber.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscriber.user_type)}`}>
                  {subscriber.user_type}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Engagement Score</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${subscriber.engagement_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{subscriber.engagement_score}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Subscribed</p>
                <p className="font-semibold">{new Date(subscriber.subscribed_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Last Opened</p>
                <p className="font-semibold">
                  {subscriber.last_opened ? new Date(subscriber.last_opened).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Preferences</p>
                <p className="font-semibold">{subscriber.preferences.length} topics</p>
              </div>
            </div>

            {(subscriber.preferences.length > 0 || subscriber.tags.length > 0) && (
              <div className="mb-4">
                {subscriber.preferences.length > 0 && (
                  <div className="mb-2">
                    <p className="text-gray-600 text-sm mb-1">Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {subscriber.preferences.slice(0, 3).map((pref, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {pref}
                        </span>
                      ))}
                      {subscriber.preferences.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{subscriber.preferences.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {subscriber.tags.length > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {subscriber.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                      {subscriber.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{subscriber.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(subscriber)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              {subscriber.is_active && (
                <button
                  onClick={() => onUnsubscribe(subscriber.id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Unsubscribe
                </button>
              )}
            </div>
          </div>
        ))}

        {subscribers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Subscribers Found</h3>
            <p className="text-gray-600">No subscribers match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Campaigns Management Component
const CampaignsManagement = ({ campaigns, filters, setFilters, onEdit, getStatusColor }: any) => {
  const sendCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/campaigns/${campaignId}/send`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showToast("Campaign sent successfully!", 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      showErrorAlert('send campaign', error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Campaigns</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign: EmailCampaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{campaign.name}</h3>
                <p className="text-gray-600">{campaign.subject}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                  {campaign.sent_at && (
                    <span className="ml-4">
                      Sent: {new Date(campaign.sent_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                {campaign.template_name && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {campaign.template_name}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Recipients</p>
                <p className="font-semibold text-lg">{campaign.total_recipients.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="font-semibold text-lg">{campaign.emails_delivered.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Opened</p>
                <p className="font-semibold text-lg">{campaign.emails_opened.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Open Rate</p>
                <p className="font-semibold text-lg text-blue-600">{campaign.open_rate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Click Rate</p>
                <p className="font-semibold text-lg text-green-600">{campaign.click_rate.toFixed(1)}%</p>
              </div>
            </div>

            {campaign.status === 'sent' && (
              <div className="mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Open Rate Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(campaign.open_rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Click Rate Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(campaign.click_rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Created by: {campaign.creator_name}
                {campaign.scheduled_at && (
                  <span className="ml-4">
                    Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {campaign.status === 'draft' && (
                  <>
                    <button
                      onClick={() => onEdit(campaign)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => sendCampaign(campaign.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      Send Now
                    </button>
                  </>
                )}
                {campaign.status === 'sent' && (
                  <button
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                  >
                    View Analytics
                  </button>
                )}
                {campaign.status === 'scheduled' && (
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                  >
                    Cancel Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Found</h3>
            <p className="text-gray-600">No campaigns match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TemplatesManagement = ({ templates, filters, setFilters, onEdit, getStatusColor }: any) => {
  const toggleTemplateStatus = async (templateId: number, isActive: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        showToast(`Template ${!isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      showErrorAlert('update template', error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Type</label>
            <select
              value={filters.template_type}
              onChange={(e) => setFilters({...filters, template_type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="welcome">Welcome</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.is_active === null ? 'all' : filters.is_active.toString()}
              onChange={(e) => setFilters({
                ...filters, 
                is_active: e.target.value === 'all' ? null : e.target.value === 'true'
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Templates</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template: EmailTemplate) => (
          <div key={template.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{template.name}</h3>
                <p className="text-gray-600">{template.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Subject: {template.subject_template}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(template.is_active ? 'active' : 'inactive')}`}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(template.template_type)}`}>
                  {template.template_type}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Template Type</p>
                <p className="font-semibold capitalize">{template.template_type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Variables</p>
                <p className="font-semibold">{template.variables.length} variables</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Created</p>
                <p className="font-semibold">{new Date(template.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {template.variables.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Available Variables</p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Created by: {template.creator_name}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(template)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  Preview
                </button>
                <button
                  onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    template.is_active 
                      ? 'bg-gray-500 text-white hover:bg-gray-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {template.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-600">No templates match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsView = ({ analytics }: { analytics: AnalyticsOverview }) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Campaigns</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.campaign_metrics.total_campaigns}</p>
            </div>
            <div className="text-4xl">📬</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Emails Sent</p>
              <p className="text-3xl font-bold text-green-600">{analytics.campaign_metrics.total_emails_sent.toLocaleString()}</p>
            </div>
            <div className="text-4xl">📧</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open Rate</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.campaign_metrics.open_rate.toFixed(1)}%</p>
            </div>
            <div className="text-4xl">👀</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Click Rate</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.campaign_metrics.click_rate.toFixed(1)}%</p>
            </div>
            <div className="text-4xl">🖱️</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📊 Campaign Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Delivery Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.campaign_metrics.delivery_rate}%` }}
                  ></div>
                </div>
                <span className="font-semibold">{analytics.campaign_metrics.delivery_rate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Open Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analytics.campaign_metrics.open_rate}%` }}
                  ></div>
                </div>
                <span className="font-semibold">{analytics.campaign_metrics.open_rate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Click Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${analytics.campaign_metrics.click_rate}%` }}
                  ></div>
                </div>
                <span className="font-semibold">{analytics.campaign_metrics.click_rate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">👥 Subscriber Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-green-600 font-semibold">New Subscribers</p>
                <p className="text-2xl font-bold text-green-700">+{analytics.subscriber_metrics.new_subscribers}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-red-600 font-semibold">Unsubscribed</p>
                <p className="text-2xl font-bold text-red-700">-{analytics.subscriber_metrics.unsubscribed}</p>
              </div>
              <div className="text-3xl">📉</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-blue-600 font-semibold">Net Growth</p>
                <p className={`text-2xl font-bold ${
                  analytics.subscriber_metrics.net_growth >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {analytics.subscriber_metrics.net_growth >= 0 ? '+' : ''}{analytics.subscriber_metrics.net_growth}
                </p>
              </div>
              <div className="text-3xl">{analytics.subscriber_metrics.net_growth >= 0 ? '🎯' : '⚠️'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🏆 Top Performing Campaigns</h3>
        <div className="space-y-4">
          {analytics.top_campaigns.map((campaign, index) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{campaign.name}</p>
                  <p className="text-sm text-gray-600">{campaign.subject}</p>
                  {campaign.sent_at && (
                    <p className="text-xs text-gray-500">
                      Sent: {new Date(campaign.sent_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{campaign.emails_opened.toLocaleString()} opens</p>
                <p className="text-sm text-gray-600">{campaign.open_rate.toFixed(1)}% open rate</p>
              </div>
            </div>
          ))}
          
          {analytics.top_campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📬</div>
              <p>No campaigns to display yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📈 Detailed Metrics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">Total Delivered</p>
            <p className="text-2xl font-bold text-blue-700">
              {analytics.campaign_metrics.total_emails_delivered.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {analytics.campaign_metrics.delivery_rate.toFixed(1)}% delivery rate
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-600 text-sm font-medium">Total Opened</p>
            <p className="text-2xl font-bold text-purple-700">
              {analytics.campaign_metrics.total_emails_opened.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {analytics.campaign_metrics.open_rate.toFixed(1)}% open rate
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-green-600 text-sm font-medium">Total Clicked</p>
            <p className="text-2xl font-bold text-green-700">
              {analytics.campaign_metrics.total_emails_clicked.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {analytics.campaign_metrics.click_rate.toFixed(1)}% click rate
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📊 Export Analytics</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              exportToCSV([{
                period_days: analytics.period_days,
                total_campaigns: analytics.campaign_metrics.total_campaigns,
                total_emails_sent: analytics.campaign_metrics.total_emails_sent,
                delivery_rate: analytics.campaign_metrics.delivery_rate,
                open_rate: analytics.campaign_metrics.open_rate,
                click_rate: analytics.campaign_metrics.click_rate,
                new_subscribers: analytics.subscriber_metrics.new_subscribers,
                unsubscribed: analytics.subscriber_metrics.unsubscribed,
                net_growth: analytics.subscriber_metrics.net_growth
              }], 'newsletter_analytics_overview');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Overview
          </button>
          <button
            onClick={() => {
              exportToCSV(analytics.top_campaigns.map(campaign => ({
                campaign_name: campaign.name,
                subject: campaign.subject,
                emails_opened: campaign.emails_opened,
                open_rate: campaign.open_rate,
                sent_at: campaign.sent_at
              })), 'top_campaigns');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Export Top Campaigns
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal components - Comprehensive Implementation
const SubscriberFormModal = ({ subscriber, onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    email: string;
    full_name: string;
    user_type: string;
    location: string;
    preferences: string[];
    tags: string[];
    engagement_score: number;
    is_active: boolean;
  }>({
    email: subscriber?.email || '',
    full_name: subscriber?.full_name || '',
    user_type: subscriber?.user_type || 'general',
    location: subscriber?.location || '',
    preferences: subscriber?.preferences || [],
    tags: subscriber?.tags || [],
    engagement_score: subscriber?.engagement_score || 50,
    is_active: subscriber?.is_active !== undefined ? subscriber.is_active : true
  });
  const [loading, setLoading] = useState(false);
  const [availablePreferences] = useState([
    'Career Development', 'Technical Skills', 'Leadership', 'Entrepreneurship',
    'Product Management', 'Design', 'Marketing', 'Finance', 'Networking'
  ]);
  const [newPreference, setNewPreference] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = subscriber 
        ? `${API_URL}/api/admin/newsletter/subscribers/${subscriber.id}`
        : `${API_URL}/api/admin/newsletter/subscribers`;
      
      const method = subscriber ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          subscriber ? 'Subscriber updated successfully!' : 'Subscriber created successfully!',
          'success'
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save subscriber');
      }
    } catch (error) {
      showErrorAlert(subscriber ? 'update subscriber' : 'create subscriber', error);
    } finally {
      setLoading(false);
    }
  };

  const addPreference = (preference: string) => {
    if (preference && !formData.preferences.includes(preference)) {
      setFormData({
        ...formData,
        preferences: [...formData.preferences, preference]
      });
    }
  };

  const removePreference = (preference: string) => {
    setFormData({
      ...formData,
      preferences: formData.preferences.filter(p => p !== preference)
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">User Type</label>
              <select
                value={formData.user_type}
                onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="mentee">Mentee</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Engagement Score */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Engagement Score: {formData.engagement_score}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.engagement_score}
              onChange={(e) => setFormData({...formData, engagement_score: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (0%)</span>
              <span>Medium (50%)</span>
              <span>High (100%)</span>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium mb-2">Content Preferences</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.preferences.map((preference, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{preference}</span>
                    <button
                      type="button"
                      onClick={() => removePreference(preference)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addPreference(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select a preference...</option>
                  {availablePreferences
                    .filter(pref => !formData.preferences.includes(pref))
                    .map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))
                  }
                </select>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    placeholder="Custom preference"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPreference.trim()) {
                        addPreference(newPreference.trim());
                        setNewPreference('');
                      }
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-green-500 hover:text-green-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim()) {
                        addTag(newTag.trim());
                        setNewTag('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) {
                      addTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Active Subscription</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (subscriber ? 'Update Subscriber' : 'Create Subscriber')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CampaignFormModal = ({ onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    template_id: '',
    segment_criteria: {
      user_type: 'all',
      engagement_level: 'all',
      location: '',
      tags: []
    },
    schedule_type: 'send_now', // 'send_now' or 'schedule'
    scheduled_at: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);

  useEffect(() => {
    fetchTemplates();
    calculateRecipients();
  }, [formData.segment_criteria]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/templates?is_active=true`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const calculateRecipients = async () => {
    try {
      const params = new URLSearchParams();
      if (formData.segment_criteria.user_type !== 'all') {
        params.append('user_type', formData.segment_criteria.user_type);
      }
      if (formData.segment_criteria.engagement_level !== 'all') {
        params.append('segment', `${formData.segment_criteria.engagement_level}_engagement`);
      }
      
      const response = await fetch(`${API_URL}/api/admin/newsletter/subscribers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEstimatedRecipients(data.total_count || 0);
      }
    } catch (error) {
      console.error('Error calculating recipients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        ...formData,
        scheduled_at: formData.schedule_type === 'schedule' ? formData.scheduled_at : null
      };

      const response = await fetch(`${API_URL}/api/admin/newsletter/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        showToast('Campaign created successfully!', 'success');
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create campaign');
      }
    } catch (error) {
      showErrorAlert('create campaign', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Template</label>
            <select
              value={formData.template_id}
              onChange={(e) => setFormData({...formData, template_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a template...</option>
              {templates.map((template: any) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.template_type})
                </option>
              ))}
            </select>
          </div>

          {/* Audience Segmentation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🎯 Audience Targeting</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User Type</label>
                <select
                  value={formData.segment_criteria.user_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    segment_criteria: {...formData.segment_criteria, user_type: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="mentee">Mentees Only</option>
                  <option value="mentor">Mentors Only</option>
                  <option value="general">General Subscribers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Engagement Level</label>
                <select
                  value={formData.segment_criteria.engagement_level}
                  onChange={(e) => setFormData({
                    ...formData,
                    segment_criteria: {...formData.segment_criteria, engagement_level: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Engagement Levels</option>
                  <option value="high">High Engagement (70%+)</option>
                  <option value="medium">Medium Engagement (30-70%)</option>
                  <option value="low">Low Engagement (&lt;30%)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-semibold">📊 Estimated Recipients:</span>
                <span className="text-2xl font-bold text-blue-700">{estimatedRecipients.toLocaleString()}</span>
                <span className="text-blue-600">subscribers</span>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">⏰ Scheduling</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="schedule_type"
                    value="send_now"
                    checked={formData.schedule_type === 'send_now'}
                    onChange={(e) => setFormData({...formData, schedule_type: e.target.value})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Send Immediately</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="schedule_type"
                    value="schedule"
                    checked={formData.schedule_type === 'schedule'}
                    onChange={(e) => setFormData({...formData, schedule_type: e.target.value})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Schedule for Later</span>
                </label>
              </div>
              
              {formData.schedule_type === 'schedule' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Enter your email content here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              This content will be merged with the selected template.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={loading || estimatedRecipients === 0}
            >
              {loading ? 'Creating...' : (
                formData.schedule_type === 'send_now' ? 'Create & Send Campaign' : 'Schedule Campaign'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TemplateFormModal = ({ onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    subject_template: string;
    template_type: string;
    html_content: string;
    variables: string[];
    is_active: boolean;
  }>({
    name: '',
    description: '',
    subject_template: '',
    template_type: 'newsletter',
    html_content: '',
    variables: [],
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [newVariable, setNewVariable] = useState('');
  const [availableVariables] = useState([
    'company_name', 'user_name', 'user_email', 'unsubscribe_link',
    'current_date', 'month', 'year', 'featured_content', 'welcome_link'
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Template created successfully!', 'success');
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create template');
      }
    } catch (error) {
      showErrorAlert('create template', error);
    } finally {
      setLoading(false);
    }
  };

  const addVariable = (variable: string) => {
    if (variable && !formData.variables.includes(variable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variable]
      });
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html_content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      
      setFormData({...formData, html_content: newText});
      
      // Add variable to list if not already there
      addVariable(variable);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Template Type</label>
              <select
                value={formData.template_type}
                onChange={(e) => setFormData({...formData, template_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="welcome">Welcome Email</option>
                <option value="newsletter">Newsletter</option>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of this template"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject Template *</label>
            <input
              type="text"
              value={formData.subject_template}
              onChange={(e) => setFormData({...formData, subject_template: e.target.value})}
              placeholder="e.g., Welcome to {{company_name}}, {{user_name}}!"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Use double curly braces for dynamic content: {'{'}{'{'} variable_name {'}'}{'}'}
            </p>
          </div>

          {/* Variables Management */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🔧 Template Variables</h3>
            
            {/* Current Variables */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Current Variables</label>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center space-x-1 font-mono"
                  >
                    <span>{'{'}{'{'}{variable}{'}'}{'}'}</span>
                    <button
                      type="button"
                      onClick={() => removeVariable(variable)}
                      className="text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {formData.variables.length === 0 && (
                  <span className="text-gray-500 text-sm">No variables added yet</span>
                )}
              </div>
            </div>

            {/* Add Variables */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quick Add Variables</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableVariables
                    .filter(variable => !formData.variables.includes(variable))
                    .map(variable => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => addVariable(variable)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 font-mono"
                      >
                        {variable}
                      </button>
                    ))
                  }
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Custom Variable</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="variable_name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newVariable.trim()) {
                        addVariable(newVariable.trim());
                        setNewVariable('');
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* HTML Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">HTML Content *</label>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-500">Insert Variable:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariable(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="">Select...</option>
                  {availableVariables.map(variable => (
                    <option key={variable} value={variable}>{variable}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              id="html_content"
              value={formData.html_content}
              onChange={(e) => setFormData({...formData, html_content: e.target.value})}
              placeholder="Enter your HTML email template here..."
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Use HTML tags for formatting. Variables will be replaced with actual values.
              </p>
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                onClick={() => {
                  const preview = window.open('', '_blank');
                  if (preview) {
                    preview.document.write(formData.html_content);
                    preview.document.close();
                  }
                }}
              >
                Preview HTML
              </button>
            </div>
          </div>

          {/* Template Status */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium">Active Template</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};