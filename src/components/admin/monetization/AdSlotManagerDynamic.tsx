import * as React from "react";
import { Code2, FolderOpen, ImagePlus, Loader2 } from "lucide-react";

import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { Button } from "@/components/ui/button";
import {
  formatAdPlacementSize,
  getAdPlacementSize,
} from "@/lib/adPlacementSizes";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  fetchAdminAdSlots,
  updateAdminAdSlot,
  type AdminAdSlot,
} from "@/services/admin/monetization";

type SlotDraft = AdminAdSlot;
type ManualMode = "image" | "html";

function toDraft(slot: AdminAdSlot): SlotDraft {
  return { ...slot };
}

function resolveManualMode(slot: SlotDraft): ManualMode {
  if ((slot.manual_html ?? "").trim()) return "html";
  return "image";
}

export function AdSlotManagerDynamic() {
  const [slots, setSlots] = React.useState<SlotDraft[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pickerSlotId, setPickerSlotId] = React.useState<number | null>(null);
  const [manualModes, setManualModes] = React.useState<Record<number, ManualMode>>({});

  const loadSlots = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAdSlots();
      setSlots(data.map(toDraft));
      setManualModes(
        Object.fromEntries(data.map((slot) => [slot.id, resolveManualMode(slot)])),
      );
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

  const setMode = (id: number, mode: ManualMode) => {
    setManualModes((prev) => ({ ...prev, [id]: mode }));
  };

  const handleSave = async (slot: SlotDraft) => {
    if (slot.provider === "google" && !(slot.google_ad_slot ?? "").trim()) {
      setError(`"${slot.name}" needs an Ad Unit ID when Provider is Google.`);
      return;
    }

    const mode = manualModes[slot.id] ?? resolveManualMode(slot);

    setSavingId(slot.id);
    setError(null);
    try {
      // Empty strings clear creatives (remove iframe/HTML or image) on purpose.
      const payload =
        slot.provider === "manual"
          ? mode === "html"
            ? {
              provider: slot.provider,
              is_active: slot.is_active,
              manual_html: (slot.manual_html ?? "").trim(),
              manual_image_url: "",
              manual_click_url: "",
              google_ad_slot: (slot.google_ad_slot ?? "").trim(),
            }
            : {
              provider: slot.provider,
              is_active: slot.is_active,
              manual_image_url: (slot.manual_image_url ?? "").trim(),
              manual_click_url: (slot.manual_click_url ?? "").trim(),
              manual_html: "",
              google_ad_slot: (slot.google_ad_slot ?? "").trim(),
            }
          : {
            provider: slot.provider,
            is_active: slot.is_active,
            google_ad_slot: (slot.google_ad_slot ?? "").trim(),
            manual_image_url: slot.manual_image_url ?? "",
            manual_click_url: (slot.manual_click_url ?? "").trim(),
            manual_html: slot.manual_html ?? "",
          };

      await updateAdminAdSlot(slot.id, payload);
      await loadSlots();
    } catch {
      setError(`Failed to save "${slot.name}".`);
    } finally {
      setSavingId(null);
    }
  };

  const handleClearCreative = (slot: SlotDraft) => {
    const mode = manualModes[slot.id] ?? resolveManualMode(slot);
    if (mode === "html") {
      updateDraft(slot.id, { manual_html: "" });
    } else {
      updateDraft(slot.id, {
        manual_image_url: "",
        manual_click_url: "",
      });
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
        <h2 className="text-lg font-semibold text-admin-heading">Ad Placements (individual)</h2>
        <p className="mt-1 text-sm text-admin-label">
          Use <strong>Google</strong> with an Ad Unit ID, or <strong>Manual</strong> with an image
          or HTML / iframe embed. Manual embeds stay inside the placement width; overflow scrolls.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-admin-table-header-bg">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Slot
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Provider
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-[0.6px] text-admin-trend-muted">
                Creative / Ad Unit
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
              const size = getAdPlacementSize(slot.slot_key);
              const mode = manualModes[slot.id] ?? resolveManualMode(slot);

              return (
                <tr key={slot.id} className="border-b border-border last:border-b-0 align-top">
                  <td className="px-6 py-4">
                    <p className="text-base font-medium text-admin-heading">{slot.name}</p>
                    <p className="mt-0.5 text-xs text-admin-trend-muted">{slot.slot_key}</p>
                    <p className="mt-2 text-xs text-admin-label">
                      Display size:{" "}
                      <span className="font-medium text-admin-heading">
                        {formatAdPlacementSize(size)}
                      </span>
                    </p>
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
                  </td>
                  <td className="px-6 py-4">
                    {slot.provider === "manual" ? (
                      <div className="min-w-[280px] space-y-3">
                        <div className="inline-flex rounded-md border border-border p-0.5">
                          <button
                            type="button"
                            onClick={() => setMode(slot.id, "image")}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium",
                              mode === "image"
                                ? "bg-zbc-blue text-white"
                                : "text-admin-trend-muted hover:text-admin-heading",
                            )}
                          >
                            <ImagePlus className="size-3.5" aria-hidden />
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode(slot.id, "html")}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium",
                              mode === "html"
                                ? "bg-zbc-blue text-white"
                                : "text-admin-trend-muted hover:text-admin-heading",
                            )}
                          >
                            <Code2 className="size-3.5" aria-hidden />
                            HTML / iframe
                          </button>
                        </div>

                        {mode === "image" ? (
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
                                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                            {(slot.manual_image_url ?? "").trim() ? (
                              <button
                                type="button"
                                onClick={() => handleClearCreative(slot)}
                                className="text-xs font-medium text-destructive hover:underline"
                              >
                                Remove image
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <textarea
                              rows={5}
                              placeholder={`Paste iframe or HTML/CSS, e.g.\n<iframe src="https://…" width="728" height="90"></iframe>`}
                              value={slot.manual_html ?? ""}
                              onChange={(e) =>
                                updateDraft(slot.id, { manual_html: e.target.value })
                              }
                              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-admin-trend-muted">
                                Shown inside {formatAdPlacementSize(size)}. Wider/taller creatives
                                scroll inside the box. Clear the box and Save to remove.
                              </p>
                              {(slot.manual_html ?? "").trim() ? (
                                <button
                                  type="button"
                                  onClick={() => handleClearCreative(slot)}
                                  className="shrink-0 text-xs font-medium text-destructive hover:underline"
                                >
                                  Remove HTML
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Ad unit ID (this placement only)"
                          value={slot.google_ad_slot ?? ""}
                          onChange={(e) =>
                            updateDraft(slot.id, { google_ad_slot: e.target.value })
                          }
                          className="w-full min-w-[180px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-admin-trend-muted">
                          Uses Publisher ID from above
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {slot.provider === "manual" && mode === "image" ? (
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

      <div className="border-t border-border bg-muted/20 px-6 py-4">
        <h3 className="text-sm font-semibold text-admin-heading">Placement display sizes</h3>
        <p className="mt-1 text-xs text-admin-label">
          Upload or embed creatives that fit these boxes. Content wider than the box will scroll
          horizontally/vertically inside the ad area.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => {
            const size = getAdPlacementSize(slot.slot_key);
            return (
              <li
                key={slot.id}
                className="rounded-md border border-border bg-background px-3 py-2 text-xs"
              >
                <p className="font-medium text-admin-heading">{slot.name}</p>
                <p className="mt-0.5 text-admin-trend-muted">{formatAdPlacementSize(size)}</p>
                <p className="mt-1 text-admin-label">{size.hint}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <MediaPickerDialog
        open={pickerSlotId !== null}
        onOpenChange={(open) => {
          if (!open) setPickerSlotId(null);
        }}
        onSelect={(item) => {
          if (pickerSlotId !== null) {
            updateDraft(pickerSlotId, { manual_image_url: item.url });
            setMode(pickerSlotId, "image");
          }
          setPickerSlotId(null);
        }}
        filter="image"
        title="Select ad creative"
      />
    </AdminPanel>
  );
}
