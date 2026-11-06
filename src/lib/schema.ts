import { categorySlug } from "@/config/categories";
import { ingredientText, isoDuration } from "@/config/recipe";
import { siteConfig } from "@/config/site";
import { authorSlug, postHref, postBylines, wordCount, type Byline, type Post } from "@/lib/posts";
import { activeMinutes, allIngredients, isRecipe } from "@/lib/recipes";

/**
 * Every piece of structured data the site emits, in one place.
 *
 * Two rules hold the file together. Nothing is asserted here that a reader
 * cannot also see on the page — an ingredient in markup that is missing from
 * the printed list is the fastest way to lose a rich result, and deservedly so.
 * And every URL is absolute, built from `siteConfig.siteUrl`, because a crawler
 * has no page to resolve a relative path against.
 */

export type Schema = Record<string, unknown>;

export const absoluteUrl = (path: string) => new URL(path, siteConfig.siteUrl).toString();

/** The publication. Referenced by `@id` so it is described once per page. */
const publisherId = absoluteUrl("/#publication");

export const organizationSchema = (): Schema => ({
  "@type": "Organization",
  "@id": publisherId,
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(siteConfig.publisherLogo),
  },
  sameAs: siteConfig.socials
    .filter((social) => /^https?:\/\//.test(social.href))
    .map((social) => social.href),
});

const personSchema = (byline: Byline): Schema => ({
  "@type": "Person",
  name: byline.name,
  jobTitle: byline.role,
  url: absoluteUrl(`/author/${authorSlug(byline.name)}/`),
});

/**
 * The site itself, on any page that is not an article. The search action is
 * only claimed because `/search/` genuinely answers a `q` parameter.
 */
export const websiteSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: siteConfig.name,
  alternateName: siteConfig.tagline,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  inLanguage: siteConfig.language,
  publisher: organizationSchema(),
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl("/search/?q={search_term_string}"),
    },
    "query-input": "required name=search_term_string",
  },
});

/**
 * The trail a reader can actually retrace: every crumb below is a link the page
 * itself renders — the wordmark, and the section tag under the headline.
 */
export const breadcrumbSchema = (trail: { name: string; href: string }[]): Schema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.href),
  })),
});

export const postBreadcrumbSchema = (post: Post): Schema =>
  breadcrumbSchema([
    { name: siteConfig.name, href: "/" },
    { name: post.data.category, href: `/category/${categorySlug(post.data.category)}/` },
    { name: post.data.title, href: postHref(post) },
  ]);

/**
 * An article, or — when the post carries one — the recipe it published.
 *
 * A recipe is described as a `Recipe` rather than an `Article`, because the
 * ingredients and the method are the thing worth declaring and a `Recipe` is
 * where a search engine expects to find them. Everything an article node would
 * carry is still on it: a recipe is a creative work like any other.
 *
 * Nothing here is asserted that the page does not also print. The times, the
 * yield, every ingredient line and every step are the same values the article
 * renders, at the scale the recipe was written for — a reader who scales it in
 * the browser is not rewriting the published recipe.
 */
export const postSchema = (post: Post, imageUrl: string): Schema => {
  const data = post.data;
  const url = absoluteUrl(postHref(post));

  const base: Schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.excerpt,
    image: imageUrl,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: data.date.toISOString(),
    dateModified: (data.updatedDate ?? data.date).toISOString(),
    author: postBylines(post).map(personSchema),
    publisher: organizationSchema(),
    articleSection: data.category,
    keywords: data.tags,
    inLanguage: siteConfig.language,
    wordCount: wordCount(post),
    /* No `timeRequired`. It would have to be a reading estimate, and on a
       `Recipe` node every consumer reads that property as time in the kitchen —
       so the one number it could carry is the one it would be understood to
       mean least. The recipe's own times are on the `Recipe` fields below. */
    isAccessibleForFree: true,
  };

  if (!isRecipe(post)) return base;

  const recipe = post.data.recipe;
  const prep = isoDuration(recipe.prepMinutes);
  const cook = isoDuration(recipe.cookMinutes);
  const total = isoDuration(activeMinutes(recipe));

  return {
    ...base,
    "@type": "Recipe",
    name: data.title,
    recipeCategory: data.category,
    /* Two yields, because they answer different questions: the sentence a cook
       reads ("one 9-inch loaf") and the count a search result prints. */
    recipeYield: [recipe.yields, `${recipe.servings} servings`],
    ...(prep ? { prepTime: prep } : {}),
    ...(cook ? { cookTime: cook } : {}),
    ...(total ? { totalTime: total } : {}),
    recipeIngredient: allIngredients(recipe).map((item) => ingredientText(item)),
    recipeInstructions: recipe.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      ...(step.heading ? { name: step.heading } : {}),
      text: step.body,
      /* The article prints an id on every step, so each one is addressable. */
      url: `${url}#step-${index + 1}`,
    })),
    ...(recipe.equipment.length > 0
      ? { tool: recipe.equipment.map((item) => ({ "@type": "HowToTool", name: item })) }
      : {}),
    /* Ingredients are how a recipe is actually searched for, so they join the
       tags here rather than only sitting in `recipeIngredient`. */
    keywords: Array.from(new Set([...data.tags, ...data.keyIngredients])).join(", "),
  };
};
