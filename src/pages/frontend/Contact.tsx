import { ContactContent } from "@/components/contact/ContactContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function Contact() {
  useDocumentHead({ path: "/contact" });

  return <ContactContent />;
}
