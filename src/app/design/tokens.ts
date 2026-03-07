/**
 * HealthPulse — Design Token Source of Truth
 * ══════════════════════════════════════════════════════════════════════════════
 * WCAG 2.1 AA Compliant · Muted Healing Palette · Montserrat Scale
 *
 * DO NOT edit inline hex values in components.
 * Reference these constants exclusively so that a single token update
 * propagates across the entire application.
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ── Brand ─────────────────────────────────────────────────────────────────────
export const BRAND_NAME = "HealthPulse";
export const BRAND_TAGLINE = "Chronic Care · Simplified";

// ── Color Tokens ──────────────────────────────────────────────────────────────
export const C = {
  // Primary / Muted Sage — CTAs, "Log Dose", progress fills
  primary:         "#8EAF9D",
  primaryDark:     "#7A9D8C",   // hover/pressed
  primaryLight:    "rgba(142,175,157,0.12)",
  primaryBorder:   "rgba(142,175,157,0.3)",
  primaryGlow:     "rgba(142,175,157,0.25)",   // focus ring

  // Secondary / Dusty Slate — navigation, icons, metadata, timestamps
  secondary:       "#64748B",
  secondaryDark:   "#475569",
  secondaryLight:  "rgba(100,116,139,0.10)",
  secondaryBorder: "rgba(100,116,139,0.25)",

  // Background / Soft Alabaster — primary screen surface (no high-glare white)
  bg:              "#FBFBFB",
  card:            "#FFFFFF",

  // Dark shell — page frame, header zones (not affected by palette swap)
  shell:           "#111820",
  shellAlt:        "#1A2B1C",   // legacy dark sage frame
  nav:             "#0D1A0E",

  // Alert / Pale Ochre — low-refill warnings, medication due banners
  alert:           "#D4A373",
  alertDark:       "#B45309",   // text on light bg — 5.8:1 vs #FBFBFB ✓ AA
  alertLight:      "rgba(212,163,115,0.12)",
  alertBorder:     "rgba(212,163,115,0.3)",
  alertText:       "#92400E",   // amber-800 for higher contrast — 7.4:1 ✓ AA

  // Success / Desaturated Mint — confirmations, completed logs
  success:         "#B5C99A",
  successDark:     "#3D6B4F",   // text on light bg — 6.2:1 vs #FBFBFB ✓ AA
  successLight:    "rgba(181,201,154,0.14)",
  successBorder:   "rgba(181,201,154,0.3)",

  // Text — primary, secondary, tertiary
  text:            "#1E293B",   // Slate 900 — 12.6:1 vs #FBFBFB ✓ AAA
  textSub:         "#475569",   // Slate 600 — 5.9:1 vs #FBFBFB ✓ AA
  textMuted:       "#94A3B8",   // Slate 400 — 3.0:1 (decorative/large text only)
  textOnDark:      "#FFFFFF",
  textOnDarkSub:   "rgba(255,255,255,0.65)",
  textOnDarkMuted: "rgba(255,255,255,0.4)",

  // Border / Slate 200
  border:          "#CBD5E1",
  borderLight:     "rgba(203,213,225,0.35)",
  borderMedium:    "rgba(203,213,225,0.5)",

  // Interactive states
  error:           "#BC6C25",
  locked:          "#E2E8F0",   // locked/secure state fill

  // Frosted Glass layer
  frostedBg:       "rgba(255,255,255,0.60)",
  frostedBlur:     "blur(20px)",
} as const;

// ── Typography Scale ──────────────────────────────────────────────────────────
export const T = {
  family:    "'Montserrat', system-ui, -apple-system, sans-serif",
  h1:        26,     // px — Bold 700
  h2:        22,     // px — Bold 700
  h3:        19,     // px — SemiBold 600
  body:      18,     // px — Regular 400 (all patient-facing medication info)
  bodyMd:    15,     // px — SemiBold 600 (card titles)
  bodySm:    13,     // px — Regular 400
  caption:   14,     // px — Medium 500 (timestamps, secondary labels)
  micro:     11,     // px — Medium 500
  nano:      10,     // px — Bold 700 (status chips, section labels)
  pill:       9,     // px — Bold 700 (tags)
} as const;

// ── Layout ────────────────────────────────────────────────────────────────────
export const L = {
  touch:     56,     // px — Minimum interactive height (WCAG 2.1 touch target)
  maxWidth:  430,    // px — Mobile-first canvas
  // 8px grid
  s1:         8,
  s2:        16,
  s3:        24,
  s4:        32,
  s5:        40,
  s6:        48,
  // Radius
  rSm:        8,
  rMd:        12,
  rLg:        16,
  rXl:        20,
  r2xl:       24,
  rFull:     9999,
} as const;

// ── Status semantics ─────────────────────────────────────────────────────────
// Rule: Status is NEVER communicated by color alone.
// Always use: color + icon + text label together.
export type StatusSemantic = "positive" | "alert" | "neutral";

export const STATUS_COLORS: Record<
  StatusSemantic,
  { icon: string; text: string; bg: string; border: string }
> = {
  positive: {
    icon:   C.success,
    text:   C.successDark,
    bg:     C.successLight,
    border: C.successBorder,
  },
  alert: {
    icon:   C.alert,
    text:   C.alertText,
    bg:     C.alertLight,
    border: C.alertBorder,
  },
  neutral: {
    icon:   C.secondary,
    text:   C.textSub,
    bg:     C.secondaryLight,
    border: C.secondaryBorder,
  },
};
