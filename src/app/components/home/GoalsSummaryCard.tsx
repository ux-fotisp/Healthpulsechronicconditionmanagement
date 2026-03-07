/**
 * HealthPulse · Goals Summary Card (Home Dashboard)
 * ══════════════════════════════════════════════════════
 * Compact card showing active goals with progress.
 * Taps through to /goals for full tracker.
 *
 * WCAG 2.1 AA · 56px touch targets · Muted Healing Palette
 */

import { Target, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useGoals } from "../../hooks/useHealthData";
import { C, T, L } from "../../design/tokens";

export function GoalsSummaryCard() {
  const navigate = useNavigate();
  const { data: goals, loading } = useGoals();

  if (loading || !goals) return null;

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const totalMs = goals.reduce((s, g) => s + g.totalMilestones, 0);
  const completedMs = goals.reduce((s, g) => s + g.completedMilestones, 0);
  const overallProgress = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  // Show nothing if no goals exist — let user discover via nav
  if (goals.length === 0) {
    return (
      <button
        onClick={() => navigate("/goals")}
        className="w-full rounded-2xl flex items-center gap-3 transition-all duration-200"
        style={{
          padding: "16px 20px",
          background: C.frostedBg,
          backdropFilter: C.frostedBlur,
          border: `1px dashed ${C.primaryBorder}`,
          cursor: "pointer",
          minHeight: L.touch,
          textAlign: "left",
        }}
        aria-label="Set your first care plan goal"
      >
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: C.primaryLight,
            border: `1px solid ${C.primaryBorder}`,
          }}
        >
          <Target size={18} color={C.primary} />
        </div>
        <div className="flex-1">
          <span style={{ fontSize: T.bodyMd, fontWeight: 600, color: C.text }}>
            Set Care Plan Goals
          </span>
          <span style={{ fontSize: T.bodySm, color: C.textSub, display: "block", marginTop: 2 }}>
            Track milestones and celebrate progress
          </span>
        </div>
        <ChevronRight size={18} color={C.textMuted} />
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/goals")}
      className="w-full rounded-2xl transition-all duration-200"
      style={{
        padding: "16px 20px",
        background: C.cardBg,
        border: `1px solid ${C.primaryBorder}`,
        cursor: "pointer",
        textAlign: "left",
      }}
      aria-label={`Goals: ${active.length} active, ${completed.length} completed. Tap to view all.`}
    >
      <div className="flex items-center gap-3">
        {/* Mini progress ring */}
        <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
          <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
            <circle
              cx={24} cy={24} r={20}
              fill="none" stroke={C.borderLight} strokeWidth={4}
            />
            <circle
              cx={24} cy={24} r={20}
              fill="none" stroke={C.primary} strokeWidth={4}
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={(2 * Math.PI * 20) * (1 - overallProgress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {overallProgress === 100 ? (
              <Trophy size={16} color={C.successDark} />
            ) : (
              <span style={{ fontSize: T.micro, fontWeight: 700, color: C.text }}>
                {overallProgress}%
              </span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Target size={14} color={C.primary} />
            <span style={{ fontSize: T.bodyMd, fontWeight: 700, color: C.cardText }}>
              Care Plan Goals
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1" style={{ fontSize: T.bodySm }}>
            <span style={{ color: C.primary, fontWeight: 600 }}>
              {active.length} active
            </span>
            {completed.length > 0 && (
              <span className="flex items-center gap-1" style={{ color: C.successDark, fontWeight: 600 }}>
                <Sparkles size={11} />
                {completed.length} done
              </span>
            )}
            <span style={{ color: C.cardTextSub }}>
              {completedMs}/{totalMs} steps
            </span>
          </div>
        </div>

        <ChevronRight size={18} color={C.cardTextFaint} />
      </div>

      {/* Active goal previews (top 2) */}
      {active.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {active.slice(0, 2).map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: C.primaryLight,
                border: `1px solid ${C.primaryBorder}`,
              }}
            >
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  width: 6,
                  height: 6,
                  background: C.primary,
                }}
              />
              <span
                className="flex-1 truncate"
                style={{ fontSize: T.bodySm, fontWeight: 500, color: C.cardText }}
              >
                {g.title}
              </span>
              <span style={{ fontSize: T.micro, fontWeight: 700, color: C.primary }}>
                {g.progress}%
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
