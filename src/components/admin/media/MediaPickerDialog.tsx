import * as React from 'react'
import { ImagePlus, Loader2, Search } from 'lucide-react'

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
  isImageMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

const PAGE_SIZE = 15

export type MediaPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: AdminMediaRow) => void
  /** When set, only items matching this type are shown. */
  filter?: 'image' | 'all'
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

  const loadMedia = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAdminMedia({
        page,
        per_page: PAGE_SIZE,
        search: search.trim() || undefined,
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
  }, [page, search])

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
    return items.filter((item) => isImageMedia(item))
  }, [filter, items])

  const handlePick = (item: AdminMediaRow) => {
    onSelect(item)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,820px)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
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
