/**
 * MediFlow · Secure Lab Vault
 * ═══════════════════════════════════════════════════════════════
 * Design rules (MediFlow spec):
 *   • Locked state: Gaussian Blur (25px) + #475569 overlay at 70% opacity
 *     → fully obscures text until PIN authenticated
 *   • 4-digit numeric keypad: buttons are 64×64px (MF_L.keypadBtn)
 *   • Touch targets: 56px min height for all other interactions
 *   • Color: status NEVER by color alone — always icon + color + text
 *   • Typography: H1=37px, Body=27px, Labels=21px · 1.5× line-height
 *   • Demo PIN: 2026
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Lock, LockOpen, ArrowLeft, X, Delete, AlertTriangle,
  CheckCircle, FileText, Activity, Beaker, Heart, Eye,
  ChevronRight, Shield,
} from "lucide-react";
import { useLabs } from "../hooks/useHealthData";
import { type LabResult, hydrateLabResults } from "../data/helpers";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { MF_C, MF_T, MF_L, MEDIFLOW_NAME } from "../design/mediflow";

const DEMO_PIN = "2026";

// ── Type icon map ──────────────────────────────────────────────────────────────
function LabIcon({
  type,
  size = 24,
  color,
}: {
  type:  LabResult["type"];
  size?: number;
  color: string;
}) {
  const props = { size, color };
  switch (type) {
    case "blood_panel": return <Activity {...props} />;
    case "cardiac":     return <Heart {...props} />;
    case "urine":       return <Beaker {...props} />;
    case "imaging":     return <Eye {...props} />;
    default:            return <FileText {...props} />;
  }
}

// ── Locked overlay — the MediFlow "Vault Security" layer ──────────────────────
// Gaussian Blur: backdrop-filter blur(25px)
// Overlay fill:  #475569 at 70% opacity (vaultOverlay token)
function VaultLockedOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div
      style={{
        position:              "absolute",
        inset:                 0,
        // The overlay itself provides the 70% #475569 fill
        background:            MF_C.vaultOverlay,       // rgba(71,85,105,0.70)
        // backdrop-filter blurs everything behind this element (the card content)
        backdropFilter:        MF_C.vaultBlur,           // blur(25px)
        WebkitBackdropFilter:  MF_C.vaultBlur,
        borderRadius:          MF_L.rLg,
        display:               "flex",
        flexDirection:         "column",
        alignItems:            "center",
        justifyContent:        "center",
        gap:                   MF_L.s1,
        zIndex:                10,
        cursor:                "pointer",
      }}
      onClick={onUnlock}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onUnlock(); }}
      aria-label="Locked — tap to unlock with PIN"
    >
      {/* Lock icon + label + text (WCAG: status by icon + color + text) */}
      <div
        style={{
          width:          56,
          height:         56,
          background:     "rgba(255,255,255,0.15)",
          borderRadius:   "50%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          border:         "2px solid rgba(255,255,255,0.30)",
        }}
        aria-hidden="true"
      >
        <Lock size={26} color="#FFFFFF" />
      </div>
      <span
        style={{
          color:         "#FFFFFF",
          fontSize:      MF_T.label,    /* 21px */
          fontWeight:    700,
          fontFamily:    MF_T.family,
          lineHeight:    `${MF_T.labelLine}px`,
          letterSpacing: "0.03em",
        }}
      >
        LOCKED
      </span>
      <span
        style={{
          color:         "rgba(255,255,255,0.75)",
          fontSize:      MF_T.micro,
          fontFamily:    MF_T.family,
          textAlign:     "center",
          paddingLeft:   MF_L.s2,
          paddingRight:  MF_L.s2,
        }}
      >
        Tap to unlock with 4-digit PIN
      </span>
    </div>
  );
}

