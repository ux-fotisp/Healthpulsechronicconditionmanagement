/**
 * MediFlow · Health Profile Builder — 5-Step Onboarding Wizard
 * ═══════════════════════════════════════════════════════════════
 * Design rules (MediFlow spec):
 *   • Progressive disclosure — ONE question per screen only
 *   • Background: Soft Alabaster #FBFBFB
 *   • Form labels: Montserrat 20pt (27px), line-height 1.5
 *   • Tap cards: min 80px height, Active State border logic (3px #5E8271)
 *   • Input Default:  2px border #CBD5E1, 16px radius
 *   • Input Focus:    3px solid #5E8271 + pulse indicator icon
 *   • Input Error:    2px border #BC6C25 + mandatory warning icon
 *   • All touch targets: 56px min height
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, Heart, Activity, Wind,
  TrendingUp, Plus, Pill, User, Stethoscope,
  CheckCircle, AlertTriangle, Zap, PenLine, Check,
  HeartPulse, Droplets,
} from "lucide-react";
import { MF_C, MF_T, MF_L, MEDIFLOW_NAME } from "../design/mediflow";
import { useSaveHealthProfile } from "../hooks/useHealthData";
import { toast } from "sonner";

// ── Total steps ────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;

// ── Wizard form state ──────────────────────────────────────────────────────────
interface WizardData {
  name:        string;
  conditions:  string[];
  medications: string[];
  physician:   string;
  specialty:   string;
}

// ── Styled sub-components ─────────────────────────────────────────────────────

/** Shared header with progress bar + back/step counter */
function WizardHeader({
  step,
  onBack,
}: {
  step:   number;
  onBack: () => void;
}) {
  const pct = (step / TOTAL_STEPS) * 100;

  return (
    <div
      style={{
        background:   MF_C.bg,
        paddingTop:   48,
        paddingLeft:  MF_L.s3,
        paddingRight: MF_L.s3,
        paddingBottom:MF_L.s2,
        borderBottom: `1px solid ${MF_C.border}`,
      }}
    >
      {/* Step counter + back */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          disabled={step === 1}
          style={{
            background:   "transparent",
            border:       "none",
            color:        step === 1 ? MF_C.textMuted : MF_C.text,
            cursor:       step === 1 ? "not-allowed" : "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          4,
            fontFamily:   MF_T.family,
            fontSize:     MF_T.label,     /* 21px / 16pt */
            fontWeight:   MF_T.labelWeight,
            opacity:      step === 1 ? 0.4 : 1,
            padding:      0,
            minHeight:    "auto",
          }}
          aria-label="Go back to previous step"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <span
          style={{
            color:         MF_C.textMuted,
            fontSize:      MF_T.micro,
            fontWeight:    600,
            fontFamily:    MF_T.family,
            letterSpacing: "0.06em",
          }}
        >
          STEP {step} OF {TOTAL_STEPS}
        </span>

        <div style={{ width: 56 }} aria-hidden="true" />
      </div>

      {/* Progress bar */}
      <div
        style={{
          height:       6,
          background:   MF_C.border,
          borderRadius: MF_L.rFull,
          overflow:     "hidden",
        }}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Step ${step} of ${TOTAL_STEPS}`}
      >
        <div
          style={{
            height:         "100%",
            width:          `${pct}%`,
            background:     MF_C.primary,
            borderRadius:   MF_L.rFull,
            transition:     "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

/** Montserrat 20pt question label with sub-label */
function StepQuestion({
  label,
  sub,
}: {
  label: string;
  sub?:  string;
}) {
  return (
    <div style={{ marginBottom: MF_L.s3 }}>
      <h2
        style={{
          color:      MF_C.textStrong,
          fontSize:   MF_T.bodyL,         /* 27px / 20pt — spec required */
          fontWeight: 700,
          lineHeight: `${MF_T.bodyLLine}px`,  /* 1.5× font size — dyslexia rule */
          fontFamily: MF_T.family,
          margin:     0,
        }}
      >
        {label}
      </h2>
      {sub && (
        <p
          style={{
            color:      MF_C.text,
            fontSize:   MF_T.label,         /* 21px / 16pt */
            lineHeight: `${MF_T.labelLine}px`,
            fontWeight: MF_T.labelWeight,
            fontFamily: MF_T.family,
            marginTop:  MF_L.s0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/** Tap card — 80px min, Active State border logic */
function TapCard({
  label,
  sub,
  Icon,
  selected,
  onToggle,
}: {
  label:    string;
  sub?:     string;
  Icon:     React.ComponentType<{ size?: number; color?: string }>;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width:        "100%",
        minHeight:    MF_L.tapCard,     /* 80px — MediFlow tap-card spec */
        background:   selected ? MF_C.primaryLight : MF_C.surface,
        border:       selected
          ? `3px solid ${MF_C.primary}`          /* Active State — 3px #5E8271 */
          : `2px solid ${MF_C.border}`,           /* Default — 2px #CBD5E1 */
        borderRadius: MF_L.rLg,                   /* 16px */
        display:      "flex",
        alignItems:   "center",
        gap:          MF_L.s2,
        padding:      `0 ${MF_L.s3}px`,
        cursor:       "pointer",
        transition:   "border 0.15s ease, background 0.15s ease",
        textAlign:    "left",
        fontFamily:   MF_T.family,
        boxShadow:    selected
          ? `0 0 0 4px ${MF_C.primaryGlow}`
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      aria-pressed={selected}
      aria-label={`${label}${selected ? " — selected" : ""}`}
      onFocus={(e) => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${MF_C.primaryGlow}`;
      }}
      onBlur={(e) => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width:          48,
          height:         48,
          background:     selected ? `${MF_C.primary}1A` : MF_C.locked,
          borderRadius:   MF_L.rMd,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          transition:     "background 0.15s ease",
        }}
        aria-hidden="true"
      >
        <Icon size={22} color={selected ? MF_C.primary : MF_C.text} />
      </div>

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color:      selected ? MF_C.primary : MF_C.textStrong,
            fontSize:   MF_T.bodyL,       /* 27px / 20pt — spec required */
            fontWeight: selected ? 700 : 500,
            lineHeight: `${MF_T.bodyLLine}px`,
            fontFamily: MF_T.family,
            margin:     0,
            transition: "color 0.15s ease",
          }}
        >
          {label}
        </p>
        {sub && (
          <p
            style={{
              color:      selected ? MF_C.primary : MF_C.text,
              fontSize:   MF_T.micro,
              lineHeight: `${MF_T.microLine}px`,
              fontFamily: MF_T.family,
              margin:     "2px 0 0 0",
            }}
          >
            {sub}
          </p>
        )}
      </div>

      {/* Selection indicator (color + icon + shape — WCAG: never color alone) */}
      <div
        style={{
          width:          28,
          height:         28,
          background:     selected ? MF_C.primary : "transparent",
          border:         selected ? "none" : `2px solid ${MF_C.border}`,
          borderRadius:   MF_L.rFull,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          transition:     "all 0.15s ease",
        }}
        aria-hidden="true"
      >
        {selected && <Check size={14} color="#FFFFFF" />}
      </div>
    </button>
  );
}

