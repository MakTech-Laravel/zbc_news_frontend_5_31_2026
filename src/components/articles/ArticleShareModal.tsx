import * as React from "react";
import { Copy, Link2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/articles/SocialShareIcons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildShareClipboardText,
  getArticlePageUrl,
  getArticleSharePlatforms,
  getArticleSharePreviewUrl,
  isLocalEnvironment,
  openSocialShareWindow,
  toAbsoluteUrl,
  type ArticleSharePayload,
  type SharePlatform,
} from "@/lib/articleShare";
import { cn } from "@/lib/utils";
import { fetchArticleBySlug } from "@/services/frontend/articles";

const PLATFORM_STYLES: Record<
  SharePlatform,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  facebook: { icon: FacebookIcon, className: "bg-[#1877F2] hover:bg-[#166fe5]" },
  twitter: { icon: XIcon, className: "bg-[#000000] hover:bg-[#1a1a1a]" },
  linkedin: { icon: LinkedInIcon, className: "bg-[#0A66C2] hover:bg-[#0958aa]" },
  whatsapp: { icon: WhatsAppIcon, className: "bg-[#25D366] hover:bg-[#1ebe57]" },
};

export type ArticleShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug?: string;
  title: string;
  summary?: string;
  imageUrl?: string;
};

export function ArticleShareModal({
  open,
  onOpenChange,
  slug,
  title,
  summary,
  imageUrl,
}: ArticleShareModalProps) {
  const [loadingMeta, setLoadingMeta] = React.useState(false);
  const [resolved, setResolved] = React.useState<ArticleSharePayload | null>(null);

  React.useEffect(() => {
    if (!open) {
      setResolved(null);
      return;
    }

    if (!slug) {
      setResolved({ slug: "", title, summary, imageUrl });
      return;
    }

    let isMounted = true;
    setLoadingMeta(true);

    fetchArticleBySlug(slug)
      .then((article) => {
        if (!isMounted) return;
        if (!article) {
          setResolved({ slug, title, summary, imageUrl });
          return;
        }

        setResolved({
          slug: article.slug,
          title: article.metaTitle || article.title || title,
          summary: article.metaDescription || article.subtitle || summary,
          imageUrl: article.shareImageUrl || article.imageUrl || imageUrl,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setResolved({ slug, title, summary, imageUrl });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, slug, title, summary, imageUrl]);

  const payload = resolved ?? (slug ? { slug, title, summary, imageUrl } : null);
  const canShare = Boolean(payload?.slug);
  const platforms = payload?.slug ? getArticleSharePlatforms(payload) : [];
  const previewImage = payload?.imageUrl ? toAbsoluteUrl(payload.imageUrl) : "";
  const pageUrl = payload?.slug ? getArticlePageUrl(payload.slug) : "";
  const ogPreviewUrl = payload?.slug ? getArticleSharePreviewUrl(payload.slug) : "";

  async function handleCopyLink() {
    if (!payload?.slug) return;

    try {
      await navigator.clipboard.writeText(buildShareClipboardText(payload));
      toast.success("Article link copied to clipboard");
    } catch {
      toast.error("Unable to copy article link");
    }
  }

  function handlePlatformClick(platform: SharePlatform, href: string) {
    openSocialShareWindow(href, platform);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b border-border px-6 pb-4 pt-6 text-left">
          <DialogTitle className="font-inter text-xl font-semibold text-admin-heading">
            Share article
          </DialogTitle>
          <DialogDescription className="font-inter text-sm text-admin-label">
            Share with full title, description, and image preview on social networks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {loadingMeta ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-8 text-sm text-admin-label">
              <Loader2 className="size-4 animate-spin" />
              Loading share preview…
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className="aspect-[1.91/1] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-sm text-admin-label">
                  No preview image
                </div>
              )}
              <div className="space-y-1 border-t border-border p-4">
                <p className="line-clamp-2 font-inter text-base font-semibold text-admin-heading">
                  {payload?.title || title}
                </p>
                {payload?.summary ? (
                  <p className="line-clamp-2 text-sm text-admin-label">{payload.summary}</p>
                ) : null}
                {pageUrl ? (
                  <p className="truncate pt-1 text-xs text-admin-trend-muted">{pageUrl}</p>
                ) : null}
              </div>
            </div>
          )}

          {isLocalEnvironment() && canShare ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              On localhost, Facebook and LinkedIn cannot fetch preview images. In production, OG
              metadata is served from{" "}
              <span className="break-all font-medium">{ogPreviewUrl}</span>
            </p>
          ) : null}

          {canShare ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map(({ platform, label, href }) => {
                  const style = PLATFORM_STYLES[platform];
                  const Icon = style.icon;

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformClick(platform, href)}
                      className={cn(
                        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 font-inter text-sm font-semibold text-white transition-colors",
                        style.className,
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background font-inter text-sm font-semibold text-admin-heading transition-colors hover:bg-muted"
              >
                <Copy className="size-4" />
                Copy link
              </button>
            </>
          ) : (
            <p className="text-sm text-admin-label">
              This item cannot be shared until it is linked to a published article.
            </p>
          )}
        </div>

        {canShare ? (
          <div className="border-t border-border bg-muted/20 px-6 py-3">
            <p className="flex items-center gap-2 text-xs text-admin-trend-muted">
              <Link2 className="size-3.5 shrink-0" />
              OG preview URL used for Facebook &amp; LinkedIn crawlers
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
