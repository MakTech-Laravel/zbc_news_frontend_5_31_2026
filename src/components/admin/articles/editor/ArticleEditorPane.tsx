import * as React from "react";

import { ArticleRichTextEditorBody } from "@/components/admin/articles/editor/ArticleRichTextEditorBody";
import { ArticleRichTextToolbar } from "@/components/admin/articles/editor/ArticleRichTextToolbar";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { cn } from "@/lib/utils";

type ArticleEditorPaneProps = {
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  className?: string;
};

export function ArticleEditorPane({
  title,
  onTitleChange,
  content,
  onContentChange,
  className,
}: ArticleEditorPaneProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  return (
    <AdminPanel padding="none" className={cn("overflow-hidden shadow-sm", className)}>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Add title…"
        className="w-full border-0 bg-transparent px-4 pb-2 pt-5 text-2xl font-bold text-admin-heading placeholder:text-admin-trend-muted focus:outline-none sm:px-6 sm:pt-6 sm:text-3xl"
      />

      <ArticleRichTextToolbar editorRef={editorRef} />

      <ArticleRichTextEditorBody
        editorRef={editorRef}
        content={content}
        onContentChange={onContentChange}
      />
    </AdminPanel>
  );
}
