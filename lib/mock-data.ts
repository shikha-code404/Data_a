export interface SubScore {
  category: string;
  value: number;
}

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  matchScore: number;
  overallScore: number;
  subScores: SubScore[];
  email: string;
  phone: string;
  bio: string;
  location: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  matchScore: number;
  description: string;
  requirements: string[];
  badges: string[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  type: "skill" | "project" | "career";
  description: string;
  timeEstimate: string;
  status: "todo" | "in_progress" | "completed";
}

export interface PipelineStage {
  id: string;
  title: string;
  candidates: Candidate[];
}

// 7 sub-scores as requested:
// Coding Ability, Project Quality, Leadership, Problem Solving, Innovation, Community Participation, Technical Consistency
export const mockTalentScore = {
  overall: 88,
  subScores: [
    { category: "Coding Ability", value: 92 },
    { category: "Project Quality", value: 85 },
    { category: "Leadership", value: 78 },
    { category: "Problem Solving", value: 95 },
    { category: "Innovation", value: 80 },
    { category: "Community Participation", value: 72 },
    { category: "Technical Consistency", value: 88 },
  ],
};

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Senior Full-Stack Engineer",
    skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL", "PostgreSQL"],
    matchScore: 94,
    overallScore: 91,
    email: "elena.rostova@devmail.io",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA (Remote)",
    bio: "Passionate engineer with 6+ years of experience constructing high-scale web applications. Open-source contributor and technical mentor.",
    subScores: [
      { category: "Coding Ability", value: 95 },
      { category: "Project Quality", value: 90 },
      { category: "Leadership", value: 82 },
      { category: "Problem Solving", value: 96 },
      { category: "Innovation", value: 88 },
      { category: "Community Participation", value: 85 },
      { category: "Technical Consistency", value: 92 },
    ],
    experience: [
      {
        role: "Lead Frontend Engineer",
        company: "Vercel Inc.",
        duration: "2023 - Present",
        description: "Optimizing Next.js core workflows and designing UI design system libraries used by millions of developers worldwide."
      },
      {
        role: "Senior Software Engineer",
        company: "Linear App",
        duration: "2021 - 2023",
        description: "Redesigned team collaboration interfaces, reducing API response times by 30% and modernizing local synchronization engine."
      }
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        school: "Stanford University",
        year: "2019"
      }
    ]
  },
  {
    id: "cand-2",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    title: "AI/ML Engineering Lead",
    skills: ["Python", "PyTorch", "Transformers", "LLMs", "LangChain", "FastAPI"],
    matchScore: 89,
    overallScore: 88,
    email: "marcus.v@neuralnet.org",
    phone: "+1 (555) 041-9988",
    location: "Austin, TX (On-site)",
    bio: "AI researcher turned practical builder. Specializing in fine-tuning large language models and developing low-latency agent architectures.",
    subScores: [
      { category: "Coding Ability", value: 88 },
      { category: "Project Quality", value: 92 },
      { category: "Leadership", value: 85 },
      { category: "Problem Solving", value: 94 },
      { category: "Innovation", value: 95 },
      { category: "Community Participation", value: 65 },
      { category: "Technical Consistency", value: 87 },
    ],
    experience: [
      {
        role: "Principal AI Engineer",
        company: "Anthropic",
        duration: "2022 - Present",
        description: "Leading alignment evaluation teams. Built automated pipeline for testing model capabilities and performance regressions."
      }
    ],
    education: [
      {
        degree: "M.S. in Intelligent Systems",
        school: "Carnegie Mellon University",
        year: "2021"
      }
    ]
  },
  {
    id: "cand-3",
    name: "Yuki Tanaka",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    title: "Senior Product Engineer",
    skills: ["React Native", "TypeScript", "Tailwind CSS", "Expo", "Swift", "Firebase"],
    matchScore: 85,
    overallScore: 84,
    email: "yuki.t@proddev.net",
    phone: "+1 (555) 082-1277",
    location: "New York, NY (Hybrid)",
    bio: "Focusing on delightful, responsive mobile interfaces. Obsessed with micro-interactions, layout physics, and pixel-perfect design assets.",
    subScores: [
      { category: "Coding Ability", value: 84 },
      { category: "Project Quality", value: 88 },
      { category: "Leadership", value: 75 },
      { category: "Problem Solving", value: 82 },
      { category: "Innovation", value: 89 },
      { category: "Community Participation", value: 78 },
      { category: "Technical Consistency", value: 85 },
    ],
    experience: [
      {
        role: "Senior iOS & Web Developer",
        company: "Duolingo",
        duration: "2020 - 2023",
        description: "Implemented gamified learning paths and localized offline lessons for 15+ new languages, improving retention by 12%."
      }
    ],
    education: [
      {
        degree: "B.A. in Interactive Media Design",
        school: "New York University",
        year: "2020"
      }
    ]
  },
  {
    id: "cand-4",
    name: "Devon Carter",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    title: "DevOps & Cloud Architect",
    skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Go", "GitHub Actions"],
    matchScore: 78,
    overallScore: 81,
    email: "devon.c@infraflow.io",
    phone: "+1 (555) 039-4455",
    location: "Seattle, WA (Remote)",
    bio: "System reliability specialist with a programming background. Enjoys automating complex cloud setups and designing bulletproof CI/CD pipelines.",
    subScores: [
      { category: "Coding Ability", value: 80 },
      { category: "Project Quality", value: 83 },
      { category: "Leadership", value: 80 },
      { category: "Problem Solving", value: 85 },
      { category: "Innovation", value: 75 },
      { category: "Community Participation", value: 68 },
      { category: "Technical Consistency", value: 92 },
    ],
    experience: [
      {
        role: "Infrastructure Lead",
        company: "HashiCorp",
        duration: "2021 - 2024",
        description: "Architected internal multi-region cluster deployments, supporting high-throughput testing suites and monitoring infrastructure."
      }
    ],
    education: [
      {
        degree: "B.S. in Computer Engineering",
        school: "University of Washington",
        year: "2020"
      }
    ]
  },
  {
    id: "cand-5",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    title: "Backend Core Systems Engineer",
    skills: ["Rust", "Go", "gRPC", "Redis", "Distributed Systems", "Kafka"],
    matchScore: 92,
    overallScore: 89,
    email: "sjenk@rustcore.net",
    phone: "+1 (555) 066-7788",
    location: "Chicago, IL (Hybrid)",
    bio: "Low-latency systems designer. Deeply interested in concurrency patterns, lock-free data structures, and memory efficiency in Rust.",
    subScores: [
      { category: "Coding Ability", value: 96 },
      { category: "Project Quality", value: 90 },
      { category: "Leadership", value: 70 },
      { category: "Problem Solving", value: 92 },
      { category: "Innovation", value: 82 },
      { category: "Community Participation", value: 88 },
      { category: "Technical Consistency", value: 94 },
    ],
    experience: [
      {
        role: "Staff Rust Engineer",
        company: "Cloudflare",
        duration: "2022 - Present",
        description: "Developed core routing protocol engines handles over 50 million requests per second, maintaining sub-millisecond execution times."
      }
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        school: "University of Illinois Urbana-Champaign",
        year: "2021"
      }
    ]
  }
];

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior Product Engineer (Next.js & AI)",
    company: "Aether AI",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$160k - $200k + Equity",
    matchScore: 94,
    description: "Join our core team building the next generation of AI-driven developer workflows. You will design, build, and optimize customer-facing product interfaces, integrating with LLM backends.",
    requirements: [
      "5+ years of experience with React, TypeScript, and modern styling utilities.",
      "Deep understanding of Next.js App Router, SSR, and client/server component patterns.",
      "Experience interfacing directly with OpenAI, Anthropic, or Hugging Face APIs."
    ],
    badges: ["Next.js", "React", "AI Integration", "TypeScript"]
  },
  {
    id: "job-2",
    title: "Distributed Systems Developer (Rust/Go)",
    company: "ScyllaLabs",
    location: "Remote (US/Canada)",
    type: "Full-time",
    salary: "$170k - $220k",
    matchScore: 82,
    description: "We are building an ultra-fast event streaming platform. You will be responsible for creating reliable, fault-tolerant cluster consensus protocols and optimizing memory layouts.",
    requirements: [
      "Strong experience in Rust or Go, with a focus on multithreaded systems.",
      "Familiarity with network programming, TCP/UDP sockets, and serialization (protobuf/flatbuffers).",
      "Knowledge of consensus algorithms like Raft or Paxos is a major plus."
    ],
    badges: ["Rust", "Go", "Distributed Systems", "gRPC"]
  },
  {
    id: "job-3",
    title: "AI Mobile App Engineer (React Native)",
    company: "MindLink Tech",
    location: "Austin, TX (On-site)",
    type: "Full-time",
    salary: "$130k - $160k",
    matchScore: 71,
    description: "Help us build a companion mobile app that uses local and cloud-based models to summarize, search, and navigate day-to-day voice conversations. Focus on performance, animations, and fluid experiences.",
    requirements: [
      "3+ years of experience with React Native and Expo.",
      "Familiarity with audio processing APIs and local database structures (SQLite, WatermelonDB).",
      "Experience with Tailwind CSS / NativeWind styling."
    ],
    badges: ["React Native", "Expo", "Audio API", "Tailwind CSS"]
  }
];

