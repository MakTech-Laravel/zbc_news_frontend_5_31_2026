import type { ComponentType } from "react";

import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/articles/SocialShareIcons";
import {
  getArticleSharePlatforms,
  openSocialShareWindow,
  type ArticleSharePayload,
  type SharePlatform,
} from "@/lib/articleShare";
import { cn } from "@/lib/utils";

const PLATFORM_CONFIG: Record<
  SharePlatform,
  { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
  facebook: {
    label: "Facebook",
    icon: FacebookIcon,
    className: "bg-[#1877F2] hover:bg-[#166fe5]",
  },
  twitter: {
    label: "X",
    icon: XIcon,
    className: "bg-[#000000] hover:bg-[#1a1a1a]",
  },
  linkedin: {
    label: "LinkedIn",
    icon: LinkedInIcon,
    className: "bg-[#0A66C2] hover:bg-[#0958aa]",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: WhatsAppIcon,
    className: "bg-[#25D366] hover:bg-[#1ebe57]",
  },
};

type ArticleSharePanelProps = {
  payload: ArticleSharePayload;
  layout?: "row" | "grid";
  className?: string;
};

export function ArticleSharePanel({
  payload,
  layout = "row",
  className,
}: ArticleSharePanelProps) {
  const platforms = getArticleSharePlatforms(payload);

  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-2 gap-3"
          : "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      {platforms.map(({ platform, href }) => {
        const config = PLATFORM_CONFIG[platform];
        const Icon = config.icon;

        return (
          <button
            key={platform}
            type="button"
            onClick={() => openSocialShareWindow(href, platform)}
            aria-label={`Share on ${config.label}`}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xs px-3 font-inter text-sm font-semibold text-white transition-colors sm:px-5",
              layout === "row" && "flex-1 sm:max-w-[200px] sm:flex-initial",
              config.className,
            )}
          >
            <Icon className="size-4 shrink-0" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
