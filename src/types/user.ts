/** Shared user-portal domain types (API-ready). */

export type {
  UserCategoryFilter,
  UserNotification,
  UserNotificationIcon,
  UserNotificationTab,
  MembershipPlan,
  MembershipPlanId,
} from "@/data/dummy/userPages";

export type { UserFeedArticle } from "@/data/dummy/userDashboard";

export type UserMembershipSummary = {
  planName: string;
  status: "active" | "cancelled" | "expired";
  nextBillingDate: string;
  priceLabel: string;
};

export type SavedArticlesQuery = {
  categoryId?: string;
  quickFilter?: string;
  search?: string;
};
