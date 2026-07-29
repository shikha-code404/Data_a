"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: SidebarItem[];
  role: "candidate" | "recruiter";
  userName?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ items, role, userName }) => {
  const pathname = usePathname();

  // Distinct mode colors
  const activeBg =
    role === "candidate"
      ? "bg-indigo-50/70 text-indigo-750 dark:bg-indigo-950/20 dark:text-indigo-400 border-l-2 border-indigo-650"
      : "bg-violet-50/70 text-violet-750 dark:bg-violet-950/20 dark:text-violet-400 border-l-2 border-violet-650";

  const hoverBg =
    role === "candidate"
      ? "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/5 hover:text-indigo-600"
      : "hover:bg-violet-50/30 dark:hover:bg-violet-950/5 hover:text-violet-600";

  return (
    <aside className="w-full md:w-64 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div className="flex-1 py-6 flex flex-col justify-between">
        {/* Navigation list */}
        <nav className="space-y-1.5 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive ? activeBg : `text-zinc-650 dark:text-zinc-400 ${hoverBg}`
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "" : "text-zinc-400 dark:text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Info footer for context */}
        <div className="px-6 py-4 border-t border-zinc-150 dark:border-zinc-850">
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 dark:text-zinc-500 mb-1">
            {role === "candidate" ? "Candidate Portal" : "Recruitment Ops"}
          </p>
          {userName && (
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 truncate">
              {userName}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
