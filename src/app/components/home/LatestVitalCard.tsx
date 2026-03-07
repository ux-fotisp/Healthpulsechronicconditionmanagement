/**
 * HealthPulse · LatestVitalCard
 * Tokens: bg #FBFBFB, primary #8EAF9D, alert #D4A373, text #1E293B
 * Typography: big value at 40px, BodyL 18px, Caption 14px
 * Touch targets: 56px buttons
 */

import { Heart, Activity, ChevronRight, TrendingUp, CheckCircle, AlertTriangle, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getLatestObservation, formatDateTime, getObservationTrend, hydrateObservationTrends } from "../../data/helpers";
import { useObservationTrends } from "../../hooks/useHealthData";
import { StatusBadge } from "../shared/StatusBadge";
import type { StatusType } from "../shared/StatusBadge";
import { ReadingContext } from "../shared/ReadingContext";
import { Sparkline } from "../shared/Sparkline";
import { C, T, L } from "../../design/tokens";

export function LatestVitalCard() {
  const navigate = useNavigate();
  const { data } = useDashboardContext();
  const trendsQuery = useObservationTrends();
  const observations = data?.observations ?? [];
  const latest = getLatestObservation(observations);
  const trends = trendsQuery.data ? hydrateObservationTrends(trendsQuery.data) : [];

  if (!latest) {
    return (
      <div
        className="mx-4 rounded-2xl p-5"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        role="region"
        aria-label="Latest vital – no data"
      >
        <p
          className="text-center"
          style={{ color: C.textMuted, fontSize: T.bodySm, fontFamily: "inherit", padding: "16px 0", border: `1px solid ${C.border}`, borderRadius: L.rMd }}
          role="status"
        >
          No vitals logged yet
        </p>
      </div>
    );
  }

  const statusType = latest.status as StatusType;
  const StatusIcon = statusType === "normal" ? CheckCircle : statusType === "warning" ? AlertTriangle : CircleAlert;
  const statusColor = statusType === "normal" ? C.success : C.alert;

  const recentObs = observations
    .filter((o) => o.type === latest.type)
    .sort((a, b) => b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime())
    .slice(0, 3);

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      role="region"
      aria-label="Latest vital reading"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${C.borderLight}`, background: "rgba(142,175,157,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Heart size={14} color={C.alert} aria-hidden="true" />
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
            LATEST VITAL
          </span>
        </div>
        {/* Timestamp — Caption 14px Medium */}
        <span style={{ color: C.textMuted, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}>
          {formatDateTime(latest.effectiveDateTime)}
        </span>
      </div>

      <div className="px-5 py-4" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          {/* Vital reading */}
          <div className="flex-1">
            <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, letterSpacing: "0.04em", marginBottom: 4, fontFamily: "inherit" }}>
              {latest.type}
              {latest.loincCode && (
                <span style={{ color: C.textMuted, fontSize: T.micro, marginLeft: 6, fontFamily: "inherit" }}>
                  (LOINC: {latest.loincCode})
                </span>
              )}
            </p>

            {/* Big value — BodyL 18px scale */}
            <div className="flex items-baseline gap-2">
              <span
                style={{ color: C.text, fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "inherit" }}
                aria-label={`${latest.value} ${latest.unit}`}
              >
                {latest.value}
              </span>
              <span style={{ color: C.textSub, fontSize: T.body, fontWeight: 500, fontFamily: "inherit" }}>
                {latest.unit}
              </span>
            </div>

            <div className="mt-3">
              <StatusBadge status={statusType} size="md" />
            </div>
          </div>

          {/* Status icon circle */}
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              width:      60,
              height:     60,
              background: statusType === "normal" ? C.successLight : C.alertLight,
              border:     `1px solid ${statusType === "normal" ? C.successBorder : C.alertBorder}`,
            }}
            aria-hidden="true"
          >
            <StatusIcon size={26} color={statusColor} />
          </div>
        </div>

        {/* Sprint 2: Reading Context — plain-language interpretation */}
        <div className="mt-3">
          <ReadingContext
            type={latest.type}
            value={latest.value}
            status={latest.status}
          />
        </div>

        {/* Sprint 2: 30-day trend sparkline */}
        {(() => {
          const trend = getObservationTrend(latest.type, trends);
          if (!trend || trend.data.length < 2) return null;
          return (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
                  30-DAY TREND
                </p>
                <p style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit" }}>
                  {trend.data.length} readings
                </p>
              </div>
              <div
                className="rounded-xl px-3 py-2"
                style={{ background: "rgba(142,175,157,0.06)", border: `1px solid ${C.borderLight}` }}
              >
                <Sparkline
                  id={`vital-trend-${latest.type.replace(/\s/g, "")}`}
                  data={trend.data.map((d) => d.value)}
                  statuses={trend.data.map((d) => d.status)}
                  width={280}
                  height={48}
                  showEndDot
                />
                <div className="flex items-center justify-between mt-1">
                  <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>
                    {trend.data[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>
                    Today
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Recent mini-list */}
        {recentObs.length > 1 && (
          <div
            className="mt-4 rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.borderLight}` }}
          >
            {recentObs.slice(1).map((obs, i) => (
              <div
                key={obs.id}
                className="flex items-center justify-between px-3 py-2"
                style={{
                  borderTop:  i > 0 ? `1px solid ${C.borderLight}` : undefined,
                  background: i % 2 === 0 ? "rgba(251,251,251,0.8)" : "transparent",
                }}
              >
                <span style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}>
                  {formatDateTime(obs.effectiveDateTime)}
                </span>
                <span style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>
                  {obs.value} {obs.unit}
                </span>
                <StatusBadge status={obs.status as StatusType} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        )}

        {/* CTAs — 56px touch target */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate("/observations")}
            className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background:  C.primary,
              color:       "#111820",
              fontSize:    T.bodySm,
              fontWeight:  700,
              letterSpacing: "0.02em",
              border:      "1px solid rgba(142,175,157,0.4)",
              fontFamily:  "inherit",
              minHeight:   L.touch,          /* 56px */
            }}
            aria-label="Log new vital reading"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
          >
            <Activity size={14} />
            Log Vitals
          </button>
          <button
            onClick={() => navigate("/observations")}
            className="flex items-center gap-1 transition-all duration-200 flex-shrink-0"
            style={{
              color:               C.secondary,
              fontSize:            T.caption,
              fontWeight:          600,
              textDecoration:      "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: "rgba(100,116,139,0.4)",
              background:          "transparent",
              border:              "none",
              padding:             "8px 0",
              fontFamily:          "inherit",
              minHeight:           L.touch,
            }}
            aria-label="View vital trends"
          >
            <TrendingUp size={12} color={C.secondary} />
            View Trends
          </button>
        </div>
      </div>
    </div>
  );
}