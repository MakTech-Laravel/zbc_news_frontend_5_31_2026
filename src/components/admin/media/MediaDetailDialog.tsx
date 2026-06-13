import * as React from 'react'
import toast from 'react-hot-toast'
import { Copy, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  deleteAdminMedia,
  fetchAdminMediaItem,
  formatAdminMediaSize,
  isImageMedia,
  isVideoMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

type MediaDetailDialogProps = {
  uuid: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
  onEdit?: (item: AdminMediaRow) => void
  canDelete?: boolean
  canEdit?: boolean
}

export function MediaDetailDialog({
  uuid,
  open,
  onOpenChange,
  onDeleted,
  onEdit,
  canDelete = true,
  canEdit = false,
}: MediaDetailDialogProps) {
  const [item, setItem] = React.useState<AdminMediaRow | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

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
        if (!cancelled) setItem(data)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item?.name ?? 'Media details'}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : item ? (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
              {isImageMedia(item) && item.url ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-h-64 max-w-full rounded object-contain"
                />
              ) : isVideoMedia(item) && item.url ? (
                <video
                  src={item.url}
                  controls
                  className="max-h-64 max-w-full rounded"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{item.mimeType || 'File'}</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">File name</dt>
              <dd className="truncate">{item.fileName}</dd>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{item.mimeType || '—'}</dd>
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
                <Input readOnly value={item.url} className="text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={() => void copyUrl()}>
                  <Copy className="size-4" />
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
