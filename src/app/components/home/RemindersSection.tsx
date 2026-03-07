/**
 * HealthPulse · RemindersSection
 * Tokens: Alert #D4A373, Success #B5C99A, Secondary #64748B
 * Touch targets: min-height 56px
 */

import { Bell, Activity, Pill, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { C, T, L } from "../../design/tokens";

export interface Reminder {
  id:     string;
  icon:   React.ComponentType<{ size?: number; color?: string }>;
  text:   string;
  detail: string;
  status: "upcoming" | "overdue" | "immediate";
  /** Medication name tied to overdue dose reminders */
  medicationName?: string;
  medicationDosage?: string;
  medicationInstruction?: string;
}

const reminders: Reminder[] = [
  {
    id:     "R001",
    icon:   Pill,
    text:   "Morning medication dose overdue",
    detail: "Lisinopril 10mg · Was due at 9:00 AM",
    status: "overdue",
    medicationName: "Lisinopril",
    medicationDosage: "10mg",
    medicationInstruction: "Take with food",
  },
  {
    id:     "R002",
    icon:   Activity,
    text:   "Next BP log due soon",
    detail: "Due in 1 hour · 10:45 AM",
    status: "upcoming",
  },
  {
    id:     "R003",
    icon:   Calendar,
    text:   "Lab appointment tomorrow",
    detail: "Dr. James Park · 2:00 PM · In-Person",
    status: "upcoming",
  },
];

const STATUS_MAP = {
  upcoming: {
    label:     "UPCOMING",
    iconColor: C.primary,
    textColor: "#2D6A5A",
    bg:        "rgba(142,175,157,0.10)",
    border:    "rgba(142,175,157,0.28)",
    Icon:      Clock,
  },
  overdue: {
    label:     "OVERDUE",
    iconColor: C.alert,
    textColor: C.alertText,
    bg:        C.alertLight,
    border:    C.alertBorder,
    Icon:      AlertTriangle,
  },
  immediate: {
    label:     "IMMEDIATE",
    iconColor: C.alert,
    textColor: C.alertText,
    bg:        C.alertLight,
    border:    "rgba(212,163,115,0.4)",
    Icon:      AlertTriangle,
  },
};

function ReminderItem({
  reminder,
  onOverdueClick,
}: {
  reminder: Reminder;
  onOverdueClick?: (reminder: Reminder) => void;
}) {
  const cfg               = STATUS_MAP[reminder.status];
  const { icon: RemIcon } = reminder;
  const { Icon: StatusIcon } = cfg;

  const isOverdue = reminder.status === "overdue" || reminder.status === "immediate";
  const isClickable = isOverdue && !!onOverdueClick;

  function handleClick() {
    if (isClickable) onOverdueClick!(reminder);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOverdueClick!(reminder);
    }
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 ${isClickable ? "cursor-pointer" : ""}`}
      style={{
        background: cfg.bg,
        border:     `1px solid ${cfg.border}`,
        minHeight:  L.touch,              /* 56px touch target */
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${reminder.text} — tap to open routine reminder` : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = cfg.iconColor;
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 12px ${cfg.iconColor}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = cfg.border;
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }
      }}
    >
      {/* Type icon */}
      <div
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{
          width:      40,
          height:     40,
          background: C.card,
          border:     `1px solid ${cfg.border}`,
          boxShadow:  "0 1px 4px rgba(0,0,0,0.06)",
        }}
        aria-hidden="true"
      >
        <RemIcon size={18} color={cfg.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          style={{
            color:      C.text,
            fontSize:   T.bodySm,
            fontWeight: 600,
            lineHeight: 1.4,
            fontFamily: "inherit",
          }}
        >
          {reminder.text}
        </p>
        <p
          style={{
            color:      C.textSub,
            fontSize:   T.caption,         /* 14px medium */
            fontWeight: 500,
            marginTop:  2,
            fontFamily: "inherit",
          }}
        >
          {reminder.detail}
        </p>

        {/* Status — icon + label + color (WCAG rule) */}
        <div className="flex items-center gap-1 mt-1.5">
          <StatusIcon size={10} color={cfg.iconColor} aria-hidden="true" />
          <span
            style={{
              color:         cfg.textColor,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.08em",
              fontFamily:    "inherit",
            }}
            role="status"
            aria-label={cfg.label}
          >
            {cfg.label}
          </span>
          {isClickable && (
            <span
              style={{
                color:      cfg.textColor,
                fontSize:   T.nano,
                fontWeight: 600,
                fontFamily: "inherit",
                marginLeft: 4,
                opacity:    0.75,
              }}
              aria-hidden="true"
            >
              · Tap to resolve
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface RemindersSectionProps {
  onOverdueClick?: (reminder: Reminder) => void;
}

export function RemindersSection({ onOverdueClick }: RemindersSectionProps) {
  const overdueCount = reminders.filter(
    (r) => r.status === "overdue" || r.status === "immediate"
  ).length;

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 8px rgba(0,0,0,0.08)",
      }}
      role="region"
      aria-label="Health reminders"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
          background:   "rgba(142,175,157,0.06)",
        }}
      >
        <Bell size={13} color={C.secondary} aria-hidden="true" />
        <span
          style={{
            color:         C.textSub,
            fontSize:      T.nano,
            fontWeight:    700,
            letterSpacing: "0.1em",
            fontFamily:    "inherit",
          }}
        >
          REMINDERS
        </span>
        {overdueCount > 0 && (
          <span
            className="ml-auto flex items-center gap-1"
            style={{
              color:         C.alertText,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.06em",
              fontFamily:    "inherit",
            }}
            role="status"
          >
            <AlertTriangle size={10} color={C.alert} />
            {overdueCount} overdue
          </span>
        )}
      </div>

      {/* List */}
      <div className="p-4 flex flex-col gap-2.5" aria-live="polite">
        {reminders.map((r) => (
          <ReminderItem key={r.id} reminder={r} onOverdueClick={onOverdueClick} />
        ))}
      </div>
    </div>
  );
}