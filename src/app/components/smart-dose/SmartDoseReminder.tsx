/**
 * MediFlow · Smart Dose Reminder Overlay
 * ═══════════════════════════════════════════════════════════════
 * Design rules (MediFlow spec):
 *   • Primary "Log Dose" button: Darkened Sage #5E8271 — 56px height
 *   • Three snooze presets (1h, 2h, 4h): Secondary Slate (#475569) outlined buttons
 *   • Space between ALL buttons: minimum 12px (snoozeGap token) — accidental tap prevention
 *   • Touch targets: 56px min height universally
 *   • Typography: H1=37px, Body=27px, Labels=21px, line-height 1.5×
 *   • Status communicated via icon + color + text (WCAG — never color alone)
 *   • Background: Deep Slate overlay behind the card
 */

import { useState } from "react";
import {
  Pill, Clock, CheckCircle, BellOff, ChevronRight,
  Moon, AlertTriangle, Bell, X,
} from "lucide-react";
import { MF_C, MF_T, MF_L } from "../../design/mediflow";

interface DoseReminderProps {
  medicationName: string;
  dosage:         string;
  instruction:    string;
  scheduledTime:  string;
  onClose:        () => void;
}

type ReminderState = "pending" | "logged" | "snoozed" | "dismissed";

// ── Snooze presets ─────────────────────────────────────────────────────────────
const SNOOZE_OPTIONS: { label: string; hours: number; ariaLabel: string }[] = [
  { label: "1h",  hours: 1, ariaLabel: "Snooze reminder for 1 hour"  },
  { label: "2h",  hours: 2, ariaLabel: "Snooze reminder for 2 hours" },
  { label: "4h",  hours: 4, ariaLabel: "Snooze reminder for 4 hours" },
];

