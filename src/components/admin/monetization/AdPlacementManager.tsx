import * as React from "react";

import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import type { AdPlacement } from "@/data/admin/mockMonetization";
import { MOCK_AD_PLACEMENTS } from "@/data/admin/mockMonetization";

const COLUMNS = [
  { key: "name", label: "Placement Name", className: "min-w-[160px]" },
  { key: "location", label: "Location", className: "min-w-[140px]" },
  { key: "impressions", label: "Impressions", className: "min-w-[120px]" },
  { key: "ctr", label: "CTR", className: "min-w-[80px]" },
  { key: "revenue", label: "Revenue", className: "min-w-[100px]" },
  { key: "status", label: "Status", className: "min-w-[100px] text-right" },
] as const;

export function AdPlacementManager() {
  const [placements, setPlacements] = React.useState<AdPlacement[]>(MOCK_AD_PLACEMENTS);

  const togglePlacement = (id: string, enabled: boolean) => {
    setPlacements((prev) =>
      prev.map((row) => (row.id === id ? { ...row, enabled } : row)),
    );
  };

  return (
    <AdminPanel padding="none" className="overflow-hidden">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <h2 className="text-lg font-semibold text-admin-heading">Ad Placement Manager</h2>
        <p className="mt-1 text-sm text-admin-label">
          Enable or disable ad zones across your site
        </p>
      </div>

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
            {placements.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                <td className="px-6 py-4 text-base font-medium text-admin-heading">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-sm text-admin-label">{row.location}</td>
                <td className="px-6 py-4 text-sm text-admin-label">{row.impressions}</td>
                <td className="px-6 py-4 text-sm text-admin-label">{row.ctr}</td>
                <td className="px-6 py-4 text-sm text-admin-label">{row.revenue}</td>
                <td className="px-6 py-4 text-right">
                  <AdminToggle
                    checked={row.enabled}
                    onCheckedChange={(v) => togglePlacement(row.id, v)}
                    aria-label={`Toggle ${row.name}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
}
