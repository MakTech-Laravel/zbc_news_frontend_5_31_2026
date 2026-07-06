import * as React from "react";
import { ArrowLeft, Archive, Mail, RotateCcw, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import {
  archiveContactMessage,
  deleteContactMessage,
  fetchAdminContactMessage,
  markContactMessageRead,
  markContactMessageReplied,
  markContactMessageUnread,
  replyToContactMessage,
  restoreContactMessage,
  type ContactInquiry,
} from "@/services/admin/contactMessages";
import { PERMISSIONS } from "@/types/permissions";

function statusVariant(status: ContactInquiry["status"]) {
  switch (status) {
    case "new":
      return "pending_review" as const;
    case "read":
      return "draft" as const;
    case "replied":
      return "published" as const;
    case "archived":
      return "archived" as const;
    default:
      return "pending_review" as const;
  }
}

export default function AdminContactMessageDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();
  const [message, setMessage] = React.useState<ContactInquiry | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [replySubject, setReplySubject] = React.useState("");
  const [replyBody, setReplyBody] = React.useState("");
  const [replying, setReplying] = React.useState(false);

  const canUpdate = can(PERMISSIONS.CONTACT_INQUIRIES.UPDATE);
  const canReply = can(PERMISSIONS.CONTACT_INQUIRIES.REPLY);
  const canDelete = can(PERMISSIONS.CONTACT_INQUIRIES.DELETE);

  const loadMessage = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchAdminContactMessage(id);
      setMessage(data);
      setReplySubject((current) =>
        current || (data.subject ? `Re: ${data.subject}` : "Re: Your message to ZBC News"),
      );
    } catch {
      toast.error("Failed to load contact message.");
      setMessage(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void loadMessage();
  }, [loadMessage]);

  async function runAction(
    action: () => Promise<void>,
    successMessage: string,
    errorMessage: string,
  ) {
    try {
      await action();
      toast.success(successMessage);
      await loadMessage();
    } catch {
      toast.error(errorMessage);
    }
  }

  async function handleReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !replySubject.trim() || !replyBody.trim()) return;

    setReplying(true);
    try {
      await replyToContactMessage(id, {
        subject: replySubject.trim(),
        body: replyBody.trim(),
      });
      toast.success("Reply sent successfully.");
      setReplyBody("");
      await loadMessage();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Unable to send reply."));
    } finally {
      setReplying(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm("Delete this contact message permanently?")) return;
    try {
      await deleteContactMessage(id);
      toast.success("Contact message deleted.");
      navigate("/admin/contact-messages");
    } catch {
      toast.error("Unable to delete contact message.");
    }
  }

  if (loading) {
    return <p className="text-sm text-admin-label">Loading contact message…</p>;
  }

  if (!message) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-admin-label">Contact message not found.</p>
        <Button type="button" variant="outline" asChild>
          <Link to="/admin/contact-messages">
            <ArrowLeft className="mr-2 size-4" />
            Back to messages
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/admin/contact-messages">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {canUpdate && message.status !== "archived" ? (
            <>
              {message.status !== "read" && message.status !== "replied" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void runAction(
                      () => markContactMessageRead(message.id),
                      "Marked as read.",
                      "Unable to mark as read.",
                    )
                  }
                >
                  Mark Read
                </Button>
              ) : null}
              {message.status !== "new" && message.status !== "replied" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void runAction(
                      () => markContactMessageUnread(message.id),
                      "Marked as unread.",
                      "Unable to mark as unread.",
                    )
                  }
                >
                  Mark Unread
                </Button>
              ) : null}
              {message.status !== "replied" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void runAction(
                      () => markContactMessageReplied(message.id),
                      "Marked as replied.",
                      "Unable to mark as replied.",
                    )
                  }
                >
                  Mark Replied
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() =>
                  void runAction(
                    () => archiveContactMessage(message.id),
                    "Message archived.",
                    "Unable to archive message.",
                  )
                }
              >
                <Archive className="size-4" />
                Archive
              </Button>
            </>
          ) : null}
          {canUpdate && message.status === "archived" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                void runAction(
                  () => restoreContactMessage(message.id),
                  "Message restored.",
                  "Unable to restore message.",
                )
              }
            >
              <RotateCcw className="size-4" />
              Restore
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-admin-notification hover:bg-admin-notification/10"
              onClick={() => void handleDelete()}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <AdminPageHeader
        title={message.subject || "Contact Message"}
        description={`From ${message.name} • ${message.email}`}
      />

      <AdminPanel>
        <div className="space-y-6 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge variant={statusVariant(message.status)}>
              {message.statusLabel}
            </AdminStatusBadge>
            <span className="text-xs text-admin-label">Submitted {message.submittedAtLabel}</span>
            {message.updatedAtLabel ? (
              <span className="text-xs text-admin-label">Updated {message.updatedAtLabel}</span>
            ) : null}
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">Name</dt>
              <dd className="mt-1 text-sm text-admin-heading">{message.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">Email</dt>
              <dd className="mt-1 text-sm text-admin-heading">{message.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">Phone</dt>
              <dd className="mt-1 text-sm text-admin-heading">{message.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">Subject</dt>
              <dd className="mt-1 text-sm text-admin-heading">{message.subject || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">IP Address</dt>
              <dd className="mt-1 text-sm text-admin-heading">{message.ipAddress || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-admin-label">User Agent</dt>
              <dd className="mt-1 break-all text-sm text-admin-heading">{message.userAgent || "—"}</dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-admin-heading">Message</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-admin-label">
              {message.message}
            </p>
          </div>
        </div>
      </AdminPanel>

      {message.replies && message.replies.length > 0 ? (
        <AdminPanel>
          <div className="space-y-4 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-semibold text-admin-heading">Reply History</h3>
            {message.replies.map((reply) => (
              <article key={reply.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-admin-heading">{reply.subject}</p>
                  <span className="text-xs text-admin-label">{reply.sentAtLabel}</span>
                </div>
                {reply.adminName ? (
                  <p className="mt-1 text-xs text-admin-label">Sent by {reply.adminName}</p>
                ) : null}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-admin-label">
                  {reply.body}
                </p>
              </article>
            ))}
          </div>
        </AdminPanel>
      ) : null}

      {canReply ? (
        <AdminPanel>
          <form className="space-y-4 px-4 py-5 sm:px-6" onSubmit={handleReply}>
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <h3 className="text-lg font-semibold text-admin-heading">Send Reply</h3>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-admin-heading">Subject</label>
              <Input
                value={replySubject}
                onChange={(event) => setReplySubject(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-admin-heading">Message</label>
              <textarea
                className="min-h-[160px] w-full rounded-lg border border-admin-input-border bg-white px-3 py-2 text-sm leading-6 text-admin-heading focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Write your reply to the visitor…"
                required
              />
            </div>
            <Button type="submit" disabled={replying}>
              {replying ? "Sending…" : "Send Reply"}
            </Button>
          </form>
        </AdminPanel>
      ) : null}
    </div>
  );
}
