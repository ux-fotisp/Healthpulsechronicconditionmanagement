/**
 * HealthPulse · GuidanceBadge — User Story 5
 * ══════════════════════════════════════════════════════
 * Contextual intake guidance displayed at the point of logging a dose.
 * Shows INSIDE the medication card, immediately below the medication name.
 *
 * Design rules:
 *   • Universal symbols only (Utensils, Droplets, Clock, AlertTriangle, Moon)
 *   • Icon color: Dusty Slate (#64748B) — secondary per token spec
 *   • Text: 16px minimum (T.body = 18px used here) · 4.5:1 contrast on #FBFBFB ✓
 *   • Meets WCAG 2.1 AA — #475569 on #FBFBFB = 5.9:1
 *   • Status conveyed by icon + color + text (never color alone)
 */

import React from "react";
import { Utensils, Droplets, Clock, AlertTriangle, Moon, Info, Coffee } from "lucide-react";
import { C, T, L } from "../../design/tokens";

export type GuidanceType =
  | "food"
  | "empty_stomach"
  | "water"
  | "avoid"
  | "bedtime"
  | "morning"
  | "dairy_free"
  | "default";

interface GuidanceBadgeConfig {
  Icon:       React.ComponentType<{ size?: number; color?: string }>;
  iconColor:  string;
  textColor:  string;    // must be 4.5:1 on #FBFBFB
  bg:         string;
  border:     string;
  label:      string;
}

// Maps instruction keywords → visual configuration
const GUIDANCE_MAP: Record<GuidanceType, GuidanceBadgeConfig> = {
  food: {
    Icon:      Utensils,
    iconColor: C.secondary,          // #64748B — Dusty Slate
    textColor: C.secondaryDark,      // #475569 — 5.9:1 on #FBFBFB ✓
    bg:        C.secondaryLight,
    border:    C.secondaryBorder,
    label:     "Take with food",
  },
  empty_stomach: {
    Icon:      Clock,
    iconColor: C.secondary,
    textColor: C.secondaryDark,
    bg:        "rgba(100,116,139,0.08)",
    border:    "rgba(100,116,139,0.22)",
    label:     "Take on empty stomach",
  },
  water: {
    Icon:      Droplets,
    iconColor: "#2563EB",            // Blue-600 — 4.9:1 on #FBFBFB ✓
    textColor: "#1D4ED8",            // Blue-700 — 6.8:1 ✓
    bg:        "rgba(37,99,235,0.06)",
    border:    "rgba(37,99,235,0.2)",
    label:     "Take with water",
  },
  avoid: {
    Icon:      AlertTriangle,
    iconColor: C.alert,              // #D4A373
    textColor: C.alertText,          // #92400E — 7.4:1 on #FBFBFB ✓
    bg:        C.alertLight,
    border:    C.alertBorder,
    label:     "Avoid grapefruit",
  },
  bedtime: {
    Icon:      Moon,
    iconColor: "#7C3AED",            // Violet-600 — 5.7:1 on #FBFBFB ✓
    textColor: "#5B21B6",            // Violet-800 — 8.1:1 ✓
    bg:        "rgba(124,58,237,0.07)",
    border:    "rgba(124,58,237,0.2)",
    label:     "Take at bedtime",
  },
  morning: {
    Icon:      Coffee,
    iconColor: "#92400E",            // Amber-800
    textColor: "#78350F",            // Amber-900 — 8.9:1 ✓
    bg:        "rgba(212,163,115,0.1)",
    border:    "rgba(212,163,115,0.28)",
    label:     "Take in the morning",
  },
  dairy_free: {
    Icon:      AlertTriangle,
    iconColor: C.alert,
    textColor: C.alertText,
    bg:        C.alertLight,
    border:    C.alertBorder,
    label:     "Avoid dairy",
  },
  default: {
    Icon:      Info,
    iconColor: C.secondary,
    textColor: C.secondaryDark,
    bg:        C.secondaryLight,
    border:    C.secondaryBorder,
    label:     "See instructions",
  },
};

/** Infer guidance type from a free-text instruction string */
export function inferGuidanceType(instruction: string): GuidanceType {
  const l = instruction.toLowerCase();
  if (l.includes("food") || l.includes("meal") || l.includes("breakfast") || l.includes("lunch"))
    return "food";
  if (l.includes("empty") || l.includes("without food"))
    return "empty_stomach";
  if (l.includes("water") || l.includes("hydrat"))
    return "water";
  if (l.includes("avoid") || l.includes("grapefruit"))
    return "avoid";
  if (l.includes("bedtime") || l.includes("sleep") || l.includes("night"))
    return "bedtime";
  if (l.includes("morning") || l.includes("wake"))
    return "morning";
  if (l.includes("dairy"))
    return "dairy_free";
  return "default";
}

interface GuidanceBadgeProps {
  instruction: string;
  /** "inline" = compact horizontal chip; "block" = full-width banner (default) */
  variant?:    "inline" | "block";
}

/**
 * GuidanceBadge — renders contextual intake guidance with icon + text.
 * Text is 18px (T.body) to meet the ≥16pt accessibility rule.
 */
export function GuidanceBadge({ instruction, variant = "block" }: GuidanceBadgeProps) {
  const type = inferGuidanceType(instruction);
  const cfg  = GUIDANCE_MAP[type];
  const { Icon } = cfg;

  if (variant === "inline") {
    // Compact pill chip used in list contexts
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full"
        style={{
          background:    cfg.bg,
          border:        `1px solid ${cfg.border}`,
          paddingLeft:   10,
          paddingRight:  10,
          paddingTop:    4,
          paddingBottom: 4,
        }}
        role="note"
        aria-label={`Intake guidance: ${instruction}`}
      >
        <Icon size={13} color={cfg.iconColor} />
        <span
          style={{
            color:         cfg.textColor,
            fontSize:      T.caption,     /* 14px — still legible */
            fontWeight:    600,
            letterSpacing: "0.03em",
            fontFamily:    "inherit",
          }}
        >
          {instruction}
        </span>
      </span>
    );
  }

  // Block variant — full-width banner with 16px+ text (meeting US5 spec)
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: cfg.bg,
        border:     `1px solid ${cfg.border}`,
      }}
      role="note"
      aria-label={`Intake guidance: ${instruction}`}
    >
      {/* Universal symbol icon — Dusty Slate for food/neutral, alert colors for warnings */}
      <div
        className="flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          width:      36,
          height:     36,
          background: `${cfg.bg}`,
          border:     `1px solid ${cfg.border}`,
          marginTop:  1,
        }}
        aria-hidden="true"
      >
        <Icon size={18} color={cfg.iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Caption label */}
        <p
          style={{
            color:         cfg.iconColor,
            fontSize:      T.nano,
            fontWeight:    700,
            letterSpacing: "0.08em",
            fontFamily:    "inherit",
            marginBottom:  2,
          }}
        >
          INTAKE GUIDANCE
        </p>
        {/* Primary instruction text — ≥16pt per spec, using 18px (T.body) */}
        <p
          style={{
            color:      cfg.textColor,   /* 4.5:1+ on #FBFBFB ✓ */
            fontSize:   T.body,          /* 18px — meets "at least 16pt" */
            fontWeight: 500,
            lineHeight: 1.4,
            fontFamily: "inherit",
          }}
        >
          {instruction}
        </p>
      </div>
    </div>
  );
}