import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  Database,
  Globe,
  Lock,
  Mail,
  Shield,
  UserCheck,
} from "lucide-react";

import {
  LegalDocumentLayout,
  LegalSection,
  LegalSidebarContact,
  LegalSummaryBox,
} from "@/components/legal/LegalDocumentLayout";
import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { useLegalSectionScroll } from "@/hooks/useLegalSectionScroll";
import type { PrivacyPolicyContent as PrivacyPolicyApiContent } from "@/services/admin/privacyPolicy";
import { fetchPublicPrivacyPolicy } from "@/services/frontend/privacyPolicy";
import { cn } from "@/lib/utils";

import { PRIVACY_EMAIL, PRIVACY_NAV } from "./privacyPolicyData";

const SECTION_IDS = PRIVACY_NAV.map((item) => item.id);

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

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

export function PrivacyPolicyContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<PrivacyPolicyApiContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeId, scrollToSection } = useLegalSectionScroll(SECTION_IDS, "overview");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setContent(await fetchPublicPrivacyPolicy());
      } catch {
        setError("Unable to load the privacy policy right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const isSectionVisible = (label: string, html: string) => {
    if (!normalizedQuery) return true;
    return label.toLowerCase().includes(normalizedQuery) || stripHtml(html).includes(normalizedQuery);
  };

  const visibleSections = useMemo(() => {
    if (!content) {
      return {
        overview: true,
        data: true,
        use: true,
        rights: true,
        security: true,
        thirdParties: true,
        contact: true,
      };
    }

    return {
      overview: isSectionVisible("Overview", content.overview),
      data: isSectionVisible("Data We Collect", content.data_we_collect),
      use: isSectionVisible("How We Use Your Data", content.how_we_use),
      rights: isSectionVisible("Your Rights", content.your_rights),
      security: isSectionVisible("Data Security", content.data_security),
      thirdParties: isSectionVisible("Third-Party Services", content.third_parties),
      contact: isSectionVisible("Contact Our Privacy Team", content.contact),
    };
  }, [content, normalizedQuery]);

  if (loading) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        Loading privacy policy…
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        {error ?? "Privacy policy is unavailable."}
      </div>
    );
  }

  const showSummary =
    !normalizedQuery ||
    "plain-english summary".includes(normalizedQuery) ||
    stripHtml(content.plain_summary).includes(normalizedQuery);

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Privacy Policy"
        meta={content.hero_meta}
        showSearch
        searchPlaceholder="Search this policy…"
        onSearch={setSearchQuery}
      />

      <LegalDocumentLayout
        navItems={[...PRIVACY_NAV]}
        activeId={activeId}
        onNavClick={scrollToSection}
        sidebarFooter={
          <LegalSidebarContact
            linkLabel="Contact our privacy team"
            linkTo={`mailto:${PRIVACY_EMAIL}`}
            email={PRIVACY_EMAIL}
          />
        }
      >
        {showSummary ? (
          <LegalSummaryBox title="Plain-English Summary">
            <LegalHtml html={content.plain_summary} className="text-zbc-blue-light [&_strong]:text-zbc-blue-light" />
          </LegalSummaryBox>
        ) : null}

        {visibleSections.overview ? (
          <LegalSection id="overview" title="Overview" icon={<Shield className="size-[18px]" />}>
            <LegalHtml html={content.overview} />
          </LegalSection>
        ) : null}

        {visibleSections.data ? (
          <LegalSection id="data-we-collect" title="Data We Collect" icon={<Database className="size-[18px]" />}>
            <LegalHtml html={content.data_we_collect} />
          </LegalSection>
        ) : null}

        {visibleSections.use ? (
          <LegalSection id="how-we-use-it" title="How We Use Your Data" icon={<Globe className="size-[18px]" />}>
            <LegalHtml html={content.how_we_use} />
          </LegalSection>
        ) : null}

        {visibleSections.rights ? (
          <LegalSection id="your-rights" title="Your Rights" icon={<UserCheck className="size-[18px]" />}>
            <LegalHtml html={content.your_rights} />
          </LegalSection>
        ) : null}

        {visibleSections.security ? (
          <LegalSection id="data-security" title="Data Security" icon={<Lock className="size-[18px]" />}>
            <LegalHtml html={content.data_security} />
          </LegalSection>
        ) : null}

        {visibleSections.thirdParties ? (
          <LegalSection id="third-parties" title="Third-Party Services" icon={<Cloud className="size-[18px]" />}>
            <LegalHtml
              html={content.third_parties}
              className="[&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-zbc-gray-200"
            />
          </LegalSection>
        ) : null}

        {visibleSections.contact ? (
          <LegalSection id="contact-us" title="Contact Our Privacy Team" icon={<Mail className="size-[18px]" />}>
            <LegalHtml html={content.contact} />
          </LegalSection>
        ) : null}
      </LegalDocumentLayout>
    </div>
  );
}
