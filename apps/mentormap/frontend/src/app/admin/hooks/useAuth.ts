import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = () => {
    // Check for token in URL query params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Save token to localStorage
      localStorage.setItem('token', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      setIsLoading(false);
      return;
    }
    
    // Mock user for now - TODO: Replace with actual auth check
    setUser({ name: "Admin User", role: "admin" });
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout
  };
};