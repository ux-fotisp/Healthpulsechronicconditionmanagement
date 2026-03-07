/**
 * HealthPulse · ReminderModal — Intelligent Snooze Presets (User Story 2)
 * Tokens: primary #8EAF9D, alert #D4A373, bg #FBFBFB
 * Frosted glass backdrop: blur(20px) + rgba(255,255,255,0.6)
 * Snooze buttons: oversized touch targets (min 80px)
 */

import { useState } from "react";
import { Bell, Clock, Pill, X, CheckCircle, AlarmClock } from "lucide-react";
import { type Medication, formatTime } from "../../data/helpers";
import { C, T, L } from "../../design/tokens";

interface ReminderModalProps {
  medication: Medication;
  onClose:    () => void;
  onLogDose:  () => void;
  onSnooze:   (hours: number) => void;
}

const SNOOZE_OPTIONS = [
  { hours: 1, label: "1 hour" },
  { hours: 2, label: "2 hours" },
  { hours: 4, label: "4 hours" },
];

export function ReminderModal({ medication, onClose, onLogDose, onSnooze }: ReminderModalProps) {
  const [snoozed, setSnoozed] = useState<number | null>(null);
  const [logged,  setLogged]  = useState(false);

  const now = new Date(2026, 2, 2, 9, 45, 0);

  function getSnoozeTime(hours: number): string {
    const t = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return formatTime(t);
  }

  function handleSnooze(hours: number) {
    setSnoozed(hours);
    setTimeout(() => {
      onSnooze(hours);
      onClose();
    }, 900);
  }

  function handleLog() {
    setLogged(true);
    setTimeout(() => {
      onLogDose();
      onClose();
    }, 900);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: "rgba(17,24,32,0.75)", backdropFilter: C.frostedBlur }}
      role="dialog"
      aria-modal="true"
      aria-label="Dose reminder"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Bottom sheet */}
      <div
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          maxWidth:   L.maxWidth,
          background: C.bg,
          boxShadow:  "0 -8px 48px rgba(0,0,0,0.3)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
              aria-hidden="true"
            >
              <Bell size={22} color={C.alert} />
            </div>
            <div>
              <p style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                DOSE REMINDER
              </p>
              <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>
                {medication.name} {medication.dosage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{
              width:      44,
              height:     44,
              background: C.locked,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
              minHeight:  "auto",
            }}
            aria-label="Close reminder"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scheduled time row */}
        <div
          className="mx-5 mt-4 mb-2 flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: C.primaryLight, border: `1px solid rgba(142,175,157,0.25)` }}
        >
          <Clock size={14} color={C.primary} />
          <span style={{ color: C.successDark, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
            Scheduled for {medication.nextDoseTime ? formatTime(medication.nextDoseTime) : "—"}
          </span>
          <span style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit", marginLeft: "auto" }}>
            {medication.frequency}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-5 my-4" style={{ borderTop: `1px solid ${C.borderLight}` }} />

        {/* Primary CTA — Log Dose */}
        {logged ? (
          <div
            className="mx-5 mb-3 rounded-2xl py-4 flex items-center justify-center gap-2"
            style={{ background: C.successLight, border: `1px solid ${C.successBorder}` }}
            role="status"
            aria-live="polite"
          >
            <CheckCircle size={22} color={C.success} />
            <span style={{ color: C.successDark, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>
              Dose Logged!
            </span>
          </div>
        ) : (
          <button
            onClick={handleLog}
            className="mx-5 mb-3 w-[calc(100%-2.5rem)] rounded-2xl flex items-center justify-center gap-2 transition-all"
            style={{
              background: "#4A4D4C",
              border:     "1px solid rgba(142,175,157,0.4)",
              color:      "#FFFFFF",
              fontSize:   T.body,
              fontWeight: 700,
              fontFamily: "inherit",
              minHeight:  L.touch,         /* 56px WCAG touch target */
            }}
            aria-label={`Log dose of ${medication.name} as taken`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3A3D3C"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4A4D4C"; }}
          >
            <Pill size={18} color="#FFFFFF" />
            Log Dose — Taken Now
          </button>
        )}

        {/* Snooze section */}
        <div className="px-5 mb-2 flex items-center gap-2">
          <AlarmClock size={13} color={C.secondary} />
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
            SNOOZE REMINDER
          </span>
        </div>

        {/* Snooze buttons — oversized for fatigue accessibility */}
        <div className="px-5 pb-8 flex gap-3">
          {SNOOZE_OPTIONS.map((opt) => {
            const isActive = snoozed === opt.hours;
            return (
              <button
                key={opt.hours}
                onClick={() => handleSnooze(opt.hours)}
                className="flex-1 flex flex-col items-center justify-center rounded-2xl transition-all"
                style={{
                  paddingTop:    16,
                  paddingBottom: 16,
                  background:    isActive ? "rgba(142,175,157,0.2)" : C.locked,
                  border:        `2px solid ${isActive ? C.primary : C.border}`,
                  cursor:        "pointer",
                  minHeight:     88,         /* oversized for fatigued users */
                  minWidth:      0,
                }}
                aria-label={`Snooze for ${opt.label}, next reminder at ${getSnoozeTime(opt.hours)}`}
                aria-pressed={isActive}
              >
                <span
                  style={{
                    color:      isActive ? C.successDark : C.text,
                    fontSize:   22,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    lineHeight: 1,
                  }}
                >
                  {opt.hours}h
                </span>
                <span
                  style={{
                    color:      C.textSub,
                    fontSize:   T.caption,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    marginTop:  4,
                  }}
                >
                  {getSnoozeTime(opt.hours)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}