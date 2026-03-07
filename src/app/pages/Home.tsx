import React, { useState } from "react";
import { C, T } from "../design/tokens";
import { PatientHeader } from "../components/home/PatientHeader";
import { ActiveStateCard } from "../components/home/ActiveStateCard";
import { MedicationsDueCard } from "../components/home/MedicationsDueCard";
import { LatestVitalCard } from "../components/home/LatestVitalCard";
import { TodaysSummary } from "../components/home/TodaysSummary";
import { RecentActivity } from "../components/home/RecentActivity";
import { RemindersSection } from "../components/home/RemindersSection";
import { type Reminder } from "../components/home/RemindersSection";
import { CorrelationInsightCard } from "../components/home/CorrelationInsightCard";
import { AdherenceStreakCard } from "../components/home/AdherenceStreakCard";
import { DailyCheckIn } from "../components/checkins/DailyCheckIn";
import { EmotionalCheckIn } from "../components/checkins/EmotionalCheckIn";
import { RoutineReminder } from "../components/smart-dose/RoutineReminder";
import { MissedDoseRecovery } from "../components/smart-dose/MissedDoseRecovery";
import { CheckInSparkline } from "../components/home/CheckInSparkline";
import { CarePlanScoreCard } from "../components/home/CarePlanScoreCard";
import { GoalsSummaryCard } from "../components/home/GoalsSummaryCard";
import { DashboardMonitor } from "../components/home/DashboardMonitor";
import { DashboardProvider, useDashboardContext } from "../hooks/DashboardContext";
import { IllnessStageProvider, useIllnessStage, type IllnessStage } from "../hooks/IllnessStageContext";
import { DashboardSkeleton } from "../components/shared/LoadingSkeleton";
import { SectionBanner } from "../components/shared/SectionBanner";
import {
  GraduationCap,
  TrendingUp,
  Activity,
} from "lucide-react";

/**
 * HealthPulse · Home Dashboard
 * Background: #4A4D4C shell, card surfaces #FBFBFB (Soft Alabaster)
 * Wraps all children in DashboardProvider (single API call) and
 * IllnessStageProvider (adaptive section priority based on glucose TIR).
 *
 * Sprint 9 additions:
 *   - IllnessStageProvider wraps HomeContent
 *   - Adaptive section ordering based on illnessStage (learning/stabilizing/stable)
 *   - Contextual stage banner below PatientHeader
 *   - DashboardMonitor default tab driven by illnessStage
 */
export function Home() {
  return (
    <DashboardProvider>
      <IllnessStageProvider>
        <HomeContent />
      </IllnessStageProvider>
    </DashboardProvider>
  );
}

// ── Stage banner config ────────────────────────────────────────────────────────
const STAGE_BANNER: Record<
  IllnessStage,
  {
    icon: React.ReactNode;
    title: string;
    desc: string;
    bg: string;
    color: string;
    border: string;
  } | null
> = {
  learning: {
    icon: <GraduationCap size={14} color={C.blueDark} />,
    title: "Learning Your Patterns",
    desc: "The more readings you log, the better your insights become.",
    bg: C.blueLight,
    color: C.blueDark,
    border: C.blueBorder,
  },
  stabilizing: {
    icon: <TrendingUp size={14} color={C.alertText} />,
    title: "Trending Upward",
    desc: "Your glucose is stabilizing — keep up the momentum.",
    bg: C.alertLight,
    color: C.alertText,
    border: C.alertBorder,
  },
  stable: null, // No banner in stable — the user is doing well, celebrate silently
};

// ── Adaptive section order ─────────────────────────────────────────────────────
// Each entry is a unique section key. The shared sections (recentActivity,
// reminders, sparkline) always appear at the bottom in fixed order.
type SectionKey =
  | "checkin"
  | "activeState"
  | "monitor"
  | "medsDue"
  | "insight"
  | "streak"
  | "carePlan"
  | "goals"
  | "latestVital";

const STAGE_ORDER: Record<IllnessStage, SectionKey[]> = {
  // learning: watch vitals closely, encourage logging, education first
  learning: [
    "checkin",
    "monitor",      // → defaults to vitals tab (DashboardMonitor reads stage)
    "latestVital",
    "medsDue",
    "activeState",
    "insight",
    "streak",
    "carePlan",
    "goals",
  ],
  // stabilizing: adherence + correlation key, goals on the horizon
  stabilizing: [
    "checkin",
    "activeState",
    "monitor",      // → defaults to vitals tab
    "medsDue",
    "insight",
    "streak",
    "latestVital",
    "carePlan",
    "goals",
  ],
  // stable: achievement & long-term orientation
  stable: [
    "checkin",
    "activeState",
    "carePlan",
    "goals",
    "monitor",      // → defaults to medications tab
    "streak",
    "insight",
    "medsDue",
    "latestVital",
  ],
};

