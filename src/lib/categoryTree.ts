/**
 * Helpers for public category tree responses (roots with nested children).
 */

export type CategoryTreeNode = {
  id: number | string;
  title?: string;
  name?: string;
  slug?: string;
  status?: string;
  sort_order?: number;
  is_featured?: boolean;
  parent_id?: number | string | null;
  children?: CategoryTreeNode[];
};

/** Flatten roots + one level of children into a single list (parent then its children). */
export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const out: CategoryTreeNode[] = [];

  for (const node of nodes) {
    out.push(node);
    const children = Array.isArray(node.children) ? node.children : [];
    for (const child of children) {
      out.push(child);
    }
  }

  return out;
}

export function activeCategoryNodes(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.filter((node) => node.status === "active");
}

export function mapTreeToNavItems(
  nodes: CategoryTreeNode[],
): Array<{
  id: string;
  label: string;
  to: string;
  children: Array<{ id: string; label: string; to: string }>;
}> {
  return activeCategoryNodes(nodes).map((node) => {
    const children = activeCategoryNodes(Array.isArray(node.children) ? node.children : []);
    return {
      id: String(node.id),
      label: node.title ?? node.name ?? "Category",
      to: node.slug ? `/${node.slug}` : "/",
      children: children.map((child) => ({
        id: String(child.id),
        label: child.title ?? child.name ?? "Category",
        to: child.slug ? `/${child.slug}` : "/",
      })),
    };
  });
}