// ── 4-Digit Numeric Keypad ────────────────────────────────────────────────────
// Buttons: 64×64px (MF_L.keypadBtn) per spec
function NumericKeypad({
  pin,
  onChange,
  onConfirm,
  onCancel,
  error,
}: {
  pin:       string;
  onChange:  (p: string) => void;
  onConfirm: () => void;
  onCancel:  () => void;
  error:     string;
}) {
  const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  function handleKey(k: string) {
    if (k === "⌫") {
      onChange(pin.slice(0, -1));
    } else if (pin.length < 4) {
      onChange(pin + k);
    }
  }

  return (
    <div
      style={{
        position:  "fixed",
        inset:     0,
        zIndex:    300,
        background:"rgba(17,24,32,0.92)",
        display:   "flex",
        alignItems:"flex-end",
        justifyContent:"center",
        paddingBottom: 0,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Enter 4-digit PIN to unlock lab result"
    >
      <div
        style={{
          width:          "100%",
          maxWidth:       MF_L.maxWidth,
          background:     MF_C.bg,
          borderRadius:   `${MF_L.r2xl}px ${MF_L.r2xl}px 0 0`,
          paddingBottom:  40,
          overflow:       "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: MF_C.border }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${MF_L.s3}px ${MF_L.s2}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: MF_L.s1 }}>
            <Shield size={22} color={MF_C.primary} aria-hidden="true" />
            <div>
              <p
                style={{
                  color:      MF_C.textStrong,
                  fontSize:   MF_T.bodyL,   /* 27px */
                  fontWeight: 700,
                  fontFamily: MF_T.family,
                  margin:     0,
                  lineHeight: `${MF_T.bodyLLine}px`,
                }}
              >
                Enter PIN
              </p>
              <p
                style={{
                  color:      MF_C.text,
                  fontSize:   MF_T.micro,
                  fontFamily: MF_T.family,
                  margin:     0,
                }}
              >
                Demo PIN: {DEMO_PIN}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              width:          44,
              height:         44,
              background:     MF_C.locked,
              border:         "none",
              borderRadius:   MF_L.rMd,
              color:          MF_C.text,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
            aria-label="Cancel PIN entry"
          >
            <X size={18} />
          </button>
        </div>

        {/* PIN dots display */}
        <div
          style={{
            display:        "flex",
            justifyContent: "center",
            gap:            MF_L.s2,
            padding:        `${MF_L.s1}px ${MF_L.s3}px ${MF_L.s2}px`,
          }}
          role="status"
          aria-label={`PIN entered: ${pin.length} of 4 digits`}
          aria-live="polite"
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                style={{
                  width:        20,
                  height:       20,
                  borderRadius: "50%",
                  border:       `2px solid ${error ? MF_C.error : filled ? MF_C.primary : MF_C.border}`,
                  background:   filled ? (error ? MF_C.error : MF_C.primary) : "transparent",
                  transition:   "all 0.15s ease",
                }}
              />
            );
          })}
        </div>

        {/* Error — icon + color + text (never color alone) */}
        {error && (
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            6,
              paddingBottom:  MF_L.s1,
            }}
            role="alert"
          >
            <AlertTriangle size={16} color={MF_C.error} aria-hidden="true" />
            <span style={{ color: MF_C.errorText, fontSize: MF_T.label, fontFamily: MF_T.family, fontWeight: 700 }}>
              {error}
            </span>
          </div>
        )}

        {/* ── Numeric Keypad — 64×64px buttons (spec: MF_L.keypadBtn) ── */}
        <div
          style={{
            display:         "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap:             MF_L.s1,
            padding:         `0 ${MF_L.s2}px`,
          }}
        >
          {KEYS.map((k, i) => {
            if (k === "") {
              return <div key={i} aria-hidden="true" />;
            }

            const isDelete  = k === "⌫";
            const isDisabled = k !== "⌫" && pin.length === 4;
            const isConfirmReady = pin.length === 4 && k === "⌫";

            return (
              <button
                key={i}
                onClick={() => {
                  if (pin.length === 4 && !isDelete) return;
                  handleKey(k);
                }}
                disabled={isDisabled}
                style={{
                  // ─ 64×64px per MediFlow keypad spec ─
                  minHeight:      MF_L.keypadBtn,  /* 64px */
                  width:          "100%",
                  background:     isDelete ? MF_C.errorLight : MF_C.surface,
                  border:         `2px solid ${isDelete ? MF_C.errorBorder : MF_C.border}`,
                  borderRadius:   MF_L.rLg,
                  color:          isDelete ? MF_C.errorText : MF_C.textStrong,
                  fontSize:       MF_T.h1,          /* 37px — large for dexterity */
                  fontWeight:     isDelete ? 700 : 400,
                  fontFamily:     MF_T.family,
                  cursor:         isDisabled ? "not-allowed" : "pointer",
                  opacity:        isDisabled ? 0.4 : 1,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "background 0.1s ease, transform 0.1s ease",
                }}
                aria-label={isDelete ? "Delete last digit" : `Press ${k}`}
                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)"; }}
                onMouseUp={(e)   => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              >
                {isDelete ? <Delete size={22} /> : k}
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div style={{ padding: `${MF_L.s1}px ${MF_L.s2}px 0` }}>
          <button
            onClick={onConfirm}
            disabled={pin.length < 4}
            style={{
              width:        "100%",
              minHeight:    MF_L.touch,        /* 56px touch target */
              background:   pin.length === 4 ? MF_C.primary : MF_C.locked,
              border:       "none",
              borderRadius: MF_L.rLg,
              color:        pin.length === 4 ? MF_C.textOnDark : MF_C.textMuted,
              fontSize:     MF_T.bodyL,        /* 27px */
              fontWeight:   700,
              fontFamily:   MF_T.family,
              cursor:       pin.length < 4 ? "not-allowed" : "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent:"center",
              gap:          8,
              transition:   "background 0.2s ease",
            }}
            aria-label="Confirm PIN and unlock"
            aria-disabled={pin.length < 4}
          >
            <LockOpen size={20} />
            Unlock Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unlocked result detail ────────────────────────────────────────────────────
function LabResultDetail({
  result,
  onClose,
}: {
  result:  LabResult;
  onClose: () => void;
}) {
  const statusColor = result.status === "critical"
    ? MF_C.error
    : result.status === "abnormal"
    ? MF_C.warning
    : MF_C.success;

  const statusLabel = result.status === "critical"
    ? "Critical — Contact doctor immediately"
    : result.status === "abnormal"
    ? "Abnormal — Review recommended"
    : "Within normal range";

  const StatusIcon = result.status === "critical"
    ? AlertTriangle
    : result.status === "abnormal"
    ? AlertTriangle
    : CheckCircle;

  return (
    <div
      style={{
        position:  "fixed",
        inset:     0,
        zIndex:    400,
        background:MF_C.bg,
        maxWidth:  MF_L.maxWidth,
        margin:    "0 auto",
        overflowY: "auto",
        display:   "flex",
        flexDirection:"column",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Lab result: ${result.title}`}
    >
      {/* Header */}
      <div
        style={{
          background:   MF_C.bg,
          padding:      `48px ${MF_L.s3}px ${MF_L.s2}px`,
          borderBottom: `1px solid ${MF_C.border}`,
          display:      "flex",
          alignItems:   "center",
          gap:          MF_L.s2,
          position:     "sticky",
          top:          0,
          zIndex:       10,
        }}
      >
        <button
          onClick={onClose}
          style={{
            width:          44,
            height:         44,
            background:     MF_C.locked,
            border:         "none",
            borderRadius:   MF_L.rMd,
            color:          MF_C.text,
            cursor:         "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
          aria-label="Close lab result"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1
            style={{
              color:      MF_C.textStrong,
              fontSize:   MF_T.h1,
              fontWeight: MF_T.h1Weight,
              lineHeight: `${MF_T.h1Line}px`,
              fontFamily: MF_T.family,
              margin:     0,
            }}
          >
            {result.title}
          </h1>
          <p
            style={{
              color:      MF_C.text,
              fontSize:   MF_T.label,
              lineHeight: `${MF_T.labelLine}px`,
              fontFamily: MF_T.family,
              margin:     0,
            }}
          >
            {result.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {" · "}{result.provider}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: MF_L.s3, flex: 1 }}>
        {/* Status banner — icon + color + text (WCAG) */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          MF_L.s1,
            background:   result.status === "critical" ? MF_C.errorLight
              : result.status === "abnormal" ? MF_C.warningLight
              : MF_C.successLight,
            border:       `1px solid ${statusColor}40`,
            borderRadius: MF_L.rLg,
            padding:      `${MF_L.s1}px ${MF_L.s2}px`,
            marginBottom: MF_L.s3,
          }}
          role="status"
        >
          <StatusIcon size={20} color={statusColor} aria-hidden="true" />
          <span
            style={{
              color:      result.status === "critical" ? MF_C.errorText
                : result.status === "abnormal" ? MF_C.warningDark
                : MF_C.successDark,
              fontSize:   MF_T.label,
              fontWeight: 700,
              fontFamily: MF_T.family,
              lineHeight: `${MF_T.labelLine}px`,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Test results */}
        <h2
          style={{
            color:         MF_C.text,
            fontSize:      MF_T.label,
            fontWeight:    700,
            letterSpacing: "0.08em",
            fontFamily:    MF_T.family,
            textTransform: "uppercase",
            marginBottom:  MF_L.s1,
          }}
        >
          Test Results
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: MF_L.s1 }}>
          {result.highlights.map((h, i) => {
            const isFlag = h.status !== "normal";
            return (
              <div
                key={i}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent:"space-between",
                  background:    isFlag ? MF_C.warningLight : MF_C.surface,
                  border:        `1px solid ${isFlag ? MF_C.warningBorder : MF_C.border}`,
                  borderRadius:  MF_L.rMd,
                  padding:       `${MF_L.s1}px ${MF_L.s2}px`,
                  minHeight:     MF_L.touch,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: MF_L.s1 }}>
                  {isFlag
                    ? <AlertTriangle size={16} color={MF_C.warning} aria-hidden="true" />
                    : <CheckCircle size={16} color={MF_C.success} aria-hidden="true" />
                  }
                  <span
                    style={{
                      color:      isFlag ? MF_C.warningDark : MF_C.textStrong,
                      fontSize:   MF_T.bodyL,
                      fontWeight: 500,
                      fontFamily: MF_T.family,
                      lineHeight: `${MF_T.bodyLLine}px`,
                    }}
                  >
                    {h.label}
                  </span>
                </div>
                <span
                  style={{
                    color:      isFlag ? MF_C.warning : MF_C.success,
                    fontSize:   MF_T.bodyL,
                    fontWeight: 700,
                    fontFamily: MF_T.family,
                  }}
                >
                  {h.value}{h.unit ? ` ${h.unit}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Lab result card (locked or unlocked) ──────────────────────────────────────
function LabCard({
  result,
  unlocked,
  onUnlockRequest,
  onViewDetails,
}: {
  result:          LabResult;
  unlocked:        boolean;
  onUnlockRequest: () => void;
  onViewDetails:   () => void;
}) {
  const statusColor = result.status === "critical" ? MF_C.error
    : result.status === "abnormal" ? MF_C.warning
    : MF_C.success;

  const StatusIcon = result.status !== "normal" ? AlertTriangle : CheckCircle;

  return (
    <div
      style={{
        background:   MF_C.surface,
        border:       `1px solid ${unlocked ? MF_C.border : MF_C.border}`,
        borderRadius: MF_L.rLg,
        overflow:     "hidden",
        position:     "relative",    /* needed for absolute overlay */
        boxShadow:    "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      {/* Card content — ALWAYS rendered; overlay obscures it when locked */}
      <div style={{ padding: MF_L.s2 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: MF_L.s2 }}>
          {/* Lab type icon container */}
          <div
            style={{
              width:          52,
              height:         52,
              background:     `${statusColor}14`,
              border:         `1px solid ${statusColor}30`,
              borderRadius:   MF_L.rMd,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
            aria-hidden="true"
          >
            <LabIcon type={result.type} color={statusColor} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color:      MF_C.textStrong,
                fontSize:   MF_T.bodyL,
                fontWeight: 700,
                lineHeight: `${MF_T.bodyLLine}px`,
                fontFamily: MF_T.family,
                margin:     0,
              }}
            >
              {result.title}
            </p>
            <p
              style={{
                color:      MF_C.text,
                fontSize:   MF_T.label,
                fontWeight: MF_T.labelWeight,
                lineHeight: `${MF_T.labelLine}px`,
                fontFamily: MF_T.family,
                margin:     "2px 0",
              }}
            >
              {result.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {" · "}{result.provider}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusIcon size={13} color={statusColor} aria-hidden="true" />
              <span
                style={{
                  color:      statusColor,
                  fontSize:   MF_T.micro,
                  fontWeight: 700,
                  fontFamily: MF_T.family,
                  textTransform: "capitalize",
                }}
              >
                {result.status}
              </span>
            </div>
          </div>

          {unlocked && (
            <button
              onClick={onViewDetails}
              style={{
                background:   "transparent",
                border:       "none",
                color:        MF_C.primary,
                cursor:       "pointer",
                padding:      4,
                display:      "flex",
                alignItems:   "center",
              }}
              aria-label={`View full ${result.title} results`}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── VAULT SECURITY LAYER — 25px blur + 70% #475569 overlay ── */}
      {/* Only shown when card is locked. Completely obscures card content. */}
      {!unlocked && <VaultLockedOverlay onUnlock={onUnlockRequest} />}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function MediFlowVault() {
  const navigate = useNavigate();
  const { data: labDTOs, loading, error } = useLabs();
  const labResults = labDTOs ? hydrateLabResults(labDTOs) : [];

  const [unlockedIds,  setUnlockedIds]  = useState<Set<string>>(new Set());
  const [unlockingId,  setUnlockingId]  = useState<string | null>(null);
  const [viewingResult,setViewingResult]= useState<LabResult | null>(null);
  const [pin,          setPin]          = useState("");
  const [pinError,     setPinError]     = useState("");

  function handleUnlockRequest(id: string) {
    setUnlockingId(id);
    setPin("");
    setPinError("");
  }

  function handlePinConfirm() {
    if (pin === DEMO_PIN) {
      setUnlockedIds((prev) => new Set([...prev, unlockingId!]));
      setUnlockingId(null);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Hint: use 2026");
      setPin("");
    }
  }

  if (loading) return <PageSkeleton title="Lab Vault" />;
  if (error) return <PageSkeleton title="Lab Vault" />;

  const unlockedCount = unlockedIds.size;
  const totalCount    = labResults.length;

  return (
    <>
      <div
        style={{
          background: MF_C.bg,
          minHeight:  "100vh",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            padding:      `48px ${MF_L.s3}px ${MF_L.s2}px`,
            borderBottom: `1px solid ${MF_C.border}`,
            background:   MF_C.bg,
            display:      "flex",
            alignItems:   "center",
            gap:          MF_L.s2,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width:          44,
              height:         44,
              background:     MF_C.locked,
              border:         "none",
              borderRadius:   MF_L.rMd,
              color:          MF_C.text,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                color:      MF_C.textStrong,
                fontSize:   MF_T.h1,
                fontWeight: MF_T.h1Weight,
                lineHeight: `${MF_T.h1Line}px`,
                fontFamily: MF_T.family,
                margin:     0,
              }}
            >
              Lab Vault
            </h1>
            <p
              style={{
                color:      MF_C.text,
                fontSize:   MF_T.label,
                lineHeight: `${MF_T.labelLine}px`,
                fontFamily: MF_T.family,
                margin:     0,
              }}
            >
              {unlockedCount}/{totalCount} unlocked · PIN: {DEMO_PIN}
            </p>
          </div>

          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              width:          44,
              height:         44,
              background:     `${MF_C.primary}14`,
              border:         `1px solid ${MF_C.primaryBorder}`,
              borderRadius:   MF_L.rMd,
            }}
            aria-hidden="true"
          >
            <Shield size={20} color={MF_C.primary} />
          </div>
        </div>

        {/* ── Security notice ── */}
        <div
          style={{
            margin:       `${MF_L.s2}px ${MF_L.s3}px`,
            background:   `${MF_C.primary}0D`,
            border:       `1px solid ${MF_C.primaryBorder}`,
            borderRadius: MF_L.rLg,
            padding:      `${MF_L.s1}px ${MF_L.s2}px`,
            display:      "flex",
            alignItems:   "center",
            gap:          MF_L.s1,
          }}
        >
          <Lock size={16} color={MF_C.primary} aria-hidden="true" />
          <span
            style={{
              color:      MF_C.primary,
              fontSize:   MF_T.label,
              fontWeight: 700,
              fontFamily: MF_T.family,
              lineHeight: `${MF_T.labelLine}px`,
            }}
          >
            MediFlow Vault Security
          </span>
          <span
            style={{
              color:      MF_C.text,
              fontSize:   MF_T.micro,
              fontFamily: MF_T.family,
              marginLeft: 4,
            }}
          >
            — 25px blur · 70% Slate overlay · 4-digit PIN
          </span>
        </div>

        {/* ── Lab result cards ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           MF_L.s2,
            padding:       `0 ${MF_L.s3}px ${MF_L.s6}px`,
          }}
        >
          {labResults.map((result) => (
            <LabCard
              key={result.id}
              result={result}
              unlocked={unlockedIds.has(result.id)}
              onUnlockRequest={() => handleUnlockRequest(result.id)}
              onViewDetails={() => setViewingResult(result)}
            />
          ))}
        </div>
      </div>

      {/* ── PIN keypad overlay ── */}
      {unlockingId && !unlockedIds.has(unlockingId) && (
        <NumericKeypad
          pin={pin}
          onChange={(p) => { setPin(p); setPinError(""); }}
          onConfirm={handlePinConfirm}
          onCancel={() => { setUnlockingId(null); setPin(""); setPinError(""); }}
          error={pinError}
        />
      )}

      {/* ── Unlocked detail view ── */}
      {viewingResult && (
        <LabResultDetail
          result={viewingResult}
          onClose={() => setViewingResult(null)}
        />
      )}
    </>
  );
}