import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Video,
  MapPin,
  Clock,
  AlarmClock,
  Pill,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getActiveState, formatTime, type ActiveState } from "../../data/helpers";
import { ReminderModal } from "./ReminderModal";
import { PillVisualizer } from "../shared/PillVisualizer";
import { C, T, L } from "../../design/tokens";

export function ActiveStateCard() {
  const navigate     = useNavigate();
  const { data } = useDashboardContext();
  const activeState  = data ? getActiveState(data.medications, data.appointments) : null;
  const [showReminder, setShowReminder] = useState(false);

  if (!activeState) {
    return (
      <div
        className="mx-4 rounded-2xl p-5"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
        aria-label="Active state widget – no upcoming actions"
      >
        <p className="text-center" style={{ color: C.textMuted, fontSize: T.bodySm, fontFamily: "inherit" }}>
          No upcoming actions in the next 12 hours
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
        role="region"
        aria-label="Active state: next priority action"
      >
        {/* Header strip */}
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: `1px solid ${C.borderLight}`, background: "rgba(142,175,157,0.07)" }}
        >
          <Clock size={12} color={C.secondary} />
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
            NEXT PRIORITY ACTION
          </span>
        </div>

        <div className="px-5 py-4" aria-live="polite">
          {activeState.kind === "medication" ? (
            <MedicationActiveState
              state={activeState}
              onLog={() => navigate("/medications")}
              onSnooze={() => setShowReminder(true)}
            />
          ) : (
            <AppointmentActiveState
              state={activeState}
              onView={() => navigate("/appointments")}
            />
          )}
        </div>
      </div>

      {showReminder && activeState.kind === "medication" && (
        <ReminderModal
          medication={activeState.medication}
          onClose={() => setShowReminder(false)}
          onLogDose={() => navigate("/medications")}
          onSnooze={(_hours) => setShowReminder(false)}
        />
      )}
    </>
  );
}

// ── Medication variant ─────────────────────────────────────────────────────────
function MedicationActiveState({
  state, onLog, onSnooze,
}: {
  state:    Extract<ActiveState, { kind: "medication" }>;
  onLog:    () => void;
  onSnooze: () => void;
}) {
  const isUrgent   = state.minutesUntil <= 30;
  const hoursUntil = Math.floor(state.minutesUntil / 60);
  const minsRem    = state.minutesUntil % 60;
  const timeStr    = hoursUntil > 0 ? `${hoursUntil}h ${minsRem}m` : `${state.minutesUntil} min`;

  return (
    <div className="flex flex-col gap-4">
      {/* Pill visual + info row */}
      <div className="flex items-start gap-3">
        {/* PillVisualizer — medication identity (User Story 3) */}
        <div className="flex-shrink-0">
          <PillVisualizer
            color={state.medication.color}
            shape={state.medication.shape}
            quickInstruction={state.medication.quickInstruction}
            size="sm"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              style={{
                color:         isUrgent ? C.alertText : C.successDark,
                fontSize:      T.nano,
                fontWeight:    700,
                letterSpacing: "0.08em",
                fontFamily:    "inherit",
              }}
            >
              MED DUE
            </span>
            {/* Status: color + icon + text */}
            {isUrgent ? (
              <span className="flex items-center gap-1" role="status" aria-label="Urgent">
                <AlertTriangle size={10} color={C.alert} />
                <span style={{ color: C.alertText, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>WARNING</span>
              </span>
            ) : (
              <span className="flex items-center gap-1" role="status" aria-label="Normal">
                <CheckCircle size={10} color={C.success} />
                <span style={{ color: C.successDark, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>NORMAL</span>
              </span>
            )}
          </div>

          {/* Medication name — BodyL 18px */}
          <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, lineHeight: 1.3, fontFamily: "inherit" }}>
            {state.medication.name} {state.medication.dosage}
          </p>
          <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, marginTop: 2, fontFamily: "inherit" }}>
            Next dose in{" "}
            <span style={{ color: isUrgent ? C.alertText : C.successDark, fontWeight: 700 }}>
              {timeStr}
            </span>{" "}
            · {formatTime(state.medication.nextDoseTime!)}
          </p>
        </div>
      </div>

      {/* CTAs — 56px touch target */}
      <div className="flex gap-2">
        <button
          onClick={onLog}
          className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background:    C.primary,
            color:         "#111820",
            fontSize:      T.bodySm,
            fontWeight:    700,
            letterSpacing: "0.02em",
            border:        "1px solid rgba(142,175,157,0.4)",
            fontFamily:    "inherit",
            minHeight:     L.touch,
          }}
          aria-label="Log medication intake"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
        >
          <Pill size={14} />
          Log Dose
        </button>
        <button
          onClick={onSnooze}
          className="rounded-xl px-4 flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: C.locked,
            color:      C.textSub,
            fontSize:   T.bodySm,
            fontWeight: 700,
            border:     `1px solid ${C.border}`,
            fontFamily: "inherit",
            minHeight:  L.touch,
          }}
          aria-label="Set a snooze reminder"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.border; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.locked; }}
        >
          <AlarmClock size={14} />
          Snooze
        </button>
      </div>
    </div>
  );
}

// ── Appointment variant ────────────────────────────────────────────────────────
function AppointmentActiveState({
  state, onView,
}: {
  state:  Extract<ActiveState, { kind: "appointment" }>;
  onView: () => void;
}) {
  const ModalityIcon = state.appointment.modality === "Video" ? Video : MapPin;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 48, height: 48, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}` }}
          aria-hidden="true"
        >
          <Calendar size={22} color={C.secondary} />
        </div>
        <div className="flex-1 min-w-0">
          <span style={{ color: C.secondary, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
            APPOINTMENT TODAY
          </span>
          <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, lineHeight: 1.3, fontFamily: "inherit", marginTop: 2 }}>
            {state.appointment.type}
          </p>
          <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, marginTop: 2, fontFamily: "inherit" }}>
            {formatTime(state.appointment.start)} · {state.appointment.provider}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <ModalityIcon size={11} color={C.textMuted} />
            <span style={{ color: C.textMuted, fontSize: T.micro, fontWeight: 500, fontFamily: "inherit" }}>
              {state.appointment.modality}
            </span>
          </div>
        </div>
      </div>

      {/* CTA — 56px */}
      <button
        onClick={onView}
        className="w-full rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
        style={{
          background: "transparent",
          color:      C.text,
          border:     `1px solid ${C.primary}`,
          fontSize:   T.bodySm,
          fontWeight: 700,
          fontFamily: "inherit",
          minHeight:  L.touch,
        }}
        aria-label="View appointment details"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; (e.currentTarget as HTMLButtonElement).style.color = "#111820"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
      >
        <Calendar size={15} />
        View Details
      </button>
    </div>
  );
}