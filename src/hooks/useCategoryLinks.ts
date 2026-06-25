import { useEffect, useState } from "react";

import { request } from "@/api/request";

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
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const mapped = rows
          .filter((cat: { status?: string }) => cat.status === "active")
          .map((cat: { title?: string; slug?: string }) => ({
            label: cat.title ?? "Category",
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
