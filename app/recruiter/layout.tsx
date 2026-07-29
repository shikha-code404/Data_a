"use client";

import React from "react";
import { SidebarNav, SidebarItem } from "@/components/SidebarNav";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Search,
  Layers,
  BarChart3,
  Trophy,
} from "lucide-react";

const recruiterNavItems: SidebarItem[] = [
  { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { label: "Candidate Discovery", href: "/recruiter/discovery", icon: Search },
  { label: "Pipeline", href: "/recruiter/pipeline", icon: Layers },
  { label: "Hiring Analytics", href: "/recruiter/analytics", icon: BarChart3 },
  { label: "Hackathon Leaderboard", href: "/recruiter/hackathons", icon: Trophy },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Sidebar navigation */}
      <SidebarNav
        items={recruiterNavItems}
        role="recruiter"
        userName={user?.name || "HR Team @ Aether"}
      />
      {/* Main content body */}
      <main className="flex-1 py-8 md:px-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
