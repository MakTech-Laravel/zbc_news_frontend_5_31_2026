import * as React from "react";

import { request } from "@/api/request";

function unwrapCategories(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

export async function fetchCategoryLabelMap(): Promise<Record<string, string>> {
  const response = await request.get("/categories");
  const items = unwrapCategories(response.data);
  const map: Record<string, string> = {};

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id = record.id;
    const title =
      typeof record.title === "string"
        ? record.title
        : typeof record.name === "string"
          ? record.name
          : null;

    if (id != null && title) {
      map[String(id)] = title;
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