/** Text input — full MediFlow input state machine */
function MediInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
}: {
  label:       string;
  placeholder: string;
  value:       string;
  onChange:    (v: string) => void;
  error?:      string;
  type?:       string;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = Boolean(error);

  return (
    <div style={{ width: "100%", marginBottom: MF_L.s2 }}>
      {/* Label — 21px / 16pt Montserrat Medium */}
      <label
        style={{
          display:    "block",
          color:      hasError ? MF_C.errorText : MF_C.textStrong,
          fontSize:   MF_T.bodyL,       /* 27px / 20pt — spec: form labels */
          fontWeight: 700,
          lineHeight: `${MF_T.bodyLLine}px`,
          fontFamily: MF_T.family,
          marginBottom: MF_L.s1,
        }}
      >
        {label}
        {hasError && (
          <span style={{ color: MF_C.error, marginLeft: 6 }} aria-hidden="true">*</span>
        )}
      </label>

      {/* Input container — holds field + active pulse indicator */}
      <div style={{ position: "relative" }}>
        {/* Active/focus pulse indicator — MANDATORY per spec */}
        {focused && !hasError && (
          <div
            style={{
              position:       "absolute",
              right:          16,
              top:            "50%",
              transform:      "translateY(-50%)",
              display:        "flex",
              alignItems:     "center",
              gap:            4,
            }}
            aria-hidden="true"
          >
            <PenLine size={18} color={MF_C.primary} />
            {/* Pulse ring animation */}
            <span
              style={{
                width:        8,
                height:       8,
                borderRadius: "50%",
                background:   MF_C.primary,
                display:      "block",
                animation:    "mf-pulse 1.4s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* Error icon — MANDATORY: must accompany error state (WCAG: not color alone) */}
        {hasError && (
          <div
            style={{
              position:  "absolute",
              right:     16,
              top:       "50%",
              transform: "translateY(-50%)",
            }}
            aria-hidden="true"
          >
            <AlertTriangle size={18} color={MF_C.error} />
          </div>
        )}

        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width:        "100%",
            boxSizing:    "border-box",
            minHeight:    MF_L.touch,       /* 56px touch target */
            background:   MF_C.inputBg,
            border:       hasError
              ? `2px solid ${MF_C.borderError}`   /* Error: 2px #BC6C25 */
              : focused
              ? `3px solid ${MF_C.borderFocus}`   /* Focus: 3px #5E8271 */
              : `2px solid ${MF_C.border}`,        /* Default: 2px #CBD5E1 */
            borderRadius: MF_L.inputRadius,         /* 16px */
            paddingLeft:  MF_L.s2,
            paddingRight: 52,
            fontFamily:   MF_T.family,
            fontSize:     MF_T.bodyL,               /* 27px / 20pt */
            fontWeight:   MF_T.bodyLWeight,
            color:        MF_C.textStrong,
            outline:      "none",
            transition:   "border 0.15s ease, box-shadow 0.15s ease",
            boxShadow:    focused && !hasError
              ? `0 0 0 4px ${MF_C.primaryGlow}`
              : "none",
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        />
      </div>

      {/* Error message — icon + text together (WCAG: status never by color alone) */}
      {hasError && (
        <div
          id={`${label}-error`}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        6,
            marginTop:  6,
          }}
          role="alert"
        >
          <AlertTriangle size={14} color={MF_C.error} aria-hidden="true" />
          <span
            style={{
              color:      MF_C.errorText,
              fontSize:   MF_T.label,
              fontWeight: MF_T.labelWeight,
              fontFamily: MF_T.family,
              lineHeight: `${MF_T.labelLine}px`,
            }}
          >
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── STEP DATA ─────────────────────────────────────────────────────────────────

const CONDITIONS = [
  { id: "hypertension", label: "Hypertension",    sub: "High blood pressure",    Icon: Heart       },
  { id: "diabetes2",    label: "Type 2 Diabetes", sub: "Blood glucose management",Icon: Activity    },
  { id: "heart",        label: "Heart Disease",   sub: "Cardiovascular condition", Icon: HeartPulse  },
  { id: "asthma",       label: "Asthma",          sub: "Respiratory condition",   Icon: Wind        },
  { id: "cholesterol",  label: "High Cholesterol",sub: "Lipid management",        Icon: TrendingUp  },
  { id: "kidney",       label: "Kidney Disease",  sub: "Renal function monitoring",Icon: Droplets   },
  { id: "other",        label: "Other",           sub: "Not listed above",        Icon: Plus        },
];

const MEDICATIONS = [
  { id: "lisinopril",    label: "Lisinopril",    sub: "10mg — once daily",    Icon: Pill },
  { id: "metformin",     label: "Metformin",     sub: "500mg — twice daily",  Icon: Pill },
  { id: "amlodipine",    label: "Amlodipine",    sub: "5mg — once daily",     Icon: Pill },
  { id: "atorvastatin",  label: "Atorvastatin",  sub: "20mg — at bedtime",    Icon: Pill },
  { id: "other_meds",    label: "Other",         sub: "Not listed here",      Icon: Plus },
  { id: "none",          label: "None currently",sub: "No active medications", Icon: CheckCircle },
];

const SPECIALTIES = [
  { id: "cardiology",   label: "Cardiology",         Icon: Heart       },
  { id: "endocrinology",label: "Endocrinology",      Icon: Activity    },
  { id: "internal",     label: "Internal Medicine",  Icon: Stethoscope },
  { id: "general",      label: "General Practice",   Icon: User        },
  { id: "nephrology",   label: "Nephrology",         Icon: Droplets    },
  { id: "pulmonology",  label: "Pulmonology",        Icon: Wind        },
];

// ─── STEP SCREENS ──────────────────────────────────────────────────────────────

function Step1Name({
  data,
  setData,
  nameError,
}: {
  data:      WizardData;
  setData:   React.Dispatch<React.SetStateAction<WizardData>>;
  nameError: string;
}) {
  return (
    <div>
      <StepQuestion
        label="What should we call you?"
        sub="Your name will appear across your health dashboard and in reports shared with your care team."
      />
      <MediInput
        label="Full Name"
        placeholder="e.g. Sarah Mitchell"
        value={data.name}
        onChange={(v) => setData((d) => ({ ...d, name: v }))}
        error={nameError}
      />
    </div>
  );
}

function Step2Conditions({
  data,
  setData,
}: {
  data:    WizardData;
  setData: React.Dispatch<React.SetStateAction<WizardData>>;
}) {
  function toggle(id: string) {
    setData((d) => ({
      ...d,
      conditions: d.conditions.includes(id)
        ? d.conditions.filter((c) => c !== id)
        : [...d.conditions, id],
    }));
  }

  return (
    <div>
      <StepQuestion
        label="Which conditions are you managing?"
        sub="Select all that apply. This helps personalize your medication reminders and lab tracking."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: MF_L.s1 }}>
        {CONDITIONS.map((c) => (
          <TapCard
            key={c.id}
            label={c.label}
            sub={c.sub}
            Icon={c.Icon}
            selected={data.conditions.includes(c.id)}
            onToggle={() => toggle(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Step3Medications({
  data,
  setData,
}: {
  data:    WizardData;
  setData: React.Dispatch<React.SetStateAction<WizardData>>;
}) {
  function toggle(id: string) {
    setData((d) => ({
      ...d,
      medications: d.medications.includes(id)
        ? d.medications.filter((m) => m !== id)
        : [...d.medications, id],
    }));
  }

  return (
    <div>
      <StepQuestion
        label="Which medications are you currently taking?"
        sub="Select all that apply. We'll build your personalized dose schedule from this list."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: MF_L.s1 }}>
        {MEDICATIONS.map((m) => (
          <TapCard
            key={m.id}
            label={m.label}
            sub={m.sub}
            Icon={m.Icon}
            selected={data.medications.includes(m.id)}
            onToggle={() => toggle(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Step4Physician({
  data,
  setData,
  physicianError,
}: {
  data:           WizardData;
  setData:        React.Dispatch<React.SetStateAction<WizardData>>;
  physicianError: string;
}) {
  return (
    <div>
      <StepQuestion
        label="Who is your primary physician?"
        sub="Your doctor's name will appear on all appointment summaries and care plan exports."
      />
      <MediInput
        label="Doctor's Name"
        placeholder="e.g. Dr. Emily Chen"
        value={data.physician}
        onChange={(v) => setData((d) => ({ ...d, physician: v }))}
        error={physicianError}
      />

      <p
        style={{
          color:         MF_C.text,
          fontSize:      MF_T.bodyL,     /* 27px / 20pt */
          fontWeight:    700,
          lineHeight:    `${MF_T.bodyLLine}px`,
          fontFamily:    MF_T.family,
          marginBottom:  MF_L.s1,
          marginTop:     MF_L.s1,
        }}
      >
        Specialty
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: MF_L.s1 }}>
        {SPECIALTIES.map((s) => (
          <TapCard
            key={s.id}
            label={s.label}
            Icon={s.Icon}
            selected={data.specialty === s.id}
            onToggle={() => setData((d) => ({ ...d, specialty: d.specialty === s.id ? "" : s.id }))}
          />
        ))}
      </div>
    </div>
  );
}

function Step5Review({
  data,
}: {
  data: WizardData;
}) {
  const selectedConditions = CONDITIONS.filter((c) => data.conditions.includes(c.id));
  const selectedMeds       = MEDICATIONS.filter((m) => data.medications.includes(m.id));
  const selectedSpecialty  = SPECIALTIES.find((s) => s.id === data.specialty);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div
      style={{
        display:       "flex",
        justifyContent:"space-between",
        alignItems:    "flex-start",
        paddingTop:    MF_L.s1,
        paddingBottom: MF_L.s1,
        borderBottom:  `1px solid ${MF_C.border}`,
        gap:           MF_L.s1,
      }}
    >
      <span
        style={{
          color:      MF_C.text,
          fontSize:   MF_T.label,
          fontWeight: MF_T.labelWeight,
          lineHeight: `${MF_T.labelLine}px`,
          fontFamily: MF_T.family,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color:      MF_C.textStrong,
          fontSize:   MF_T.label,
          fontWeight: 700,
          lineHeight: `${MF_T.labelLine}px`,
          fontFamily: MF_T.family,
          textAlign:  "right",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div>
      <StepQuestion
        label="Review your profile"
        sub="Everything look right? Tap 'Create My Profile' below to complete setup."
      />

      {/* Success badge */}
      <div
        style={{
          display:       "flex",
          alignItems:    "center",
          gap:           MF_L.s1,
          background:    MF_C.successLight,
          border:        `1px solid ${MF_C.successBorder}`,
          borderRadius:  MF_L.rLg,
          padding:       `${MF_L.s1}px ${MF_L.s2}px`,
          marginBottom:  MF_L.s3,
        }}
      >
        <CheckCircle size={20} color={MF_C.success} aria-hidden="true" />
        <span
          style={{
            color:      MF_C.successDark,
            fontSize:   MF_T.label,
            fontWeight: 700,
            fontFamily: MF_T.family,
            lineHeight: `${MF_T.labelLine}px`,
          }}
        >
          All 4 steps complete — ready to save
        </span>
      </div>

      {/* Summary card */}
      <div
        style={{
          background:   MF_C.surface,
          border:       `1px solid ${MF_C.border}`,
          borderRadius: MF_L.rLg,
          padding:      MF_L.s2,
        }}
      >
        <Row label="Full Name"     value={data.name || "—"} />
        <Row
          label="Conditions"
          value={selectedConditions.length > 0 ? selectedConditions.map((c) => c.label).join(", ") : "None selected"}
        />
        <Row
          label="Medications"
          value={selectedMeds.length > 0 ? selectedMeds.map((m) => m.label).join(", ") : "None selected"}
        />
        <Row label="Physician"     value={data.physician || "—"} />
        <Row label="Specialty"     value={selectedSpecialty?.label ?? "—"} />
      </div>
    </div>
  );
}

// ─── MAIN WIZARD ───────────────────────────────────────────────────────────────
export function HealthProfileWizard() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [done,    setDone]    = useState(false);
  const [errors,  setErrors]  = useState({ name: "", physician: "" });
  const [data,    setData]    = useState<WizardData>({
    name:        "",
    conditions:  [],
    medications: [],
    physician:   "",
    specialty:   "",
  });

  const { save: saveProfile, loading: saving } = useSaveHealthProfile();

  function validate(): boolean {
    const e = { name: "", physician: "" };
    let ok = true;
    if (step === 1 && !data.name.trim()) {
      e.name = "Please enter your full name to continue.";
      ok = false;
    }
    if (step === 4 && !data.physician.trim()) {
      e.physician = "Doctor's name is required for your care profile.";
      ok = false;
    }
    setErrors(e);
    return ok;
  }

  async function handleNext() {
    if (!validate()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      setErrors({ name: "", physician: "" });
    } else {
      // Persist profile to backend
      try {
        await saveProfile({
          name: data.name,
          conditions: data.conditions,
          medications: data.medications,
          physician: data.physician,
          specialty: data.specialty,
        });
        toast.success("Health profile saved successfully");
        setDone(true);
      } catch (e) {
        console.error("Failed to save health profile:", e);
        toast.error("Failed to save profile. Please try again.");
      }
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1);
      setErrors({ name: "", physician: "" });
    }
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (done) {
    return (
      <div
        style={{
          background:  MF_C.bg,
          minHeight:   "100vh",
          display:     "flex",
          flexDirection:"column",
          alignItems:  "center",
          justifyContent:"center",
          padding:     `${MF_L.s3}px`,
        }}
      >
        {/* Confetti-style success ring */}
        <div
          style={{
            width:          100,
            height:         100,
            borderRadius:   "50%",
            background:     MF_C.successLight,
            border:         `4px solid ${MF_C.success}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            marginBottom:   MF_L.s3,
          }}
          aria-hidden="true"
        >
          <CheckCircle size={48} color={MF_C.success} />
        </div>

        <h1
          style={{
            color:      MF_C.textStrong,
            fontSize:   MF_T.h1,          /* 37px / 28pt */
            fontWeight: MF_T.h1Weight,
            lineHeight: `${MF_T.h1Line}px`,
            fontFamily: MF_T.family,
            textAlign:  "center",
            margin:     0,
          }}
        >
          Welcome, {data.name.trim().split(" ")[0]}!
        </h1>
        <p
          style={{
            color:      MF_C.text,
            fontSize:   MF_T.bodyL,
            lineHeight: `${MF_T.bodyLLine}px`,
            fontFamily: MF_T.family,
            textAlign:  "center",
            marginTop:  MF_L.s1,
            marginBottom:MF_L.s4,
          }}
        >
          Your MediFlow health profile is ready. Your care plan and dose reminders have been personalized.
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            width:        "100%",
            maxWidth:     360,
            minHeight:    MF_L.touch,     /* 56px touch target */
            background:   MF_C.primary,
            border:       "none",
            borderRadius: MF_L.rLg,
            color:        MF_C.textOnDark,
            fontSize:     MF_T.bodyL,
            fontWeight:   700,
            fontFamily:   MF_T.family,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            gap:          MF_L.s1,
          }}
          aria-label="Go to your health dashboard"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primaryDark; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primary; }}
        >
          <Zap size={18} />
          Go to My Dashboard
        </button>
      </div>
    );
  }

  // ── Main wizard render ────────────────────────────────────────────────────
  return (
    <>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes mf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>

      <div
        style={{
          background: MF_C.bg,
          minHeight:  "100vh",
          display:    "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky header */}
        <WizardHeader step={step} onBack={handleBack} />

        {/* Scrollable step content */}
        <div
          style={{
            flex:      1,
            overflowY: "auto",
            padding:   `${MF_L.s3}px ${MF_L.s2}px`,
          }}
        >
          {step === 1 && <Step1Name       data={data} setData={setData} nameError={errors.name} />}
          {step === 2 && <Step2Conditions data={data} setData={setData} />}
          {step === 3 && <Step3Medications data={data} setData={setData} />}
          {step === 4 && <Step4Physician  data={data} setData={setData} physicianError={errors.physician} />}
          {step === 5 && <Step5Review     data={data} />}

          {/* Extra padding at bottom for sticky CTA */}
          <div style={{ height: 96 }} aria-hidden="true" />
        </div>

        {/* Sticky bottom CTA — 56px touch target */}
        <div
          style={{
            position:   "sticky",
            bottom:     0,
            background: MF_C.bg,
            borderTop:  `1px solid ${MF_C.border}`,
            padding:    `${MF_L.s2}px ${MF_L.s2}px ${MF_L.s3}px`,
          }}
        >
          <button
            onClick={handleNext}
            style={{
              width:          "100%",
              minHeight:      MF_L.touch,   /* 56px */
              background:     MF_C.primary,
              border:         "none",
              borderRadius:   MF_L.rLg,
              color:          MF_C.textOnDark,
              fontSize:       MF_T.bodyL,   /* 27px / 20pt */
              fontWeight:     700,
              fontFamily:     MF_T.family,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              transition:     "background 0.15s ease",
            }}
            aria-label={step === TOTAL_STEPS ? "Create my health profile" : `Continue to step ${step + 1}`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = MF_C.primary; }}
          >
            {step === TOTAL_STEPS ? (
              <>
                <CheckCircle size={20} />
                Create My Profile
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}