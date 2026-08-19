/**
 * Token-sourced chart values for module-scope ECharts config.
 *
 * `useChartTheme` covers components; this covers the constants that several
 * chart files declare at module scope, where a hook cannot run. Both read the
 * same CSS custom properties, so there is still one source of truth.
 *
 * Why this exists: the chart layer had accumulated a parallel palette in raw
 * literals — `rgba(143,92,177,…)` (the marketing site's purple, 23 uses) and
 * `rgba(13,9,22,…)` (a dark tooltip ground) — none of which move with the
 * admin's own gold/graphite tokens or with the light theme.
 *
 * These are functions, not constants: they must be evaluated at render time,
 * after the theme class is on <html>. Calling them at module scope would
 * freeze the first theme's values.
 */

const FALLBACK: Record<string, string> = {
  "--foreground": "42 18% 92%",
  "--muted-foreground": "43 12% 58%",
  "--border": "220 10% 24%",
  "--card": "225 13% 9%",
  "--primary": "43 67% 52%",
  "--success": "160 84% 39%",
  "--warning": "38 92% 50%",
  "--danger": "0 72% 51%",
  "--info": "217 91% 60%",
  "--chart-1": "43 74% 49%",
  "--chart-2": "160 84% 39%",
  "--chart-3": "38 92% 50%",
  "--chart-4": "193 58% 46%",
  "--chart-5": "350 67% 56%",
};

/** Raw HSL triplet for a token, e.g. `43 74% 49%`. */
function raw(name: string): string {
  if (typeof window === "undefined") return FALLBACK[name] ?? "0 0% 50%";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || FALLBACK[name] || "0 0% 50%";
}

/** Token as an `hsl()` colour, optionally with alpha. */
export function token(name: string, alpha?: number): string {
  const t = raw(name);
  return alpha === undefined ? `hsl(${t})` : `hsl(${t} / ${alpha})`;
}

/** The categorical series ramp, in order. */
export function chartSeries(): string[] {
  return [1, 2, 3, 4, 5].map((i) => token(`--chart-${i}`));
}

/** Shared tooltip styling — replaces the per-file `TOOLTIP_STYLE` constants. */
export function chartTooltip() {
  return {
    backgroundColor: token("--card"),
    borderColor: token("--border"),
    borderWidth: 1,
    padding: [12, 16] as [number, number],
    textStyle: {
      color: token("--foreground"),
      fontSize: 12,
      fontFamily: "inherit",
    },
    extraCssText:
      "box-shadow: 0 8px 32px hsl(0 0% 0% / 0.35); border-radius: 12px;",
  };
}

/** Axis label styling. */
export function chartAxisLabel() {
  return {
    color: token("--muted-foreground"),
    fontSize: 12,
    fontFamily: "inherit",
  };
}

/** Dashed split lines — a wash over the surface, so alpha rather than a token. */
export function chartSplitLine() {
  return {
    lineStyle: { color: token("--border", 0.45), type: "dashed" as const },
  };
}

/** A soft tint of the brand colour, for area fills and hover grounds. */
export function chartTint(alpha: number): string {
  return token("--primary", alpha);
}
