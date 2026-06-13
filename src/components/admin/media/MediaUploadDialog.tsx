import * as React from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { uploadAdminMedia } from '@/services/admin/media'

type MediaUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: () => void
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: MediaUploadDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadAdminMedia(file)
      }
      toast.success(
        files.length === 1 ? 'File uploaded' : `${files.length} files uploaded`,
      )
      onUploaded()
      onOpenChange(false)
    } catch (error) {
      console.error('Media upload failed:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Images, videos, and documents supported by your server configuration.
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button
            type="button"
            className="w-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Choose files'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
