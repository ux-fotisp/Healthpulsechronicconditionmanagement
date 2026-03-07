/**
 * HealthPulse · Emotional Check-In Modal (Sprint 5 — Behavioral Scaffolding)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Triggered when an abnormal vital reading is detected.
 * Asks the user how they're feeling emotionally, offers coping strategies.
 *
 * Design: Bottom sheet modal, frosted glass backdrop, WCAG 2.1 AA
 * Touch targets: 56px min · Montserrat · 8px grid
 * Status: icon + color + text (never color alone)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import {
  Heart, X, CheckCircle, AlertTriangle,
  Frown, Meh, Smile, CloudRain, Shield,
  Phone, BookOpen, Wind,
} from "lucide-react";
import { toast } from "sonner";
import { useSaveEmotionalCheckIn } from "../../hooks/useHealthData";
import { C, T, L } from "../../design/tokens";

// ── Emotion options ──────────────────────────────────────────────────────────
interface EmotionOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  bgColor: string;
}

const EMOTIONS: EmotionOption[] = [
  { id: "worried",    label: "Worried",     icon: CloudRain, color: "#7C5A35", bgColor: "rgba(163,120,78,0.10)" },
  { id: "anxious",    label: "Anxious",     icon: Frown,     color: "#9B5940", bgColor: "rgba(217,165,150,0.12)" },
  { id: "frustrated", label: "Frustrated",  icon: Frown,     color: C.error,   bgColor: "rgba(188,108,37,0.10)" },
  { id: "neutral",    label: "Neutral",     icon: Meh,       color: C.secondary, bgColor: C.secondaryLight },
  { id: "calm",       label: "Calm",        icon: Shield,    color: C.tealDark, bgColor: C.tealLight },
  { id: "hopeful",    label: "Hopeful",     icon: Smile,     color: C.successDark, bgColor: C.successLight },
];

// ── Coping actions ──────────────────────────────────────────────────────────
interface CopingAction {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const COPING_ACTIONS: CopingAction[] = [
  { id: "breathe",    label: "Take deep breaths",        detail: "A few slow breaths can help calm your body.", icon: Wind },
  { id: "call_team",  label: "Contact my care team",     detail: "Reach out if something feels wrong.",         icon: Phone },
  { id: "journal",    label: "Write about it",           detail: "Journaling can help process feelings.",       icon: BookOpen },
  { id: "rest",       label: "Take a rest",              detail: "Give your body time to recover.",             icon: Shield },
  { id: "nothing",    label: "I'm okay, no action needed", detail: "That's perfectly fine.",                    icon: CheckCircle },
];

interface EmotionalCheckInProps {
  triggerType: string;    // "abnormal_reading" | "missed_dose"
  triggerDetail: string;  // e.g., "Blood Pressure 155/98 — High"
  onClose: () => void;
}

export function EmotionalCheckIn({ triggerType, triggerDetail, onClose }: EmotionalCheckInProps) {
  const { save, loading } = useSaveEmotionalCheckIn();
  const [step, setStep]           = useState(0); // 0: emotion, 1: intensity, 2: coping, 3: done
  const [emotion, setEmotion]     = useState<string | null>(null);
  const [intensity, setIntensity] = useState(0);
  const [coping, setCoping]       = useState<string | null>(null);
  const [notes, setNotes]         = useState("");
  const focusTrapRef              = useRef<HTMLDivElement>(null);

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

  async function handleSubmit() {
    if (!emotion || !coping) return;
    try {
      await save({
        triggerType,
        triggerDetail,
        emotion,
        intensityLevel: intensity,
        copingAction:   coping,
        notes,
      });
      setStep(3);
      toast.success("Emotional check-in saved.");
      setTimeout(onClose, 2000);
    } catch (e: any) {
      console.error("[EmotionalCheckIn] save error:", e.message);
      toast.error("Could not save. Please try again.");
    }
  }

  const selectedEmotion = EMOTIONS.find(e => e.id === emotion);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ background: "rgba(17,24,32,0.80)", backdropFilter: C.frostedBlur }}
      role="dialog"
      aria-modal="true"
      aria-label="Emotional check-in"
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
                background: C.roseLight || C.alertLight,
                border:     `1px solid ${C.roseBorder || C.alertBorder}`,
              }}
              aria-hidden="true"
            >
              <Heart size={22} color={C.rose || C.alert} />
            </div>
            <div>
              <p style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                HOW ARE YOU FEELING?
              </p>
              <p style={{ color: C.text, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit", marginTop: 1 }}>
                After: {triggerDetail}
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
            aria-label="Close emotional check-in"
          >
            <X size={16} />
          </button>
        </div>

        {/* Trigger context banner */}
        <div
          className="mx-5 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
          role="note"
        >
          <AlertTriangle size={16} color={C.alert} aria-hidden="true" />
          <span style={{ color: C.alertText, fontSize: T.caption, fontWeight: 600, fontFamily: "inherit" }}>
            {triggerType === "abnormal_reading"
              ? "An unusual reading was logged. This is a good time to check in with yourself."
              : "A dose was missed. Let's see how you're doing."}
          </span>
        </div>

        {/* ── Step 0: Select emotion ───────────────────────────────────────── */}
        {step === 0 && (
          <div className="px-5 pb-6">
            <p
              className="mb-3"
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}
            >
              Right now, I feel...
            </p>
            <div className="grid grid-cols-3 gap-3">
              {EMOTIONS.map(em => {
                const EmIcon    = em.icon;
                const isSelected = emotion === em.id;
                return (
                  <button
                    key={em.id}
                    onClick={() => { setEmotion(em.id); setStep(1); }}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl transition-all"
                    style={{
                      minHeight:  88,
                      background: isSelected ? em.bgColor : C.locked,
                      border:     `2px solid ${isSelected ? em.color : C.border}`,
                      cursor:     "pointer",
                    }}
                    aria-pressed={isSelected}
                    aria-label={`I feel ${em.label}`}
                  >
                    <EmIcon size={24} color={em.color} />
                    <span
                      style={{
                        color:      isSelected ? em.color : C.textSub,
                        fontSize:   T.caption,
                        fontWeight: isSelected ? 700 : 500,
                        fontFamily: "inherit",
                      }}
                    >
                      {em.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 1: Intensity ──────────────────────────────────────────── */}
        {step === 1 && selectedEmotion && (
          <div className="px-5 pb-6">
            <p
              className="mb-1"
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}
            >
              How strong is this feeling?
            </p>
            <p
              className="mb-4"
              style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}
            >
              You selected: <strong style={{ color: selectedEmotion.color }}>{selectedEmotion.label}</strong>
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label="Intensity level">
              {[1, 2, 3, 4, 5].map(n => {
                const isSelected = intensity === n;
                const labels = ["Very mild", "Mild", "Moderate", "Strong", "Very strong"];
                return (
                  <button
                    key={n}
                    onClick={() => { setIntensity(n); setStep(2); }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all"
                    style={{
                      minHeight:  L.touch + 16,
                      background: isSelected ? selectedEmotion.bgColor : C.locked,
                      border:     `2px solid ${isSelected ? selectedEmotion.color : C.border}`,
                      cursor:     "pointer",
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${labels[n - 1]} — ${n} out of 5`}
                  >
                    <span
                      style={{
                        color:      isSelected ? selectedEmotion.color : C.text,
                        fontSize:   20,
                        fontWeight: 800,
                        fontFamily: "inherit",
                      }}
                    >
                      {n}
                    </span>
                    <span
                      style={{
                        color:      C.textSub,
                        fontSize:   9,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        lineHeight: 1.1,
                        textAlign:  "center",
                      }}
                    >
                      {labels[n - 1]}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(0)}
              className="w-full mt-4 rounded-xl transition-all"
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
              Back — change emotion
            </button>
          </div>
        )}

        {/* ── Step 2: Coping action ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-5 pb-6">
            <p
              className="mb-1"
              style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}
            >
              What would help right now?
            </p>
            <p
              className="mb-4"
              style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit" }}
            >
              Choose one, or skip if you prefer.
            </p>

            <div className="flex flex-col gap-2">
              {COPING_ACTIONS.map(action => {
                const ActionIcon = action.icon;
                const isSelected = coping === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => setCoping(action.id)}
                    className="flex items-center gap-3 rounded-xl px-4 text-left transition-all"
                    style={{
                      minHeight:  L.touch,
                      background: isSelected ? C.primaryLight : C.locked,
                      border:     `1.5px solid ${isSelected ? C.primary : C.border}`,
                      cursor:     "pointer",
                    }}
                    aria-pressed={isSelected}
                  >
                    <ActionIcon size={18} color={isSelected ? C.primary : C.secondary} aria-hidden="true" />
                    <div className="flex-1">
                      <span
                        style={{
                          color:      isSelected ? C.primaryDark : C.text,
                          fontSize:   T.caption,
                          fontWeight: isSelected ? 700 : 600,
                          fontFamily: "inherit",
                        }}
                      >
                        {action.label}
                      </span>
                      <p
                        style={{
                          color:      C.textSub,
                          fontSize:   12,
                          fontWeight: 400,
                          fontFamily: "inherit",
                          marginTop:  1,
                        }}
                      >
                        {action.detail}
                      </p>
                    </div>
                    {isSelected && <CheckCircle size={18} color={C.primary} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {/* Optional notes */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else on your mind? (optional)"
              className="w-full rounded-xl p-3 resize-none mt-3"
              style={{
                background: C.locked,
                border:     `1.5px solid ${C.border}`,
                color:      C.text,
                fontSize:   T.caption,
                fontFamily: "inherit",
                minHeight:  60,
                outline:    "none",
              }}
              aria-label="Additional notes"
              rows={2}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = C.border; }}
            />

            {/* Submit */}
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
                onClick={handleSubmit}
                disabled={!coping || loading}
                className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  minHeight:  L.touch,
                  background: coping ? C.primary : C.locked,
                  border:     `1px solid ${coping ? C.primaryBorder : C.border}`,
                  color:      coping ? "#111820" : C.textMuted,
                  fontSize:   T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor:     coping && !loading ? "pointer" : "default",
                  opacity:    coping ? 1 : 0.6,
                }}
                aria-label="Save emotional check-in"
              >
                <Heart size={18} />
                {loading ? "Saving..." : "Save Check-In"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ───────────────────────────────────────────────── */}
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
              style={{
                color:      C.text,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
                textAlign:  "center",
              }}
            >
              Thank you for checking in.
            </p>
            <p
              style={{
                color:      C.textSub,
                fontSize:   T.caption,
                fontWeight: 500,
                fontFamily: "inherit",
                textAlign:  "center",
                maxWidth:   280,
                lineHeight: 1.5,
              }}
            >
              It takes courage to notice how you feel. Your well-being matters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
