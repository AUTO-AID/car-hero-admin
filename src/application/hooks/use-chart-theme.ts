"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Chart theming, sourced from the design tokens.
 *
 * This hook used to carry its own hex palette in parallel to `globals.css`.
 * It switched correctly on theme, but the values were a second source of
 * truth: `--chart-1`..`--chart-5` were defined in CSS and referenced zero
 * times anywhere, while charts painted `#8b5cf6` / `#06b6d4` — hues that are
 * not in the product's palette at all. Reading the tokens at runtime collapses
 * the two sources into one, so retuning the brand in CSS moves the charts too.
 *
 * Tokens hold bare HSL triplets (`43 74% 49%`), so they are wrapped here.
 * The read happens in an effect, not during render: next-themes puts the theme
 * class on <html> outside React's commit, so reading earlier returns the
 * previous theme's values.
 */

const FALLBACK = {
  foreground: "hsl(42 18% 92%)",
  mutedForeground: "hsl(43 12% 58%)",
  border: "hsl(220 10% 24%)",
  card: "hsl(225 13% 9%)",
  primary: "hsl(43 67% 52%)",
  success: "hsl(160 84% 39%)",
  warning: "hsl(38 92% 50%)",
  danger: "hsl(0 72% 51%)",
  info: "hsl(217 91% 60%)",
  series: [
    "hsl(43 74% 49%)",
    "hsl(160 84% 39%)",
    "hsl(38 92% 50%)",
    "hsl(193 58% 46%)",
    "hsl(350 67% 56%)",
  ],
};

type Palette = typeof FALLBACK;

function readTokens(): Palette {
  if (typeof window === "undefined") return FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const hsl = (name: string, fallback: string) => {
    const raw = cs.getPropertyValue(name).trim();
    return raw ? `hsl(${raw})` : fallback;
  };

  return {
    foreground: hsl("--foreground", FALLBACK.foreground),
    mutedForeground: hsl("--muted-foreground", FALLBACK.mutedForeground),
    border: hsl("--border", FALLBACK.border),
    card: hsl("--card", FALLBACK.card),
    primary: hsl("--primary", FALLBACK.primary),
    success: hsl("--success", FALLBACK.success),
    warning: hsl("--warning", FALLBACK.warning),
    danger: hsl("--danger", FALLBACK.danger),
    info: hsl("--info", FALLBACK.info),
    series: [1, 2, 3, 4, 5].map((i, idx) =>
      hsl(`--chart-${i}`, FALLBACK.series[idx]),
    ),
  };
}

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const [palette, setPalette] = useState<Palette>(FALLBACK);

  useEffect(() => {
    setPalette(readTokens());
  }, [resolvedTheme]);

  return useMemo(() => {
    // Grid lines are the one value with no token: they are a wash over the
    // surface rather than a colour in the palette.
    const gridLine = isLight
      ? "hsl(220 10% 24% / 0.18)"
      : "hsl(0 0% 100% / 0.07)";

    const colors = {
      text: palette.foreground,
      muted: palette.mutedForeground,
      axis: palette.mutedForeground,
      grid: gridLine,
      tooltipBg: palette.card,
      tooltipBorder: palette.border,
      tooltipTitle: palette.foreground,
      cardBorder: palette.card,
      primary: palette.primary,
      success: palette.success,
      warning: palette.warning,
      danger: palette.danger,
      info: palette.info,
      /** Categorical ramp — consume in order; don't hand-pick a hue per chart. */
      series: palette.series,
    };

    return {
      key: `${isLight ? "light" : "dark"}-${palette.primary}`,
      isLight,
      colors,
      /** Spread onto an ECharts option so every chart shares one series ramp. */
      color: palette.series,
      tooltip: {
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: [8, 12] as [number, number],
        textStyle: { color: colors.text, fontSize: 12, fontFamily: "inherit" },
        extraCssText: isLight
          ? "box-shadow: 0 10px 26px hsl(220 10% 10% / 0.12); border-radius: 12px;"
          : "box-shadow: 0 8px 32px hsl(0 0% 0% / 0.5); border-radius: 12px;",
      },
      axisLabel: { color: colors.axis, fontSize: 12, fontFamily: "inherit" },
      splitLine: { lineStyle: { color: colors.grid, type: "dashed" as const } },
    };
  }, [isLight, palette]);
}