export const mockRoadmapSteps: RoadmapStep[] = [
  {
    id: "step-1",
    title: "Verify advanced Next.js App Router & Server Actions",
    type: "skill",
    description: "Complete the platform skill assessment in Advanced Next.js features to increase your technical consistency sub-score.",
    timeEstimate: "3-4 hours",
    status: "in_progress"
  },
  {
    id: "step-2",
    title: "Contribute to Next.js Open Source Repo",
    type: "project",
    description: "Submit a pull request resolving an open documentation or bug issue on the Vercel Next.js repository to boost Community Participation.",
    timeEstimate: "1-2 days",
    status: "todo"
  },
  {
    id: "step-3",
    title: "Complete System Design Interview Challenge",
    type: "career",
    description: "Participate in the upcoming platform Hackathon on High-Scale Systems to showcase Problem Solving and Project Quality.",
    timeEstimate: "August 5th (4 hours)",
    status: "todo"
  }
];

export const mockPipelineStages: PipelineStage[] = [
  {
    id: "sourced",
    title: "Sourced",
    candidates: [mockCandidates[3]] // Devon Carter
  },
  {
    id: "screening",
    title: "Screening",
    candidates: [mockCandidates[2]] // Yuki Tanaka
  },
  {
    id: "interview",
    title: "Interview",
    candidates: [mockCandidates[4]] // Sarah Jenkins
  },
  {
    id: "offer",
    title: "Offer",
    candidates: [mockCandidates[1]] // Marcus Vance
  },
  {
    id: "hired",
    title: "Hired",
    candidates: [mockCandidates[0]] // Elena Rostova
  }
];
