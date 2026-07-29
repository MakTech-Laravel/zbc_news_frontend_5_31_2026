import * as React from 'react'
import { ImagePlus, Loader2, Search, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

import { MediaGrid } from '@/components/admin/media/MediaGrid'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AdminPagination } from '@/components/admin/shared/AdminPagination'
import {
  fetchAdminMedia,
  isAudioMedia,
  isImageMedia,
  isVideoMedia,
  uploadAdminMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

const PAGE_SIZE = 15

export type MediaPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: AdminMediaRow) => void
  /** When set, only items matching this type are shown. */
  filter?: 'image' | 'video' | 'audio' | 'all'
  title?: string
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  filter = 'image',
  title = 'Select media',
}: MediaPickerDialogProps) {
  const [items, setItems] = React.useState<AdminMediaRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [lastPage, setLastPage] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [uploading, setUploading] = React.useState(false)
  const uploadInputRef = React.useRef<HTMLInputElement>(null)

  const loadMedia = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAdminMedia({
        page,
        per_page: PAGE_SIZE,
        search: search.trim() || undefined,
        media_type: filter === 'all' ? undefined : filter,
      })
      setItems(result.items)
      setLastPage(result.lastPage)
      setTotalItems(result.total)
    } catch {
      setItems([])
      setLastPage(1)
    } finally {
      setLoading(false)
    }
  }, [page, search, filter])

  React.useEffect(() => {
    if (!open) return
    void loadMedia()
  }, [open, loadMedia])

  React.useEffect(() => {
    if (!open) {
      setSearch('')
      setPage(1)
    }
  }, [open])

  const visibleItems = React.useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'image') return items.filter((item) => isImageMedia(item))
    if (filter === 'video') return items.filter((item) => isVideoMedia(item))
    if (filter === 'audio') return items.filter((item) => isAudioMedia(item))
    return items
  }, [filter, items])

  const handlePick = (item: AdminMediaRow) => {
    onSelect(item)
    onOpenChange(false)
  }

  const uploadAccept = React.useMemo(() => {
    if (filter === 'image') return 'image/*'
    if (filter === 'video') return 'video/*'
    if (filter === 'audio') return 'audio/*'
    return 'image/*,video/*,audio/*'
  }, [filter])

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadAdminMedia(file)
      }
      toast.success(files.length === 1 ? 'File uploaded' : `${files.length} files uploaded`)
      setPage(1)
      await loadMedia()
    } catch (error) {
      console.error('Media upload failed:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (uploadInputRef.current) uploadInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,820px)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
          <input
            ref={uploadInputRef}
            type="file"
            multiple
            accept={uploadAccept}
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search media library…"
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadMedia()}>
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => uploadInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading media…
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <ImagePlus className="size-10 text-muted-foreground/40" aria-hidden />
              <p className="text-sm text-muted-foreground">
                No media found. Upload files from Admin → Media first.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2 gap-1.5"
                disabled={uploading}
                onClick={() => uploadInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                {uploading ? 'Uploading…' : 'Upload media'}
              </Button>
            </div>
          ) : (
            <MediaGrid
              items={visibleItems}
              onPick={handlePick}
              canPreview={false}
              canEdit={false}
              canDelete={false}
            />
          )}
        </div>

        {lastPage > 1 ? (
          <div className="shrink-0 border-t px-4 py-3">
            <AdminPagination
              page={page}
              totalPages={lastPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
