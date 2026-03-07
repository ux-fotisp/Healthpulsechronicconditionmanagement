/**
 * HealthPulse · Goals & Milestones Tracker (Sprint 8 — P2)
 * ══════════════════════════════════════════════════════════════════════
 * WCAG 2.1 AA compliant, 56px touch targets, Muted Healing Palette,
 * Montserrat typography, 8px grid, Frosted Glass layers.
 *
 * Features:
 *   - View all care plan goals with milestone progress
 *   - Create new goals with milestone breakdown
 *   - Toggle milestones on/off (auto-completes goal when all done)
 *   - Pause/resume/delete goals
 *   - Category filtering (medication, vitals, lifestyle, appointment, custom)
 *   - Visual progress rings and celebration state
 */

import React, { useState } from "react";
import {
  Target,
  Plus,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Pill,
  Activity,
  Heart,
  CalendarCheck,
  Star,
  Trophy,
  Pause,
  Play,
  Trash2,
  X,
  Flag,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  useGoals,
  useCreateGoal,
  useToggleMilestone,
  useUpdateGoal,
  useDeleteGoal,
  useCreateMilestone,
} from "../hooks/useHealthData";
import type { GoalDTO } from "../data/api";
import { C, T, L } from "../design/tokens";
import { toast } from "sonner";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES: {
  key: GoalDTO["category"];
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: "medication", label: "Medication",  icon: Pill,          color: C.primary,      bg: C.primaryLight,     border: C.primaryBorder },
  { key: "vitals",     label: "Vitals",      icon: Activity,      color: C.teal,         bg: C.tealLight,        border: C.tealBorder },
  { key: "lifestyle",  label: "Lifestyle",   icon: Heart,         color: C.rose,         bg: C.roseLight,        border: C.roseBorder },
  { key: "appointment",label: "Appointments",icon: CalendarCheck, color: C.amber,        bg: "rgba(201,160,112,0.12)", border: "rgba(201,160,112,0.3)" },
  { key: "custom",     label: "Custom",      icon: Star,          color: C.secondary,    bg: C.secondaryLight,   border: C.secondaryBorder },
];

function getCategoryConfig(cat: GoalDTO["category"]) {
  return CATEGORIES.find((c) => c.key === cat) || CATEGORIES[4];
}

// ── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({
  progress,
  size = 52,
  stroke = 4,
  color,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.borderLight}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────────────
type Filter = "all" | GoalDTO["category"];

