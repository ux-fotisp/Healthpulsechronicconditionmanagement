/**
 * HealthPulse · MedicationsDueCard — with Contextual Intake Guidance (User Story 5)
 * ══════════════════════════════════════════════════════════════════════════════
 * • GuidanceBadge appears BELOW the medication name (universal symbol + 18px text)
 * • When "Log Intake" is pressed: confirmation feedback "Logged! Taken with food at 8:02 AM."
 * • Icons: Utensils (food), Droplets (water), AlertTriangle (avoid), etc.
 * • Text ≥18px (T.body) · 4.5:1 contrast on #FBFBFB ✓
 * • Touch targets: 56px minimum
 */

import { useState } from "react";
import { Pill, ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getMedicationsDueToday, MOCK_NOW, formatTime } from "../../data/helpers";
import { GuidanceBadge } from "../shared/GuidanceBadge";
import { PillBadge } from "../shared/PillVisualizer";
import { C, T, L } from "../../design/tokens";

// ── Per-medication row ─────────────────────────────────────────────────────────
interface MedRowProps {
  name:        string;
  dosage:      string;
  frequency:   string;
  nextDose:    string;
  instruction: string;
  color:       string;
  shape:       "round" | "oval" | "capsule" | "oblong";
  isUrgent:    boolean;
  onLog:       () => void;
  logged:      boolean;
  loggedAt:    string | null;
}

