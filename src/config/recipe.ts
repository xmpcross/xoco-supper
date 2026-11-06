/**
 * The recipe system. Every number a recipe prints — the time strip, the
 * difficulty band, the scaled ingredient amounts — reads from this file, so a
 * publication can change how cooking is described without touching a component.
 *
 * Recipes belong to cooking sections only. The schema in
 * `src/content.config.ts` refuses a `recipe` block on any post filed under
 * `NOTES_CATEGORY` in `src/config/categories.ts`.
 */

export const difficulties = ["Easy", "Medium", "Project"] as const;

export type Difficulty = (typeof difficulties)[number];

/**
 * What each band actually promises the cook. Printed under the word itself, so
 * "Medium" never has to be guessed at — it is the honest disqualifier for
 * someone with twenty minutes and one pan.
 */
export const difficultyMeta: Record<Difficulty, string> = {
  Easy: "One pan, no technique to learn first.",
  Medium: "A few moving parts, or something that needs watching.",
  Project: "A whole afternoon, and worth clearing it.",
};

/**
 * "25 min", "1 hr", "1 hr 20 min". Written out rather than punctuated, because
 * the strip is read at a glance and `1:20` in a kitchen reads as a clock.
 */
export const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return "None";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
};

/**
 * The vulgar fractions a kitchen actually uses, and the only ones the scaler
 * will print. Anything that does not land on one of these is rounded to two
 * decimals instead — a made-up ⅐ is worse than `0.14`.
 */
const fractions: [number, string][] = [
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [7 / 8, "⅞"],
];

/** Ingredient amounts are only ever printed through this. */
export const formatQuantity = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "";

  const whole = Math.floor(value + 1e-9);
  const remainder = value - whole;

  if (remainder < 0.02) return String(whole);

  const match = fractions.find(([fraction]) => Math.abs(remainder - fraction) < 0.02);
  if (!match) return Number(value.toFixed(2)).toString();

  return whole === 0 ? match[1] : `${whole}${match[1]}`;
};

/**
 * How far a cook may scale a recipe. Doubling and halving are safe for almost
 * everything; past that the pan is wrong, the roasting time changes, and the
 * recipe as written stops being the recipe. So the stepper stops.
 */
export const SERVINGS_MIN_FACTOR = 0.5;
export const SERVINGS_MAX_FACTOR = 3;

export const clampServings = (servings: number, base: number) =>
  Math.min(
    Math.max(Math.round(servings), Math.max(1, Math.ceil(base * SERVINGS_MIN_FACTOR))),
    Math.round(base * SERVINGS_MAX_FACTOR),
  );

/** One line of an ingredient list, as the schema and the components see it. */
export interface IngredientItem {
  /** Absent on "flaky salt" and "a handful of basil". */
  quantity?: number;
  /** "cups", "tablespoons", "cloves". Absent on countable things. */
  unit?: string;
  item: string;
  /** The item at any quantity but one. "lemons" beside "lemon". */
  plural?: string;
  /** "smashed", "at room temperature", "to taste". Never scaled, never an amount. */
  note?: string;
  /**
   * Amounts that must not move when the recipe is scaled — a tin, a sheet pan,
   * a pinch. Set it and the number is printed as written.
   */
  fixed?: boolean;
}

/**
 * An ingredient line as running text, for the places that cannot render the
 * pieces separately: the printed card, the search index, structured data.
 */
export const ingredientText = (item: IngredientItem, factor = 1) => {
  const scaled =
    item.quantity === undefined ? undefined : item.fixed ? item.quantity : item.quantity * factor;
  const amount = scaled === undefined ? "" : formatQuantity(scaled);
  const measure = [amount, item.unit].filter(Boolean).join(" ");
  const line = [measure, ingredientNoun(item, scaled)].filter(Boolean).join(" ");
  return item.note ? `${line}, ${item.note}` : line;
};

