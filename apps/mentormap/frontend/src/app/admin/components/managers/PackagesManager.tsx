import { useState, useEffect } from 'react';
import { API_URL } from '../../constants';
import { showToast, showErrorAlert } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Package {
  id: number;
  mentor_id: number | null;
  name: string;
  description: string | null;
  sessions_count: number;
  price: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  chat_weeks: number;
  created_at: string;
  updated_at: string;
}

export const PackagesManager = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sessions_count: 1,
    price: 100,
    features: "",
    is_popular: false,
    chat_weeks: 0,
    mentor_id: null as number | null,
  });

  useEffect(() => {
    fetchPackages();
  }, [filter]);

  const fetchPackages = async () => {
    try {
      let url = `${API_URL}/api/packages/`;
      if (filter === "global") {
        url += "?mentor_id=null";
      } else if (filter === "mentor") {
        // Get packages with mentor_id
        url += "?mentor_id=all";
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let filteredData = data;
        
        if (filter === "active") {
          filteredData = data.filter((pkg: Package) => pkg.is_active);
        } else if (filter === "inactive") {
          filteredData = data.filter((pkg: Package) => !pkg.is_active);
        } else if (filter === "global") {
          filteredData = data.filter((pkg: Package) => pkg.mentor_id === null);
        } else if (filter === "mentor") {
          filteredData = data.filter((pkg: Package) => pkg.mentor_id !== null);
        }
        
        setPackages(filteredData);
      } else {
        throw new Error('Failed to fetch packages');
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      showErrorAlert('fetch packages', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPackage(null);
    setFormData({
      name: "",
      description: "",
      sessions_count: 1,
      price: 100,
      features: "",
      is_popular: false,
      chat_weeks: 0,
      mentor_id: null,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      sessions_count: pkg.sessions_count,
      price: pkg.price,
      features: pkg.features.join("\n"),
      is_popular: pkg.is_popular,
      chat_weeks: pkg.chat_weeks,
      mentor_id: pkg.mentor_id,
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    const features = formData.features.split("\n").filter((f) => f.trim());
    
    const packageData = {
      name: formData.name,
      description: formData.description || null,
      sessions_count: formData.sessions_count,
      price: formData.price,
      features: features,
      is_popular: formData.is_popular,
      chat_weeks: formData.chat_weeks,
      mentor_id: formData.mentor_id,
    };

    try {
      const url = selectedPackage
        ? `${API_URL}/api/packages/${selectedPackage.id}`
        : `${API_URL}/api/packages/`;
      const method = selectedPackage ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      });

      if (response.ok) {
        showToast(selectedPackage ? "Package updated successfully" : "Package created successfully");
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedPackage(null);
        fetchPackages();
      } else {
        let errorMessage = "Unknown error";
        let errorData = null;
        try {
          const text = await response.text();
          console.error("Error response text:", text);
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (parseError) {
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          console.error("Error reading response:", e);
        }
        console.error("Full error details:", { status: response.status, statusText: response.statusText, errorData });
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      showErrorAlert('save package', error);
    }
  };

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/packages/${packageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast("Package deleted successfully");
        fetchPackages();
      } else {
        throw new Error("Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      showErrorAlert('delete package', error);
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !pkg.is_active }),
      });

      if (response.ok) {
        showToast(`Package ${!pkg.is_active ? "activated" : "deactivated"} successfully`);
        fetchPackages();
      } else {
        throw new Error("Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      showErrorAlert('update package', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading packages..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Packages Management</h2>
          <p className="text-gray-600 mt-1">Manage session packages for mentors</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Package
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg ${
            filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("inactive")}
          className={`px-4 py-2 rounded-lg ${
            filter === "inactive" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setFilter("global")}
          className={`px-4 py-2 rounded-lg ${
            filter === "global" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Global
        </button>
        <button
          onClick={() => setFilter("mentor")}
          className={`px-4 py-2 rounded-lg ${
            filter === "mentor" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Mentor-Specific
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No packages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow p-6 ${
                pkg.is_popular ? "border-2 border-blue-500" : ""
              } ${!pkg.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  {pkg.is_popular && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded mb-2 inline-block">
                      Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  {pkg.mentor_id && (
                    <p className="text-xs text-gray-500 mt-1">Mentor ID: {pkg.mentor_id}</p>
                  )}
                  {!pkg.mentor_id && (
                    <p className="text-xs text-gray-500 mt-1">Global Package</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    pkg.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {pkg.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">${pkg.price}</p>
                <p className="text-sm text-gray-600">
                  {pkg.sessions_count} session{pkg.sessions_count > 1 ? "s" : ""}
                  {pkg.chat_weeks > 0 && ` • ${pkg.chat_weeks} weeks chat`}
                </p>
              </div>

              {pkg.description && (
                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
              )}

              {pkg.features && pkg.features.length > 0 && (
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {pkg.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-gray-400">+{pkg.features.length - 3} more</li>
                  )}
                </ul>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(pkg)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  {pkg.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {selectedPackage ? "Edit Package" : "Create Package"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sessions Count *</label>
                  <input
                    type="number"
                    value={formData.sessions_count}
                    onChange={(e) =>
                      setFormData({ ...formData, sessions_count: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chat Weeks</label>
                <input
                  type="number"
                  value={formData.chat_weeks}
                  onChange={(e) =>
                    setFormData({ ...formData, chat_weeks: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) =>
                    setFormData({ ...formData, is_popular: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm">Mark as popular</label>
              </div>
              {!selectedPackage && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mentor ID (leave empty for global)</label>
                  <input
                    type="number"
                    value={formData.mentor_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mentor_id: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Leave empty for global package"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedPackage ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedPackage(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

