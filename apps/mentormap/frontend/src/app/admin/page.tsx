"use client";

import { useState } from "react";
import { Tab } from './types';
import { useAuth } from './hooks/useAuth';
import { Header, Sidebar } from './components/layout';
import { LoadingSpinner } from './components/ui';
import { DashboardView } from './components/dashboard/DashboardView';
import {
  SessionsManager,
  MenteesDirectory,
  MentorsAndApplicationsManager,
  ChatManager,
  CalendarAndScheduleManager,
  EventsManager,
  NewsletterManager,
  ContentManager,
  PackagesManager
} from './components/managers';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "sessions":
        return <SessionsManager />;
      case "customers":
        return <MenteesDirectory />;
      case "mentors":
        return <MentorsAndApplicationsManager />;
      case "chat":
        return <ChatManager />;
      case "calendar":
        return <CalendarAndScheduleManager />;
      case "events":
        return <EventsManager />;
      case "newsletter":
        return <NewsletterManager />;
      case "content":
        return <ContentManager />;
      case "packages":
        return <PackagesManager />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={logout} />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-8">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}