export const MOCK_PROFILES: Record<string, any> = {
  "0ee73e0e-0529-4480-a16c-15748a277bde": {
    user_id: "0ee73e0e-0529-4480-a16c-15748a277bde",
    github_username: "alexrivera-dev",
    talent_profile: {
      resume: {
        title: "Senior Full Stack Engineer",
        skills: ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "Python"],
        experience: [{ company: "TechSpark", role: "Senior Developer", description: "3+ years Next.js & Supabase" }]
      },
      github: {
        topLanguages: { "TypeScript": 85, "Python": 15 },
        repositories: [{ name: "next-ai-recruiter", description: "AI candidate scoring & vector engine" }]
      },
      manual: {
        hackathons: [{ title: "Global AI Hackathon 2025", award: "1st Place Winner" }]
      }
    },
    talent_score: { overallScore: 92, breakdown: { codeQuality: 95, skillFit: 90 } },
    github_data: {
      repositories: [
        { name: "next-ai-recruiter", description: "AI candidate scoring and vector matching engine", primary_language: "TypeScript", stars: 12, is_fork: false },
        { name: "react-dashboard-ui", description: "Component library", primary_language: "TypeScript", stars: 8, is_fork: false },
        { name: "supabase-rls-helper", description: "Utilities for Supabase RLS", primary_language: "TypeScript", stars: 6, is_fork: false },
        { name: "py-ml-pipeline", description: "Python ML pipeline", primary_language: "Python", stars: 5, is_fork: false },
        { name: "ts-fork-experiment", description: "Forked TypeScript experiment", primary_language: "TypeScript", stars: 0, is_fork: true }
      ],
      languages: { "TypeScript": 0.72, "Python": 0.23, "Shell": 0.05 },
      commits: {
        total_last_12_months: 163,
        by_repository: { "next-ai-recruiter": 82, "react-dashboard-ui": 48, "supabase-rls-helper": 20, "py-ml-pipeline": 13 },
        active_months: ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10"]
      },
      pull_requests: { opened: 31, merged: 24 },
      top_5_repos_by_stars: [
        { name: "next-ai-recruiter", stars: 12 },
        { name: "react-dashboard-ui", stars: 8 },
        { name: "supabase-rls-helper", stars: 6 },
        { name: "py-ml-pipeline", stars: 5 }
      ]
    }
  },
  "1ee73e0e-0529-4480-a16c-15748a277bdf": {
    user_id: "1ee73e0e-0529-4480-a16c-15748a277bdf",
    github_username: "dev-b",
    talent_profile: {
      resume: { title: "Python Backend Engineer", skills: ["Python", "FastAPI", "PostgreSQL"], experience: [] }
    },
    talent_score: { overallScore: 75, breakdown: { codeQuality: 70, skillFit: 80 } },
    github_data: {
      repositories: [{ name: "python-scraper", description: "Async web scraper", primary_language: "Python", stars: 2, is_fork: false }],
      languages: { "Python": 1.0 },
      commits: { total_last_12_months: 45, by_repository: { "python-scraper": 45 }, active_months: ["2025-08", "2025-09"] },
      pull_requests: { opened: 10, merged: 8 },
      top_5_repos_by_stars: [{ name: "python-scraper", stars: 2 }]
    }
  },
  "2ee73e0e-0529-4480-a16c-15748a277be0": {
    user_id: "2ee73e0e-0529-4480-a16c-15748a277be0",
    github_username: "dev-c",
    talent_profile: {
      resume: { title: "Junior UI Designer", skills: ["HTML", "CSS", "JavaScript"], experience: [] }
    },
    talent_score: { overallScore: 60, breakdown: { codeQuality: 55, skillFit: 65 } },
    github_data: {
      repositories: [{ name: "doc-parser", description: "Simple doc parser", primary_language: "JavaScript", stars: 0, is_fork: false }],
      languages: { "JavaScript": 1.0 },
      commits: { total_last_12_months: 12, by_repository: { "doc-parser": 12 }, active_months: ["2025-10"] },
      pull_requests: { opened: 2, merged: 2 },
      top_5_repos_by_stars: []
    }
  }
};
