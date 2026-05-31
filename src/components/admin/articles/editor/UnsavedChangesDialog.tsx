import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UnsavedChangesDialogProps = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

export function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onStay()}>
      <DialogContent className="max-w-md border-admin-input-border bg-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-admin-heading">Unsaved changes</DialogTitle>
          <DialogDescription className="text-admin-label">
            You have unsaved changes to this article. Leave without saving, or stay
            on the page to keep editing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onStay}>
            Keep editing
          </Button>
          <Button type="button" variant="destructive" onClick={onLeave}>
            Leave without saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
