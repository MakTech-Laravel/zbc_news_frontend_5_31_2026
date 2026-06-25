import { lazyWithRetry } from "@/routes/lazyWithRetry";


// Frontend
export const Home = lazyWithRetry(() => import("@/pages/frontend/Home"));
export const Test = lazyWithRetry(() => import("@/pages/frontend/Home"));
export const Politics = lazyWithRetry(() => import("@/pages/frontend/Politics"));
export const Business = lazyWithRetry(() => import("@/pages/frontend/Business"));
export const Sports = lazyWithRetry(() => import("@/pages/frontend/Sports"));
export const Entertainment = lazyWithRetry(() => import("@/pages/frontend/Entertainment"));
export const Technology = lazyWithRetry(() => import("@/pages/frontend/Technology"));
export const WorldNews = lazyWithRetry(() => import("@/pages/frontend/WorldNews"));
export const VideoMedia = lazyWithRetry(() => import("@/pages/frontend/VideoMedia"));
export const NewsDetails = lazyWithRetry(() => import("@/pages/frontend/NewsDetails"));
export const AboutUs = lazyWithRetry(() => import("@/pages/frontend/AboutUs"));
export const Contact = lazyWithRetry(() => import("@/pages/frontend/Contact"));
export const PrivacyPolicy = lazyWithRetry(() => import("@/pages/frontend/PrivacyPolicy"));
export const TermsOfService = lazyWithRetry(() => import("@/pages/frontend/TermsOfService"));
export const CookiePolicy = lazyWithRetry(() => import("@/pages/frontend/CookiePolicy"));
export const AccessibilityStatement = lazyWithRetry(() => import("@/pages/frontend/AccessibilityStatement"));
export const Advertise = lazyWithRetry(() => import("@/pages/frontend/Advertise"));
export const Careers = lazyWithRetry(() => import("@/pages/frontend/Careers"));


// Backend





