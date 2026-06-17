import { AccessibilityStatementContent } from "@/components/accessibility-statement/AccessibilityStatementContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function AccessibilityStatement() {
  useDocumentHead({
    path: "/accessibility-statement",
    title: "Accessibility Statement | ZBC News",
    description:
      "ZBC News is committed to WCAG 2.1 AA accessibility. Learn about our features, supported technologies, and how to report barriers.",
  });

  return <AccessibilityStatementContent />;
}
