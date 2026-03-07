/**
 * HealthPulse · RecentActivity timeline
 * Tokens: C.text, C.textSub, C.success, C.alert, C.border
 * Typography: BodyL 18px data, Caption 14px meta
 */

import { Pill, Heart, ClipboardList, Calendar, CheckCircle, CircleX, AlertTriangle } from "lucide-react";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getTimelineEntries, formatDateTime, type TimelineEntry } from "../../data/helpers";
import type { StatusType } from "../shared/StatusBadge";
import { C, T, L } from "../../design/tokens";

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  let icon:        React.ReactNode;
  let typeLabel:   string;
  let valueText:   string;
  let statusType:  StatusType;
  let timeStr:     string;

  switch (entry.kind) {
    case "medication_log": {
      const log = entry.data;
      icon      = <Pill size={14} color={log.status === "taken" ? C.success : C.alert} />;
      typeLabel = "Medication";
      valueText = `${log.medicationName} – ${log.status === "taken" ? "Taken" : "Missed"}`;
      statusType = log.status === "taken" ? "completed" : "missed";
      timeStr   = formatDateTime(log.timestamp);
      break;
    }
    case "observation": {
      const obs = entry.data;
      icon      = <Heart size={14} color={obs.status === "normal" ? C.success : C.alert} />;
      typeLabel = "Vital";
      valueText = `${obs.type}: ${obs.value} ${obs.unit}`;
      statusType = obs.status as StatusType;
      timeStr   = formatDateTime(obs.effectiveDateTime);
      break;
    }
    case "task": {
      const task = entry.data;
      icon       = <ClipboardList size={14} color={C.success} />;
      typeLabel  = "Task";
      valueText  = task.description;
      statusType = "completed";
      timeStr    = formatDateTime(task.completedAt!);
      break;
    }
    case "appointment": {
      const appt = entry.data;
      icon       = <Calendar size={14} color={C.secondary} />;
      typeLabel  = "Appointment";
      valueText  = `${appt.type} – ${appt.provider}`;
      statusType = "scheduled";
      timeStr    = formatDateTime(appt.start);
      break;
    }
  }

  const isNegative    = ["missed", "overdue", "warning", "critical", "urgent"].includes(statusType);
  const StatusIcon    = isNegative ? (statusType === "missed" ? CircleX : AlertTriangle) : CheckCircle;
  const statusIconClr = isNegative ? C.alert : C.success;
  const statusTextClr = isNegative ? C.alertText : C.successDark;
  const statusLabel   = {
    completed: "COMPLETED", missed: "MISSED", normal: "NORMAL",
    warning: "WARNING", critical: "CRITICAL", urgent: "URGENT",
    scheduled: "SCHEDULED", overdue: "OVERDUE", upcoming: "UPCOMING",
    immediate: "IMMEDIATE",
  }[statusType];

  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: `1px solid ${C.borderLight}` }}
    >
      {/* Icon circle */}
      <div
        className="flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          width:      36,
          height:     36,
          background: isNegative ? C.alertLight : C.successLight,
          border:     `1px solid ${isNegative ? C.alertBorder : C.successBorder}`,
          marginTop:  2,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            style={{
              color:         C.secondary,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.08em",
              fontFamily:    "inherit",
            }}
          >
            {typeLabel.toUpperCase()}
          </span>
          {/* Timestamp — caption 14px medium */}
          <span
            style={{
              color:      C.textMuted,
              fontSize:   T.caption,
              fontWeight: 500,
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            {timeStr}
          </span>
        </div>

        {/* Description — BodyL 18px (patient-facing data) */}
        <p
          style={{
            color:         C.text,
            fontSize:      T.bodySm,
            fontWeight:    500,
            lineHeight:    1.4,
            fontFamily:    "inherit",
            whiteSpace:    "nowrap",
            overflow:      "hidden",
            textOverflow:  "ellipsis",
          }}
          title={valueText}
        >
          {valueText}
        </p>

        {/* Status — icon + text + color (WCAG) */}
        <div className="flex items-center gap-1 mt-1">
          <StatusIcon size={10} color={statusIconClr} aria-hidden="true" />
          <span
            style={{
              color:         statusTextClr,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.08em",
              fontFamily:    "inherit",
            }}
            role="status"
            aria-label={statusLabel}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RecentActivity() {
  const { data } = useDashboardContext();
  const entries = data
    ? getTimelineEntries(data.medicationLogs, data.observations, data.tasks, data.appointments)
    : [];

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 12px rgba(0,0,0,0.08)",
      }}
      role="region"
      aria-label="Recent activity timeline"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
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
          RECENT ACTIVITY
        </span>
        <span
          style={{
            color:      C.textMuted,
            fontSize:   T.caption,
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          Last {entries.length} entries
        </span>
      </div>

      {entries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-8 mx-5 my-4 rounded-xl"
          style={{ border: `1px solid ${C.border}` }}
          role="status"
        >
          <ClipboardList size={24} color={C.textMuted} />
          <p
            className="mt-2"
            style={{ color: C.textMuted, fontSize: T.bodySm, fontFamily: "inherit" }}
          >
            No recent activity
          </p>
        </div>
      ) : (
        <div className="px-5 pb-2" aria-live="polite">
          {entries.map((entry, i) => (
            <TimelineItem key={`${entry.kind}-${entry.data.id}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}