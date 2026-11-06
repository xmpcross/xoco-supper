# Customization Guide

Use this guide when adapting Supper for a real food blog.

## Site Settings

Edit [src/config/site.ts](./src/config/site.ts) first. It controls the site name, tagline, default metadata, canonical domain, language and date locale, the cook's byline, contact details, social links, feed settings, newsletter form settings, and navigation labels.

Update `siteConfig.siteUrl` before building for production. Canonical URLs, social image URLs, RSS, robots, sitemap, and JSON-LD all depend on it, and [astro.config.mjs](./astro.config.mjs) reads it from there rather than duplicating it.

## One Cook, or More

Supper ships as a single-cook site. `siteConfig.editor` names the person who fronts the About page, and [src/config/authors.ts](./src/config/authors.ts) holds their portrait, keyed by the `author.name` used in post frontmatter. `siteConfig.editor.name` has to match that name, or the About page skips the block entirely.

Nothing in the theme assumes there is only one, though. The byline, the avatar, the per-author archive at `/author/<name>/`, the per-author feed, and the `coauthors` array in frontmatter all keep working the moment a second name appears — add a portrait to `authorProfiles` and it is picked up everywhere. A name with no entry falls back to a monogram avatar rather than breaking.

What the theme does not ship is a contributors index page, because with one cook it would be a list of one. If you grow a masthead, add a `/author/index.astro` that maps over `getAllAuthors()` and link it from `secondaryNavigation`.

## Sections

Sections (the content model still calls them categories) live in one place: [src/config/categories.ts](./src/config/categories.ts). Add, remove, or rename them there, then update demo posts so every `category` frontmatter value still matches the allowed list.

One section is special. `NOTES_CATEGORY` names the section that carries writing rather than cooking — `"Field Notes"` out of the box. A `recipe` block in a post filed there fails the build with a message saying so, which is what keeps a time strip and a "jump to the ingredients" button off an essay that has neither. `recipeCategories` is everything else, and the front page's recipe-only blocks read from it.

The `categoryLayouts` map in the same file controls how each section archive presents its posts. Every section uses one of two layouts:

- `grid` uses the tall-card grid — the same grid as the front page, four cards to a row on a laptop and five above `96rem`.
- `list` uses the archive ledger, one image-led row per post.

Change a section's value in the map to switch its layout; no route or component duplication is required.

There is no lead-story layout, and that is deliberate. The track here runs the full width of the window, so a lead would have to crop a 4:5 cover into a banner two thousand pixels wide and upscale it to get there — which is exactly what a photograph does not survive. A section page is a list of dishes; the front page is the one with an argument to make.

`categorySlug` derives URLs from the section name, lowercasing it and turning spaces and ampersands into hyphens — so `Small Plates` becomes `/category/small-plates/`.

The recipes panel in the header, the site menu, the footer, the section rail on the front page, and the section dropdown in the archive filters are all generated from that same list. You do not edit navigation labels or URLs separately unless you customize the layout components.

`categoryMeta` carries two strings per section: `description`, printed under the section heading and used in its metadata, and `blurb`, a short line held in reserve for compact surfaces.

## Recipes

A post outside the reading section can carry a `recipe` block. When it does, the article grows four blocks — the brief, the ingredients, the method, and the cook's notes — and the post carries its cook time everywhere it appears: the front page hero, all four card variants, ledger rows, the ranked list, search results, and the article's own header.

It is optional in every cooking section, so a technique piece can run under Baking without anyone having to shop for it.

```yaml
category: "Greens"
recipe:
  servings: 4 # the stepper scales against this
  yields: "A generous side for four" # what actually comes out of the pan
  prepMinutes: 15
  cookMinutes: 35
  restMinutes: 720 # optional; time the cook is not in the kitchen
  restNote: "Overnight in the fridge, salted." # optional; what the rest is for
  difficulty: "Easy" # Easy | Medium | Project
  equipment: # optional
    - "A 23 x 33 cm metal baking tray"
  ingredients: # at least one group
    - heading: "For the carrots" # omit on a single-group list
      items:
        - { quantity: 800, unit: "g", item: "carrots", note: "halved lengthways if thick" }
        - { item: "flaky salt" } # no quantity: printed as written
        - { quantity: 1, item: "tin", fixed: true } # never scaled
  steps: # at least one
    - heading: "Get the tray hot first" # optional
      body: "Heat the oven to 220C with an empty tray inside it."
  notes: # optional
    - "Preheating the tray is worth the two minutes it costs."
  keeps: "Two days, but assemble only to serve." # optional
```

Four behaviours to know:

**The stepper says what it serves, and nothing else.** The label is `Serves 6` at every scale — no second word announcing that the numbers moved. Once the count differs from the published `servings` it takes the accent colour, which is the quietest way to say the amounts below are no longer the printed ones.

**Amounts are numbers, not sentences.** `quantity` + `unit` + `item` is what makes the servings stepper trustworthy: the script multiplies `quantity`, leaves `unit` and `item` alone, and never has to parse `3/4 cup` out of a string. Writing `item: "3/4 cup water"` will render, but the stepper will not be able to scale it.

**`fixed: true` holds an amount still.** Doubling a cake does not give you two tins, and a pinch is a pinch at any scale. Set the flag and the number prints as written whatever the stepper says.