function HomeContent() {
  const { loading, error, data } = useDashboardContext();
  const { illnessStage, stageLoading } = useIllnessStage();

  // ── Sprint 5 modal states ─────────────────────────────────────────────────
  const [showRoutineReminder,  setShowRoutineReminder]  = useState(false);
  const [showMissedRecovery,   setShowMissedRecovery]   = useState(false);
  const [showEmotionalCheckIn, setShowEmotionalCheckIn] = useState(false);
  const [emotionalTrigger, setEmotionalTrigger] = useState({ type: "", detail: "" });

  // Sprint 6: Track which overdue reminder was tapped
  const [overdueReminder, setOverdueReminder] = useState<Reminder | null>(null);

  // Identify a medication for the demo routine reminder
  const demoMed = data?.medications?.find(m => m.status === "active");

  // Check for abnormal vitals to potentially trigger emotional check-in
  const latestObs = data?.observations?.length
    ? [...data.observations].sort((a, b) =>
        new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime()
      )[0]
    : null;
  const hasAbnormalReading = latestObs && (latestObs.status === "warning" || latestObs.status === "critical");

  function handleRoutineMissed() {
    setShowRoutineReminder(false);
    setOverdueReminder(null);
    setShowMissedRecovery(true);
  }

  function handleMissedRecoveryEmotional() {
    setShowMissedRecovery(false);
    setEmotionalTrigger({
      type:   "missed_dose",
      detail: `Missed ${demoMed?.name ?? "medication"} ${demoMed?.dosage ?? ""}`,
    });
    setShowEmotionalCheckIn(true);
  }

  /** Sprint 6: Handler for overdue reminder tap → opens RoutineReminder */
  function handleOverdueReminderClick(reminder: Reminder) {
    setOverdueReminder(reminder);
    setShowRoutineReminder(true);
  }

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div style={{ background: C.shell, minHeight: "100vh" }} className="flex items-center justify-center p-8">
      <p style={{ color: C.terracotta, fontSize: 16, fontFamily: "inherit", textAlign: "center" }}>
        Unable to load dashboard. Please try again.
      </p>
    </div>
  );

  // ── Section map ─────────────────────────────────────────────────────────────
  const sectionMap: Record<SectionKey, React.ReactNode> = {
    checkin: (
      <section key="checkin" aria-labelledby="checkin-heading">
        <p id="checkin-heading" className="sr-only">Daily health check-in</p>
        <DailyCheckIn />
      </section>
    ),
    activeState: (
      <section key="activeState" aria-labelledby="active-state-heading">
        <p id="active-state-heading" className="sr-only">Active state: next priority action</p>
        <ActiveStateCard />
      </section>
    ),
    monitor: (
      <section key="monitor" aria-labelledby="monitor-heading">
        <p id="monitor-heading" className="sr-only">Care dashboard monitor: medications, vitals, and upcoming examinations</p>
        <DashboardMonitor />
      </section>
    ),
    medsDue: (
      <section key="medsDue" aria-labelledby="meds-due-heading">
        <p id="meds-due-heading" className="sr-only">Medications due today with intake guidance</p>
        <MedicationsDueCard />
      </section>
    ),
    insight: (
      <section key="insight" aria-labelledby="insight-heading">
        <p id="insight-heading" className="sr-only">Correlation insights: medication timing and wellness</p>
        <CorrelationInsightCard />
      </section>
    ),
    streak: (
      <section key="streak" aria-labelledby="adherence-heading">
        <p id="adherence-heading" className="sr-only">Medication adherence streaks and history</p>
        <AdherenceStreakCard />
      </section>
    ),
    carePlan: (
      <section key="carePlan" aria-labelledby="care-score-heading" className="px-4">
        <p id="care-score-heading" className="sr-only">Care plan composite health score</p>
        <CarePlanScoreCard />
      </section>
    ),
    goals: (
      <section key="goals" aria-labelledby="goals-heading" className="px-4">
        <p id="goals-heading" className="sr-only">Care plan goals and milestones progress</p>
        <GoalsSummaryCard />
      </section>
    ),
    latestVital: (
      <section key="latestVital" aria-labelledby="latest-vital-heading">
        <p id="latest-vital-heading" className="sr-only">Latest vital reading</p>
        <LatestVitalCard />
      </section>
    ),
  };

  // Ordered sections based on illness stage (fall back to stabilizing order while loading)
  const effectiveStage: IllnessStage = stageLoading ? "stabilizing" : illnessStage;
  const orderedSections = STAGE_ORDER[effectiveStage].map(key => sectionMap[key]);

  // Stage banner (null for "stable")
  const banner = STAGE_BANNER[effectiveStage];

  return (
    <div
      style={{ background: C.shell, minHeight: "100vh" }}
      aria-label="Home – My Wellbeing Dashboard"
    >
      <PatientHeader />

      <div className="flex flex-col gap-4 py-4">

        {/* ── Illness-stage contextual banner (learning & stabilizing only) ── */}
        {!stageLoading && banner && (
          <section aria-live="polite" aria-label={`Care stage: ${effectiveStage}`}>
            <SectionBanner
              color={banner.color}
              bg={banner.bg}
              border={banner.border}
              icon={banner.icon}
              title={banner.title}
              desc={banner.desc}
              className="mx-4"
              ariaLabel={`Care stage: ${effectiveStage}`}
            />
          </section>
        )}

        {/* ── Adaptive section order (driven by illnessStage) ────────────── */}
        {orderedSections}

        {/* ── Emotional check-in prompt (abnormal reading — fixed position) ── */}
        {hasAbnormalReading && !showEmotionalCheckIn && (
          <section aria-labelledby="emotional-prompt-heading">
            <p id="emotional-prompt-heading" className="sr-only">Emotional check-in prompt</p>
            <div
              className="mx-4 rounded-2xl overflow-hidden"
              style={{
                background: C.bg,
                border:     `1px solid ${C.roseBorder}`,
                boxShadow:  "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ borderBottom: `1px solid ${C.roseBorder}`, background: C.roseLight }}
              >
                <span style={{ fontSize: 14 }} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.rose} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </span>
                <span style={{ color: C.rose, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                  HOW ARE YOU FEELING?
                </span>
              </div>
              <div className="px-5 py-4">
                <p style={{ color: C.text, fontSize: 14, fontWeight: 600, fontFamily: "inherit", lineHeight: 1.4 }}>
                  Your last reading was{" "}
                  <strong style={{ color: latestObs.status === "critical" ? C.alertText : C.alert }}>
                    {latestObs.status === "critical" ? "critical" : "unusual"}
                  </strong>
                  . Take a moment to check in with yourself.
                </p>
                <button
                  onClick={() => {
                    setEmotionalTrigger({
                      type:   "abnormal_reading",
                      detail: `${latestObs.type} ${latestObs.value} ${latestObs.unit} — ${latestObs.status}`,
                    });
                    setShowEmotionalCheckIn(true);
                  }}
                  className="w-full mt-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: C.roseLight,
                    border:     `1.5px solid ${C.roseBorder}`,
                    color:      C.rose,
                    fontSize:   14,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    minHeight:  56,
                    cursor:     "pointer",
                  }}
                  aria-label="Start emotional check-in after abnormal reading"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Check In With Myself
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Fixed tail sections (order invariant) ──────────────────────── */}
        <section aria-labelledby="summary-heading">
          <p id="summary-heading" className="sr-only">Today's health summary</p>
          <TodaysSummary />
        </section>

        <section aria-labelledby="reminders-heading">
          <p id="reminders-heading" className="sr-only">Health reminders</p>
          <RemindersSection
            onOverdueClick={handleOverdueReminderClick}
          />
        </section>

        {/* Sprint 6: 7-Day Check-In Sparkline */}
        <section aria-labelledby="sparkline-heading">
          <p id="sparkline-heading" className="sr-only">7-day wellness trends</p>
          <CheckInSparkline />
        </section>

        <section aria-labelledby="activity-heading">
          <p id="activity-heading" className="sr-only">Recent activity timeline</p>
          <RecentActivity />
        </section>
      </div>

      {/* ── Sprint 5/6 Modals ──────────────────────────────────────────────── */}
      {showRoutineReminder && (
        <RoutineReminder
          medicationName={overdueReminder?.medicationName ?? demoMed?.name ?? "Medication"}
          dosage={overdueReminder?.medicationDosage ?? demoMed?.dosage ?? ""}
          instruction={overdueReminder?.medicationInstruction ?? demoMed?.quickInstruction ?? ""}
          routineAnchor="breakfast"
          onLogDose={() => {}}
          onMissed={handleRoutineMissed}
          onClose={() => {
            setShowRoutineReminder(false);
            setOverdueReminder(null);
          }}
        />
      )}

      {showMissedRecovery && (
        <MissedDoseRecovery
          medicationId={demoMed?.id ?? "M001"}
          medicationName={overdueReminder?.medicationName ?? demoMed?.name ?? "Medication"}
          dosage={overdueReminder?.medicationDosage ?? demoMed?.dosage ?? ""}
          scheduledTime="8:00 AM"
          onClose={() => {
            setShowMissedRecovery(false);
            setOverdueReminder(null);
          }}
          onEmotionalCheckIn={handleMissedRecoveryEmotional}
        />
      )}

      {showEmotionalCheckIn && (
        <EmotionalCheckIn
          triggerType={emotionalTrigger.type}
          triggerDetail={emotionalTrigger.detail}
          onClose={() => setShowEmotionalCheckIn(false)}
        />
      )}
    </div>
  );
}