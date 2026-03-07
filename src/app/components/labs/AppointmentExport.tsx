/**
 * HealthPulse · AppointmentExport — User Story 3
 * ══════════════════════════════════════════════════════
 * "Doctor-Ready" clinical snapshot for brief consultations.
 *
 * Design spec:
 *   • White background (#FFFFFF) — zero decorative elements, print-safe
 *   • Montserrat, high-legibility typography
 *   • INFORMATION HIERARCHY (top to bottom):
 *       1. Patient header
 *       2. Overall Adherence Rate % ← MUST BE AT TOP
 *       3. Recent Lab Abnormalities ← MUST BE AT TOP
 *       4. Missed Doses (Pale Ochre #D4A373 highlight per missed entry)
 *       5. Vitals summary
 *   • Pale Ochre (#D4A373) to highlight missed doses and lab red flags
 *   • Print-friendly: @media print hides CTAs and shows only content
 *
 * This component is GATED — only rendered after biometric/password auth.
 */

import { useState } from "react";
import {
  X, Printer, Send, CheckCheck, AlertTriangle,
  CheckCircle, User, Shield,
} from "lucide-react";
import { usePatient, useAdherence, useLabs, useObservations, useMissedDoses } from "../../hooks/useHealthData";
import { hydrateLabResults, hydrateObservations, hydrateMissedDoses, getOverallAdherence, MOCK_NOW, type Observation, type MissedDoseSummary } from "../../data/helpers";
import { C, T, L, BRAND_NAME } from "../../design/tokens";

// ── Print-specific styles injected into <head> ─────────────────────────────────
const PRINT_STYLE = `
  @media print {
    body > *:not(#hp-appt-export) { display: none !important; }
    #hp-appt-export {
      position: static !important;
      max-width: 100% !important;
      background: #FFFFFF !important;
      overflow: visible !important;
    }
    .hp-no-print { display: none !important; }
    .hp-print-page {
      page-break-after: avoid;
      font-family: 'Montserrat', sans-serif;
    }
  }
`;

