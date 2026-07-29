"use client";

import React from "react";
import { SidebarNav, SidebarItem } from "@/components/SidebarNav";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Award,
  Briefcase,
  Compass,
  FileText,
  Trophy,
} from "lucide-react";

const candidateNavItems: SidebarItem[] = [
  { label: "Dashboard", href: "/candidate", icon: LayoutDashboard },
  { label: "Talent Score", href: "/candidate/talent-score", icon: Award },
  { label: "Job Matches", href: "/candidate/jobs", icon: Briefcase },
  { label: "Career Guidance", href: "/candidate/guidance", icon: Compass },
  { label: "Resume Builder", href: "/candidate/resume", icon: FileText },
  { label: "Hackathons", href: "/candidate/hackathons", icon: Trophy },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Sidebar navigation */}
      <SidebarNav
        items={candidateNavItems}
        role="candidate"
        userName={user?.name || "Elena Rostova"}
      />
      {/* Main content body */}
      <main className="flex-1 py-8 md:px-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
