export type CareersStat = {
  value: string;
  label: string;
};

export type CareersPerk = {
  emoji: string;
  title: string;
  description: string;
};

export type JobDepartment =
  | "Editorial"
  | "Engineering"
  | "Multimedia"
  | "Audience"
  | "Commercial";

export type JobType = "Full-time" | "Contract";

export type JobListing = {
  id: string;
  title: string;
  type: JobType;
  department: JobDepartment;
  location: string;
};

export type HiringStep = {
  number: string;
  title: string;
  description: string;
};

export type TeamTestimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
  rating: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const CAREERS_HERO = {
  badge: "Now Hiring",
  headline: "Tell Stories That Matter. Build Tools for Journalists Who Do.",
  subheadline:
    "Join 120+ journalists, engineers, and storytellers working to hold power accountable. We're hiring across editorial, engineering, audience, and commercial teams.",
  primaryCta: "View Open Positions",
  secondaryCta: "Our Culture",
};

export const CAREERS_STATS: CareersStat[] = [
  { value: "120+", label: "Team Members" },
  { value: "22", label: "Countries" },
  { value: "68%", label: "Remote Roles" },
  { value: "4.7★", label: "Glassdoor" },
];

export const CAREERS_PERKS_SECTION = {
  eyebrow: "Perks & Benefits",
  heading: "What We Offer",
};

export const CAREERS_PERKS: CareersPerk[] = [
  {
    emoji: "🏥",
    title: "Full Health Coverage",
    description: "Medical, dental, and vision for you and your family.",
  },
  {
    emoji: "🌍",
    title: "Remote-Friendly",
    description: "Flexible remote and hybrid arrangements across most roles.",
  },
  {
    emoji: "📚",
    title: "Learning Budget",
    description: "$2,500/year for journalism conferences, courses, and books.",
  },
  {
    emoji: "✈️",
    title: "Press Travel",
    description: "Budget for field reporting, international coverage, and press events.",
  },
  {
    emoji: "🏖️",
    title: "Generous PTO",
    description: "25 days vacation + public holidays. Mandatory minimums enforced.",
  },
  {
    emoji: "📡",
    title: "Equipment Stipend",
    description: "$1,200 home office setup + $600 annual refresh.",
  },
];

export const CAREERS_POSITIONS_SECTION = {
  eyebrow: "Roles",
  heading: "Open Positions",
  searchPlaceholder: "Search roles, teams, skills…",
};

export const DEPARTMENT_FILTERS = [
  "All",
  "Editorial",
  "Engineering",
  "Multimedia",
  "Audience",
  "Commercial",
] as const;

export type DepartmentFilter = (typeof DEPARTMENT_FILTERS)[number];

export const TYPE_FILTERS = ["All Types", "Full-time", "Contract"] as const;

export type TypeFilter = (typeof TYPE_FILTERS)[number];

export const JOB_LISTINGS: JobListing[] = [
  {
    id: "senior-investigative-reporter",
    title: "Senior Investigative Reporter",
    type: "Full-time",
    department: "Editorial",
    location: "New York, NY",
  },
  {
    id: "video-journalist",
    title: "Video Journalist",
    type: "Full-time",
    department: "Multimedia",
    location: "Remote",
  },
  {
    id: "data-journalist",
    title: "Data Journalist",
    type: "Full-time",
    department: "Editorial",
    location: "Washington D.C.",
  },
  {
    id: "mobile-app-engineer",
    title: "Mobile App Engineer",
    type: "Full-time",
    department: "Engineering",
    location: "Remote",
  },
  {
    id: "newsletter-editor",
    title: "Newsletter Editor",
    type: "Full-time",
    department: "Audience",
    location: "Remote",
  },
  {
    id: "advertising-sales-manager",
    title: "Advertising Sales Manager",
    type: "Full-time",
    department: "Commercial",
    location: "New York, NY",
  },
  {
    id: "international-correspondent-apac",
    title: "International Correspondent – APAC",
    type: "Full-time",
    department: "Editorial",
    location: "Singapore",
  },
];

export const CAREERS_HIRING_SECTION = {
  eyebrow: "What to Expect",
  heading: "Our Hiring Process",
};

export const HIRING_STEPS: HiringStep[] = [
  {
    number: "01",
    title: "Apply Online",
    description: "Submit your CV, portfolio or work samples, and a brief cover letter.",
  },
  {
    number: "02",
    title: "Initial Screen",
    description:
      "30-minute video call with our People team to discuss your background and the role.",
  },
  {
    number: "03",
    title: "Skills Task",
    description:
      "A focused take-home exercise relevant to your role. Max 3 hours — we respect your time.",
  },
  {
    number: "04",
    title: "Panel Interview",
    description:
      "Meet your potential team. Two rounds, covering craft, values, and collaboration style.",
  },
  {
    number: "05",
    title: "Offer",
    description:
      "We aim to make decisions within 48 hours of your final interview. No ghosting.",
  },
];

export const CAREERS_TESTIMONIALS_SECTION = {
  eyebrow: "Team Stories",
  heading: "From Our Team",
};

export const TEAM_TESTIMONIALS: TeamTestimonial[] = [
  {
    quote:
      "ZBC News lets me do the kind of journalism I went into this career for — without someone killing stories for business reasons.",
    initials: "PN",
    name: "Priya Nair",
    role: "Investigative Reporter",
    rating: 5,
  },
  {
    quote:
      "The remote culture is genuine. I'm based in Lagos, collaborate with New York, and have never felt peripheral to the team.",
    initials: "ED",
    name: "Emeka Diallo",
    role: "Africa Correspondent",
    rating: 5,
  },
  {
    quote:
      "As an engineer, I love that our work directly serves journalists doing important public-interest reporting.",
    initials: "FB",
    name: "Fiona Blackwood",
    role: "Senior Engineer",
    rating: 5,
  },
];

export const CAREERS_FAQ_SECTION = {
  eyebrow: "Frequently Asked",
  heading: "Candidate FAQ",
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do you sponsor work visas?",
    answer:
      "Yes. For exceptional candidates in editorial and engineering roles, we sponsor work visas in the UK, US, and Singapore where eligible.",
  },
  {
    question: "Are editorial positions open to freelancers?",
    answer:
      "We occasionally hire contract freelancers for special projects, but most editorial roles are full-time staff positions.",
  },
  {
    question: "What's the salary range?",
    answer:
      "We publish salary bands in each job posting and pay at or above industry benchmarks for the role and location.",
  },
  {
    question: "Is there a formal newsroom training programme?",
    answer:
      "Yes. All new editorial hires complete a 6-week onboarding programme covering our ethics code, production tools, and mentorship pairing.",
  },
];

export const CAREERS_CTA = {
  heading: "Don't See Your Role?",
  description:
    "Send us your CV. We're always interested in exceptional journalists and engineers.",
  button: "Get in Touch",
};
