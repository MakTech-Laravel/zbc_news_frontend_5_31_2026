import * as React from "react";
import { FolderOpen, MonitorPlay, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type VideoSource = "library" | "youtube" | "facebook";

type VideoSourcePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (source: VideoSource) => void;
  mode?: "insert" | "replace";
};

const OPTIONS: Array<{
  source: VideoSource;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    source: "library",
    label: "Media Library",
    description: "Choose an uploaded video from the ZBC News library.",
    icon: <FolderOpen className="size-5" aria-hidden />,
  },
  {
    source: "youtube",
    label: "YouTube",
    description: "Paste a YouTube watch, Shorts, or youtu.be link.",
    icon: <MonitorPlay className="size-5" aria-hidden />,
  },
  {
    source: "facebook",
    label: "Facebook",
    description: "Paste a Facebook watch, share/v, reel, or fb.watch link.",
    icon: <Video className="size-5" aria-hidden />,
  },
];

export function VideoSourcePickerDialog({
  open,
  onOpenChange,
  onSelect,
  mode = "insert",
}: VideoSourcePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-admin-input-border px-5 py-4">
          <DialogTitle className="text-base font-semibold text-admin-heading">
            {mode === "replace" ? "Replace video" : "Insert video"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 px-5 py-4">
          <p className="text-sm text-admin-trend-muted">
            {mode === "replace"
              ? "Choose a new video source to replace the selected embed."
              : "Choose where the video should come from."}
          </p>

          {OPTIONS.map((option) => (
            <Button
              key={option.source}
              type="button"
              variant="outline"
              className="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
              onClick={() => {
                onSelect(option.source);
                onOpenChange(false);
              }}
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-admin-heading">
                {option.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-admin-heading">
                  {option.label}
                </span>
                <span className="block text-xs font-normal text-admin-trend-muted">
                  {option.description}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
