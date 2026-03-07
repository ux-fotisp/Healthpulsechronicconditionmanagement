import { useState } from "react";
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
import { C } from "../design/tokens";
import { DashboardProvider, useDashboardContext } from "../hooks/DashboardContext";
import { DashboardSkeleton } from "../components/shared/LoadingSkeleton";

/**
 * HealthPulse · Home Dashboard
 * Background: #111820 shell, card surfaces #FBFBFB (Soft Alabaster)
 * Wraps all children in DashboardProvider for single API call.
 *
 * Sprint 5 additions:
 *   - DailyCheckIn card (condition-specific)
 *   - RoutineReminder modal (routine-anchored Smart Dose V2)
 *   - MissedDoseRecovery modal (guided missed-dose flow)
 *   - EmotionalCheckIn modal (triggered by abnormal readings or missed doses)
 */
export function Home() {
  return (
    <DashboardProvider>
      <HomeContent />
    </DashboardProvider>
  );
}

function HomeContent() {
  const { loading, error, data } = useDashboardContext();

  // ── Sprint 5 modal states ────────────────────────────────────────────
  const [showRoutineReminder, setShowRoutineReminder] = useState(false);
  const [showMissedRecovery, setShowMissedRecovery]   = useState(false);
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
      <p style={{ color: "#D9A596", fontSize: 16, fontFamily: "inherit", textAlign: "center" }}>
        Unable to load dashboard. Please try again.
      </p>
    </div>
  );

  return (
    <div
      style={{ background: C.shell, minHeight: "100vh" }}
      aria-label="Home – My Wellbeing Dashboard"
    >
      <PatientHeader />

      <div className="flex flex-col gap-4 py-4">
        {/* Sprint 5: Daily Check-In (condition-specific) */}
        <section aria-labelledby="checkin-heading">
          <p id="checkin-heading" className="sr-only">Daily health check-in</p>
          <DailyCheckIn />
        </section>

        <section aria-labelledby="active-state-heading">
          <p id="active-state-heading" className="sr-only">Active state: next priority action</p>
          <ActiveStateCard />
        </section>

        <section aria-labelledby="meds-due-heading">
          <p id="meds-due-heading" className="sr-only">Medications due today with intake guidance</p>
          <MedicationsDueCard />
        </section>

        {/* Correlation Insight Engine (US1) — between meds and vitals */}
        <section aria-labelledby="insight-heading">
          <p id="insight-heading" className="sr-only">Correlation insights: medication timing and wellness</p>
          <CorrelationInsightCard />
        </section>

        {/* Sprint 2: Medication Adherence Streak Tracker */}
        <section aria-labelledby="adherence-heading">
          <p id="adherence-heading" className="sr-only">Medication adherence streaks and history</p>
          <AdherenceStreakCard />
        </section>

        <section aria-labelledby="latest-vital-heading">
          <p id="latest-vital-heading" className="sr-only">Latest vital reading</p>
          <LatestVitalCard />
        </section>

        {/* Sprint 5: Emotional check-in prompt for abnormal readings */}
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

      {/* ── Sprint 5/6 Modals ───────────────────────────────────────────── */}
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