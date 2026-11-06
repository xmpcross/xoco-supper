import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext, GetStaticPaths } from "astro";
import { categoryMeta } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { feedCustomData, feedItems } from "@/lib/feeds";
import { categories, categorySlug, getByCategory, visiblePosts, type Category } from "@/lib/posts";

/** One feed per section, so a reader can take Motorsport without Road Trips. */
export const getStaticPaths = (async () => {
  const allPosts = visiblePosts(await getCollection("posts"));

  return categories.map((category) => ({
    params: { category: categorySlug(category) },
    props: { category, posts: getByCategory(allPosts, category) },
  }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { category, posts } = context.props as {
    category: Category;
    posts: Awaited<ReturnType<typeof getCollection<"posts">>>;
  };

  return rss({
    title: `${category} - ${siteConfig.name}`,
    description: categoryMeta[category].description,
    site: context.site ?? siteConfig.siteUrl,
    items: await feedItems(posts.slice(0, siteConfig.rss.limit)),
    customData: feedCustomData,
    trailingSlash: true,
  });
}