// ── Reusable clinical section header ─────────────────────────────────────────
function SectionDivider({ title }: { title: string }) {
  return (
    <div
      style={{
        borderTop:     "2px solid #000",
        paddingTop:    10,
        marginBottom:  10,
      }}
    >
      <p
        style={{
          color:         "#000",
          fontSize:      12,          /* Small caps for clinical readability */
          fontWeight:    700,
          letterSpacing: "0.1em",
          fontFamily:    "'Montserrat', sans-serif",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
    </div>
  );
}

// ── Per-medication adherence row (print) ─────────────────────────────────────
function AdherenceRow({
  name, dosage, taken, scheduled,
}: {
  name:      string;
  dosage:    string;
  taken:     number;
  scheduled: number;
}) {
  const pct   = Math.round((taken / scheduled) * 100);
  const isLow = pct < 80;

  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
        padding:       "6px 0",
        borderBottom:  "1px solid #E2E8F0",
      }}
    >
      <span style={{ color: "#1E293B", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>
        {name} {dosage}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#475569", fontSize: 12, fontFamily: "'Montserrat', sans-serif" }}>
          {taken}/{scheduled} doses
        </span>
        <span
          style={{
            color:         isLow ? "#92400E" : "#3D6B4F",
            fontSize:      14,
            fontWeight:    700,
            fontFamily:    "'Montserrat', sans-serif",
            minWidth:      44,
            textAlign:     "right",
            // Pale Ochre highlight for low adherence
            background:    isLow ? `${C.alert}22` : "transparent",
            padding:       isLow ? "1px 6px" : "0",
            borderRadius:  isLow ? 4 : 0,
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ── Missed dose row — highlighted with Pale Ochre ──────────────────────────────
function MissedDoseRow({
  name, dosage, date, scheduledTime, reason,
}: {
  name:          string;
  dosage:        string;
  date:          Date;
  scheduledTime: string;
  reason:        string;
}) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          10,
        padding:      "8px 10px",
        background:   `${C.alert}18`,    /* Pale Ochre tint — instant doctor scan */
        borderLeft:   `3px solid ${C.alert}`,
        borderRadius: "0 4px 4px 0",
        marginBottom: 6,
      }}
    >
      {/* Icon + label (WCAG: never color alone) */}
      <AlertTriangle size={14} color={C.alert} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: "#92400E", fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
          {name} {dosage} — MISSED
        </p>
        <p style={{ color: "#B45309", fontSize: 12, fontFamily: "'Montserrat', sans-serif", margin: "2px 0 0 0" }}>
          {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          {" "}· Scheduled {scheduledTime}
          {reason ? ` · ${reason}` : ""}
        </p>
      </div>
    </div>
  );
}

// ── Lab abnormality row — Pale Ochre if flagged ────────────────────────────────
function LabFindingRow({
  label, value, unit, status,
}: {
  label:  string;
  value:  string;
  unit:   string;
  status: "normal" | "warning" | "critical";
}) {
  const isFlag = status !== "normal";
  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
        padding:       "5px 10px",
        background:    isFlag ? `${C.alert}18` : "transparent",
        borderLeft:    isFlag ? `3px solid ${C.alert}` : "3px solid transparent",
        borderRadius:  "0 4px 4px 0",
        marginBottom:  4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isFlag
          ? <AlertTriangle size={12} color={C.alert} />
          : <CheckCircle size={12} color="#3D6B4F" />
        }
        <span style={{ color: "#1E293B", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>
          {label}
        </span>
      </div>
      <span
        style={{
          color:      isFlag ? "#92400E" : "#3D6B4F",
          fontSize:   13,
          fontWeight: 700,
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {value}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

// ── Main export component ─────────────────────────────────────────────────────
export function AppointmentExport({ onClose }: { onClose: () => void }) {
  const [shared,  setShared]  = useState(false);
  const [printed, setPrinted] = useState(false);

  const { data: rawPatient }   = usePatient();
  const { data: rawAdherence } = useAdherence();
  const { data: rawLabs }      = useLabs();
  const { data: rawObs }       = useObservations();
  const { data: rawMissed }    = useMissedDoses();

  const patient          = rawPatient ?? { id: "", name: "—", mrn: "—", birthDate: "", conditions: [] as string[], gender: "", contactPhone: "", contactEmail: "", preferredLanguage: "", careTeam: "" };
  const adherence30Day   = rawAdherence ?? [];
  const labResults       = hydrateLabResults(rawLabs ?? []);
  const observations     = hydrateObservations(rawObs ?? []);
  const missedDoses30Day = hydrateMissedDoses(rawMissed ?? []);
  const overallAdherence = getOverallAdherence(adherence30Day);
  const isLowAdherence   = overallAdherence < 80;
  const abnormals        = labResults.flatMap((r) =>
    r.highlights
      .filter((h) => h.status !== "normal")
      .map((h) => ({ ...h, labTitle: r.title, labDate: r.date }))
  );
  const latestBP = observations.find((o: Observation) => o.type === "Blood Pressure");
  const latestGlu = observations.find((o: Observation) => o.type === "Blood Glucose");

  const genDate = MOCK_NOW.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const period = `Feb 1 – ${MOCK_NOW.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  function handlePrint() {
    // Inject print styles once
    if (!document.getElementById("hp-print-style")) {
      const s = document.createElement("style");
      s.id = "hp-print-style";
      s.textContent = PRINT_STYLE;
      document.head.appendChild(s);
    }
    setPrinted(true);
    window.print();
    setTimeout(() => setPrinted(false), 2000);
  }

  function handleShare() {
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }

  return (
    <div
      id="hp-appt-export"
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     400,
        background: "#FFFFFF",   /* Pure white — print clean */
        maxWidth:   L.maxWidth,
        margin:     "0 auto",
        display:    "flex",
        flexDirection: "column",
        overflowY:  "auto",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Doctor Appointment Summary"
    >
      {/* ── App chrome top bar (no-print) ── */}
      <div
        className="hp-no-print flex items-center justify-between px-4 pt-10 pb-4 sticky top-0 z-10"
        style={{
          background:   "#FFFFFF",
          borderBottom: `1px solid ${C.border}`,
          boxShadow:    "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            style={{
              width:      44,
              height:     44,
              background: C.locked,
              border:     `1px solid ${C.border}`,
              borderRadius: L.rMd,
              color:      C.text,
              cursor:     "pointer",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              minHeight:  "auto",
            }}
            aria-label="Close export"
          >
            <X size={18} />
          </button>
          <div>
            {/* H1 26px */}
            <h1 style={{ color: C.text, fontSize: T.h1, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
              Appointment Summary
            </h1>
            <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>
              Doctor-Ready · {genDate}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          style={{
            width:        44,
            height:       44,
            background:   printed ? C.successLight : C.primaryLight,
            border:       `1px solid rgba(142,175,157,0.3)`,
            borderRadius: L.rMd,
            color:        C.successDark,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            flexShrink:   0,
            minHeight:    "auto",
          }}
          aria-label="Print summary"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CLINICAL DOCUMENT — clean white, print-safe
          ══════════════════════════════════════════════════════════ */}
      <div
        className="hp-print-page"
        style={{ padding: "24px 20px", flex: 1 }}
      >
        {/* ── Document title ── */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #000" }}>
          <p style={{ color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'Montserrat', sans-serif", margin: "0 0 4px 0" }}>
            HEALTHPULSE CLINICAL SUMMARY
          </p>
          <p style={{ color: "#000", fontSize: 17, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", margin: "0 0 4px 0" }}>
            Patient Appointment Report
          </p>
          <p style={{ color: "#475569", fontSize: 12, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
            30-Day Period: {period}
          </p>
        </div>

        {/* ── Patient Identity ── */}
        <SectionDivider title="Patient Information" />
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           12,
            marginBottom:  16,
            paddingBottom: 16,
            borderBottom:  "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              width:          44,
              height:         44,
              background:     "#F1F5F9",
              borderRadius:   "50%",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
            aria-hidden="true"
          >
            <User size={22} color="#64748B" />
          </div>
          <div>
            <p style={{ color: "#000", fontSize: 16, fontWeight: 800, fontFamily: "'Montserrat', sans-serif", margin: "0 0 2px 0" }}>
              {patient.name}
            </p>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
              MRN {patient.mrn} · DOB{" "}
              {new Date(patient.birthDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p style={{ color: "#64748B", fontSize: 12, fontFamily: "'Montserrat', sans-serif", margin: "2px 0 0 0" }}>
              {patient.conditions.join(" · ")}
            </p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ color: "#64748B", fontSize: 11, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>Care Team</p>
            <p style={{ color: "#1E293B", fontSize: 12, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", margin: "2px 0 0 0" }}>
              {patient.careTeam}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 1: OVERALL ADHERENCE RATE
            Placed at the TOP per information hierarchy spec
            ══════════════════════════════════════════════════ */}
        <SectionDivider title="1. Medication Adherence Rate — 30 Days" />

        {/* Large prominent % — doctor sees immediately */}
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           16,
            padding:       "12px 14px",
            background:    isLowAdherence ? `${C.alert}18` : `${C.success}14`,
            border:        `2px solid ${isLowAdherence ? C.alert : C.success}`,
            borderRadius:  8,
            marginBottom:  14,
          }}
        >
          <div style={{ textAlign: "center", minWidth: 72 }}>
            <p
              style={{
                color:         isLowAdherence ? "#92400E" : "#3D6B4F",
                fontSize:      42,
                fontWeight:    900,
                lineHeight:    1,
                fontFamily:    "'Montserrat', sans-serif",
                margin:        0,
              }}
            >
              {overallAdherence}%
            </p>
            <p
              style={{
                color:         isLowAdherence ? "#B45309" : "#4A7C42",
                fontSize:      10,
                fontWeight:    700,
                letterSpacing: "0.08em",
                fontFamily:    "'Montserrat', sans-serif",
                margin:        "3px 0 0 0",
              }}
            >
              OVERALL
            </p>
          </div>
          <div style={{ flex: 1, paddingLeft: 14, borderLeft: `1px solid ${isLowAdherence ? C.alert : C.success}60` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {isLowAdherence
                ? <AlertTriangle size={14} color={C.alert} />
                : <CheckCircle size={14} color={C.success} />
              }
              <span
                style={{
                  color:         isLowAdherence ? "#92400E" : "#3D6B4F",
                  fontSize:      13,
                  fontWeight:    700,
                  fontFamily:    "'Montserrat', sans-serif",
                }}
              >
                {isLowAdherence ? "Below Target (< 80%)" : "On Track (≥ 80%)"}
              </span>
            </div>
            <p style={{ color: "#475569", fontSize: 12, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
              {adherence30Day.reduce((s, a) => s + a.takenCount, 0)} doses taken out of{" "}
              {adherence30Day.reduce((s, a) => s + a.scheduledCount, 0)} scheduled
            </p>
          </div>
        </div>

        {/* Per-medication breakdown */}
        <div style={{ marginBottom: 20 }}>
          {adherence30Day.map((med) => (
            <AdherenceRow
              key={med.medicationId}
              name={med.medicationName}
              dosage={med.dosage}
              taken={med.takenCount}
              scheduled={med.scheduledCount}
            />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 2: RECENT LAB ABNORMALITIES
            Placed at the TOP per information hierarchy spec.
            Pale Ochre highlights doctor sees instantly.
            ══════════════════════════════════════════════════ */}
        <SectionDivider title="2. Recent Lab Abnormalities" />

        {abnormals.length === 0 ? (
          <div
            style={{
              display:       "flex",
              alignItems:    "center",
              gap:           8,
              padding:       "10px 12px",
              background:    `${C.success}14`,
              border:        `1px solid ${C.success}40`,
              borderRadius:  6,
              marginBottom:  16,
            }}
          >
            <CheckCircle size={14} color={C.success} />
            <span style={{ color: "#3D6B4F", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>
              No abnormal lab findings in the last 30 days
            </span>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                color:         "#92400E",
                fontSize:      12,
                fontWeight:    700,
                fontFamily:    "'Montserrat', sans-serif",
                marginBottom:  8,
              }}
            >
              ⚠ {abnormals.length} flagged finding{abnormals.length > 1 ? "s" : ""} — Pale Ochre = Requires Discussion
            </p>
            {abnormals.map((a, i) => (
              <LabFindingRow
                key={i}
                label={`${a.label} (${a.labTitle})`}
                value={a.value}
                unit={a.unit}
                status={a.status}
              />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3: MISSED DOSES
            Each missed entry highlighted in Pale Ochre.
            ══════════════════════════════════════════════ */}
        <SectionDivider title="3. Missed Doses — 30 Days" />

        {missedDoses30Day.length === 0 ? (
          <div
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              padding:      "10px 12px",
              background:   `${C.success}14`,
              border:       `1px solid ${C.success}40`,
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            <CheckCircle size={14} color={C.success} />
            <span style={{ color: "#3D6B4F", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>
              No missed doses in the last 30 days
            </span>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {missedDoses30Day.map((d, i) => (
              <MissedDoseRow
                key={i}
                name={d.medicationName}
                dosage={d.dosage}
                date={d.date}
                scheduledTime={d.scheduledTime}
                reason={d.reason}
              />
            ))}
          </div>
        )}

        {/* ══════════════════════════════
            SECTION 4: RECENT VITALS
            ══════════════════════════ */}
        <SectionDivider title="4. Recent Vitals" />
        <div
          style={{
            display:       "flex",
            gap:           12,
            marginBottom:  20,
          }}
        >
          {[
            latestBP && {
              label: "Blood Pressure",
              value: latestBP.value,
              unit:  latestBP.unit,
              date:  latestBP.effectiveDateTime,
              flagged: latestBP.status !== "normal",
            },
            latestGlu && {
              label: "Blood Glucose",
              value: latestGlu.value,
              unit:  latestGlu.unit,
              date:  latestGlu.effectiveDateTime,
              flagged: latestGlu.status !== "normal",
            },
          ]
            .filter(Boolean)
            .map((v: any, i) => (
              <div
                key={i}
                style={{
                  flex:         1,
                  padding:      "10px 12px",
                  background:   v.flagged ? `${C.alert}18` : "#F8FAFC",
                  border:       `1px solid ${v.flagged ? C.alert : "#E2E8F0"}`,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  {v.flagged
                    ? <AlertTriangle size={11} color={C.alert} />
                    : <CheckCircle size={11} color={C.success} />
                  }
                  <span
                    style={{
                      color:         v.flagged ? "#92400E" : "#3D6B4F",
                      fontSize:      10,
                      fontWeight:    700,
                      letterSpacing: "0.06em",
                      fontFamily:    "'Montserrat', sans-serif",
                    }}
                  >
                    {v.flagged ? "FLAGGED" : "NORMAL"}
                  </span>
                </div>
                <p
                  style={{
                    color:      "#000",
                    fontSize:   18,
                    fontWeight: 800,
                    fontFamily: "'Montserrat', sans-serif",
                    margin:     "0 0 2px 0",
                    lineHeight: 1,
                  }}
                >
                  {v.value}
                </p>
                <p style={{ color: "#475569", fontSize: 11, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>
                  {v.label} · {v.unit}
                </p>
                <p style={{ color: "#94A3B8", fontSize: 10, fontFamily: "'Montserrat', sans-serif", margin: "3px 0 0 0" }}>
                  {v.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
        </div>

        {/* ── Clinical footer ── */}
        <div
          style={{
            borderTop:   "1px solid #CBD5E1",
            paddingTop:  12,
            display:     "flex",
            alignItems:  "center",
            gap:         8,
          }}
        >
          <Shield size={13} color="#94A3B8" />
          <p
            style={{
              color:      "#94A3B8",
              fontSize:   11,
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.5,
              margin:     0,
            }}
          >
            Generated by {BRAND_NAME} · {genDate} · For clinical reference only. Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
      {/* END clinical document */}

      {/* ── App CTAs (no-print) — 56px touch targets ── */}
      <div
        className="hp-no-print sticky bottom-0"
        style={{
          background:   "#FFFFFF",
          borderTop:    `1px solid ${C.border}`,
          boxShadow:    "0 -4px 16px rgba(0,0,0,0.08)",
          padding:      "12px 16px 28px",
          display:      "flex",
          flexDirection:"column",
          gap:          10,
        }}
      >
        <button
          onClick={handleShare}
          style={{
            width:        "100%",
            minHeight:    L.touch,
            background:   shared ? C.successLight : C.primary,
            border:       "1px solid rgba(142,175,157,0.4)",
            borderRadius: L.rXl,
            color:        shared ? C.successDark : C.text,
            fontSize:     T.body,
            fontWeight:   700,
            fontFamily:   "inherit",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            gap:          10,
          }}
          aria-label="Share appointment summary with care team"
          aria-live="polite"
          onMouseEnter={(e) => { if (!shared) (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
          onMouseLeave={(e) => { if (!shared) (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
        >
          {shared
            ? <><CheckCheck size={18} color={C.success} /> Sent to Care Team</>
            : <><Send size={18} /> Share with Doctor</>
          }
        </button>
        <button
          onClick={handlePrint}
          style={{
            width:        "100%",
            minHeight:    L.touch,
            background:   "transparent",
            border:       `1px solid ${C.border}`,
            borderRadius: L.rXl,
            color:        C.text,
            fontSize:     T.bodySm,
            fontWeight:   700,
            fontFamily:   "inherit",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            gap:          8,
          }}
          aria-label="Print appointment summary"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.locked; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <Printer size={15} />
          Print PDF — 1 Page
        </button>
      </div>
    </div>
  );
}