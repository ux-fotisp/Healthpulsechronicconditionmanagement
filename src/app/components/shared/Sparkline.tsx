/**
 * HealthPulse · Sprint 2 — S2-2 Trend Sparkline
 * Lightweight SVG sparkline with gradient fill area.
 * No external charting library — keeps bundle lean.
 */

import React, { useMemo } from "react";

interface SparklineProps {
  data: number[];
  /** Color for the line and gradient fill. Defaults to primary green. */
  color?: string;
  width?: number;
  height?: number;
  /** If true, highlights the last point with a dot */
  showEndDot?: boolean;
  /** Unique ID for the SVG gradient — must be unique per sparkline on the page */
  id: string;
  /** Optional array of per-point status for coloring segments */
  statuses?: ("normal" | "warning" | "critical")[];
}

const STATUS_COLORS = {
  normal:   "#B5C99A",
  warning:  "#D4A373",
  critical: "#C97A7A",
};

export function Sparkline({
  data,
  color = "#8EAF9D",
  width = 120,
  height = 40,
  showEndDot = true,
  id,
  statuses,
}: SparklineProps) {
  const { linePath, areaPath, points } = useMemo(() => {
    if (data.length < 2) return { linePath: "", areaPath: "", points: [] };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padY = height * 0.1;
    const usableH = height - padY * 2;

    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + usableH - ((v - min) / range) * usableH,
    }));

    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const area =
      line +
      ` L ${width} ${height} L 0 ${height} Z`;

    return { linePath: line, areaPath: area, points: pts };
  }, [data, width, height]);

  if (data.length < 2) return null;

  const lastPt = points[points.length - 1];

  // Determine dominant color: use statuses if provided, else fallback to `color`
  const dominantColor = statuses
    ? STATUS_COLORS[statuses[statuses.length - 1] ?? "normal"]
    : color;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={dominantColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={dominantColor} stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#sg-${id})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={dominantColor}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* End dot */}
      {showEndDot && lastPt && (
        <>
          <circle cx={lastPt.x} cy={lastPt.y} r={4} fill={dominantColor} />
          <circle cx={lastPt.x} cy={lastPt.y} r={7} fill={dominantColor} fillOpacity="0.2" />
        </>
      )}
    </svg>
  );
}
