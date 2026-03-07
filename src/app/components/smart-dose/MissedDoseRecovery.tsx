/**
 * HealthPulse · Missed Dose Recovery Flow (Sprint 5 — Behavioral Scaffolding)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Bottom-sheet modal that guides a patient through recovery after missing a dose.
 *
 * Flow:
 *   1. Acknowledge the miss (no shame — supportive language)
 *   2. Show recovery options based on medication type
 *   3. Log the chosen action
 *   4. Optionally trigger an EmotionalCheckIn
 *
 * Design: WCAG 2.1 AA · 56px touch targets · Montserrat · 8px grid
 * Status: icon + color + text (never color alone)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle, X, CheckCircle, Clock,
  Pill, Phone, SkipForward, ArrowRight,
  ShieldCheck, Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useSaveDoseRecovery } from "../../hooks/useHealthData";
import { C, T, L } from "../../design/tokens";

// ── Recovery options ──────────────────────────────────────────────────────────
interface RecoveryOption {
  id: "take_now" | "skip_dose" | "half_dose" | "contact_provider";
  label: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  bgColor: string;
}

const RECOVERY_OPTIONS: RecoveryOption[] = [
  {
    id:      "take_now",
    label:   "Take it now",
    detail:  "If it's within a safe window, take the dose now.",
    icon:    Pill,
    color:   C.primaryDark,
    bgColor: C.primaryLight,
  },
  {
    id:      "skip_dose",
    label:   "Skip this dose",
    detail:  "Wait for your next scheduled dose. Don't double up.",
    icon:    SkipForward,
    color:   C.secondary,
    bgColor: C.secondaryLight,
  },
  {
    id:      "half_dose",
    label:   "Take a partial dose",
    detail:  "Only if your provider has approved a half-dose catch-up.",
    icon:    ShieldCheck,
    color:   C.tealDark,
    bgColor: C.tealLight,
  },
  {
    id:      "contact_provider",
    label:   "Contact my care team",
    detail:  "If unsure, your provider can advise the best next step.",
    icon:    Phone,
    color:   C.alertText,
    bgColor: C.alertLight,
  },
];

// ── Reason options ──────────────────────────────────────────────────────────
const REASON_OPTIONS = [
  "Forgot",
  "Fell asleep",
  "Side effects concern",
  "Ran out of medication",
  "Was away from home",
  "Felt better, skipped it",
  "Other",
];

interface MissedDoseRecoveryProps {
  medicationId:   string;
  medicationName: string;
  dosage:         string;
  scheduledTime:  string;  // human-readable time string
  onClose:        () => void;
  onEmotionalCheckIn?: () => void;  // trigger emotional check-in after
}

export function MissedDoseRecovery({
  medicationId,
  medicationName,
  dosage,
  scheduledTime,
  onClose,
  onEmotionalCheckIn,
}: MissedDoseRecoveryProps) {
  const { save, loading } = useSaveDoseRecovery();
  const [step, setStep]     = useState(0); // 0: reason, 1: action, 2: confirm, 3: done
  const [reason, setReason] = useState<string | null>(null);
  const [action, setAction] = useState<RecoveryOption | null>(null);
  const [notes, setNotes]   = useState("");
  const focusTrapRef        = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const el = focusTrapRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [step, onClose]);

  async function handleConfirm() {
    if (!action || !reason) return;
    try {
      await save({
        medicationId,
        medicationName,
        dosage,
        missedAt:       scheduledTime,
        recoveryAction: action.id,
        reason:         reason,
        notes,
      });
      setStep(3);
      toast.success("Recovery action logged.");
    } catch (e: any) {
      console.error("[MissedDoseRecovery] save error:", e.message);
      toast.error("Could not save. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center"
      style={{ background: "rgba(17,24,32,0.82)", backdropFilter: C.frostedBlur }}
      role="dialog"
      aria-modal="true"
      aria-label={`Missed dose recovery for ${medicationName}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={focusTrapRef}
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          maxWidth:   L.maxWidth,
          background: C.bg,
          boxShadow:  "0 -8px 48px rgba(0,0,0,0.3)",
          maxHeight:  "90vh",
          overflowY:  "auto",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width:      44,
                height:     44,
                background: C.alertLight,
                border:     `1px solid ${C.alertBorder}`,
              }}
              aria-hidden="true"
            >
              <AlertTriangle size={22} color={C.alert} />
            </div>
            <div>
              <p style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                MISSED DOSE
              </p>
              <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>
                {medicationName} {dosage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{
              width:      44,
              height:     44,
              background: C.locked,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
              cursor:     "pointer",
            }}
            aria-label="Close missed dose recovery"
          >
            <X size={16} />
          </button>
        </div>

        {/* Reassurance banner */}
        <div
          className="mx-5 mb-4 flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: C.primaryLight, border: `1px solid ${C.primaryBorder}` }}
          role="note"
        >
          <ShieldCheck size={20} color={C.primary} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p style={{ color: C.primaryDark, fontSize: T.caption, fontWeight: 700, fontFamily: "inherit", lineHeight: 1.4 }}>
              It's okay — missing a dose happens.
            </p>
            <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit", lineHeight: 1.4, marginTop: 2 }}>
              Was due at {scheduledTime}. Let's figure out what to do next.
            </p>
          </div>
        </div>

        {/* ── Step 0: Why was it missed? ──────────────────────────────────── */}
        {step === 0 && (
          <div className="px-5 pb-6">
            <p
              className="mb-3"
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}
            >
              What happened?
            </p>
            <div className="flex flex-wrap gap-2">
              {REASON_OPTIONS.map(r => {
                const isSelected = reason === r;
                return (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className="rounded-full px-4 py-2 transition-all"
                    style={{
                      background: isSelected ? C.alertLight : C.locked,
                      border:     `1.5px solid ${isSelected ? C.alert : C.border}`,
                      color:      isSelected ? C.alertText : C.textSub,
                      fontSize:   T.caption,
                      fontWeight: isSelected ? 700 : 500,
                      fontFamily: "inherit",
                      cursor:     "pointer",
                      minHeight:  40,
                    }}
                    aria-pressed={isSelected}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!reason}
              className="w-full mt-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                minHeight:  L.touch,
                background: reason ? C.primary : C.locked,
                border:     `1px solid ${reason ? C.primaryBorder : C.border}`,
                color:      reason ? "#111820" : C.textMuted,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor:     reason ? "pointer" : "default",
                opacity:    reason ? 1 : 0.6,
              }}
            >
              Next — What to do
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Recovery options ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="px-5 pb-6">
            <p
              className="mb-3"
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}
            >
              What would you like to do?
            </p>
            <div className="flex flex-col gap-2">
              {RECOVERY_OPTIONS.map(opt => {
                const OptIcon = opt.icon;
                const isSelected = action?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAction(opt)}
                    className="flex items-center gap-3 rounded-xl px-4 text-left transition-all"
                    style={{
                      minHeight:  L.touch + 8,
                      background: isSelected ? opt.bgColor : C.locked,
                      border:     `2px solid ${isSelected ? opt.color : C.border}`,
                      cursor:     "pointer",
                    }}
                    aria-pressed={isSelected}
                  >
                    <div
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{
                        width:      36,
                        height:     36,
                        background: isSelected ? `${opt.color}18` : "transparent",
                      }}
                    >
                      <OptIcon size={20} color={isSelected ? opt.color : C.secondary} />
                    </div>
                    <div className="flex-1">
                      <span
                        style={{
                          color:      isSelected ? opt.color : C.text,
                          fontSize:   T.caption,
                          fontWeight: isSelected ? 700 : 600,
                          fontFamily: "inherit",
                        }}
                      >
                        {opt.label}
                      </span>
                      <p
                        style={{
                          color:      C.textSub,
                          fontSize:   12,
                          fontWeight: 400,
                          fontFamily: "inherit",
                          marginTop:  1,
                          lineHeight: 1.3,
                        }}
                      >
                        {opt.detail}
                      </p>
                    </div>
                    {isSelected && <CheckCircle size={18} color={opt.color} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-xl transition-all"
                style={{
                  minHeight:  L.touch,
                  background: C.locked,
                  border:     `1px solid ${C.border}`,
                  color:      C.textSub,
                  fontSize:   T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor:     "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!action}
                className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  minHeight:  L.touch,
                  background: action ? C.primary : C.locked,
                  border:     `1px solid ${action ? C.primaryBorder : C.border}`,
                  color:      action ? "#111820" : C.textMuted,
                  fontSize:   T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor:     action ? "pointer" : "default",
                  opacity:    action ? 1 : 0.6,
                }}
              >
                Confirm
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Confirm + notes ──────────────────────────────────────── */}
        {step === 2 && action && (
          <div className="px-5 pb-6">
            <div
              className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
              style={{
                background: action.bgColor,
                border:     `1.5px solid ${action.color}`,
              }}
            >
              {(() => { const ActionIcon = action.icon; return <ActionIcon size={20} color={action.color} aria-hidden="true" />; })()}
              <div>
                <p style={{ color: action.color, fontSize: T.caption, fontWeight: 700, fontFamily: "inherit" }}>
                  {action.label}
                </p>
                <p style={{ color: C.textSub, fontSize: 12, fontFamily: "inherit" }}>
                  {action.detail}
                </p>
              </div>
            </div>

            <p
              className="mb-2"
              style={{ color: C.text, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}
            >
              Any notes for your care team? (optional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything your provider should know..."
              className="w-full rounded-xl p-3 resize-none"
              style={{
                background: C.locked,
                border:     `1.5px solid ${C.border}`,
                color:      C.text,
                fontSize:   T.caption,
                fontFamily: "inherit",
                minHeight:  70,
                outline:    "none",
              }}
              aria-label="Notes for care team"
              rows={2}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = C.border; }}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl transition-all"
                style={{
                  minHeight:  L.touch,
                  background: C.locked,
                  border:     `1px solid ${C.border}`,
                  color:      C.textSub,
                  fontSize:   T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor:     "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  minHeight:  L.touch,
                  background: C.primary,
                  border:     `1px solid ${C.primaryBorder}`,
                  color:      "#111820",
                  fontSize:   T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor:     loading ? "wait" : "pointer",
                  opacity:    loading ? 0.7 : 1,
                }}
              >
                <CheckCircle size={18} />
                {loading ? "Saving..." : "Log Recovery"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ─────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="px-5 pb-8 flex flex-col items-center gap-3 pt-4" role="status" aria-live="polite">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width:      64,
                height:     64,
                background: C.successLight,
                border:     `2px solid ${C.successBorder}`,
              }}
            >
              <CheckCircle size={32} color={C.success} />
            </div>
            <p
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit", textAlign: "center" }}
            >
              Recovery action logged.
            </p>
            <p
              style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}
            >
              One missed dose won't undo your progress. You're doing great.
            </p>

            <div className="flex gap-3 mt-3 w-full">
              {onEmotionalCheckIn && (
                <button
                  onClick={() => { onClose(); onEmotionalCheckIn(); }}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{
                    minHeight:  L.touch,
                    background: C.roseLight || C.alertLight,
                    border:     `1px solid ${C.roseBorder || C.alertBorder}`,
                    color:      C.rose || C.alert,
                    fontSize:   T.caption,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor:     "pointer",
                  }}
                >
                  <Heart size={16} />
                  How I feel
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  minHeight:  L.touch,
                  background: C.primary,
                  border:     `1px solid ${C.primaryBorder}`,
                  color:      "#111820",
                  fontSize:   T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor:     "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
