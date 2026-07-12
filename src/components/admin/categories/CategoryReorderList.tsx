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
import { GripVertical } from "lucide-react";

import type { AdminCategoryRow } from "@/components/admin/categories/useCategoriesDataTable";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryReorderListProps = {
  items: AdminCategoryRow[];
  onReorder: (next: AdminCategoryRow[]) => void;
  onMoveToPosition: (category: AdminCategoryRow, position: number) => void;
  disabled?: boolean;
};

function SortableCategoryRow({
  category,
  index,
  disabled,
  onMoveToPosition,
}: {
  category: AdminCategoryRow;
  index: number;
  disabled?: boolean;
  onMoveToPosition: (category: AdminCategoryRow, position: number) => void;
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
        <p className="truncate text-sm font-medium text-admin-heading">{category.title}</p>
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

export function CategoryReorderList({
  items,
  onReorder,
  onMoveToPosition,
  disabled = false,
}: CategoryReorderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = React.useMemo(() => items.map((item) => String(item.id)), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => String(item.id) === String(active.id));
    const newIndex = items.findIndex((item) => String(item.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-admin-trend-muted">
        No categories to reorder.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="divide-y divide-border">
          {items.map((category, index) => (
            <SortableCategoryRow
              key={String(category.id)}
              category={category}
              index={index}
              disabled={disabled}
              onMoveToPosition={onMoveToPosition}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
