// API Configuration
// Automatically uses the correct API URL based on environment

// Use environment variable in production, localhost in development
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API calls
export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

// Export for direct use
export default API_URL;
