import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext, GetStaticPaths } from "astro";
import { authorBio } from "@/config/authors";
import { siteConfig } from "@/config/site";
import { feedCustomData, feedItems } from "@/lib/feeds";
import { getAllAuthors, visiblePosts, type Post } from "@/lib/posts";

/** One feed per contributor, so a reader can follow a byline across sections. */
export const getStaticPaths = (async () => {
  const allPosts = visiblePosts(await getCollection("posts"));

  return getAllAuthors(allPosts).map((author) => ({
    params: { author: author.slug },
    props: { author },
  }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { author } = context.props as {
    author: { name: string; role: string; posts: Post[] };
  };

  return rss({
    title: `${author.name} - ${siteConfig.name}`,
    description:
      authorBio(author.name) || `Stories by ${author.name}, ${author.role}, on ${siteConfig.name}.`,
    site: context.site ?? siteConfig.siteUrl,
    items: await feedItems(author.posts.slice(0, siteConfig.rss.limit)),
    customData: feedCustomData,
    trailingSlash: true,
  });
}
