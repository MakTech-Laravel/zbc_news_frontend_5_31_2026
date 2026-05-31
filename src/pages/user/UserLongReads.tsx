import { LongReadsHeader } from "@/components/user/long-reads/LongReadsHeader";
import { LongReadsContent } from "@/components/user/long-reads/LongReadsContent";

export default function UserLongReads() {
  return (
    <div className="space-y-6">
      <LongReadsHeader />
      <LongReadsContent />
    </div>
  );
}
