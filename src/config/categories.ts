export const categories = [
  "Weeknight",
  "Slow Sunday",
  "Baking",
  "Greens",
  "Small Plates",
  "Sweet",
  "Field Notes",
] as const;

export type Category = (typeof categories)[number];

/**
 * The one section that carries writing rather than cooking. A `recipe` block in
 * frontmatter is refused here and allowed everywhere else — see
 * `src/content.config.ts` — so an essay can never pick up an ingredient list
 * and a recipe can never hide in the reading section.
 */
export const NOTES_CATEGORY: Category = "Field Notes";

/** Sections that hold recipes. Used by the front page's recipe-only blocks. */
export const recipeCategories = categories.filter(
  (category) => category !== NOTES_CATEGORY,
) as Exclude<Category, typeof NOTES_CATEGORY>[];

/**
 * Controls how each category page presents its posts:
 * - "grid": the standard card grid
 * - "list": one image-led editorial row per post
 *
 * There is deliberately no lead-story layout. The track runs the full width of
 * the window here, so a banner crop of a 4:5 cover has to be upscaled past what
 * any photograph survives — and a section page is a list of dishes, not a front
 * page with an argument to make.
 */
export type CategoryLayout = "grid" | "list";

export const categoryLayouts: Record<Category, CategoryLayout> = {
  Weeknight: "grid",
  "Slow Sunday": "grid",
  Baking: "grid",
  Greens: "grid",
  "Small Plates": "grid",
  Sweet: "grid",
  "Field Notes": "list",
};

export const categorySlug = (category: Category) =>
  category
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");

export const categoryMeta: Record<Category, { description: string; blurb: string }> = {
  Weeknight: {
    description:
      "Dinner on a Tuesday, from a fridge nobody planned around. One pan where one pan will do, and never more than an hour.",
    blurb: "Tuesday, solved",
  },
  "Slow Sunday": {
    description:
      "The long cooks: braises, roasts, a pot of beans that owes you nothing until evening. Mostly waiting, hardly any work.",
    blurb: "Mostly waiting",
  },
  Baking: {
    description:
      "Bread, cake, and the things that need a scale. Written for a home oven that runs hot on one side, because most of them do.",
    blurb: "Weigh it, then relax",
  },
  Greens: {
    description:
      "Vegetables treated as the point rather than the side — charred, shaved, roasted hard, and dressed while still warm.",
    blurb: "The point, not the side",
  },
  "Small Plates": {
    description:
      "Things to put on a table before dinner, or instead of it. Dips, toasts, a bowl of something salty and a cold drink.",
    blurb: "Before, or instead",
  },
  Sweet: {
    description:
      "Puddings, cookies, and fruit that only needs heat and a little sugar. Short recipes, mostly, and none of them fussy.",
    blurb: "Short and sweet",
  },
  "Field Notes": {
    description:
      "The writing between the recipes: how to buy the ingredients, what the pantry is for, and which techniques are worth the argument.",
    blurb: "Between the recipes",
  },
};
