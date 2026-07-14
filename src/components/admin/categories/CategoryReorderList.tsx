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
import { GripVertical, Info } from "lucide-react";

import type { AdminCategoryRow } from "@/components/admin/categories/useCategoriesDataTable";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CategoryReorderGroup = {
  parentId: string | null;
  heading: string | null;
  items: AdminCategoryRow[];
};

type CategoryReorderListProps = {
  groups: CategoryReorderGroup[];
  onGroupReorder: (parentId: string | null, next: AdminCategoryRow[]) => void;
  onMoveToPosition: (category: AdminCategoryRow, position: number) => void;
  disabled?: boolean;
};

function SortableCategoryRow({
  category,
  index,
  disabled,
  onMoveToPosition,
  isSubcategory,
}: {
  category: AdminCategoryRow;
  index: number;
  disabled?: boolean;
  onMoveToPosition: (category: AdminCategoryRow, position: number) => void;
  isSubcategory?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(category.id), disabled });

  const [positionDraft, setPositionDraft] = React.useState(String(index + 1));

  React.useEffect(() => {
    setPositionDraft(String(index + 1));
  }, [index, category.id]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commitPosition = () => {
    const next = Number.parseInt(positionDraft, 10);
    if (!Number.isFinite(next) || next < 1) {
      setPositionDraft(String(index + 1));
      return;
    }
    if (next === index + 1) return;
    onMoveToPosition(category, next);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:px-4",
        isSubcategory && "bg-zbc-blue/[0.03] pl-5 sm:pl-6",
        isDragging && "relative z-10 bg-admin-surface shadow-md",
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-admin-trend-muted",
          "hover:bg-admin-surface hover:text-admin-heading",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          disabled && "pointer-events-none opacity-50",
        )}
        aria-label={`Drag to reorder ${category.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isSubcategory ? (
            <span className="inline-flex rounded bg-zbc-blue/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-zbc-blue uppercase">
              Sub
            </span>
          ) : (
            <span className="inline-flex rounded bg-admin-surface px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-admin-trend-muted uppercase ring-1 ring-border">
              Main
            </span>
          )}
          <p className="truncate text-sm font-medium text-admin-heading">{category.title}</p>
        </div>
        <p className="truncate text-xs text-admin-trend-muted">/{category.slug}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label
          htmlFor={`category-position-${category.id}`}
          className="hidden text-xs font-medium text-admin-label sm:inline"
        >
          Position
        </label>
        <Input
          id={`category-position-${category.id}`}
          type="number"
          min={1}
          inputMode="numeric"
          disabled={disabled}
          value={positionDraft}
          onChange={(event) => setPositionDraft(event.target.value)}
          onBlur={commitPosition}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="h-9 w-16 text-center"
          aria-label={`Position for ${category.title}`}
        />
      </div>
    </div>
  );
}

function SortableGroup({
  group,
  disabled,
  onGroupReorder,
  onMoveToPosition,
}: {
  group: CategoryReorderGroup;
  disabled?: boolean;
  onGroupReorder: (parentId: string | null, next: AdminCategoryRow[]) => void;
  onMoveToPosition: (category: AdminCategoryRow, position: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = React.useMemo(
    () => group.items.map((item) => String(item.id)),
    [group.items],
  );
  const isSubGroup = group.parentId !== null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = group.items.findIndex((item) => String(item.id) === String(active.id));
    const newIndex = group.items.findIndex((item) => String(item.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onGroupReorder(group.parentId, arrayMove(group.items, oldIndex, newIndex));
  };

  if (group.items.length === 0) return null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border",
        isSubGroup
          ? "border-zbc-blue/20 bg-zbc-blue/[0.02]"
          : "border-border bg-background",
      )}
    >
      <div
        className={cn(
          "border-b px-3 py-3 sm:px-4",
          isSubGroup
            ? "border-zbc-blue/15 bg-zbc-blue/[0.06]"
            : "border-border bg-admin-table-header-bg",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            isSubGroup ? "text-zbc-blue" : "text-admin-heading",
          )}
        >
          {isSubGroup
            ? `Subcategories under “${group.heading}”`
            : "Main categories"}
        </p>
        <p className="mt-1 text-xs text-admin-trend-muted">
          {isSubGroup
            ? "Drag only within this group. Order here does not change other parents."
            : "Drag these top-level categories to set their order in the site navigation."}
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {group.items.map((category, index) => (
              <SortableCategoryRow
                key={String(category.id)}
                category={category}
                index={index}
                disabled={disabled}
                isSubcategory={isSubGroup}
                onMoveToPosition={onMoveToPosition}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export function CategoryReorderList({
  groups,
  onGroupReorder,
  onMoveToPosition,
  disabled = false,
}: CategoryReorderListProps) {
  const hasItems = groups.some((group) => group.items.length > 0);
  const hasSubGroups = groups.some(
    (group) => group.parentId !== null && group.items.length > 0,
  );

  if (!hasItems) {
    return (
      <div className="px-4 py-12 text-center text-sm text-admin-trend-muted">
        No categories to reorder.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <div className="flex gap-2.5 rounded-lg border border-border bg-admin-surface/50 px-3 py-3 sm:px-4">
        <Info className="mt-0.5 size-4 shrink-0 text-zbc-blue" aria-hidden />
        <div className="min-w-0 space-y-1 text-xs text-admin-trend-muted sm:text-sm">
          <p className="font-medium text-admin-heading">How reordering works</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              <span className="font-medium text-admin-heading">Main categories</span>{" "}
              appear first — change their order for the header navigation.
            </li>
            <li>
              <span className="font-medium text-admin-heading">Subcategories</span>{" "}
              are listed under each parent — reorder them only inside that parent.
            </li>
            <li>You cannot drag a subcategory into another parent here.</li>
            <li>Click <span className="font-medium text-admin-heading">Save order</span> when finished, or Cancel to discard.</li>
          </ul>
          {!hasSubGroups ? (
            <p className="pt-1 text-admin-trend-muted">
              Tip: create subcategories from the category form (set a Parent) to
              manage their order in separate groups below.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <SortableGroup
            key={group.parentId ?? "roots"}
            group={group}
            disabled={disabled}
            onGroupReorder={onGroupReorder}
            onMoveToPosition={onMoveToPosition}
          />
        ))}
      </div>
    </div>
  );
}
