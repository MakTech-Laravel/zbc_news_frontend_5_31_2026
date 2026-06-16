import * as React from "react";
import { Loader2 } from "lucide-react";

import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import {
  formatCompactCount,
  formatCurrencyCents,
  updateAdminAdSlot,
  type MonetizationOverview,
} from "@/services/admin/monetization";

const COLUMNS = [
  { key: "name", label: "Placement Name", className: "min-w-[160px]" },
  { key: "location", label: "Location", className: "min-w-[140px]" },
  { key: "impressions", label: "Impressions", className: "min-w-[120px]" },
  { key: "ctr", label: "CTR", className: "min-w-[80px]" },
  { key: "revenue", label: "Revenue", className: "min-w-[100px]" },
  { key: "status", label: "Status", className: "min-w-[100px] text-right" },
] as const;

type PlacementRow = MonetizationOverview["placements"][number];

type AdPlacementManagerProps = {
  placements: PlacementRow[];
  onRefresh?: () => Promise<void>;
};

function formatPlacementLocation(row: PlacementRow): string {
  if (row.placement) return row.placement;
  return row.slot_key.replaceAll("_", " ");
}

export function AdPlacementManager({ placements, onRefresh }: AdPlacementManagerProps) {
  const [rows, setRows] = React.useState(placements);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setRows(placements);
  }, [placements]);

  const togglePlacement = async (row: PlacementRow, enabled: boolean) => {
    setTogglingId(row.id);
    try {
      await updateAdminAdSlot(row.id, { is_active: enabled });
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, is_active: enabled } : item)),
      );
      await onRefresh?.();
    } catch {
      /* keep previous state */
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminPanel padding="none" className="overflow-hidden">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <h2 className="text-lg font-semibold text-admin-heading">Ad Placement Manager</h2>
        <p className="mt-1 text-sm text-admin-label">
          Enable or disable ad zones across your site
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center gap-2 px-6 py-8 text-sm text-admin-label">
          <Loader2 className="size-4 animate-spin" />
          No ad placements configured yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-admin-table-header-bg">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted ${col.className} ${col.key === "status" ? "text-right" : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="px-6 py-4 text-base font-medium text-admin-heading">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-label">
                    {formatPlacementLocation(row)}
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-label">
                    {formatCompactCount(row.impressions)}
                  </td>
                  <td className="px-6 py-4 text-sm text-admin-label">{row.ctr.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-admin-label">
                    {formatCurrencyCents(row.revenue_cents)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AdminToggle
                      checked={row.is_active}
                      onCheckedChange={(v) => void togglePlacement(row, v)}
                      aria-label={`Toggle ${row.name}`}
                    />
                    {togglingId === row.id ? (
                      <span className="sr-only">Saving…</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
