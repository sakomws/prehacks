export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  username?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, any>
  joined_at: string
  is_platform_admin: boolean
}

export interface Calendar {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  visibility: 'public' | 'unlisted' | 'private'
  cover_image_url?: string
  timezone: string
  is_plus_active: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  calendar_id: string
  host_user_id: string
  title: string
  description?: string
  cover_image_url?: string
  location_type: 'offline' | 'online' | 'hybrid'
  location_address?: string
  location_url?: string
  start_time: string
  end_time: string
  timezone: string
  status: 'draft' | 'published' | 'cancelled'
  visibility: 'public' | 'unlisted' | 'private'
  capacity?: number
  requires_approval: boolean
  ticket_type: 'free' | 'paid' | 'donation'
  ticket_price_cents?: number
  currency: string
  slug: string
  category?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  email?: string
  name?: string
  status: 'invited' | 'pending_approval' | 'confirmed' | 'waitlisted' | 'cancelled' | 'declined' | 'no_show'
  ticket_quantity: number
  checkin_status: 'not_checked_in' | 'checked_in'
  registration_source?: string
  payment_id?: string
  created_at: string
  updated_at: string
}