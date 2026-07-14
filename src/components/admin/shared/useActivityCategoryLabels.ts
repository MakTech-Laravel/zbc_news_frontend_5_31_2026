import * as React from "react";

import { request } from "@/api/request";
import {
  flattenCategoryTree,
  type CategoryTreeNode,
} from "@/lib/categoryTree";

function unwrapCategories(payload: unknown): CategoryTreeNode[] {
  if (Array.isArray(payload)) return payload as CategoryTreeNode[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as CategoryTreeNode[];
  }
  return [];
}

export async function fetchCategoryLabelMap(): Promise<Record<string, string>> {
  const response = await request.get("/categories");
  const items = flattenCategoryTree(unwrapCategories(response.data));
  const map: Record<string, string> = {};

  for (const item of items) {
    const id = item.id;
    const title =
      typeof item.title === "string"
        ? item.title
        : typeof item.name === "string"
          ? item.name
          : null;

    if (id != null && title) {
      const parentTitle =
        item.parent_id != null
          ? map[String(item.parent_id)]
          : undefined;
      map[String(id)] = parentTitle ? `${parentTitle} / ${title}` : title;
    }
  }

  return map;
}

export function useActivityCategoryLabels() {
  const [categoryLabels, setCategoryLabels] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const labels = await fetchCategoryLabelMap();
        if (!cancelled) setCategoryLabels(labels);
      } catch (error) {
        console.error("Failed to load categories for activity log:", error);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return categoryLabels;
}
