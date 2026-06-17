import { CareersContent } from "@/components/careers/CareersContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function Careers() {
  useDocumentHead({
    path: "/careers",
    title: "Careers | ZBC News",
    description:
      "Join the ZBC News team. Explore open roles in editorial, engineering, multimedia, audience, and commercial — and help us tell stories that matter.",
  });

  return <CareersContent />;
}