function FilterBar({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  const pills: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    ...CATEGORIES.map((c) => ({ key: c.key as Filter, label: c.label })),
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      role="tablist"
      aria-label="Filter goals by category"
    >
      {pills.map((p) => {
        const isActive = active === p.key;
        return (
          <button
            key={p.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.key)}
            className="flex-shrink-0 rounded-full transition-all duration-200"
            style={{
              padding: "8px 16px",
              minHeight: 36,
              fontSize: T.bodySm,
              fontWeight: isActive ? 700 : 500,
              background: isActive ? C.primary : C.frostedBg,
              color: isActive ? "#fff" : C.cardText,
              border: `1px solid ${isActive ? C.primary : C.borderLight}`,
              backdropFilter: isActive ? "none" : C.frostedBlur,
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({
  goal,
  onToggleMilestone,
  onPauseResume,
  onDelete,
  onAddMilestone,
}: {
  goal: GoalDTO;
  onToggleMilestone: (goalId: string, msId: string) => void;
  onPauseResume: (goalId: string, current: string) => void;
  onDelete: (goalId: string) => void;
  onAddMilestone: (goalId: string) => void;
}) {
  const [expanded, setExpanded] = useState(goal.status === "active");
  const cat = getCategoryConfig(goal.category);
  const CatIcon = cat.icon;
  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isCompleted ? "rgba(181,201,154,0.06)" : C.cardBg,
        border: `1px solid ${isCompleted ? C.successBorder : isPaused ? C.borderLight : cat.border}`,
        opacity: isPaused ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${goal.title} — ${goal.progress}% complete. ${expanded ? "Collapse" : "Expand"} milestones`}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          minHeight: L.touch,
        }}
      >
        {/* Progress Ring with category icon */}
        <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
          <ProgressRing
            progress={goal.progress}
            color={isCompleted ? C.success : cat.color}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            {isCompleted ? (
              <Trophy size={18} color={C.successDark} />
            ) : (
              <CatIcon size={18} color={cat.color} />
            )}
          </div>
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold truncate"
            style={{
              fontSize: T.bodyMd,
              color: C.cardText,
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {goal.title}
          </div>
          <div className="flex items-center gap-2 mt-1" style={{ fontSize: T.bodySm, color: C.cardTextSub }}>
            <span
              className="rounded-full px-2 py-0.5"
              style={{
                fontSize: T.nano,
                fontWeight: 700,
                letterSpacing: "0.04em",
                background: cat.bg,
                color: cat.color,
                border: `1px solid ${cat.border}`,
              }}
            >
              {cat.label.toUpperCase()}
            </span>
            {goal.totalMilestones > 0 && (
              <span>
                {goal.completedMilestones}/{goal.totalMilestones} milestones
              </span>
            )}
          </div>
        </div>

        {/* Progress % + Expand chevron */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            style={{
              fontSize: T.body,
              fontWeight: 700,
              color: isCompleted ? C.successDark : goal.progress >= 75 ? C.primary : C.cardText,
            }}
          >
            {goal.progress}%
          </span>
          {expanded ? (
            <ChevronUp size={16} color={C.cardTextFaint} />
          ) : (
            <ChevronDown size={16} color={C.cardTextFaint} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: `1px solid ${C.borderLight}` }}
        >
          {/* Description */}
          {goal.description && (
            <p
              className="mt-3 mb-3"
              style={{ fontSize: T.bodySm, color: C.cardTextSub, lineHeight: 1.5 }}
            >
              {goal.description}
            </p>
          )}

          {/* Target date + status row */}
          <div className="flex items-center gap-3 mb-3">
            {daysLeft !== null && (
              <div className="flex items-center gap-1">
                <Flag size={13} color={daysLeft <= 0 ? C.terracottaDark : daysLeft <= 7 ? C.alertText : C.cardTextFaint} />
                <span
                  style={{
                    fontSize: T.bodySm,
                    fontWeight: 600,
                    color: daysLeft <= 0 ? C.terracottaDark : daysLeft <= 7 ? C.alertText : C.cardTextSub,
                  }}
                >
                  {daysLeft <= 0 ? "Past due" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                </span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-1">
                <Sparkles size={13} color={C.successDark} />
                <span style={{ fontSize: T.bodySm, fontWeight: 600, color: C.successDark }}>
                  Goal achieved!
                </span>
              </div>
            )}
            {isPaused && (
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  fontSize: T.nano,
                  fontWeight: 700,
                  background: C.secondaryLight,
                  color: C.secondary,
                  border: `1px solid ${C.secondaryBorder}`,
                }}
              >
                PAUSED
              </span>
            )}
          </div>

          {/* Milestone list */}
          {goal.milestones.length > 0 && (
            <div className="flex flex-col gap-1 mb-3" role="list" aria-label="Milestones">
              {goal.milestones.map((ms) => (
                <button
                  key={ms.id}
                  role="listitem"
                  onClick={() => onToggleMilestone(goal.id, ms.id)}
                  className="flex items-center gap-3 rounded-xl transition-all duration-200"
                  style={{
                    padding: "12px 12px",
                    background: ms.completed ? C.successLight : "transparent",
                    border: `1px solid ${ms.completed ? C.successBorder : C.borderLight}`,
                    cursor: isCompleted && ms.completed ? "default" : "pointer",
                    minHeight: L.touch,
                    textAlign: "left",
                  }}
                  aria-label={`${ms.completed ? "Completed" : "Incomplete"}: ${ms.title}. Tap to toggle.`}
                >
                  {ms.completed ? (
                    <CheckCircle2 size={20} color={C.successDark} strokeWidth={2.5} />
                  ) : (
                    <Circle size={20} color={C.cardTextFaint} strokeWidth={1.5} />
                  )}
                  <span
                    className="flex-1"
                    style={{
                      fontSize: T.bodySm,
                      fontWeight: ms.completed ? 500 : 400,
                      color: ms.completed ? C.successDark : C.cardText,
                      textDecoration: ms.completed ? "line-through" : "none",
                    }}
                  >
                    {ms.title}
                  </span>
                  {ms.dueDate && (
                    <span style={{ fontSize: T.micro, color: C.cardTextMuted }}>
                      {new Date(ms.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2">
            {!isCompleted && (
              <button
                onClick={() => onAddMilestone(goal.id)}
                className="flex items-center gap-1.5 rounded-lg transition-colors duration-200"
                style={{
                  padding: "8px 14px",
                  fontSize: T.bodySm,
                  fontWeight: 600,
                  color: C.primary,
                  background: C.primaryLight,
                  border: `1px solid ${C.primaryBorder}`,
                  cursor: "pointer",
                  minHeight: 40,
                }}
                aria-label="Add a milestone"
              >
                <Plus size={14} />
                Milestone
              </button>
            )}
            <button
              onClick={() => onPauseResume(goal.id, goal.status)}
              className="flex items-center gap-1.5 rounded-lg transition-colors duration-200"
              style={{
                padding: "8px 14px",
                fontSize: T.bodySm,
                fontWeight: 600,
                color: C.secondary,
                background: C.secondaryLight,
                border: `1px solid ${C.secondaryBorder}`,
                cursor: "pointer",
                minHeight: 40,
              }}
              aria-label={isPaused ? "Resume goal" : isCompleted ? "Reopen goal" : "Pause goal"}
            >
              {isPaused ? <Play size={14} /> : isCompleted ? <Play size={14} /> : <Pause size={14} />}
              {isPaused ? "Resume" : isCompleted ? "Reopen" : "Pause"}
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="flex items-center justify-center rounded-lg transition-colors duration-200 ml-auto"
              style={{
                width: 40,
                height: 40,
                color: C.terracottaDark,
                background: C.terracottaLight,
                border: `1px solid ${C.terracottaBorder}`,
                cursor: "pointer",
              }}
              aria-label="Delete goal"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Goal Modal ───────────────────────────────────────────────────────
function CreateGoalModal({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    category: GoalDTO["category"];
    targetDate?: string;
    milestones: { title: string }[];
  }) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalDTO["category"]>("medication");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([""]);

  const addMsField = () => setMilestones([...milestones, ""]);
  const removeMsField = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMs = (i: number, v: string) => {
    const copy = [...milestones];
    copy[i] = v;
    setMilestones(copy);
  };

  const canSubmit = title.trim().length > 0 && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create a new goal"
    >
      <div
        className="w-full rounded-t-3xl overflow-y-auto"
        style={{
          maxWidth: 430,
          maxHeight: "90vh",
          background: C.bg,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 style={{ fontSize: T.h3, fontWeight: 700, color: C.text }}>New Goal</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              background: C.secondaryLight,
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            <X size={18} color={C.secondary} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label
              htmlFor="goal-title"
              style={{ fontSize: T.bodySm, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}
            >
              Goal Title <span style={{ color: C.terracottaDark }}>*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Improve blood pressure control"
              className="w-full rounded-xl"
              style={{
                padding: "14px 16px",
                fontSize: T.bodySm,
                fontFamily: T.family,
                color: C.text,
                background: C.card,
                border: `1px solid ${C.border}`,
                outline: "none",
                minHeight: L.touch,
              }}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="goal-desc"
              style={{ fontSize: T.bodySm, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}
            >
              Description
            </label>
            <textarea
              id="goal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this goal important to you?"
              rows={2}
              className="w-full rounded-xl resize-none"
              style={{
                padding: "14px 16px",
                fontSize: T.bodySm,
                fontFamily: T.family,
                color: C.text,
                background: C.card,
                border: `1px solid ${C.border}`,
                outline: "none",
              }}
            />
          </div>

          {/* Category selector */}
          <div>
            <label
              style={{ fontSize: T.bodySm, fontWeight: 600, color: C.text, display: "block", marginBottom: 8 }}
            >
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                const CIcon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className="flex items-center gap-1.5 rounded-full transition-all duration-200"
                    style={{
                      padding: "8px 14px",
                      fontSize: T.bodySm,
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? cat.bg : "transparent",
                      color: isSelected ? cat.color : C.cardTextSub,
                      border: `1.5px solid ${isSelected ? cat.color : C.borderLight}`,
                      cursor: "pointer",
                      minHeight: 40,
                    }}
                    aria-pressed={isSelected}
                  >
                    <CIcon size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target date */}
          <div>
            <label
              htmlFor="goal-target"
              style={{ fontSize: T.bodySm, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}
            >
              Target Date (optional)
            </label>
            <input
              id="goal-target"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl"
              style={{
                padding: "14px 16px",
                fontSize: T.bodySm,
                fontFamily: T.family,
                color: C.text,
                background: C.card,
                border: `1px solid ${C.border}`,
                outline: "none",
                minHeight: L.touch,
              }}
            />
          </div>

          {/* Milestones */}
          <div>
            <label
              style={{ fontSize: T.bodySm, fontWeight: 600, color: C.text, display: "block", marginBottom: 8 }}
            >
              Milestones
            </label>
            <div className="flex flex-col gap-2">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Circle size={16} color={C.cardTextFaint} className="flex-shrink-0" />
                  <input
                    type="text"
                    value={ms}
                    onChange={(e) => updateMs(i, e.target.value)}
                    placeholder={`Milestone ${i + 1}`}
                    className="flex-1 rounded-lg"
                    style={{
                      padding: "10px 12px",
                      fontSize: T.bodySm,
                      fontFamily: T.family,
                      color: C.text,
                      background: C.card,
                      border: `1px solid ${C.borderLight}`,
                      outline: "none",
                      minHeight: 44,
                    }}
                    aria-label={`Milestone ${i + 1} title`}
                  />
                  {milestones.length > 1 && (
                    <button
                      onClick={() => removeMsField(i)}
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 36,
                        height: 36,
                        background: C.terracottaLight,
                        border: "none",
                        cursor: "pointer",
                      }}
                      aria-label={`Remove milestone ${i + 1}`}
                    >
                      <X size={14} color={C.terracottaDark} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMsField}
                className="flex items-center gap-1.5 rounded-lg self-start"
                style={{
                  padding: "8px 14px",
                  fontSize: T.bodySm,
                  fontWeight: 600,
                  color: C.primary,
                  background: "transparent",
                  border: `1px dashed ${C.primaryBorder}`,
                  cursor: "pointer",
                  minHeight: 40,
                }}
                aria-label="Add another milestone"
              >
                <Plus size={14} />
                Add milestone
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => {
              const validMs = milestones.filter((m) => m.trim()).map((m) => ({ title: m.trim() }));
              onCreate({
                title: title.trim(),
                description: description.trim(),
                category,
                targetDate: targetDate || undefined,
                milestones: validMs,
              });
            }}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-2xl transition-all duration-200"
            style={{
              padding: "16px",
              fontSize: T.bodyMd,
              fontWeight: 700,
              color: "#fff",
              background: canSubmit ? C.primary : C.locked,
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              minHeight: L.touch,
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            <Target size={18} />
            {loading ? "Creating..." : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Milestone Inline Modal ───────────────────────────────────────────────
function AddMilestoneModal({
  goalId,
  onClose,
  onAdd,
  loading,
}: {
  goalId: string;
  onClose: () => void;
  onAdd: (goalId: string, title: string) => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add a milestone"
    >
      <div
        className="w-full rounded-t-3xl"
        style={{
          maxWidth: 430,
          background: C.bg,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-2">
          <h3 style={{ fontSize: T.h3, fontWeight: 700, color: C.text }}>Add Milestone</h3>
        </div>
        <div className="px-5 pb-6 flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the next step?"
            className="w-full rounded-xl"
            style={{
              padding: "14px 16px",
              fontSize: T.bodySm,
              fontFamily: T.family,
              color: C.text,
              background: C.card,
              border: `1px solid ${C.border}`,
              outline: "none",
              minHeight: L.touch,
            }}
            autoFocus
            aria-label="Milestone title"
          />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl"
              style={{
                padding: "14px",
                fontSize: T.bodyMd,
                fontWeight: 600,
                color: C.secondary,
                background: C.secondaryLight,
                border: `1px solid ${C.secondaryBorder}`,
                cursor: "pointer",
                minHeight: L.touch,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => title.trim() && onAdd(goalId, title.trim())}
              disabled={!title.trim() || loading}
              className="flex-1 rounded-xl"
              style={{
                padding: "14px",
                fontSize: T.bodyMd,
                fontWeight: 700,
                color: "#fff",
                background: title.trim() ? C.primary : C.locked,
                border: "none",
                cursor: title.trim() ? "pointer" : "not-allowed",
                minHeight: L.touch,
              }}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────────────────────────
function GoalsSummary({ goals }: { goals: GoalDTO[] }) {
  const active = goals.filter((g) => g.status === "active").length;
  const completed = goals.filter((g) => g.status === "completed").length;
  const totalMs = goals.reduce((s, g) => s + g.totalMilestones, 0);
  const completedMs = goals.reduce((s, g) => s + g.completedMilestones, 0);
  const overallProgress = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: C.frostedBg,
        backdropFilter: C.frostedBlur,
        border: `1px solid ${C.primaryBorder}`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Overall progress ring */}
        <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
          <ProgressRing progress={overallProgress} size={64} stroke={5} color={C.primary} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: T.bodyMd, fontWeight: 700, color: C.text }}>
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div style={{ fontSize: T.bodyMd, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Overall Progress
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: T.bodySm }}>
            <span style={{ color: C.primary, fontWeight: 600 }}>{active} active</span>
            <span style={{ color: C.successDark, fontWeight: 600 }}>{completed} done</span>
            <span style={{ color: C.cardTextSub }}>
              {completedMs}/{totalMs} milestones
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd, filtered }: { onAdd: () => void; filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{
          width: 72,
          height: 72,
          background: C.primaryLight,
          border: `1px solid ${C.primaryBorder}`,
        }}
      >
        <Target size={32} color={C.primary} />
      </div>
      <h3 style={{ fontSize: T.h3, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        {filtered ? "No goals in this category" : "Set your first health goal"}
      </h3>
      <p style={{ fontSize: T.bodySm, color: C.textSub, marginBottom: 24, maxWidth: 280 }}>
        {filtered
          ? "Try a different category or create a new goal."
          : "Track medication targets, vitals milestones, and lifestyle changes — all in one place."}
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 rounded-2xl"
        style={{
          padding: "14px 28px",
          fontSize: T.bodyMd,
          fontWeight: 700,
          color: "#fff",
          background: C.primary,
          border: "none",
          cursor: "pointer",
          minHeight: L.touch,
        }}
      >
        <Plus size={18} />
        Create Goal
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function GoalsTracker() {
  const navigate = useNavigate();
  const { data: goals, loading, error, refetch } = useGoals();
  const { create: createGoal, loading: creating } = useCreateGoal();
  const { toggle: toggleMs, loading: toggling } = useToggleMilestone();
  const { update: updateGoal, loading: updating } = useUpdateGoal();
  const { remove: deleteGoal, loading: deleting } = useDeleteGoal();
  const { create: addMilestone, loading: addingMs } = useCreateMilestone();

  const [showCreate, setShowCreate] = useState(false);
  const [showAddMs, setShowAddMs] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  // Filter + sort
  const filtered = (goals || [])
    .filter((g) => filter === "all" || g.category === filter)
    .sort((a, b) => {
      // Active first, then completed, then paused
      const statusOrder = { active: 0, completed: 1, paused: 2 };
      const diff = statusOrder[a.status] - statusOrder[b.status];
      if (diff !== 0) return diff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleCreate = async (data: {
    title: string;
    description: string;
    category: GoalDTO["category"];
    targetDate?: string;
    milestones: { title: string }[];
  }) => {
    try {
      await createGoal(data);
      toast.success("Goal created!");
      setShowCreate(false);
      refetch();
    } catch {
      toast.error("Failed to create goal.");
    }
  };

  const handleToggleMilestone = async (goalId: string, msId: string) => {
    try {
      await toggleMs(goalId, msId);
      refetch();
    } catch {
      toast.error("Failed to update milestone.");
    }
  };

  const handlePauseResume = async (goalId: string, current: string) => {
    const newStatus = current === "paused" ? "active" : current === "completed" ? "active" : "paused";
    try {
      await updateGoal(goalId, { status: newStatus as GoalDTO["status"] });
      toast.success(newStatus === "active" ? "Goal resumed!" : "Goal paused.");
      refetch();
    } catch {
      toast.error("Failed to update goal.");
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Delete this goal and all its milestones?")) return;
    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted.");
      refetch();
    } catch {
      toast.error("Failed to delete goal.");
    }
  };

  const handleAddMilestone = async (goalId: string, title: string) => {
    try {
      await addMilestone(goalId, { title });
      toast.success("Milestone added!");
      setShowAddMs(null);
      refetch();
    } catch {
      toast.error("Failed to add milestone.");
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ background: C.shell, minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4"
        style={{ background: C.shell }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Go back"
          >
            <ChevronLeft size={20} color={C.textOnDark} />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: C.textOnDark }}>
              Goals & Milestones
            </h1>
            <p style={{ fontSize: T.bodySm, color: C.textOnDarkSub, marginTop: 2 }}>
              Track your care plan progress
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              background: C.primary,
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 16px ${C.primaryGlow}`,
            }}
            aria-label="Create new goal"
          >
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="px-4 pb-24"
        style={{ background: C.bg, borderRadius: "24px 24px 0 0", minHeight: "calc(100vh - 120px)" }}
      >
        {/* Summary */}
        {goals && goals.length > 0 && (
          <div className="pt-5 mb-4">
            <GoalsSummary goals={goals} />
          </div>
        )}

        {/* Filter */}
        <div className="mb-4 pt-1">
          <FilterBar active={filter} onChange={setFilter} />
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{
              background: C.alertLight,
              border: `1px solid ${C.alertBorder}`,
              color: C.alertText,
              fontSize: T.bodySm,
            }}
            role="alert"
          >
            Error loading goals: {error}
          </div>
        )}

        {/* Goals list */}
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} filtered={filter !== "all"} />
        ) : (
          <div className="flex flex-col gap-3 pb-4" role="list" aria-label="Care plan goals">
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleMilestone={handleToggleMilestone}
                onPauseResume={handlePauseResume}
                onDelete={handleDelete}
                onAddMilestone={(gid) => setShowAddMs(gid)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          loading={creating}
        />
      )}
      {showAddMs && (
        <AddMilestoneModal
          goalId={showAddMs}
          onClose={() => setShowAddMs(null)}
          onAdd={handleAddMilestone}
          loading={addingMs}
        />
      )}
    </div>
  );
}