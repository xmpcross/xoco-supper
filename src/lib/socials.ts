/**
 * Which mark a `siteConfig.socials` label gets.
 *
 * Every brand SVG the theme bundles is listed here, so a label the theme has
 * artwork for can never quietly fall through to the generic link glyph — which
 * is what happened to Pinterest before this map was completed. Keep the two in
 * step: adding an SVG to `src/icons/bootstrap` and registering it in
 * `LocalIcon.astro` is only two thirds of the job.
 *
 * Matching is by exact label, so the aliases below cover the spellings a
 * publication is likely to type.
 */
const socialIconByLabel = {
  Bluesky: "bluesky",
  Email: "envelope",
  Facebook: "facebook",
  Instagram: "instagram",
  LinkedIn: "linkedin",
  Mastodon: "mastodon",
  Pinterest: "pinterest",
  Reddit: "reddit",
  RSS: "rss",
  Telegram: "telegram",
  Threads: "threads",
  TikTok: "tiktok",
  Twitter: "twitter-x",
  WhatsApp: "whatsapp",
  X: "twitter-x",
  YouTube: "youtube",
} as const;

export type SocialIconName =
  (typeof socialIconByLabel)[keyof typeof socialIconByLabel] | "link-45deg";

/**
 * Falls back to a generic link glyph for labels the theme has no mark for —
 * a Substack, a personal site, anything self-hosted. The fallback is a real
 * answer for those, and a bug for anything in the map above.
 */
export const socialIconFor = (label: string): SocialIconName =>
  socialIconByLabel[label as keyof typeof socialIconByLabel] ?? "link-45deg";
