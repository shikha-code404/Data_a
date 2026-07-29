import React from "react";
import { Job } from "@/lib/mock-data";
import { MatchScorePill } from "./MatchScorePill";
import { MapPin, Briefcase, DollarSign, ArrowUpRight } from "lucide-react";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply = () => {},
  onView = () => {},
}) => {
  return (
    <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60 flex flex-col justify-between h-full group">
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {job.company}
            </p>
          </div>
          <MatchScorePill score={job.matchScore} />
        </div>

        {/* Info Rows */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
            {job.type}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
            {job.salary}
          </span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {job.badges.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <button
          onClick={() => onView(job.id)}
          className="flex-1 text-center py-2 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onApply(job.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm"
        >
          Apply Now
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
