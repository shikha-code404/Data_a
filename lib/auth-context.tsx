"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/db/client";

export type UserRole = "candidate" | "recruiter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  candidate_id: string | null;
  recruiter_id: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ error?: any }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ error?: any }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const syncUserSession = async (authUser: any) => {
    try {
      const { data: userData, error } = await supabaseBrowser
        .from("users")
        .select("id, email, role")
        .eq("id", authUser.id)
        .single();

      if (userData) {
        setUser({
          id: userData.id,
          name: authUser.user_metadata?.name || (userData.role === "candidate" ? "Elena Rostova" : "HR Team @ Aether"),
          email: userData.email,
          role: userData.role as UserRole,
        });
      } else {
        // Fallback or setup user if DB row is not created yet
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || "User",
          email: authUser.email || "",
          role: (authUser.user_metadata?.role || "candidate") as UserRole,
        });
      }
    } catch (err) {
      console.error("Error syncing user session:", err);
    }
  };

  // Load user from Supabase on mount & listen to changes
  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session?.user) {
          await syncUserSession(session.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to get initial session:", e);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      if (session?.user) {
        await syncUserSession(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      // Retrieve or fallback the role from DB
      const { data: userData } = await supabaseBrowser
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = userData?.role || role;
      await syncUserSession(data.user);
      router.push(userRole === "candidate" ? "/candidate" : "/recruiter");
    }

    return {};
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      // Insert user row
      const { error: userError } = await supabaseBrowser.from("users").insert({
        id: data.user.id,
        email,
        role,
      });

      if (userError) {
        console.error("Failed to insert user metadata into DB:", userError);
        return { error: userError };
      }

      // If candidate, initialize candidate_profiles row
      if (role === "candidate") {
        const { error: profileError } = await supabaseBrowser
          .from("candidate_profiles")
          .insert({
            user_id: data.user.id,
            github_username: null,
            talent_profile: null,
            talent_score: null,
            github_data: null,
          });

        if (profileError) {
          console.error("Failed to initialize candidate profile in DB:", profileError);
        }
      }

      await syncUserSession(data.user);
      router.push(role === "candidate" ? "/candidate/onboarding" : "/recruiter");
    }

    return {};
  };

  const logout = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const candidate_id = user?.role === "candidate" ? user.id : null;
  const recruiter_id = user?.role === "recruiter" ? user.id : null;

  return (
    <AuthContext.Provider value={{ user, isLoading, candidate_id, recruiter_id, login, signup, logout }}>
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
