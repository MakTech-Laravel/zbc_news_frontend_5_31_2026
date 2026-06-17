import { TermsOfServiceContent } from "@/components/terms-of-service/TermsOfServiceContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function TermsOfService() {
  useDocumentHead({
    path: "/terms-of-service",
    title: "Terms of Service | ZBC News",
    description:
      "Read the ZBC News Terms of Service covering accounts, subscriptions, content rights, prohibited conduct, and dispute resolution.",
  });

  return <TermsOfServiceContent />;
}
