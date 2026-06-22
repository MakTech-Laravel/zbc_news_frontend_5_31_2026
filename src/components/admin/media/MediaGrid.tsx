import { Eye, FileIcon, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatAdminMediaSize,
  isImageMedia,
  isVideoMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

type MediaGridProps = {
  items: AdminMediaRow[]
  selectedIds?: Set<string>
  onToggleSelect?: (uuid: string) => void
  onPreview?: (item: AdminMediaRow) => void
  onPick?: (item: AdminMediaRow) => void
  onEdit?: (item: AdminMediaRow) => void
  onDelete?: (item: AdminMediaRow) => void
  canSelect?: boolean
  canPreview?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

function MediaPreview({ item }: { item: AdminMediaRow }) {
  if (isImageMedia(item) && item.url) {
    return (
      <img
        src={item.url}
        alt={item.name}
        className="size-full object-cover"
        loading="lazy"
      />
    )
  }

  if (isVideoMedia(item) && item.url) {
    return (
      <video
        src={item.url}
        className="size-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/50 p-4 text-muted-foreground">
      <FileIcon className="size-10 opacity-60" aria-hidden />
      <span className="text-center text-xs font-medium uppercase">
        {item.mimeType.split('/')[1] ?? 'file'}
      </span>
    </div>
  )
}

export function MediaGrid({
  items,
  selectedIds,
  onToggleSelect,
  onPreview,
  onPick,
  onEdit,
  onDelete,
  canSelect = false,
  canPreview = true,
  canEdit = true,
  canDelete = true,
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileIcon className="mb-3 size-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No media files found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const selected = selectedIds?.has(item.uuid) ?? false
        const showEdit = canEdit && onEdit && isImageMedia(item)

        return (
          <article
            key={item.uuid}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
              selected && 'ring-2 ring-zbc-blue ring-offset-2',
            )}
          >
            {canSelect && onToggleSelect ? (
              <label className="absolute left-2 top-2 z-10 flex size-5 cursor-pointer items-center justify-center rounded border border-white/80 bg-black/40 backdrop-blur-sm">
                <input
                  type="checkbox"
                  className="size-3.5 accent-zbc-blue"
                  checked={selected}
                  onChange={() => onToggleSelect(item.uuid)}
                  aria-label={`Select ${item.name}`}
                />
              </label>
            ) : null}

            <button
              type="button"
              className="relative aspect-square w-full overflow-hidden bg-muted/30"
              onClick={() => (onPick ? onPick(item) : onPreview?.(item))}
              disabled={onPick ? false : !canPreview || !onPreview}
              aria-label={onPick ? `Select ${item.name}` : `Preview ${item.name}`}
            >
              <MediaPreview item={item} />
              {onPick ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-foreground shadow">
                    Select
                  </span>
                </span>
              ) : canPreview && onPreview ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                  <Eye className="size-8 text-white drop-shadow" />
                </span>
              ) : null}
            </button>

            <div className="flex min-h-[4.5rem] flex-col justify-between gap-2 border-t p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground" title={item.name}>
                  {item.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatAdminMediaSize(item)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {canPreview && onPreview ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1 px-2 text-xs"
                    onClick={() => onPreview(item)}
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Button>
                ) : null}
                {showEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1 px-2 text-xs"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                ) : null}
                {canDelete && onDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
