/**
 * HealthPulse · Blood Pressure Monitor
 * ═════════════════════════════════════
 * Allows patients to:
 *   1. Log systolic + diastolic readings with optional pulse
 *   2. View recent readings in a list
 *   3. Visualize BP trends over time
 *   4. See classification (Normal / Elevated / Hypertension Stage 1/2 / Crisis)
 *
 * WCAG 2.1 AA · 56px touch targets · Muted Healing Palette
 */

import { useState, useMemo } from "react";
import {
  X,
  Heart,
  Plus,
  TrendingUp,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { C, T, L } from "../../design/tokens";
import { toast } from "sonner";
import { useBPReadings, useLogBPReading } from "../../hooks/useHealthData";
import type { BPReadingDTO } from "../../data/api";
import { SectionBanner } from "../shared/SectionBanner";

export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  timestamp: Date;
  arm: "left" | "right";
  position: "sitting" | "standing" | "lying";
  notes: string;
}

type BPCategory = "normal" | "elevated" | "stage1" | "stage2" | "crisis";

function classifyBP(sys: number, dia: number): { category: BPCategory; label: string; color: string; textColor: string; borderColor: string } {
  if (sys >= 180 || dia >= 120) return { category: "crisis", label: "Hypertensive Crisis", color: "rgba(188,108,37,0.15)", textColor: C.alertText, borderColor: "rgba(188,108,37,0.3)" };
  if (sys >= 140 || dia >= 90) return { category: "stage2", label: "High BP (Stage 2)", color: C.alertLight, textColor: C.alertText, borderColor: C.alertBorder };
  if ((sys >= 130 && sys < 140) || (dia >= 80 && dia < 90)) return { category: "stage1", label: "High BP (Stage 1)", color: "rgba(196,168,122,0.12)", textColor: C.amberDark, borderColor: "rgba(196,168,122,0.3)" };
  if (sys >= 120 && sys < 130 && dia < 80) return { category: "elevated", label: "Elevated", color: "rgba(196,168,122,0.08)", textColor: C.amberDark, borderColor: "rgba(196,168,122,0.2)" };
  return { category: "normal", label: "Normal", color: C.successLight, textColor: C.successDark, borderColor: C.successBorder };
}

interface BloodPressureMonitorProps {
  onClose: () => void;
}

// Generate demo data
function generateDemoReadings(): BPReading[] {
  const readings: BPReading[] = [];
  const now = new Date(2026, 2, 2, 9, 0);
  const bpValues = [
    { sys: 118, dia: 76, pulse: 72 },
    { sys: 124, dia: 80, pulse: 68 },
    { sys: 132, dia: 84, pulse: 75 },
    { sys: 120, dia: 78, pulse: 70 },
    { sys: 128, dia: 82, pulse: 73 },
    { sys: 115, dia: 74, pulse: 69 },
    { sys: 136, dia: 88, pulse: 78 },
    { sys: 122, dia: 79, pulse: 71 },
    { sys: 119, dia: 75, pulse: 67 },
    { sys: 126, dia: 81, pulse: 74 },
  ];
  for (let i = 0; i < bpValues.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(8 + (i % 3), (i * 17) % 60);
    readings.push({
      id: `bp-${i}`,
      systolic: bpValues[i].sys,
      diastolic: bpValues[i].dia,
      pulse: bpValues[i].pulse,
      timestamp: d,
      arm: i % 2 === 0 ? "left" : "right",
      position: "sitting",
      notes: "",
    });
  }
  return readings;
}

function MiniTrendChart({ readings }: { readings: BPReading[] }) {
  const sorted = [...readings].reverse().slice(-14);
  if (sorted.length < 2) return null;

  const maxSys = Math.max(...sorted.map((r) => r.systolic), 160);
  const minDia = Math.min(...sorted.map((r) => r.diastolic), 50);
  const range = maxSys - minDia + 20;
  const w = 300;
  const h = 120;
  const pad = 16;

  const xScale = (idx: number) => pad + (idx / (sorted.length - 1)) * (w - pad * 2);
  const yScale = (val: number) => h - pad - ((val - minDia + 10) / range) * (h - pad * 2);

  const sysPath = sorted.map((r, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(r.systolic)}`).join(" ");
  const diaPath = sorted.map((r, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(r.diastolic)}`).join(" ");

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} aria-label="Blood pressure trend chart">
      {/* Reference lines */}
      <line x1={pad} y1={yScale(120)} x2={w - pad} y2={yScale(120)} stroke={C.alertBorder} strokeWidth="1" strokeDasharray="4,4" />
      <line x1={pad} y1={yScale(80)} x2={w - pad} y2={yScale(80)} stroke={C.alertBorder} strokeWidth="1" strokeDasharray="4,4" />
      <text x={w - pad + 4} y={yScale(120) + 3} fill={C.textMuted} fontSize="8" fontFamily="inherit">120</text>
      <text x={w - pad + 4} y={yScale(80) + 3} fill={C.textMuted} fontSize="8" fontFamily="inherit">80</text>

      {/* Systolic line */}
      <path d={sysPath} fill="none" stroke={C.rose} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Diastolic line */}
      <path d={diaPath} fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {sorted.map((r, i) => (
        <g key={r.id}>
          <circle cx={xScale(i)} cy={yScale(r.systolic)} r={3} fill={C.rose} />
          <circle cx={xScale(i)} cy={yScale(r.diastolic)} r={3} fill={C.blue} />
        </g>
      ))}
    </svg>
  );
}

