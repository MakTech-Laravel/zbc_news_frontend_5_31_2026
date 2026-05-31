
import type { Article } from "./types";

const technologyImages = {
    heroTechnology: "/images/Technology/Image (Tech product).png",
}
export const heroArticle: Article = {
    id: "hero-1",
    category: "Technology",
    title:
      "New AI-Powered Diagnostic Tool Predicts Cancer Risk with 95% Accuracy",
    excerpt:
      "A new study published in Nature Medicine demonstrates a groundbreaking approach to cancer treatment that could revolutionize patient care.",
    imageUrl: technologyImages.heroTechnology,
    author: "ZBC Technology Desk",
    readTime: "6 min read",
    publishedAt: "May 18, 2026",
  };

  export const featuredSpotlight = {
    title: "New AI-Powered Diagnostic Tool Predicts Cancer Risk with 95% Accuracy",
    subtitle: "A new study published in Nature Medicine demonstrates a groundbreaking approach to cancer treatment that could revolutionize patient care.",
    author: "ZBC Technology Desk",
    readTime: "10 min read",
    publishedAt: "May 19, 2026",
    imageUrl: technologyImages.heroTechnology,
  };