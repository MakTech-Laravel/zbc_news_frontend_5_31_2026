import { useEffect, useState } from "react";

import { request } from "@/api/request";
import {
  flattenCategoryTree,
  type CategoryTreeNode,
} from "@/lib/categoryTree";

export type CategoryLink = {
  label: string;
  to: string;
};

export function useCategoryLinks(): CategoryLink[] {
  const [links, setLinks] = useState<CategoryLink[]>([]);

  useEffect(() => {
    let isMounted = true;

    request
      .get("/categories")
      .then((response) => {
        const rows: CategoryTreeNode[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const mapped = flattenCategoryTree(rows)
          .filter((cat) => cat.status === "active")
          .map((cat) => ({
            label: cat.title ?? cat.name ?? "Category",
            to: cat.slug ? `/${cat.slug}` : "/",
          }));

        if (isMounted) setLinks(mapped);
      })
      .catch(() => {
        if (isMounted) setLinks([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return links;
}
