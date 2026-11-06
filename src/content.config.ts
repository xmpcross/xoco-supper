import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categories, NOTES_CATEGORY } from "@/config/categories";
import { difficulties } from "@/config/recipe";

/** One name on a byline. The lead author and every coauthor take this shape. */
const byline = z.object({
  name: z.string(),
  role: z.string(),
});

/**
 * One line of an ingredient list.
 *
 * Amounts are stored as a number and a unit rather than as "3/4 cup water",
 * which is the whole reason the servings stepper on an article can be trusted:
 * the page scales `quantity`, leaves `unit` and `item` alone, and never has to
 * parse a fraction out of a sentence. An ingredient with no `quantity` — flaky
 * salt, a handful of basil — simply prints as written.
 */
const ingredient = z.object({
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  item: z.string(),
  /**
   * The item as it reads at any quantity other than one — "lemons" beside
   * "lemon". Only needed on countable things with no unit, since a unit already
   * carries the plural ("3 tbsp olive oil").
   */
  plural: z.string().optional(),
  /**
   * "smashed", "at room temperature", "drained but not rinsed".
   *
   * It must never contain an amount. The note is free text and the scaler
   * cannot touch it, so a note reading "about 500g" beside a quantity of 1 is
   * simply wrong the moment a reader doubles the recipe. Ratios and settings
   * are fine — "20% fat", "at 28C" — because those stay true at any scale.
   */
  note: z.string().optional(),
  /**
   * Amounts that must not move when the recipe is scaled: a tin size, a sheet
   * pan, a pinch. Doubling a cake does not give you two tins.
   */
  fixed: z.boolean().default(false),
});

/**
 * The recipe block. Present on every post outside the reading section — the
 * collection refuses it there — and optional even in a cooking section, so a
 * section can still carry a technique piece that nobody needs to shop for.
 *
 * There is deliberately no nutrition field. Numbers a home kitchen cannot
 * verify read as precision the recipe does not have, and a calorie count under
 * a hand-torn loaf is worse than none at all.
 */
const recipe = z
  .object({
    /** How many people it feeds. The stepper scales against this. */
    servings: z.number().int().positive(),
    /** "4 bowls", "one 9-inch loaf" — what actually comes out of the pan. */
    yields: z.string(),
    prepMinutes: z.number().int().min(0),
    cookMinutes: z.number().int().min(0),
    /** Time the cook is not in the kitchen: rising, chilling, marinating. */
    restMinutes: z.number().int().min(0).default(0),
    /** What "rest" means on this recipe: "Overnight in the fridge". */
    restNote: z.string().optional(),
    difficulty: z.enum(difficulties),

    /**
     * The shopping list, in groups. A recipe with nothing to separate uses one
     * group with no heading, which renders as a plain list.
     */
    ingredients: z
      .array(
        z.object({
          /** "For the dressing". Omitted on a single-group list. */
          heading: z.string().optional(),
          items: z.array(ingredient).min(1),
        }),
      )
      .min(1),

    /** The method. One entry per step; the numbers are drawn, not typed. */
    steps: z
      .array(
        z.object({
          /** "Roast the tomatoes". Optional — a short step needs no title. */
          heading: z.string().optional(),
          body: z.string(),
        }),
      )
      .min(1),

    /** The things a cook only finds out the second time. */
    notes: z.array(z.string()).default([]),
    /** "Three days, covered, in the fridge." Printed with the notes. */
    keeps: z.string().optional(),
    /** The pan, tin, or tool the recipe genuinely will not work without. */
    equipment: z.array(z.string()).default([]),
  })
  .refine((data) => data.prepMinutes + data.cookMinutes > 0, {
    message: "A recipe needs prep time, cook time, or both.",
    path: ["cookMinutes"],
  });

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        excerpt: z.string(),
        category: z.enum(categories),
        date: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        author: byline,
        /**
         * Extra names on the byline, read in the order they are listed. The lead
         * `author` still owns the post and always reads first, while every
         * coauthor gets the same avatar, archive page, and author box treatment.
         */
        coauthors: z.array(byline).default([]),
        tags: z.array(z.string()).default([]),
        cover: z.object({
          src: image(),
          alt: z.string(),
          creditName: z.string(),
          creditUrl: z.url(),
          showInPost: z.boolean().optional(),
        }),
        /* Opening treatment for the article page. Every layout uses the same
           cover image; only its placement and scale change. */
        storyLayout: z.enum(["standard", "banner", "cover", "immersive"]).default("standard"),
        /**
         * The ingredients worth naming — "olive oil, lemon, anchovy". Not
         * printed anywhere; they feed the search index and the article's
         * structured-data keywords.
         */
        keyIngredients: z.array(z.string()).default([]),
        trending: z.boolean().default(false),
        /** Promotes the post into the front page "Cooked on repeat" rail. */
        editorsPick: z.boolean().default(false),
        /**
         * Puts the post at the top of the front page as the full-width hero. When
         * several are flagged the newest wins; when none is, the newest post
         * stands in.
         */
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        /**
         * Turns the post into a recipe: a time strip on every card that carries
         * it, and a scalable ingredient list, a numbered method, and cook's
         * notes on the article. Refused in the reading section — see below.
         */
        recipe: recipe.optional(),
      })
      .superRefine((data, ctx) => {
        /* The reading section is where the writing goes. Letting an ingredient
           list loose in it would put a time strip and a "jump to recipe" button
           on an essay that has neither, so the build stops here instead. */
        if (data.recipe && data.category === NOTES_CATEGORY) {
          ctx.addIssue({
            code: "custom",
            path: ["recipe"],
            message: `A "recipe" block is not valid on posts filed under "${NOTES_CATEGORY}" — that section is for writing. Move the post to a cooking section, or drop the recipe block.`,
          });
        }
      }),
});

export const collections = { posts };
