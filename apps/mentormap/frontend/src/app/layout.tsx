import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorMap - Mentorship & Learning Platform",
  description: "Connect with expert mentors and create personalized learning roadmaps to achieve your career goals",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
