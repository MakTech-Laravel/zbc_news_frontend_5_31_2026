import * as React from "react";

import { ArticleRichTextEditorBody } from "@/components/admin/articles/editor/ArticleRichTextEditorBody";
import { ArticleRichTextToolbar } from "@/components/admin/articles/editor/ArticleRichTextToolbar";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";

type ArticleRichTextEditorProps = {
  title?: string;
  onTitleChange?: (value: string) => void;
  titleError?: string;
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
  /** When true, omit the title input (for timeline entry bodies). */
  hideTitle?: boolean;
  className?: string;
};

export function ArticleRichTextEditor({
  title = "",
  onTitleChange,
  titleError,
  content,
  onContentChange,
  contentError,
  hideTitle = false,
  className,
}: ArticleRichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  return (
    <AdminPanel padding="none" className={cn("overflow-hidden shadow-sm", className)}>
      {!hideTitle ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Add title…"
            className="w-full border-0 bg-transparent px-4 pb-2 pt-5 text-2xl font-bold text-admin-heading placeholder:text-admin-trend-muted focus:outline-none sm:px-6 sm:pt-6 sm:text-3xl"
          />
          <InputError message={titleError} className="px-4 sm:px-6" />
        </div>
      ) : null}

      <ArticleRichTextToolbar editorRef={editorRef} />

      <div>
        <ArticleRichTextEditorBody
          editorRef={editorRef}
          content={content}
          onContentChange={onContentChange}
        />
        <InputError message={contentError} className="px-4 pb-4 sm:px-6" />
      </div>
    </AdminPanel>
  );
}
