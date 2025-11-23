import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyRoadmap - Mentorship & Learning Platform",
  description: "Connect with expert mentors and create personalized learning roadmaps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
