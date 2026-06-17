import { AdvertiseContent } from "@/components/advertise/AdvertiseContent";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function Advertise() {
  useDocumentHead({ path: "/advertise", title: "Advertise | ZBC News" });

  return <AdvertiseContent />;
}
