/**
 * HealthPulse · Log Vitals Quick-Entry Modal
 * ══════════════════════════════════════════════════════════════════════════════
 * Guardrail 1: Minimum Necessary Interaction — quick select type, enter value, submit
 * Guardrail 2: Never color alone — status icons + text + color
 * Guardrail 3: 56px touch targets
 * Guardrail 4: Meaningful feedback — inline confirmation with contextual copy
 * Guardrail 5: Frosted Glass backdrop
 * Guardrail 7: Montserrat scale
 * Guardrail 14: Token-driven — all values from tokens.ts
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Heart,
  Activity,
  Droplets,
  Scale,
  Wind,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { C, T, L } from "../../design/tokens";

// ── Observation type definitions ──────────────────────────────────────────────
interface ObsTypeConfig {
  label: string;
  unit: string;
  loincCode: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  placeholder: string;
  rangeHint: string;
  evaluateStatus: (value: string) => "normal" | "warning" | "critical";
}

const OBS_TYPES: ObsTypeConfig[] = [
  {
    label: "Blood Pressure",
    unit: "mmHg",
    loincCode: "85354-9",
    icon: Heart,
    color: C.terracotta,
    placeholder: "120/80",
    rangeHint: "Normal: below 120/80",
    evaluateStatus: (v) => {
      const parts = v.split("/");
      if (parts.length !== 2) return "normal";
      const sys = parseInt(parts[0]);
      if (isNaN(sys)) return "normal";
      if (sys >= 140) return "critical";
      if (sys >= 130) return "warning";
      return "normal";
    },
  },
  {
    label: "Heart Rate",
    unit: "bpm",
    loincCode: "8867-4",
    icon: Activity,
    color: C.teal,
    placeholder: "72",
    rangeHint: "Normal: 60-100 bpm",
    evaluateStatus: (v) => {
      const n = parseInt(v);
      if (isNaN(n)) return "normal";
      if (n > 100 || n < 50) return "warning";
      return "normal";
    },
  },
  {
    label: "Blood Glucose",
    unit: "mg/dL",
    loincCode: "2339-0",
    icon: Droplets,
    color: C.purple,
    placeholder: "105",
    rangeHint: "Normal fasting: 70-100 mg/dL",
    evaluateStatus: (v) => {
      const n = parseInt(v);
      if (isNaN(n)) return "normal";
      if (n > 180 || n < 54) return "critical";
      if (n > 140 || n < 70) return "warning";
      return "normal";
    },
  },
  {
    label: "Weight",
    unit: "lbs",
    loincCode: "29463-7",
    icon: Scale,
    color: C.sage,
    placeholder: "165",
    rangeHint: "Track your daily weight",
    evaluateStatus: () => "normal",
  },
  {
    label: "SpO\u2082",
    unit: "%",
    loincCode: "2708-6",
    icon: Wind,
    color: C.teal,
    placeholder: "98",
    rangeHint: "Normal: 95-100%",
    evaluateStatus: (v) => {
      const n = parseInt(v);
      if (isNaN(n)) return "normal";
      if (n < 90) return "critical";
      if (n < 95) return "warning";
      return "normal";
    },
  },
];

// ── Props ──────────────────────────────────────────────────────────────────────
interface LogVitalsModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (
    type: string,
    value: string,
    unit: string,
    status: "normal" | "warning" | "critical",
    loincCode: string
  ) => Promise<any>;
  logging?: boolean;
}

export function LogVitalsModal({ open, onClose, onLog, logging }: LogVitalsModalProps) {
  const [selectedType, setSelectedType] = useState<ObsTypeConfig | null>(null);
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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
  }, [open, onClose]);

  // Auto-focus input when type is selected
  useEffect(() => {
    if (selectedType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedType]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setValue("");
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!selectedType || !value.trim()) return;
    const status = selectedType.evaluateStatus(value.trim());
    try {
      await onLog(
        selectedType.label,
        value.trim(),
        selectedType.unit,
        status,
        selectedType.loincCode
      );
      setSubmitted(true);
      const statusLabel = status === "normal" ? "In range" : status === "warning" ? "Slightly elevated" : "Out of range";
      toast.success(`${selectedType.label} logged: ${value.trim()} ${selectedType.unit} — ${statusLabel}`, {
        style: { fontFamily: T.family },
      });
    } catch {
      toast.error(`Failed to log ${selectedType.label}. Please try again.`, {
        style: { fontFamily: T.family },
      });
    }
  }, [selectedType, value, onLog]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Log a new vital reading"
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: C.bg,
          border: `1px solid ${C.primaryBorder}`,
          boxShadow: "0 -4px 32px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.borderLight}`, background: "rgba(142,175,157,0.06)" }}
        >
          <h2
            style={{
              color: C.text,
              fontSize: T.h3,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
            id="log-vitals-title"
          >
            Log Vitals
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: L.touch,
              height: L.touch,
              background: C.secondaryLight,
              border: `1px solid ${C.secondaryBorder}`,
              color: C.textSub,
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          {submitted ? (
            /* ── Success confirmation ── */
            <div
              className="flex flex-col items-center justify-center py-8 rounded-2xl"
              style={{
                background: C.successLight,
                border: `1px solid ${C.successBorder}`,
              }}
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={40} color={C.success} />
              <p
                className="mt-3"
                style={{
                  color: C.successDark,
                  fontSize: T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                Reading logged!
              </p>
              <p
                className="mt-1"
                style={{
                  color: C.textSub,
                  fontSize: T.caption,
                  fontFamily: "inherit",
                  textAlign: "center",
                }}
              >
                {selectedType?.label}: {value} {selectedType?.unit}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedType(null);
                  setValue("");
                }}
                className="mt-5 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: "#4A4D4C",
                  color: "#FFFFFF",
                  fontSize: T.bodySm,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  minHeight: L.touch,
                  padding: "0 24px",
                  border: "1px solid rgba(142,175,157,0.4)",
                }}
                aria-label="Log another vital reading"
              >
                Log Another
              </button>
              <button
                onClick={onClose}
                className="mt-2"
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.secondary,
                  fontSize: T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  padding: "12px 16px",
                  minHeight: L.touch,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  textDecorationColor: "rgba(100,116,139,0.4)",
                }}
              >
                Done
              </button>
            </div>
          ) : !selectedType ? (
            /* ── Type selection ── */
            <div>
              <p
                className="mb-4"
                style={{
                  color: C.textSub,
                  fontSize: T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                What would you like to log?
              </p>
              <div className="flex flex-col gap-2">
                {OBS_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.label}
                      onClick={() => setSelectedType(type)}
                      className="flex items-center gap-3 rounded-xl w-full text-left transition-all duration-150"
                      style={{
                        background: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        padding: "0 16px",
                        minHeight: L.touch,
                        fontFamily: "inherit",
                      }}
                      aria-label={`Log ${type.label} reading`}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = type.color;
                        (e.currentTarget as HTMLButtonElement).style.background = `${type.color}0A`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = C.cardBorder;
                        (e.currentTarget as HTMLButtonElement).style.background = C.cardBg;
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          background: `${type.color}18`,
                          border: `1px solid ${type.color}35`,
                        }}
                      >
                        <Icon size={16} color={type.color} />
                      </div>
                      <div className="flex-1">
                        <p style={{ color: C.cardText, fontSize: T.bodyMd, fontWeight: 600, fontFamily: "inherit" }}>
                          {type.label}
                        </p>
                        <p style={{ color: C.cardTextMuted, fontSize: T.micro, fontFamily: "inherit" }}>
                          {type.unit} &middot; {type.rangeHint}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Value entry ── */
            <div>
              {/* Back to type selection */}
              <button
                onClick={() => {
                  setSelectedType(null);
                  setValue("");
                }}
                className="flex items-center gap-1 mb-4"
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.secondary,
                  fontSize: T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  padding: "4px 0",
                  cursor: "pointer",
                  minHeight: 44,
                }}
                aria-label="Go back to type selection"
              >
                &larr; Change type
              </button>

              {/* Selected type indicator */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 44,
                    height: 44,
                    background: `${selectedType.color}18`,
                    border: `1px solid ${selectedType.color}35`,
                  }}
                >
                  <selectedType.icon size={20} color={selectedType.color} />
                </div>
                <div>
                  <p style={{ color: C.text, fontSize: T.body, fontWeight: 700, fontFamily: "inherit" }}>
                    {selectedType.label}
                  </p>
                  <p style={{ color: C.textMuted, fontSize: T.micro, fontFamily: "inherit" }}>
                    {selectedType.rangeHint}
                  </p>
                </div>
              </div>

              {/* Input field */}
              <label
                htmlFor="vital-value-input"
                style={{
                  color: C.textSub,
                  fontSize: T.caption,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Enter your reading
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="vital-value-input"
                  ref={inputRef}
                  type="text"
                  inputMode={selectedType.label === "Blood Pressure" ? "text" : "numeric"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={selectedType.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && value.trim()) handleSubmit();
                  }}
                  className="flex-1 rounded-xl px-4 outline-none transition-all"
                  style={{
                    background: C.cardBg,
                    border: `2px solid ${C.primaryBorder}`,
                    color: C.text,
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    minHeight: L.touch,
                    letterSpacing: "-0.02em",
                  }}
                  aria-label={`${selectedType.label} value in ${selectedType.unit}`}
                  autoComplete="off"
                />
                <span
                  style={{
                    color: C.textSub,
                    fontSize: T.body,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {selectedType.unit}
                </span>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || logging}
                className="w-full mt-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: value.trim() ? "#4A4D4C" : C.locked,
                  color: value.trim() ? "#FFFFFF" : C.textMuted,
                  fontSize: T.body,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  minHeight: L.touch,
                  border: `1px solid ${value.trim() ? "rgba(142,175,157,0.4)" : C.border}`,
                  opacity: logging ? 0.7 : 1,
                  cursor: value.trim() && !logging ? "pointer" : "not-allowed",
                }}
                aria-label={`Submit ${selectedType.label} reading of ${value} ${selectedType.unit}`}
              >
                {logging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Log {selectedType.label}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}