**A note must never contain an amount.** This is the one rule that is easy to break and impossible for the scaler to rescue. `note` is free text, so `{ quantity: 1, item: "head of broccoli", note: "about 500g" }` reads correctly at the published scale and is simply wrong the moment a reader triples it — one head is still "about 500g" on screen while the count says three. Put the amount in `quantity` and `unit`, or leave it out. Ratios and settings are safe, because they stay true at any scale: "20% fat", "at 28C", "roughly 1% of the bird's weight".

**The total does not include resting.** `activeMinutes()` in [src/lib/recipes.ts](./src/lib/recipes.ts) is prep plus cook. Resting is stated separately, in words, under the total — a loaf that proves overnight is not a fourteen-hour recipe, and a card that says so chases away the cook it was written for.

**Plurals come from `plural`.** The stepper scales the number, so a countable ingredient needs both forms or it reads `2 lemon` once doubled. Give it `{ quantity: 1, item: "lemon", plural: "lemons" }` and the noun swaps with the number. A line with a `unit` never needs it — "3 tbsp olive oil" is already correct — so most of a list has nothing to add.

Difficulty bands, time formatting, the vulgar fractions the scaler will print, and the limits of the stepper all live in [src/config/recipe.ts](./src/config/recipe.ts):

```ts
export const difficulties = ["Easy", "Medium", "Project"] as const;

export const difficultyMeta: Record<Difficulty, string> = {
  Easy: "One pan, no technique to learn first.",
  // …one honest line per band
};

export const SERVINGS_MIN_FACTOR = 0.5;
export const SERVINGS_MAX_FACTOR = 3;
```

The stepper stops at half and triple deliberately. Past that the pan is wrong, the roasting time changes, and the recipe as written stops being the recipe.

`formatQuantity()` prints eighths, quarters, thirds, halves, and their combinations as real fractions (`¾`, `1½`, `⅔`). Anything that does not land on one of those rounds to two decimals instead, because an invented `⅐` is worse than `0.14`.

## Metric and Imperial

A recipe is written once, in whatever the cook measures in, and read in both kitchens. The switch beside the servings stepper converts the page rather than the content: the shopping list, the oven temperatures, and the measurements written into the method, the cook's notes, and the article prose. Feeds, structured data, and the search index all keep the published units.

The button says Imperial because that is what a reader calls the other column; the amounts under it are US customary, which is the difference that matters in a kitchen — an imperial pint is 568 ml and a US one is 473. `UNIT_SYSTEM_LABELS` carries the wording if you would rather it said US.

It converts in both directions, so a site writing in cups and ounces gets the metric half for free. `DEFAULT_UNIT_SYSTEM` in [src/config/recipe.ts](./src/config/recipe.ts) names the units the recipes are written in and the one the page opens on; a reader's choice is remembered per browser under `supper:units`.

Three things are worth knowing:

**Amounts land on fractions a kitchen owns.** A converted amount is rounded to the nearest eighth of a pound or quarter of an ounce before it is printed, so 350 g reads `12¼ oz` rather than `12.35 oz`. The table of units, factors, and rounding steps is `conversions` in the same file — add a unit by adding a row.

**Spoons are left alone.** A US tablespoon and a metric one differ by 1.4%, which is under the precision of the spoon itself. A unit belonging to neither system is handed back untouched, which is also what happens to `2 eggs`.

**Prose is read for amounts in one narrow place.** Everywhere else the theme converts a number it was handed. Inside the blocks marked `data-units-text` — the method, the cook's notes, and the article body — it also reads a figure and a unit out of a sentence, so `3cm thick` and `220C` move too. Ovens round to the marks the dial has: 25°F in one kitchen, 5°C in the other, so 220C prints as 425F. That runtime is [src/components/recipe/UnitsText.astro](./src/components/recipe/UnitsText.astro), and it runs only on a page carrying the switch — a field note mentioning 500 g of pasta is never rewritten under a reader with no way to switch it back.

## The Article Blocks

The four article blocks are [src/components/recipe/RecipeBrief.astro](./src/components/recipe/RecipeBrief.astro), [RecipeIngredients.astro](./src/components/recipe/RecipeIngredients.astro), [RecipeMethod.astro](./src/components/recipe/RecipeMethod.astro), and [RecipeNotes.astro](./src/components/recipe/RecipeNotes.astro), wired up in [src/pages/post/\[slug\].astro](./src/pages/post/[slug].astro). Only the ingredients block runs any JavaScript, and only for the stepper and the units switch — ticking a line off or finishing a step is a checkbox and a sibling selector, so both work before the page has finished loading and keep working if the script never runs.

Full-content feeds open a recipe with its yield, its times, and its whole ingredient list, since none of that is in the article body — see [src/lib/feeds.ts](./src/lib/feeds.ts). A subscriber can shop from their inbox.

## Front Page Blocks

The front page is assembled in [src/pages/index.astro](./src/pages/index.astro) from independent blocks, each of which takes the next slice of the archive so nothing repeats:

| Block                        | Component                     | Draws from                                                                    |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Hero                         | `HeroBoard`                   | the post flagged `featured` as a full-width cover, then the next four as type |
| Cook by section              | `CollectionTiles`             | the newest cover in each section                                              |
| Fresh from the kitchen       | `PostCard` (`tall`)           | the next ten recipes                                                          |
| On the table in half an hour | `PostCard` (`tall`) in a rail | recipes at or under 30 minutes, quickest first                                |
| Worth reading first          | `NoteCard`                    | the reading section                                                           |
| Before dinner                | `PostCard` (`plate`)          | the small-plates section                                                      |
| Cooked on repeat             | band + `PostCard` rail        | `editorsPick: true` over the whole archive                                    |
| Most cooked                  | `RankedList`                  | `trending: true` over the whole archive                                       |
| Something sweet              | `TrendingColumns` (`stack`)   | the sweet section, in the column beside Most cooked                           |

