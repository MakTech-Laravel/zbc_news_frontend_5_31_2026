import {
  AlertTriangle,
  CreditCard,
  FileText,
  Gavel,
  Mail,
  Scale,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  LegalBulletList,
  LegalCheckGrid,
  LegalDocumentLayout,
  LegalSection,
  LegalSummaryBox,
} from "@/components/legal/LegalDocumentLayout";
import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { useLegalSectionScroll } from "@/hooks/useLegalSectionScroll";

import {
  TERMS_ACCOUNT_ITEMS,
  TERMS_DMCA_EMAIL,
  TERMS_HELP_EMAIL,
  TERMS_KEY_POINTS,
  TERMS_LEGAL_EMAIL,
  TERMS_NAV,
  TERMS_PROHIBITED_ITEMS,
  TERMS_SUBSCRIPTION_ITEMS,
} from "./termsData";

const SECTION_IDS = TERMS_NAV.map((item) => item.id);

export function TermsOfServiceContent() {
  const { activeId, scrollToSection } = useLegalSectionScroll(SECTION_IDS, "quick-summary");

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Terms of Service"
        meta="Last updated: June 1, 2026 · Effective: June 1, 2026"
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
            <LegalCheckGrid items={TERMS_KEY_POINTS} />
          </LegalSummaryBox>
        </LegalSection>

        <LegalSection id="account-terms" title="Account Terms" icon={<User className="size-[18px]" />}>
          <p className="text-[15px] text-admin-label">
            To access certain features, you must create an account. By creating an account, you agree to:
          </p>
          <div className="pt-4">
            <LegalBulletList items={TERMS_ACCOUNT_ITEMS} />
          </div>
          <p className="pt-4 text-[15px] leading-[1.625rem] text-admin-label">
            We may suspend or terminate accounts at our discretion for violation of these Terms, with or without notice.
            Serious violations (including fraud, abuse, or harassment) may result in immediate permanent suspension.
          </p>
        </LegalSection>

        <LegalSection
          id="content-ip"
          title="Content & Intellectual Property"
          icon={<FileText className="size-[18px]" />}
        >
          <div className="space-y-4 text-[15px] leading-[1.625rem] text-admin-label">
            <p>
              <span className="font-bold">Our Content:</span> All ZBC News journalism, design, software, trademarks, and
              logos are protected by copyright and other intellectual property laws. You may share articles for
              non-commercial purposes with attribution; systematic copying or republication is prohibited.
            </p>
            <p>
              <span className="font-bold">Your Content:</span> When you submit comments, letters, or other content to ZBC
              News, you retain ownership but grant us a worldwide, royalty-free, perpetual licence to display, distribute,
              and adapt that content in connection with our Services.
            </p>
            <p>
              <span className="font-bold">DMCA:</span> If you believe content on ZBC News infringes your copyright, send a
              DMCA notice to{" "}
              <a href={`mailto:${TERMS_DMCA_EMAIL}`} className="text-zbc-blue">
                {TERMS_DMCA_EMAIL}
              </a>
              .
            </p>
          </div>
        </LegalSection>

        <LegalSection
          id="subscriptions-payment"
          title="Subscriptions & Payment"
          icon={<CreditCard className="size-[18px]" />}
        >
          <p className="text-[15px] text-admin-label">
            <span className="font-bold">Subscription Plans:</span> ZBC News offers monthly and annual subscription tiers.
            Current pricing is displayed at checkout and is subject to change with 30 days&apos; notice.
          </p>
          <div className="pt-4">
            <LegalBulletList items={TERMS_SUBSCRIPTION_ITEMS} />
          </div>
          <p className="pt-4 text-[15px] text-admin-label">
            To cancel or modify your subscription, visit Account Settings or email{" "}
            <a href={`mailto:${TERMS_HELP_EMAIL}`} className="text-zbc-blue">
              {TERMS_HELP_EMAIL}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection id="prohibited-conduct" title="Prohibited Conduct" icon={<AlertTriangle className="size-[18px]" />}>
          <p className="text-[15px] text-admin-label">When using ZBC News, you must not:</p>
          <div className="pt-4">
            <LegalBulletList items={TERMS_PROHIBITED_ITEMS} />
          </div>
        </LegalSection>

        <LegalSection id="disputes-legal" title="Disputes & Legal" icon={<Gavel className="size-[18px]" />}>
          <div className="space-y-4 text-[15px] leading-[1.625rem] text-admin-label">
            <p>
              <span className="font-bold">Governing Law:</span> These Terms are governed by the laws of the State of New
              York, without regard to conflict-of-law principles.
            </p>
            <p>
              <span className="font-bold">Arbitration:</span> You agree that any dispute between you and ZBC News will be
              resolved through binding individual arbitration under the AAA Consumer Arbitration Rules, in New York, NY.
              Class action lawsuits are waived.
            </p>
            <p>
              <span className="font-bold">Limitation of Liability:</span> ZBC News&apos;s total liability to you for any
              claim arising under these Terms is limited to the amount you paid us in the 12 months preceding the claim.
              We&apos;re not liable for indirect, punitive, or consequential damages.
            </p>
            <p>
              <span className="font-bold">Warranty Disclaimer:</span> ZBC News provides Services &quot;as is&quot; without
              warranties of any kind, to the maximum extent permitted by law.
            </p>
          </div>
        </LegalSection>

        <LegalSection id="contact-legal" title="Contact Legal" icon={<Mail className="size-[18px]" />}>
          <div className="rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-bold text-zbc-hero-navy">Email</p>
                <a href={`mailto:${TERMS_LEGAL_EMAIL}`} className="text-sm text-zbc-blue">
                  {TERMS_LEGAL_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-sm font-bold text-zbc-hero-navy">Mail</p>
                <p className="text-sm leading-5 text-admin-label">
                  Legal Department
                  <br />
                  ZBC News Media Group
                  <br />
                  250 West 57th St, New York, NY 10107
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`mailto:${TERMS_LEGAL_EMAIL}`}
              className="inline-flex items-center gap-2 bg-zbc-hero-navy px-5 py-2.5 text-sm font-bold text-white"
            >
              Contact Legal Team
            </a>
            <Link
              to="/privacy-policy"
              className="inline-flex items-center border border-zbc-gray-200 px-5 py-2.5 text-sm font-bold text-admin-label"
            >
              Privacy Policy
            </Link>
          </div>
        </LegalSection>
      </LegalDocumentLayout>
    </div>
  );
}
