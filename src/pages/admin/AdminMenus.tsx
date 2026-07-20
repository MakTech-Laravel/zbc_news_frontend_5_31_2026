import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Menu as MenuIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { MenuItemTree } from "@/components/admin/menus/MenuItemTree";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { usePermission, PERMISSIONS } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import {
  createMenu,
  createMenuItem,
  createMenuLocation,
  deleteMenu,
  deleteMenuItem,
  deleteMenuLocation,
  fetchMenu,
  fetchMenuLocations,
  fetchMenuMetaOptions,
  fetchMenus,
  reorderMenuItems,
  updateMenu,
  updateMenuItem,
  updateMenuLocation,
  type AdminMenu,
  type AdminMenuItem,
  type AdminMenuLocation,
  type MenuMetaOptions,
  type MenuRenderStyle,
  type MenuStatus,
} from "@/services/admin/menus";
import {
  fetchCategories,
  type AdminCategory,
} from "@/services/admin/categories";

type ViewMode = "list" | "edit" | "locations";

const menuSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "inactive"]),
});

type MenuFormValues = z.infer<typeof menuSchema>;

const customLinkSchema = z.object({
  label: z.string().min(1, "Label is required").max(255),
  url: z.string().min(1, "URL is required").max(2000),
  target: z.enum(["_self", "_blank"]),
  icon: z.string().max(100).optional(),
});

type CustomLinkValues = z.infer<typeof customLinkSchema>;

function flattenCategoryOptions(
  categories: AdminCategory[],
  depth = 0,
): Array<{ id: number; title: string; depth: number; hasChildren: boolean }> {
  const roots = categories.filter((c) => c.parent_id == null);
  const byParent = new Map<number | string, AdminCategory[]>();
  for (const cat of categories) {
    if (cat.parent_id == null) continue;
    const key = cat.parent_id;
    const list = byParent.get(key) ?? [];
    list.push(cat);
    byParent.set(key, list);
  }

  const walk = (rows: AdminCategory[], level: number) => {
    const sorted = [...rows].sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    );
    const out: Array<{
      id: number;
      title: string;
      depth: number;
      hasChildren: boolean;
    }> = [];
    for (const row of sorted) {
      const kids = byParent.get(row.id) ?? row.children ?? [];
      out.push({
        id: Number(row.id),
        title: row.title,
        depth: level,
        hasChildren: kids.length > 0,
      });
      if (kids.length) out.push(...walk(kids, level + 1));
    }
    return out;
  };

  if (roots.length) return walk(roots, depth);

  // Flat API without nesting — treat all as roots ordered by sort_order.
  return [...categories]
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((c) => ({
      id: Number(c.id),
      title: c.title,
      depth: c.parent_id ? 1 : 0,
      hasChildren: false,
    }));
}

function findItem(
  items: AdminMenuItem[],
  id: number,
): AdminMenuItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const child = findItem(item.children ?? [], id);
    if (child) return child;
  }
  return null;
}

function findSiblings(
  items: AdminMenuItem[],
  parentId: number | null,
): AdminMenuItem[] {
  if (parentId == null) return items;
  const parent = findItem(items, parentId);
  return parent?.children ?? [];
}

function getParentItem(
  tree: AdminMenuItem[],
  itemId: number,
): AdminMenuItem | null {
  for (const item of tree) {
    for (const child of item.children ?? []) {
      if (child.id === itemId) return item;
      const deeper = getParentItem([child], itemId);
      if (deeper) return deeper;
    }
  }
  return null;
}

