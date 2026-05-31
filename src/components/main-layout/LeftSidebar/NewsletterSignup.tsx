import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  return (
    <SidebarCard className="bg-surface-soft rounded-xs">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="size-5 text-primary" />
          <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Daily Newsletter</h2>
        </div>
        <p className="mb-3 font-inter text-xs text-zbc-gray-700">
          Get the top stories delivered to your inbox every morning.
        </p>
      </div>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          type="email"
          placeholder="Enter your email"
          className="h-10 rounded-xs border-border bg-input font-inter text-xs text-foreground"
        />
        <Button
          type="submit"
          className="w-full rounded-none bg-primary font-inter text-xs font-bold text-primary-foreground hover:bg-bg-primary-500 cursor-pointer"
        >
          Subscribe Now
        </Button>
      </form>
    </SidebarCard>
  );
}
