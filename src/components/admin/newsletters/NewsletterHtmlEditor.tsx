import * as React from "react";
import { ArticleRichTextToolbar } from "@/components/admin/articles/editor/ArticleRichTextToolbar";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { cn } from "@/lib/utils";

type NewsletterHtmlEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function NewsletterHtmlEditor({ value, onChange, className }: NewsletterHtmlEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value;
  }, [value]);

  return (
    <AdminPanel padding="none" className={cn("overflow-hidden shadow-sm", className)}>
      <ArticleRichTextToolbar editorRef={editorRef} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        data-placeholder="Compose your newsletter content…"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="article-editor-body min-h-[240px] px-4 py-4 text-base leading-relaxed text-admin-heading outline-none empty:before:pointer-events-none empty:before:text-admin-trend-muted empty:before:content-[attr(data-placeholder)] sm:min-h-[320px] sm:px-6"
      />
    </AdminPanel>
  );
}
