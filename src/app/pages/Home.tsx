import { PatientHeader } from "../components/home/PatientHeader";
import { ActiveStateCard } from "../components/home/ActiveStateCard";
import { MedicationsDueCard } from "../components/home/MedicationsDueCard";
import { LatestVitalCard } from "../components/home/LatestVitalCard";
import { TodaysSummary } from "../components/home/TodaysSummary";
import { RecentActivity } from "../components/home/RecentActivity";
import { RemindersSection } from "../components/home/RemindersSection";
import { CorrelationInsightCard } from "../components/home/CorrelationInsightCard";
import { AdherenceStreakCard } from "../components/home/AdherenceStreakCard";
import { C } from "../design/tokens";
import { DashboardProvider, useDashboardContext } from "../hooks/DashboardContext";
import { DashboardSkeleton } from "../components/shared/LoadingSkeleton";

/**
 * HealthPulse · Home Dashboard
 * Background: #111820 shell, card surfaces #FBFBFB (Soft Alabaster)
 * Wraps all children in DashboardProvider for single API call.
 */
export function Home() {
  return (
    <DashboardProvider>
      <HomeContent />
    </DashboardProvider>
  );
}

function HomeContent() {
  const { loading, error } = useDashboardContext();

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

        <section aria-labelledby="summary-heading">
          <p id="summary-heading" className="sr-only">Today's health summary</p>
          <TodaysSummary />
        </section>

        <section aria-labelledby="reminders-heading">
          <p id="reminders-heading" className="sr-only">Health reminders</p>
          <RemindersSection />
        </section>

        <section aria-labelledby="activity-heading">
          <p id="activity-heading" className="sr-only">Recent activity timeline</p>
          <RecentActivity />
        </section>
      </div>
    </div>
  );
}