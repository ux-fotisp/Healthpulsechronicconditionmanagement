/**
 * HealthPulse · SummaryView — "Doctor Share" Snapshot (User Story 7)
 * 30-day health summary · print-ready · WCAG 2.1 compliant
 * Tokens: C.bg #FBFBFB, C.primary #8EAF9D, C.text #1E293B
 * Typography: H1 26px, Body 18px, Caption 14px (Montserrat)
 */

import React, { useState } from "react";
import {
  ChevronLeft,
  Printer,
  CheckCircle,
  AlertTriangle,
  Send,
  CheckCheck,
  Heart,
  Activity,
  Pill,
  Shield,
  User,
} from "lucide-react";
import { usePatient, useAdherence, useLabs, useObservations } from "../../hooks/useHealthData";
import { hydrateObservations, hydrateLabResults, getOverallAdherence, MOCK_NOW, type Observation } from "../../data/helpers";
import { PillBadge } from "../shared/PillVisualizer";
import { C, T, L, BRAND_NAME } from "../../design/tokens";

// ── Adherence bar ─────────────────────────────────────────────────────────────
function AdherenceBar({
  taken,
  scheduled,
  color,
}: {
  taken: number;
  scheduled: number;
  color: string;
}) {
  const pct = scheduled > 0 ? Math.round((taken / scheduled) * 100) : 0;
  const isLow = pct < 80;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: C.borderLight }}>
        <div
          style={{
            width:        `${pct}%`,
            height:       "100%",
            background:   isLow ? C.alert : color,
            borderRadius: 100,
            transition:   "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ color: isLow ? C.alertText : C.successDark, fontSize: T.caption, fontWeight: 700, fontFamily: "inherit", minWidth: 36, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: 32, height: 32, background: C.successLight, border: `1px solid ${C.successBorder}`, flexShrink: 0 }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, letterSpacing: "0.02em", fontFamily: "inherit" }}>
          {title}
        </p>
        {sub && <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SummaryView({ onClose }: { onClose: () => void }) {
  const [shared,  setShared]  = useState(false);
  const [printed, setPrinted] = useState(false);

  const { data: rawPatient }    = usePatient();
  const { data: rawAdherence }  = useAdherence();
  const { data: rawLabs }       = useLabs();
  const { data: rawObs }        = useObservations();

  const patient        = rawPatient ?? { id: "", name: "—", mrn: "—", birthDate: "", conditions: [] as string[], gender: "", contactPhone: "", contactEmail: "", preferredLanguage: "", careTeam: "" };
  const adherence30Day = rawAdherence ?? [];
  const labResults     = hydrateLabResults(rawLabs ?? []);
  const observations   = hydrateObservations(rawObs ?? []);
  const overallAdherence = getOverallAdherence(adherence30Day);
  const recentLabs       = labResults.slice(0, 2);
  const latestBP         = observations.find((o: Observation) => o.type === "Blood Pressure");
  const latestGlucose    = observations.find((o: Observation) => o.type === "Blood Glucose");

  const dateStr = MOCK_NOW.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  function handlePrint()  { setPrinted(true); window.print(); setTimeout(() => setPrinted(false), 2000); }
  function handleShare()  { setShared(true);  setTimeout(() => setShared(false), 2500); }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: C.bg, maxWidth: L.maxWidth, margin: "0 auto", display: "flex", flexDirection: "column", overflowY: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-label="30-Day Health Summary"
    >
      {/* Sticky top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4 sticky top-0 z-10"
        style={{ background: C.bg, borderBottom: `1px solid ${C.borderLight}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: C.locked, border: `1px solid ${C.border}`, color: C.text, flexShrink: 0, minHeight: "auto" }}
          aria-label="Close summary"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          {/* H1 — 26px Bold Montserrat */}
          <h1 style={{ color: C.text, fontSize: T.h1, fontWeight: 700, fontFamily: "inherit", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            30-Day Summary
          </h1>
          <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>Generated {dateStr}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{ width: 44, height: 44, background: printed ? C.successLight : C.primaryLight, border: `1px solid rgba(142,175,157,0.3)`, color: C.successDark, flexShrink: 0, minHeight: "auto" }}
          aria-label="Print summary"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-4" style={{ paddingBottom: 140 }}>
        {/* Patient identity */}
        <div className="rounded-2xl p-4" style={{ background: C.shell, border: "1px solid rgba(142,175,157,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 52, height: 52, background: C.primaryLight, border: "1px solid rgba(142,175,157,0.25)", flexShrink: 0 }} aria-hidden="true">
              <User size={24} color={C.primary} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: C.textOnDarkMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>PATIENT</p>
              {/* BodyL 18px — patient-facing data */}
              <p style={{ color: C.textOnDark, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>{patient.name}</p>
              <p style={{ color: C.textOnDarkSub, fontSize: T.caption, fontFamily: "inherit" }}>
                MRN {patient.mrn} · DOB {new Date(patient.birthDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {patient.conditions.map((c) => (
              <span key={c} style={{ background: C.primaryLight, border: `1px solid rgba(142,175,157,0.3)`, color: C.primary, fontSize: T.nano, fontWeight: 700, padding: "2px 8px", borderRadius: L.rFull, fontFamily: "inherit", letterSpacing: "0.04em" }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Overall adherence */}
        <div className="rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader icon={<Shield size={15} color={C.primary} />} title="Overall Adherence" sub="30-day rolling average" />
            <div className="flex flex-col items-end">
              <span style={{ color: overallAdherence >= 80 ? C.successDark : C.alertText, fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>
                {overallAdherence}%
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {overallAdherence >= 80
                  ? <CheckCircle size={12} color={C.success} />
                  : <AlertTriangle size={12} color={C.alert} />
                }
                <span style={{ color: overallAdherence >= 80 ? C.successDark : C.alertText, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
                  {overallAdherence >= 80 ? "ON TRACK" : "NEEDS ATTENTION"}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 10, background: C.borderLight }}>
            <div style={{ width: `${overallAdherence}%`, height: "100%", background: overallAdherence >= 80 ? C.primary : C.alert, borderRadius: 100 }} />
          </div>
        </div>

        {/* Per-medication adherence */}
        <div className="rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader icon={<Pill size={15} color={C.primary} />} title="Medication Adherence" sub="Doses taken vs. scheduled — last 30 days" />
          <div className="flex flex-col gap-4">
            {adherence30Day.map((med) => {
              const pct   = Math.round((med.takenCount / med.scheduledCount) * 100);
              const isLow = pct < 80;
              return (
                <div key={med.medicationId}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <PillBadge color={med.color} shape={med.shape} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
                        {med.medicationName}{" "}
                        <span style={{ fontWeight: 400, color: C.textSub }}>{med.dosage}</span>
                      </p>
                      <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>
                        {med.takenCount} of {med.scheduledCount} doses taken
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isLow ? <AlertTriangle size={12} color={C.alert} /> : <CheckCircle size={12} color={C.success} />}
                      <span style={{ color: isLow ? C.alertText : C.successDark, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
                        {isLow ? "LOW" : "GOOD"}
                      </span>
                    </div>
                  </div>
                  <AdherenceBar taken={med.takenCount} scheduled={med.scheduledCount} color={med.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Vitals */}
        <div className="rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader icon={<Activity size={15} color={C.secondary} />} title="Latest Vitals" sub="Most recent recorded readings" />
          <div className="flex gap-3">
            {latestBP && (
              <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: latestBP.status === "normal" ? C.successLight : C.alertLight, border: `1px solid ${latestBP.status === "normal" ? C.successBorder : C.alertBorder}` }}>
                <div className="flex items-center gap-1 mb-1">
                  {latestBP.status === "normal" ? <CheckCircle size={11} color={C.success} /> : <AlertTriangle size={11} color={C.alert} />}
                  <span style={{ color: latestBP.status === "normal" ? C.successDark : C.alertText, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>
                    {latestBP.status.toUpperCase()}
                  </span>
                </div>
                {/* BodyL 18px — patient data */}
                <p style={{ color: C.text, fontSize: T.body, fontWeight: 800, fontFamily: "inherit", lineHeight: 1 }}>{latestBP.value}</p>
                <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", marginTop: 2 }}>
                  Blood Pressure · {latestBP.unit}
                </p>
              </div>
            )}
            {latestGlucose && (
              <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: C.successLight, border: `1px solid ${C.successBorder}` }}>
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle size={11} color={C.success} />
                  <span style={{ color: C.successDark, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>NORMAL</span>
                </div>
                <p style={{ color: C.text, fontSize: T.body, fontWeight: 800, fontFamily: "inherit", lineHeight: 1 }}>{latestGlucose.value}</p>
                <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", marginTop: 2 }}>
                  Blood Glucose · {latestGlucose.unit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Labs */}
        <div className="rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <SectionHeader icon={<Heart size={15} color={C.secondary} />} title="Recent Lab Results" sub="Key findings — Feb 28, 2026" />
          <div className="flex flex-col gap-3">
            {recentLabs.map((lab) => (
              <div key={lab.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.borderLight}` }}>
                <div className="flex items-center justify-between px-3 py-2" style={{ background: lab.status === "normal" ? C.successLight : C.alertLight, borderBottom: `1px solid ${C.borderLight}` }}>
                  <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{lab.title}</p>
                  <div className="flex items-center gap-1">
                    {lab.status === "normal" ? <CheckCircle size={11} color={C.success} /> : <AlertTriangle size={11} color={C.alert} />}
                    <span style={{ color: lab.status === "normal" ? C.successDark : C.alertText, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>
                      {lab.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2 flex flex-col gap-1.5">
                  {lab.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {h.status === "normal" ? <CheckCircle size={10} color={C.success} /> : <AlertTriangle size={10} color={C.alert} />}
                        <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>{h.label}</span>
                      </div>
                      <span style={{ color: h.status === "normal" ? C.successDark : C.alertText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
                        {h.value}{h.unit ? ` ${h.unit}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: C.locked, border: `1px solid ${C.borderLight}` }}>
          <Shield size={13} color={C.textMuted} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: C.textMuted, fontSize: T.caption, lineHeight: 1.6, fontFamily: "inherit" }}>
            Generated by {BRAND_NAME} · {dateStr} · For informational purposes only. Not for clinical use. Always consult your care team for medical decisions.
          </p>
        </div>
      </div>

      {/* Sticky CTAs — 56px touch target */}
      <div
        className="sticky bottom-0"
        style={{ background: C.bg, borderTop: `1px solid ${C.borderLight}`, boxShadow: "0 -4px 24px rgba(0,0,0,0.08)", padding: `12px 16px 28px`, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <button
          onClick={handleShare}
          className="w-full rounded-2xl flex items-center justify-center gap-3 transition-all"
          style={{ background: shared ? C.successLight : "#4A4D4C", border: "1px solid rgba(142,175,157,0.4)", color: shared ? C.successDark : "#FFFFFF", fontSize: T.body, fontWeight: 700, fontFamily: "inherit", minHeight: L.touch }}
          aria-label="Share summary with care team"
          aria-live="polite"
          onMouseEnter={(e) => { if (!shared) (e.currentTarget as HTMLButtonElement).style.background = "#3A3D3C"; }}
          onMouseLeave={(e) => { if (!shared) (e.currentTarget as HTMLButtonElement).style.background = "#4A4D4C"; }}
        >
          {shared ? <><CheckCheck size={18} color={C.success} />Sent to Care Team</> : <><Send size={18} color="#FFFFFF" />Share with Care Team</>}
        </button>
        <button
          onClick={handlePrint}
          className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all"
          style={{ background: "#4A4D4C", border: "1px solid rgba(142,175,157,0.4)", color: "#FFFFFF", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", minHeight: L.touch }}
          aria-label="Print summary"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3A3D3C"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4A4D4C"; }}
        >
          <Printer size={15} color="#FFFFFF" />
          Print Summary
        </button>
      </div>
    </div>
  );
}