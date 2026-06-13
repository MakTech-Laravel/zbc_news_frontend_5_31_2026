import * as React from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select'
import {
  transformAdminMedia,
  type AdminMediaRow,
  type MediaTransformPayload,
} from '@/services/admin/media'

type MediaTransformDialogProps = {
  item: AdminMediaRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransformed: () => void
}

export function MediaTransformDialog({
  item,
  open,
  onOpenChange,
  onTransformed,
}: MediaTransformDialogProps) {
  const [width, setWidth] = React.useState('')
  const [height, setHeight] = React.useState('')
  const [quality, setQuality] = React.useState('85')
  const [fit, setFit] = React.useState<MediaTransformPayload['fit']>('contain')
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setWidth('')
    setHeight('')
    setQuality('85')
    setFit('contain')
  }, [open, item?.uuid])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!item) return

    const payload: MediaTransformPayload = { fit }
    if (width.trim()) payload.width = Number(width)
    if (height.trim()) payload.height = Number(height)
    if (quality.trim()) payload.quality = Number(quality)

    setSubmitting(true)
    try {
      await transformAdminMedia(item.uuid, payload)
      toast.success('Media transformed')
      onTransformed()
      onOpenChange(false)
    } catch (error) {
      console.error('Transform failed:', error)
      toast.error('Failed to transform media')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit image</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <p className="text-sm text-muted-foreground">
            {item ? `Resize or optimize "${item.name}".` : ''}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Width (px)</label>
              <Input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Height (px)</label>
              <Input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Auto"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Quality (%)</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fit</label>
            <Select value={fit} onValueChange={(v) => setFit(v as MediaTransformPayload['fit'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
                <SelectItem value="inside">Inside</SelectItem>
                <SelectItem value="outside">Outside</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !item}>
            {submitting ? 'Transforming…' : 'Apply transform'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
