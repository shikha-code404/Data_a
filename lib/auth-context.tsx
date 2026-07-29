"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "candidate" | "recruiter";

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => void;
  signup: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("platform_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const name = role === "candidate" ? "Elena Rostova" : "HR Team @ Aether";
    const newUser: User = { name, email, role };
    setUser(newUser);
    localStorage.setItem("platform_user", JSON.stringify(newUser));
    router.push(role === "candidate" ? "/candidate" : "/recruiter");
  };

  const signup = (name: string, email: string, role: UserRole) => {
    const newUser: User = { name, email, role };
    setUser(newUser);
    localStorage.setItem("platform_user", JSON.stringify(newUser));
    router.push(role === "candidate" ? "/candidate" : "/recruiter");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("platform_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
