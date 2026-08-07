import * as React from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Copy, Pencil, Trash2 } from 'lucide-react'

import { AdminFormField } from '@/components/admin/forms/AdminFormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  deleteAdminMedia,
  fetchAdminMediaItem,
  formatAdminMediaSize,
  isImageMedia,
  isVideoMedia,
  updateAdminMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

type MediaDetailDialogProps = {
  uuid: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
  onUpdated?: () => void
  onEdit?: (item: AdminMediaRow) => void
  canDelete?: boolean
  canEdit?: boolean
  canUpdate?: boolean
}

export function MediaDetailDialog({
  uuid,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
  onEdit,
  canDelete = true,
  canEdit = false,
  canUpdate = true,
}: MediaDetailDialogProps) {
  const [item, setItem] = React.useState<AdminMediaRow | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [altText, setAltText] = React.useState('')
  const [caption, setCaption] = React.useState('')
  const [credit, setCredit] = React.useState('')
  const [copyright, setCopyright] = React.useState('')

  React.useEffect(() => {
    if (!open || !uuid) {
      setItem(null)
      return
    }

    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchAdminMediaItem(uuid)
        if (!cancelled) {
          setItem(data)
          setAltText(data?.altText ?? '')
          setCaption(data?.caption ?? '')
          setCredit(data?.credit ?? '')
          setCopyright(data?.copyright ?? '')
        }
      } catch (error) {
        console.error('Failed to load media:', error)
        if (!cancelled) {
          toast.error('Failed to load media details')
          onOpenChange(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, uuid, onOpenChange])

  async function copyUrl() {
    if (!item?.url) return
    try {
      await navigator.clipboard.writeText(item.url)
      toast.success('URL copied')
    } catch {
      toast.error('Could not copy URL')
    }
  }

  async function handleSave() {
    if (!item || !canUpdate) return

    setSaving(true)
    try {
      const updated = await updateAdminMedia(item.uuid, {
        altText: altText.trim() || null,
        caption: caption.trim() || null,
        credit: credit.trim() || null,
        copyright: copyright.trim() || null,
      })
      if (updated) {
        setItem(updated)
        setAltText(updated.altText ?? '')
        setCaption(updated.caption ?? '')
        setCredit(updated.credit ?? '')
        setCopyright(updated.copyright ?? '')
      }
      toast.success('Media details saved')
      onUpdated?.()
    } catch (error) {
      console.error('Failed to update media:', error)
      toast.error('Failed to save media details')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item || !canDelete) return
    if (!window.confirm(`Delete "${item.name}"?`)) return

    setDeleting(true)
    try {
      await deleteAdminMedia(item.uuid)
      toast.success('Media deleted')
      onDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete media:', error)
      toast.error('Failed to delete media')
    } finally {
      setDeleting(false)
    }
  }

  const missingAlt = Boolean(item && isImageMedia(item) && !altText.trim())
  const showFooterActions = Boolean(
    item && ((canEdit && onEdit && isImageMedia(item)) || canDelete),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0',
          'max-h-[min(92vh,900px)] sm:rounded-xl',
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-left">
            <span className="truncate">{item?.name ?? 'Media details'}</span>
            {missingAlt ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                <AlertTriangle className="size-3.5" aria-hidden />
                Missing alt text
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : item ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
                <div className="space-y-4">
                  <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-muted/30 p-4">
                    {isImageMedia(item) && item.url ? (
                      <img
                        src={item.url}
                        alt={altText || item.name}
                        className="max-h-56 max-w-full rounded-lg object-contain sm:max-h-72"
                      />
                    ) : isVideoMedia(item) && item.url ? (
                      <video
                        src={item.url}
                        controls
                        className="max-h-56 max-w-full rounded-lg sm:max-h-72"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {item.mimeType || 'File'}
                      </p>
                    )}
                  </div>

                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">File name</dt>
                    <dd className="min-w-0 truncate font-medium">{item.fileName}</dd>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="min-w-0 break-all">{item.mimeType || '—'}</dd>
                    <dt className="text-muted-foreground">Size</dt>
                    <dd>{formatAdminMediaSize(item)}</dd>
                    <dt className="text-muted-foreground">Uploaded</dt>
                    <dd>{item.createdAt}</dd>
                    {item.collectionName ? (
                      <>
                        <dt className="text-muted-foreground">Collection</dt>
                        <dd>{item.collectionName}</dd>
                      </>
                    ) : null}
                  </dl>

                  {item.url ? (
                    <div className="flex gap-2">
                      <Input readOnly value={item.url} className="min-w-0 text-xs" />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => void copyUrl()}
                        aria-label="Copy URL"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {canUpdate ? (
                  <div className="space-y-3 rounded-xl border border-admin-input-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-admin-heading">
                      Image details
                    </p>
                    <AdminFormField label="Alt text" htmlFor="media-alt-text">
                      <Input
                        id="media-alt-text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe the image for accessibility"
                      />
                    </AdminFormField>
                    <AdminFormField label="Caption" htmlFor="media-caption">
                      <Input
                        id="media-caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Optional caption"
                      />
                    </AdminFormField>
                    <AdminFormField
                      label="Photographer / source credit"
                      htmlFor="media-credit"
                    >
                      <Input
                        id="media-credit"
                        value={credit}
                        onChange={(e) => setCredit(e.target.value)}
                        placeholder="e.g. Photo by Jane Doe / Reuters"
                      />
                    </AdminFormField>
                    <AdminFormField label="Copyright" htmlFor="media-copyright">
                      <Input
                        id="media-copyright"
                        value={copyright}
                        onChange={(e) => setCopyright(e.target.value)}
                        placeholder="e.g. © 2026 ZBC News"
                      />
                    </AdminFormField>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={saving}
                      onClick={() => void handleSave()}
                    >
                      {saving ? 'Saving…' : 'Save details'}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            {showFooterActions ? (
              <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-background px-5 py-3 sm:flex-row sm:px-6">
                {canEdit && onEdit && isImageMedia(item) ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      onEdit(item)
                      onOpenChange(false)
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit image
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1 gap-2"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 className="size-4" />
                    {deleting ? 'Deleting…' : 'Delete file'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