function MedRow({
  name, dosage, frequency, nextDose, instruction,
  color, shape, isUrgent, onLog, logged, loggedAt,
}: MedRowProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${isUrgent ? C.alertBorder : C.borderLight}`,
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Medication identity row */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Pill badge */}
        <PillBadge color={color} shape={shape} size="sm" />

        {/* Info block */}
        <div className="flex-1 min-w-0">
          {/* Name + dosage — BodyL 18px */}
          <p
            style={{
              color:      C.text,
              fontSize:   T.body,     /* 18px — patient-facing medication name */
              fontWeight: 700,
              lineHeight: 1.25,
              fontFamily: "inherit",
            }}
          >
            {name}
          </p>
          <p
            style={{
              color:      C.textSub,
              fontSize:   T.caption,
              fontWeight: 500,
              marginTop:  2,
              fontFamily: "inherit",
            }}
          >
            {dosage} · {frequency}
          </p>

          {/* Next dose time */}
          {nextDose && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock size={11} color={isUrgent ? C.alert : C.textMuted} />
              <span
                style={{
                  color:      isUrgent ? C.alertText : C.textSub,
                  fontSize:   T.caption,
                  fontWeight: isUrgent ? 700 : 500,
                  fontFamily: "inherit",
                }}
              >
                {isUrgent ? "Due soon" : "Next"}: {nextDose}
              </span>
              {isUrgent && (
                <AlertTriangle size={10} color={C.alert} aria-hidden="true" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Guidance Badge (US5) — BELOW medication name, full-width ── */}
      <div className="px-4 pb-3">
        <GuidanceBadge instruction={instruction} variant="block" />
      </div>

      {/* ── Log action ── */}
      <div
        className="px-4 pb-4"
        style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}
      >
        {logged ? (
          /* Confirmation feedback — "Logged! Taken with food at 8:02 AM." */
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3"
            style={{
              background: C.successLight,
              border:     `1px solid ${C.successBorder}`,
              minHeight:  L.touch,
            }}
            role="status"
            aria-live="polite"
          >
            <CheckCircle size={18} color={C.success} aria-hidden="true" />
            <div>
              <p
                style={{
                  color:      C.successDark,
                  fontSize:   T.body,       /* 18px — confirmation must be readable */
                  fontWeight: 700,
                  fontFamily: "inherit",
                  lineHeight: 1.2,
                }}
              >
                Logged! ✓
              </p>
              <p
                style={{
                  color:      C.successDark,
                  fontSize:   T.caption,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  marginTop:  1,
                  opacity:    0.8,
                }}
              >
                {instruction.toLowerCase().includes("food")
                  ? `Taken with food at ${loggedAt}`
                  : instruction.toLowerCase().includes("water")
                  ? `Taken with water at ${loggedAt}`
                  : `Dose logged at ${loggedAt}`}
              </p>
            </div>
          </div>
        ) : (
          /* Log Intake CTA — 56px touch target */
          <button
            onClick={onLog}
            className="w-full rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background:    C.primary,
              color:         C.text,
              fontSize:      T.body,        /* 18px — action button */
              fontWeight:    700,
              letterSpacing: "0.01em",
              border:        "1px solid rgba(142,175,157,0.4)",
              fontFamily:    "inherit",
              minHeight:     L.touch,       /* 56px WCAG touch target */
            }}
            aria-label={`Log intake of ${name} ${dosage} — ${instruction}`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
          >
            <Pill size={16} />
            Log Intake — {name} {dosage}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function MedicationsDueCard() {
  const navigate = useNavigate();
  const { data } = useDashboardContext();
  const dueMeds  = data ? getMedicationsDueToday(data.medications, data.medicationLogs) : [];
  const [loggedIds, setLoggedIds] = useState<Map<string, string>>(new Map());

  function handleLog(medId: string) {
    const timeStr = MOCK_NOW.toLocaleTimeString("en-US", {
      hour:   "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setLoggedIds((prev) => new Map([...prev, [medId, timeStr]]));
  }

  const activeMeds  = data ? data.medications.filter((m) => m.status === "active") : [];
  const allLogged   = loggedIds.size === dueMeds.length && dueMeds.length > 0;
  const isEmpty     = dueMeds.length === 0;

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 12px rgba(0,0,0,0.06)",
      }}
      role="region"
      aria-label="Medications due today"
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
          background:   "rgba(142,175,157,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <Pill size={14} color={allLogged ? C.success : C.primary} aria-hidden="true" />
          <span
            style={{
              color:         C.textSub,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.1em",
              fontFamily:    "inherit",
            }}
          >
            MEDICATIONS DUE TODAY
          </span>
        </div>
        {!isEmpty && (
          <span
            style={{
              color:         allLogged ? C.successDark : C.textSub,
              fontSize:      T.caption,
              fontWeight:    700,
              fontFamily:    "inherit",
            }}
          >
            {loggedIds.size}/{dueMeds.length} logged
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-3" aria-live="polite">
        {isEmpty ? (
          /* All medications logged */
          <div
            className="flex flex-col items-center justify-center py-5 rounded-2xl"
            style={{
              background: C.successLight,
              border:     `1px solid ${C.successBorder}`,
            }}
            role="status"
          >
            <CheckCircle size={28} color={C.success} />
            <p
              className="mt-2"
              style={{
                color:      C.successDark,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              All doses logged!
            </p>
            <p
              style={{
                color:      C.textSub,
                fontSize:   T.caption,
                fontFamily: "inherit",
                marginTop:  3,
              }}
            >
              Great adherence today, {/* patient first name */}Sarah.
            </p>
          </div>
        ) : (
          <>
            {dueMeds.map((med) => {
              const isLogged = loggedIds.has(med.id);
              const loggedAt = loggedIds.get(med.id) ?? null;
              const isUrgent = med.nextDoseTime !== null &&
                (med.nextDoseTime.getTime() - MOCK_NOW.getTime()) < 60 * 60 * 1000;

              return (
                <MedRow
                  key={med.id}
                  name={med.name}
                  dosage={med.dosage}
                  frequency={med.frequency}
                  nextDose={med.nextDoseTime ? formatTime(med.nextDoseTime) : ""}
                  instruction={med.quickInstruction}
                  color={med.color}
                  shape={med.shape}
                  isUrgent={isUrgent}
                  onLog={() => handleLog(med.id)}
                  logged={isLogged}
                  loggedAt={loggedAt}
                />
              );
            })}

            {/* View all link */}
            <button
              onClick={() => navigate("/medications")}
              className="flex items-center justify-center gap-1.5 transition-all"
              style={{
                background:          "transparent",
                border:              "none",
                color:               C.secondary,
                fontSize:            T.caption,
                fontWeight:          600,
                textDecoration:      "underline",
                textUnderlineOffset: "3px",
                textDecorationColor: "rgba(100,116,139,0.4)",
                fontFamily:          "inherit",
                cursor:              "pointer",
                padding:             "8px 0",
                minHeight:           "auto",
              }}
              aria-label="View all medications"
            >
              View all {activeMeds.length} active medications
              <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}