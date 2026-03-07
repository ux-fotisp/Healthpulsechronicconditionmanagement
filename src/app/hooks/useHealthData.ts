/**
 * HealthPulse · Data Hooks
 * ═══════════════════════════════════════════════════════════════════════════════
 * React hooks for all ORCA entities. Each hook:
 *   1. Triggers auto-seed on first load
 *   2. Fetches data from the KV-backed API
 *   3. Returns { data, loading, error, refetch }
 *   4. Converts ISO date strings → Date objects where needed
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../data/api";

// ── Generic fetch hook ───────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useQuery<T>(fetcher: () => Promise<T>): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Auto-seed on first call if not done
      if (!seeded.current) {
        seeded.current = true;
        try {
          await api.seed();
        } catch {
          // Seed may fail if already seeded — that's fine
        }
      }
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      console.error("[useQuery]", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ── Global seed state (shared across hooks) ──────────────────────────────────
let globalSeedPromise: Promise<void> | null = null;

async function ensureSeeded() {
  if (!globalSeedPromise) {
    globalSeedPromise = api.seed().then(() => {}).catch(() => {});
  }
  return globalSeedPromise;
}

function useSeededQuery<T>(fetcher: () => Promise<T>): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableFetcher = useCallback(fetcher, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureSeeded();
      const result = await stableFetcher();
      setData(result);
    } catch (e: any) {
      console.error("[useSeededQuery]", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [stableFetcher]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ENTITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Full dashboard data — single request, all entities */
export function useDashboard() {
  return useSeededQuery(() => api.getDashboard());
}

/** Patient record */
export function usePatient(id?: string) {
  return useSeededQuery(() => api.getPatient(id));
}

/** All medications */
export function useMedications() {
  return useSeededQuery(() => api.getMedications());
}

/** Single medication */
export function useMedication(medId: string) {
  return useSeededQuery(() => api.getMedication(medId));
}

/** Medication logs */
export function useMedicationLogs() {
  return useSeededQuery(() => api.getMedicationLogs());
}

/** Medication refills */
export function useRefills() {
  return useSeededQuery(() => api.getRefills());
}

/** Single refill */
export function useRefill(medId: string) {
  return useSeededQuery(() => api.getRefill(medId));
}

/** 30-day adherence stats */
export function useAdherence() {
  return useSeededQuery(() => api.getAdherence());
}

/** Adherence streaks */
export function useStreaks() {
  return useSeededQuery(() => api.getStreaks());
}

/** Correlation insights */
export function useInsights() {
  return useSeededQuery(() => api.getInsights());
}

/** Missed dose summaries */
export function useMissedDoses() {
  return useSeededQuery(() => api.getMissedDoses());
}

/** All observations */
export function useObservations() {
  return useSeededQuery(() => api.getObservations());
}

/** Observation trends */
export function useObservationTrends() {
  return useSeededQuery(() => api.getObservationTrends());
}

/** Single observation trend by type */
export function useObservationTrend(type: string) {
  const fetcher = useCallback(() => api.getObservationTrend(type), [type]);
  return useSeededQuery(fetcher);
}

/** All tasks */
export function useTasks() {
  return useSeededQuery(() => api.getTasks());
}

/** All appointments */
export function useAppointments() {
  return useSeededQuery(() => api.getAppointments());
}

/** Single appointment */
export function useAppointment(apptId: string) {
  const fetcher = useCallback(() => api.getAppointment(apptId), [apptId]);
  return useSeededQuery(fetcher);
}

/** Appointment prep checklist */
export function useAppointmentPrep(apptId: string) {
  const fetcher = useCallback(() => api.getAppointmentPrep(apptId), [apptId]);
  return useSeededQuery(fetcher);
}

/** All lab results */
export function useLabs() {
  return useSeededQuery(() => api.getLabs());
}

/** Single lab result */
export function useLab(labId: string) {
  const fetcher = useCallback(() => api.getLab(labId), [labId]);
  return useSeededQuery(fetcher);
}

/** Lab interpretation */
export function useLabInterpretation(labId: string) {
  const fetcher = useCallback(() => api.getLabInterpretation(labId), [labId]);
  return useSeededQuery(fetcher);
}

/** Health profile (onboarding) */
export function useHealthProfile() {
  return useSeededQuery(() => api.getHealthProfile());
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Toggle task completion */
export function useToggleTask() {
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async (taskId: string, currentStatus: string) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const completedAt = newStatus === "completed" ? new Date().toISOString() : null;
      await api.updateTask(taskId, { status: newStatus as any, completedAt });
      return { status: newStatus, completedAt };
    } catch (e: any) {
      console.error("[useToggleTask]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { toggle, loading };
}

/** Log a medication dose (taken or missed) */
export function useLogDose() {
  const [loading, setLoading] = useState(false);

  const logDose = useCallback(async (
    medicationId: string,
    medicationName: string,
    status: "taken" | "missed",
    notes = "",
  ) => {
    setLoading(true);
    try {
      const result = await api.createMedicationLog({
        medicationId,
        medicationName,
        timestamp: new Date().toISOString(),
        status,
        notes,
      });
      return result;
    } catch (e: any) {
      console.error("[useLogDose]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logDose, loading };
}

/** Log a new observation */
export function useLogObservation() {
  const [loading, setLoading] = useState(false);

  const logObservation = useCallback(async (
    type: string,
    value: string,
    unit: string,
    status: "normal" | "warning" | "critical",
    loincCode = "",
  ) => {
    setLoading(true);
    try {
      const result = await api.createObservation({
        type,
        loincCode,
        value,
        unit,
        effectiveDateTime: new Date().toISOString(),
        status,
      });
      return result;
    } catch (e: any) {
      console.error("[useLogObservation]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logObservation, loading };
}

/** Toggle appointment prep item */
export function useTogglePrepItem() {
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async (apptId: string, itemId: string) => {
    setLoading(true);
    try {
      const result = await api.togglePrepItem(apptId, itemId);
      return result;
    } catch (e: any) {
      console.error("[useTogglePrepItem]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { toggle, loading };
}

/** Save health profile (onboarding) */
export function useSaveHealthProfile() {
  const [loading, setLoading] = useState(false);

  const save = useCallback(async (data: Omit<api.HealthProfileDTO, "patientId" | "savedAt">) => {
    setLoading(true);
    try {
      const result = await api.saveHealthProfile(data);
      return result;
    } catch (e: any) {
      console.error("[useSaveHealthProfile]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { save, loading };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BP & GLUCOSE HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** All blood pressure readings */
export function useBPReadings() {
  return useSeededQuery(() => api.getBPReadings());
}

/** Log a new BP reading */
export function useLogBPReading() {
  const [loading, setLoading] = useState(false);

  const logReading = useCallback(async (data: Omit<api.BPReadingDTO, "id" | "patientId">) => {
    setLoading(true);
    try {
      const result = await api.createBPReading(data);
      return result;
    } catch (e: any) {
      console.error("[useLogBPReading]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logReading, loading };
}

/** All glucose entries */
export function useGlucoseEntries() {
  return useSeededQuery(() => api.getGlucoseEntries());
}

/** Log a new glucose entry */
export function useLogGlucoseEntry() {
  const [loading, setLoading] = useState(false);

  const logEntry = useCallback(async (data: Omit<api.GlucoseEntryDTO, "id" | "patientId">) => {
    setLoading(true);
    try {
      const result = await api.createGlucoseEntry(data);
      return result;
    } catch (e: any) {
      console.error("[useLogGlucoseEntry]", e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logEntry, loading };
}