export function SmartDoseReminder({
  medicationName,
  dosage,
  instruction,
  scheduledTime,
  onClose,
}: DoseReminderProps) {
  const [state,       setState]       = useState<ReminderState>("pending");
  const [snoozeHours, setSnoozeHours] = useState<number | null>(null);

  function handleLog() {
    setState("logged");
    setTimeout(onClose, 1800);
  }

  function handleSnooze(hours: number) {
    setSnoozeHours(hours);
    setState("snoozed");
    setTimeout(onClose, 2200);
  }

  function handleDismiss() {
    setState("dismissed");
    setTimeout(onClose, 1400);
  }

  return (
    <div
      style={{
        position:  "fixed",
        inset:     0,
        zIndex:    500,
        background:"rgba(17,24,32,0.92)",
        display:   "flex",
        alignItems:"flex-end",
        justifyContent:"center",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Dose reminder for ${medicationName}`}
    >
      {/* Bottom sheet card */}
      <div
        style={{
          width:        "100%",
          maxWidth:     MF_L.maxWidth,
          background:   MF_C.bg,
          borderRadius: `${MF_L.r2xl}px ${MF_L.r2xl}px 0 0`,
          paddingBottom:40,
          overflow:     "hidden",
        }}
      >
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: MF_C.border }} aria-hidden="true" />
        </div>

        {/* ── Header row ── */}
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            padding:       `${MF_L.s1}px ${MF_L.s3}px ${MF_L.s2}px`,
          }}
        >
          {/* Bell + "Dose Reminder" label */}
          <div style={{ display: "flex", alignItems: "center", gap: MF_L.s1 }}>
            <div
              style={{
                width:          40,
                height:         40,
                background:     MF_C.primaryLight,
                border:         `1px solid ${MF_C.primaryBorder}`,
                borderRadius:   MF_L.rMd,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <Bell size={18} color={MF_C.primary} />
            </div>
            <div>
              <p
                style={{
                  color:         MF_C.text,
                  fontSize:      MF_T.micro,
                  fontWeight:    700,
                  letterSpacing: "0.1em",
                  fontFamily:    MF_T.family,
                  margin:        0,
                  textTransform: "uppercase",
                }}
              >
                DOSE REMINDER
              </p>
              <p
                style={{
                  color:      MF_C.text,
                  fontSize:   MF_T.micro,
                  fontFamily: MF_T.family,
                  margin:     0,
                }}
              >
                Scheduled for {scheduledTime}
              </p>
            </div>
          </div>

          {/* X dismiss */}
          <button
            onClick={handleDismiss}
            style={{
              width:          40,
              height:         40,
              background:     MF_C.locked,
              border:         "none",
              borderRadius:   MF_L.rMd,
              color:          MF_C.text,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
            aria-label="Dismiss this reminder"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Medication identity ── */}
        <div
          style={{
            margin:       `0 ${MF_L.s3}px ${MF_L.s3}px`,
            background:   MF_C.surface,
            border:       `1px solid ${MF_C.border}`,
            borderRadius: MF_L.rLg,
            padding:      MF_L.s2,
            display:      "flex",
            alignItems:   "center",
            gap:          MF_L.s2,
          }}
        >
          <div
            style={{
              width:          60,
              height:         60,
              background:     `${MF_C.primary}14`,
              border:         `1px solid ${MF_C.primaryBorder}`,
              borderRadius:   MF_L.rLg,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
            aria-hidden="true"
          >
            <Pill size={28} color={MF_C.primary} />
          </div>

          <div>
            {/* H1 — 37px / 28pt Montserrat Bold */}
            <p
              style={{
                color:      MF_C.textStrong,
                fontSize:   MF_T.h1,          /* 37px / 28pt */
                fontWeight: MF_T.h1Weight,
                lineHeight: `${MF_T.h1Line}px`,
                fontFamily: MF_T.family,
                margin:     0,
              }}
            >
              {medicationName}
            </p>
            {/* Body L — 27px / 20pt */}
            <p
              style={{
                color:      MF_C.text,
                fontSize:   MF_T.bodyL,        /* 27px / 20pt */
                fontWeight: MF_T.bodyLWeight,
                lineHeight: `${MF_T.bodyLLine}px`,
                fontFamily: MF_T.family,
                margin:     "2px 0 0 0",
              }}
            >
              {dosage}
            </p>
          </div>
        </div>

        {/* ── Intake instruction — Body L 27px ── */}
        <div
          style={{
            margin:       `0 ${MF_L.s3}px ${MF_L.s3}px`,
            background:   MF_C.warningLight,
            border:       `1px solid ${MF_C.warningBorder}`,
            borderRadius: MF_L.rLg,
            padding:      `${MF_L.s1}px ${MF_L.s2}px`,
            display:      "flex",
            alignItems:   "center",
            gap:          MF_L.s1,
          }}
          role="note"
          aria-label={`Intake instruction: ${instruction}`}
        >
          {/* Icon (WCAG: never color alone) */}
          <AlertTriangle size={20} color={MF_C.warning} aria-hidden="true" />
          <p
            style={{
              color:      MF_C.warningDark,
              fontSize:   MF_T.bodyL,         /* 27px / 20pt — required for instructions */
              fontWeight: 600,
              lineHeight: `${MF_T.bodyLLine}px`,
              fontFamily: MF_T.family,
              margin:     0,
            }}
          >
            {instruction}
          </p>
        </div>

        {/* ── State: feedback messages ── */}
        {state !== "pending" && (
          <div
            style={{
              margin:       `0 ${MF_L.s3}px ${MF_L.s2}px`,
              background:   state === "logged" ? MF_C.successLight
                : state === "snoozed" ? MF_C.warningLight
                : MF_C.locked,
              border:       `1px solid ${
                state === "logged" ? MF_C.successBorder
                : state === "snoozed" ? MF_C.warningBorder
                : MF_C.border
              }`,
              borderRadius: MF_L.rLg,
              padding:      `${MF_L.s1}px ${MF_L.s2}px`,
              display:      "flex",
              alignItems:   "center",
              gap:          MF_L.s1,
            }}
            role="status"
            aria-live="polite"
          >
            {state === "logged"    && <CheckCircle size={20} color={MF_C.success} aria-hidden="true" />}
            {state === "snoozed"   && <Clock       size={20} color={MF_C.warning} aria-hidden="true" />}
            {state === "dismissed" && <BellOff     size={20} color={MF_C.text}    aria-hidden="true" />}

            <span
              style={{
                color:      state === "logged"    ? MF_C.successDark
                  : state === "snoozed"   ? MF_C.warningDark
                  : MF_C.textStrong,
                fontSize:   MF_T.bodyL,
                fontWeight: 700,
                fontFamily: MF_T.family,
                lineHeight: `${MF_T.bodyLLine}px`,
              }}
            >
              {state === "logged"    && "Dose logged! Great work. ✓"}
              {state === "snoozed"   && `Reminder snoozed — ${snoozeHours}h`}
              {state === "dismissed" && "Reminder dismissed"}
            </span>
          </div>
        )}

        {/* ── CTA Section ── */}
        {state === "pending" && (
          <div
            style={{
              padding:       `0 ${MF_L.s3}px`,
              display:       "flex",
              flexDirection: "column",
              gap:           MF_L.snoozeGap,   /* 12px mandatory gap (accidental tap prevention) */
            }}
          >
            {/* ─────────────────────────────────────────────────────────────
                PRIMARY ACTION: Log Dose
                Color: Darkened Sage #5E8271 (MF_C.primary)
                Height: 56px (MF_L.touch)
                ───────────────────────────────────────────────────────────── */}
            <button
              onClick={handleLog}
              style={{
                width:          "100%",
                minHeight:      MF_L.touch,   /* 56px — touch target */
                background:     MF_C.primary, /* #5E8271 Darkened Sage */
                border:         "none",
                borderRadius:   MF_L.rLg,
                color:          MF_C.textOnDark,
                fontSize:       MF_T.bodyL,   /* 27px / 20pt */
                fontWeight:     700,
                fontFamily:     MF_T.family,
                lineHeight:     `${MF_T.bodyLLine}px`,
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            MF_L.s1,
                transition:     "background 0.15s ease, transform 0.1s ease",
              }}
              aria-label={`Log dose — ${medicationName} ${dosage}`}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primaryDark; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primary; }}
              onMouseDown={(e)  => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
              onMouseUp={(e)    => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <CheckCircle size={22} />
              Log Dose
            </button>

            {/* Gap: MF_L.snoozeGap (12px) is handled by the parent flex gap */}

            {/* ─────────────────────────────────────────────────────────────
                SNOOZE PRESETS: 1h | 2h | 4h
                Secondary Slate buttons — outlined, Deep Slate #475569
                Each button: 56px min height · 12px gap between (flex gap)
                ───────────────────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                gap:     MF_L.snoozeGap,   /* 12px between snooze buttons */
              }}
            >
              {SNOOZE_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => handleSnooze(opt.hours)}
                  style={{
                    flex:           1,
                    minHeight:      MF_L.touch,         /* 56px touch target */
                    background:     MF_C.surface,
                    border:         `2px solid ${MF_C.text}`, /* Deep Slate #475569 */
                    borderRadius:   MF_L.rLg,
                    color:          MF_C.text,          /* Deep Slate #475569 */
                    fontSize:       MF_T.bodyL,         /* 27px / 20pt */
                    fontWeight:     700,
                    fontFamily:     MF_T.family,
                    cursor:         "pointer",
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            2,
                    transition:     "background 0.15s ease, color 0.15s ease",
                  }}
                  aria-label={opt.ariaLabel}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = MF_C.text;
                    el.style.color      = MF_C.textOnDark;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = MF_C.surface;
                    el.style.color      = MF_C.text;
                  }}
                >
                  {/* Icon — status communicated by icon + color + text */}
                  {opt.hours === 4
                    ? <Moon size={16} />
                    : <Clock size={16} />
                  }
                  {opt.label}
                </button>
              ))}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                GAP below snooze row: 12px (handled by parent flex gap)
                DISMISS link — tertiary, below 12px gap
                ───────────────────────────────────────────────────────────── */}
            <button
              onClick={handleDismiss}
              style={{
                background:          "transparent",
                border:              "none",
                color:               MF_C.textMuted,
                fontSize:            MF_T.label,     /* 21px / 16pt */
                fontWeight:          MF_T.labelWeight,
                fontFamily:          MF_T.family,
                lineHeight:          `${MF_T.labelLine}px`,
                cursor:              "pointer",
                textDecoration:      "underline",
                textDecorationColor: `${MF_C.textMuted}60`,
                textUnderlineOffset: "3px",
                padding:             `${MF_L.s0}px 0`,
                minHeight:           "auto",
                alignSelf:           "center",
              }}
              aria-label="Dismiss reminder without logging"
            >
              Dismiss reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
