import * as React from 'react'
import toast from 'react-hot-toast'
import { Trash2, Upload } from 'lucide-react'

import { MediaDetailDialog } from '@/components/admin/media/MediaDetailDialog'
import { MediaGrid } from '@/components/admin/media/MediaGrid'
import { MediaTransformDialog } from '@/components/admin/media/MediaTransformDialog'
import { MediaUploadDialog } from '@/components/admin/media/MediaUploadDialog'
import { AdminFilterBar } from '@/components/admin/shared/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { AdminPagination } from '@/components/admin/shared/AdminPagination'
import { AdminPanel } from '@/components/admin/shared/AdminPanel'
import { Button } from '@/components/ui/button'
import { usePermission, PERMISSIONS } from '@/hooks/usePermission'
import {
  bulkDeleteAdminMedia,
  deleteAdminMedia,
  fetchAdminMedia,
  type AdminMediaRow,
} from '@/services/admin/media'

const PAGE_SIZE = 15

const MIME_FILTER_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'other', label: 'Other' },
]

export default function AdminMedia() {
  const { can } = usePermission()
  const canCreate = can(PERMISSIONS.MEDIA.CREATE)
  const canShow = can(PERMISSIONS.MEDIA.SHOW)
  const canDelete = can(PERMISSIONS.MEDIA.DELETE)
  const canBulkDelete = can(PERMISSIONS.MEDIA.BULK_DELETE)
  const canTransform = can(PERMISSIONS.MEDIA.TRANSFORM)

  const [items, setItems] = React.useState<AdminMediaRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [detailUuid, setDetailUuid] = React.useState<string | null>(null)
  const [transformItem, setTransformItem] = React.useState<AdminMediaRow | null>(null)
  const [bulkDeleting, setBulkDeleting] = React.useState(false)

  const loadMedia = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchAdminMedia({ page, per_page: PAGE_SIZE, search: search || undefined })
      setItems(result.items)
    } catch (error) {
      console.error('Failed to fetch media:', error)
      toast.error('Failed to load media')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  React.useEffect(() => {
    void loadMedia()
  }, [loadMedia])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (q) {
        const haystack = `${item.name} ${item.fileName} ${item.mimeType}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (typeFilter === 'image' && !item.mimeType.startsWith('image/')) return false
      if (typeFilter === 'video' && !item.mimeType.startsWith('video/')) return false
      if (
        typeFilter === 'other' &&
        (item.mimeType.startsWith('image/') || item.mimeType.startsWith('video/'))
      ) {
        return false
      }
      return true
    })
  }, [items, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const toggleSelect = (uuid: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) next.delete(uuid)
      else next.add(uuid)
      return next
    })
  }

  const openEdit = (item: AdminMediaRow) => {
    setTransformItem(item)
  }

  const handleDelete = async (item: AdminMediaRow) => {
    if (!canDelete) return
    if (!window.confirm(`Delete "${item.name}"?`)) return

    try {
      await deleteAdminMedia(item.uuid)
      toast.success('Media deleted')
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(item.uuid)
        return next
      })
      await loadMedia()
    } catch (error) {
      console.error('Failed to delete media:', error)
      toast.error('Failed to delete media')
    }
  }

  const handleBulkDelete = async () => {
    if (!canBulkDelete || selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected file(s)?`)) return

    setBulkDeleting(true)
    try {
      const result = await bulkDeleteAdminMedia(Array.from(selectedIds))
      if (result.deleted > 0) {
        toast.success(
          result.deleted === 1
            ? '1 file deleted'
            : `${result.deleted} files deleted`,
        )
      } else if (result.skipped_not_found.length > 0) {
        toast.error('No selected files could be deleted (not found or not owned by you)')
      } else if (result.skipped_failed.length > 0) {
        toast.error('Failed to delete selected files from storage')
      } else {
        toast.error('No files were deleted')
      }
      setSelectedIds(new Set())
      await loadMedia()
    } catch (error) {
      console.error('Bulk delete failed:', error)
      toast.error('Failed to delete selected media')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Media"
        description="Upload and manage files in your media library."
        actions={
          <>
            {canBulkDelete && selectedIds.size > 0 ? (
              <Button
                type="button"
                variant="outline"
                disabled={bulkDeleting}
                onClick={() => void handleBulkDelete()}
                className="h-10 w-full gap-2 sm:w-auto"
              >
                <Trash2 className="size-4" />
                Delete selected ({selectedIds.size})
              </Button>
            ) : null}
            {canCreate ? (
              <Button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
              >
                <Upload className="size-4" />
                Upload
              </Button>
            ) : null}
          </>
        }
      />

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          searchPlaceholder="Search by name or type..."
          statusValue={typeFilter}
          onStatusChange={(v) => {
            setTypeFilter(v)
            setPage(1)
          }}
          statusOptions={MIME_FILTER_OPTIONS}
          showCategoryFilter={false}
        />
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <MediaGrid
            items={paged}
            selectedIds={canBulkDelete ? selectedIds : undefined}
            onToggleSelect={canBulkDelete ? toggleSelect : undefined}
            onPreview={canShow ? (item) => setDetailUuid(item.uuid) : undefined}
            onEdit={canTransform ? openEdit : undefined}
            onDelete={canDelete ? handleDelete : undefined}
            canSelect={canBulkDelete}
            canPreview={canShow}
            canEdit={canTransform}
            canDelete={canDelete}
          />
        )}
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {canCreate ? (
        <MediaUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploaded={() => void loadMedia()}
        />
      ) : null}

      {canShow ? (
        <MediaDetailDialog
          uuid={detailUuid}
          open={Boolean(detailUuid)}
          onOpenChange={(open) => {
            if (!open) setDetailUuid(null)
          }}
          onDeleted={() => void loadMedia()}
          onEdit={canTransform ? openEdit : undefined}
          canDelete={canDelete}
          canEdit={canTransform}
        />
      ) : null}

      {canTransform ? (
        <MediaTransformDialog
          item={transformItem}
          open={Boolean(transformItem)}
          onOpenChange={(open) => {
            if (!open) setTransformItem(null)
          }}
          onTransformed={() => void loadMedia()}
        />
      ) : null}
    </div>
  )
}
