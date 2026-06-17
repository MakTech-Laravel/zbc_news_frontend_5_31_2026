import { AboutUsContent } from "@/components/about-us/AboutUsContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function AboutUs() {
  useDocumentHead({ path: "/about" });

  return <AboutUsContent />;
}
