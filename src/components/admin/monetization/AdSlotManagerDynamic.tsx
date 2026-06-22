import * as React from "react";
import { FolderOpen, ImagePlus, Loader2 } from "lucide-react";

import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  fetchAdminAdSlots,
  updateAdminAdSlot,
  type AdminAdSlot,
} from "@/services/admin/monetization";

type SlotDraft = AdminAdSlot;

function toDraft(slot: AdminAdSlot): SlotDraft {
  return { ...slot };
}

export function AdSlotManagerDynamic() {
  const [slots, setSlots] = React.useState<SlotDraft[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pickerSlotId, setPickerSlotId] = React.useState<number | null>(null);

  const loadSlots = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAdSlots();
      setSlots(data.map(toDraft));
    } catch {
      setError("Failed to load ad slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const updateDraft = (id: number, patch: Partial<SlotDraft>) => {
    setSlots((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleSave = async (slot: SlotDraft) => {
    setSavingId(slot.id);
    setError(null);
    try {
      await updateAdminAdSlot(slot.id, {
        provider: slot.provider,
        is_active: slot.is_active,
        google_ad_client: slot.google_ad_client ?? "",
        google_ad_slot: slot.google_ad_slot ?? "",
        manual_click_url: slot.manual_click_url ?? "",
        manual_image_url: slot.manual_image_url ?? "",
      });
      await loadSlots();
    } catch {
      setError(`Failed to save "${slot.name}".`);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <AdminPanel>
        <div className="flex items-center gap-2 text-sm text-admin-label">
          <Loader2 className="size-4 animate-spin" />
          Loading ad slots…
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel padding="none" className="overflow-hidden">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <h2 className="text-lg font-semibold text-admin-heading">Ad Slot Configuration</h2>
        <p className="mt-1 text-sm text-admin-label">
          Configure which ad area uses Google Ads or manual creative. Select an image from the
          media library or paste a URL.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-admin-table-header-bg">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Slot
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Provider
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Creative
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Click URL
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted text-right">
                Active
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => {
              const imageSrc = slot.manual_image_url
                ? resolveMediaUrl(slot.manual_image_url)
                : null;

              return (
                <tr key={slot.id} className="border-b border-border last:border-b-0 align-top">
                  <td className="px-6 py-4">
                    <p className="text-base font-medium text-admin-heading">{slot.name}</p>
                    <p className="mt-0.5 text-xs text-admin-trend-muted">{slot.slot_key}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={slot.provider}
                      onChange={(e) =>
                        updateDraft(slot.id, {
                          provider: e.target.value as AdminAdSlot["provider"],
                        })
                      }
                      className="w-full min-w-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="google">Google</option>
                      <option value="manual">Manual</option>
                    </select>
                    {slot.provider === "google" ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Ad client (ca-pub-…)"
                          value={slot.google_ad_client ?? ""}
                          onChange={(e) => updateDraft(slot.id, { google_ad_client: e.target.value })}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Ad slot ID"
                          value={slot.google_ad_slot ?? ""}
                          onChange={(e) => updateDraft(slot.id, { google_ad_slot: e.target.value })}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                        />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    {slot.provider === "manual" ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt=""
                              className="h-16 w-24 shrink-0 rounded border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded border border-dashed border-border bg-muted/30">
                              <ImagePlus className="size-5 text-admin-trend-muted" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => setPickerSlotId(slot.id)}
                            >
                              <FolderOpen className="size-3.5" aria-hidden />
                              Select from library
                            </Button>
                            <input
                              type="text"
                              placeholder="Or paste image URL"
                              value={slot.manual_image_url ?? ""}
                              onChange={(e) =>
                                updateDraft(slot.id, {
                                  manual_image_url: e.target.value,
                                })
                              }
                              className="w-full min-w-[180px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-admin-trend-muted">Google AdSense</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {slot.provider === "manual" ? (
                      <input
                        type="text"
                        placeholder="https://…"
                        value={slot.manual_click_url ?? ""}
                        onChange={(e) => updateDraft(slot.id, { manual_click_url: e.target.value })}
                        className="w-full min-w-[160px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    ) : (
                      <span className="text-sm text-admin-trend-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AdminToggle
                      checked={slot.is_active}
                      onCheckedChange={(v) => updateDraft(slot.id, { is_active: v })}
                      aria-label={`Toggle ${slot.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      disabled={savingId === slot.id}
                      onClick={() => void handleSave(slot)}
                      className="rounded-md bg-zbc-blue px-4 py-2 text-sm font-medium text-white hover:bg-zbc-blue/90 disabled:opacity-60"
                    >
                      {savingId === slot.id ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MediaPickerDialog
        open={pickerSlotId !== null}
        onOpenChange={(open) => {
          if (!open) setPickerSlotId(null);
        }}
        onSelect={(item) => {
          if (pickerSlotId !== null) {
            updateDraft(pickerSlotId, { manual_image_url: item.url });
          }
          setPickerSlotId(null);
        }}
        filter="image"
        title="Select ad creative"
      />
    </AdminPanel>
  );
}
