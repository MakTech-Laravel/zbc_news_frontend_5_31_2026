import { useMemo, useState } from "react";
import {
  Cloud,
  Database,
  Globe,
  Lock,
  Mail,
  Shield,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  LegalBulletList,
  LegalCheckGrid,
  LegalDocumentLayout,
  LegalSection,
  LegalSidebarContact,
  LegalSummaryBox,
} from "@/components/legal/LegalDocumentLayout";
import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { useLegalSectionScroll } from "@/hooks/useLegalSectionScroll";

import {
  PRIVACY_AUTO_COLLECTED,
  PRIVACY_EMAIL,
  PRIVACY_INFO_YOU_GIVE,
  PRIVACY_NAV,
  PRIVACY_PLAIN_SUMMARY,
  PRIVACY_RIGHTS,
  PRIVACY_SECURITY,
  PRIVACY_THIRD_PARTIES,
  PRIVACY_USE_PURPOSES,
} from "./privacyPolicyData";

const SECTION_IDS = PRIVACY_NAV.map((item) => item.id);

export function PrivacyPolicyContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { activeId, scrollToSection } = useLegalSectionScroll(SECTION_IDS, "overview");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSectionVisible = (keywords: string[]) =>
    !normalizedQuery || keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));

  const visibleSections = useMemo(
    () => ({
      overview: isSectionVisible(["overview", "gdpr", "ccpa", "lgpd", "zbc news"]),
      data: isSectionVisible(["data we collect", "account", "stripe", "payment", "cookie"]),
      use: isSectionVisible(["how we use", "personalise", "advertising", "analytics"]),
      rights: isSectionVisible(["your rights", "access", "erasure", "portability"]),
      security: isSectionVisible(["data security", "tls", "encryption", "soc"]),
      thirdParties: isSectionVisible(["third", "stripe", "aws", "cloudflare", "plausible"]),
      contact: isSectionVisible(["contact", "privacy team", "dpo"]),
    }),
    [normalizedQuery],
  );

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Privacy Policy"
        meta="Last updated: June 1, 2026 · Version 4.1 · Effective: June 1, 2026"
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
        <LegalSummaryBox title="Plain-English Summary">{PRIVACY_PLAIN_SUMMARY}</LegalSummaryBox>

        {visibleSections.overview ? (
          <LegalSection id="overview" title="Overview" icon={<Shield className="size-[18px]" />}>
            <div className="space-y-4 text-[15px] leading-[1.625rem] text-admin-label">
              <p>
                ZBC News Media Group (&quot;ZBC News,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
                committed to protecting your personal information. This Privacy Policy explains how we collect, use,
                share, and protect information when you use our website, mobile applications, newsletters, and any other
                services (collectively, &quot;Services&quot;).
              </p>
              <p>
                This policy applies to all ZBC News visitors, subscribers, contributors, and advertising partners. By
                using our Services, you accept the practices described in this policy.
              </p>
              <p>We comply with the GDPR (EU/UK), CCPA (California), and LGPD (Brazil) as applicable to your jurisdiction.</p>
            </div>
          </LegalSection>
        ) : null}

        {visibleSections.data ? (
          <LegalSection id="data-we-collect" title="Data We Collect" icon={<Database className="size-[18px]" />}>
            <p className="text-[15px] font-bold text-admin-label">Information you give us:</p>
            <div className="pt-4">
              <LegalBulletList items={PRIVACY_INFO_YOU_GIVE} />
            </div>
            <p className="pt-6 text-[15px] font-bold text-admin-label">Automatically collected:</p>
            <div className="pt-4">
              <LegalBulletList items={PRIVACY_AUTO_COLLECTED} />
            </div>
          </LegalSection>
        ) : null}

        {visibleSections.use ? (
          <LegalSection id="how-we-use-it" title="How We Use Your Data" icon={<Globe className="size-[18px]" />}>
            <p className="text-[15px] text-admin-label">We use your information for these purposes only:</p>
            <div className="pt-4">
              <LegalCheckGrid items={PRIVACY_USE_PURPOSES} />
            </div>
            <div className="mt-4 rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-4 text-sm leading-5 text-admin-label">
              <span className="font-bold">We do not sell your personal data.</span> We do not share personal data with
              third parties for their marketing purposes without explicit consent.
            </div>
          </LegalSection>
        ) : null}

        {visibleSections.rights ? (
          <LegalSection id="your-rights" title="Your Rights" icon={<UserCheck className="size-[18px]" />}>
            <p className="text-[15px] text-admin-label">Depending on your jurisdiction, you have the following rights:</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRIVACY_RIGHTS.map((right) => (
                <div key={right.title} className="rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-4">
                  <p className="text-sm font-bold text-zbc-hero-navy">{right.title}</p>
                  <p className="pt-0.5 text-xs leading-4 text-admin-label">{right.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[15px] text-admin-label">
              To exercise any right, email{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold text-zbc-blue">
                {PRIVACY_EMAIL}
              </a>
              . We will respond within 30 days (EU/UK: per GDPR Article 12).
            </p>
          </LegalSection>
        ) : null}

        {visibleSections.security ? (
          <LegalSection id="data-security" title="Data Security" icon={<Lock className="size-[18px]" />}>
            <p className="text-[15px] text-admin-label">
              We implement appropriate technical and organisational measures:
            </p>
            <div className="pt-4">
              <LegalCheckGrid items={PRIVACY_SECURITY} />
            </div>
          </LegalSection>
        ) : null}

        {visibleSections.thirdParties ? (
          <LegalSection id="third-parties" title="Third-Party Services" icon={<Cloud className="size-[18px]" />}>
            <p className="text-[15px] text-admin-label">We use these third-party processors:</p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-zbc-gray-200">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-zbc-gray-50">
                  <tr className="border-b border-zbc-gray-200">
                    <th className="px-4 py-2.5 font-bold text-zbc-hero-navy">Provider</th>
                    <th className="px-4 py-2.5 font-bold text-zbc-hero-navy">Purpose</th>
                    <th className="px-4 py-2.5 font-bold text-zbc-hero-navy">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIVACY_THIRD_PARTIES.map((row) => (
                    <tr key={row.provider} className="border-b border-zbc-gray-100 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-zbc-hero-navy">{row.provider}</td>
                      <td className="px-4 py-2.5 text-admin-label">{row.purpose}</td>
                      <td className="px-4 py-2.5 text-admin-label">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LegalSection>
        ) : null}

        {visibleSections.contact ? (
          <LegalSection id="contact-us" title="Contact Our Privacy Team" icon={<Mail className="size-[18px]" />}>
            <p className="text-[15px] text-admin-label">Our Data Protection Officer can be reached at:</p>
            <div className="mt-4 rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-zbc-hero-navy">Email</p>
                  <a href={`mailto:${PRIVACY_EMAIL}`} className="text-sm text-zbc-blue">
                    {PRIVACY_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-bold text-zbc-hero-navy">Mail</p>
                  <p className="text-sm leading-5 text-admin-label">
                    Data Protection Officer
                    <br />
                    ZBC News Media Group
                    <br />
                    250 West 57th St, New York, NY
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="inline-flex items-center gap-2 bg-zbc-hero-navy px-5 py-2.5 text-sm font-bold text-white"
              >
                Contact Privacy Team
              </a>
              <Link
                to="/cookie-policy"
                className="inline-flex items-center border border-zbc-gray-200 px-5 py-2.5 text-sm font-bold text-admin-label"
              >
                Cookie Policy
              </Link>
            </div>
          </LegalSection>
        ) : null}
      </LegalDocumentLayout>
    </div>
  );
}
