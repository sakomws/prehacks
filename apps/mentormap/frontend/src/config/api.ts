// API Configuration
// Automatically uses the correct API URL based on environment

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API calls
export const apiUrl = (path: string) => `${API_URL}${path}`;