Three blocks deliberately draw from the whole archive again, and each is a _criterion_ rather than a position: the quick rail is "done inside half an hour", the on-repeat rail is "flagged in frontmatter", the ranked list is "most cooked". A recipe qualifying for one of those while also running further up the page is the right answer — somebody who came looking for something fast should find it in the fast row.

The hero runs edge to edge and starts under a transparent header — the same `has-overlay-header` treatment the `immersive` article opening uses, set on `<body>` by `index.astro`. The bar scrolls away with the photograph and comes back solid when the reader scrolls up.

Reorder, drop, or duplicate blocks freely; each one hides itself when it has no posts to show.

The default arrangement consumes twenty-five posts before the criterion-driven blocks start repeating, and the bundled demo archive holds thirty-one. A smaller archive simply drops the blocks it cannot fill; a larger one gets deeper `slice()` calls at the top of `index.astro`.

The three picture grids carry `grid-tall--flush`, which drops the last part-filled row rather than leaving one or two cards hanging under a full one — so a block dealt ten recipes shows ten at five columns, eight at four, and nine at three. See [Theme Tokens](#theme-tokens) for how it is written, and take the modifier off a block that must show everything it is given.

The quick rail is worth one note: its cutoff is the `limit` argument to `quickRecipes()` in [src/lib/recipes.ts](./src/lib/recipes.ts), and the heading in `index.astro` names the same number. Change one and change the other.

One image on the front page is not a post cover and lives in `src/assets/images/home`: the band artwork behind "Cooked on repeat". Replace it.

The page closes on the ranked list and the sweet column rather than on a call to action. The newsletter is in the footer of every page already, and asking a second time on the same screen reads as a site that wants something rather than one that has something.

## Cards

Four card variants come out of [src/components/PostCard.astro](./src/components/PostCard.astro):

| Variant   | Shape                                               | Used by                                    |
| --------- | --------------------------------------------------- | ------------------------------------------ |
| `tall`    | 4:5 cover, the title, then the cook time            | the default; front page grids and rails    |
| `plate`   | a round cover and a centred title, nothing else     | "Before dinner", where the row is labelled |
| `feature` | 4:3 cover above the section tag and title           | available for wider, less dense rows       |
| `media`   | landscape thumbnail beside the title and standfirst | list-shaped rows                           |

The `tall` card is deliberately spare: the picture, the headline, and the number of minutes. A post with no `recipe` block has no minutes, so it prints its section there instead. Nothing sits between the cover and the title — a card in a grid of eight has one job, which is to make the dish legible from across the page.

[NoteCard.astro](./src/components/NoteCard.astro) is deliberately not a `PostCard` variant. A field note has no cook time, no ingredients, and nothing to shop for, so putting it in the same frame as a recipe would promise a reader something the page cannot deliver. Its `badge` prop is the kind of writing — "Note", "Guide", "Kit" — not the section, and the front page passes one per position.

## Rails

`.rail` is the horizontal scroll container used by the section tiles, the quick recipes, and the on-repeat row. It is a grid rather than a flex row, because `grid-auto-columns` sizes every card off the track width in one declaration and there is no flex-basis arithmetic to keep in step with the gap.

The scrollbar is hidden. A native horizontal scrollbar under a row of food photography is the loudest thing in the block, and it is chrome rather than content — so the paging job moves to [src/components/RailNav.astro](./src/components/RailNav.astro):

```astro
<SectionHeader title="On the table in half an hour" href="/tag/under-30/">
  <RailNav rail="rail-quick" label="the quick recipes" />
</SectionHeader>
<div class="rail rail--bleed" id="rail-quick" role="group" aria-label="…" tabindex="0">
```

`RailNav` finds its track by `id`, so the pair can sit anywhere. Three things about where they sit and what they do:

**Beside the heading, not over the artwork.** Two buttons floating on a photograph cover the one thing the card is selling. The band's rail is the exception only because the band _is_ its heading, so its arrows ride in the band's own corner — pass `onImage` for the frosted treatment.

**No autoplay.** Nothing on this front page moves on its own; the hero is one static photograph for the same reason. A row that advances while a reader is looking at it is a row they have to chase.

**They hide themselves.** The buttons are rendered with `hidden` and revealed only when the track actually overflows, so a short archive never shows two controls that cannot do anything. Both directions wrap, and below `48rem` the pair is hidden entirely — a phone swipes, and at 390px the heading, the arrows, and the way out do not fit one line.

The track keeps `tabindex="0"` so the arrow keys can still move it, which is the only thing hiding the scrollbar would otherwise have cost. Change the card count per screen with `grid-auto-columns` on `.rail` in [src/styles/global.css](./src/styles/global.css).

## Newsletter

The newsletter form is provider-neutral. Configure it in `siteConfig.newsletter`:

```ts
newsletter: {
  enabled: true,
  action: "https://example.com/newsletter",
  method: "post",
  emailFieldName: "email",
}
```

The form submits only when `enabled` is `true` and `action` is non-empty. Otherwise the theme renders a clearly disabled preview. It appears once, in the footer of every page, from [src/components/SubscribeForm.astro](./src/components/SubscribeForm.astro), and `title` and `description` are the copy beside it. For production, connect the form to your email provider or replace `SubscribeForm.astro` with provider-specific markup.

## Contact Form

The contact form follows the same safe-default pattern. Configure `siteConfig.contact` with `enabled: true`, a form endpoint in `action`, and the appropriate method. Until then, every control is disabled and no visitor data can be submitted. Contact email, address lines, and response time also live in `siteConfig`.

The default email, address, and social links are presentation-friendly examples. Replace them with real details before production; contact and newsletter form submission remain disabled until real endpoints are explicitly enabled.

## Post Frontmatter

Every post is validated by the schema in [src/content.config.ts](./src/content.config.ts). Beyond the obvious fields, a few are worth knowing about:

- There is no read time, anywhere. A recipe is not read, it is cooked, and the number that matters is on the cook-time chip. `wordCount()` in [src/lib/posts.ts](./src/lib/posts.ts) survives only to fill `wordCount` in an article's structured data.
- `keyIngredients` is not printed anywhere. It feeds the search index and the article's structured-data keywords, so a reader searching "anchovy" finds the recipes that use it — see [Search](#search).
- `trending: true` promotes a post into the "Most cooked" list. Falls back to newest-first when too few posts are flagged.
- `editorsPick: true` promotes a recipe into the "Cooked on repeat" rail, with the same newest-first fallback.
- `featured: true` puts a post at the top of the front page as the full-width hero. The newest flagged post wins; with nothing flagged, the newest post stands in.
- `draft: true` hides a post from every listing, feed, search index, and route.
- `cover.showInPost: false` keeps the cover for cards, ledger thumbnails, and social images but omits it from the article itself, so a post can run as a text-only document.
- `updatedDate` renders an "Updated" line under the article body and drives `dateModified` in the article's JSON-LD.
- `storyLayout` picks the opening treatment for the article page. See [Article Openings](#article-openings).
- `recipe` turns a post into a recipe. Refused in the reading section. See [Recipes](#recipes).
- `coauthors` adds names to the byline. The lead `author` still owns the post and reads first.

## Article Openings

Every article opens with one of four treatments, set per post in frontmatter:

```yaml
storyLayout: "banner"
```

| Value       | Opening                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `standard`  | Headline first, then the cover inside the reading column. The default.     |
| `banner`    | An edge-to-edge cover strip, then the headline block beneath it.           |
| `cover`     | The headline set over the cover photograph, at a fixed height.             |
| `immersive` | The headline centred on a full-height cover, with the header laid over it. |

All four are rendered by [src/components/PostHero.astro](./src/components/PostHero.astro) and share one title block — [src/components/PostHeroHead.astro](./src/components/PostHeroHead.astro) — so the tag, cook time, headline, standfirst, and byline never move to a different place between them. Only the picture does.

`cover` and `immersive` both set the type on the photograph, and they differ in how much of the page the picture takes: `cover` runs edge to edge at a fixed height and leaves the top of the page to the header, while `immersive` fills the viewport and centres the title block in it. Immersive does one thing more: `BaseLayout` puts `has-overlay-header` on `<body>`, which lifts the header onto the artwork and stops it being sticky, so it scrolls away with the photograph.

A post with `cover.showInPost: false` cannot use a layout built around a picture, so `storyLayoutFor()` quietly falls it back to `standard`.

`standard` is the right default for a recipe: it puts the times and the brief within the first screen instead of below a full-height photograph. Save `immersive` for the writing.

The site menu lists one live example per layout, derived from the posts themselves rather than hand-listed.

## Site Menu

The header is one bar: three links on the left, the wordmark in the centre, and Search, Saved, and Menu on the right. The three links come from `primaryNavigation` in [src/config/site.ts](./src/config/site.ts) — keep it to three or four, since they share the bar with a centred wordmark at 1024px. On a phone the links go, and the bar is the wordmark and three icons.

Recipes is the item marked `mega`, and on a desktop it opens the recipes panel, rendered by [src/components/SiteHeader.astro](./src/components/SiteHeader.astro): every cooking section on the cover of its newest recipe, with its blurb from `categoryMeta` and a recipe count, beside a lead column of `recipesPanelLinks` from the same config file. A section with nothing published is left out, and the reading section has its own link in the bar. The panel opens on hover and on focus, closes on Escape, on scroll, or when focus leaves it, and on a touch screen the first tap opens it while the second follows the link. With scripting off, or below `64rem`, the item is an ordinary link to `/posts/`.

Everything else lives in the drawer that opens from Menu, rendered by [src/components/SiteDrawer.astro](./src/components/SiteDrawer.astro). It is laid out as a contents page: every section with its blurb (from `categoryMeta`) and its post count, then "Post layouts" — one live example per opening treatment, derived from the posts, so a treatment no post uses is simply absent — beside the site pages from `secondaryNavigation`. Add a route there and it appears under "The site" without touching a component.

While the drawer is open everything behind it is set `inert`, so the tab key and a screen reader both stay inside it, and Escape closes it.

## Archive Filters

The archive and every section page carry one Filters button under the header, rendered by [src/components/ArchiveFilters.astro](./src/components/ArchiveFilters.astro). It opens a dialog with three dropdowns and no labels beyond each one's first option: section, time, and effort. Time and effort filter the whole archive rather than the current page: the script reads `/search-index.json`, hides the server-rendered list and its pagination, and paints every match with the same row markup the search and saved pages use (`window.supperSearch.rowMarkup`). Their values live in the query string (`?time=under-30&effort=Easy`), so a filtered view can be linked to, and the button carries a count of how many are set. Section is a place rather than a filter: choosing another one goes to that section's page and carries the other two along. A section with no recipes, such as the reading section, shows only the section dropdown.

The time buckets and their wording are in the component; the effort options come from `difficulties` in [src/config/recipe.ts](./src/config/recipe.ts). The index carries `minutes`, `difficulty`, and a 720×900 `cover` URL for each post — see `searchItem` in [src/lib/search.ts](./src/lib/search.ts).

## Images

Posts keep images next to each Markdown file. Each cover needs useful alt text and a credit URL. Astro optimizes theme-controlled images during build, but it will never enlarge one, so the source sets the ceiling — supply covers at **2400px on the long edge**. A card in a grid never needs that much; the full-bleed hero does, because it runs the whole width of the window and a retina laptop asks for twice that again. Each cover is also cropped into that post's share card. See [Social Cards](#social-cards).

The bundled demo covers are 1400x1750, which is right for every card and rail on the site and short for the hero on a high-density screen. Replacing them is the first thing to do with real photography.

**Declared sizes are load-bearing.** Every framed image passes Astro a `sizes` attribute written from the actual column arithmetic — `calc(25vw - 24px)` is the four-column grid at `64rem`, gutters and gaps subtracted. That is what tells the browser which file to fetch, so a grid that changes its column count has to change the string with it: understate the width and the browser downloads a file too small and upscales it, which is the one image bug that looks like bad photography rather than a bug. `PostCard`, `NoteCard`, and `CollectionTiles` carry theirs; the grid and the rail are written to the same column widths above `64rem` so one string serves both.

Article media steps _slightly_ outside the reading column rather than leaping to the full track. `--reading-wide` (52rem, against `--reading` at 44rem) is the width a wide `<Figure>` and a `<Gallery>` take, and they share it so a post carrying both does not appear to change its margins halfway down. A figure at the full `--container` width is twice the measure it interrupts, which reads as a different page rather than as a picture in this one — raise the token if you disagree, but raise it for both.

**Shoot and crop tall.** Every cover on the site is cut to `--ratio-tall` (`4 / 5`) by the frames that matter — the section tiles, the reading cards, and all the front page grids and rails. A plate, a glass, a loaf on a board all fill a tall frame; a 16:9 cover throws away the half of the picture the food is in. The exceptions are the front page hero, which is sized by `min-height` rather than a ratio so a long headline lengthens it, the tiles in the header's recipes panel (`4 / 3`), the article's own `media--photo` (`3 / 2`), the ledger thumbnail, and the `feature` card (`4 / 3`).

The ratio is one token. Change `--ratio-tall` in [src/styles/global.css](./src/styles/global.css) and every tall frame on the site follows.

Because the crop is centred, avoid covers whose subject sits hard against the top or bottom edge — and on the hero, the tiles, and the reading cards, remember the scrim darkens the lower third, so a subject down there will be lost behind the headline.

## Print

A recipe is the one page on a food site somebody genuinely prints, so the print sheet is a real target rather than an afterthought. The rules are at the end of [src/styles/global.css](./src/styles/global.css) under `@media print`, and the Print control is [src/components/PrintButton.astro](./src/components/PrintButton.astro), which sits with Share and Save under the article byline. It renders hidden and is revealed by script, since a browser without JavaScript has its own print command and a button that cannot work is worse than no button.

What the sheet does: sets a 15mm page box and rebases the root to `11pt`, since the `--fs-*` scale is tuned for a viewport and prints large; removes the header, footer, drawer, dialogs, progress bar, the share, save and print controls, the stepper and the units switch, the rail arrows, the related-posts block, and any gallery; drops the tinted panel fills so a brief does not print as a grey box; keeps the brief, each ingredient group, each step, and the notes whole across page breaks; prints link destinations after their text in the prose; and centres each photograph at a 9cm cap so one prints and a page of thumbnails does not.

Every picture frame drops its aspect ratio first. On screen a cover is cropped to a fixed frame; on a sheet narrower than the layout it was cut for, a fixed frame crops the picture rather than shrinking it, so in print the photograph sizes itself and the frame follows.

The `cover` and `immersive` openings lay white type over the photograph, and nothing guarantees a picture behind text prints at all. Both flatten on paper: the cover becomes a plain block above the type, the title block goes back to ink, and the centred immersive head returns to the left edge.

A gallery is hidden rather than unrolled. It is a scroll container: it cannot be swiped on paper, its arrows do nothing, and its tiles run off the sheet. A wide figure is the one photograph a printed recipe is worth the ink for, and it drops its breakout so it fills the page column instead.

Amounts print at whatever scale the reader left the stepper on, which is the correct answer — they scaled it because that is the quantity they are cooking.

## Code Blocks

Fenced code blocks are highlighted at build time by Shiki using the theme pair in [src/config/code.ts](./src/config/code.ts). Only the light half is applied, since the theme has one colour mode. Change `codeThemes` to any [Shiki theme](https://shiki.style/themes) name to restyle code without touching a component.

A copy button is added to each block by a small script in [src/pages/post/\[slug\].astro](./src/pages/post/[slug].astro).

## Icons

Social and share icons are hosted locally in [src/icons/bootstrap](./src/icons/bootstrap) and rendered through [src/components/LocalIcon.astro](./src/components/LocalIcon.astro). Adding a network is three steps, and missing the third is the failure mode: drop its SVG in that folder, register it in the `icons` map in `LocalIcon.astro`, **and** map the `siteConfig.socials` label to that icon name in [src/lib/socials.ts](./src/lib/socials.ts). A label with no entry in that last map falls back to a generic link glyph — silently, and whether or not the artwork exists.

Every mark the theme bundles is already mapped, with aliases for the spellings you are likely to type (`X` and `Twitter` both resolve to the X mark). The labels that work out of the box: Bluesky, Email, Facebook, Instagram, LinkedIn, Mastodon, Pinterest, Reddit, RSS, Telegram, Threads, TikTok, Twitter, WhatsApp, X, YouTube. The fallback is the right answer for anything else — a Substack, a personal site — so `siteConfig.socials` accepts any label and any URL.

The bundled SVGs come from Bootstrap Icons and include their MIT license notice in the icon folder.

Editorial UI icons — arrows, chevron, search, bookmark, menu, close, calendar, clock, flame, bowl, plus, minus, check, printer — are drawn inline by [src/components/ui/Icon.astro](./src/components/ui/Icon.astro), so no icon font or sprite is requested. The last six are the recipe set.

## Pages

Core static pages live in [src/pages](./src/pages):

- `about.astro`
- `contact.astro`
- `privacy.astro`

Replace the starter copy with your own. The "house rules" on the About page are written directly in that file rather than in config, as is the credit under its photograph — if you replace `src/assets/images/about/the-kitchen.jpg`, update the `figcaption` beside it.

## Search

Supper includes static, client-side search with no database or hosted search service. The search field in [src/components/SiteHeader.astro](./src/components/SiteHeader.astro) opens a command palette, while [src/pages/search.astro](./src/pages/search.astro) provides the full `/search/?q=...` results page, rendered as archive ledger rows.

The palette stays empty until something is typed; the search page opens on the whole archive, newest first, and filters down as the query narrows.

Both read the same index and rank it with the same function, so a recipe cannot place differently depending on where it was searched from. The index shape is defined once in [src/lib/search.ts](./src/lib/search.ts) and served by [src/pages/search-index.json.ts](./src/pages/search-index.json.ts) as `/search-index.json`; it carries the title, excerpt, section, byline, tags, cook time, cover, and URL, but not the article body or the date — nothing on a listing prints one. Add a field there and both surfaces receive it.

One thing the index does that a magazine's would not: `keyIngredients` are merged into `tags`, so a search for "anchovy" or "tahini" finds the recipes that use them. Somebody typing an ingredient is shopping, not browsing a taxonomy.

The client half — loading the index, matching, ranking — lives in [src/components/SearchRuntime.astro](./src/components/SearchRuntime.astro), which the header renders once per page. Ranking runs in tiers: a title that starts with the query, then a title whose words all start with the query's words, then a title containing it, then a section, tag, or ingredient match, then a mention in the excerpt or byline. Every word typed has to land somewhere, so adding a word narrows the results rather than widening them, and matching on word starts means a half-typed "tom but" still reaches "Tomato Butter Pasta in Fifteen Minutes". Ties keep archive order, newest first.

The index is fetched the first time someone opens search rather than on page load, and a failed fetch falls back to a small seed of the newest posts already in the page. The search page's resting list is server-rendered, so it works with JavaScript off; clearing the field restores it.

Search can be opened from the header or with `Ctrl + K` on Windows and Linux, `Command + K` on macOS, or `/` while focus is outside a form control. Use the arrow keys to move through command-palette results and `Escape` to close it.

This approach is a good fit for a few hundred recipes and should remain comfortable around 1,000. Filtering that amount of metadata in the browser is inexpensive, and the command palette limits the number of rendered results. For a large archive, consider limiting or paginating the full search page, because a broad query can otherwise render many result rows at once.

For several thousand pages, full-body search, multilingual search, or richer filtering, consider replacing the built-in index with [Pagefind](https://pagefind.app/). Pagefind indexes the generated `dist` HTML after `astro build`, splits its static index into chunks, and does not require a search server. It is intentionally not a default dependency; adopting it means adding Pagefind to the build and deployment pipeline and connecting its API to the existing search interface.

Because the index is generated statically, newly published or edited recipes become searchable after the next site build.

## Saved Recipes

Readers can save a recipe from the save control beside Share — in the article header, where Print sits with them, and again at the foot of the article — and read the list back at `/saved/`, linked under "More" in the site menu. The list lives in that reader's browser (`localStorage`), so there are no accounts and nothing reaches a server; a saved recipe that is later unpublished simply drops off the list.

The store is [src/components/SavedRuntime.astro](./src/components/SavedRuntime.astro), the button is [src/components/SaveButton.astro](./src/components/SaveButton.astro), and the page is [src/pages/saved.astro](./src/pages/saved.astro), which renders rows from the same `/search-index.json` the search surfaces use. The buttons render hidden and are revealed by script, so a browser without JavaScript never sees a control that cannot work.

The header carries a bookmark beside search that links straight to `/saved/`, with a dot on it once the list is not empty. It is a link rather than a control, so it works with JavaScript off — the page it points at is the one that needs the script, and it says so itself.

Saving a post raises a toast in the bottom right — [src/components/SaveToast.astro](./src/components/SaveToast.astro). It exists for one sentence: the list lives in this browser. That is the only thing about the feature a reader cannot guess, and it is worth saying at the moment they first rely on it rather than leaving it on a page they may never open. It auto-dismisses after seven seconds, holds while the pointer or focus is on it so the button can be reached, closes on Escape, and drops its button once the list is empty. It is suppressed on `/saved/` itself, where the row disappearing is already the confirmation.

Both the dot and the toast are painted from an event rather than by polling: `SavedRuntime` fires `supper:saved-change` with `{ slug, saved, count }` on every add and removal. Listen to that for a counter, a sync, or a different confirmation entirely.

The toast says "Recipe" or "Note" rather than a generic word, and it reads that off the `kind` prop on the `SaveButton` that was pressed — so the store keeps dealing in slugs and never has to know what kind of post one belongs to.

The storage key is `supper:saved`. Change it if you fork the theme onto a domain that already used it. To drop the feature, remove the two `SaveButton` usages, the header bookmark, the `/saved/` page, and its entry in `secondaryNavigation`.

## Feeds

Every feed is built from [src/lib/feeds.ts](./src/lib/feeds.ts), so they all carry the same item shape:

- `/rss.xml` — everything
- `/category/<section>/rss.xml` — one per section
- `/author/<cook>/rss.xml` — one per author

The section and author feeds are advertised two ways: a `<link rel="alternate">` in the head of the page they belong to, so a reader's browser extension finds them, and a visible "Follow" control on the page itself.

Two settings in `siteConfig.rss`:

- `fullContent` puts the rendered article in the feed, so it can be read without leaving the reader app. Set it `false` to ship excerpts only.
- `limit` caps items per feed, newest first.

Full content is rendered through Astro's container, so an MDX post with `<Figure>` and `<Gallery>` in it reaches a reader as real markup instead of component syntax printed literally. On the way out, root-relative image and link paths are lifted onto `siteConfig.siteUrl`, and the lightbox buttons are unwrapped.

A recipe's item opens with a block the article body does not contain: the yield, the times, the difficulty, and the whole ingredient list in plain `<ul>` markup a mail client will honour, at the scale the recipe was written for. That is `recipeLead()`, and it is the reason a full-content feed is worth leaving on for a food site.

If a post cannot be rendered, it ships as its excerpt and the build prints a warning naming it. That warning is the only signal, so do not ignore it.

## Social Cards

Share cards are generated at build time from the images the site already has — there is no separate card image to draw per post. [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro) takes an imported image, crops it to the 1200x630 that Facebook, X, LinkedIn, and Slack all expect, and emits it as JPEG alongside `og:image:width`, `og:image:height`, and alt text.

- Articles use their own cover.
- Section, tag, and author pages use the newest cover on the page.
- Everything else falls back to `siteConfig.socialImage`, the one static card in `public/`.

Both dimensions are clamped to the source image, because Astro will not enlarge one — the 2400px covers asked for under [Images](#images) cover this with room to spare. And note the direction of the crop: covers here are tall, and a 1.91:1 card takes a horizontal band out of the middle. Check a few after changing your photography.

## Structured Data

Every JSON-LD graph the site emits is built in [src/lib/schema.ts](./src/lib/schema.ts).

- Ordinary pages carry `WebSite`, including a `SearchAction` for `/search/` and the site as an `Organization`.
- Articles carry `Article`, with the byline as `Person` nodes linked to their author archives, the section, tags, language, and word count. There is deliberately no `timeRequired`: it could only hold a reading estimate, and on a `Recipe` node every consumer reads that property as time in the kitchen — so the one value it could carry is the one it would be understood to mean least.
- A recipe carries `Recipe` instead, with `recipeYield` (both the sentence and the servings count), `prepTime`, `cookTime`, `totalTime`, every ingredient line in `recipeIngredient`, the method as numbered `HowToStep` nodes each pointing at its own `#step-n` anchor on the page, `HowToTool` entries for the equipment, and the ingredients merged into `keywords`. This is what earns a recipe card in a search result.
- Every article is followed by a `BreadcrumbList` of home, section, and headline. Each crumb is a link the page itself renders: the wordmark and the section tag under the headline.

Nothing is asserted here that the page does not also print, and the times and amounts are the published ones — a reader who scales a recipe in the browser is not rewriting the recipe.

`siteConfig.publisherLogo` is the logo in the `Organization` node. It has to be a raster file in `public/`, so the SVG favicon cannot stand in for it — point it at a real wordmark before launch.

## Theme Tokens

Global colours, typography, rules, focus styles, and motion live in [src/styles/global.css](./src/styles/global.css). Prefer editing tokens near the top of that file before changing individual components.

A few tokens carry more of the design than their names suggest:

- Nothing in the ramp is grey. `--n-0` through `--n-950` run from white down to a near-black with green in it, by way of a buttermilk tint, so a hairline sits in the same family as the ground it divides and a photograph of food never lands on a cold surface. Replacing the ramp with a neutral grey one will make every cover look slightly wrong before you can say why.
- `--background` is white and `--surface` is a step _darker_ — a buttermilk tint of the page. The step is deliberately small: what separates a panel from the page here is mostly its hairline, and `--surface` only has to stop a dense grid of cards looking unbuilt. If you warm `--background`, widen the gap to match or panels will disappear into it.
- `--sand` is the band ground: the front page's tinted strips and the newsletter panel. It is the one token deep enough to divide the page without a rule.
- `--accent` and `--accent-strong` are the brand, a spinach green. `--accent` is the darker of the two and is the one that carries text, because the fill weight lands just short of the contrast a link needs on white.
- `--done` is the second accent and it means exactly one thing: a ticked ingredient, a finished step. See [Colour](#colour).
- `--border` and `--border-strong` draw every rule in the layout — `--border-strong` is the one the ruled section headings, the dotted leaders, and the double rules under page headers use.
- `--ls-label` and `--fs-label` control the tracked capitals used for eyebrows, ingredient group headings, bylines, and dates. They set the texture of every block on the front page.
- `--scrim` is the gradient behind type laid over a cover photograph. It is warm rather than neutral, so it reads as shade on the food instead of as a grey filter over it, and it is a gradient so the top of the picture stays untouched.
- `--ratio-tall` is every tall frame on the site. See [Images](#images).
- The `--r-*` scale carries every corner, and it is near-square on purpose: `--r-sm` (3px) for buttons, chips, fields, and controls, `--r-xs` for section tags and tick boxes, `--r-md` (4px) for cards and images, `--r-lg` for the bands. `--r-full` is for avatars, dots, the round plate crop, and the two pills on the ingredients block. Set them all to `0` for a hard-edged variant, or raise them for a softer one, without touching a component.
- `--container` is effectively unbounded (`200rem`) and `--gutter` steps from `1rem` to `1.5rem`: the layout runs the full width of the window with a gutter, rather than sitting in a boxed column. Set `--container` to a width such as `88rem` to box it again.

Three layout helpers are worth knowing before writing new blocks:

- `.grid-tall` is the dense picture grid — two columns on a phone, three at `48rem`, then `--tall-cols`, which defaults to 4 above `64rem` and 5 above `96rem`. Add `--flush` and the last part-filled row comes off rather than hanging under a full one: a card that starts a row it cannot fill takes itself and everything after it off the page, at each column count in turn. It is written per count, so a grid setting its own `--tall-cols` needs its own rules, and a block that must show everything it is handed should not carry it.
- `.rail` is the horizontal scroll row. See [Rails](#rails).
- `.grid-columns` gives each child its own left rule and matching padding, for newspaper-style column sets. Set the desktop track count with `--cols`.

## Fonts

Supper self-hosts two typefaces, both OFL-licensed, with no external font requests:

- **[Young Serif](https://github.com/noirblancrouge/YoungSerif)** (`public/fonts/young-serif`) sets every headline through `--font-display`. It ships in one weight, so `--weight-display` and `--weight-title` are both `400` and nothing on the site asks the browser to embolden it — the scale does the work a bold would. It has no italic either, which is why the italic lines below are in the sans.
- **[Figtree](https://github.com/erikdkennedy/figtree)** (`public/fonts/figtree`) is a variable face that sets prose, metadata, controls, the italic lines, and the whole ingredient list through `--font-sans`, in upright and italic. A shopping list is read at arm's length in a kitchen, which is the argument for a face this plain carrying it.

The split is not decorative. Small figures stay in the sans even where the surrounding block is display type — the step numerals, the note marks, the cook-time chip — and so do the italic lines: the section blurbs in the tiles and the drawer. A synthesised slant or a synthesised bold is worse than a change of face. If you swap the display face for one with a full family, those can go back.

A soft serif wants different display metrics than a grotesque did, and the tokens carry that: `--ls-display` is only `-0.014em` because the serifs close up under tight tracking, and `--lh-display` is above 1 because the ascenders and descenders are longer. Loosen both further before you reach for a smaller size.

`--font-mono` is a system stack used only by code blocks and inline code; there is no monospaced UI, so no third file ships.

Sizes come from the `--fs-*` scale in `:root`, which steps up at the `48rem` and `64rem` breakpoints — change the scale there rather than per component. `--fs-d` is sized for a headline in its own column, not the full page width.

To swap typefaces, replace the `@font-face` rules and the `--font-display` / `--font-sans` tokens at the top of [src/styles/global.css](./src/styles/global.css), drop your files in `public/fonts`, and update the two `<link rel="preload">` tags in [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro).

## Colour

There is no dark mode, and that is a design decision rather than an omission: the page is white and every panel is a buttermilk tint of it, and a plate of food on a black page is somebody else's magazine. There is no `data-theme` attribute, no bootstrap script, and no flash to guard against.

There are two accents and they are not interchangeable.

**Spinach green is the brand.** Links, focus rings, section markers, ingredient group headings, step headings, ranked numerals, primary buttons. Four tokens do nearly all of it:

- `--accent` and `--accent-strong` — links, focus, markers, buttons, and their hover state.
- `--tag-background` and `--tag-foreground` — the section chip on cards, rows, and cover stories.

**Olive is a state, and the only one.** `--done` and `--done-strong` are a ticked ingredient and a finished step, and they appear nowhere else. That is what makes it worth having a second colour at all: a reader learns it once, on their first recipe, and it is true everywhere after that. If you change it, keep it distinct from `--accent` — the whole point is that a ticked line can never be confused with a highlighted one.

Changing `--accent` re-skins the theme. If you move it far from green, set the tag pair to match: the chip is meant to read as a pale tint of the accent, not as a third colour.

Adding a section to [src/config/categories.ts](./src/config/categories.ts) needs no styling work at all — every section is drawn the same way, because the label does the telling and the photograph does the rest.

## Motion

Motion runs in two layers, and they do not overlap.

Blocks at the top of a page are on screen before a scroll can happen, so they animate once on load: add the `opener` class to a wrapper and its direct children rise in with a short stagger, while any cover image inside settles from a slight oversize. It is already on page headers and article heads. The front page hero is deliberately not one: its photograph fills the top of the page, so a block that rose in would show the page behind it. The picture settles in place and only the copy fades.

Everything below the fold is scroll-driven through CSS view timelines — cards, rails, columns, and section rules animate as they enter, with no observer and no hidden state. A browser without view timelines simply renders the finished layout, except for elements carrying the `reveal` class, which fall back to a small IntersectionObserver in [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro). The fallback stays off wherever view timelines exist, so the two never both run.

`prefers-reduced-motion: reduce` flattens all of it.
