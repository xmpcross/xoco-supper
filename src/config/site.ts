import { categories, categorySlug } from "./categories";

export const siteConfig = {
  name: "Supper",
  tagline: "Cooked twice, then written down",
  title: "Supper - An Astro recipe and food blog theme for one cook",
  description:
    "An Astro food blog theme built around recipes: scalable ingredient lists, a numbered method you can tick off, weeknight dinners, long Sunday cooks, baking, and the writing in between.",
  siteUrl: "https://supper.xocoweb.workers.dev",
  authorName: "Andrei Alba",
  email: "hello@example.com",
  language: "en",
  dateLocale: "en-US",
  locale: "en_US",
  socialImage: "/og-image.png",
  /**
   * The publication's logo in structured data. It has to be a raster file in
   * `public/`, so the favicon cannot stand in for it — point this at a real
   * wordmark before launch. The share card is the default only because it is
   * the one raster asset the theme ships.
   */
  publisherLogo: "/og-image.png",
  /** Short bio shown in the footer and under the About page header. */
  bio: "Recipes for a kitchen with one oven and one good pan. Written after cooking each of them enough times to know where they go wrong.",
  /**
   * The byline that fronts the About page. `name` has to match the
   * `author.name` used in post frontmatter: the block links to that author's
   * archive and is skipped entirely when the name has no published posts.
   *
   * The theme ships as a single-cook site, which is why there is no
   * contributors index — the About page and this byline are the whole masthead.
   * Adding a second name to a post's `coauthors` still works everywhere.
   */
  editor: {
    name: "Delphine Roy",
    title: "Who cooks it",
    /** Shown under the byline on the About page. Falls back to a generic line. */
    bio: "Delphine cooks everything here at least three times before it gets written down, which is how the house rule got set: say what the technique is for, name the step people skip, and be honest about what it keeps like on day three.",
  },
  /**
   * Feeds. Alongside `/rss.xml` for everything, every section gets its own feed
   * at `<its page>rss.xml`, linked from the page it belongs to.
   *
   * `fullContent` puts the rendered article in the feed, and on a recipe it
   * also writes the ingredient list out ahead of the body — see
   * `src/lib/feeds.ts` — so a subscriber can shop from their inbox.
   */
  rss: {
    fullContent: true,
    /** Items per feed, newest first. */
    limit: 20,
  },
  newsletter: {
    enabled: false,
    action: "",
    method: "post",
    emailFieldName: "email",
    title: "One dinner a week, on Thursday.",
    description:
      "A single recipe you can shop for on the way home, plus whatever I got wrong the first time. No spam, unsubscribe anytime.",
    terms: "By subscribing you agree to our Terms of Use and Privacy Policy.",
  },
  contact: {
    enabled: false,
    action: "",
    method: "post",
    office: ["14 Rue des Halles", "Montreal QC H2Y 1A1"],
    responseTime: "Usually within two business days.",
  },
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "TikTok", href: "https://www.tiktok.com" },
    { label: "RSS", href: "/rss.xml" },
  ],
};

export const categoryNavigation = categories.map((category) => ({
  label: category,
  href: `/category/${categorySlug(category)}/`,
}));

/**
 * The three links set in the header bar itself, to the left of the wordmark on
 * a desktop. Everything else lives in the menu. Keep it to three or four: the
 * bar has to hold them beside a centred wordmark at 1024px.
 *
 * The item marked `mega` opens the recipes panel — every cooking section on
 * the cover of its newest recipe, beside `recipesPanelLinks` — and stays an
 * ordinary link to its `href` with scripting off. See `SiteHeader.astro`.
 */
export const primaryNavigation: { label: string; href: string; mega?: boolean }[] = [
  { label: "Recipes", href: "/posts/", mega: true },
  { label: "Field Notes", href: "/category/field-notes/" },
  { label: "About", href: "/about/" },
];

/** The lead column of the recipes panel, before the section tiles. */
export const recipesPanelLinks = [
  { label: "All recipes", href: "/posts/" },
  { label: "Under half an hour", href: "/tag/under-30/" },
  { label: "Saved recipes", href: "/saved/" },
];

/**
 * The non-section routes, listed under "The site" in the menu. Sections come
 * from `categoryNavigation` above, and the story-layout examples are derived
 * from the posts themselves — see `SiteDrawer.astro`.
 */
export const secondaryNavigation = [
  { label: "All recipes", href: "/posts/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
  { label: "Search", href: "/search/" },
  { label: "Saved", href: "/saved/" },
];

export const footerNavigation = [
  {
    title: "Sections",
    links: categoryNavigation,
  },
  {
    title: "Browse",
    links: [
      { label: "All recipes", href: "/posts/" },
      { label: "Search", href: "/search/" },
      { label: "Saved", href: "/saved/" },
      { label: "RSS", href: "/rss.xml" },
    ],
  },
  {
    title: "The site",
    links: [
      { label: "About", href: "/about/" },
      { label: "Contact", href: "/contact/" },
      { label: "Privacy", href: "/privacy/" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];
