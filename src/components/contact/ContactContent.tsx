import { ContactDailyBrief } from "@/components/contact/ContactDailyBrief";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfoPanel } from "@/components/contact/ContactInfoPanel";

export function ContactContent() {
  return (
    <div className="bg-white">
      <ContactHero />

      <section className="py-20 md:py-24">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="grid gap-12 xl:grid-cols-2 xl:gap-16">
            <ContactForm />
            <ContactInfoPanel />
          </div>
        </div>
      </section>

      <ContactDailyBrief />
    </div>
  );
}
