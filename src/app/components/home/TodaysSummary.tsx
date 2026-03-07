/**
 * HealthPulse · TodaysSummary
 * Tokens: bg #FBFBFB, border #CBD5E1, text #1E293B
 * Status: icon + color + text label always together (WCAG)
 */

import { CheckCircle, AlertTriangle } from "lucide-react";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getMedicationsDueToday, getLatestObservation } from "../../data/helpers";
import { C, T, L } from "../../design/tokens";

export function TodaysSummary() {
  const { data } = useDashboardContext();
  if (!data) return null;
  const dueMeds    = getMedicationsDueToday(data.medications, data.medicationLogs);
  const latestVital = getLatestObservation(data.observations);
  const pendingTasks = data.tasks.filter((t) => t.status === "pending").length;

  const metrics: {
    label:   string;
    value:   string | number;
    sub?:    string;
    isAlert: boolean;
  }[] = [
    {
      label:   "Meds Due",
      value:   dueMeds.length,
      sub:     "today",
      isAlert: dueMeds.length > 0,
    },
    {
      label:   "Latest BP",
      value:   latestVital?.type === "Blood Pressure" ? latestVital.value : "—",
      sub:     latestVital?.type === "Blood Pressure"
                 ? latestVital.status.toUpperCase()
                 : "No data",
      isAlert: latestVital?.type === "Blood Pressure" && latestVital.status !== "normal",
    },
    {
      label:   "Tasks",
      value:   pendingTasks,
      sub:     "pending",
      isAlert: false,
    },
  ];

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 8px rgba(0,0,0,0.08)",
      }}
      role="region"
      aria-label="Today's health summary"
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
          background:   "rgba(142,175,157,0.06)",
        }}
      >
        <span
          style={{
            color:         C.textSub,
            fontSize:      T.nano,
            fontWeight:    700,
            letterSpacing: "0.1em",
            fontFamily:    "inherit",
          }}
        >
          TODAY'S SUMMARY
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3">
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className="flex flex-col items-center justify-center py-5 px-2"
            style={{
              borderRight: i < metrics.length - 1 ? `1px solid ${C.borderLight}` : undefined,
            }}
          >
            {/* Metric value + status icon */}
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  color:         metric.isAlert ? C.alertText : C.text,
                  fontSize:      28,
                  fontWeight:    800,
                  letterSpacing: "-0.03em",
                  lineHeight:    1,
                  fontFamily:    "inherit",
                }}
                aria-label={`${metric.label}: ${metric.value}`}
              >
                {metric.value}
              </span>
              {metric.isAlert ? (
                <AlertTriangle size={14} color={C.alert} aria-hidden="true" />
              ) : (
                <CheckCircle size={14} color={C.success} aria-hidden="true" />
              )}
            </div>

            {/* Sub-text */}
            {metric.sub && (
              <span
                className="mt-0.5"
                style={{
                  color:         metric.isAlert ? C.alertText : C.textSub,
                  fontSize:      T.nano,
                  fontWeight:    600,
                  letterSpacing: "0.04em",
                  fontFamily:    "inherit",
                }}
              >
                {metric.sub}
              </span>
            )}

            {/* Label — caption 14px */}
            <span
              className="mt-2 text-center"
              style={{
                color:      C.textSub,
                fontSize:   T.caption,
                fontWeight: 500,
                lineHeight: 1.3,
                fontFamily: "inherit",
              }}
            >
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Date stamp — caption */}
      <div
        className="px-5 py-2 flex items-center justify-center"
        style={{ borderTop: `1px solid rgba(203,213,225,0.25)` }}
      >
        <span
          style={{
            color:      C.textMuted,
            fontSize:   T.caption,
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          Monday, March 2, 2026 · Updated 9:45 AM
        </span>
      </div>
    </div>
  );
}