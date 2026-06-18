export type ArticleComment = {
  id: string;
  body: string;
  authorName: string;
  authorAvatar?: string | null;
  isOwn?: boolean;
  status?: "pending" | "approved" | "rejected";
  time: string;
  createdAtIso?: string;
  parentId?: string | null;
  articleId?: string;
  articleTitle?: string;
  articleSlug?: string;
  replies: ArticleComment[];
};

export type ArticleCommentsPayload = {
  comments: ArticleComment[];
  count: number;
};

export type CreateCommentInput = {
  body: string;
  parentId?: string;
  guestName?: string;
  guestEmail?: string;
};