/**
 * The item, pluralised if it needs to be. A unit already carries the plural —
 * "3 tbsp olive oil" — so this only ever swaps on a countable thing, and only
 * when the author supplied the other form.
 */
export const ingredientNoun = (item: IngredientItem, quantity?: number) => {
  if (!item.plural || item.unit) return item.item;
  return quantity !== undefined && Math.abs(quantity - 1) > 0.001 ? item.plural : item.item;
};

/** ISO 8601 duration, for `prepTime` and `cookTime` in structured data. */
export const isoDuration = (minutes: number) => {
  if (minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours > 0 ? `${hours}H` : ""}${rest > 0 ? `${rest}M` : ""}`;
};

/* ==========================================================================
   Metric and US customary
   --------------------------------------------------------------------------
   A recipe is written once, in whatever the cook measures in, and read in both
   kitchens. Amounts are stored as a number and a unit, so converting them is
   arithmetic rather than parsing — the same reason the servings stepper works.

   Two rules keep it honest. A converted amount is rounded to a fraction a
   kitchen owns (an eighth of a pound, a quarter of a cup) rather than printed
   to two decimals, and spoons are left alone: a US tablespoon and a metric one
   differ by 1.4%, which is under the precision of the spoon itself.

   The conversion is display-only. Feeds, structured data, and the search index
   all keep the published units.
   ========================================================================== */

export const unitSystems = ["metric", "us"] as const;

export type UnitSystem = (typeof unitSystems)[number];

/* "Imperial" is what a reader calls the other column, so it is what the button
   says. The amounts under it are US customary, which is the difference that
   matters in a kitchen: an imperial pint is 568 ml and a US one is 473. */
export const UNIT_SYSTEM_LABELS: Record<UnitSystem, string> = {
  metric: "Metric",
  us: "Imperial",
};

/** The unit a recipe is written in, and so the one the toggle opens on. */
export const DEFAULT_UNIT_SYSTEM: UnitSystem = "metric";

interface UnitRule {
  /** Applies below this many of the source unit. The last rule has no bound. */
  under?: number;
  to: string;
  /** The plural of `to`, where it has one. */
  toPlural?: string;
  factor: number;
  /** Rounded to the nearest of this, so the result prints as a real fraction. */
  step: number;
}

/**
 * How each unit is spelled in the other kitchen. Ordered small to large: grams
 * become ounces until there are enough of them to be pounds, millilitres become
 * teaspoons, then fluid ounces, then cups.
 */
const conversions: Record<string, UnitRule[]> = {
  g: [
    { under: 454, to: "oz", factor: 1 / 28.3495, step: 0.25 },
    { to: "lb", factor: 1 / 453.592, step: 0.125 },
  ],
  kg: [{ to: "lb", factor: 2.20462, step: 0.125 }],
  ml: [
    { under: 15, to: "tsp", factor: 1 / 4.92892, step: 0.25 },
    { under: 240, to: "fl oz", factor: 1 / 29.5735, step: 0.25 },
    { to: "cup", toPlural: "cups", factor: 1 / 236.588, step: 0.125 },
  ],
  l: [{ to: "cup", toPlural: "cups", factor: 4.22675, step: 0.25 }],
  cm: [{ to: "in", factor: 1 / 2.54, step: 0.25 }],
  oz: [{ to: "g", factor: 28.3495, step: 5 }],
  lb: [
    { under: 2, to: "g", factor: 453.592, step: 5 },
    { to: "kg", factor: 0.453592, step: 0.05 },
  ],
  cup: [{ to: "ml", factor: 236.588, step: 5 }],
  cups: [{ to: "ml", factor: 236.588, step: 5 }],
  "fl oz": [{ to: "ml", factor: 29.5735, step: 5 }],
  in: [{ to: "cm", factor: 2.54, step: 0.5 }],
  inch: [{ to: "cm", factor: 2.54, step: 0.5 }],
};

const systems: Record<UnitSystem, string[]> = {
  metric: ["g", "kg", "ml", "l", "cm"],
  us: ["oz", "lb", "cup", "cups", "fl oz", "in", "inch"],
};

/** Undefined for a unit that belongs to both kitchens, such as a spoon. */
export const unitSystemOf = (unit?: string): UnitSystem | undefined => {
  if (!unit) return undefined;
  const key = unit.trim().toLowerCase();
  return unitSystems.find((system) => systems[system].includes(key));
};

export interface Measure {
  quantity: number;
  unit?: string;
}

/**
 * One amount, read in the other kitchen. A unit already in the requested system
 * — or in neither, like a tablespoon — is handed back untouched, so a list can
 * be run through this whatever it was written in.
 */
export const convertMeasure = (
  quantity: number,
  unit: string | undefined,
  system: UnitSystem,
): Measure => {
  const from = unitSystemOf(unit);
  if (!unit || !from || from === system) return { quantity, unit };

  const rules = conversions[unit.trim().toLowerCase()];
  const rule = rules?.find(
    (candidate) => candidate.under === undefined || quantity < candidate.under,
  );
  if (!rule) return { quantity, unit };

  const converted = Math.round((quantity * rule.factor) / rule.step) * rule.step;
  const plural = rule.toPlural && Math.abs(converted - 1) > 0.001 ? rule.toPlural : rule.to;
  return { quantity: converted, unit: plural };
};

/**
 * The amounts a recipe writes into a sentence rather than into a field: the
 * oven, and the odd "3cm thick" in a step. Everywhere else the theme converts
 * a number it was handed; this is the one place it reads one out of prose, so
 * the patterns are deliberately narrow — a figure and a unit, joined or with a
 * single space, and nothing else.
 *
 * An oven is rounded to the marks the dial has: 25°F in one kitchen, 5°C in the
 * other. 220C prints as 425F rather than 428F, which is what the recipe would
 * have said had it been written there.
 */
const OVEN_MIN_C = 120;
const OVEN_MIN_F = 250;

const toFahrenheit = (celsius: number) => {
  const exact = celsius * 1.8 + 32;
  return celsius >= OVEN_MIN_C ? Math.round(exact / 25) * 25 : Math.round(exact);
};

const toCelsius = (fahrenheit: number) => {
  const exact = (fahrenheit - 32) / 1.8;
  return fahrenheit >= OVEN_MIN_F ? Math.round(exact / 5) * 5 : Math.round(exact);
};

const measurePattern = /(\d+(?:[.,]\d+)?)\s?(kg|g|ml|l|cm|lb|oz|in)\b/gi;

/** One run of prose, read in the other kitchen. */
export const convertText = (text: string, system: UnitSystem) => {
  const temperatures =
    system === "us"
      ? text.replace(
          /\b(\d{2,3})\s?°?\s?C\b/g,
          (_, value: string) => `${toFahrenheit(Number(value))}F`,
        )
      : text.replace(
          /\b(\d{2,3})\s?°?\s?F\b/g,
          (_, value: string) => `${toCelsius(Number(value))}C`,
        );

  return temperatures.replace(measurePattern, (whole, value: string, unit: string) => {
    const measure = convertMeasure(Number(value.replace(",", ".")), unit.toLowerCase(), system);
    return measure.unit === unit.toLowerCase()
      ? whole
      : `${formatQuantity(measure.quantity)} ${measure.unit}`;
  });
};

/** Where the reader's choice of units is remembered, per browser. */
export const UNITS_STORAGE_KEY = "supper:units";

/** That choice, or the published units when they have not made one. */
export const storedUnitSystem = (): UnitSystem => {
  try {
    const stored = localStorage.getItem(UNITS_STORAGE_KEY) as UnitSystem | null;
    return stored && unitSystems.includes(stored) ? stored : DEFAULT_UNIT_SYSTEM;
  } catch {
    return DEFAULT_UNIT_SYSTEM;
  }
};

/** Fired on `document` whenever the reader switches kitchens. */
export const UNITS_EVENT = "supper:units-change";
