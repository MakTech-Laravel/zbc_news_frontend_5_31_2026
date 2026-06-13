import { longReadImages } from "@/lib/longReadImages";

export type {
  LongReadArticle,
  LongReadCollection,
  LongReadLengthFilter,
  LongReadStats,
  LongReadTab,
} from "@/types/longReads";

export {
  filterLongReadArticles,
  formatViewCount,
} from "@/types/longReads";

export const longReadStats = {
  articles: 64,
  averageReadTime: "32 min",
} as const;

export const longReadCollections: import("@/types/longReads").LongReadCollection[] = [
  { id: "climate", label: "Climate & Environment", count: 12 },
  { id: "tech", label: "Technology & Innovation", count: 8 },
  { id: "society", label: "Society & Culture", count: 15 },
  { id: "science", label: "Science & Discovery", count: 10 },
  { id: "politics", label: "Politics & Power", count: 9 },
];

export const longReadLengthFilters: import("@/types/longReads").LongReadLengthFilter[] = [
  { id: "quick", label: "Quick reads (15–20 min)" },
  { id: "medium", label: "Medium (20–30 min)" },
  { id: "deep", label: "Deep dives (30+ min)" },
];

export const editorsNote =
  "Our long-form journalism provides the depth and context needed to understand complex global issues. Each story represents months of research and reporting.";

export const longReadArticles: import("@/types/longReads").LongReadArticle[] = [
  {
    id: "lr-1",
    category: "Environment",
    title: "The Last Forest: Inside the Fight to Save Earth's Remaining Wilderness",
    description:
      "A sweeping investigation into the global struggle to protect our planet's most critical ecosystems, from the Amazon to the Congo Basin. This months-long investigation takes readers deep into remote regions where conservationists, indigenous communities, and corporate interests collide.",
    author: "Maya Thompson & Research Team",
    readTime: "35 min read",
    views: 89400,
    imageUrl: longReadImages.environment,
  },
  {
    id: "lr-2",
    category: "Technology",
    title: "The Quantum Revolution: How Computing Will Transform Everything",
    description:
      "An in-depth exploration of quantum computing's potential to revolutionize medicine, climate modeling, and artificial intelligence. From theoretical physics to practical applications, we trace the journey of this transformative technology.",
    author: "Dr. James Park",
    readTime: "28 min read",
    views: 76200,
    imageUrl: longReadImages.technology,
  },
  {
    id: "lr-3",
    category: "Human Interest",
    title: "Forgotten Voices: Untold Stories of the Refugee Crisis",
    description:
      "Through intimate portraits and years of reporting, this investigation reveals the human stories behind migration statistics. A powerful narrative that challenges assumptions and reveals the resilience of displaced communities.",
    author: "Sarah Mitchell",
    readTime: "42 min read",
    views: 95600,
    imageUrl: longReadImages.humanInterest,
  },
  {
    id: "lr-4",
    category: "Culture",
    title: "The Memory Keepers: Preserving Culture in the Digital Age",
    description:
      "How communities around the world are using technology to preserve endangered languages, traditions, and oral histories before they disappear forever.",
    author: "Alex Chen",
    readTime: "25 min read",
    views: 54800,
    imageUrl: longReadImages.culture,
  },
  {
    id: "lr-5",
    category: "Science",
    title: "Inside the Mind: The Neuroscience of Consciousness",
    description:
      "A deep dive into cutting-edge brain research that's beginning to unlock the mysteries of human consciousness, memory, and the nature of self-awareness.",
    author: "Dr. Rachel Green",
    readTime: "32 min read",
    views: 68300,
    imageUrl: longReadImages.science,
  },
  {
    id: "lr-6",
    category: "Politics",
    title: "The New Silk Road: China's Global Infrastructure Ambitions",
    description:
      "An investigative series examining the geopolitical, economic, and environmental implications of the Belt and Road Initiative across three continents.",
    author: "Li Wei & International Correspondents",
    readTime: "38 min read",
    views: 71200,
    imageUrl: longReadImages.politics,
  },
];
