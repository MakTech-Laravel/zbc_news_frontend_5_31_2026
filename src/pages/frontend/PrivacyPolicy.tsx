import { PrivacyPolicyContent } from "@/components/privacy-policy/PrivacyPolicyContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function PrivacyPolicy() {
  useDocumentHead({
    path: "/privacy-policy",
    title: "Privacy Policy | ZBC News",
    description:
      "Learn how ZBC News collects, uses, and protects your personal data. Read our plain-English summary, your rights, and third-party service details.",
  });

  return <PrivacyPolicyContent />;
}
