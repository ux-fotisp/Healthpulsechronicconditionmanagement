/**
 * HealthPulse · Daily Check-In Card (Sprint 5 — Behavioral Scaffolding)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Condition-specific daily check-in with:
 *   - Energy, sleep, mood, pain scales
 *   - Condition-adaptive questions (diabetes, hypertension, etc.)
 *   - Frosted glass card style · WCAG 2.1 AA compliant
 *   - 56px touch targets · Montserrat typography · 8px grid
 *   - Status: icon + color + text (never color alone)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import {
  Sun, Moon, Zap, Heart, Frown, Smile, Meh,
  CheckCircle, ChevronRight, ThermometerSun,
  Activity, Droplets, Brain, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { useSaveCheckIn, useTodayCheckIn } from "../../hooks/useHealthData";
import { C, T, L } from "../../design/tokens";

// ── Scale definitions ─────────────────────────────────────────────────────────
const ENERGY_LABELS = ["Very low", "Low", "Okay", "Good", "Great"];
const SLEEP_LABELS  = ["Very poor", "Poor", "Fair", "Good", "Excellent"];
const MOOD_LABELS   = ["Struggling", "Low", "Neutral", "Good", "Upbeat"];
const MOOD_ICONS    = [Frown, Frown, Meh, Smile, Smile];

// ── Condition-specific question templates ─────────────────────────────────────
interface ConditionQuestion {
  id: string;
  question: string;
  type: "boolean" | "scale";
  condition: string;
}

const CONDITION_QUESTIONS: ConditionQuestion[] = [
  { id: "bg_check",    question: "Did you check your blood sugar today?",      type: "boolean", condition: "diabetes" },
  { id: "bg_fasting",  question: "Was your fasting glucose in range?",         type: "boolean", condition: "diabetes" },
  { id: "bp_check",    question: "Did you measure your blood pressure?",       type: "boolean", condition: "hypertension" },
  { id: "bp_meds",     question: "Did you take your BP medication on time?",   type: "boolean", condition: "hypertension" },
  { id: "salt_watch",  question: "Did you stay within your sodium limit?",     type: "boolean", condition: "hypertension" },
  { id: "exercise",    question: "Did you get 30 minutes of movement today?",  type: "boolean", condition: "general" },
  { id: "hydration",   question: "Did you drink enough water today?",          type: "boolean", condition: "general" },
];

// ── Symptom suggestions ──────────────────────────────────────────────────────
const SYMPTOM_OPTIONS = [
  "Headache", "Fatigue", "Dizziness", "Nausea",
  "Joint pain", "Shortness of breath", "Swelling", "Blurred vision",
];

// ── Scale selector component ─────────────────────────────────────────────────
function ScaleSelector({
  label,
  icon: Icon,
  value,
  onChange,
  labels,
  max = 5,
  iconColor = C.primary,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  value: number;
  onChange: (v: number) => void;
  labels: string[];
  max?: number;
  iconColor?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} color={iconColor} aria-hidden="true" />
        <span
          style={{
            color:      C.text,
            fontSize:   T.caption,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          {label}
        </span>
        {value > 0 && (
          <span
            style={{
              color:      C.successDark,
              fontSize:   T.caption,
              fontWeight: 700,
              fontFamily: "inherit",
              marginLeft: "auto",
            }}
          >
            {labels[value - 1]}
          </span>
        )}
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="flex-1 flex items-center justify-center rounded-xl transition-all duration-150"
              style={{
                minHeight:    L.touch,
                background:   isSelected ? C.primaryLight : C.locked,
                border:       `2px solid ${isSelected ? C.primary : C.border}`,
                color:        isSelected ? C.primaryDark : C.textSub,
                fontSize:     T.body,
                fontWeight:   isSelected ? 800 : 600,
                fontFamily:   "inherit",
                cursor:       "pointer",
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${labels[n - 1]} — ${n} out of ${max}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Boolean question component ──────────────────────────────────────────────
function BooleanQuestion({
  question,
  value,
  onChange,
}: {
  question: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4" style={{ minHeight: L.touch, background: C.locked }}>
      <span
        className="flex-1"
        style={{
          color:      C.text,
          fontSize:   T.caption,
          fontWeight: 500,
          fontFamily: "inherit",
          lineHeight: 1.4,
        }}
      >
        {question}
      </span>
      <div className="flex gap-2">
        {(["Yes", "No"] as const).map((label) => {
          const boolVal = label === "Yes";
          const isSelected = value === boolVal;
          return (
            <button
              key={label}
              onClick={() => onChange(boolVal)}
              className="rounded-lg px-3 transition-all"
              style={{
                minHeight:  40,
                background: isSelected
                  ? (boolVal ? C.successLight : C.alertLight)
                  : "transparent",
                border:     `1.5px solid ${isSelected
                  ? (boolVal ? C.success : C.alert)
                  : C.border}`,
                color:      isSelected
                  ? (boolVal ? C.successDark : C.alertText)
                  : C.textSub,
                fontSize:   T.caption,
                fontWeight: isSelected ? 700 : 500,
                fontFamily: "inherit",
                cursor:     "pointer",
              }}
              aria-pressed={isSelected}
              aria-label={`${question} — ${label}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function DailyCheckIn() {
  const { data } = useDashboardContext();
  const todayQuery = useTodayCheckIn();
  const { save, loading: saving } = useSaveCheckIn();

  const [step, setStep]          = useState(0); // 0: start, 1: scales, 2: conditions, 3: symptoms, 4: done
  const [energy, setEnergy]      = useState(0);
  const [sleep, setSleep]        = useState(0);
  const [mood, setMood]          = useState(0);
  const [pain, setPain]          = useState(0);
  const [answers, setAnswers]    = useState<Record<string, boolean | null>>({});
  const [symptoms, setSymptoms]  = useState<string[]>([]);
  const [notes, setNotes]        = useState("");
  const [completed, setCompleted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine patient conditions for adaptive questions
  const conditions = data?.patient?.conditions ?? [];
  const hasDiabetes     = conditions.some(c => c.toLowerCase().includes("diabet"));
  const hasHypertension = conditions.some(c => c.toLowerCase().includes("hypertens") || c.toLowerCase().includes("blood pressure"));

  const relevantQuestions = CONDITION_QUESTIONS.filter(q => {
    if (q.condition === "general") return true;
    if (q.condition === "diabetes" && hasDiabetes) return true;
    if (q.condition === "hypertension" && hasHypertension) return true;
    return false;
  });

  // If today's check-in already exists, show completed state
  useEffect(() => {
    if (todayQuery.data && todayQuery.data.id) {
      setCompleted(true);
    }
  }, [todayQuery.data]);

  async function handleSubmit() {
    try {
      const conditionChecks = relevantQuestions
        .filter(q => answers[q.id] !== undefined && answers[q.id] !== null)
        .map(q => ({
          question: q.question,
          answer: answers[q.id]!,
        }));

      await save({
        energyLevel:     energy,
        painLevel:       pain,
        sleepQuality:    sleep,
        moodRating:      mood,
        symptoms,
        conditionChecks,
        notes,
      });

      setCompleted(true);
      setStep(4);
      toast.success("Daily check-in saved!");
    } catch (e: any) {
      console.error("[DailyCheckIn] Error saving:", e.message);
      toast.error("Could not save check-in. Please try again.");
    }
  }

  function toggleSymptom(s: string) {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  const MoodIcon = mood > 0 ? MOOD_ICONS[mood - 1] : Sun;

  // ── Completed state ──────────────────────────────────────────────────────
  if (completed) {
    return (
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: C.bg,
          border:     `1px solid ${C.successBorder}`,
          boxShadow:  "0 2px 8px rgba(0,0,0,0.06)",
        }}
        role="region"
        aria-label="Daily check-in completed"
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            borderBottom: `1px solid ${C.successBorder}`,
            background:   C.successLight,
          }}
        >
          <CheckCircle size={14} color={C.success} aria-hidden="true" />
          <span
            style={{
              color:         C.successDark,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.1em",
              fontFamily:    "inherit",
            }}
          >
            CHECK-IN COMPLETE
          </span>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width:      48,
              height:     48,
              background: C.successLight,
              border:     `1px solid ${C.successBorder}`,
            }}
            aria-hidden="true"
          >
            <CheckCircle size={24} color={C.success} />
          </div>
          <div>
            <p
              style={{
                color:      C.text,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              Great job, you checked in today!
            </p>
            <p
              style={{
                color:      C.textSub,
                fontSize:   T.caption,
                fontWeight: 500,
                fontFamily: "inherit",
                marginTop:  2,
              }}
            >
              Your care team can see your progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Start state (step 0) ────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: C.bg,
          border:     `1px solid ${C.primaryBorder}`,
          boxShadow:  "0 2px 12px rgba(0,0,0,0.08)",
        }}
        role="region"
        aria-label="Daily health check-in"
        ref={cardRef}
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            borderBottom: `1px solid ${C.primaryBorder}`,
            background:   C.primaryLight,
          }}
        >
          <Sun size={14} color={C.primary} aria-hidden="true" />
          <span
            style={{
              color:         C.textSub,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.1em",
              fontFamily:    "inherit",
            }}
          >
            DAILY CHECK-IN
          </span>
          <span
            className="ml-auto"
            style={{
              color:      C.primary,
              fontSize:   T.nano,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            ~2 min
          </span>
        </div>

        <div className="px-5 py-4">
          <p
            style={{
              color:      C.text,
              fontSize:   T.body,
              fontWeight: 700,
              fontFamily: "inherit",
              lineHeight: 1.3,
            }}
          >
            Good morning! How are you feeling?
          </p>
          <p
            style={{
              color:      C.textSub,
              fontSize:   T.caption,
              fontWeight: 500,
              fontFamily: "inherit",
              marginTop:  4,
              lineHeight: 1.4,
            }}
          >
            A quick check-in helps track your wellness
            {hasDiabetes && " and blood sugar patterns"}
            {hasHypertension && " and blood pressure trends"}.
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full mt-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              background:  C.primary,
              color:       "#111820",
              fontSize:    T.body,
              fontWeight:  700,
              fontFamily:  "inherit",
              border:      `1px solid ${C.primaryBorder}`,
              minHeight:   L.touch,
              cursor:      "pointer",
            }}
            aria-label="Start daily check-in"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.primary; }}
          >
            <ThermometerSun size={18} />
            Start Check-In
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Scales ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: C.bg,
          border:     `1px solid ${C.primaryBorder}`,
          boxShadow:  "0 2px 12px rgba(0,0,0,0.08)",
        }}
        role="region"
        aria-label="Daily check-in — how you're feeling"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: `1px solid ${C.primaryBorder}`,
            background:   C.primaryLight,
          }}
        >
          <div className="flex items-center gap-2">
            <Sun size={14} color={C.primary} aria-hidden="true" />
            <span
              style={{
                color:         C.textSub,
                fontSize:      T.nano,
                fontWeight:    700,
                letterSpacing: "0.1em",
                fontFamily:    "inherit",
              }}
            >
              STEP 1 OF {relevantQuestions.length > 0 ? "3" : "2"}
            </span>
          </div>
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
            HOW YOU FEEL
          </span>
        </div>

        <div className="px-5 py-4">
          <ScaleSelector label="Energy level" icon={Zap} value={energy} onChange={setEnergy} labels={ENERGY_LABELS} iconColor={C.alert} />
          <ScaleSelector label="Sleep quality" icon={Moon} value={sleep} onChange={setSleep} labels={SLEEP_LABELS} iconColor="#7C9A92" />
          <ScaleSelector label="Mood" icon={MoodIcon} value={mood} onChange={setMood} labels={MOOD_LABELS} iconColor={C.purple} />

          {/* Pain scale (0-10 compressed to 1-5) */}
          <ScaleSelector label="Pain level" icon={Activity} value={pain} onChange={setPain} labels={["None", "Mild", "Moderate", "Significant", "Severe"]} iconColor={C.error} />

          {/* Nav buttons */}
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
              onClick={() => setStep(relevantQuestions.length > 0 ? 2 : 3)}
              disabled={energy === 0 || sleep === 0 || mood === 0}
              className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                minHeight:  L.touch,
                background: (energy > 0 && sleep > 0 && mood > 0) ? C.primary : C.locked,
                border:     `1px solid ${(energy > 0 && sleep > 0 && mood > 0) ? C.primaryBorder : C.border}`,
                color:      (energy > 0 && sleep > 0 && mood > 0) ? "#111820" : C.textMuted,
                fontSize:   T.body,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor:     (energy > 0 && sleep > 0 && mood > 0) ? "pointer" : "default",
                opacity:    (energy > 0 && sleep > 0 && mood > 0) ? 1 : 0.6,
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Condition-specific questions ────────────────────────────────
  if (step === 2) {
    return (
      <div
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          background: C.bg,
          border:     `1px solid ${C.primaryBorder}`,
          boxShadow:  "0 2px 12px rgba(0,0,0,0.08)",
        }}
        role="region"
        aria-label="Daily check-in — condition-specific questions"
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: `1px solid ${C.primaryBorder}`,
            background:   C.primaryLight,
          }}
        >
          <div className="flex items-center gap-2">
            <Brain size={14} color={C.primary} aria-hidden="true" />
            <span
              style={{
                color:         C.textSub,
                fontSize:      T.nano,
                fontWeight:    700,
                letterSpacing: "0.1em",
                fontFamily:    "inherit",
              }}
            >
              STEP 2 OF 3
            </span>
          </div>
          <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
            YOUR CONDITIONS
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Condition tag */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiabetes && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1"
                style={{
                  background: "rgba(155,107,181,0.1)",
                  border:     "1px solid rgba(155,107,181,0.25)",
                  color:      "#6B3FA0",
                  fontSize:   T.nano,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                <Droplets size={10} aria-hidden="true" />
                DIABETES
              </span>
            )}
            {hasHypertension && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1"
                style={{
                  background: C.roseLight,
                  border:     `1px solid ${C.roseBorder}`,
                  color:      C.rose,
                  fontSize:   T.nano,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                <Activity size={10} aria-hidden="true" />
                HYPERTENSION
              </span>
            )}
          </div>

          {relevantQuestions.map(q => (
            <BooleanQuestion
              key={q.id}
              question={q.question}
              value={answers[q.id] ?? null}
              onChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
            />
          ))}

          <div className="flex gap-3 mt-2">
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
              onClick={() => setStep(3)}
              className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
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
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Symptoms + Notes + Submit ──────────────────────────────────
  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border:     `1px solid ${C.primaryBorder}`,
        boxShadow:  "0 2px 12px rgba(0,0,0,0.08)",
      }}
      role="region"
      aria-label="Daily check-in — symptoms and notes"
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.primaryBorder}`,
          background:   C.primaryLight,
        }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} color={C.primary} aria-hidden="true" />
          <span
            style={{
              color:         C.textSub,
              fontSize:      T.nano,
              fontWeight:    700,
              letterSpacing: "0.1em",
              fontFamily:    "inherit",
            }}
          >
            FINAL STEP
          </span>
        </div>
        <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
          SYMPTOMS & NOTES
        </span>
      </div>

      <div className="px-5 py-4">
        {/* Symptom tags */}
        <p
          className="mb-2"
          style={{
            color:      C.text,
            fontSize:   T.caption,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          Any symptoms today? (optional)
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SYMPTOM_OPTIONS.map(s => {
            const selected = symptoms.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className="rounded-full px-3 py-1.5 transition-all"
                style={{
                  background: selected ? C.alertLight : C.locked,
                  border:     `1.5px solid ${selected ? C.alert : C.border}`,
                  color:      selected ? C.alertText : C.textSub,
                  fontSize:   T.caption,
                  fontWeight: selected ? 700 : 500,
                  fontFamily: "inherit",
                  cursor:     "pointer",
                  minHeight:  36,
                }}
                aria-pressed={selected}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <p
          className="mb-2"
          style={{
            color:      C.text,
            fontSize:   T.caption,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          Anything else to note? (optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How you're feeling, any concerns..."
          className="w-full rounded-xl p-3 resize-none"
          style={{
            background: C.locked,
            border:     `1.5px solid ${C.border}`,
            color:      C.text,
            fontSize:   T.caption,
            fontFamily: "inherit",
            minHeight:  80,
            outline:    "none",
          }}
          aria-label="Additional notes"
          rows={3}
          onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = C.border; }}
        />

        {/* Nav */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setStep(relevantQuestions.length > 0 ? 2 : 1)}
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
            disabled={saving}
            className="flex-[2] rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              minHeight:  L.touch,
              background: C.primary,
              border:     `1px solid ${C.primaryBorder}`,
              color:      "#111820",
              fontSize:   T.body,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor:     saving ? "wait" : "pointer",
              opacity:    saving ? 0.7 : 1,
            }}
            aria-label="Submit daily check-in"
          >
            <CheckCircle size={18} />
            {saving ? "Saving..." : "Submit Check-In"}
          </button>
        </div>
      </div>
    </div>
  );
}
