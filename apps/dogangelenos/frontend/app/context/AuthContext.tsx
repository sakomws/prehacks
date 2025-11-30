"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "customer" | "trainer" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: 1,
    email: "customer@demo.com",
    name: "Sarah Martinez",
    role: "customer",
  },
  {
    id: 2,
    email: "trainer@demo.com",
    name: "Alex Rodriguez",
    role: "trainer",
  },
  {
    id: 3,
    email: "admin@demo.com",
    name: "Admin User",
    role: "admin",
  },
];

// Demo passwords (in production, this would be handled by backend)
const DEMO_CREDENTIALS: Record<string, string> = {
  "customer@demo.com": "customer123",
  "trainer@demo.com": "trainer123",
  "admin@demo.com": "admin123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check credentials
    const expectedPassword = DEMO_CREDENTIALS[email];
    if (!expectedPassword || expectedPassword !== password) {
      return false;
    }

    // Find user
    const foundUser = DEMO_USERS.find((u) => u.email === email);
    if (!foundUser) {
      return false;
    }

    // Set user and store in localStorage
    setUser(foundUser);
    localStorage.setItem("user", JSON.stringify(foundUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
