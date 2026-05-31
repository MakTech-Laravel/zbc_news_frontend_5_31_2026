import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { cn } from "@/lib/utils";

type PaymentCardProps = {
  title: string;
  status: "connected" | "disconnected";
  detail: string;
  actionLabel: string;
  onAction?: () => void;
};

function PaymentCard({
  title,
  status,
  detail,
  actionLabel,
  onAction,
}: PaymentCardProps) {
  const connected = status === "connected";

  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] border border-border p-[17px]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-medium text-admin-heading">{title}</p>
        <span
          className={cn(
            "rounded px-2 py-1 text-xs leading-4",
            connected
              ? "bg-admin-badge-published-bg text-admin-badge-published-text"
              : "bg-admin-rank-bg text-[#364153]",
          )}
        >
          {connected ? "Connected" : "Not Connected"}
        </span>
      </div>
      <p className="text-sm text-admin-label">{detail}</p>
      <button
        type="button"
        onClick={onAction}
        className="w-fit text-sm font-medium text-zbc-blue hover:text-zbc-blue/90"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function PaymentSettingsSection() {
  return (
    <AdminPanel>
      <h2 className="px-2 text-lg font-semibold text-admin-heading">Payment Settings</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <PaymentCard
          title="PayPal"
          status="connected"
          detail="payments@zbcnews.com"
          actionLabel="Update Account"
        />
        <PaymentCard
          title="Bank Transfer"
          status="disconnected"
          detail="Add bank account details"
          actionLabel="Connect Account"
        />
      </div>
    </AdminPanel>
  );
}
