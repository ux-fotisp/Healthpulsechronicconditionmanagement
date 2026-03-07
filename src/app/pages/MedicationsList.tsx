import {
  Pill,
  ChevronLeft,
  CheckCircle,
  CircleX,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useMedications, useMedicationLogs, useLogDose, usePatient, useMedChangeRequests } from "../hooks/useHealthData";
import { hydrateMedications, hydrateMedLogs, MOCK_NOW, formatTime, type Medication, type MedicationLog, getPatientAge, type Patient } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PillBadge } from "../components/shared/PillVisualizer";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { MedicationEditor } from "../components/medications/MedicationEditor";
import { ProviderReviewPanel } from "../components/medications/ProviderReviewPanel";
import { C, T, L } from "../design/tokens";

function isTakenToday(medicationId: string, medLogs: MedicationLog[]): boolean {
  const todayStr = `${MOCK_NOW.getFullYear()}-${MOCK_NOW.getMonth()}-${MOCK_NOW.getDate()}`;
  return medLogs.some((log) => {
    const d = log.timestamp;
    const logDay = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return log.medicationId === medicationId && logDay === todayStr && log.status === "taken";
  });
}

// ── Active medication card ─────────────────────────────────────────────────────
function ActiveMedCard({
  med,
  onViewDetail,
  medLogs,
}: {
  med: Medication;
  onViewDetail: () => void;
  medLogs: MedicationLog[];
}) {
  const [open, setOpen] = useState(false);
  const takenToday = isTakenToday(med.id, medLogs);
  const isDue      = !takenToday && med.nextDoseTime && med.nextDoseTime > MOCK_NOW;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${isDue ? C.alertBorder : C.border}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${C.borderLight}` }}
      >
        <PillBadge color={med.color} shape={med.shape} size="sm" />
        <div className="flex-1 min-w-0">
          <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            {med.name}
          </p>
          <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", marginTop: 1 }}>
            {med.dosage} · {med.route}
          </p>
          <span
            className="inline-flex items-center gap-1 mt-1 rounded-full"
            style={{
              background:    C.secondaryLight,
              border:        `1px solid ${C.secondaryBorder}`,
              color:         C.secondaryDark,
              fontSize:      T.pill,
              fontWeight:    700,
              padding:       "2px 7px",
              letterSpacing: "0.03em",
              fontFamily:    "inherit",
            }}
            role="note"
          >
            {med.quickInstruction}
          </span>
        </div>
        <StatusBadge status={takenToday ? "completed" : isDue ? "upcoming" : "normal"} size="sm" />
      </div>

      {/* Primary info */}
      <div className="px-4 pt-3 flex items-center justify-between">
        {med.nextDoseTime ? (
          <div className="flex items-center gap-1.5">
            <Clock size={11} color={isDue ? C.alert : C.textMuted} />
            <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>Next dose:</span>
            <span style={{ color: isDue ? C.alertText : C.text, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
              {formatTime(med.nextDoseTime)}
            </span>
          </div>
        ) : (
          <span style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit" }}>
            No upcoming dose
          </span>
        )}

        {/* Expandable chevron — secondary details hidden by default (User Story 1) */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all"
          style={{
            background: open ? C.primaryLight : "transparent",
            border:     "none",
            color:      C.textSub,
            cursor:     "pointer",
            fontFamily: "inherit",
            fontSize:   T.caption,
            fontWeight: 600,
            minHeight:  "auto",
          }}
          aria-expanded={open}
          aria-label={open ? "Hide details" : "Show details"}
        >
          {open ? <><ChevronUp size={12} /><span>Less</span></> : <><ChevronDown size={12} /><span>More</span></>}
        </button>
      </div>

      {/* Secondary details — progressive disclosure */}
      {open && (
        <div
          className="mx-4 mt-2 mb-0 rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
          style={{ background: C.primaryLight, border: `1px solid rgba(142,175,157,0.2)` }}
          aria-label="Secondary medication details"
        >
          <div className="flex items-center justify-between">
            <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>Frequency</span>
            <span style={{ color: C.text, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}>{med.frequency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>Today's status</span>
            <div className="flex items-center gap-1">
              {takenToday ? (
                <>
                  <CheckCircle size={11} color={C.success} />
                  <span style={{ color: C.successDark, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>Taken</span>
                </>
              ) : (
                <>
                  {isDue ? <AlertTriangle size={11} color={C.alert} /> : <CircleX size={11} color={C.alert} />}
                  <span style={{ color: C.alertText, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
                    {isDue ? "Due" : "Not logged"}
                  </span>
                </>
              )}
            </div>
          </div>
          <p style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit", marginTop: 2 }}>
            Tap "Details" for prescribing doctor &amp; refill history
          </p>
        </div>
      )}

      {/* Actions — 56px touch target */}
      <div className="px-4 pb-4 pt-3 flex gap-2">
        {!takenToday && (
          <button
            className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              background: C.primary,
              color:      C.text,
              fontSize:   T.caption,
              fontWeight: 700,
              border:     "1px solid rgba(142,175,157,0.4)",
              fontFamily: "inherit",
              minHeight:  L.touch,
            }}
            aria-label={`Log intake for ${med.name}`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
          >
            <Pill size={13} />
            Log Intake
          </button>
        )}
        <button
          onClick={onViewDetail}
          className="rounded-xl px-3 flex items-center justify-center gap-1 transition-all"
          style={{
            background: C.secondaryLight,
            border:     `1px solid ${C.secondaryBorder}`,
            color:      C.secondaryDark,
            fontSize:   T.caption,
            fontWeight: 700,
            fontFamily: "inherit",
            minHeight:  L.touch,
          }}
          aria-label={`View details for ${med.name}`}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(100,116,139,0.18)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.secondaryLight; }}
        >
          Details
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function MedicationsList() {
  const navigate = useNavigate();
  const { data: rawMeds, loading: loadMeds, refetch: refetchMeds } = useMedications();
  const { data: rawLogs, loading: loadLogs } = useMedicationLogs();
  const { data: patient, loading: loadPatient } = usePatient();
  const { data: changeRequests } = useMedChangeRequests();
  const [showEditor, setShowEditor] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (loadMeds || loadLogs || loadPatient) return <PageSkeleton title="Medications" cardCount={3} />;

  const medications = rawMeds ? hydrateMedications(rawMeds) : [];
  const medLogs = rawLogs ? hydrateMedLogs(rawLogs) : [];
  const active   = medications.filter((m) => m.status === "active");
  const inactive = medications.filter((m) => m.status === "inactive");
  const patientAge = patient ? getPatientAge(patient as Patient) : 0;
  const pendingRequests = (changeRequests || []).filter((r: any) => r.status === "pending");

  return (
    <div style={{ background: C.shell, minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: `1px solid rgba(142,175,157,0.15)` }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-xl"
          style={{
            width:      L.touch,
            height:     L.touch,
            background: "rgba(251,251,251,0.06)",
            border:     "1px solid rgba(142,175,157,0.2)",
            color:      C.textOnDark,
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: C.textOnDark, fontSize: T.h1, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
            Medications
          </h1>
          <p style={{ color: C.textOnDarkMuted, fontSize: T.caption, fontFamily: "inherit" }}>
            Care Plan · Active Regimens
          </p>
        </div>

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-2">
          {pendingRequests.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="relative flex items-center justify-center rounded-xl transition-all"
              style={{
                width: L.touch, height: L.touch,
                background: "rgba(196,168,122,0.15)",
                border: "1px solid rgba(196,168,122,0.35)",
                color: "#C4A87A",
              }}
              aria-label={`Review ${pendingRequests.length} pending requests`}
            >
              <Stethoscope size={18} />
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                style={{
                  width: 18, height: 18,
                  background: C.terracotta,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "inherit",
                }}
              >
                {pendingRequests.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: L.touch, height: L.touch,
              background: "rgba(157,187,155,0.15)",
              border: "1px solid rgba(157,187,155,0.35)",
              color: C.primary,
            }}
            aria-label="Manage medications"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-[16px] m-[8px] rounded-2xl" style={{ background: "var(--hp-shell-2)" }}>
        {/* Active */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />
            <p style={{ color: C.textOnDarkSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              ACTIVE ({active.length})
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {active.map((med) => (
              <ActiveMedCard key={med.id} med={med} medLogs={medLogs} onViewDetail={() => navigate(`/medications/${med.id}`)} />
            ))}
          </div>
        </div>

        {/* Inactive */}
        {inactive.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.secondary }} />
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                INACTIVE ({inactive.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {inactive.map((med) => (
                <div
                  key={med.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(251,251,251,0.04)", border: "1px solid rgba(203,213,225,0.15)", opacity: 0.6 }}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{ width: 40, height: 40, background: "rgba(251,251,251,0.06)", border: `1px solid rgba(203,213,225,0.2)` }}
                    >
                      <Pill size={18} color="rgba(255,255,255,0.3)" />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>
                        {med.name}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: T.caption, fontFamily: "inherit", marginTop: 1 }}>
                        {med.dosage} · {med.route}
                      </p>
                    </div>
                    <span style={{ background: "rgba(203,213,225,0.1)", border: `1px solid rgba(203,213,225,0.2)`, color: "rgba(255,255,255,0.35)", fontSize: T.pill, fontWeight: 700, padding: "2px 8px", borderRadius: L.rFull, letterSpacing: "0.08em", fontFamily: "inherit" }}>
                      INACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditor && rawMeds && (
        <MedicationEditor
          onClose={() => setShowEditor(false)}
          medications={rawMeds}
          patientAge={patientAge}
          onSuccess={refetchMeds}
        />
      )}
      {showReview && (
        <ProviderReviewPanel
          onClose={() => setShowReview(false)}
          onActionComplete={refetchMeds}
        />
      )}
    </div>
  );
}