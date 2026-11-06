import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { siteConfig } from "@/config/site";
import { feedCustomData, feedItems } from "@/lib/feeds";
import { visiblePosts } from "@/lib/posts";

export async function GET(context: APIContext) {
  const posts = visiblePosts(await getCollection("posts")).slice(0, siteConfig.rss.limit);

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: await feedItems(posts),
    customData: feedCustomData,
    trailingSlash: true,
  });
}
