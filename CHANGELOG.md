# Changelog

All notable changes to Supper are documented here.

## 1.0.1 - 2026-10-21

- Updated Astro to 7.4.1 and other dependencies.
- Updated `AGENTS.md` for Astro 7.
- Files check out with LF line endings on every platform.
- Fixed the theme name in the license title.
- Removed the Credits section from the README.

## 1.0.0 - 2026-09-08

- Initial commercial release.
- Astro 7 recipe and food-blog theme with static front page, article, archive, section, tag, author, search, saved, about, contact, privacy, RSS, robots, sitemap, and 404 routes.
- Markdown and MDX content collections with frontmatter validated at build time — title, excerpt, section, dates, bylines, tags, key ingredients, cover with alt text and photo credit, opening layout, and the trending, editor's-pick, featured, and draft flags. A bad field fails the build instead of shipping.
- Recipes are ordinary posts with a `recipe` block added: servings, yield, prep, cook and resting time, difficulty, grouped ingredients, a numbered method, cook's notes, storage, and required equipment. Optional in every cooking section and refused in the reading one, so an essay can never grow an ingredient list.
- Ingredient amounts stored as `quantity` + `unit` + `item` rather than as a sentence, so the servings stepper scales them exactly and prints kitchen fractions rather than decimals. A `fixed` flag holds a tin size or a pinch still when the rest is doubled.
- A metric and imperial switch beside the stepper, converting the shopping list, the oven temperatures, and the measurements written into the method, the cook's notes, and the article prose. The choice is remembered per browser.
- Tickable ingredients and steps with no JavaScript — real checkboxes and a sibling selector.
- A print sheet aimed at the one page people genuinely print: chrome removed, the picture sized to the paper, ingredient groups and steps kept whole across page breaks, links printing their destinations, and amounts at whatever scale the reader left the stepper on.
- Four article openings set per post — `standard`, `banner`, `cover`, `immersive` — sharing one title block, so only the placement and scale of the cover change. Share, save, and print sit together under the byline.
- A front page dealt from the archive with no repeats: an edge-to-edge featured recipe under a transparent header, a section rail, a dense grid of covers, a rail of recipes done in half an hour derived from their own cook times, the writing as dark cards, a tinted band over the ones cooked on repeat, and a ranked chart beside the sweet section. Every block hides itself when it has nothing to show.
- A one-bar masthead: three links, a centred wordmark, and Search, Saved, and Menu. Recipes opens a full-width panel carrying every cooking section on the cover of its newest recipe; Menu opens a focus-trapped drawer laid out as a contents page.
- Archive, section, tag, and author pages built from one entry — section, cook time, headline, standfirst, cover — as a four-across card grid or an image-led list, set per section. Cook time appears on every surface a recipe reaches, and there is no read-time estimate anywhere.
- A Filters button on the archive and section pages opening a dialog of three dropdowns — section, time, effort — that work across the whole archive from the search index, with the state kept in the URL.
- Client-side search over a statically generated JSON index with no service and no API key, shared by a keyboard palette (`/` or `⌘K`) and a results page, ranked in tiers and matched on word starts. Ingredients are indexed alongside tags, so searching "anchovy" finds the recipes that use it.
- Saved recipes: a per-browser reading list from any article, read back at `/saved/`, with a bookmark in the header that grows a dot once the list is not empty. No accounts and no backend.
- Feeds for the whole site, for each section, and for each author, carrying full article content. A recipe's item opens with its yield, its times, and its whole ingredient list, so a subscriber can shop from their inbox.
- Canonical URLs, sitemap, `robots.txt`, Open Graph, Twitter/X cards, and JSON-LD in one module — `Recipe` with `recipeYield`, times, `recipeIngredient`, addressable `HowToStep` instructions and `HowToTool` equipment, `Article` with linked `Person` bylines, a `BreadcrumbList` on every article, and `WebSite` with a search action the site answers. Share cards are cropped from each cover at build time.
- Sections, navigation, the recipe scale, the cook's byline, and SEO defaults in four config files, so the site can be renamed and re-scoped without touching a component.
- Provider-neutral newsletter and contact forms, both shipping disabled and saying so in the UI.
- Static output with no framework islands; JavaScript only for search, the drawer, the filters, the servings stepper, the units switch, and the progress bar. Motion is CSS-only and flattens under `prefers-reduced-motion`.
- Two self-hosted typefaces with no external font requests — Young Serif for headlines and Figtree for everything else — and a local Bootstrap Icons set with its license notice.
- Skip link, landmarks, labelled controls, visible focus states, and one tab stop per archive entry.
- Thirty-one demo posts — twenty-six recipes across six cooking sections and five field notes — with Unsplash cover photography credited in frontmatter. Two are `.mdx`, carrying a wide figure and a lightbox gallery so both content components ship demonstrated.
