/**
 * HealthPulse · Routine-Anchored Reminder (Sprint 5 — Smart Dose Reminder V2)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Instead of clock-based "Take at 9:00 AM", this anchors reminders to daily
 * routines: "With breakfast", "After lunch", "At bedtime".
 *
 * Features:
 *   - Routine anchors with contextual icons
 *   - "I'll take it with my next meal" snooze option
 *   - Quick-log with guidance badge
 *   - Links to MissedDoseRecovery if user marks "missed"
 *
 * WCAG 2.1 AA · 56px touch targets · Montserrat · 8px grid
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import {
  Coffee, Sun, Sunset, Moon,
  Pill, CheckCircle, Clock, AlertTriangle,
  Utensils, X, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { C, T, L } from "../../design/tokens";

// ── Routine anchors ──────────────────────────────────────────────────────────
export type RoutineAnchor = "morning" | "breakfast" | "lunch" | "dinner" | "bedtime";

interface RoutineConfig {
  label:    string;
  sublabel: string;
  icon:     React.ComponentType<{ size?: number; color?: string }>;
  color:    string;
  bgColor:  string;
}

const ROUTINE_MAP: Record<RoutineAnchor, RoutineConfig> = {
  morning:   { label: "Morning routine",  sublabel: "When you wake up",     icon: Sun,     color: C.alert,       bgColor: C.alertLight },
  breakfast: { label: "With breakfast",    sublabel: "Take with food",       icon: Coffee,  color: "#7C5A35",     bgColor: "rgba(163,120,78,0.10)" },
  lunch:     { label: "With lunch",        sublabel: "Midday with food",     icon: Utensils, color: C.primaryDark, bgColor: C.primaryLight },
  dinner:    { label: "With dinner",       sublabel: "Evening with food",    icon: Sunset,  color: C.tealDark,    bgColor: C.tealLight },
  bedtime:   { label: "At bedtime",        sublabel: "Before you sleep",     icon: Moon,    color: "#5B5080",     bgColor: "rgba(91,80,128,0.10)" },
};

// ── Defer options ────────────────────────────────────────────────────────────
const DEFER_OPTIONS: { label: string; anchor: RoutineAnchor; ariaLabel: string }[] = [
  { label: "With lunch",  anchor: "lunch",   ariaLabel: "Defer to lunch" },
  { label: "With dinner", anchor: "dinner",  ariaLabel: "Defer to dinner" },
  { label: "At bedtime",  anchor: "bedtime", ariaLabel: "Defer to bedtime" },
];

interface RoutineReminderProps {
  medicationName:  string;
  dosage:          string;
  instruction:     string;       // e.g., "Take with food"
  routineAnchor:   RoutineAnchor;
  onLogDose:       () => void;
  onMissed:        () => void;   // triggers MissedDoseRecovery
  onClose:         () => void;
}

type ReminderState = "pending" | "logged" | "deferred" | "missed";

export function RoutineReminder({
  medicationName,
  dosage,
  instruction,
  routineAnchor,
  onLogDose,
  onMissed,
  onClose,
}: RoutineReminderProps) {
  const [state, setState]          = useState<ReminderState>("pending");
  const [deferredTo, setDeferredTo] = useState<RoutineAnchor | null>(null);

  const routine = ROUTINE_MAP[routineAnchor];
  const RoutineIcon = routine.icon;

  function handleLog() {
    setState("logged");
    onLogDose();
    toast.success(`${medicationName} logged!`);
    setTimeout(onClose, 1800);
  }

  function handleDefer(anchor: RoutineAnchor) {
    setDeferredTo(anchor);
    setState("deferred");
    toast.info(`Moved to ${ROUTINE_MAP[anchor].label.toLowerCase()}.`);
    setTimeout(onClose, 2000);
  }

  function handleMissed() {
    setState("missed");
    setTimeout(() => {
      onMissed();
      onClose();
    }, 600);
  }

  // Filter defer options to only show anchors AFTER the current one
  const anchorOrder: RoutineAnchor[] = ["morning", "breakfast", "lunch", "dinner", "bedtime"];
  const currentIdx = anchorOrder.indexOf(routineAnchor);
  const availableDefers = DEFER_OPTIONS.filter(
    d => anchorOrder.indexOf(d.anchor) > currentIdx
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: "rgba(17,24,32,0.80)", backdropFilter: C.frostedBlur }}
      role="dialog"
      aria-modal="true"
      aria-label={`Routine reminder for ${medicationName}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
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
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width:      44,
                height:     44,
                background: routine.bgColor,
                border:     `1px solid ${routine.color}30`,
              }}
              aria-hidden="true"
            >
              <RoutineIcon size={22} color={routine.color} />
            </div>
            <div>
              <p style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                {routine.label.toUpperCase()}
              </p>
              <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>
                {medicationName} {dosage}
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
              cursor:     "pointer",
            }}
            aria-label="Close reminder"
          >
            <X size={16} />
          </button>
        </div>

        {/* Routine context */}
        <div
          className="mx-5 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: routine.bgColor, border: `1px solid ${routine.color}25` }}
        >
          <Clock size={14} color={routine.color} aria-hidden="true" />
          <span style={{ color: routine.color, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
            {routine.sublabel}
          </span>
        </div>

        {/* Intake instruction */}
        {instruction && (
          <div
            className="mx-5 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
            role="note"
            aria-label={`Instruction: ${instruction}`}
          >
            <AlertTriangle size={14} color={C.alert} aria-hidden="true" />
            <span style={{ color: C.alertText, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
              {instruction}
            </span>
          </div>
        )}

        {/* ── Feedback states ──────────────────────────────────────────── */}
        {state !== "pending" && (
          <div
            className="mx-5 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: state === "logged" ? C.successLight
                : state === "deferred" ? C.primaryLight
                : C.alertLight,
              border: `1px solid ${
                state === "logged" ? C.successBorder
                : state === "deferred" ? C.primaryBorder
                : C.alertBorder
              }`,
            }}
            role="status"
            aria-live="polite"
          >
            {state === "logged"   && <CheckCircle size={18} color={C.success} aria-hidden="true" />}
            {state === "deferred" && <Clock size={18} color={C.primary} aria-hidden="true" />}
            {state === "missed"   && <AlertTriangle size={18} color={C.alert} aria-hidden="true" />}
            <span
              style={{
                color:      state === "logged" ? C.successDark
                  : state === "deferred" ? C.primaryDark
                  : C.alertText,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {state === "logged" && "Dose logged! Great job."}
              {state === "deferred" && deferredTo && `Moved to ${ROUTINE_MAP[deferredTo].label.toLowerCase()}.`}
              {state === "missed" && "Opening recovery flow..."}
            </span>
          </div>
        )}

        {/* ── CTA Section ──────────────────────────────────────────────── */}
        {state === "pending" && (
          <div className="px-5 pb-8 flex flex-col gap-3">
            {/* Primary: Log Dose */}
            <button
              onClick={handleLog}
              className="w-full rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                background:  C.primary,
                color:       C.text,
                fontSize:    T.body,
                fontWeight:  700,
                fontFamily:  "inherit",
                border:      `1px solid ${C.primaryBorder}`,
                minHeight:   L.touch,
                cursor:      "pointer",
              }}
              aria-label={`Log dose of ${medicationName} ${dosage}`}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
            >
              <CheckCircle size={18} />
              Log Dose — Taken Now
            </button>

            {/* Defer options */}
            {availableDefers.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-1">
                  <Clock size={11} color={C.secondary} aria-hidden="true" />
                  <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
                    MOVE TO LATER
                  </span>
                </div>
                <div className="flex gap-3">
                  {availableDefers.map(d => {
                    const cfg = ROUTINE_MAP[d.anchor];
                    const DeferIcon = cfg.icon;
                    return (
                      <button
                        key={d.anchor}
                        onClick={() => handleDefer(d.anchor)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all"
                        style={{
                          minHeight:  L.touch + 8,
                          background: C.locked,
                          border:     `2px solid ${C.border}`,
                          cursor:     "pointer",
                        }}
                        aria-label={d.ariaLabel}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = cfg.color;
                          el.style.background = cfg.bgColor;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = C.border;
                          el.style.background = C.locked;
                        }}
                      >
                        <DeferIcon size={16} color={cfg.color} />
                        <span style={{ color: C.text, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
                          {d.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Mark as missed */}
            <button
              onClick={handleMissed}
              className="w-full flex items-center justify-center gap-2 transition-all"
              style={{
                background:          "transparent",
                border:              "none",
                color:               C.textSub,
                fontSize:            T.caption,
                fontWeight:          600,
                fontFamily:          "inherit",
                cursor:              "pointer",
                textDecoration:      "underline",
                textDecorationColor: `${C.textSub}50`,
                textUnderlineOffset: "3px",
                padding:             "8px 0",
                minHeight:           "auto",
              }}
              aria-label="Mark dose as missed and start recovery flow"
            >
              <AlertTriangle size={12} />
              I missed this dose
            </button>
          </div>
        )}
      </div>
    </div>
  );
}