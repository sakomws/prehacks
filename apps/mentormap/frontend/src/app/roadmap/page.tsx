"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

interface Roadmap {
  id: number;
  title: string;
  description: string;
  target_company: string;
  target_role: string;
  progress: number;
  milestones: string;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<number | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_company: "",
    target_role: "",
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/roadmaps/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setRoadmaps(data);
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  const createRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/roadmaps/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ title: "", description: "", target_company: "", target_role: "" });
        fetchRoadmaps();
      }
    } catch (error) {
      console.error("Error creating roadmap:", error);
    }
  };

  const updateProgress = async (id: number, progress: number) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:8000/api/roadmaps/${id}/progress?progress=${progress}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRoadmaps();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const deleteRoadmap = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8000/api/roadmaps/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchRoadmaps();
      } else {
        alert("Failed to delete roadmap");
      }
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      alert("Error deleting roadmap");
    }
  };

  const getChecklist = (milestones: string): ChecklistItem[] => {
    if (!milestones) return [];
    try {
      return JSON.parse(milestones);
    } catch {
      return [];
    }
  };

  const updateChecklist = async (roadmapId: number, checklist: ChecklistItem[]) => {
    const token = localStorage.getItem("token");
    
    try {
      await fetch(`http://localhost:8000/api/roadmaps/${roadmapId}/milestones?milestones=${encodeURIComponent(JSON.stringify(checklist))}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRoadmaps();
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const toggleChecklistItem = (roadmap: Roadmap, itemId: string) => {
    const checklist = getChecklist(roadmap.milestones);
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Auto-update progress based on completed items
    const completedCount = updatedChecklist.filter(item => item.completed).length;
    const newProgress = updatedChecklist.length > 0 
      ? Math.round((completedCount / updatedChecklist.length) * 100)
      : 0;
    
    updateChecklist(roadmap.id, updatedChecklist);
    updateProgress(roadmap.id, newProgress);
  };

  const addChecklistItem = (roadmap: Roadmap) => {
    if (!newChecklistItem.trim()) return;
    
    const checklist = getChecklist(roadmap.milestones);
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      completed: false,
    };
    
    updateChecklist(roadmap.id, [...checklist, newItem]);
    setNewChecklistItem("");
  };

  const deleteChecklistItem = (roadmap: Roadmap, itemId: string) => {
    const checklist = getChecklist(roadmap.milestones);
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    updateChecklist(roadmap.id, updatedChecklist);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="lg" className="transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-bold">MentorMap</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Find Mentors
              </Link>
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                My Sessions
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/");
                }}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Learning Roadmaps</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track your progress towards your career goals
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Roadmap
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Create New Roadmap</h3>
              <form onSubmit={createRoadmap} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Company</label>
                  <input
                    type="text"
                    value={formData.target_company}
                    onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Role</label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading roadmaps...</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-2">No roadmaps yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first learning roadmap to start tracking your progress
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Roadmap
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{roadmap.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {roadmap.description}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {roadmap.progress}%
                  </div>
                </div>

                {roadmap.target_company && (
                  <div className="mb-3">
                    <span className="text-sm font-medium">🎯 Target: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {roadmap.target_role} at {roadmap.target_company}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600 dark:text-gray-300">{roadmap.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">📋 Checklist</h4>
                    <button
                      onClick={() => setEditingChecklist(editingChecklist === roadmap.id ? null : roadmap.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {editingChecklist === roadmap.id ? "Done" : "+ Add Item"}
                    </button>
                  </div>
                  
                  {/* Checklist Items */}
                  <div className="space-y-2 mb-2">
                    {getChecklist(roadmap.milestones).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(roadmap, item.id)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : ''}`}>
                          {item.text}
                        </span>
                        {editingChecklist === roadmap.id && (
                          <button
                            onClick={() => deleteChecklistItem(roadmap, item.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Item */}
                  {editingChecklist === roadmap.id && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addChecklistItem(roadmap)}
                        placeholder="Add a task..."
                        className="flex-1 px-3 py-1 text-sm border rounded dark:bg-gray-700"
                      />
                      <button
                        onClick={() => addChecklistItem(roadmap)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  
                  {getChecklist(roadmap.milestones).length === 0 && editingChecklist !== roadmap.id && (
                    <p className="text-xs text-gray-400 italic">No tasks yet. Click "+ Add Item" to get started.</p>
                  )}
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => updateProgress(roadmap.id, Math.min(100, roadmap.progress + 10))}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    +10% Progress
                  </button>
                  <button
                    onClick={() => updateProgress(roadmap.id, Math.max(0, roadmap.progress - 10))}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    -10%
                  </button>
                </div>

                <button
                  onClick={() => deleteRoadmap(roadmap.id, roadmap.title)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Roadmap
                </button>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Created: {new Date(roadmap.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