export default function AdminMenus() {
  const { can } = usePermission();
  const canCreate = can(PERMISSIONS.MENUS.CREATE);
  const canUpdate = can(PERMISSIONS.MENUS.UPDATE);
  const canDelete = can(PERMISSIONS.MENUS.DELETE);
  const canManageItems = can(PERMISSIONS.MENUS.MANAGE_ITEMS) || canUpdate;
  const canReorder = can(PERMISSIONS.MENUS.REORDER) || canUpdate;
  const canManageLocations = can(PERMISSIONS.MENUS.MANAGE_LOCATIONS);

  const [view, setView] = React.useState<ViewMode>("list");
  const [menus, setMenus] = React.useState<AdminMenu[]>([]);
  const [locations, setLocations] = React.useState<AdminMenuLocation[]>([]);
  const [meta, setMeta] = React.useState<MenuMetaOptions | null>(null);
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [activeMenu, setActiveMenu] = React.useState<AdminMenu | null>(null);
  const [tree, setTree] = React.useState<AdminMenuItem[]>([]);
  const [selectedLocationKeys, setSelectedLocationKeys] = React.useState<string[]>([]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<AdminMenuItem | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);
  const [includeChildren, setIncludeChildren] = React.useState(true);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);
  const [locationDraft, setLocationDraft] = React.useState({
    name: "",
    key: "",
    description: "",
    render_style: "standard" as MenuRenderStyle,
  });

  const menuForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { name: "", slug: "", description: "", status: "active" },
  });

  const createForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { name: "", slug: "", description: "", status: "active" },
  });

  const customForm = useForm<CustomLinkValues>({
    resolver: zodResolver(customLinkSchema),
    defaultValues: { label: "", url: "/", target: "_self", icon: "" },
  });

  const editForm = useForm<CustomLinkValues & { is_active: boolean }>({
    resolver: zodResolver(
      customLinkSchema.extend({ is_active: z.boolean() }),
    ),
    defaultValues: { label: "", url: "/", target: "_self", icon: "", is_active: true },
  });

  const categoryOptions = React.useMemo(
    () => flattenCategoryOptions(categories),
    [categories],
  );

  const loadBase = React.useCallback(async () => {
    setLoading(true);
    try {
      const [menuRows, locationRows, metaRows, categoryRows] = await Promise.all([
        fetchMenus(),
        fetchMenuLocations(),
        fetchMenuMetaOptions(),
        fetchCategories(),
      ]);
      setMenus(menuRows);
      setLocations(locationRows);
      setMeta(metaRows);
      setCategories(categoryRows);
    } catch {
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadBase();
  }, [loadBase]);

  const openEditor = async (menu: AdminMenu) => {
    setSaving(true);
    try {
      const full = await fetchMenu(menu.id);
      setActiveMenu(full);
      setTree(full.items ?? []);
      setSelectedLocationKeys((full.locations ?? []).map((l) => l.key));
      menuForm.reset({
        name: full.name,
        slug: full.slug,
        description: full.description ?? "",
        status: full.status,
      });
      setView("edit");
    } catch {
      toast.error("Failed to open menu");
    } finally {
      setSaving(false);
    }
  };

  const refreshActive = async (menuId: number) => {
    const full = await fetchMenu(menuId);
    setActiveMenu(full);
    setTree(full.items ?? []);
    setSelectedLocationKeys((full.locations ?? []).map((l) => l.key));
    setMenus((prev) =>
      prev.map((m) => (m.id === full.id ? { ...m, ...full, items: undefined } : m)),
    );
  };

  const handleCreateMenu = createForm.handleSubmit(async (values) => {
    if (!canCreate) return;
    setSaving(true);
    try {
      const created = await createMenu(values);
      toast.success("Menu created");
      setCreateOpen(false);
      createForm.reset({ name: "", slug: "", description: "", status: "active" });
      await loadBase();
      await openEditor(created);
    } catch {
      toast.error("Could not create menu");
    } finally {
      setSaving(false);
    }
  });

  const handleSaveMenu = menuForm.handleSubmit(async (values) => {
    if (!activeMenu || !canUpdate) return;
    setSaving(true);
    try {
      await updateMenu(activeMenu.id, {
        ...values,
        location_keys: selectedLocationKeys,
      });
      toast.success("Menu saved");
      await refreshActive(activeMenu.id);
      await loadBase();
    } catch {
      toast.error("Could not save menu");
    } finally {
      setSaving(false);
    }
  });

  const handleDeleteMenu = async (menu: AdminMenu) => {
    if (!canDelete) return;
    if (!window.confirm(`Delete menu “${menu.name}”?`)) return;
    try {
      await deleteMenu(menu.id);
      toast.success("Menu deleted");
      if (activeMenu?.id === menu.id) {
        setActiveMenu(null);
        setView("list");
      }
      await loadBase();
    } catch {
      toast.error("Could not delete menu");
    }
  };

  const handleAddCategories = async () => {
    if (!activeMenu || !canManageItems || selectedCategoryIds.length === 0) return;
    setSaving(true);
    try {
      for (const categoryId of selectedCategoryIds) {
        await createMenuItem(activeMenu.id, {
          type: "category",
          category_id: categoryId,
          include_children: includeChildren,
        });
      }
      setSelectedCategoryIds([]);
      toast.success("Categories added");
      await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not add categories");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomLink = customForm.handleSubmit(async (values) => {
    if (!activeMenu || !canManageItems) return;
    setSaving(true);
    try {
      await createMenuItem(activeMenu.id, {
        type: "custom",
        label: values.label,
        url: values.url,
        target: values.target,
        icon: values.icon || null,
      });
      customForm.reset({ label: "", url: "/", target: "_self", icon: "" });
      toast.success("Custom link added");
      await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not add custom link");
    } finally {
      setSaving(false);
    }
  });

  const handleReorder = async (parentId: number | null, orderedIds: number[]) => {
    if (!activeMenu || !canReorder) return;
    try {
      await reorderMenuItems(activeMenu.id, orderedIds, parentId);
      await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not reorder items");
    }
  };

  const handleIndent = async (item: AdminMenuItem) => {
    if (!activeMenu || !canReorder) return;
    const siblings = findSiblings(tree, item.parent_id ?? null);
    const index = siblings.findIndex((row) => row.id === item.id);
    if (index <= 0) return;
    const prev = siblings[index - 1];
    try {
      await updateMenuItem(item.id, { parent_id: prev.id, type: item.type });
      await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not nest item");
    }
  };

  const handleOutdent = async (item: AdminMenuItem) => {
    if (!activeMenu || !canReorder || item.parent_id == null) return;
    const parent = getParentItem(tree, item.id);
    const grandparentId = parent?.parent_id ?? null;
    try {
      await updateMenuItem(item.id, {
        parent_id: grandparentId,
        type: item.type,
      });
      await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not outdent item");
    }
  };

  const handleToggleActive = async (item: AdminMenuItem) => {
    if (!canManageItems) return;
    try {
      await updateMenuItem(item.id, {
        type: item.type,
        is_active: !item.is_active,
        label: item.label,
        url: item.url ?? undefined,
        reference_id: item.reference_id,
      });
      if (activeMenu) await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not update item");
    }
  };

  const handleDeleteItem = async (item: AdminMenuItem) => {
    if (!canManageItems) return;
    if (!window.confirm(`Delete “${item.label}” and its sub-items?`)) return;
    try {
      await deleteMenuItem(item.id);
      toast.success("Item deleted");
      if (activeMenu) await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not delete item");
    }
  };

  const openEditItem = (item: AdminMenuItem) => {
    setEditItem(item);
    editForm.reset({
      label: item.label,
      url: item.url ?? "/",
      target: item.target ?? "_self",
      icon: item.icon ?? "",
      is_active: item.is_active,
    });
  };

  const handleSaveItem = editForm.handleSubmit(async (values) => {
    if (!editItem || !canManageItems) return;
    setSaving(true);
    try {
      await updateMenuItem(editItem.id, {
        type: editItem.type,
        label: values.label,
        url: editItem.type === "custom" ? values.url : undefined,
        target: values.target,
        icon: values.icon || null,
        is_active: values.is_active,
        reference_id: editItem.reference_id,
        category_id: editItem.type === "category" ? editItem.reference_id : undefined,
      });
      toast.success("Item updated");
      setEditItem(null);
      if (activeMenu) await refreshActive(activeMenu.id);
    } catch {
      toast.error("Could not update item");
    } finally {
      setSaving(false);
    }
  });

  const handleCreateLocation = async () => {
    if (!canManageLocations || !locationDraft.name.trim()) return;
    setSaving(true);
    try {
      await createMenuLocation({
        name: locationDraft.name.trim(),
        key: locationDraft.key.trim() || undefined,
        description: locationDraft.description.trim() || undefined,
        render_style: locationDraft.render_style,
      });
      toast.success("Location created");
      setLocationDialogOpen(false);
      setLocationDraft({ name: "", key: "", description: "", render_style: "standard" });
      const rows = await fetchMenuLocations();
      setLocations(rows);
    } catch {
      toast.error("Could not create location");
    } finally {
      setSaving(false);
    }
  };

  const toggleLocationKey = (key: string) => {
    setSelectedLocationKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-admin-trend-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Menus"
        description="WordPress-style menu builder — create menus, nest items, and assign locations."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={view === "list" || view === "edit" ? "default" : "outline"}
              onClick={() => {
                setView("list");
                setActiveMenu(null);
              }}
            >
              <MenuIcon className="size-4" />
              Menus
            </Button>
            <Button
              type="button"
              variant={view === "locations" ? "default" : "outline"}
              onClick={() => setView("locations")}
            >
              <MapPin className="size-4" />
              Locations
            </Button>
            {view !== "locations" && canCreate ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New menu
              </Button>
            ) : null}
            {view === "locations" && canManageLocations ? (
              <Button type="button" onClick={() => setLocationDialogOpen(true)}>
                <Plus className="size-4" />
                New location
              </Button>
            ) : null}
          </div>
        }
      />

      {view === "list" ? (
        <AdminPanel padding="none">
          {menus.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-admin-trend-muted">
              No menus yet. Create your first menu to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-admin-heading">{menu.name}</p>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          menu.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700",
                        )}
                      >
                        {menu.status}
                      </span>
                    </div>
                    <p className="text-xs text-admin-trend-muted">
                      /{menu.slug} · {menu.items_count ?? 0} items
                      {(menu.locations?.length ?? 0) > 0
                        ? ` · ${menu.locations!.map((l) => l.name).join(", ")}`
                        : " · no location"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => void openEditor(menu)}>
                      Edit
                    </Button>
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => void handleDeleteMenu(menu)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      ) : null}

      {view === "edit" && activeMenu ? (
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 px-0"
            onClick={() => {
              setView("list");
              setActiveMenu(null);
            }}
          >
            <ArrowLeft className="size-4" />
            Back to menus
          </Button>

          <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <AdminPanel>
                <h2 className="mb-3 text-sm font-semibold text-admin-heading">Menu settings</h2>
                <form className="space-y-3" onSubmit={handleSaveMenu}>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-admin-label">Name</label>
                    <Input {...menuForm.register("name")} disabled={!canUpdate} />
                    <InputError message={menuForm.formState.errors.name?.message} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-admin-label">Slug</label>
                    <Input {...menuForm.register("slug")} disabled={!canUpdate} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-admin-label">
                      Description
                    </label>
                    <Input {...menuForm.register("description")} disabled={!canUpdate} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-admin-label">Status</label>
                    <Select
                      value={menuForm.watch("status")}
                      onValueChange={(v) =>
                        menuForm.setValue("status", v as MenuStatus, { shouldDirty: true })
                      }
                      disabled={!canUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-admin-label">Display locations</p>
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                      {locations.map((loc) => (
                        <label
                          key={loc.key}
                          className="flex cursor-pointer items-start gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedLocationKeys.includes(loc.key)}
                            disabled={!canUpdate}
                            onChange={() => toggleLocationKey(loc.key)}
                          />
                          <span>
                            <span className="font-medium text-admin-heading">{loc.name}</span>
                            <span className="block text-xs text-admin-trend-muted">
                              {loc.key} · {loc.render_style}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {canUpdate ? (
                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save menu
                    </Button>
                  ) : null}
                </form>
              </AdminPanel>

              {canManageItems ? (
                <>
                  <AdminPanel>
                    <h2 className="mb-3 text-sm font-semibold text-admin-heading">Add categories</h2>
                    <div className="mb-3 max-h-52 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                      {categoryOptions.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          style={{ paddingLeft: cat.depth * 12 }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(cat.id)}
                            onChange={() =>
                              setSelectedCategoryIds((prev) =>
                                prev.includes(cat.id)
                                  ? prev.filter((id) => id !== cat.id)
                                  : [...prev, cat.id],
                              )
                            }
                          />
                          <span className="text-admin-heading">{cat.title}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-admin-label">
                        Auto-include child categories
                      </span>
                      <AdminToggle
                        checked={includeChildren}
                        onCheckedChange={setIncludeChildren}
                        aria-label="Include child categories"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={saving || selectedCategoryIds.length === 0}
                      onClick={() => void handleAddCategories()}
                    >
                      Add to menu
                    </Button>
                  </AdminPanel>

                  <AdminPanel>
                    <h2 className="mb-3 text-sm font-semibold text-admin-heading">
                      Add custom link
                    </h2>
                    <form className="space-y-3" onSubmit={handleAddCustomLink}>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-admin-label">
                          Label
                        </label>
                        <Input {...customForm.register("label")} />
                        <InputError message={customForm.formState.errors.label?.message} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-admin-label">
                          URL
                        </label>
                        <Input {...customForm.register("url")} />
                        <InputError message={customForm.formState.errors.url?.message} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-admin-label">
                          Target
                        </label>
                        <Select
                          value={customForm.watch("target")}
                          onValueChange={(v) =>
                            customForm.setValue("target", v as "_self" | "_blank")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_self">Same tab</SelectItem>
                            <SelectItem value="_blank">New tab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-admin-label">
                          Icon (optional)
                        </label>
                        <Input {...customForm.register("icon")} placeholder="e.g. Home" />
                      </div>
                      <Button type="submit" className="w-full" disabled={saving}>
                        Add custom link
                      </Button>
                    </form>
                  </AdminPanel>
                </>
              ) : null}
            </div>

            <AdminPanel padding="none">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-admin-heading">
                  Structure — {activeMenu.name}
                </h2>
                <p className="text-xs text-admin-trend-muted">
                  Drag to reorder. Use indent / outdent to nest items.
                </p>
              </div>
              <MenuItemTree
                items={tree}
                disabled={!canReorder || saving}
                onReorder={(parentId, ids) => void handleReorder(parentId, ids)}
                onIndent={(item) => void handleIndent(item)}
                onOutdent={(item) => void handleOutdent(item)}
                onEdit={openEditItem}
                onToggleActive={(item) => void handleToggleActive(item)}
                onDelete={(item) => void handleDeleteItem(item)}
              />
            </AdminPanel>
          </div>
        </div>
      ) : null}

      {view === "locations" ? (
        <AdminPanel padding="none">
          {locations.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-admin-trend-muted">
              No locations configured.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-admin-heading">{loc.name}</p>
                    <p className="text-xs text-admin-trend-muted">
                      {loc.key} · {loc.render_style}
                      {loc.menu ? ` · assigned: ${loc.menu.name}` : " · unassigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <AdminToggle
                      checked={loc.is_active}
                      disabled={!canManageLocations}
                      onCheckedChange={(checked) => {
                        void updateMenuLocation(loc.id, { is_active: checked })
                          .then(async () => {
                            setLocations(await fetchMenuLocations());
                          })
                          .catch(() => toast.error("Could not update location"));
                      }}
                      aria-label={`Toggle ${loc.name}`}
                    />
                    <Select
                      value={String(loc.menu_id ?? "__none__")}
                      disabled={!canManageLocations}
                      onValueChange={(value) => {
                        const menuId = value === "__none__" ? null : Number(value);
                        void updateMenuLocation(loc.id, { menu_id: menuId })
                          .then(async () => {
                            setLocations(await fetchMenuLocations());
                            toast.success("Location assignment updated");
                          })
                          .catch(() => toast.error("Could not assign menu"));
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign menu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No menu</SelectItem>
                        {menus.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {canManageLocations ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => {
                          if (!window.confirm(`Delete location “${loc.name}”?`)) return;
                          void deleteMenuLocation(loc.id)
                            .then(async () => {
                              setLocations(await fetchMenuLocations());
                              toast.success("Location deleted");
                            })
                            .catch(() => toast.error("Could not delete location"));
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta ? (
            <div className="border-t border-border px-4 py-3 text-xs text-admin-trend-muted">
              Render styles: {meta.render_styles.map((s) => s.label).join(" · ")}
            </div>
          ) : null}
        </AdminPanel>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create menu</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleCreateMenu}>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">Name</label>
              <Input {...createForm.register("name")} placeholder="Primary Navigation" />
              <InputError message={createForm.formState.errors.name?.message} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">
                Slug (optional)
              </label>
              <Input {...createForm.register("slug")} placeholder="primary-navigation" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">
                Description
              </label>
              <Input {...createForm.register("description")} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              Create menu
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSaveItem}>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">Label</label>
              <Input {...editForm.register("label")} />
            </div>
            {editItem?.type === "custom" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-admin-label">URL</label>
                <Input {...editForm.register("url")} />
              </div>
            ) : null}
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">Target</label>
              <Select
                value={editForm.watch("target")}
                onValueChange={(v) => editForm.setValue("target", v as "_self" | "_blank")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same tab</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">Icon</label>
              <Input {...editForm.register("icon")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-admin-label">Active</span>
              <AdminToggle
                checked={editForm.watch("is_active")}
                onCheckedChange={(checked) => editForm.setValue("is_active", checked)}
                aria-label="Item active"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              Save item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">Name</label>
              <Input
                value={locationDraft.name}
                onChange={(e) =>
                  setLocationDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Sidebar Menu"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">
                Key (optional)
              </label>
              <Input
                value={locationDraft.key}
                onChange={(e) =>
                  setLocationDraft((prev) => ({ ...prev, key: e.target.value }))
                }
                placeholder="sidebar"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">
                Render style
              </label>
              <Select
                value={locationDraft.render_style}
                onValueChange={(v) =>
                  setLocationDraft((prev) => ({
                    ...prev,
                    render_style: v as MenuRenderStyle,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(meta?.render_styles ?? []).map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-admin-label">
                Description
              </label>
              <Input
                value={locationDraft.description}
                onChange={(e) =>
                  setLocationDraft((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={saving}
              onClick={() => void handleCreateLocation()}
            >
              Create location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
