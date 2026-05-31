import {
  Bold,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  Quote,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ArticleRichTextToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

type ToolbarAction = {
  label: string;
  icon: React.ReactNode;
  command: string;
  value?: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Bold", icon: <Bold className="size-4" />, command: "bold" },
  { label: "Italic", icon: <Italic className="size-4" />, command: "italic" },
  { label: "Heading 2", icon: <Heading2 className="size-4" />, command: "formatBlock", value: "h2" },
  { label: "Bullet list", icon: <List className="size-4" />, command: "insertUnorderedList" },
  { label: "Quote", icon: <Quote className="size-4" />, command: "formatBlock", value: "blockquote" },
  { label: "Link", icon: <Link2 className="size-4" />, command: "createLink" },
  { label: "Image", icon: <Image className="size-4" />, command: "insertImage" },
];

export function ArticleRichTextToolbar({ editorRef, className }: ArticleRichTextToolbarProps) {
  const runCommand = (action: ToolbarAction) => {
    editorRef.current?.focus();
    if (action.command === "createLink") {
      const url = window.prompt("Enter URL");
      if (url) document.execCommand(action.command, false, url);
      return;
    }
    if (action.command === "insertImage") {
      const url = window.prompt("Enter image URL");
      if (url) document.execCommand(action.command, false, url);
      return;
    }
    document.execCommand(action.command, false, action.value);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 border-b border-admin-input-border px-3 py-2 sm:px-4",
        className,
      )}
      role="toolbar"
      aria-label="Formatting"
    >
      {TOOLBAR_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand(action)}
          className="inline-flex size-8 items-center justify-center rounded-md text-admin-heading transition-colors hover:bg-muted"
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
