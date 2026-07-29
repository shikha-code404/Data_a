import React from "react";
import { Candidate } from "@/lib/mock-data";
import { MatchScorePill } from "./MatchScorePill";
import { Award, Mail, MapPin } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  onSelect?: (candidateId: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onSelect = () => {},
}) => {
  return (
    <div className="glass-card p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-900/60 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex gap-3 items-center">
            {/* Avatar */}
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-inner"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 font-bold flex items-center justify-center border border-violet-200/50 dark:border-violet-900/30">
                {candidate.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {candidate.name}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {candidate.title}
              </p>
            </div>
          </div>
          <MatchScorePill score={candidate.matchScore} />
        </div>

        {/* Short Bio */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
          {candidate.bio}
        </p>

        {/* Skills Grid */}
        <div className="flex flex-wrap gap-1 mb-4">
          {candidate.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 text-zinc-400">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <Award className="h-4 w-4 text-violet-500" />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {candidate.overallScore}
          </span>
          <span className="text-zinc-400">Talent Score</span>
        </div>
        <button
          onClick={() => onSelect(candidate.id)}
          className="text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
