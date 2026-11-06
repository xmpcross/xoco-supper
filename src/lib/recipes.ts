import { ingredientText, type IngredientItem } from "@/config/recipe";
import type { Post } from "@/lib/posts";

/**
 * Recipes, as the rest of the theme sees them. A recipe is an ordinary post
 * carrying a `recipe` block, so every listing, feed, tag page, and search
 * result keeps working without knowing recipes exist — the blocks that do care
 * ask `isRecipe` first and get a narrowed type back.
 */
export type RecipeData = NonNullable<Post["data"]["recipe"]>;

export type RecipePost = Post & { data: { recipe: RecipeData } };

export const isRecipe = (post: Post): post is RecipePost => Boolean(post.data.recipe);

/**
 * Hands-on time plus oven time. Resting is deliberately left out: a loaf that
 * proves overnight is not a fourteen-hour recipe, and a card that says so
 * chases away the cook it was written for. The rest is stated separately, in
 * words, on the article itself.
 */
export const activeMinutes = (recipe: RecipeData) => recipe.prepMinutes + recipe.cookMinutes;

/**
 * The one number printed beside a post, or `undefined` when there is nothing to
 * print. Every card, row, and column calls this rather than reaching into
 * frontmatter, so a technique piece in a cooking section stays clean instead of
 * picking up a "0 min" strip.
 */
export const postMinutes = (post: Post) =>
  isRecipe(post) ? activeMinutes(post.data.recipe) : undefined;

/** Every ingredient line, groups flattened, in the order they are cooked. */
export const allIngredients = (recipe: RecipeData): IngredientItem[] =>
  recipe.ingredients.flatMap((group) => group.items);

export const ingredientCount = (recipe: RecipeData) => allIngredients(recipe).length;

/** The shopping list as plain lines, at the recipe's own scale. */
export const ingredientLines = (recipe: RecipeData) =>
  allIngredients(recipe).map((item) => ingredientText(item));

/** Recipes only, newest first, for the front page's cooking blocks. */
export const onlyRecipes = (posts: Post[]) => posts.filter(isRecipe);

/**
 * Recipes that are done inside `limit` minutes, quickest first. Drives the
 * front page "In under 30 minutes" rail, so the row is derived from the
 * recipes rather than from a flag somebody has to remember to set.
 */
export const quickRecipes = (posts: Post[], limit = 30, count = 8) =>
  onlyRecipes(posts)
    .filter((post) => activeMinutes(post.data.recipe) <= limit)
    .sort((a, b) => activeMinutes(a.data.recipe) - activeMinutes(b.data.recipe))
    .slice(0, count);

/** The long cooks, longest first — the counterweight to the quick rail. */
export const slowRecipes = (posts: Post[], from = 75, count = 6) =>
  onlyRecipes(posts)
    .filter((post) => activeMinutes(post.data.recipe) >= from)
    .sort((a, b) => activeMinutes(b.data.recipe) - activeMinutes(a.data.recipe))
    .slice(0, count);
