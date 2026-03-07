/**
 * HealthPulse · Sprint 2 — S2-1 Reading Context Banner
 * Shows a plain-language interpretation below any biometric value.
 * "Never show a number without a frame." — Design Principle 2, Roadmap
 */

import { CheckCircle, AlertTriangle, Info, CircleAlert } from "lucide-react";
import { getReadingContext } from "../../utils/readingContext";
import type { ReadingInterpretation } from "../../utils/readingContext";

interface ReadingContextProps {
  type: string;
  value: string;
  status: "normal" | "warning" | "critical";
  /** If true, shows a compact 1-line version */
  compact?: boolean;
}

const SENTIMENT_CONFIG = {
  positive: {
    bg:     "rgba(181,201,154,0.12)",
    border: "rgba(181,201,154,0.30)",
    text:   "#3D6B4F",
    label:  "#3D6B4F",
    Icon:   CheckCircle,
    iconColor: "#B5C99A",
  },
  neutral: {
    bg:     "rgba(142,175,157,0.10)",
    border: "rgba(142,175,157,0.22)",
    text:   "#3D5A4A",
    label:  "#4A7060",
    Icon:   Info,
    iconColor: "#8EAF9D",
  },
  caution: {
    bg:     "rgba(212,163,115,0.10)",
    border: "rgba(212,163,115,0.28)",
    text:   "#92400E",
    label:  "#92400E",
    Icon:   AlertTriangle,
    iconColor: "#D4A373",
  },
  alert: {
    bg:     "rgba(201,122,122,0.10)",
    border: "rgba(201,122,122,0.28)",
    text:   "#7F1D1D",
    label:  "#9B3131",
    Icon:   CircleAlert,
    iconColor: "#C97A7A",
  },
} as const;

export function ReadingContext({ type, value, status, compact = false }: ReadingContextProps) {
  const ctx: ReadingInterpretation = getReadingContext(type, value, status);
  const cfg = SENTIMENT_CONFIG[ctx.sentiment];
  const { Icon } = cfg;

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
        role="note"
        aria-label={`Reading interpretation: ${ctx.headline}`}
      >
        <Icon size={13} color={cfg.iconColor} aria-hidden="true" />
        <span
          style={{
            color:      cfg.text,
            fontSize:   12,
            fontWeight: 600,
            fontFamily: "inherit",
            lineHeight: 1.4,
          }}
        >
          {ctx.headline}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{
        background: cfg.bg,
        border:     `1px solid ${cfg.border}`,
      }}
      role="note"
      aria-label={`Reading interpretation: ${ctx.headline}`}
    >
      {/* Headline row */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={16} color={cfg.iconColor} aria-hidden="true" />
        </div>
        <p
          style={{
            color:      cfg.label,
            fontSize:   13,
            fontWeight: 700,
            fontFamily: "inherit",
            lineHeight: 1.35,
          }}
        >
          {ctx.headline}
        </p>
      </div>

      {/* Detail text */}
      <p
        style={{
          color:      cfg.text,
          fontSize:   12,
          fontWeight: 400,
          fontFamily: "inherit",
          lineHeight: 1.6,
          paddingLeft: 24,
        }}
      >
        {ctx.detail}
      </p>

      {/* Optional action */}
      {ctx.action && (
        <p
          style={{
            color:      cfg.label,
            fontSize:   12,
            fontWeight: 600,
            fontFamily: "inherit",
            lineHeight: 1.5,
            marginTop:  8,
            paddingLeft: 24,
          }}
        >
          → {ctx.action}
        </p>
      )}
    </div>
  );
}
