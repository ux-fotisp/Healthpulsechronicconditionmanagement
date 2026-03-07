/**
 * HealthPulse · 7-Day Check-In Sparkline (Sprint 6 — Wellness Trends)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Renders a compact sparkline showing energy, mood, and sleep trends over the
 * past 7 days from daily check-in data.
 *
 * Features:
 *   - Multi-line sparkline (energy, mood, sleep)
 *   - Color-coded legend with icon + text (never color alone — WCAG)
 *   - Graceful empty state if < 2 data points
 *   - 56px touch targets · Montserrat · 8px grid
 *
 * WCAG 2.1 AA · Frosted Glass card · Muted Healing Palette
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Zap, Moon, Smile } from "lucide-react";
import { useCheckIns } from "../../hooks/useHealthData";
import { C, T, L } from "../../design/tokens";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return "?";
  }
}

/** Generate demo data when server returns < 2 check-ins */
function generateDemoData() {
  const today = new Date(2026, 2, 7); // March 7, 2026
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toISOString().slice(0, 10),
      energy: [3, 4, 3, 4, 5, 4, 4][i],
      mood: [3, 3, 4, 4, 4, 5, 4][i],
      sleep: [2, 3, 3, 4, 3, 4, 4][i],
    };
  });
}

// ── Line definitions ─────────────────────────────────────────────────────────
const LINES = [
  { key: "energy", label: "Energy", color: C.alert,   icon: Zap },
  { key: "mood",   label: "Mood",   color: C.purple,  icon: Smile },
  { key: "sleep",  label: "Sleep",  color: C.teal,    icon: Moon },
] as const;

// ── Custom tooltip ──────────────────────────────────────────────────────────
function SparkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <p
        style={{
          color: C.textSub,
          fontSize: T.nano,
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontFamily: "inherit",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.color,
            }}
            aria-hidden="true"
          />
          <span
            style={{
              color: C.text,
              fontSize: T.caption,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            {entry.name}: {entry.value}/5
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function CheckInSparkline() {
  const { data: checkIns, loading } = useCheckIns();

  const chartData = useMemo(() => {
    if (!checkIns || checkIns.length < 2) return generateDemoData();

    // Sort by date ascending, take last 7
    const sorted = [...checkIns]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return sorted.map((ci) => ({
      day: formatDayLabel(ci.date),
      date: ci.date,
      energy: ci.energyLevel,
      mood: ci.moodRating,
      sleep: ci.sleepQuality,
    }));
  }, [checkIns]);

  const isDemo = !checkIns || checkIns.length < 2;

  // Compute averages for the latest reading
  const latest = chartData[chartData.length - 1];
  const avgEnergy = chartData.reduce((s, d) => s + d.energy, 0) / chartData.length;
  const avgMood = chartData.reduce((s, d) => s + d.mood, 0) / chartData.length;

  // Determine trend direction
  const trendUp = chartData.length >= 2
    ? (chartData[chartData.length - 1].energy + chartData[chartData.length - 1].mood) / 2 >=
      (chartData[0].energy + chartData[0].mood) / 2
    : true;

  if (loading) {
    return (
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          height: 180,
        }}
        aria-busy="true"
        aria-label="Loading wellness trends"
      >
        <div className="flex items-center justify-center h-full">
          <span style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit" }}>
            Loading trends...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      role="region"
      aria-label="7-day wellness trends sparkline"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
          background: "rgba(142,175,157,0.06)",
        }}
      >
        <TrendingUp size={13} color={C.secondary} aria-hidden="true" />
        <span
          style={{
            color: C.textSub,
            fontSize: T.nano,
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontFamily: "inherit",
          }}
        >
          WELLNESS TRENDS
        </span>
        <span
          className="ml-auto"
          style={{
            color: trendUp ? C.successDark : C.alertText,
            fontSize: T.nano,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
          role="status"
        >
          {trendUp ? "Trending up" : "Needs attention"}
        </span>
      </div>

      {/* Chart area */}
      <div className="px-3 pt-3 pb-1">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="day"
              tick={{
                fontSize: T.nano,
                fill: C.textSub,
                fontFamily: "'Montserrat', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 5]}
              tick={false}
              axisLine={false}
              tickLine={false}
              width={10}
            />
            <Tooltip content={<SparkTooltip />} />
            {LINES.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: line.color,
                  stroke: C.card,
                  strokeWidth: 2,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + summary */}
      <div className="px-5 pb-4 pt-1">
        <div className="flex items-center gap-4 flex-wrap">
          {LINES.map((line) => {
            const Icon = line.icon;
            return (
              <div key={line.key} className="flex items-center gap-1.5">
                <Icon size={12} color={line.color} aria-hidden="true" />
                <span
                  style={{
                    color: C.textSub,
                    fontSize: T.nano,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {line.label}
                </span>
              </div>
            );
          })}
        </div>

        {isDemo && (
          <p
            className="mt-2"
            style={{
              color: C.textMuted,
              fontSize: T.nano,
              fontWeight: 500,
              fontFamily: "inherit",
              fontStyle: "italic",
            }}
          >
            Sample data shown — complete daily check-ins to see your trends.
          </p>
        )}
      </div>
    </div>
  );
}
