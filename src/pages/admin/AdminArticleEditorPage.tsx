import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ArticleEditorPane } from "@/components/admin/articles/editor/ArticleEditorPane";
import { ArticleEditorTopBar } from "@/components/admin/articles/editor/ArticleEditorTopBar";
import { ArticlePreviewDialog } from "@/components/admin/articles/editor/ArticlePreviewDialog";
import { buildArticlePreviewData } from "@/components/admin/articles/editor/articlePreviewUtils";
import { ArticleSettingsPanel } from "@/components/admin/articles/editor/ArticleSettingsPanel";
import { UnsavedChangesDialog } from "@/components/admin/articles/editor/UnsavedChangesDialog";
import { useArticleWorkflow } from "@/components/admin/articles/editor/useArticleWorkflow";
import {
  getAdminArticleById,
  getDefaultEditorFormForArticle,
  loadArticleDraft,
} from "@/data/admin/articleDummyStore";
import type { ArticleStatus } from "@/data/admin/mockArticles";

type AdminArticleEditorPageProps = {
  mode: "create" | "edit";
};

export default function AdminArticleEditorPage({ mode }: AdminArticleEditorPageProps) {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const isEdit = mode === "edit";

  const article = isEdit && articleId ? getAdminArticleById(articleId) : undefined;
  const storedDraft = isEdit && articleId ? loadArticleDraft(articleId) : null;

  const initialValues =
    storedDraft?.form ??
    (article ? getDefaultEditorFormForArticle(article) : undefined);
  const initialStatus: ArticleStatus =
    storedDraft?.status ?? article?.status ?? "draft";

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const workflow = useArticleWorkflow({
    articleId: isEdit ? articleId : undefined,
    initialValues,
    initialStatus,
  });

  const previewData = React.useMemo(
    () => buildArticlePreviewData(workflow.form, workflow.status),
    [workflow.form, workflow.status],
  );

  if (isEdit && !articleId) {
    return <Navigate to="/admin/articles" replace />;
  }

  if (isEdit && articleId && !article) {
    return <Navigate to="/admin/articles" replace />;
  }

  const navigateBack = () => navigate("/admin/articles");

  return (
    <div className="mx-4 -mb-4 flex min-h-full flex-col sm:mx-0 sm:-mb-6">
      <ArticleEditorTopBar
        wordCount={workflow.wordCount}
        charCount={workflow.charCount}
        status={workflow.status}
        lastSavedLabel={workflow.lastSavedLabel}
        isDirty={workflow.isDirty}
        isAutoSaving={workflow.isAutoSaving}
        onBack={() => workflow.requestLeave(navigateBack)}
        onPreview={() => setIsPreviewOpen(true)}
        onSaveDraft={workflow.saveDraft}
        onSubmitForReview={workflow.submitForReview}
        onPublish={workflow.publish}
      />

      <div className="flex-1 py-5 sm:px-0 sm:py-6">
        <div className="container mx-auto flex w-full flex-col gap-6 lg:flex-row lg:items-start">
          <ArticleEditorPane
            className="min-w-0 flex-1"
            title={workflow.form.title}
            onTitleChange={workflow.setTitle}
            content={workflow.form.content}
            onContentChange={(v) => workflow.setField("content", v)}
          />
          <ArticleSettingsPanel
            editor={workflow}
            status={workflow.status}
            onStatusChange={workflow.setStatus}
            onArchive={workflow.archive}
            className="w-full shrink-0 lg:w-[320px] xl:w-[340px]"
          />
        </div>
      </div>

      <UnsavedChangesDialog
        open={workflow.showLeaveDialog}
        onStay={workflow.cancelLeave}
        onLeave={workflow.confirmLeave}
      />

      <ArticlePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        preview={previewData}
      />
    </div>
  );
}
