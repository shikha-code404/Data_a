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
    name: "Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Senior Full-Stack Engineer",
    skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL", "PostgreSQL"],
    matchScore: 94,
    overallScore: 91,
    email: "ananya.sharma@devmail.in",
    phone: "+91 98765 43210",
    location: "Bangalore, Karnataka (Remote)",
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
        degree: "B.Tech in Computer Science",
        school: "IIT Bombay",
        year: "2019"
      }
    ]
  },
  {
    id: "cand-2",
    name: "Aarav Mehta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    title: "AI/ML Engineering Lead",
    skills: ["Python", "PyTorch", "Transformers", "LLMs", "LangChain", "FastAPI"],
    matchScore: 89,
    overallScore: 88,
    email: "aarav.m@neuralnet.in",
    phone: "+91 98123 45678",
    location: "Mumbai, Maharashtra (On-site)",
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
        degree: "M.Tech in Artificial Intelligence",
        school: "IIT Delhi",
        year: "2021"
      }
    ]
  },
  {
    id: "cand-3",
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    title: "Senior Product Engineer",
    skills: ["React Native", "TypeScript", "Tailwind CSS", "Expo", "Swift", "Firebase"],
    matchScore: 85,
    overallScore: 84,
    email: "priya.p@proddev.in",
    phone: "+91 97654 32109",
    location: "Delhi NCR (Hybrid)",
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
        degree: "B.E. in Computer Science",
        school: "BITS Pilani",
        year: "2020"
      }
    ]
  },
  {
    id: "cand-4",
    name: "Rohan Verma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    title: "DevOps & Cloud Architect",
    skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Go", "GitHub Actions"],
    matchScore: 78,
    overallScore: 81,
    email: "rohan.c@infraflow.in",
    phone: "+91 96543 21098",
    location: "Hyderabad, Telangana (Remote)",
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
        degree: "B.Tech in Computer Engineering",
        school: "IIT Madras",
        year: "2020"
      }
    ]
  },
  {
    id: "cand-5",
    name: "Diya Nair",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    title: "Backend Core Systems Engineer",
    skills: ["Rust", "Go", "gRPC", "Redis", "Distributed Systems", "Kafka"],
    matchScore: 92,
    overallScore: 89,
    email: "diya.n@rustcore.in",
    phone: "+91 95432 10987",
    location: "Pune, Maharashtra (Hybrid)",
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
        degree: "B.Tech in Computer Science",
        school: "IIT Kharagpur",
        year: "2021"
      }
    ]
  }
];

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Senior AI & Platform Engineer",
    company: "Zomato AI Labs",
    location: "Gurugram, Haryana (Hybrid)",
    type: "Full-time",
    salary: "₹32,00,000 - ₹45,00,000 PA + ESOPs",
    matchScore: 95,
    description: "Design high-concurrency LLM agents, real-time demand forecasting models, and candidate recommendation microservices. Work directly with core AI Infrastructure teams.",
    requirements: [
      "4+ years of experience building Python and FastAPI microservices.",
      "Hands-on experience with PyTorch, LangChain, and vector embeddings.",
      "Familiarity with Next.js or React frontend integration."
    ],
    badges: ["Python", "FastAPI", "PyTorch", "TypeScript", "LangChain"]
  },
  {
    id: "job-2",
    title: "Lead Full-Stack Developer (Next.js & Supabase)",
    company: "Razorpay",
    location: "Bangalore, Karnataka (On-site)",
    type: "Full-time",
    salary: "₹28,00,000 - ₹38,00,000 PA",
    matchScore: 92,
    description: "Architect end-to-end merchant checkout suites and AI fraud detection dashboards. Optimize server actions, SSR caching, and high-volume transaction UI components.",
    requirements: [
      "5+ years of experience with React, Next.js App Router, and TypeScript.",
      "Experience with Supabase PostgreSQL, RLS policies, and serverless functions.",
      "Proven track record building high-converting fintech interfaces."
    ],
    badges: ["Next.js", "React", "TypeScript", "Supabase", "Node.js"]
  },
  {
    id: "job-3",
    title: "Cloud Infrastructure & DevOps Lead",
    company: "PhonePe Tech",
    location: "Bangalore, Karnataka (Hybrid)",
    type: "Full-time",
    salary: "₹35,00,000 - ₹50,00,000 PA",
    matchScore: 88,
    description: "Manage multi-region Kubernetes clusters handling 100M+ daily UPI requests. Implement zero-downtime CI/CD pipelines, automated security scanning, and failovers.",
    requirements: [
      "Strong background in AWS, Kubernetes, and Docker container orchestration.",
      "Experience with Terraform, Infrastructure as Code, and Prometheus monitoring.",
      "Proficiency in Go or Python for infrastructure automation."
    ],
    badges: ["AWS", "Kubernetes", "Docker", "Terraform", "Go"]
  },
  {
    id: "job-4",
    title: "Senior Backend Microservices Specialist",
    company: "Swiggy Engineering",
    location: "Bangalore, Karnataka (Remote)",
    type: "Full-time",
    salary: "₹26,00,000 - ₹36,00,000 PA",
    matchScore: 85,
    description: "Build distributed dispatch engines, event-driven ordering pipelines, and low-latency location indexing services serving peak-hour traffic.",
    requirements: [
      "Experience building distributed systems in Java, Spring Boot, or Go.",
      "Deep understanding of Redis caching, Kafka queues, and PostgreSQL indexing.",
      "Experience with gRPC and RESTful API architecture."
    ],
    badges: ["Java", "Spring Boot", "Go", "Redis", "Kafka"]
  },
  {
    id: "job-5",
    title: "AI Mobile App Engineer (React Native & Expo)",
    company: "Cred",
    location: "Bangalore, Karnataka (Hybrid)",
    type: "Full-time",
    salary: "₹24,00,000 - ₹34,00,000 PA + Equity",
    matchScore: 81,
    description: "Craft high-performance, fluid mobile UI experiences, custom design system animations, and offline-first mobile payment workflows.",
    requirements: [
      "3+ years with React Native, Expo, and TypeScript.",
      "Experience building custom micro-interactions and smooth 60fps animations.",
      "Familiarity with GraphQL and state management (Redux/Zustand)."
    ],
    badges: ["React Native", "Expo", "TypeScript", "GraphQL", "Redux"]
  },
  {
    id: "job-6",
    title: "Junior Frontend Engineer (Beginner Role)",
    company: "Postman India",
    location: "Hyderabad, Telangana (Remote)",
    type: "Full-time",
    salary: "₹15,00,000 - ₹20,00,000 PA",
    matchScore: 84,
    description: "Build client-side API workspace features, UI components, and accessible web interface suites under senior technical mentorship.",
    requirements: [
      "0-2 years of experience with JavaScript, HTML, CSS, and React.",
      "Understanding of REST APIs, Git, and web fundamentals.",
      "Eagerness to learn design system standards and client state management."
    ],
    badges: ["React", "TypeScript", "JavaScript", "HTML", "CSS"]
  },
  {
    id: "job-7",
    title: "Full Stack Machine Learning Engineer",
    company: "Google India",
    location: "Bangalore, Karnataka (Hybrid)",
    type: "Full-time",
    salary: "₹38,00,000 - ₹55,00,000 PA + Stock Units",
    matchScore: 74,
    description: "Develop scalable ML pipelines for candidate ranking, vector similarity matching, and natural language search indexing.",
    requirements: [
      "Proficiency in Python, Scikit-Learn, Pandas, NumPy, and TensorFlow/PyTorch.",
      "Experience with Google Cloud Platform, BigQuery, and vector DB search.",
      "Solid foundation in data structures and C++ or TypeScript."
    ],
    badges: ["Python", "Machine Learning", "Scikit-Learn", "Google Cloud", "NumPy"]
  },
  {
    id: "job-8",
    title: "Associate Software Engineer (Beginner Role)",
    company: "Razorpay Labs",
    location: "Bangalore, Karnataka (On-site)",
    type: "Full-time",
    salary: "₹15,00,000 - ₹20,00,000 PA",
    matchScore: 88,
    description: "Collaborate with core engineering teams building modern fintech UI portals, checkout widgets, and internal analytics tools.",
    requirements: [
      "0-2 years experience with React, Next.js, and JavaScript.",
      "Good understanding of SQL databases, APIs, and web security basics.",
      "Strong problem-solving mindset and team communication."
    ],
    badges: ["React", "Next.js", "TypeScript", "SQL", "JavaScript"]
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