export function BloodPressureMonitor({ onClose }: BloodPressureMonitorProps) {
  const [readings, setReadings] = useState<BPReading[]>(generateDemoReadings);
  const [showInput, setShowInput] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [arm, setArm] = useState<"left" | "right">("left");
  const [position, setPosition] = useState<"sitting" | "standing" | "lying">("sitting");
  const [notes, setNotes] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { logReading: persistReading, loading: saving } = useLogBPReading();

  const latest = readings[0];
  const latestClass = latest ? classifyBP(latest.systolic, latest.diastolic) : null;

  const avgSys = useMemo(() => {
    if (readings.length === 0) return 0;
    return Math.round(readings.reduce((s, r) => s + r.systolic, 0) / readings.length);
  }, [readings]);

  const avgDia = useMemo(() => {
    if (readings.length === 0) return 0;
    return Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / readings.length);
  }, [readings]);

  const handleLog = async () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (isNaN(sys) || isNaN(dia) || sys < 50 || sys > 300 || dia < 30 || dia > 200) return;

    const ts = new Date();
    const newReading: BPReading = {
      id: `bp-${Date.now()}`,
      systolic: sys,
      diastolic: dia,
      pulse: pulse ? parseInt(pulse) : null,
      timestamp: ts,
      arm,
      position,
      notes,
    };
    setReadings((prev) => [newReading, ...prev]);
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setNotes("");
    setShowInput(false);

    // Persist to KV backend
    try {
      await persistReading({
        systolic: sys,
        diastolic: dia,
        pulse: pulse ? parseInt(pulse) : null,
        timestamp: ts.toISOString(),
        arm,
        position,
        notes,
      });
      const cls = classifyBP(sys, dia);
      toast.success(`BP logged: ${sys}/${dia} — ${cls.label}`);
    } catch (e: any) {
      toast.error(`Failed to save BP reading: ${e.message}`);
    }
  };

  const inputStyle = {
    minHeight: L.touch,
    background: C.card,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: T.body,
    fontWeight: 600 as const,
    fontFamily: "inherit",
    outline: "none",
    borderRadius: L.rMd,
    padding: "0 16px",
    width: "100%",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{ background: C.bg, maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Blood Pressure Monitor"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: C.roseLight, border: `1px solid ${C.roseBorder}` }}
            >
              <Heart size={20} color={C.rose} />
            </div>
            <div>
              <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
                Blood Pressure
              </h2>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", margin: 0 }}>
                Monitor & Track
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{ width: L.touch, height: L.touch, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Learning-phase insight banner */}
        {readings.length < 14 && (
          <div className="mx-5 mt-3">
            <SectionBanner
              color={C.blueDark}
              bg={C.blueLight}
              border={C.blueBorder}
              icon={<Heart size={14} color={C.blueDark} />}
              title="Building Your BP Profile"
              desc={`${14 - readings.length} more readings to unlock personalized insights.`}
              trailingIcon={<Activity size={16} color={C.blueDark} style={{ opacity: 0.4 }} aria-hidden="true" />}
              ariaLabel="Blood pressure learning phase"
            />
          </div>
        )}

        {/* Latest Reading Card */}
        {latest && latestClass && (
          <div className="mx-5 mt-4 rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.borderLight}`, background: latestClass.color }}>
              <Activity size={13} color={latestClass.textColor} />
              <span style={{ color: latestClass.textColor, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
                LATEST READING
              </span>
              <span
                className="ml-auto rounded-full px-2 py-0.5"
                style={{ background: latestClass.color, border: `1px solid ${latestClass.borderColor}`, color: latestClass.textColor, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}
              >
                {latestClass.label}
              </span>
            </div>
            <div className="flex items-center justify-around py-5">
              <div className="flex flex-col items-center">
                <span style={{ color: C.rose, fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>
                  {latest.systolic}
                </span>
                <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", marginTop: 4 }}>
                  SYS mmHg
                </span>
              </div>
              <div style={{ width: 1, height: 40, background: C.borderLight }} />
              <div className="flex flex-col items-center">
                <span style={{ color: C.blue, fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>
                  {latest.diastolic}
                </span>
                <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", marginTop: 4 }}>
                  DIA mmHg
                </span>
              </div>
              {latest.pulse && (
                <>
                  <div style={{ width: 1, height: 40, background: C.borderLight }} />
                  <div className="flex flex-col items-center">
                    <span style={{ color: C.primary, fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>
                      {latest.pulse}
                    </span>
                    <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", marginTop: 4 }}>
                      PULSE bpm
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Average & Stats */}
        <div className="mx-5 mt-3 flex gap-3">
          <div className="flex-1 rounded-xl px-3 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>7-DAY AVG</p>
            <p style={{ color: C.text, fontSize: T.h3, fontWeight: 800, fontFamily: "inherit", marginTop: 2 }}>
              {avgSys}/{avgDia}
            </p>
          </div>
          <div className="flex-1 rounded-xl px-3 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>READINGS</p>
            <p style={{ color: C.text, fontSize: T.h3, fontWeight: 800, fontFamily: "inherit", marginTop: 2 }}>
              {readings.length}
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mx-5 mt-3 rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            <TrendingUp size={13} color={C.primary} />
            <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>TREND</span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div style={{ width: 8, height: 3, borderRadius: 2, background: C.rose }} />
                <span style={{ color: C.textMuted, fontSize: 8, fontFamily: "inherit" }}>SYS</span>
              </div>
              <div className="flex items-center gap-1">
                <div style={{ width: 8, height: 3, borderRadius: 2, background: C.blue }} />
                <span style={{ color: C.textMuted, fontSize: 8, fontFamily: "inherit" }}>DIA</span>
              </div>
            </div>
          </div>
          <div className="p-3">
            <MiniTrendChart readings={readings} />
          </div>
        </div>

        {/* Log Button */}
        {!showInput && (
          <div className="mx-5 mt-4">
            <button
              onClick={() => setShowInput(true)}
              className="w-full rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                minHeight: L.touch,
                background: C.primary,
                border: `1px solid ${C.primaryBorder}`,
                color: C.text,
                fontSize: T.bodySm,
                fontWeight: 700,
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
              aria-label="Log new blood pressure reading"
            >
              <Plus size={16} />
              Log New Reading
            </button>
          </div>
        )}

        {/* Input Form */}
        {showInput && (
          <div className="mx-5 mt-4 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.primaryBorder}` }}>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">
              NEW READING
            </p>

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Systolic</label>
                <input
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min={50}
                  max={300}
                  style={inputStyle}
                  aria-label="Systolic pressure"
                />
              </div>
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Diastolic</label>
                <input
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min={30}
                  max={200}
                  style={inputStyle}
                  aria-label="Diastolic pressure"
                />
              </div>
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Pulse</label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  min={30}
                  max={220}
                  style={inputStyle}
                  aria-label="Pulse rate"
                />
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Arm</label>
                <div className="flex gap-2 mt-1">
                  {(["left", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setArm(a)}
                      className="flex-1 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        minHeight: 44,
                        background: arm === a ? C.primaryLight : "transparent",
                        border: `1px solid ${arm === a ? C.primary : C.borderLight}`,
                        color: arm === a ? C.successDark : C.textSub,
                        fontSize: T.bodySm,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        textTransform: "capitalize",
                      }}
                      aria-pressed={arm === a}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Position</label>
                <div className="flex gap-2 mt-1">
                  {(["sitting", "standing", "lying"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPosition(p)}
                      className="flex-1 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        minHeight: 44,
                        background: position === p ? C.primaryLight : "transparent",
                        border: `1px solid ${position === p ? C.primary : C.borderLight}`,
                        color: position === p ? C.successDark : C.textSub,
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        textTransform: "capitalize",
                      }}
                      aria-pressed={position === p}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. After coffee..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
                aria-label="Notes"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInput(false)}
                className="flex-1 rounded-xl flex items-center justify-center transition-all"
                style={{ minHeight: L.touch, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={handleLog}
                disabled={!systolic || !diastolic}
                className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  minHeight: L.touch,
                  background: systolic && diastolic ? C.primary : C.borderLight,
                  border: `1px solid ${C.primaryBorder}`,
                  color: systolic && diastolic ? C.text : C.textMuted,
                  fontSize: T.bodySm,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
                aria-label="Save blood pressure reading"
              >
                <Heart size={14} />
                Log Reading
              </button>
            </div>
          </div>
        )}

        {/* Reading History */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} color={C.textMuted} />
            <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              HISTORY
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-8">
          {readings.slice(0, 10).map((r) => {
            const cls = classifyBP(r.systolic, r.diastolic);
            const expanded = expandedId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setExpandedId(expanded ? null : r.id)}
                className="w-full rounded-xl overflow-hidden text-left transition-all"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                aria-expanded={expanded}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                    <span style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 800, fontFamily: "inherit", lineHeight: 1 }}>
                      {r.systolic}/{r.diastolic}
                    </span>
                    {r.pulse && (
                      <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit", marginTop: 2 }}>
                        {r.pulse} bpm
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block rounded-full px-2 py-0.5"
                      style={{ background: cls.color, border: `1px solid ${cls.borderColor}`, color: cls.textColor, fontSize: 9, fontWeight: 700, fontFamily: "inherit" }}
                    >
                      {cls.label}
                    </span>
                    <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit", marginTop: 2 }}>
                      {r.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
                      {r.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  {expanded ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                </div>
                {expanded && (
                  <div className="px-4 pb-3 flex gap-4" style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 8 }}>
                    <span style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit" }}>Arm: {r.arm}</span>
                    <span style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit" }}>Position: {r.position}</span>
                    {r.notes && <span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>{r.notes}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}