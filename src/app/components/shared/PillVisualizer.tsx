/**
 * HealthPulse · PillVisualizer — Medication Identity
 * Visual medication identity component.
 * Renders an SVG pill shape (round | oval | capsule | oblong) in the
 * medication's brand colour, plus a colour-coded Quick Instruction chip.
 *
 * WCAG: shape + colour + text always together; never colour alone.
 * Tokens: C.secondary (#64748B), C.primary (#8EAF9D), C.alert (#D4A373)
 */

import { Utensils, Moon, AlertTriangle, Clock } from "lucide-react";
import { C, T } from "../../design/tokens";

export type PillShape = "round" | "oval" | "capsule" | "oblong";

interface PillVisualizerProps {
  color: string;
  shape: PillShape;
  quickInstruction: string;
  /** sm: inside list cards; md: ActiveStateCard; lg: MedicationDetail hero */
  size?: "sm" | "md" | "lg";
  /** When true, suppress the Quick Instruction chip (shape only) */
  chipless?: boolean;
}

// ── SVG pill shape ────────────────────────────────────────────────────────────
function PillSVG({
  color,
  shape,
  size,
}: {
  color: string;
  shape: PillShape;
  size: "sm" | "md" | "lg";
}) {
  // 8-digit hex: colour + alpha byte (hex). "30" ≈ 19%, "50" ≈ 31%
  const fill = color + "2E";
  const stroke = color;
  const scoreLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="1.5"
      opacity="0.38"
      strokeLinecap="round"
    />
  );

  if (shape === "round") {
    const dim = size === "sm" ? 36 : size === "lg" ? 56 : 44;
    const r = dim / 2;
    return (
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        aria-hidden="true"
        style={{ display: "block", flexShrink: 0 }}
      >
        <circle cx={r} cy={r} r={r - 2} fill={fill} stroke={stroke} strokeWidth="2" />
        {scoreLine(r, 4, r, dim - 4)}
      </svg>
    );
  }

  if (shape === "oval") {
    const w = size === "sm" ? 52 : size === "lg" ? 80 : 64;
    const h = size === "sm" ? 30 : size === "lg" ? 44 : 36;
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        style={{ display: "block", flexShrink: 0 }}
      >
        <ellipse
          cx={w / 2}
          cy={h / 2}
          rx={w / 2 - 2}
          ry={h / 2 - 2}
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        {scoreLine(w / 2, 4, w / 2, h - 4)}
      </svg>
    );
  }

  if (shape === "capsule") {
    const w = size === "sm" ? 58 : size === "lg" ? 88 : 72;
    const h = size === "sm" ? 26 : size === "lg" ? 36 : 30;
    const rx = h / 2 - 2;
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        style={{ display: "block", flexShrink: 0 }}
      >
        <rect
          x="2"
          y="2"
          width={w - 4}
          height={h - 4}
          rx={rx}
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        {scoreLine(w / 2, 4, w / 2, h - 4)}
      </svg>
    );
  }

  // oblong
  const w = size === "sm" ? 58 : size === "lg" ? 88 : 72;
  const h = size === "sm" ? 26 : size === "lg" ? 36 : 30;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect
        x="2"
        y="2"
        width={w - 4}
        height={h - 4}
        rx="7"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      {scoreLine(w / 2, 4, w / 2, h - 4)}
    </svg>
  );
}

// ── Quick Instruction chip ────────────────────────────────────────────────────
function QuickInstructionChip({
  instruction,
  size,
}: {
  instruction: string;
  size: "sm" | "md" | "lg";
}) {
  const lower = instruction.toLowerCase();

  // Map instruction to icon + colours (colour + icon + text — never colour alone)
  let Icon      = Clock;
  let bg        = C.primaryLight;
  let border    = "rgba(142,175,157,0.3)";
  let textColor = C.successDark;
  let iconColor = C.primary;

  if (lower.includes("food") || lower.includes("meal")) {
    Icon      = Utensils;
    bg        = C.secondaryLight;
    border    = C.secondaryBorder;
    textColor = C.secondaryDark;
    iconColor = C.secondary;
  } else if (lower.includes("bedtime") || lower.includes("sleep")) {
    Icon      = Moon;
    bg        = "rgba(124,58,237,0.07)";
    border    = "rgba(124,58,237,0.2)";
    textColor = "#5B21B6";
    iconColor = "#7C3AED";
  } else if (lower.includes("avoid") || lower.includes("grapefruit")) {
    Icon      = AlertTriangle;
    bg        = C.alertLight;
    border    = C.alertBorder;
    textColor = C.alertText;
    iconColor = C.alert;
  } else if (lower.includes("empty")) {
    Icon      = Clock;
    bg        = C.secondaryLight;
    border    = C.secondaryBorder;
    textColor = C.secondaryDark;
    iconColor = C.secondary;
  }

  const iconSize = size === "sm" ? 10 : 12;
  const fontSize = size === "sm" ? T.nano : 10;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        background:   bg,
        border:       `1px solid ${border}`,
        paddingLeft:  size === "sm" ? 6 : 8,
        paddingRight: size === "sm" ? 6 : 8,
        paddingTop:   3,
        paddingBottom:3,
        whiteSpace:   "nowrap",
        maxWidth:     size === "lg" ? 220 : 180,
      }}
      role="note"
      aria-label={`Quick instruction: ${instruction}`}
    >
      <Icon size={iconSize} color={iconColor} style={{ flexShrink: 0 }} />
      <span
        style={{
          color:         textColor,
          fontSize,
          fontWeight:    700,
          letterSpacing: "0.04em",
          fontFamily:    "inherit",
          overflow:      "hidden",
          textOverflow:  "ellipsis",
        }}
      >
        {instruction}
      </span>
    </span>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export function PillVisualizer({
  color,
  shape,
  quickInstruction,
  size = "md",
  chipless = false,
}: PillVisualizerProps) {
  return (
    <div
      className="flex flex-col items-center gap-1.5"
      aria-label={`Pill: ${shape} shape, ${quickInstruction}`}
    >
      <PillSVG color={color} shape={shape} size={size} />
      {!chipless && (
        <QuickInstructionChip instruction={quickInstruction} size={size} />
      )}
    </div>
  );
}

/**
 * Compact inline variant — shows the pill SVG only, horizontally centred,
 * useful for tight list-card contexts.
 */
export function PillBadge({
  color,
  shape,
  size = "sm",
}: {
  color: string;
  shape: PillShape;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size === "sm" ? 48 : size === "lg" ? 72 : 60,
        height: size === "sm" ? 48 : size === "lg" ? 72 : 60,
        background: color + "12",
        border: `1px solid ${color}2A`,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <PillSVG color={color} shape={shape} size={size} />
    </div>
  );
}