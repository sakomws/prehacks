import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Covibe.ai - AI-Powered Coding Agent",
  description: "Intelligent code generation, analysis, and refactoring with AI",
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
