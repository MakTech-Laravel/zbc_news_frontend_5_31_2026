import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { NewsletterSignupForm } from "@/components/newsletter/NewsletterSignupForm";

export function NewsletterSignup() {
  return (
    <SidebarCard className="rounded-xs bg-surface-soft">
      <NewsletterSignupForm source="sidebar" showCategories />
    </SidebarCard>
  );
}
