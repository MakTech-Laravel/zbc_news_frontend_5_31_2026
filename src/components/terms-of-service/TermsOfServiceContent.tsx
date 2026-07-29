import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  FileText,
  Gavel,
  Mail,
  Scale,
  User,
} from "lucide-react";

import {
  LegalDocumentLayout,
  LegalSection,
  LegalSummaryBox,
} from "@/components/legal/LegalDocumentLayout";
import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { useLegalSectionScroll } from "@/hooks/useLegalSectionScroll";
import type { TermsOfServiceContent as TermsOfServiceApiContent } from "@/services/admin/termsOfService";
import { fetchPublicTermsOfService } from "@/services/frontend/termsOfService";
import { cn } from "@/lib/utils";

import { TERMS_LEGAL_EMAIL, TERMS_NAV } from "./termsData";

const SECTION_IDS = TERMS_NAV.map((item) => item.id);

function LegalHtml({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "legal-html space-y-4 text-[15px] leading-[1.625rem] text-admin-label",
        "[&_a]:font-semibold [&_a]:text-zbc-blue",
        "[&_strong]:font-bold [&_strong]:text-admin-label",
        "[&_ul]:space-y-2 [&_ul]:pl-0",
        "[&_li]:relative [&_li]:pl-4 before:[&_li]:absolute before:[&_li]:left-0 before:[&_li]:font-bold before:[&_li]:text-zbc-blue before:[&_li]:content-['—']",
        "[&_table]:mt-4 [&_table]:w-full [&_table]:min-w-[520px] [&_table]:text-left [&_table]:text-sm",
        "[&_thead]:bg-zbc-gray-50",
        "[&_th]:border-b [&_th]:border-zbc-gray-200 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-bold [&_th]:text-zbc-hero-navy",
        "[&_td]:border-b [&_td]:border-zbc-gray-100 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-admin-label",
        "[&_tr:last-child_td]:border-0",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function TermsOfServiceContent() {
  const [content, setContent] = useState<TermsOfServiceApiContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeId, scrollToSection } = useLegalSectionScroll(SECTION_IDS, "quick-summary");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setContent(await fetchPublicTermsOfService());
      } catch {
        setError("Unable to load the terms of service right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        Loading terms of service…
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        {error ?? "Terms of service are unavailable."}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Terms of Service"
        meta={content.hero_meta}
        showJumpSelect
        jumpOptions={[...TERMS_NAV]}
        onJump={scrollToSection}
      />

      <LegalDocumentLayout
        navItems={[...TERMS_NAV]}
        activeId={activeId}
        onNavClick={scrollToSection}
        sidebarFooter={
          <a
            href={`mailto:${TERMS_LEGAL_EMAIL}`}
            className="mt-6 inline-flex w-full items-center justify-center gap-1 bg-zbc-hero-navy px-4 py-2.5 text-sm font-bold text-white"
          >
            Contact Legal
          </a>
        }
      >
        <LegalSection id="quick-summary" title="Quick Summary" icon={<Scale className="size-[18px]" />}>
          <LegalSummaryBox title="Key Points — not a substitute for the full terms">
            <LegalHtml
              html={content.quick_summary}
              className="text-zbc-blue-light [&_li]:text-zbc-blue-light [&_strong]:text-zbc-blue-light before:[&_li]:text-zbc-blue-muted"
            />
          </LegalSummaryBox>
        </LegalSection>

        <LegalSection id="account-terms" title="Account Terms" icon={<User className="size-[18px]" />}>
          <LegalHtml html={content.account_terms} />
        </LegalSection>

        <LegalSection
          id="content-ip"
          title="Content & Intellectual Property"
          icon={<FileText className="size-[18px]" />}
        >
          <LegalHtml html={content.content_ip} />
        </LegalSection>

        <LegalSection
          id="subscriptions-payment"
          title="Subscriptions & Payment"
          icon={<CreditCard className="size-[18px]" />}
        >
          <LegalHtml html={content.subscriptions} />
        </LegalSection>

        <LegalSection id="prohibited-conduct" title="Prohibited Conduct" icon={<AlertTriangle className="size-[18px]" />}>
          <LegalHtml html={content.prohibited} />
        </LegalSection>

        <LegalSection id="disputes-legal" title="Disputes & Legal" icon={<Gavel className="size-[18px]" />}>
          <LegalHtml html={content.disputes} />
        </LegalSection>

        <LegalSection id="contact-legal" title="Contact Legal" icon={<Mail className="size-[18px]" />}>
          <LegalHtml html={content.contact} />
        </LegalSection>
      </LegalDocumentLayout>
    </div>
  );
}
