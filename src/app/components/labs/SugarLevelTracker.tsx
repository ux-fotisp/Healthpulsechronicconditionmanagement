/**
 * HealthPulse · Sugar Level Tracker (mySugr-inspired)
 * ════════════════════════════════════════════════════
 * Comprehensive diabetes management with manual input for:
 *   1. Blood Glucose (fasting, before/after meals, bedtime, custom)
 *   2. Insulin doses (basal, bolus, correction)
 *   3. Carbohydrate intake (grams + meal type)
 *   4. Activity / Exercise (type, duration, intensity)
 *   5. Tags (hypo, stress, illness, menstruation, alcohol, travel)
 *   6. HbA1c estimated tracking
 *   7. Mood / wellbeing
 *   8. Notes
 *
 * Correlated vitals for diabetes:
 *   - Blood pressure correlation
 *   - Weight tracking
 *   - Ketone levels
 *
 * WCAG 2.1 AA · 56px touch targets · Muted Healing Palette
 */

import React, { useState, useMemo } from "react";
import {
  X, Droplets, Plus, Utensils, Syringe, Footprints, Tag, TrendingUp,
  Clock, ChevronDown, ChevronUp, Smile, Meh, Frown, Moon, Sun, Sunset,
  Coffee, Heart, Weight, FileText, Zap, Sparkles, GraduationCap, Activity
} from "lucide-react";
import { C, T, L } from "../../design/tokens";
import { SectionBanner } from "../shared/SectionBanner";
import { toast } from "sonner";
import { useLogGlucoseEntry } from "../../hooks/useHealthData";

type MealTag = "fasting" | "before_breakfast" | "after_breakfast" | "before_lunch" | "after_lunch" | "before_dinner" | "after_dinner" | "bedtime" | "custom";
type InsulinType = "basal" | "bolus" | "correction" | "mixed";
type ActivityIntensity = "light" | "moderate" | "vigorous";
type Mood = "great" | "okay" | "low";
type SugarTag = "hypo" | "stress" | "illness" | "menstruation" | "alcohol" | "travel" | "exercise" | "medication_change";

interface GlucoseEntry {
  id: string; timestamp: Date; glucose: number; mealTag: MealTag;
  carbs: number | null; mealDescription: string;
  insulinDose: number | null; insulinType: InsulinType | null;
  activityType: string; activityDuration: number | null; activityIntensity: ActivityIntensity | null;
  tags: SugarTag[]; mood: Mood | null; notes: string;
  ketones: number | null; weight: number | null; systolic: number | null; diastolic: number | null;
}

type GlucoseRange = "low" | "inRange" | "high" | "veryHigh" | "critical";

function classifyGlucose(val: number, tag: MealTag): { range: GlucoseRange; label: string; color: string; textColor: string; bg: string } {
  if (val < 70) return { range: "low", label: "Low", color: C.blue, textColor: C.blueDark, bg: C.blueLight };
  if (tag.includes("after")) {
    if (val <= 180) return { range: "inRange", label: "In Range", color: C.success, textColor: C.successDark, bg: C.successLight };
    if (val <= 250) return { range: "high", label: "High", color: C.alert, textColor: C.alertText, bg: C.alertLight };
  } else {
    if (val <= 130) return { range: "inRange", label: "In Range", color: C.success, textColor: C.successDark, bg: C.successLight };
    if (val <= 180) return { range: "high", label: "High", color: C.alert, textColor: C.alertText, bg: C.alertLight };
  }
  if (val <= 300) return { range: "veryHigh", label: "Very High", color: C.alert, textColor: C.alertText, bg: C.alertLight };
  return { range: "critical", label: "Critical", color: C.error, textColor: C.alertText, bg: C.errorLight };
}

