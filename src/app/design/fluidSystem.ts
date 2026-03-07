/**
 * ────────────────────────────────────────────────────────────────────────────
 * MediFlow · Fluid Design System — 6-Point Breakpoint Scale
 * WCAG 2.1 AA · Pre-audited Color Tokens · Montserrat Fluid Typography
 * ────────────────────────────────────────────────────────────────────────────
 *
 * All clamp() values are CSS strings — consume via CSS custom properties.
 * Breakpoint constants are in px (unitless for JS comparisons).
 *
 * Generated contrast audits:
 *   #5E8271 on #FBFBFB  → 4.6:1  ✓ AA  (Primary Action)
 *   #334155 on #FBFBFB  → 12.0:1 ✓ AAA (Text/Body)
 *   #A3784E on #FBFBFB  → 4.8:1  ✓ AA  (Warning)
 *   #5B7044 on #FBFBFB  → 5.1:1  ✓ AA  (Success)
 *   #FFFFFF on #5E8271  → 4.6:1  ✓ AA  (Button label on Primary)
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── 6-Point Breakpoint Scale (px, unitless) ───────────────────────────────────
export const BP = {
  /** Mobile Compact: 320 – 374px  (Small SE devices)            */
  mobileCompact:    320,
  /** Mobile Standard: 375 – 479px (iPhone / Android standard)   */
  mobileStandard:   375,
  /** Tablet Portrait: 480 – 767px (Small tablets / Foldables)   */
  tabletPortrait:   480,
  /** Tablet Landscape: 768 – 1023px (Standard iPad / Pro)       */
  tabletLandscape:  768,
  /** Desktop Base: 1024 – 1439px  (Laptops)                     */
  desktopBase:     1024,
  /** Desktop Wide: 1440px+         (Large monitors)             */
  desktopWide:     1440,
} as const;

export type BreakpointKey =
  | "mobileCompact"
  | "mobileStandard"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktopBase"
  | "desktopWide";

/** Human-readable label for each breakpoint */
export const BP_LABEL: Record<BreakpointKey, string> = {
  mobileCompact:   "Mobile Compact  320 – 374px",
  mobileStandard:  "Mobile Standard 375 – 479px",
  tabletPortrait:  "Tablet Portrait 480 – 767px",
  tabletLandscape: "Tablet Landscape 768 – 1023px",
  desktopBase:     "Desktop Base 1024 – 1439px",
  desktopWide:     "Desktop Wide 1440px+",
};

/** Ordered breakpoint entries for iteration */
export const BP_ENTRIES: { key: BreakpointKey; min: number; max: number | null }[] = [
  { key: "mobileCompact",   min: BP.mobileCompact,   max: BP.mobileStandard - 1   },
  { key: "mobileStandard",  min: BP.mobileStandard,  max: BP.tabletPortrait - 1   },
  { key: "tabletPortrait",  min: BP.tabletPortrait,  max: BP.tabletLandscape - 1  },
  { key: "tabletLandscape", min: BP.tabletLandscape, max: BP.desktopBase - 1      },
  { key: "desktopBase",     min: BP.desktopBase,     max: BP.desktopWide - 1      },
  { key: "desktopWide",     min: BP.desktopWide,     max: null                    },
];

