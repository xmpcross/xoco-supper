import { getCollection } from "astro:content";
import { searchItems } from "@/lib/search";

export async function GET() {
  const index = await searchItems(await getCollection("posts"));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
