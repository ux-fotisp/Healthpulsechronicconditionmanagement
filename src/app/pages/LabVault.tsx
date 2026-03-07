import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Lock,
  ChevronLeft,
  FileText,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Heart,
  Droplets,
  X,
  ShieldCheck,
} from "lucide-react";
import { useLabs } from "../hooks/useHealthData";
import { hydrateLabResults, type LabResult } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import { SummaryView } from "../components/labs/SummaryView";
import { AppointmentExport } from "../components/labs/AppointmentExport";
import { LabInterpretationCard } from "../components/labs/LabInterpretationCard";
import { BloodPressureMonitor } from "../components/labs/BloodPressureMonitor";
import { SugarLevelTracker } from "../components/labs/SugarLevelTracker";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { C, T, L } from "../design/tokens";
import { toast } from "sonner";

// ── Biometric Gate (PIN Unlock) ─────────────────────────────────────────────
const VAULT_PIN = "2026";

function BiometricGate({
  resultTitle,
  onSuccess,
  onCancel,
}: {
  resultTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  // Focus trap + Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    setError(false);

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (index === 3 && value) {
      const entered = next.join("");
      if (entered === VAULT_PIN) {
        toast.success(`Unlocked: ${resultTitle}`);
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        toast.error("Incorrect PIN — try 2026");
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", ""]);
          refs[0].current?.focus();
        }, 500);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-[340px] mx-4"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Unlock ${resultTitle}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 44,
                height: 44,
                background: C.secondaryLight,
                border: `1px solid ${C.secondaryBorder}`,
              }}
            >
              <ShieldCheck size={20} color={C.secondary} />
            </div>
            <div>
              <h3 style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
                Biometric Gate
              </h3>
              <p style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit", margin: 0 }}>
                Enter 4-digit PIN
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub }}
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ color: C.textSub, fontSize: T.bodySm, fontFamily: "inherit", textAlign: "center", marginBottom: 16 }}>
          Unlock <strong>{resultTitle}</strong>
        </p>

        <div
          className="flex items-center justify-center gap-3 mb-4"
          style={{ animation: shake ? "shake 0.4s ease" : undefined }}
        >
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="rounded-xl text-center"
              style={{
                width: 56,
                height: 64,
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "inherit",
                background: error ? C.alertLight : C.card,
                border: `2px solid ${error ? C.alert : digit ? C.primary : C.border}`,
                color: C.text,
                outline: "none",
                caretColor: C.primary,
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p
            style={{ color: C.alertText, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", textAlign: "center" }}
            role="alert"
          >
            Incorrect PIN — try again
          </p>
        )}

        <p style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit", textAlign: "center", marginTop: 12 }}>
          Demo PIN: <strong>2026</strong>
        </p>
      </div>

      {/* Shake keyframes injected via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ── Main Lab Vault Page ─────────────────────────────────────────────────────
export function LabVault() {
  const navigate = useNavigate();
  const { data: rawLabs, loading } = useLabs();
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [authenticatedIds, setAuthenticatedIds] = useState<Set<string>>(new Set());
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showBP, setShowBP] = useState(false);
  const [showSugar, setShowSugar] = useState(false);

  if (loading) return <PageSkeleton title="Lab Vault" cardCount={3} />;

  const labResults = hydrateLabResults(rawLabs ?? []);

  function handleOpen(result: LabResult) {
    if (authenticatedIds.has(result.id)) {
      setViewingId(result.id);
    } else {
      setSelectedResult(result);
    }
  }

  function handlePinSuccess() {
    if (!selectedResult) return;
    setAuthenticatedIds((prev) => new Set(prev).add(selectedResult.id));
    setViewingId(selectedResult.id);
    setSelectedResult(null);
  }

  const abnormalCount = labResults.filter((r) => r.status !== "normal").length;
  const viewingResult = viewingId ? labResults.find((r) => r.id === viewingId) : null;

  return (
    <div style={{ background: C.shell, minHeight: "100vh" }}>
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: "1px solid rgba(142,175,157,0.15)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: L.touch, height: L.touch, background: "rgba(251,251,251,0.06)", border: "1px solid rgba(142,175,157,0.2)", color: C.textOnDark }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 style={{ color: C.textOnDark, fontSize: T.h1, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>Lab Vault</h1>
          <p style={{ color: C.textOnDarkMuted, fontSize: T.caption, fontFamily: "inherit" }}>Secure · Biometric Protected</p>
        </div>
        <Lock size={16} color={C.secondary} />
      </div>

      <div className="mx-4 mt-4">
        <button
          onClick={() => setShowSummary(true)}
          className="w-full rounded-2xl flex items-center justify-center gap-2.5 transition-all"
          style={{ background: C.primaryLight, border: `1px solid ${C.primaryBorder}`, color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", minHeight: L.touch }}
          aria-label="Generate 30-day health summary"
        >
          <ClipboardList size={16} />
          Generate 30-Day Summary for Doctor
        </button>
      </div>

      {/* ── Vitals Trackers ─────────────────────────────────────── */}
      <div className="flex gap-3 mx-4 mt-4">
        <button
          onClick={() => setShowBP(true)}
          className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center gap-2 py-4 px-3 transition-all"
          style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, minHeight: L.touch }}
          aria-label="Open Blood Pressure Monitor"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.rose; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.cardBorder; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: C.roseLight, border: `1px solid ${C.roseBorder}` }}
          >
            <Heart size={22} color={C.rose} />
          </div>
          <span style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Blood Pressure
          </span>
          <span style={{ color: C.cardTextSub, fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
            Monitor & Log BP
          </span>
        </button>

        <button
          onClick={() => setShowSugar(true)}
          className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center gap-2 py-4 px-3 transition-all"
          style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, minHeight: L.touch }}
          aria-label="Open Sugar Level Tracker"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.alert; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.cardBorder; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
          >
            <Droplets size={22} color={C.alert} />
          </div>
          <span style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Sugar Levels
          </span>
          <span style={{ color: C.cardTextSub, fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
            Diabetes Management
          </span>
        </button>
      </div>

      {abnormalCount > 0 && (
        <div className="mx-4 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: C.alertLight, border: `1px solid ${C.alertBorder}` }} role="status">
          <AlertTriangle size={18} color={C.alert} />
          <p style={{ color: C.alertText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            {abnormalCount} result{abnormalCount > 1 ? "s" : ""} need review
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 mx-4 mt-4 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />
          <p style={{ color: C.textOnDarkSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
            {labResults.length} DOCUMENTS
          </p>
        </div>
        {labResults.map((result) => {
          const isUnlocked = authenticatedIds.has(result.id);
          const statusIcon = result.status === "normal"
            ? <CheckCircle size={13} color={C.sage} />
            : <AlertTriangle size={13} color={C.terracotta} />;
          return (
            <div key={result.id} className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(186,188,191,0.3)" }}>
                <FileText size={18} color={result.status === "normal" ? C.sage : C.terracotta} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{result.title}</p>
                  <p style={{ color: C.cardTextSub, fontSize: T.micro, fontFamily: "inherit", marginTop: 1 }}>
                    {result.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {result.provider}
                  </p>
                </div>
                {statusIcon}
              </div>
              <div className="px-4 pb-4 pt-2">
                <button
                  onClick={() => handleOpen(result)}
                  className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: isUnlocked ? C.sageLight : C.tealLight,
                    border: `1px solid ${isUnlocked ? C.sageBorder : C.tealBorder}`,
                    color: isUnlocked ? C.sageDark : C.tealDark,
                    fontSize: T.bodySm,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    minHeight: L.touch,
                  }}
                  aria-label={`${isUnlocked ? "View" : "Unlock & View"} ${result.title}`}
                >
                  {isUnlocked ? <CheckCircle size={13} /> : <Lock size={13} />}
                  {isUnlocked ? "View Result" : "Unlock & View"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedResult && (
        <BiometricGate
          resultTitle={selectedResult.title}
          onSuccess={handlePinSuccess}
          onCancel={() => setSelectedResult(null)}
        />
      )}
      {viewingResult && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setViewingId(null)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
            style={{ background: C.bg, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Lab result: ${viewingResult.title}`}
          >
            <div className="flex items-center justify-between px-5 pt-6 pb-3">
              <div>
                <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
                  {viewingResult.title}
                </h2>
                <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit" }}>
                  {viewingResult.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {viewingResult.provider}
                </p>
              </div>
              <button
                onClick={() => setViewingId(null)}
                className="flex items-center justify-center rounded-xl"
                style={{ width: L.touch, height: L.touch, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 pb-6">
              <div className="mb-4">
                <StatusBadge status={viewingResult.status === "normal" ? "completed" : "urgent"} size="sm" />
              </div>
              <LabInterpretationCard labId={viewingResult.id} />
            </div>
          </div>
        </div>
      )}
      {showSummary && <SummaryView onClose={() => setShowSummary(false)} />}
      {showExport && <AppointmentExport onClose={() => setShowExport(false)} />}
      {showBP && <BloodPressureMonitor onClose={() => setShowBP(false)} />}
      {showSugar && <SugarLevelTracker onClose={() => setShowSugar(false)} />}
    </div>
  );
}