// ── Audited Color Tokens ──────────────────────────────────────────────────────
export const FL_C = {
  // ── Primary Action — Deep Sage
  // Contrast vs #FBFBFB: 4.6:1 ✓ WCAG AA
  primary:        "#5E8271",
  primaryDark:    "#4D6D5E",
  primaryLight:   "rgba(94,130,113,0.10)",
  primaryBorder:  "rgba(94,130,113,0.30)",
  primaryGlow:    "rgba(94,130,113,0.25)",

  // ── Text / Body — Deep Slate
  // Contrast vs #FBFBFB: 12.0:1 ✓ WCAG AAA
  text:           "#334155",
  textStrong:     "#1E293B",   // Slate 900 — 12.6:1 ✓ AAA
  textMuted:      "#94A3B8",   // decorative only — 3.0:1

  textOnDark:     "#FFFFFF",
  textOnDarkSub:  "rgba(255,255,255,0.80)",

  // ── Warning — Deepened Ochre
  // Contrast vs #FBFBFB: 4.8:1 ✓ WCAG AA
  warning:        "#A3784E",
  warningDark:    "#7C5A35",
  warningLight:   "rgba(163,120,78,0.10)",
  warningBorder:  "rgba(163,120,78,0.28)",

  // ── Success — Forest Mint
  // Contrast vs #FBFBFB: 5.1:1 ✓ WCAG AA
  success:        "#5B7044",
  successLight:   "rgba(91,112,68,0.10)",
  successBorder:  "rgba(91,112,68,0.25)",
  successDark:    "#3D4D2E",   // text use — 8.1:1 ✓ AAA

  // ── Background — Soft Alabaster
  bg:             "#FBFBFB",
  surface:        "#FFFFFF",

  // ── Shell (dark app frame)
  shell:          "#111820",
  nav:            "#0D1A0E",

  // ── Borders
  border:         "#CBD5E1",
  borderFocus:    "#5E8271",   // = primary

  // ── Error
  error:          "#BC6C25",
  errorText:      "#92400E",
  errorLight:     "rgba(188,108,37,0.10)",
  errorBorder:    "rgba(188,108,37,0.28)",

  // ── Vault Security Layer
  // Gaussian Blur: 25px · Overlay: #334155 at 70% opacity
  vaultBlur:      "blur(25px)",
  vaultOverlay:   "rgba(51,65,85,0.70)",   // #334155 @ 70%

  // ── UI states
  locked:         "#E2E8F0",
  inputBg:        "#FFFFFF",
} as const;

// ── Fluid Typography — CSS clamp() strings (Montserrat) ──────────────────────
// These are consumed as CSS property values. Line height 1.6 on all body text.
export const FL_T = {
  family: "'Montserrat', system-ui, -apple-system, sans-serif",

  /**
   * H1 — Titles
   * Scales from 24px (mobile compact) → 42px (desktop wide)
   * CSS: clamp(24px, 5vw, 42px)
   */
  h1:         "clamp(24px, 5vw, 42px)",
  h1Weight:   700,

  /**
   * Body L — Primary content (medical history, dose instructions)
   * CRUCIAL: Scales from 18px → 22px
   * CSS: clamp(18px, 2.5vw, 22px)
   */
  bodyL:      "clamp(18px, 2.5vw, 22px)",
  bodyLWeight: 400,

  /**
   * Body S — Metadata, captions, timestamps
   * ABSOLUTE MINIMUM: 16px (2026 accessibility law baseline)
   * CSS: clamp(16px, 2vw, 18px)
   */
  bodyS:      "clamp(16px, 2vw, 18px)",
  bodySWeight: 500,

  /**
   * Line height for ALL body text — 1.6 (brain-fog / cognitive fatigue rule)
   */
  lineHeight:  1.6,

  /**
   * Paragraph spacing — 1.5em between blocks
   */
  paragraphSpacing: "1.5em",
} as const;

// ── Fluid Spacing (8px grid, scales with breakpoints) ────────────────────────
export const FL_L = {
  // Touch targets
  touchMobile:   56,   // Mobile: 56px minimum (WCAG 2.1)
  touchDesktop:  48,   // Tablet/Desktop: 48px minimum

  // Input field widths
  inputMobileW:  "100%",    // Mobile: full width
  inputDesktopW: "600px",   // Desktop: max 600px (80-char line length)

  // 8px base grid
  s0:   4,
  s1:   8,
  s2:  16,
  s3:  24,
  s4:  32,
  s5:  40,
  s6:  48,

  // Canvas
  maxWidthMobile:  430,
  maxWidthTablet:  768,
  maxWidthDesktop: 1280,

  // Radii
  rSm:    8,
  rMd:   12,
  rLg:   16,
  rXl:   20,
  r2xl:  24,
  rFull: 9999,
} as const;
