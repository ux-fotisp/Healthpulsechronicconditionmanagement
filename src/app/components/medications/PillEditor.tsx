/**
 * HealthPulse · PillEditor — Medication Customization Modal
 * ═══════════════════════════════════════════════════════════
 * Allows patient to:
 *   1. Choose pill shape (round | oval | capsule | oblong)
 *   2. Pick pill color from a curated palette
 *   3. Adjust medication schedule times
 *
 * WCAG 2.1 AA: 56px touch targets, 4.5:1 contrast, focus-visible rings
 * Tokens: C, T, L from design/tokens
 */

import { useState } from "react";
import { X, Check, Clock, Plus, Trash2 } from "lucide-react";
import { C, T, L } from "../../design/tokens";
import type { PillShape } from "../shared/PillVisualizer";

interface PillEditorProps {
  currentShape: PillShape;
  currentColor: string;
  currentTimes: string[];       // e.g. ["08:00", "20:00"]
  medicationName: string;
  onSave: (shape: PillShape, color: string, times: string[]) => void;
  onClose: () => void;
  saving?: boolean;
}

const SHAPES: { value: PillShape; label: string }[] = [
  { value: "round",   label: "Round" },
  { value: "oval",    label: "Oval" },
  { value: "capsule", label: "Capsule" },
  { value: "oblong",  label: "Oblong" },
];

const COLORS = [
  { hex: "#8EAF9D", label: "Sage" },
  { hex: "#7B9ACC", label: "Blue" },
  { hex: "#D4A373", label: "Amber" },
  { hex: "#BC6C8A", label: "Rose" },
  { hex: "#9B8EC4", label: "Lavender" },
  { hex: "#6DAB8D", label: "Green" },
  { hex: "#CC8F6D", label: "Peach" },
  { hex: "#7AACB4", label: "Teal" },
  { hex: "#C4A87A", label: "Gold" },
  { hex: "#8B8B8B", label: "Grey" },
];

function ShapeSVGPreview({ shape, color, selected }: { shape: PillShape; color: string; selected: boolean }) {
  const fill = color + "30";
  const stroke = color;
  const w = 64;
  const h = 40;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {shape === "round" && (
        <circle cx={w / 2} cy={h / 2} r={16} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} />
      )}
      {shape === "oval" && (
        <ellipse cx={w / 2} cy={h / 2} rx={24} ry={14} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} />
      )}
      {shape === "capsule" && (
        <rect x={6} y={8} width={52} height={24} rx={12} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} />
      )}
      {shape === "oblong" && (
        <rect x={6} y={8} width={52} height={24} rx={6} fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2} />
      )}
    </svg>
  );
}

export function PillEditor({
  currentShape,
  currentColor,
  currentTimes,
  medicationName,
  onSave,
  onClose,
  saving = false,
}: PillEditorProps) {
  const [shape, setShape] = useState<PillShape>(currentShape);
  const [color, setColor] = useState(currentColor);
  const [times, setTimes] = useState<string[]>(currentTimes.length > 0 ? currentTimes : ["08:00"]);

  const addTime = () => {
    setTimes((prev) => [...prev, "12:00"]);
  };

  const removeTime = (idx: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTime = (idx: number, val: string) => {
    setTimes((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{ background: C.bg, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${medicationName} appearance`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-3">
          <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
            Customize Pill
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{
              width: L.touch, height: L.touch,
              background: C.secondaryLight,
              border: `1px solid ${C.secondaryBorder}`,
              color: C.textSub,
            }}
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", margin: 0 }} className="px-5 pb-4">
          {medicationName}
        </p>

        {/* ── Shape Picker ──────────────────────────────────────────── */}
        <div className="px-5 pb-4">
          <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">
            PILL SHAPE
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SHAPES.map((s) => {
              const active = shape === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setShape(s.value)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all"
                  style={{
                    minHeight: 80,
                    background: active ? C.primaryLight : "transparent",
                    border: `2px solid ${active ? C.primary : C.borderLight}`,
                    outline: active ? `2px solid ${C.primaryGlow}` : "none",
                    outlineOffset: 2,
                  }}
                  aria-pressed={active}
                  aria-label={`${s.label} shape`}
                >
                  <ShapeSVGPreview shape={s.value} color={color} selected={active} />
                  <span style={{ color: active ? C.successDark : C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "inherit" }}>
                    {s.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Color Picker ──────────────────────────────────────────── */}
        <div className="px-5 pb-4">
          <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">
            PILL COLOR
          </p>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => {
              const active = color === c.hex;
              return (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className="flex items-center justify-center rounded-full transition-all"
                  style={{
                    width: 48,
                    height: 48,
                    background: c.hex + "30",
                    border: `3px solid ${active ? c.hex : "transparent"}`,
                    boxShadow: active ? `0 0 0 3px ${c.hex}40` : "none",
                  }}
                  aria-pressed={active}
                  aria-label={`${c.label} color`}
                >
                  <div
                    className="rounded-full"
                    style={{ width: 28, height: 28, background: c.hex }}
                  />
                  {active && (
                    <Check size={14} color="#fff" style={{ position: "absolute" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Schedule Times ────────────────────────────────────────── */}
        <div className="px-5 pb-4">
          <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">
            SCHEDULE TIMES
          </p>
          <div className="flex flex-col gap-3">
            {times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 40, height: 40, background: C.primaryLight, border: `1px solid ${C.primaryBorder}` }}
                  aria-hidden="true"
                >
                  <Clock size={16} color={C.primary} />
                </div>
                <input
                  type="time"
                  value={t}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  className="flex-1 rounded-xl px-4"
                  style={{
                    minHeight: L.touch,
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: T.bodySm,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  aria-label={`Dose time ${idx + 1}`}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primaryGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {times.length > 1 && (
                  <button
                    onClick={() => removeTime(idx)}
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 48,
                      height: 48,
                      background: C.alertLight,
                      border: `1px solid ${C.alertBorder}`,
                      color: C.alert,
                      flexShrink: 0,
                    }}
                    aria-label={`Remove time ${idx + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {times.length < 6 && (
              <button
                onClick={addTime}
                className="flex items-center justify-center gap-2 rounded-xl transition-all"
                style={{
                  minHeight: L.touch,
                  background: C.secondaryLight,
                  border: `1px dashed ${C.secondaryBorder}`,
                  color: C.textSub,
                  fontSize: T.bodySm,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
                aria-label="Add another dose time"
              >
                <Plus size={14} />
                Add Time
              </button>
            )}
          </div>
        </div>

        {/* ── Preview ───────────────────────────────────────────────── */}
        <div className="px-5 pb-4">
          <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">
            PREVIEW
          </p>
          <div
            className="flex items-center justify-center rounded-2xl py-5"
            style={{ background: color + "10", border: `1px solid ${color}30` }}
          >
            <ShapeSVGPreview shape={shape} color={color} selected={false} />
          </div>
        </div>

        {/* ── Save / Cancel ─────────────────────────────────────────── */}
        <div className="flex gap-3 px-5 pb-8 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl flex items-center justify-center transition-all"
            style={{
              minHeight: L.touch,
              background: C.secondaryLight,
              border: `1px solid ${C.secondaryBorder}`,
              color: C.textSub,
              fontSize: T.bodySm,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(shape, color, times)}
            disabled={saving}
            className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              minHeight: L.touch,
              background: saving ? C.primaryDark : C.primary,
              border: `1px solid ${C.primaryBorder}`,
              color: C.text,
              fontSize: T.bodySm,
              fontWeight: 700,
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              opacity: saving ? 0.7 : 1,
            }}
            aria-label="Save pill customization"
          >
            <Check size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}