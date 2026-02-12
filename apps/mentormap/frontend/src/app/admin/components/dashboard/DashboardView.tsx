import { useState, useEffect } from 'react';
import { Stats } from '../../types';
import { API_URL } from '../../constants';
import { showErrorAlert } from '../../utils';
import { StatCard } from '../ui/StatCard';
import { ActivityItem } from '../ui/ActivityItem';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const DashboardView = () => {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    totalMentees: 0,
    totalMentors: 0,
    revenue: 0
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        // Map backend field names to frontend expected names
        setStats({
          totalSessions: data.total_sessions || 0,
          totalMentees: data.active_users || 0,
          totalMentors: data.mentors || 0,
          revenue: data.total_revenue || 0
        });
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      showErrorAlert('fetch dashboard statistics', error);
      setStats({
        totalSessions: 0,
        totalMentees: 0,
        totalMentors: 0,
        revenue: 0
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/activity/recent?limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        // The activity/recent endpoint returns sessions, so we'll use that for recent sessions
        setRecentSessions(data.sessions || []);
      } else {
        setRecentSessions([]);
      }

      // For applications, let's use the mentor-applications endpoint
      try {
        const applicationsResponse = await fetch(`${API_URL}/api/admin/mentor-applications?limit=3`);
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          // Take only the most recent applications
          setRecentApplications(applicationsData.slice(0, 3));
        } else {
          setRecentApplications([]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setRecentApplications([]);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      showErrorAlert('fetch recent activity', error);
      setRecentSessions([]);
      setRecentApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with MentorMap.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📅"
          title="Total Sessions"
          value={stats.totalSessions.toString()}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon="👥"
          title="Active Mentees"
          value={stats.totalMentees.toString()}
          change="+8%"
          changeType="positive"
        />
        <StatCard
          icon="🎓"
          title="Active Mentors"
          value={stats.totalMentors.toString()}
          change="+15%"
          changeType="positive"
        />
        <StatCard
          icon="💰"
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change="+23%"
          changeType="positive"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, index) => (
                <ActivityItem
                  key={session.id || index}
                  title={session.title || 'Session'}
                  subtitle={`${session.mentor_name || 'Unknown Mentor'} with ${session.student_name || 'Unknown Student'}`}
                  time={session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'Unknown time'}
                  status={session.status || 'unknown'}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="text-2xl mb-2">📅</div>
                <p>No recent sessions</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">New Mentor Applications</h3>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((application, index) => (
                <ActivityItem
                  key={application.id || index}
                  title={application.title || 'Application'}
                  subtitle={`${application.name || 'Unknown Applicant'} - ${application.expertise || 'No expertise listed'}`}
                  time={application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Unknown time'}
                  status={application.status || 'unknown'}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="text-2xl mb-2">📋</div>
                <p>No recent applications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};