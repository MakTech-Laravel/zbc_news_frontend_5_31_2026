export type AdPlacementSize = {
  label: string;
  /** CSS / recommended display width */
  width: string;
  /** CSS / recommended display height */
  height: string;
  /** Short hint for admins when uploading creatives */
  hint: string;
};

/** Recommended display boxes for each seeded placement. */
export const AD_PLACEMENT_SIZES: Record<string, AdPlacementSize> = {
  left_sidebar_primary: {
    label: "Left sidebar",
    width: "100% (≈280–320px)",
    height: "180px+",
    hint: "Tall or square unit; width follows the sidebar column.",
  },
  right_sidebar_primary: {
    label: "Right sidebar",
    width: "100% (≈280–320px)",
    height: "≈250–360px",
    hint: "Square / medium rectangle works best.",
  },
  home_banner_top: {
    label: "Home banner (top)",
    width: "100%",
    height: "90–120px",
    hint: "Leaderboard / fluid banner across the content column.",
  },
  home_banner_middle: {
    label: "Home banner (middle)",
    width: "100%",
    height: "90–120px",
    hint: "Leaderboard / fluid banner across the content column.",
  },
  home_banner_bottom: {
    label: "Home banner (bottom)",
    width: "100%",
    height: "90–120px",
    hint: "Leaderboard / fluid banner across the content column.",
  },
  article_details_inline: {
    label: "Article inline",
    width: "100%",
    height: "90–120px",
    hint: "Full-width banner under article content.",
  },
  article_details_bottom: {
    label: "Article bottom",
    width: "100%",
    height: "90–120px",
    hint: "Full-width banner at the end of the article.",
  },
  content_banner_primary: {
    label: "Content banner",
    width: "100%",
    height: "90–120px",
    hint: "Category / tag / author listing banner.",
  },
};

export function getAdPlacementSize(slotKey: string): AdPlacementSize {
  return (
    AD_PLACEMENT_SIZES[slotKey] ?? {
      label: slotKey,
      width: "100%",
      height: "auto",
      hint: "Fluid width inside the page layout.",
    }
  );
}

export function formatAdPlacementSize(size: AdPlacementSize): string {
  return `${size.width} × ${size.height}`;
}