function generateDemoEntries(): GlucoseEntry[] {
  const entries: GlucoseEntry[] = [];
  const now = new Date(2026, 2, 2, 9, 0);
  const samples = [
    { gl: 95, meal: "fasting" as MealTag, carbs: null, ins: 12, insType: "basal" as InsulinType, mood: "great" as Mood, tags: [] as SugarTag[] },
    { gl: 142, meal: "after_breakfast" as MealTag, carbs: 45, ins: 4, insType: "bolus" as InsulinType, mood: "okay" as Mood, tags: [] as SugarTag[] },
    { gl: 118, meal: "before_lunch" as MealTag, carbs: null, ins: null, insType: null, mood: "great" as Mood, tags: [] as SugarTag[] },
    { gl: 185, meal: "after_lunch" as MealTag, carbs: 60, ins: 6, insType: "bolus" as InsulinType, mood: "low" as Mood, tags: ["stress" as SugarTag] },
    { gl: 105, meal: "before_dinner" as MealTag, carbs: null, ins: null, insType: null, mood: "okay" as Mood, tags: ["exercise" as SugarTag] },
    { gl: 156, meal: "after_dinner" as MealTag, carbs: 50, ins: 5, insType: "bolus" as InsulinType, mood: "okay" as Mood, tags: [] as SugarTag[] },
    { gl: 130, meal: "bedtime" as MealTag, carbs: 15, ins: 12, insType: "basal" as InsulinType, mood: "great" as Mood, tags: [] as SugarTag[] },
    { gl: 68, meal: "custom" as MealTag, carbs: 20, ins: null, insType: null, mood: "low" as Mood, tags: ["hypo" as SugarTag] },
    { gl: 110, meal: "fasting" as MealTag, carbs: null, ins: 12, insType: "basal" as InsulinType, mood: "great" as Mood, tags: [] as SugarTag[] },
    { gl: 165, meal: "after_breakfast" as MealTag, carbs: 55, ins: 5, insType: "bolus" as InsulinType, mood: "okay" as Mood, tags: ["illness" as SugarTag] },
    { gl: 98, meal: "before_lunch" as MealTag, carbs: null, ins: null, insType: null, mood: "great" as Mood, tags: [] as SugarTag[] },
    { gl: 200, meal: "after_lunch" as MealTag, carbs: 70, ins: 7, insType: "bolus" as InsulinType, mood: "low" as Mood, tags: ["stress" as SugarTag, "travel" as SugarTag] },
  ];
  for (let i = 0; i < samples.length; i++) {
    const d = new Date(now); d.setHours(d.getHours() - i * 4);
    entries.push({ id: `gl-${i}`, timestamp: d, glucose: samples[i].gl, mealTag: samples[i].meal, carbs: samples[i].carbs, mealDescription: "", insulinDose: samples[i].ins, insulinType: samples[i].insType, activityType: i === 4 ? "Walking" : "", activityDuration: i === 4 ? 30 : null, activityIntensity: i === 4 ? "moderate" : null, tags: samples[i].tags, mood: samples[i].mood, notes: "", ketones: null, weight: null, systolic: null, diastolic: null });
  }
  return entries;
}

const MEAL_TAGS: { value: MealTag; label: string; icon: React.ReactNode }[] = [
  { value: "fasting", label: "Fasting", icon: <Moon size={14} /> },
  { value: "before_breakfast", label: "Before Bkfst", icon: <Sun size={14} /> },
  { value: "after_breakfast", label: "After Bkfst", icon: <Coffee size={14} /> },
  { value: "before_lunch", label: "Before Lunch", icon: <Utensils size={14} /> },
  { value: "after_lunch", label: "After Lunch", icon: <Utensils size={14} /> },
  { value: "before_dinner", label: "Before Dinner", icon: <Sunset size={14} /> },
  { value: "after_dinner", label: "After Dinner", icon: <Sunset size={14} /> },
  { value: "bedtime", label: "Bedtime", icon: <Moon size={14} /> },
  { value: "custom", label: "Other", icon: <Clock size={14} /> },
];

const SUGAR_TAGS: { value: SugarTag; label: string }[] = [
  { value: "hypo", label: "Hypo" }, { value: "stress", label: "Stress" },
  { value: "illness", label: "Illness" }, { value: "menstruation", label: "Period" },
  { value: "alcohol", label: "Alcohol" }, { value: "travel", label: "Travel" },
  { value: "exercise", label: "Exercise" }, { value: "medication_change", label: "Med Change" },
];

