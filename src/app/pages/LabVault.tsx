import { useState } from "react";
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

  const abnormalCount = labResults.filter((r) => r.status !== "normal").length;

  return (
    <div style={{ background: C.shell, minHeight: "100vh" }}>
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: "1px solid rgba(142,175,157,0.15)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: "rgba(251,251,251,0.06)", border: "1px solid rgba(142,175,157,0.2)", color: C.textOnDark }}
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
          style={{ background: C.primaryLight, border: "1px solid rgba(142,175,157,0.3)", color: C.successDark, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", minHeight: L.touch }}
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
          style={{ background: "#F7F9F7", border: "1px solid #BABCBF" }}
          aria-label="Open Blood Pressure Monitor"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#BC6C8A"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#BABCBF"; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: "rgba(188,108,138,0.12)", border: "1px solid rgba(188,108,138,0.25)" }}
          >
            <Heart size={22} color="#BC6C8A" />
          </div>
          <span style={{ color: "#3B3D40", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Blood Pressure
          </span>
          <span style={{ color: "rgba(59,61,64,0.5)", fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
            Monitor & Log BP
          </span>
        </button>

        <button
          onClick={() => setShowSugar(true)}
          className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center gap-2 py-4 px-3 transition-all"
          style={{ background: "#F7F9F7", border: "1px solid #BABCBF" }}
          aria-label="Open Sugar Level Tracker"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.alert; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#BABCBF"; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
          >
            <Droplets size={22} color={C.alert} />
          </div>
          <span style={{ color: "#3B3D40", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Sugar Levels
          </span>
          <span style={{ color: "rgba(59,61,64,0.5)", fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
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
          const statusIcon = result.status === "normal" ? <CheckCircle size={13} color="#9DBB9B" /> : <AlertTriangle size={13} color="#D9A596" />;
          return (
            <div key={result.id} className="rounded-2xl overflow-hidden" style={{ background: "#F7F9F7", border: "1px solid #BABCBF" }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(186,188,191,0.3)" }}>
                <FileText size={18} color={result.status === "normal" ? "#9DBB9B" : "#D9A596"} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#3B3D40", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>{result.title}</p>
                  <p style={{ color: "rgba(59,61,64,0.5)", fontSize: 11, fontFamily: "inherit", marginTop: 1 }}>
                    {result.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {result.provider}
                  </p>
                </div>
                {statusIcon}
              </div>
              <div className="px-4 pb-4 pt-2">
                <button
                  onClick={() => handleOpen(result)}
                  className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(124,154,146,0.1)", border: "1px solid rgba(124,154,146,0.25)", color: "#4A6E67", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
                  aria-label={`Open ${result.title}`}
                >
                  <Lock size={13} />
                  Unlock & View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showSummary && <SummaryView onClose={() => setShowSummary(false)} />}
      {showExport && <AppointmentExport onClose={() => setShowExport(false)} />}
      {showBP && <BloodPressureMonitor onClose={() => setShowBP(false)} />}
      {showSugar && <SugarLevelTracker onClose={() => setShowSugar(false)} />}
    </div>
  );
}