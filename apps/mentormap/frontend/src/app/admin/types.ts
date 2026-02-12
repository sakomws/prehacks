export type Tab = "dashboard" | "sessions" | "customers" | "mentors" | "chat" | "calendar" | "events" | "newsletter" | "content" | "packages";

export interface User {
  name: string;
  role: string;
}

export interface Stats {
  totalSessions: number;
  totalMentees: number;
  totalMentors: number;
  revenue: number;
}

export interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

export interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

export interface TabButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface Mentor {
  id: number;
  name: string;
  email: string;
  title: string;
  bio: string;
  expertise: string[] | string;
  hourly_rate: number;
  linkedin_url?: string;
  website_url?: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface MentorApplication {
  id: number;
  name: string;
  email: string;
  title: string;
  bio: string;
  expertise: string;
  hourly_rate: number;
  linkedin_url?: string;
  website_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export interface MentorPerformance {
  mentor_id: number;
  mentor_name: string;
  mentor_title: string;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  total_revenue: number;
  avg_rating: number;
  hourly_rate: number;
}

export interface AvailabilitySlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface Session {
  id: number;
  title: string;
  mentor_name: string;
  student_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  price: number;
  payment_status: 'paid' | 'pending' | 'refunded';
  rating?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  type: 'session' | 'availability' | 'time_off';
  mentor_id?: number;
  mentor_name?: string;
  student_name?: string;
  status?: string;
}

export interface MentorSchedule {
  mentor_id: number;
  mentor_name: string;
  mentor_title: string;
  availability_slots: AvailabilitySlot[];
  sessions: Session[];
  time_off_periods: TimeOffPeriod[];
}

export interface TimeOffPeriod {
  id: number;
  mentor_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  notes?: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface CalendarStats {
  total_sessions_today: number;
  total_sessions_week: number;
  active_mentors: number;
  upcoming_sessions: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: 'workshop' | 'webinar' | 'networking' | 'conference' | 'other';
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration_minutes: number;
  location?: string;
  is_virtual: boolean;
  meeting_url?: string;
  max_attendees?: number;
  price: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  // Frontend-only fields for form handling
  start_date?: string; // datetime-local format for forms
  end_date?: string; // datetime-local format for forms
  virtual_link?: string; // alias for meeting_url
  registration_deadline?: string;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  registration_date: string;
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  notes?: string;
}

export interface EventAnalytics {
  event_id: number;
  total_registrations: number;
  total_attendees: number;
  attendance_rate: number;
  total_revenue: number;
  registration_trend: Array<{
    date: string;
    registrations: number;
  }>;
  demographics: {
    by_role: Array<{ role: string; count: number }>;
    by_location: Array<{ location: string; count: number }>;
  };
}

export interface User {
  name: string;
  role: string;
}

export interface Stats {
  totalSessions: number;
  totalMentees: number;
  totalMentors: number;
  revenue: number;
}

export interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

export interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

export interface TabButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

// Chat Management Types
export interface ChatConversation {
  id: number;
  session_id: number;
  mentee_name: string;
  mentor_name: string;
  topic: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'archived' | 'flagged';
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: 'mentor' | 'mentee' | 'admin';
  message: string;
  sent_at: string;
  is_read: boolean;
  is_flagged: boolean;
  flag_reason?: string;
  moderation_status: 'approved' | 'pending' | 'rejected';
}

export interface MessageAnalytics {
  total_conversations: number;
  total_messages: number;
  messages_today: number;
  messages_this_week: number;
  avg_response_time: number;
  flagged_messages: number;
  active_conversations: number;
  engagement_rate: number;
  top_mentors_by_messages: Array<{
    mentor_name: string;
    message_count: number;
  }>;
  daily_message_trend: Array<{
    date: string;
    message_count: number;
  }>;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'general' | 'report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: number;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  response_count: number;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  responder_id: number;
  responder_name: string;
  responder_role: 'admin' | 'support' | 'user';
  message: string;
  created_at: string;
  is_internal: boolean;
}
// Mentee Management Types
export interface Mentee {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  timezone?: string;
  occupation?: string;
  company?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  interests: string[];
  preferred_communication: 'video' | 'audio' | 'chat';
  availability: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  total_sessions: number;
  completed_sessions: number;
  total_spent: number;
  avg_rating_given: number;
  last_session_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeAnalytics {
  mentee_id: number;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  completion_rate: number;
  total_spent: number;
  avg_session_rating: number;
  favorite_topics: Array<{
    topic: string;
    count: number;
  }>;
  session_frequency: number; // sessions per month
  engagement_score: number;
  progress_metrics: {
    goals_achieved: number;
    total_goals: number;
    skill_improvements: Array<{
      skill: string;
      improvement_score: number;
    }>;
  };
  session_history: Array<{
    date: string;
    mentor_name: string;
    topic: string;
    rating: number;
    status: string;
  }>;
}

export interface MenteeProgress {
  mentee_id: number;
  goals: Array<{
    id: number;
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    target_date?: string;
    completion_date?: string;
    progress_percentage: number;
  }>;
  skills: Array<{
    skill: string;
    current_level: number;
    target_level: number;
    progress_percentage: number;
    last_updated: string;
  }>;
  milestones: Array<{
    id: number;
    title: string;
    description: string;
    achieved_date?: string;
    is_achieved: boolean;
  }>;
}

export interface GiftSession {
  id: number;
  gift_code: string;
  mentor_id: number;
  mentor_name: string;
  mentor_title: string;
  recipient_name: string;
  recipient_email: string;
  sender_name: string;
  sender_email: string;
  message?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  value: number;
  purchased_at: string;
  expires_at: string;
  redeemed_at?: string;
  redeemed_by?: number;
  session_id?: number;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;
  avg_session_value: number;
  top_mentors_by_revenue: Array<{
    mentor_id: number;
    mentor_name: string;
    revenue: number;
    sessions: number;
  }>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    sessions: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}
// Sessions Management Types
export interface Session {
  id: number;
  title: string;
  description?: string;
  student_name: string;
  student_email: string;
  mentor_name: string;
  mentor_email: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  price: number;
  duration_minutes: number;
  duration_hours: number;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  notes?: string;
  meeting_url?: string;
  feedback_rating?: number;
  feedback_comment?: string;
  is_gift_session: boolean;
  revenue: number;
}

export interface GiftSession {
  id: number;
  purchaser_name: string;
  purchaser_email: string;
  recipient_name: string;
  recipient_email: string;
  message?: string;
  amount: number;
  status: 'active' | 'redeemed' | 'expired';
  created_at: string;
  redeemed_at?: string;
  expires_at?: string;
  session_id?: number;
  session_title?: string;
}

export interface SessionAnalytics {
  period_days: number;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  total_revenue: number;
  pending_revenue: number;
  avg_session_price: number;
  status_breakdown: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  daily_trend: Array<{
    date: string;
    sessions: number;
  }>;
}

export interface MentorPerformance {
  mentor_id: number;
  mentor_name: string;
  mentor_email: string;
  title: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  completion_rate: number;
  total_revenue: number;
  avg_rating: number;
  total_ratings: number;
  hourly_rate: number;
}

export interface RevenueAnalytics {
  period_days: number;
  total_revenue: number;
  total_paid_sessions: number;
  avg_revenue_per_session: number;
  top_mentors_by_revenue: Array<{
    mentor_name: string;
    revenue: number;
  }>;
  monthly_revenue_trend: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface GiftSessionAnalytics {
  period_days: number;
  total_gift_sessions: number;
  redeemed_sessions: number;
  expired_sessions: number;
  active_sessions: number;
  redemption_rate: number;
  total_gift_revenue: number;
  redeemed_revenue: number;
  pending_revenue: number;
}