function GlucoseGauge({ value, mealTag }: { value: number; mealTag: MealTag }) {
  const cls = classifyGlucose(value, mealTag);
  const pct = Math.max(0, Math.min(1, (value - 40) / 310));
  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={100} viewBox="0 0 160 100" aria-hidden="true">
        <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke={C.borderLight} strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke={cls.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${pct * 188} 188`} />
      </svg>
      <div className="flex flex-col items-center -mt-4">
        <span style={{ color: cls.textColor, fontSize: 40, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>{value}</span>
        <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", marginTop: 2 }}>mg/dL</span>
        <span className="mt-2 rounded-full px-3 py-1" style={{ background: cls.bg, color: cls.textColor, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit", border: `1px solid ${cls.color}30` }}>{cls.label}</span>
      </div>
    </div>
  );
}

function DailyTrendChart({ entries }: { entries: GlucoseEntry[] }) {
  const sorted = [...entries].reverse().slice(-20);
  if (sorted.length < 2) return null;
  const w = 300, h = 100, pad = 16;
  const maxG = Math.max(...sorted.map((e) => e.glucose), 200);
  const minG = Math.min(...sorted.map((e) => e.glucose), 60);
  const range = maxG - minG + 30;
  const xScale = (i: number) => pad + (i / (sorted.length - 1)) * (w - pad * 2);
  const yScale = (v: number) => h - pad - ((v - minG + 15) / range) * (h - pad * 2);
  const linePath = sorted.map((e, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(e.glucose)}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} aria-label="Glucose trend chart">
      <rect x={pad} y={yScale(180)} width={w - pad * 2} height={yScale(70) - yScale(180)} fill={C.successLight} rx={4} />
      <line x1={pad} y1={yScale(180)} x2={w - pad} y2={yScale(180)} stroke={C.successBorder} strokeWidth="1" strokeDasharray="3,3" />
      <line x1={pad} y1={yScale(70)} x2={w - pad} y2={yScale(70)} stroke={C.blueBorder} strokeWidth="1" strokeDasharray="3,3" />
      <path d={linePath} fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {sorted.map((e, i) => { const cls = classifyGlucose(e.glucose, e.mealTag); return <circle key={e.id} cx={xScale(i)} cy={yScale(e.glucose)} r={3.5} fill={cls.color} stroke={C.card} strokeWidth="1" />; })}
    </svg>
  );
}

function MoodIcon({ mood, size = 16 }: { mood: Mood; size?: number }) {
  if (mood === "great") return <Smile size={size} color={C.success} />;
  if (mood === "okay") return <Meh size={size} color={C.alert} />;
  return <Frown size={size} color={C.blue} />;
}

interface SugarLevelTrackerProps { onClose: () => void; }

export function SugarLevelTracker({ onClose }: SugarLevelTrackerProps) {
  const [entries, setEntries] = useState<GlucoseEntry[]>(generateDemoEntries);
  const [showInput, setShowInput] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"log" | "trends" | "stats">("log");
  const { logEntry: persistEntry } = useLogGlucoseEntry();

  const [glucose, setGlucose] = useState("");
  const [mealTag, setMealTag] = useState<MealTag>("fasting");
  const [carbs, setCarbs] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [insulinDose, setInsulinDose] = useState("");
  const [insulinType, setInsulinType] = useState<InsulinType>("bolus");
  const [actType, setActType] = useState("");
  const [actDuration, setActDuration] = useState("");
  const [actIntensity, setActIntensity] = useState<ActivityIntensity>("moderate");
  const [selectedTags, setSelectedTags] = useState<SugarTag[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [inputNotes, setInputNotes] = useState("");
  const [ketones, setKetones] = useState("");
  const [inputWeight, setInputWeight] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleTag = (tag: SugarTag) => setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);

  const resetForm = () => {
    setGlucose(""); setMealTag("fasting"); setCarbs(""); setMealDesc(""); setInsulinDose("");
    setInsulinType("bolus"); setActType(""); setActDuration(""); setActIntensity("moderate");
    setSelectedTags([]); setMood(null); setInputNotes(""); setKetones("");
    setInputWeight(""); setBpSys(""); setBpDia(""); setShowAdvanced(false); setShowInput(false);
  };

  const handleLog = async () => {
    const gl = parseInt(glucose);
    if (isNaN(gl) || gl < 20 || gl > 600) return;
    const ts = new Date();
    const payload = {
      timestamp: ts.toISOString(), glucose: gl, mealTag, carbs: carbs ? parseInt(carbs) : null,
      mealDescription: mealDesc, insulinDose: insulinDose ? parseFloat(insulinDose) : null,
      insulinType: insulinDose ? insulinType : null, activityType: actType,
      activityDuration: actDuration ? parseInt(actDuration) : null,
      activityIntensity: actDuration ? actIntensity : null,
      tags: selectedTags, mood, notes: inputNotes,
      ketones: ketones ? parseFloat(ketones) : null, weight: inputWeight ? parseFloat(inputWeight) : null,
      systolic: bpSys ? parseInt(bpSys) : null, diastolic: bpDia ? parseInt(bpDia) : null,
    };
    setEntries((prev) => [{ id: `gl-${Date.now()}`, ...payload, timestamp: ts } as any, ...prev]);
    resetForm();
    try {
      await persistEntry(payload as any);
      const cls = classifyGlucose(gl, mealTag);
      toast.success(`Glucose logged: ${gl} mg/dL — ${cls.label}`);
    } catch (e: any) { toast.error(`Failed to save: ${e.message}`); }
  };

  const todayEntries = useMemo(() => { const today = new Date(2026, 2, 2); return entries.filter((e) => e.timestamp.toDateString() === today.toDateString()); }, [entries]);
  const avgGlucose = useMemo(() => entries.length === 0 ? 0 : Math.round(entries.reduce((s, e) => s + e.glucose, 0) / entries.length), [entries]);
  const timeInRange = useMemo(() => entries.length === 0 ? 0 : Math.round((entries.filter((e) => e.glucose >= 70 && e.glucose <= 180).length / entries.length) * 100), [entries]);
  const totalInsulin = useMemo(() => todayEntries.reduce((s, e) => s + (e.insulinDose || 0), 0), [todayEntries]);
  const totalCarbs = useMemo(() => todayEntries.reduce((s, e) => s + (e.carbs || 0), 0), [todayEntries]);
  const estimatedHbA1c = useMemo(() => avgGlucose === 0 ? "—" : ((avgGlucose + 46.7) / 28.7).toFixed(1) + "%", [avgGlucose]);

  const illnessStage = useMemo(() => {
    if (entries.length < 5) return "learning";
    if (timeInRange >= 80) return "stable";
    if (timeInRange >= 60) return "stabilizing";
    return "learning";
  }, [entries.length, timeInRange]);

  const adaptiveInsight = useMemo(() => {
    if (illnessStage === "stable") {
      return { 
        title: "Maintenance Stage", 
        desc: "Highly predictable trend. Your current regimen is working well.", 
        color: C.successDark, bg: C.successLight, icon: <Smile size={16} color={C.successDark} /> 
      };
    } else if (illnessStage === "stabilizing") {
      return { 
        title: "Stabilizing Stage", 
        desc: "Getting closer to target range. We noticed exercise helps your post-meal spikes.", 
        color: C.alertText, bg: C.alertLight, icon: <Activity size={16} color={C.alertText} /> 
      };
    } else {
      return { 
        title: "Learning Phase", 
        desc: "We are still finding your patterns. Logging meal tags will help us personalize your insights.", 
        color: C.blueDark, bg: C.blueLight, icon: <GraduationCap size={16} color={C.blueDark} /> 
      };
    }
  }, [illnessStage]);

  const inputStyle = { minHeight: L.touch, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: T.body, fontWeight: 600 as const, fontFamily: "inherit", outline: "none", borderRadius: L.rMd, padding: "0 16px", width: "100%" };
  const mealTagLabel = (tag: MealTag) => MEAL_TAGS.find((t) => t.value === tag)?.label || tag;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-[430px] rounded-t-3xl overflow-hidden" style={{ background: C.bg, maxHeight: "95vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sugar Level Tracker">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: C.alertLight, border: `1px solid ${C.alertBorder}` }}>
              <Droplets size={20} color={C.alert} />
            </div>
            <div>
              <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>Sugar Levels</h2>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", margin: 0 }}>Diabetes Management</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-xl" style={{ width: L.touch, height: L.touch, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub }} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="mx-5 mt-3 flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {(["log", "trends", "stats"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveSection(tab)} className="flex-1 transition-all" style={{ minHeight: 44, background: activeSection === tab ? C.primary : C.card, color: activeSection === tab ? C.text : C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "inherit", textTransform: "uppercase" }} aria-pressed={activeSection === tab}>
              {tab === "log" ? "Logbook" : tab === "trends" ? "Trends" : "Stats"}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeSection === "stats" && (
          <div className="px-5 mt-4 pb-8">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ l: "AVG GLUCOSE", v: `${avgGlucose}`, s: "mg/dL", c: C.text }, { l: "TIME IN RANGE", v: `${timeInRange}%`, s: "Target: 70-180", c: timeInRange >= 70 ? C.successDark : C.alertText }, { l: "EST. HbA1c", v: estimatedHbA1c, s: "Based on avg", c: C.text }, { l: "READINGS", v: `${entries.length}`, s: "Total logged", c: C.text }].map((card) => (
                <div key={card.l} className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>{card.l}</p>
                  <p style={{ color: card.c, fontSize: T.h2, fontWeight: 800, fontFamily: "inherit", marginTop: 2 }}>{card.v}</p>
                  <p style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>{card.s}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.borderLight}`, background: C.primaryLight }}>
                <span style={{ color: C.successDark, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>TODAY'S SUMMARY</span>
              </div>
              <div className="grid grid-cols-3 gap-px" style={{ background: C.borderLight }}>
                {[{ label: "Insulin", value: `${totalInsulin}u`, icon: <Syringe size={14} color={C.secondary} /> }, { label: "Carbs", value: `${totalCarbs}g`, icon: <Utensils size={14} color={C.alert} /> }, { label: "Readings", value: `${todayEntries.length}`, icon: <Droplets size={14} color={C.primary} /> }].map((item) => (
                  <div key={item.label} className="flex flex-col items-center py-3" style={{ background: C.card }}>
                    {item.icon}
                    <span style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 800, fontFamily: "inherit", marginTop: 4 }}>{item.value}</span>
                    <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit", marginBottom: 12 }}>GLUCOSE DISTRIBUTION</p>
              {(() => { const low = entries.filter((e) => e.glucose < 70).length; const inR = entries.filter((e) => e.glucose >= 70 && e.glucose <= 180).length; const high = entries.filter((e) => e.glucose > 180).length; const total = entries.length || 1; return (<div className="flex flex-col gap-2">{[{ label: "Low (<70)", pct: low / total, color: C.blue }, { label: "In Range (70-180)", pct: inR / total, color: C.success }, { label: "High (>180)", pct: high / total, color: C.alert }].map((band) => (<div key={band.label} className="flex items-center gap-3"><div style={{ width: 8, height: 8, borderRadius: "50%", background: band.color, flexShrink: 0 }} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit", minWidth: 100 }}>{band.label}</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.borderLight }}><div style={{ width: `${band.pct * 100}%`, height: "100%", background: band.color, borderRadius: 9999, transition: "width 0.4s ease" }} /></div><span style={{ color: C.text, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit", minWidth: 28, textAlign: "right" }}>{Math.round(band.pct * 100)}%</span></div>))}</div>); })()}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeSection === "trends" && (
          <div className="px-5 mt-4 pb-8">
            <SectionBanner
              color={adaptiveInsight.color}
              bg={adaptiveInsight.bg}
              border={`${adaptiveInsight.color}30`}
              icon={adaptiveInsight.icon}
              title={adaptiveInsight.title}
              desc={adaptiveInsight.desc}
              className="mb-4"
            />

            {entries.length > 0 && <div className="rounded-2xl py-5 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}><GlucoseGauge value={entries[0].glucose} mealTag={entries[0].mealTag} /></div>}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                <TrendingUp size={13} color={C.primary} />
                <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>GLUCOSE TREND</span>
              </div>
              <div className="p-3"><DailyTrendChart entries={entries} /></div>
              <div className="px-4 pb-3 flex items-center gap-1"><div style={{ width: 16, height: 6, borderRadius: 3, background: C.successLight, border: `1px solid ${C.successBorder}` }} /><span style={{ color: C.textMuted, fontSize: 8, fontFamily: "inherit" }}>Target range</span></div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.borderLight}` }}><span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>DIABETES CORRELATIONS</span></div>
              <div className="flex flex-col">
                {[{ icon: <Heart size={14} color={C.rose} />, label: "Blood Pressure", desc: "High glucose correlates with elevated BP", trend: "Monitor both daily" }, { icon: <Weight size={14} color={C.secondary} />, label: "Weight", desc: "Weight stability supports glucose control", trend: "Weekly tracking recommended" }, { icon: <Zap size={14} color={C.alert} />, label: "Ketones", desc: "Check ketones when glucose > 250 mg/dL", trend: "Prevents DKA risk" }, { icon: <Footprints size={14} color={C.primary} />, label: "Activity", desc: "30 min exercise lowers glucose 20-40 mg/dL", trend: "Most effective post-meal" }].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 3 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ width: 32, height: 32, background: C.secondaryLight }}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{item.label}</p>
                      <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit", marginTop: 1 }}>{item.desc}</p>
                      <p style={{ color: C.primary, fontSize: 9, fontWeight: 600, fontFamily: "inherit", marginTop: 2 }}>{item.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logbook Tab */}
        {activeSection === "log" && (
          <>
            {!showInput && (
              <div className="mx-5 mt-4">
                <button onClick={() => setShowInput(true)} className="w-full rounded-xl flex items-center justify-center gap-2 transition-all" style={{ minHeight: L.touch, background: "#4A4D4C", border: "1px solid rgba(142,175,157,0.4)", color: "#FFFFFF", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} aria-label="Log new glucose reading">
                  <Plus size={16} />
                  {illnessStage === "stable" ? "Quick Log Entry" : "Log Detailed Reading"}
                </button>
                {illnessStage !== "stable" && (
                  <p className="text-center mt-3 flex items-center justify-center gap-1.5" style={{ color: C.textSub, fontSize: 10, fontFamily: "inherit" }}>
                    <GraduationCap size={12} color={C.textMuted} />
                    Logging meals + activity helps us predict your trends.
                  </p>
                )}
              </div>
            )}

            {showInput && (
              <div className="mx-5 mt-4 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.primaryBorder}` }}>
                <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }} className="mb-3">NEW READING</p>
                <div className="mb-4">
                  <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Blood Glucose (mg/dL) *</label>
                  <input type="number" placeholder="120" value={glucose} onChange={(e) => setGlucose(e.target.value)} min={20} max={600} style={{ ...inputStyle, marginTop: 4, fontSize: 24, fontWeight: 800, textAlign: "center" as const }} aria-label="Blood glucose value" autoFocus />
                </div>
                <div className="mb-4">
                  <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>When</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MEAL_TAGS.map((mt) => (<button key={mt.value} onClick={() => setMealTag(mt.value)} className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all" style={{ background: mealTag === mt.value ? C.primaryLight : "transparent", border: `1px solid ${mealTag === mt.value ? C.primary : C.borderLight}`, color: mealTag === mt.value ? C.successDark : C.textSub, fontSize: 10, fontWeight: 600, fontFamily: "inherit" }} aria-pressed={mealTag === mt.value}>{mt.icon}{mt.label}</button>))}
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Carbs (g)</label><input type="number" placeholder="45" value={carbs} onChange={(e) => setCarbs(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Carbohydrate grams" /></div>
                  <div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Meal Note</label><input type="text" placeholder="e.g. Toast + eggs" value={mealDesc} onChange={(e) => setMealDesc(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="Meal description" /></div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Insulin (units)</label><input type="number" placeholder="4" value={insulinDose} onChange={(e) => setInsulinDose(e.target.value)} step="0.5" style={{ ...inputStyle, marginTop: 4 }} aria-label="Insulin dose" /></div>
                  <div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Type</label>
                    <div className="flex gap-1.5 mt-1">{(["basal", "bolus", "correction", "mixed"] as InsulinType[]).map((it) => (<button key={it} onClick={() => setInsulinType(it)} className="flex-1 rounded-md py-2 transition-all" style={{ background: insulinType === it ? C.primaryLight : "transparent", border: `1px solid ${insulinType === it ? C.primary : C.borderLight}`, color: insulinType === it ? C.successDark : C.textMuted, fontSize: 8, fontWeight: 700, fontFamily: "inherit", textTransform: "uppercase" }} aria-pressed={insulinType === it}>{it}</button>))}</div>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Activity</label><input type="text" placeholder="e.g. Walking" value={actType} onChange={(e) => setActType(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="Activity type" /></div>
                  <div style={{ width: 80 }}><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Min</label><input type="number" placeholder="30" value={actDuration} onChange={(e) => setActDuration(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Activity duration" /></div>
                </div>
                <div className="mb-4">
                  <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">{SUGAR_TAGS.map((st) => (<button key={st.value} onClick={() => toggleTag(st.value)} className="rounded-full px-3 py-2 transition-all" style={{ background: selectedTags.includes(st.value) ? (st.value === "hypo" ? C.blueLight : C.alertLight) : "transparent", border: `1px solid ${selectedTags.includes(st.value) ? (st.value === "hypo" ? C.blueBorder : C.alertBorder) : C.borderLight}`, color: selectedTags.includes(st.value) ? (st.value === "hypo" ? C.blueDark : C.alertText) : C.textSub, fontSize: 10, fontWeight: 600, fontFamily: "inherit" }} aria-pressed={selectedTags.includes(st.value)}>{st.label}</button>))}</div>
                </div>
                <div className="mb-4">
                  <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>How are you feeling?</label>
                  <div className="flex gap-3 mt-2">{(["great", "okay", "low"] as Mood[]).map((m) => (<button key={m} onClick={() => setMood(m)} className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 transition-all" style={{ background: mood === m ? C.primaryLight : "transparent", border: `1px solid ${mood === m ? C.primary : C.borderLight}` }} aria-pressed={mood === m} aria-label={m}><MoodIcon mood={m} size={22} /><span style={{ color: mood === m ? C.successDark : C.textMuted, fontSize: 9, fontWeight: 700, fontFamily: "inherit", textTransform: "capitalize" }}>{m}</span></button>))}</div>
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-3" style={{ background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}` }}><span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>CORRELATED VITALS (Optional)</span>{showAdvanced ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}</button>
                {showAdvanced && (
                  <div className="flex flex-col gap-3 mb-4 p-3 rounded-xl" style={{ background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}` }}>
                    <div className="flex gap-3"><div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Ketones (mmol/L)</label><input type="number" placeholder="0.5" value={ketones} onChange={(e) => setKetones(e.target.value)} step="0.1" style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="Ketone level" /></div><div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Weight (lbs)</label><input type="number" placeholder="165" value={inputWeight} onChange={(e) => setInputWeight(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="Weight" /></div></div>
                    <div className="flex gap-3"><div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>BP Sys</label><input type="number" placeholder="120" value={bpSys} onChange={(e) => setBpSys(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="BP systolic" /></div><div className="flex-1"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>BP Dia</label><input type="number" placeholder="80" value={bpDia} onChange={(e) => setBpDia(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="BP diastolic" /></div></div>
                  </div>
                )}
                <div className="mb-4"><label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Notes</label><input type="text" placeholder="Additional notes..." value={inputNotes} onChange={(e) => setInputNotes(e.target.value)} style={{ ...inputStyle, marginTop: 4, fontSize: T.bodySm }} aria-label="Notes" /></div>
                <div className="flex gap-3">
                  <button onClick={resetForm} className="flex-1 rounded-xl flex items-center justify-center transition-all" style={{ minHeight: L.touch, background: "#4A4D4C", border: "1px solid rgba(142,175,157,0.4)", color: "#FFFFFF", fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={handleLog} disabled={!glucose} className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all" style={{ minHeight: L.touch, background: glucose ? "#4A4D4C" : C.borderLight, border: "1px solid rgba(142,175,157,0.4)", color: glucose ? "#FFFFFF" : C.textMuted, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }} aria-label="Save glucose reading"><Droplets size={14} color={glucose ? "#FFFFFF" : C.textMuted} />Log Reading</button>
                </div>
              </div>
            )}

            {/* Entry List */}
            <div className="px-5 pt-4 pb-2"><div className="flex items-center gap-2 mb-3"><Clock size={12} color={C.textMuted} /><span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>LOGBOOK</span></div></div>
            <div className="flex flex-col gap-2 px-5 pb-8">
              {entries.slice(0, 15).map((e) => {
                const cls = classifyGlucose(e.glucose, e.mealTag);
                const expanded = expandedId === e.id;
                return (
                  <button key={e.id} onClick={() => setExpandedId(expanded ? null : e.id)} className="w-full rounded-xl overflow-hidden text-left transition-all" style={{ background: C.card, border: `1px solid ${C.border}` }} aria-expanded={expanded}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex flex-col items-center" style={{ minWidth: 50 }}>
                        <span style={{ color: cls.textColor, fontSize: T.h3, fontWeight: 800, lineHeight: 1, fontFamily: "inherit" }}>{e.glucose}</span>
                        <span style={{ color: C.textMuted, fontSize: 8, fontFamily: "inherit" }}>mg/dL</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full px-2 py-0.5" style={{ background: cls.bg, color: cls.textColor, fontSize: 8, fontWeight: 700, fontFamily: "inherit", border: `1px solid ${cls.color}30` }}>{cls.label}</span>
                          <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>{mealTagLabel(e.mealTag)}</span>
                        </div>
                        <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit", marginTop: 3 }}>
                          {e.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {e.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                        {(e.tags.length > 0 || e.mood) && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {e.mood && <MoodIcon mood={e.mood} size={12} />}
                            {e.tags.map((t) => (<span key={t} className="rounded-full px-1.5 py-0.5" style={{ background: t === "hypo" ? C.blueLight : C.alertLight, color: t === "hypo" ? C.blueDark : C.alertText, fontSize: 8, fontWeight: 600, fontFamily: "inherit" }}>{t}</span>))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {e.carbs != null && <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>{e.carbs}g carbs</span>}
                        {e.insulinDose != null && <span style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>{e.insulinDose}u {e.insulinType}</span>}
                      </div>
                      {expanded ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                    </div>
                    {expanded && (
                      <div className="px-4 pb-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 8 }}>
                        <div className="flex flex-wrap gap-3">
                          {e.carbs != null && <div className="flex items-center gap-1"><Utensils size={10} color={C.alert} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>Carbs: {e.carbs}g</span></div>}
                          {e.insulinDose != null && <div className="flex items-center gap-1"><Syringe size={10} color={C.secondary} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>Insulin: {e.insulinDose}u ({e.insulinType})</span></div>}
                          {e.activityType && <div className="flex items-center gap-1"><Footprints size={10} color={C.primary} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>{e.activityType} {e.activityDuration && `${e.activityDuration}min`}</span></div>}
                          {e.ketones != null && <div className="flex items-center gap-1"><Zap size={10} color={C.alert} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>Ketones: {e.ketones} mmol/L</span></div>}
                          {e.systolic != null && e.diastolic != null && <div className="flex items-center gap-1"><Heart size={10} color={C.rose} /><span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>BP: {e.systolic}/{e.diastolic}</span></div>}
                        </div>
                        {e.mealDescription && <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>Meal: {e.mealDescription}</p>}
                        {e.notes && <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>Notes: {e.notes}</p>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}