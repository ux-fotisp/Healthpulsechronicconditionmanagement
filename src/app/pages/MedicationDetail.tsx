import { useState } from "react";
import {
  ChevronLeft, Clock, CheckCircle, ChevronDown, ChevronUp, RefreshCw,
  FileText, AlertTriangle, BookOpen, CalendarDays, User, Store, Hash, Pill, Palette,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useMedication, useMedicationLogs, useRefill, useLogDose } from "../hooks/useHealthData";
import { hydrateMedication, hydrateMedLogs, hydrateRefill, isTakenToday as checkTakenToday, formatTime, MOCK_NOW } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ReminderModal } from "../components/home/ReminderModal";
import { PillVisualizer } from "../components/shared/PillVisualizer";
import { PillEditor } from "../components/medications/PillEditor";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { C, T, L } from "../design/tokens";
import { toast } from "sonner";
import * as api from "../data/api";
import type { PillShape } from "../components/shared/PillVisualizer";

function RefillTank({ remaining, total, color }: { remaining: number; total: number; color: string }) {
  const pct = Math.max(0, Math.min(1, remaining / total));
  const r = 52, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const trackColor = pct <= 0.25 ? C.alert : pct <= 0.5 ? "#C4A87A" : color;
  const labelColor = pct <= 0.25 ? C.alertText : pct <= 0.5 ? "#7A6230" : C.successDark;
  const bgColor = pct <= 0.25 ? C.alertLight : pct <= 0.5 ? "rgba(196,168,122,0.1)" : C.primaryLight;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center rounded-full" style={{ width: 128, height: 128, background: bgColor }} role="img" aria-label={`Refill tank: ${remaining} of ${total} pills remaining (${Math.round(pct * 100)}%)`}>
        <svg width={128} height={128} style={{ position: "absolute", inset: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.borderLight} strokeWidth={10} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={10} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }} />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span style={{ color: labelColor, fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>{remaining}</span>
          <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", fontFamily: "inherit" }}>of {total}</span>
        </div>
      </div>
      <span style={{ color: labelColor, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", fontFamily: "inherit" }}>
        {pct <= 0.25 ? "LOW SUPPLY" : pct <= 0.5 ? "MODERATE SUPPLY" : "GOOD SUPPLY"}
      </span>
    </div>
  );
}

function AccordionRow({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${C.borderLight}` }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3" style={{ background: open ? C.primaryLight : C.bg, color: C.text, fontFamily: "inherit", fontSize: T.caption, fontWeight: 600, minHeight: L.touch }} aria-expanded={open}>
        <span>{label}</span>
        {open ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
      </button>
      {open && <div className="px-4 pb-4 pt-2" style={{ background: C.bg }}>{children}</div>}
    </div>
  );
}

export function MedicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showReminder, setShowReminder] = useState(false);
  const [showPillEditor, setShowPillEditor] = useState(false);
  const [pillSaving, setPillSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const { data: rawMed, loading: loadMed, refetch: refetchMed } = useMedication(id ?? "");
  const { data: rawLogs, loading: loadLogs, refetch: refetchLogs } = useMedicationLogs();
  const { data: rawRefill, loading: loadRefill } = useRefill(id ?? "");
  const { logDose, loading: logDoseLoading } = useLogDose();

  if (loadMed || loadLogs) return <PageSkeleton title="Medication" cardCount={4} />;

  const med = rawMed ? hydrateMedication(rawMed) : null;
  const medLogs = rawLogs ? hydrateMedLogs(rawLogs) : [];
  const refill = rawRefill && !loadRefill ? hydrateRefill(rawRefill) : undefined;
  const takenToday = med ? checkTakenToday(med.id, medLogs) : false;

  if (!med) {
    return (<div style={{ background: C.shell, minHeight: "100vh" }} className="flex items-center justify-center"><p style={{ color: C.textOnDarkSub, fontFamily: "inherit" }}>Medication not found.</p></div>);
  }

  const isDue = !takenToday && med.nextDoseTime && med.nextDoseTime > MOCK_NOW;
  const currentTimes = med.nextDoseTime ? [med.nextDoseTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })] : ["08:00"];

  const handleLogDose = async () => {
    try {
      await logDose(med.id, med.name, "taken", "Logged from detail page");
      refetchLogs();
      toast.success(`Dose logged for ${med.name}`);
    } catch (e) {
      console.error("Failed to log dose:", e);
      toast.error("Failed to log dose. Please try again.");
    }
  };

  const handleSavePill = async (shape: PillShape, color: string, times: string[]) => {
    setPillSaving(true);
    try {
      await api.updateMedication(med.id, { shape, color });
      refetchMed();
      setShowPillEditor(false);
      toast.success("Pill appearance updated");
    } catch (e) {
      console.error("Failed to save pill customization:", e);
      toast.error("Failed to save customization. Please try again.");
    } finally {
      setPillSaving(false);
    }
  };

  return (
    <>
      <div style={{ background: C.shell, minHeight: "100vh" }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-10 pb-4" style={{ borderBottom: "1px solid rgba(142,175,157,0.15)" }}>
          <button onClick={() => navigate("/medications")} className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: "rgba(251,251,251,0.06)", border: "1px solid rgba(142,175,157,0.2)", color: C.textOnDark, minHeight: "auto" }} aria-label="Back to medications list"><ChevronLeft size={18} /></button>
          <div className="flex-1 min-w-0">
            <h1 style={{ color: C.textOnDark, fontSize: T.h1, fontWeight: 700, fontFamily: "inherit", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{med.name}</h1>
            <p style={{ color: C.textOnDarkMuted, fontSize: T.caption, fontFamily: "inherit" }}>Prescription Deep-Dive</p>
          </div>
          <StatusBadge status={takenToday ? "completed" : isDue ? "upcoming" : "normal"} size="sm" />
        </div>

        {/* Hero */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
          <div className="flex items-stretch">
            <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 gap-3" style={{ borderRight: `1px solid ${C.borderLight}` }}>
              <PillVisualizer color={med.color} shape={med.shape} quickInstruction={med.quickInstruction} size="lg" />
              <span style={{ color: C.text, fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>{med.dosage}</span>
              <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>{med.route}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-5 px-4">
              <div className="flex items-center justify-center rounded-xl mb-3" style={{ width: 48, height: 48, background: isDue ? C.alertLight : C.primaryLight, border: `1px solid ${isDue ? C.alertBorder : "rgba(142,175,157,0.3)"}` }} aria-hidden="true">
                <Clock size={22} color={isDue ? C.alert : C.primary} />
              </div>
              <span style={{ color: C.text, fontSize: 20, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>{med.nextDoseTime ? formatTime(med.nextDoseTime) : "—"}</span>
              <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", marginTop: 3, textAlign: "center" }}>Next dose</span>
            </div>
          </div>
          <button onClick={() => setShowPillEditor(true)} className="mx-4 mb-3 mt-2 w-[calc(100%-32px)] rounded-xl flex items-center justify-center gap-2 transition-all" style={{ minHeight: 44, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }} aria-label="Customize pill appearance and schedule">
            <Palette size={14} />Customize Pill & Schedule
          </button>
          {refill && (
            <div className="mx-4 mb-4 mt-1 flex gap-3 px-3 py-3 rounded-xl" style={{ background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}` }}>
              <BookOpen size={16} color={C.secondary} className="flex-shrink-0 mt-0.5" />
              <p style={{ color: C.text, fontSize: T.caption, lineHeight: 1.55, fontFamily: "inherit" }}>{refill.orientation}</p>
            </div>
          )}
        </div>

        {/* Refill Tank */}
        {refill && (
          <div className="mx-4 mt-3 rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 12 }}>
              <RefreshCw size={12} color={C.textMuted} />
              <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>REFILL TANK</span>
              {refill.pillsRemaining <= Math.round(refill.totalPills * 0.25) && (
                <span className="ml-auto flex items-center gap-1" style={{ background: C.alertLight, border: `1px solid ${C.alertBorder}`, borderRadius: L.rFull, padding: "2px 6px" }} role="status" aria-label="Refill soon">
                  <AlertTriangle size={10} color={C.alert} />
                  <span style={{ color: C.alertText, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>REFILL SOON</span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <RefillTank remaining={refill.pillsRemaining} total={refill.totalPills} color={med.color} />
              <div className="flex-1 flex flex-col gap-2.5">
                {[{ key: "PILLS LEFT", val: `${refill.pillsRemaining} / ${refill.totalPills}` }, { key: "REFILL DUE", val: refill.refillDueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }, { key: "PHARMACY", val: refill.pharmacy }].map(({ key, val }) => (
                  <div key={key}><p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, letterSpacing: "0.05em", fontFamily: "inherit" }}>{key}</p><p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{val}</p></div>
                ))}
              </div>
            </div>
            <button className="w-full mt-4 rounded-xl flex items-center justify-center gap-2 transition-all" style={{ background: C.primaryLight, border: "1px solid rgba(142,175,157,0.3)", color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", minHeight: L.touch }} aria-label="Request medication refill"><RefreshCw size={14} />Request Refill</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mx-4 mt-3 flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(142,175,157,0.2)" }}>
          {(["overview", "history"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 transition-all" style={{ background: activeTab === tab ? C.primary : "rgba(251,251,251,0.04)", color: activeTab === tab ? "#111820" : C.textOnDarkSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "inherit", textTransform: "uppercase", minHeight: L.touch }} aria-pressed={activeTab === tab}>
              {tab === "overview" ? "Overview" : "Refill History"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="mx-4 mt-3 flex flex-col gap-3 pb-6">
            <div className="rounded-2xl px-4 py-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between">
                <span style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>Frequency</span>
                <span style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>{med.frequency}</span>
              </div>
            </div>
            {refill && (
              <>
                <AccordionRow label="Prescribing Doctor & Rx Info">
                  <div className="flex flex-col gap-3">
                    <InfoRow icon={<User size={13} color={C.secondary} />} label="Doctor" value={refill.prescribingDoctor} />
                    <InfoRow icon={<Hash size={13} color={C.secondary} />} label="Rx Number" value={refill.prescriptionNumber} />
                    <InfoRow icon={<CalendarDays size={13} color={C.secondary} />} label="Prescription Date" value={refill.prescriptionDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
                    <InfoRow icon={<Store size={13} color={C.secondary} />} label="Pharmacy" value={refill.pharmacy} />
                  </div>
                </AccordionRow>
                <AccordionRow label="Doctor Notes & Orientation">
                  <p style={{ color: C.text, fontSize: T.caption, lineHeight: 1.7, fontFamily: "inherit" }}>{refill.orientation}</p>
                </AccordionRow>
              </>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="mx-4 mt-3 flex flex-col gap-3 pb-6">
            {refill && refill.refillHistory.length > 0 ? refill.refillHistory.map((entry, idx) => (
              <div key={idx} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: C.primaryLight, border: "1px solid rgba(142,175,157,0.25)", flexShrink: 0 }} aria-hidden="true"><FileText size={16} color={C.primary} /></div>
                <div className="flex-1">
                  <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>Refill #{refill.refillHistory.length - idx}</p>
                  <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", marginTop: 2 }}>{entry.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <span style={{ color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{entry.quantity} pills</span>
              </div>
            )) : (<p style={{ color: C.textOnDarkSub, fontSize: T.bodySm, textAlign: "center", fontFamily: "inherit", paddingTop: 16 }}>No refill history available.</p>)}
          </div>
        )}

        {/* Sticky CTAs */}
        <div className="sticky bottom-0 mx-4 mb-6 flex gap-3" style={{ paddingTop: 12, paddingBottom: 4 }}>
          {!takenToday ? (
            <>
              <button className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all" style={{ background: C.primary, border: "1px solid rgba(142,175,157,0.4)", color: "#111820", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", minHeight: L.touch }} aria-label={`Log dose of ${med.name}`} onClick={handleLogDose} disabled={logDoseLoading}><Pill size={16} />Log Dose</button>
              <button onClick={() => setShowReminder(true)} className="rounded-xl px-5 flex items-center justify-center transition-all" style={{ background: "rgba(251,251,251,0.1)", border: `1px solid ${C.borderMedium}`, color: C.textOnDark, fontSize: T.caption, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", minHeight: L.touch }} aria-label="Set snooze reminder">Snooze</button>
            </>
          ) : (
            <div className="flex-1 rounded-xl flex items-center justify-center gap-2" style={{ background: C.successLight, border: `1px solid ${C.successBorder}`, minHeight: L.touch }} role="status" aria-live="polite">
              <CheckCircle size={16} color={C.success} />
              <span style={{ color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>Dose Logged Today</span>
            </div>
          )}
        </div>
      </div>

      {showReminder && <ReminderModal medication={med} onClose={() => setShowReminder(false)} onLogDose={() => setShowReminder(false)} onSnooze={() => setShowReminder(false)} />}
      {showPillEditor && <PillEditor currentShape={med.shape} currentColor={med.color} currentTimes={currentTimes} medicationName={med.name} onClose={() => setShowPillEditor(false)} onSave={handleSavePill} saving={pillSaving} />}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, letterSpacing: "0.05em", fontFamily: "inherit" }}>{label.toUpperCase()}</p>
        <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>{value}</p>
      </div>
    </div>
  );
}
