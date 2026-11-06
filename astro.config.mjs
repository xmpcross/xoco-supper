// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/site.ts";
import { codeThemes, codeDefaultColor } from "./src/config/code.ts";

const shikiConfig = /** @type {const} */ ({
  themes: codeThemes,
  defaultColor: codeDefaultColor,
});

export default defineConfig({
  site: siteConfig.siteUrl,
  integrations: [
    mdx(),
    sitemap({
      /* The search page is noindex, and the feeds and search index are data
         endpoints rather than pages a crawler should list. */
      filter: (page) =>
        page !== new URL("/search/", siteConfig.siteUrl).toString() &&
        !page.endsWith("rss.xml") &&
        !page.endsWith("search-index.json"),
    }),
  ],
  markdown: {
    shikiConfig,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
