import { useState, useEffect } from 'react';
import { API_URL, STATUS_COLORS } from '../../constants';
import { showToast, showErrorAlert, exportToCSV } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Types
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  status: string;
  category?: string;
  tags: string[];
  author_name: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  like_count: number;
  share_count: number;
}

interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: string;
  category?: string;
  tags: string[];
  file_url?: string;
  external_url?: string;
  thumbnail?: string;
  file_size?: number;
  file_format?: string;
  access_level: string;
  download_count: number;
  rating: number;
  rating_count: number;
  duration?: number;
  page_count?: number;
  difficulty_level?: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  subcategory?: string;
  tags: string[];
  is_featured: boolean;
  display_order: number;
  status: string;
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: number;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  content: string;
  rating?: number;
  avatar?: string;
  status: string;
  is_featured: boolean;
  display_order: number;
  category?: string;
  source?: string;
  location?: string;
  linkedin_url?: string;
  approver_name?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface ContentAnalytics {
  blog_posts: {
    total: number;
    published: number;
    total_views: number;
  };
  resources: {
    total: number;
    total_downloads: number;
  };
  faqs: {
    total: number;
    published: number;
    total_views: number;
  };
  testimonials: {
    total: number;
    approved: number;
  };
}

export const ContentManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'blog' | 'resources' | 'faqs' | 'testimonials'>('blog');
  const [loading, setLoading] = useState(true);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogFilters, setBlogFilters] = useState({ status: 'all', category: 'all' });
  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceFilters, setResourceFilters] = useState({ 
    resource_type: 'all', 
    category: 'all', 
    access_level: 'all' 
  });
  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqFilters, setFaqFilters] = useState({ category: 'all', status: 'published' });
  const [showCreateFaqModal, setShowCreateFaqModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialFilters, setTestimonialFilters] = useState({ 
    status: 'all', 
    category: 'all', 
    is_featured: null 
  });
  const [showCreateTestimonialModal, setShowCreateTestimonialModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);

  useEffect(() => {
    if (activeSubTab === 'blog') {
      fetchBlogPosts();
    } else if (activeSubTab === 'resources') {
      fetchResources();
    } else if (activeSubTab === 'faqs') {
      fetchFaqs();
    } else if (activeSubTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [activeSubTab, blogFilters, resourceFilters, faqFilters, testimonialFilters]);

  // Fetch functions
  const fetchBlogPosts = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(blogFilters).forEach(([key, value]) => {
        if (value !== 'all') params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/api/admin/content/blog-posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data.posts || []);
      } else {
        throw new Error('Failed to fetch blog posts');
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      showErrorAlert('fetch blog posts', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(resourceFilters).forEach(([key, value]) => {
        if (value !== 'all') params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/api/admin/content/resources?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      } else {
        throw new Error('Failed to fetch resources');
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      showErrorAlert('fetch resources', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(faqFilters).forEach(([key, value]) => {
        if (value !== 'all') params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/api/admin/content/faqs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        throw new Error('Failed to fetch FAQs');
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showErrorAlert('fetch FAQs', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(testimonialFilters).forEach(([key, value]) => {
        if (value !== 'all' && value !== null) params.append(key, value.toString());
      });
      
      const response = await fetch(`${API_URL}/api/admin/content/testimonials?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } else {
        throw new Error('Failed to fetch testimonials');
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      showErrorAlert('fetch testimonials', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/content/analytics/overview`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showErrorAlert('fetch analytics', error);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusColors = {
      ...STATUS_COLORS,
      draft: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      public: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
      members_only: 'bg-indigo-100 text-indigo-700'
    };
    return statusColors[status as keyof typeof statusColors] || STATUS_COLORS.default;
  };

  const getResourceTypeIcon = (type: string) => {
    const icons = {
      document: '📄',
      video: '🎥',
      link: '🔗',
      tool: '🛠️',
      template: '📋'
    };
    return icons[type as keyof typeof icons] || '📁';
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  if (loading) {
    return <LoadingSpinner message="Loading content management..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">📝 Content Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (activeSubTab === 'blog') setShowCreateBlogModal(true);
              else if (activeSubTab === 'resources') setShowCreateResourceModal(true);
              else if (activeSubTab === 'faqs') setShowCreateFaqModal(true);
              else if (activeSubTab === 'testimonials') setShowCreateTestimonialModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {activeSubTab === 'blog' && 'Create Post'}
            {activeSubTab === 'resources' && 'Add Resource'}
            {activeSubTab === 'faqs' && 'Add FAQ'}
            {activeSubTab === 'testimonials' && 'Add Testimonial'}
          </button>
          <button
            onClick={() => {
              if (activeSubTab === 'blog') {
                exportToCSV(blogPosts.map(post => ({
                  title: post.title,
                  status: post.status,
                  category: post.category,
                  author: post.author_name,
                  views: post.view_count,
                  likes: post.like_count,
                  published_at: post.published_at,
                  created_at: post.created_at
                })), 'blog_posts');
              } else if (activeSubTab === 'resources') {
                exportToCSV(resources.map(resource => ({
                  title: resource.title,
                  type: resource.resource_type,
                  category: resource.category,
                  downloads: resource.download_count,
                  rating: resource.rating,
                  access_level: resource.access_level,
                  created_at: resource.created_at
                })), 'resources');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Data
          </button>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSubTab('blog')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'blog'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📝 Blog Posts
          </button>
          <button
            onClick={() => setActiveSubTab('resources')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'resources'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            📚 Resources
          </button>
          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'faqs'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            ❓ FAQs
          </button>
          <button
            onClick={() => setActiveSubTab('testimonials')}
            className={`px-6 py-4 font-semibold ${
              activeSubTab === 'testimonials'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            ⭐ Testimonials
          </button>
        </div>
      </div>

      {/* Blog Posts Tab */}
      {activeSubTab === 'blog' && (
        <BlogPostsManagement 
          posts={blogPosts}
          filters={blogFilters}
          setFilters={setBlogFilters}
          onEdit={(post: BlogPost) => setSelectedBlogPost(post)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Resources Tab */}
      {activeSubTab === 'resources' && (
        <ResourcesManagement 
          resources={resources}
          filters={resourceFilters}
          setFilters={setResourceFilters}
          onEdit={(resource: Resource) => setSelectedResource(resource)}
          getStatusColor={getStatusColor}
          getResourceTypeIcon={getResourceTypeIcon}
          getRatingStars={getRatingStars}
        />
      )}

      {/* FAQs Tab */}
      {activeSubTab === 'faqs' && (
        <FaqsManagement 
          faqs={faqs}
          filters={faqFilters}
          setFilters={setFaqFilters}
          onEdit={(faq: FAQ) => setSelectedFaq(faq)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Testimonials Tab */}
      {activeSubTab === 'testimonials' && (
        <TestimonialsManagement 
          testimonials={testimonials}
          filters={testimonialFilters}
          setFilters={setTestimonialFilters}
          onEdit={(testimonial: Testimonial) => setSelectedTestimonial(testimonial)}
          getStatusColor={getStatusColor}
          getRatingStars={getRatingStars}
        />
      )}

      {/* Analytics Modal */}
      {analytics && (
        <ContentAnalyticsModal 
          analytics={analytics}
          onClose={() => setAnalytics(null)}
        />
      )}

      {/* Create/Edit Modals */}
      {showCreateBlogModal && (
        <BlogPostFormModal 
          onClose={() => setShowCreateBlogModal(false)}
          onSuccess={() => {
            setShowCreateBlogModal(false);
            fetchBlogPosts();
          }}
          title="Create Blog Post"
        />
      )}

      {showCreateResourceModal && (
        <ResourceFormModal 
          onClose={() => setShowCreateResourceModal(false)}
          onSuccess={() => {
            setShowCreateResourceModal(false);
            fetchResources();
          }}
          title="Add Resource"
        />
      )}

      {showCreateFaqModal && (
        <FaqFormModal 
          onClose={() => setShowCreateFaqModal(false)}
          onSuccess={() => {
            setShowCreateFaqModal(false);
            fetchFaqs();
          }}
          title="Add FAQ"
        />
      )}

      {showCreateTestimonialModal && (
        <TestimonialFormModal 
          onClose={() => setShowCreateTestimonialModal(false)}
          onSuccess={() => {
            setShowCreateTestimonialModal(false);
            fetchTestimonials();
          }}
          title="Add Testimonial"
        />
      )}
    </div>
  );
};

// Blog Posts Management Component
const BlogPostsManagement = ({ posts, filters, setFilters, onEdit, getStatusColor }: any) => {
  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Posts</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Career Development">Career Development</option>
              <option value="Professional Development">Professional Development</option>
              <option value="Future of Work">Future of Work</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post: BlogPost) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-2">{post.excerpt}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {post.author_name}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.published_at && (
                    <>
                      <span>•</span>
                      <span>Published {new Date(post.published_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
                {post.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {post.category}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Views</p>
                <p className="font-semibold text-lg">{post.view_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Likes</p>
                <p className="font-semibold text-lg">{post.like_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Shares</p>
                <p className="font-semibold text-lg">{post.share_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Engagement</p>
                <p className="font-semibold text-lg">
                  {post.view_count > 0 ? ((post.like_count + post.share_count) / post.view_count * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 5).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      +{post.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(post)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                Preview
              </button>
              {post.status === 'draft' && (
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Blog Posts Found</h3>
            <p className="text-gray-600">No posts match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Resources Management Component - Full Implementation
const ResourcesManagement = ({ resources, filters, setFilters, onEdit, getStatusColor, getResourceTypeIcon, getRatingStars }: any) => {
  const deleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/content/resources/${resourceId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast('Resource deleted successfully!', 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to delete resource');
      }
    } catch (error) {
      showErrorAlert('delete resource', error);
    }
  };

  const toggleResourceStatus = async (resourceId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`${API_URL}/api/admin/content/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        showToast(`Resource ${newStatus}!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update resource');
      }
    } catch (error) {
      showErrorAlert('update resource', error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resource Type</label>
            <select
              value={filters.resource_type}
              onChange={(e) => setFilters({...filters, resource_type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="link">Links</option>
              <option value="tool">Tools</option>
              <option value="template">Templates</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Career Development">Career Development</option>
              <option value="Technical Skills">Technical Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Tools & Templates">Tools & Templates</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Access Level</label>
            <select
              value={filters.access_level}
              onChange={(e) => setFilters({...filters, access_level: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Access Levels</option>
              <option value="public">Public</option>
              <option value="premium">Premium</option>
              <option value="members_only">Members Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map((resource: Resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-4xl">{getResourceTypeIcon(resource.resource_type)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-gray-600 mb-2">{resource.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {resource.creator_name}</span>
                    <span>•</span>
                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    {resource.file_size && (
                      <>
                        <span>•</span>
                        <span>{(resource.file_size / 1024 / 1024).toFixed(1)} MB</span>
                      </>
                    )}
                    {resource.duration && (
                      <>
                        <span>•</span>
                        <span>{Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(resource.access_level)}`}>
                  {resource.access_level.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(resource.resource_type)}`}>
                  {resource.resource_type}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Downloads</p>
                <p className="font-semibold text-lg">{resource.download_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-lg">{resource.rating.toFixed(1)}</span>
                  <span className="text-yellow-500">{getRatingStars(resource.rating)}</span>
                  <span className="text-sm text-gray-500">({resource.rating_count})</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Category</p>
                <p className="font-semibold">{resource.category || 'Uncategorized'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Format</p>
                <p className="font-semibold">{resource.file_format || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Difficulty</p>
                <p className="font-semibold capitalize">{resource.difficulty_level || 'Not specified'}</p>
              </div>
            </div>

            {resource.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.slice(0, 5).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      +{resource.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {resource.file_url && (
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    📥 Download
                  </a>
                )}
                {resource.external_url && (
                  <a
                    href={resource.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    🔗 Open Link
                  </a>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(resource)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleResourceStatus(resource.id, 'published')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  Toggle Status
                </button>
                <button
                  onClick={() => deleteResource(resource.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {resources.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-600">No resources match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// FAQs Management Component - Full Implementation
const FaqsManagement = ({ faqs, filters, setFilters, onEdit, getStatusColor }: any) => {
  const deleteFaq = async (faqId: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/content/faqs/${faqId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast('FAQ deleted successfully!', 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to delete FAQ');
      }
    } catch (error) {
      showErrorAlert('delete FAQ', error);
    }
  };

  const toggleFaqStatus = async (faqId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`${API_URL}/api/admin/content/faqs/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        showToast(`FAQ ${newStatus}!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update FAQ');
      }
    } catch (error) {
      showErrorAlert('update FAQ', error);
    }
  };

  const toggleFeatured = async (faqId: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/content/faqs/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isFeatured })
      });
      
      if (response.ok) {
        showToast(`FAQ ${!isFeatured ? 'featured' : 'unfeatured'}!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update FAQ');
      }
    } catch (error) {
      showErrorAlert('update FAQ', error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Account">Account</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Mentoring">Mentoring</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq: FAQ) => (
          <div key={faq.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold">{faq.question}</h3>
                  {faq.is_featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{faq.answer}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {faq.creator_name}</span>
                  <span>•</span>
                  <span>{new Date(faq.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Order: {faq.display_order}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(faq.status)}`}>
                  {faq.status}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {faq.category}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Views</p>
                <p className="font-semibold text-lg">{faq.view_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Helpful</p>
                <p className="font-semibold text-lg text-green-600">{faq.helpful_count}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Not Helpful</p>
                <p className="font-semibold text-lg text-red-600">{faq.not_helpful_count}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Helpfulness</p>
                <p className="font-semibold text-lg">
                  {faq.helpful_count + faq.not_helpful_count > 0 
                    ? ((faq.helpful_count / (faq.helpful_count + faq.not_helpful_count)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {faq.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {faq.tags.slice(0, 5).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                  {faq.tags.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      +{faq.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(faq)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => toggleFeatured(faq.id, faq.is_featured)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  faq.is_featured 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {faq.is_featured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                onClick={() => toggleFaqStatus(faq.id, faq.status)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                {faq.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => deleteFaq(faq.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No FAQs Found</h3>
            <p className="text-gray-600">No FAQs match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Testimonials Management Component - Full Implementation
const TestimonialsManagement = ({ testimonials, filters, setFilters, onEdit, getStatusColor, getRatingStars }: any) => {
  const deleteTestimonial = async (testimonialId: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/content/testimonials/${testimonialId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast('Testimonial deleted successfully!', 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      showErrorAlert('delete testimonial', error);
    }
  };

  const updateTestimonialStatus = async (testimonialId: number, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/content/testimonials/${testimonialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        showToast(`Testimonial ${status}!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update testimonial');
      }
    } catch (error) {
      showErrorAlert('update testimonial', error);
    }
  };

  const toggleFeatured = async (testimonialId: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/content/testimonials/${testimonialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isFeatured })
      });
      
      if (response.ok) {
        showToast(`Testimonial ${!isFeatured ? 'featured' : 'unfeatured'}!`, 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to update testimonial');
      }
    } catch (error) {
      showErrorAlert('update testimonial', error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="Mentoring">Mentoring</option>
              <option value="Career Growth">Career Growth</option>
              <option value="Platform">Platform</option>
              <option value="Support">Support</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Featured</label>
            <select
              value={filters.is_featured === null ? 'all' : filters.is_featured.toString()}
              onChange={(e) => setFilters({
                ...filters, 
                is_featured: e.target.value === 'all' ? null : e.target.value === 'true'
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Testimonials</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((testimonial: Testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    (testimonial.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold">{testimonial.name}</h3>
                    {testimonial.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  {testimonial.title && (
                    <p className="text-gray-600 font-medium">{testimonial.title}</p>
                  )}
                  {testimonial.company && (
                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                  )}
                  {testimonial.location && (
                    <p className="text-gray-500 text-sm">📍 {testimonial.location}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(testimonial.status)}`}>
                  {testimonial.status}
                </span>
                {testimonial.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {testimonial.category}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <blockquote className="text-gray-700 italic text-lg leading-relaxed border-l-4 border-blue-500 pl-4">
                "{testimonial.content}"
              </blockquote>
            </div>

            {testimonial.rating && (
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm">Rating:</span>
                  <span className="text-yellow-500 text-lg">{getRatingStars(testimonial.rating)}</span>
                  <span className="font-semibold">{testimonial.rating}/5</span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Source</p>
                <p className="font-semibold">{testimonial.source || 'Direct'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Display Order</p>
                <p className="font-semibold">{testimonial.display_order}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Submitted</p>
                <p className="font-semibold">{new Date(testimonial.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Approved By</p>
                <p className="font-semibold">{testimonial.approver_name || 'Pending'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {testimonial.email && (
                  <a
                    href={`mailto:${testimonial.email}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                  >
                    📧 Email
                  </a>
                )}
                {testimonial.linkedin_url && (
                  <a
                    href={testimonial.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    💼 LinkedIn
                  </a>
                )}
              </div>
              
              <div className="flex space-x-2">
                {testimonial.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateTestimonialStatus(testimonial.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => onEdit(testimonial)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    testimonial.is_featured 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Testimonials Found</h3>
            <p className="text-gray-600">No testimonials match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Blog Post Form Modal - Full Implementation with Rich Text Editor
const BlogPostFormModal = ({ blogPost, onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    status: string;
    category: string;
    tags: string[];
    meta_title: string;
    meta_description: string;
  }>({
    title: blogPost?.title || '',
    slug: blogPost?.slug || '',
    excerpt: blogPost?.excerpt || '',
    content: blogPost?.content || '',
    featured_image: blogPost?.featured_image || '',
    status: blogPost?.status || 'draft',
    category: blogPost?.category || '',
    tags: blogPost?.tags || [],
    meta_title: blogPost?.meta_title || '',
    meta_description: blogPost?.meta_description || ''
  });
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      meta_title: formData.meta_title || title
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = blogPost 
        ? `${API_URL}/api/admin/content/blog-posts/${blogPost.id}`
        : `${API_URL}/api/admin/content/blog-posts`;
      
      const method = blogPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          blogPost ? 'Blog post updated successfully!' : 'Blog post created successfully!',
          'success'
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save blog post');
      }
    } catch (error) {
      showErrorAlert(blogPost ? 'update blog post' : 'create blog post', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // Rich text editor functions
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading':
        replacement = `## ${selectedText || 'Heading'}`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](https://example.com)`;
        break;
      case 'image':
        replacement = `![${selectedText || 'alt text'}](https://example.com/image.jpg)`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'quote'}`;
        break;
      case 'list':
        replacement = `- ${selectedText || 'list item'}`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);
    
    setFormData({...formData, content: newContent});
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const previewContent = () => {
    const preview = window.open('', '_blank');
    if (preview) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${formData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #333; }
            blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; font-style: italic; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>${formData.title}</h1>
          <p><em>${formData.excerpt}</em></p>
          <div>${formData.content.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `;
      preview.document.write(html);
      preview.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'content'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📝 Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'seo'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🔍 SEO
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Title and Slug */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly version of the title</p>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the blog post..."
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Content *</label>
                  <button
                    type="button"
                    onClick={previewContent}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    👁️ Preview
                  </button>
                </div>
                
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
                  <button
                    type="button"
                    onClick={() => insertFormatting('bold')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('italic')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('heading')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Heading"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('link')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Link"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('image')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Image"
                  >
                    🖼️
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('code')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Code"
                  >
                    {'</>'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('quote')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="Quote"
                  >
                    💬
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('list')}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100"
                    title="List"
                  >
                    📝
                  </button>
                </div>
                
                <textarea
                  id="content-editor"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your blog post content here... Use Markdown formatting."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports Markdown formatting. Use the toolbar buttons or type Markdown directly.
                </p>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title for search engines"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_title.length}/60 characters (recommended: 50-60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for search engine results"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_description.length}/160 characters (recommended: 150-160)
                </p>
              </div>

              {/* SEO Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">Search Engine Preview</h3>
                <div className="bg-white p-3 rounded border">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.meta_title || formData.title || 'Your Blog Post Title'}
                  </div>
                  <div className="text-green-600 text-sm">
                    yoursite.com/blog/{formData.slug || 'your-post-slug'}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.meta_description || formData.excerpt || 'Your blog post description will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Career Development">Career Development</option>
                    <option value="Professional Development">Professional Development</option>
                    <option value="Future of Work">Future of Work</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim()) {
                            addTag(newTag.trim());
                            setNewTag('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTag.trim()) {
                          addTag(newTag.trim());
                          setNewTag('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="text-sm text-gray-500">
              {formData.content.length} characters • {Math.ceil(formData.content.length / 1000)} min read
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (blogPost ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Resource Form Modal - Full Implementation
const ResourceFormModal = ({ resource, onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    resource_type: string;
    category: string;
    tags: string[];
    file_url: string;
    external_url: string;
    access_level: string;
    difficulty_level: string;
    duration: number;
    page_count: number;
  }>({
    title: resource?.title || '',
    description: resource?.description || '',
    resource_type: resource?.resource_type || 'document',
    category: resource?.category || '',
    tags: resource?.tags || [],
    file_url: resource?.file_url || '',
    external_url: resource?.external_url || '',
    access_level: resource?.access_level || 'public',
    difficulty_level: resource?.difficulty_level || 'beginner',
    duration: resource?.duration || 0,
    page_count: resource?.page_count || 0
  });
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = resource 
        ? `${API_URL}/api/admin/content/resources/${resource.id}`
        : `${API_URL}/api/admin/content/resources`;
      
      const method = resource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          resource ? 'Resource updated successfully!' : 'Resource created successfully!',
          'success'
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save resource');
      }
    } catch (error) {
      showErrorAlert(resource ? 'update resource' : 'create resource', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Resource Type</label>
              <select
                value={formData.resource_type}
                onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="tool">Tool</option>
                <option value="template">Template</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                <option value="Career Development">Career Development</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Leadership">Leadership</option>
                <option value="Tools & Templates">Tools & Templates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Access Level</label>
              <select
                value={formData.access_level}
                onChange={(e) => setFormData({...formData, access_level: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="public">Public</option>
                <option value="premium">Premium</option>
                <option value="members_only">Members Only</option>
              </select>
            </div>
          </div>

          {/* URLs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">File URL</label>
              <input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                placeholder="https://example.com/file.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">External URL</label>
              <input
                type="url"
                value={formData.external_url}
                onChange={(e) => setFormData({...formData, external_url: e.target.value})}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Additional Properties */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Page Count</label>
              <input
                type="number"
                value={formData.page_count}
                onChange={(e) => setFormData({...formData, page_count: parseInt(e.target.value) || 0})}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim()) {
                        addTag(newTag.trim());
                        setNewTag('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) {
                      addTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (resource ? 'Update Resource' : 'Create Resource')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// FAQ Form Modal - Full Implementation
const FaqFormModal = ({ faq, onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    question: string;
    answer: string;
    category: string;
    subcategory: string;
    tags: string[];
    is_featured: boolean;
    display_order: number;
    status: string;
  }>({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || 'General',
    subcategory: faq?.subcategory || '',
    tags: faq?.tags || [],
    is_featured: faq?.is_featured || false,
    display_order: faq?.display_order || 0,
    status: faq?.status || 'published'
  });
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = faq 
        ? `${API_URL}/api/admin/content/faqs/${faq.id}`
        : `${API_URL}/api/admin/content/faqs`;
      
      const method = faq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          faq ? 'FAQ updated successfully!' : 'FAQ created successfully!',
          'success'
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save FAQ');
      }
    } catch (error) {
      showErrorAlert(faq ? 'update FAQ' : 'create FAQ', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-2">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="What is your question?"
              required
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium mb-2">Answer *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Provide a detailed answer..."
              required
            />
          </div>

          {/* Category and Subcategory */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="General">General</option>
                <option value="Account">Account</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Mentoring">Mentoring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Optional subcategory"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Featured FAQ</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim()) {
                        addTag(newTag.trim());
                        setNewTag('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) {
                      addTag(newTag.trim());
                      setNewTag('');
                    }
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (faq ? 'Update FAQ' : 'Create FAQ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Testimonial Form Modal - Full Implementation
const TestimonialFormModal = ({ testimonial, onClose, onSuccess, title }: any) => {
  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    company: string;
    email: string;
    content: string;
    rating: number;
    avatar: string;
    status: string;
    is_featured: boolean;
    display_order: number;
    category: string;
    source: string;
    location: string;
    linkedin_url: string;
  }>({
    name: testimonial?.name || '',
    title: testimonial?.title || '',
    company: testimonial?.company || '',
    email: testimonial?.email || '',
    content: testimonial?.content || '',
    rating: testimonial?.rating || 5,
    avatar: testimonial?.avatar || '',
    status: testimonial?.status || 'pending',
    is_featured: testimonial?.is_featured || false,
    display_order: testimonial?.display_order || 0,
    category: testimonial?.category || 'Mentoring',
    source: testimonial?.source || 'Direct',
    location: testimonial?.location || '',
    linkedin_url: testimonial?.linkedin_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = testimonial 
        ? `${API_URL}/api/admin/content/testimonials/${testimonial.id}`
        : `${API_URL}/api/admin/content/testimonials`;
      
      const method = testimonial ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          testimonial ? 'Testimonial updated successfully!' : 'Testimonial created successfully!',
          'success'
        );
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save testimonial');
      }
    } catch (error) {
      showErrorAlert(testimonial ? 'update testimonial' : 'create testimonial', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData({...formData, rating: i + 1})}
        className={`text-2xl ${i < rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
      >
        ⭐
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Tech Corp"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Testimonial Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Testimonial Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Share your experience..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length} characters
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {renderStars(formData.rating)}
              <span className="ml-2 text-sm text-gray-600">({formData.rating}/5)</span>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {/* Settings */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Mentoring">Mentoring</option>
                <option value="Career Growth">Career Growth</option>
                <option value="Platform">Platform</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Direct">Direct</option>
                <option value="Email">Email</option>
                <option value="Survey">Survey</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium">Featured Testimonial</span>
            </label>
          </div>

          {/* Preview */}
          {formData.content && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div className="bg-white p-4 rounded border">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={formData.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      (formData.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-gray-700 italic mb-2">
                      "{formData.content}"
                    </blockquote>
                    <div className="flex items-center space-x-1 mb-1">
                      {'⭐'.repeat(formData.rating)}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">{formData.name}</div>
                      {formData.title && <div className="text-gray-600">{formData.title}</div>}
                      {formData.company && <div className="text-gray-600">{formData.company}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (testimonial ? 'Update Testimonial' : 'Create Testimonial')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContentAnalyticsModal = ({ analytics, onClose }: any) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 Content Analytics</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Content analytics dashboard will be implemented here.</p>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  </div>
);