import React from "react";
import { useCarePlanScore } from "../../hooks/useHealthData";
import { Trophy, TrendingUp, Pill, Activity, CalendarCheck, ClipboardList, Heart } from "lucide-react";
import { C, T, L } from "../../design/tokens";

const BADGE_CONFIG = {
  gold:   { label: "Gold",   color: "#C4A87A", bg: "rgba(196,168,122,0.12)", border: "rgba(196,168,122,0.3)" },
  silver: { label: "Silver", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
  bronze: { label: "Bronze", color: "#D4A373", bg: "rgba(212,163,115,0.12)", border: "rgba(212,163,115,0.3)" },
  none:   { label: "—",      color: C.textMuted, bg: C.secondaryLight, border: C.secondaryBorder },
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  medication: Pill,
  vitals: Activity,
  appointments: CalendarCheck,
  tasks: ClipboardList,
  checkins: Heart,
};

const CATEGORY_COLORS: Record<string, string> = {
  medication: C.primary,
  vitals: C.teal,
  appointments: C.purple,
  tasks: C.sage,
  checkins: C.rose,
};

function RadialGauge({ score, badge }: { score: number; badge: string }) {
  const r = 48, cx = 56, cy = 56;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 100));
  const offset = circumference * (1 - pct);
  const badgeCfg = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG] || BADGE_CONFIG.none;
  const gaugeColor = score >= 90 ? "#C4A87A" : score >= 75 ? C.sage : score >= 60 ? C.alert : C.terracotta;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
      <svg width={112} height={112} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.borderLight} strokeWidth={8} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={gaugeColor} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span style={{ color: C.text, fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>
          {score}
        </span>
        <span
          className="mt-1 rounded-full px-2 py-0.5"
          style={{
            background: badgeCfg.bg,
            border: `1px solid ${badgeCfg.border}`,
            color: badgeCfg.color,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.06em",
            fontFamily: "inherit",
          }}
        >
          {badgeCfg.label.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function MiniTrend({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 80, h = 28, pad = 4;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const xScale = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const yScale = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="Weekly score trend">
      <path d={path} fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1])} r={3} fill={C.primary} />
    </svg>
  );
}

export function CarePlanScoreCard() {
  const { data: score, loading } = useCarePlanScore();

  if (loading || !score) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
        <div className="p-5">
          <div className="h-4 rounded" style={{ background: C.borderLight, width: "60%" }} />
          <div className="h-24 rounded mt-3" style={{ background: C.borderLight }} />
        </div>
      </div>
    );
  }

  const breakdown = Object.entries(score.breakdown) as [string, { score: number; weight: number; label: string }][];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
      role="region"
      aria-label="Care Plan Score"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${C.cardBorder}`, background: "rgba(157,187,155,0.06)" }}
      >
        <Trophy size={14} color={C.primary} />
        <span style={{ color: C.cardText, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
          CARE PLAN SCORE
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <TrendingUp size={10} color={C.cardTextMuted} />
          <MiniTrend data={score.weeklyTrend} />
        </div>
      </div>

      {/* Gauge + summary */}
      <div className="flex items-center gap-5 px-5 py-4">
        <RadialGauge score={score.composite} badge={score.badge} />
        <div className="flex-1 min-w-0">
          <p style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            {score.composite >= 90
              ? "Outstanding care!"
              : score.composite >= 75
              ? "You're doing well"
              : score.composite >= 60
              ? "Room to improve"
              : "Let's get on track"}
          </p>
          <p style={{ color: C.cardTextSub, fontSize: T.nano, fontFamily: "inherit", marginTop: 4, lineHeight: 1.4 }}>
            {score.composite >= 75
              ? "Keep up the great work with your medications and check-ins."
              : "Focus on daily check-ins and tracking your vitals to boost your score."}
          </p>
          <p style={{ color: C.cardTextMuted, fontSize: 9, fontFamily: "inherit", marginTop: 6 }}>
            {score.activeMedications} active medication{score.activeMedications !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="px-5 pb-4 flex flex-col gap-2">
        {breakdown.map(([key, item]) => {
          const Icon = CATEGORY_ICONS[key] || Activity;
          const color = CATEGORY_COLORS[key] || C.primary;
          return (
            <div key={key} className="flex items-center gap-2.5">
              <Icon size={12} color={color} />
              <span style={{ color: C.cardTextSub, fontSize: 9, fontFamily: "inherit", minWidth: 70 }}>
                {item.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.borderLight }}>
                <div
                  style={{
                    width: `${item.score}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 9999,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <span style={{ color: C.cardText, fontSize: 9, fontWeight: 700, fontFamily: "inherit", minWidth: 24, textAlign: "right" }}>
                {item.score}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}