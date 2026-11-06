import { getImage } from "astro:assets";
import { bylineShort, postHref, visiblePosts, type Post } from "@/lib/posts";
import { postMinutes } from "@/lib/recipes";

/**
 * One story as the client-side surfaces see it. The command palette, the
 * results page, the reading list, and the archive filters all read this shape
 * from `/search-index.json`, so a field added here reaches every one of them
 * at once and none can drift from the others.
 */
export interface SearchItem {
  title: string;
  excerpt: string;
  href: string;
  category: string;
  author: string;
  tags: string[];
  /** The cover, cut to the site's tall ratio, for a row built in the browser. */
  cover: string;
  /** Hands-on plus oven time, on recipes only. Absent on the writing. */
  minutes?: number;
  /** "Easy", "Medium", "Project". Recipes only. */
  difficulty?: string;
}

export const searchItem = async (post: Post): Promise<SearchItem> => {
  const minutes = postMinutes(post);
  const cover = await getImage({
    src: post.data.cover.src,
    width: 720,
    height: 900,
    fit: "cover",
    format: "webp",
  });

  return {
    title: post.data.title,
    excerpt: post.data.excerpt,
    href: postHref(post),
    category: post.data.category,
    author: bylineShort(post),
    /* The ingredients a recipe is looked up by, alongside its own tags: someone
       searching "anchovy" is shopping, not browsing a taxonomy. */
    tags: Array.from(new Set([...post.data.tags, ...post.data.keyIngredients])),
    cover: cover.src,
    /* Omitted rather than nulled, so the index stays small and the results page
       can test for them the same way every server-rendered card does. */
    ...(minutes === undefined ? {} : { minutes }),
    ...(post.data.recipe ? { difficulty: post.data.recipe.difficulty } : {}),
  };
};

export const searchItems = (posts: Post[]): Promise<SearchItem[]> =>
  Promise.all(visiblePosts(posts).map(searchItem));
