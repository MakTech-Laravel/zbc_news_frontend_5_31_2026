import * as React from "react";

import { ArticleRichTextToolbar } from "@/components/admin/articles/editor/ArticleRichTextToolbar";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";

type ArticleRichTextEditorProps = {
  title: string;
  onTitleChange: (value: string) => void;
  titleError?: string;
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
  className?: string;
};

export function ArticleRichTextEditor({
  title,
  onTitleChange,
  titleError,
  content,
  onContentChange,
  contentError,
  className,
}: ArticleRichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === content) return;
    el.innerHTML = content;
  }, [content]);

  return (
    <AdminPanel padding="none" className={cn("overflow-hidden shadow-sm", className)}>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add title…"
          className="w-full border-0 bg-transparent px-4 pb-2 pt-5 text-2xl font-bold text-admin-heading placeholder:text-admin-trend-muted focus:outline-none sm:px-6 sm:pt-6 sm:text-3xl"
        />
        <InputError message={titleError} className="px-4 sm:px-6" />
      </div>

      <ArticleRichTextToolbar editorRef={editorRef} />

      <div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          data-placeholder="Write your story…"
          onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
          className="article-editor-body min-h-[280px] px-4 py-4 text-base leading-relaxed text-admin-heading outline-none empty:before:pointer-events-none empty:before:text-admin-trend-muted empty:before:content-[attr(data-placeholder)] sm:min-h-[360px] sm:px-6 sm:py-6"
        />
        <InputError message={contentError} className="px-4 pb-4 sm:px-6" />
      </div>
    </AdminPanel>
  );
}
