import { CookiePolicyContent } from "@/components/cookie-policy/CookiePolicyContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function CookiePolicy() {
  useDocumentHead({
    path: "/cookie-policy",
    title: "Cookie Policy | ZBC News",
    description:
      "Understand how ZBC News uses cookies, manage your preferences, and learn about browser-level controls and our cookie retention policy.",
  });

  return <CookiePolicyContent />;
}
