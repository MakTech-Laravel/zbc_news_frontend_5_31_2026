import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FolderTree,
  GripVertical,
  IndentDecrease,
  IndentIncrease,
  Link2,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import type { AdminMenuItem } from "@/services/admin/menus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MenuItemTreeProps = {
  items: AdminMenuItem[];
  disabled?: boolean;
  onReorder: (parentId: number | null, orderedIds: number[]) => void;
  onIndent: (item: AdminMenuItem) => void;
  onOutdent: (item: AdminMenuItem) => void;
  onEdit: (item: AdminMenuItem) => void;
  onToggleActive: (item: AdminMenuItem) => void;
  onDelete: (item: AdminMenuItem) => void;
};

function typeIcon(type: string) {
  if (type === "category") return FolderTree;
  return Link2;
}

function SortableMenuRow({
  item,
  depth,
  disabled,
  expanded,
  onToggleExpand,
  canIndent,
  canOutdent,
  onIndent,
  onOutdent,
  onEdit,
  onToggleActive,
  onDelete,
  children,
}: {
  item: AdminMenuItem;
  depth: number;
  disabled?: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  canIndent: boolean;
  canOutdent: boolean;
  onIndent: () => void;
  onOutdent: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id), disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = typeIcon(item.type);
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 border-b border-border px-2 py-2.5 sm:gap-3 sm:px-3",
          !item.is_active && "opacity-55",
          isDragging && "relative z-10 bg-admin-surface shadow-md",
        )}
      >
        <button
          type="button"
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-admin-trend-muted",
            "hover:bg-admin-surface hover:text-admin-heading",
            disabled && "pointer-events-none opacity-50",
          )}
          aria-label={`Drag ${item.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>

        <div style={{ width: depth * 16 }} className="shrink-0" aria-hidden />

        {hasChildren ? (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-admin-trend-muted hover:bg-admin-surface"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}

        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
            item.type === "category"
              ? "bg-zbc-blue/10 text-zbc-blue"
              : "bg-admin-surface text-admin-trend-muted ring-1 ring-border",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-admin-heading">{item.label}</p>
            <span className="rounded bg-admin-surface px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-admin-trend-muted uppercase ring-1 ring-border">
              {item.type}
            </span>
            {!item.is_active ? (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 uppercase">
                Disabled
              </span>
            ) : null}
          </div>
          {item.url ? (
            <p className="truncate text-xs text-admin-trend-muted">{item.url}</p>
          ) : null}
        </div>

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled || !canOutdent}
            onClick={onOutdent}
            aria-label="Outdent"
            title="Outdent"
          >
            <IndentDecrease className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled || !canIndent}
            onClick={onIndent}
            aria-label="Indent"
            title="Indent under previous sibling"
          >
            <IndentIncrease className="size-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-8" disabled={disabled}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              <Power className="size-4" />
              {item.is_active ? "Disable" : "Enable"}
            </DropdownMenuItem>
            {item.url ? (
              <DropdownMenuItem asChild>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open URL
                </a>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded ? children : null}
    </div>
  );
}

function SiblingGroup({
  items,
  parentId,
  depth,
  allItems,
  disabled,
  expandedIds,
  onToggleExpand,
  onReorder,
  onIndent,
  onOutdent,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  items: AdminMenuItem[];
  parentId: number | null;
  depth: number;
  allItems: AdminMenuItem[];
  disabled?: boolean;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onReorder: (parentId: number | null, orderedIds: number[]) => void;
  onIndent: (item: AdminMenuItem) => void;
  onOutdent: (item: AdminMenuItem) => void;
  onEdit: (item: AdminMenuItem) => void;
  onToggleActive: (item: AdminMenuItem) => void;
  onDelete: (item: AdminMenuItem) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map((item) => String(item.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex).map((item) => item.id);
    onReorder(parentId, next);
  };

  const findPreviousSibling = (item: AdminMenuItem) => {
    const index = items.findIndex((row) => row.id === item.id);
    return index > 0 ? items[index - 1] : null;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item) => {
          const prev = findPreviousSibling(item);
          const canIndent = Boolean(prev);
          const canOutdent = item.parent_id != null;
          const childItems = item.children ?? [];

          return (
            <SortableMenuRow
              key={item.id}
              item={item}
              depth={depth}
              disabled={disabled}
              expanded={expandedIds.has(item.id)}
              onToggleExpand={() => onToggleExpand(item.id)}
              canIndent={canIndent}
              canOutdent={canOutdent}
              onIndent={() => onIndent(item)}
              onOutdent={() => onOutdent(item)}
              onEdit={() => onEdit(item)}
              onToggleActive={() => onToggleActive(item)}
              onDelete={() => onDelete(item)}
            >
              {childItems.length > 0 ? (
                <SiblingGroup
                  items={childItems}
                  parentId={item.id}
                  depth={depth + 1}
                  allItems={allItems}
                  disabled={disabled}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  onReorder={onReorder}
                  onIndent={onIndent}
                  onOutdent={onOutdent}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              ) : null}
            </SortableMenuRow>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

export function MenuItemTree({
  items,
  disabled,
  onReorder,
  onIndent,
  onOutdent,
  onEdit,
  onToggleActive,
  onDelete,
}: MenuItemTreeProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => {
    const ids = new Set<number>();
    const walk = (rows: AdminMenuItem[]) => {
      for (const row of rows) {
        if ((row.children?.length ?? 0) > 0) {
          ids.add(row.id);
          walk(row.children ?? []);
        }
      }
    };
    walk(items);
    return ids;
  });

  React.useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      const walk = (rows: AdminMenuItem[]) => {
        for (const row of rows) {
          if ((row.children?.length ?? 0) > 0 && !next.has(row.id)) {
            next.add(row.id);
          }
          walk(row.children ?? []);
        }
      };
      walk(items);
      return next;
    });
  }, [items]);

  const onToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-admin-trend-muted">
        No menu items yet. Add a category or custom link to get started.
      </div>
    );
  }

  return (
    <SiblingGroup
      items={items}
      parentId={null}
      depth={0}
      allItems={items}
      disabled={disabled}
      expandedIds={expandedIds}
      onToggleExpand={onToggleExpand}
      onReorder={onReorder}
      onIndent={onIndent}
      onOutdent={onOutdent}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
      onDelete={onDelete}
    />
  );
}
