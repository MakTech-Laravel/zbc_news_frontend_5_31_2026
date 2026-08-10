import { Download, FileText, Image as ImageIcon, Music, Video } from "lucide-react";

import type { ActivityFileValue } from "@/services/admin/activityLogShared";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

const FILE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  file: FileText,
} as const;

/** Thumbnail + filename chip; click always downloads (never opens a new tab). */
export function ActivityFileChip({ file }: { file: ActivityFileValue }) {
  const previewSrc = file.url ? resolveMediaUrl(file.url) : "";
  const downloadHref = resolveMediaUrl(file.downloadUrl ?? file.url);
  const Icon = FILE_ICONS[file.kind] ?? FileText;

  const body = (
    <>
      {file.kind === "image" && previewSrc ? (
        <img
          src={previewSrc}
          alt={file.name}
          loading="lazy"
          className="h-9 w-14 shrink-0 rounded-sm border border-border object-cover"
        />
      ) : (
        <Icon className="size-4 shrink-0" aria-hidden />
      )}
      <span className="truncate">{file.name}</span>
      {downloadHref ? <Download className="size-3.5 shrink-0 opacity-60" aria-hidden /> : null}
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-admin-heading";

  if (!downloadHref) {
    return <span className={className}>{body}</span>;
  }

  return (
    <a
      href={downloadHref}
      download={file.name}
      className={cn(className, "transition-colors hover:border-primary hover:text-primary")}
      title={`Download ${file.name}`}
    >
      {body}
    </a>
  );
}
