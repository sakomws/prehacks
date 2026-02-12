"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Tab = "profile" | "goals" | "sessions" | "payments" | "mentor-application";

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in URL query params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Save token to localStorage
      localStorage.setItem('token', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // TODO: Replace with actual auth check
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push("/login");
        return;
      }
      // Mock user for now
      setUser({ name: "Sarah Johnson", email: "sarah@example.com", role: "mentee" });
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                MentorMap
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-500">
              Back to Site
            </Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64">
            <div className="bg-white rounded-lg shadow p-4 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="font-bold text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <nav className="space-y-2">
                <TabButton
                  icon="👤"
                  label="Profile"
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <TabButton
                  icon="🎯"
                  label="My Goals"
                  active={activeTab === "goals"}
                  onClick={() => setActiveTab("goals")}
                />
                <TabButton
                  icon="📅"
                  label="Sessions"
                  active={activeTab === "sessions"}
                  onClick={() => setActiveTab("sessions")}
                />
                <TabButton
                  icon="💳"
                  label="Payments"
                  active={activeTab === "payments"}
                  onClick={() => setActiveTab("payments")}
                />
                <TabButton
                  icon="🎓"
                  label="Become Mentor"
                  active={activeTab === "mentor-application"}
                  onClick={() => setActiveTab("mentor-application")}
                />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "goals" && <GoalsSection />}
            {activeTab === "sessions" && <SessionsSection />}
            {activeTab === "payments" && <PaymentsSection />}
            {activeTab === "mentor-application" && <MentorApplicationSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        active
          ? "bg-purple-500 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      
      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:8000/api/mentor-applications/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUploading(false);
        alert('Profile image updated successfully!');
      } else {
        throw new Error(result.detail || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mentee Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">S</span>
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 bg-purple-500 text-white rounded-full p-2 cursor-pointer hover:bg-purple-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <p className="text-sm text-gray-600">Upload a professional photo</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Sarah Johnson"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              defaultValue="sarah@example.com"
              disabled={true}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed (LinkedIn account)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="(555) 123-4567"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              defaultValue="San Francisco, CA"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Current Role & Company</label>
          <input
            type="text"
            defaultValue="Software Engineer at Tech Corp"
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Career Goals</label>
          <textarea
            defaultValue="Looking to transition into product management and develop leadership skills to advance my career in tech."
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Skills & Interests</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["JavaScript", "React", "Product Management", "Leadership", "Career Development"].map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Add skills (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Account Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">8</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">2</p>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>

        {/* LinkedIn Connection Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900">Connected via LinkedIn</h4>
              <p className="text-sm text-blue-700">Your account is securely linked to your LinkedIn profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsSection() {
  const [showAddGoal, setShowAddGoal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Goals</h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          + Add Goal
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GoalCard
          title="Career Transition"
          description="Transition from Software Engineering to Product Management"
          progress={65}
          mentor="Alex Rodriguez"
          status="active"
        />
        <GoalCard
          title="Leadership Skills"
          description="Develop leadership and team management skills"
          progress={30}
          mentor="Jessica Lee"
          status="active"
        />
      </div>

      {showAddGoal && (
        <AddGoalModal onClose={() => setShowAddGoal(false)} />
      )}
    </div>
  );
}

function GoalCard({ title, description, progress, mentor, status }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
            🎯
          </div>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>
          {status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-sm mb-4">
        <p><span className="font-semibold">Mentor:</span> {mentor}</p>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm">
          View Progress
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
          💬
        </button>
      </div>
    </div>
  );
}

function AddGoalModal({ onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Add New Goal</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Goal Title</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>Career Development</option>
              <option>Technical Skills</option>
              <option>Leadership</option>
              <option>Personal Growth</option>
            </select>
          </div>
        </div>
        <div className="border-t p-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg">Add Goal</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SessionsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Sessions</h2>

      <div className="space-y-4">
        <SessionCard
          id="1"
          topic="Career Guidance"
          date="December 15, 2024"
          time="9:00 AM - 10:00 AM"
          type="Video Call"
          status="confirmed"
          mentor="Alex Rodriguez"
        />
        <SessionCard
          id="2"
          topic="Technical Interview Prep"
          date="December 22, 2024"
          time="11:00 AM - 12:00 PM"
          type="Video Call"
          status="confirmed"
          mentor="Jessica Lee"
        />
        <SessionCard
          id="3"
          topic="Leadership Coaching"
          date="December 8, 2024"
          time="2:00 PM - 3:00 PM"
          type="Video Call"
          status="completed"
          mentor="David Wilson"
        />
      </div>
    </div>
  );
}

function SessionCard({ id, topic, date, time, type, status, mentor }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{topic}</h3>
          <p className="text-sm text-gray-600">Session #{id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          status === "confirmed" ? "bg-green-100 text-green-700" :
          status === "completed" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-600">Date & Time</p>
          <p className="font-semibold">{date}</p>
          <p className="text-gray-600">{time}</p>
        </div>
        <div>
          <p className="text-gray-600">Format</p>
          <p className="font-semibold">{type}</p>
          <p className="text-gray-600">Mentor: {mentor}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {status === "confirmed" && (
          <>
            <button className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              Join Session
            </button>
            <button className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Reschedule
            </button>
          </>
        )}
        {status === "completed" && (
          <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Leave Review
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Methods & History</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Payment Methods</h3>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            + Add Card
          </button>
        </div>

        <div className="space-y-3">
          <div className="border-2 border-purple-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-semibold">•••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Default</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Payment History</h3>
        <div className="space-y-3">
          <PaymentHistoryItem
            date="Dec 8, 2024"
            description="Leadership Coaching Session"
            amount="$150.00"
            status="Paid"
          />
          <PaymentHistoryItem
            date="Dec 1, 2024"
            description="Career Guidance Session"
            amount="$120.00"
            status="Paid"
          />
        </div>
      </div>
    </div>
  );
}

function PaymentHistoryItem({ date, description, amount, status }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-semibold">{description}</p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{amount}</p>
        <p className="text-sm text-green-600">{status}</p>
      </div>
    </div>
  );
}

function MentorApplicationSection() {
  const [applicationStatus, setApplicationStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [showApplication, setShowApplication] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    experience: "",
    expertise: "",
    hourlyRate: "",
    availability: "",
    linkedinUrl: "",
    websiteUrl: "",
    certifications: "",
    whyMentor: "",
    mentorshipStyle: "",
    successStories: ""
  });

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/api/mentor-applications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          bio: formData.bio,
          experience: formData.experience,
          expertise: formData.expertise,
          hourly_rate: formData.hourlyRate,
          availability: formData.availability,
          linkedin_url: formData.linkedinUrl,
          website_url: formData.websiteUrl,
          certifications: formData.certifications,
          why_mentor: formData.whyMentor,
          mentorship_style: formData.mentorshipStyle,
          success_stories: formData.successStories
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setApplicationStatus("pending");
        setShowApplication(false);
        alert(result.message || "Your mentor application has been submitted successfully! We'll review it within 3-5 business days.");
      } else {
        throw new Error(result.detail || 'Failed to submit application');
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (applicationStatus === "pending") {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h3>
          <p className="text-gray-600 mb-6">We're reviewing your mentor application. You'll hear back from us within 3-5 business days.</p>
          
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• Our team will review your application and experience</li>
              <li>• We may schedule a brief interview call</li>
              <li>• You'll receive an email with the decision</li>
              <li>• If approved, you'll get access to the mentor portal</li>
            </ul>
          </div>

          <button
            onClick={() => setApplicationStatus("none")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Edit Application
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === "approved") {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
          <p className="text-gray-600 mb-6">Your mentor application has been approved. Welcome to the MentorMap mentor community!</p>
          
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold">
              Access Mentor Portal
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              View Guidelines
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showApplication ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Become a Mentor</h3>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Share your expertise and help others grow their careers. Join our community of experienced professionals making a difference.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">💡</div>
                <h4 className="font-semibold mb-1">Share Knowledge</h4>
                <p className="text-sm text-gray-600">Help others with your expertise</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🌱</div>
                <h4 className="font-semibold mb-1">Make Impact</h4>
                <p className="text-sm text-gray-600">Guide career growth and development</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h4 className="font-semibold mb-1">Earn Income</h4>
                <p className="text-sm text-gray-600">Get paid for your mentoring time</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-purple-900 mb-3">Requirements to become a mentor:</h4>
              <ul className="text-sm text-purple-800 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3+ years of professional experience
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Expertise in your field
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Passion for helping others
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Commitment to regular mentoring
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowApplication(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-semibold text-lg"
            >
              Apply to Become a Mentor
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Mentor Application</h2>
            <button
              onClick={() => setShowApplication(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Professional Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Years of Experience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select experience</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10-15">10-15 years</option>
                  <option value="15+">15+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Professional Bio *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                placeholder="Tell us about your professional background and experience..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Areas of Expertise *</label>
              <input
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Software Development, Product Management, Career Coaching"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Hourly Rate (USD) *</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="100"
                  min="25"
                  max="500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Availability *</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select availability</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Website/Portfolio</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Certifications & Achievements</label>
              <textarea
                value={formData.certifications}
                onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                placeholder="List any relevant certifications, awards, or achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Why do you want to be a mentor? *</label>
              <textarea
                value={formData.whyMentor}
                onChange={(e) => setFormData({...formData, whyMentor: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                placeholder="Share your motivation for mentoring others..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mentorship Style & Approach *</label>
              <textarea
                value={formData.mentorshipStyle}
                onChange={(e) => setFormData({...formData, mentorshipStyle: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                placeholder="Describe your mentoring approach and style..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Success Stories (Optional)</label>
              <textarea
                value={formData.successStories}
                onChange={(e) => setFormData({...formData, successStories: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                placeholder="Share any previous mentoring or teaching experiences..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Application Review Process</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We review all applications within 3-5 business days</li>
                <li>• Selected candidates may be invited for a brief interview</li>
                <li>• Approved mentors get access to the mentor portal</li>
                <li>• You'll be notified via email about the decision</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowApplication(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg font-semibold"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}