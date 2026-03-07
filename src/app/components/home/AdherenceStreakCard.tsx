/**
 * HealthPulse · Sprint 2 — S2-3 Medication Adherence Streak Tracker
 * Shows 30/60/90-day adherence + 14-day dot grid per medication.
 * Evidence: Thakkar et al. (2016) — streak visibility improves adherence.
 * Evidence: Cramer et al. (2008) — adherence drops below 50% within year 1.
 */

import { Flame, TrendingUp, Award } from "lucide-react";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getOverallAdherence, type AdherenceStreak } from "../../data/helpers";
import { C, T, L } from "../../design/tokens";

function streakMotivation(streak: number): string {
  if (streak >= 14) return "Amazing! Two weeks strong 🎉";
  if (streak >= 7)  return "One week in a row! Keep it up";
  if (streak >= 3)  return "Great momentum — don't break it";
  if (streak >= 1)  return "Good start — build on this";
  return "Start your streak today";
}

function adherenceColor(pct: number): string {
  if (pct >= 90) return C.successDark;
  if (pct >= 75) return C.alertText;
  return "#9B3131";
}

function adherenceBg(pct: number): { bg: string; border: string } {
  if (pct >= 90) return { bg: C.successLight,    border: C.successBorder };
  if (pct >= 75) return { bg: C.alertLight,      border: C.alertBorder   };
  return { bg: "rgba(201,122,122,0.10)", border: "rgba(201,122,122,0.28)" };
}

function MedStreakRow({ s }: { s: AdherenceStreak }) {
  const col30 = adherenceColor(s.adherence30);
  const bg30  = adherenceBg(s.adherence30);
  const motivation = streakMotivation(s.currentStreak);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: C.bg, border: `1px solid ${C.borderLight}` }}
    >
      {/* Medication + streak header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {/* Color dot */}
            <div
              style={{
                width:        10,
                height:       10,
                borderRadius: "50%",
                background:   s.color,
                flexShrink:   0,
              }}
            />
            <span style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
              {s.medicationName}
            </span>
            <span style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit" }}>
              {s.dosage}
            </span>
          </div>
          <p style={{ color: C.textSub, fontSize: T.micro, fontFamily: "inherit", lineHeight: 1.4 }}>
            {motivation}
          </p>
        </div>

        {/* Current streak badge */}
        <div
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 flex-shrink-0"
          style={{
            background: s.currentStreak >= 7 ? "rgba(212,163,115,0.15)" : C.primaryLight,
            border:     `1px solid ${s.currentStreak >= 7 ? "rgba(212,163,115,0.3)" : C.primaryBorder}`,
          }}
          aria-label={`Current streak: ${s.currentStreak} days`}
        >
          <Flame
            size={12}
            color={s.currentStreak >= 7 ? C.alert : C.primary}
          />
          <span
            style={{
              color:      s.currentStreak >= 7 ? C.alertText : C.successDark,
              fontSize:   T.nano,
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: "0.04em",
            }}
          >
            {s.currentStreak}d
          </span>
        </div>
      </div>

      {/* 14-day dot grid */}
      <div className="mb-3">
        <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit", marginBottom: 6 }}>
          LAST 14 DAYS
        </p>
        <div className="flex gap-1.5 flex-wrap" role="list" aria-label="14-day dose history">
          {s.last14Days.map((taken, i) => {
            const isToday = i === 13;
            return (
              <div
                key={i}
                role="listitem"
                style={{
                  width:        isToday ? 20 : 16,
                  height:       isToday ? 20 : 16,
                  borderRadius: isToday ? 6 : "50%",
                  background:   taken
                    ? s.color
                    : "rgba(203,213,225,0.35)",
                  border:       isToday
                    ? `2px solid ${taken ? s.color : "rgba(203,213,225,0.5)"}`
                    : `1px solid ${taken ? s.color + "60" : "rgba(203,213,225,0.5)"}`,
                  opacity: taken ? 1 : 0.5,
                  flexShrink: 0,
                }}
                aria-label={
                  isToday
                    ? `Today: ${taken ? "taken" : "not yet logged"}`
                    : `${13 - i} days ago: ${taken ? "taken" : "missed"}`
                }
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>Taken</span>
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(203,213,225,0.5)" }} />
            <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>Missed</span>
          </div>
        </div>
      </div>

      {/* 30 / 60 / 90 day stats */}
      <div className="flex gap-2">
        {[
          { label: "30 days", value: s.adherence30 },
          { label: "60 days", value: s.adherence60 },
          { label: "90 days", value: s.adherence90 },
        ].map(({ label, value }) => {
          const col  = adherenceColor(value);
          const bgs  = adherenceBg(value);
          return (
            <div
              key={label}
              className="flex-1 rounded-xl px-2 py-2 text-center"
              style={{ background: bgs.bg, border: `1px solid ${bgs.border}` }}
            >
              <p style={{ color: col, fontSize: 15, fontWeight: 800, fontFamily: "inherit", lineHeight: 1 }}>
                {value}%
              </p>
              <p style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit", marginTop: 2 }}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdherenceStreakCard() {
  const { data } = useDashboardContext();
  const streaks = (data?.streaks ?? []) as AdherenceStreak[];
  const overall = data ? getOverallAdherence(data.adherenceStats) : 0;
  const col = adherenceColor(overall);
  const bgs = adherenceBg(overall);

  return (
    <div className="mx-4" role="region" aria-label="Medication adherence tracker">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${C.borderLight}`, background: "rgba(142,175,157,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} color={C.primary} aria-hidden="true" />
            <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              MEDICATION STREAKS
            </span>
          </div>

          {/* Overall score */}
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: bgs.bg, border: `1px solid ${bgs.border}` }}
            aria-label={`Overall 30-day adherence: ${overall}%`}
          >
            <Award size={11} color={col} aria-hidden="true" />
            <span style={{ color: col, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
              {overall}% overall
            </span>
          </div>
        </div>

        {/* Overall summary sentence */}
        <div className="px-4 pt-3 pb-2">
          <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", lineHeight: 1.55 }}>
            {overall >= 90
              ? "Excellent work! You're taking your medicines almost every day. This makes a real difference for your blood pressure and blood sugar."
              : overall >= 80
              ? "You're doing well. Staying above 80% is a good target. A few missed doses happened — here's where to focus."
              : "There are some gaps in your medication routine. Let's see where you can improve — it makes a big difference to your health."}
          </p>
        </div>

        {/* Per-medication streak rows */}
        <div className="px-4 pb-4 flex flex-col gap-3">
          {streaks.map((s) => (
            <MedStreakRow key={s.medicationId} s={s} />
          ))}
        </div>
      </div>
    </div>
  );
}