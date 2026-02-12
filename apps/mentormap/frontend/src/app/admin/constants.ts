export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const TABS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "sessions", icon: "📅", label: "Sessions & Gifts" },
  { id: "customers", icon: "👥", label: "Mentees" },
  { id: "mentors", icon: "🎓", label: "Mentors" },
  { id: "chat", icon: "💬", label: "Messages" },
  { id: "calendar", icon: "📆", label: "Calendar" },
  { id: "events", icon: "🎯", label: "Events" },
  { id: "newsletter", icon: "📧", label: "Newsletter" },
  { id: "content", icon: "📝", label: "Content" },
  { id: "packages", icon: "📦", label: "Packages" },
] as const;

export const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  scheduled: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
} as const;

export const TOAST_DURATION = 4000;
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_RETRY_DELAY = 1000;