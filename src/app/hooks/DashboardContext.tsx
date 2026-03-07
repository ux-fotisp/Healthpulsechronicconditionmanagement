/**
 * HealthPulse · DashboardContext
 * ═══════════════════════════════════════════════════════════════════════════════
 * Single API call (getDashboard) provides all data to all home page components.
 * Hydrates DTO date strings → Date objects.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import * as api from "../data/api";
import {
  hydrateMedications,
  hydrateMedLogs,
  hydrateObservations,
  hydrateTasks,
  hydrateAppointments,
  hydrateMissedDoses,
  type Medication,
  type MedicationLog,
  type Observation,
  type Task,
  type Appointment,
  type Patient,
  type MissedDoseSummary,
  type CorrelationInsight,
  type AdherenceStreak,
  type MedicationAdherence,
} from "../data/helpers";

export interface DashboardData {
  patient: Patient;
  medications: Medication[];
  medicationLogs: MedicationLog[];
  observations: Observation[];
  tasks: Task[];
  appointments: Appointment[];
  adherenceStats: MedicationAdherence[];
  streaks: AdherenceStreak[];
  insights: CorrelationInsight[];
  missedDoses: MissedDoseSummary[];
}

interface DashboardContextValue {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DashboardCtx = createContext<DashboardContextValue>({
  data: null,
  loading: true,
  error: null,
  refetch: () => {},
});

// Ensure seed runs once globally
let seedPromise: Promise<void> | null = null;
function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = api.seed().then(() => {}).catch(() => {});
  }
  return seedPromise;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureSeeded();
      const dto = await api.getDashboard();
      setData({
        patient: dto.patient,
        medications: hydrateMedications(dto.medications),
        medicationLogs: hydrateMedLogs(dto.medicationLogs),
        observations: hydrateObservations(dto.observations),
        tasks: hydrateTasks(dto.tasks),
        appointments: hydrateAppointments(dto.appointments),
        adherenceStats: dto.adherenceStats,
        streaks: dto.streaks,
        insights: dto.insights,
        missedDoses: hydrateMissedDoses(dto.missedDoses),
      });
    } catch (e: any) {
      console.error("[DashboardContext] Fetch failed:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <DashboardCtx.Provider value={{ data, loading, error, refetch: fetchDashboard }}>
      {children}
    </DashboardCtx.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  return useContext(DashboardCtx);
}
