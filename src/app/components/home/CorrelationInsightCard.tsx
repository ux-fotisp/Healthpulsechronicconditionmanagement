import { useState } from "react";
import {
  Zap, Waves, Heart, Moon, ChevronRight, ChevronLeft,
  TrendingUp, X, Bell, Sparkles,
} from "lucide-react";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { type CorrelationInsight } from "../../data/helpers";
import { C, T, L } from "../../design/tokens";

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
// Renders a smooth poly-line trend from 14-day score data.
// Dots are colored: met condition = medColor, not met = border grey.
function InsightSparkline({ insight }: { insight: CorrelationInsight }) {
  const W          = 280;
  const H          = 64;
  const PAD_X      = 12;
  const PAD_Y      = 8;
  const plotW      = W - PAD_X * 2;
  const plotH      = H - PAD_Y * 2;
  const data       = insight.sparkData;
  const n          = data.length;
  const minVal     = Math.min(...data);
  const maxVal     = Math.max(...data);
  const range      = Math.max(maxVal - minVal, 1);

  // Map data → pixel coords
  const pts = data.map((v, i) => ({
    x: PAD_X + (i / (n - 1)) * plotW,
    y: PAD_Y + plotH - ((v - minVal) / range) * plotH,
    met: insight.conditionMet[i],
  }));

  // Build SVG polyline points string
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  // Build area fill path (close below)
  const areaPath =
    `M ${pts[0].x},${H} ` +
    pts.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${pts[n - 1].x},${H} Z`;

  // "Optimal zone" band (top 20% of chart = condition met zone)
  const zoneY = PAD_Y + plotH * 0.15;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Optimal zone band */}
      <rect
        x={PAD_X}
        y={zoneY}
        width={plotW}
        height={PAD_Y + plotH - zoneY}
        fill={`${insight.medColor}08`}
        rx={4}
      />

      {/* Area fill under the line */}
      <path
        d={areaPath}
        fill={`${insight.medColor}12`}
      />

      {/* Trend line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={insight.medColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Data points */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.met ? 3.5 : 2.5}
          fill={p.met ? insight.medColor : C.border}
          stroke={p.met ? `${insight.medColor}40` : "transparent"}
          strokeWidth={p.met ? 3 : 0}
        />
      ))}

      {/* "Latest" dot — larger with pulse ring */}
      <circle
        cx={pts[n - 1].x}
        cy={pts[n - 1].y}
        r={6}
        fill={insight.medColor}
        opacity="0.25"
      />
      <circle
        cx={pts[n - 1].x}
        cy={pts[n - 1].y}
        r={4}
        fill={insight.medColor}
      />
    </svg>
  );
}

// ── Effect icon map ────────────────────────────────────────────────────────────
function EffectIcon({
  effect,
  size = 13,
  color,
}: {
  effect: CorrelationInsight["effect"];
  size?: number;
  color: string;
}) {
  const props = { size, color };
  switch (effect) {
    case "energy": return <Zap   {...props} />;
    case "nausea": return <Waves {...props} />;
    case "bp":     return <Heart {...props} />;
    case "sleep":  return <Moon  {...props} />;
    default:       return <TrendingUp {...props} />;
  }
}

// ── Insight copy builder ────────────────────────────────────────────────────────
function buildInsightCopy(insight: CorrelationInsight): string {
  const pct = insight.magnitude;
  const effect = insight.direction === "positive"
    ? `${pct}% more ${insight.effectLabel.toLowerCase()}`
    : `${pct}% less ${insight.effectLabel.toLowerCase()}`;
  return `You reported ${effect} on days you took ${insight.medicationName} ${insight.condition}.`;
}

// ── Legend dots ────────────────────────────────────────────────────────────────
function SparkLegend({ medColor }: { medColor: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <svg width={12} height={12} aria-hidden="true">
          <circle cx={6} cy={6} r={4} fill={medColor} />
        </svg>
        <span style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}>
          Condition met
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width={12} height={12} aria-hidden="true">
          <circle cx={6} cy={6} r={3} fill={C.border} />
        </svg>
        <span style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}>
          Not met
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CorrelationInsightCard() {
  const [index,     setIndex]     = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [adjusted,  setAdjusted]  = useState<Set<string>>(new Set());

  const { data } = useDashboardContext();
  const allInsights = (data?.insights ?? []) as CorrelationInsight[];
  const visible = allInsights.filter((i) => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  const clampedIndex = Math.min(index, visible.length - 1);
  const insight      = visible[clampedIndex];

  function prev() { setIndex((i) => Math.max(0, i - 1)); }
  function next() { setIndex((i) => Math.min(visible.length - 1, i + 1)); }

  function handleAdjust() {
    setAdjusted((s) => new Set([...s, insight.id]));
    setTimeout(() => {
      setDismissed((s) => new Set([...s, insight.id]));
      setIndex((i) => Math.max(0, i - 1));
    }, 1600);
  }

  function handleDismiss() {
    setDismissed((s) => new Set([...s, insight.id]));
    setIndex((i) => Math.max(0, i - 1));
  }

  const isAdjusted = adjusted.has(insight.id);

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${insight.medColor}35`,
        boxShadow:  `0 4px 16px ${insight.medColor}14, 0 1px 4px rgba(0,0,0,0.06)`,
      }}
      role="region"
      aria-label="Correlation insight: medication timing and wellness"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background:   `linear-gradient(135deg, ${insight.medColor}10 0%, ${insight.medColor}06 100%)`,
          borderBottom: `1px solid ${insight.medColor}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width:      28,
              height:     28,
              background: `${insight.medColor}18`,
              border:     `1px solid ${insight.medColor}30`,
            }}
            aria-hidden="true"
          >
            <Sparkles size={13} color={insight.medColor} />
          </div>
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
            CORRELATION INSIGHT
          </span>
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: C.primaryLight, border: `1px solid rgba(142,175,157,0.25)` }}
          >
            <EffectIcon effect={insight.effect} size={9} color={C.primary} />
            <span style={{ color: C.successDark, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>
              {insight.effectLabel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Pagination + dismiss */}
        <div className="flex items-center gap-1">
          {visible.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={clampedIndex === 0}
                style={{ background: "transparent", border: "none", color: clampedIndex === 0 ? C.textMuted : C.textSub, cursor: clampedIndex === 0 ? "not-allowed" : "pointer", padding: 2, minHeight: "auto" }}
                aria-label="Previous insight"
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>
                {clampedIndex + 1}/{visible.length}
              </span>
              <button
                onClick={next}
                disabled={clampedIndex === visible.length - 1}
                style={{ background: "transparent", border: "none", color: clampedIndex === visible.length - 1 ? C.textMuted : C.textSub, cursor: clampedIndex === visible.length - 1 ? "not-allowed" : "pointer", padding: 2, minHeight: "auto" }}
                aria-label="Next insight"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
          <button
            onClick={handleDismiss}
            style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "2px 4px", marginLeft: 4, minHeight: "auto" }}
            aria-label="Dismiss this insight"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Sparkline (visual data trend) ── */}
      <div
        className="px-4 pt-3 pb-1"
        style={{ borderBottom: `1px solid ${insight.medColor}15` }}
        aria-label={`Sparkline: ${insight.effectLabel} trend over 14 days`}
      >
        <InsightSparkline insight={insight} />
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span style={{ color: C.textMuted, fontSize: 10, fontFamily: "inherit" }}>14 days ago</span>
          <SparkLegend medColor={insight.medColor} />
          <span style={{ color: C.textMuted, fontSize: 10, fontFamily: "inherit" }}>Today</span>
        </div>
      </div>

      {/* ── Insight copy ── */}
      <div className="px-5 pt-4 pb-1">
        {/* Magnitude badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full mb-3 px-3 py-1"
          style={{
            background: `${insight.medColor}14`,
            border:     `1px solid ${insight.medColor}30`,
          }}
        >
          <EffectIcon effect={insight.effect} size={12} color={insight.medColor} />
          <span
            style={{
              color:         insight.medColor,
              fontSize:      T.caption,
              fontWeight:    700,
              letterSpacing: "0.04em",
              fontFamily:    "inherit",
            }}
          >
            {insight.magnitude}% {insight.direction === "positive" ? "improvement" : "reduction"}
          </span>
        </div>

        {/* Main copy — BodyL 18px */}
        <p
          style={{
            color:      C.text,
            fontSize:   T.bodySm,          /* 18px — patient-facing data copy */
            fontWeight: 500,
            lineHeight: 1.6,
            fontFamily: "inherit",
          }}
        >
          {buildInsightCopy(insight)}{" "}
          <span style={{ color: C.textSub, fontWeight: 400 }}>
            {insight.actionSuggest}
          </span>
        </p>

        {/* Data confidence note — Caption 14px */}
        <p
          className="mt-1"
          style={{
            color:      C.textMuted,
            fontSize:   T.caption,
            fontFamily: "inherit",
          }}
        >
          Based on your last 14 days of logged data · {insight.conditionMet.filter(Boolean).length}/14 days met
        </p>
      </div>

      {/* ── CTAs ── */}
      <div className="px-5 pb-5 pt-3 flex items-center gap-3">
        {isAdjusted ? (
          <div
            className="flex-1 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: C.successLight,
              border:     `1px solid ${C.successBorder}`,
              minHeight:  L.touch,
            }}
            role="status"
            aria-live="polite"
          >
            <Bell size={15} color={C.success} />
            <span style={{ color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
              Reminder Updated!
            </span>
          </div>
        ) : (
          <>
            {/* Primary: Adjust Schedule — Muted Sage */}
            <button
              onClick={handleAdjust}
              className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background:    "#4A4D4C",
                border:        "1px solid rgba(142,175,157,0.4)",
                color:         "#FFFFFF",
                fontSize:      T.bodySm,
                fontWeight:    700,
                letterSpacing: "0.02em",
                fontFamily:    "inherit",
                minHeight:     L.touch,          /* 56px touch target */
              }}
              aria-label={`Adjust schedule for ${insight.medicationName}`}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3A3D3C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4A4D4C"; }}
            >
              <Bell size={14} color="#FFFFFF" />
              Adjust Schedule
            </button>

            {/* Secondary: View Details */}
            <button
              onClick={() => setIndex((i) => (i + 1) % visible.length)}
              className="rounded-xl px-4 flex items-center justify-center gap-1 transition-all duration-200"
              style={{
                background: "#4A4D4C",
                border:     "1px solid rgba(142,175,157,0.4)",
                color:      "#FFFFFF",
                fontSize:   T.caption,
                fontWeight: 700,
                fontFamily: "inherit",
                minHeight:  L.touch,
              }}
              aria-label="View next insight"
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3A3D3C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4A4D4C"; }}
            >
              Next
              <ChevronRight size={13} color="#FFFFFF" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {visible.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width:      i === clampedIndex ? 20 : 6,
                height:     6,
                borderRadius: 3,
                background: i === clampedIndex ? C.primary : C.border,
                border:     "none",
                cursor:     "pointer",
                transition: "all 0.25s ease",
                padding:    0,
                minHeight:  "auto",
              }}
              aria-label={`Go to insight ${i + 1}`}
              aria-pressed={i === clampedIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}