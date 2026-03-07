/**
 * HealthPulse · Pure Derived Helpers
 * ═══════════════════════════════════════════════════════════════════════════════
 * All functions that were data-dependent in mockData.ts are replicated here
 * as pure functions that accept API data as parameters.
 * Date strings from the API are parsed to Date objects.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  MedicationDTO,
  MedicationLogDTO,
  ObservationDTO,
  TaskDTO,
  AppointmentDTO,
  ObservationTrendDTO,
  AdherenceDTO,
  InsightDTO,
  MissedDoseDTO,
  StreakDTO,
  RefillDTO,
} from "./api";

// ── Date parsing ─────────────────────────────────────────────────────────────
export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(s);
}

export function parseDateRequired(s: string): Date {
  return new Date(s);
}

// ── MOCK_NOW — fixed to match seed data ──────────────────────────────────────
export const MOCK_NOW = new Date(2026, 2, 2, 9, 45, 0);

// ── Hydrated domain types (Date objects instead of strings) ──────────────────
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  status: "active" | "inactive";
  nextDoseTime: Date | null;
  color: string;
  shape: "round" | "oval" | "capsule" | "oblong";
  quickInstruction: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  timestamp: Date;
  status: "taken" | "missed";
  notes: string;
}

export interface Observation {
  id: string;
  type: string;
  loincCode: string;
  value: string;
  unit: string;
  subjectId: string;
  effectiveDateTime: Date;
  status: "normal" | "warning" | "critical";
}

export interface Task {
  id: string;
  description: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  completedAt: Date | null;
}

export interface Appointment {
  id: string;
  start: Date;
  duration: number;
  modality: "Video" | "In-Person" | "Phone";
  status: "scheduled" | "cancelled" | "completed";
  provider: string;
  type: string;
}

export interface ObservationTrend {
  type: string;
  unit: string;
  data: { date: Date; value: number; status: "normal" | "warning" | "critical" }[];
}

export interface MedicationRefill {
  medicationId: string;
  pillsRemaining: number;
  totalPills: number;
  refillDueDate: Date;
  lastRefillDate: Date;
  prescribingDoctor: string;
  prescriptionDate: Date;
  orientation: string;
  prescriptionNumber: string;
  pharmacy: string;
  refillHistory: { date: Date; quantity: number }[];
}

export interface MissedDoseSummary {
  id: string;
  medicationName: string;
  dosage: string;
  medColor: string;
  date: Date;
  scheduledTime: string;
  reason: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn: string;
  contactPhone: string;
  contactEmail: string;
  preferredLanguage: string;
  conditions: string[];
  careTeam: string;
}

// Re-export types that don't need date hydration
export type { AdherenceDTO as MedicationAdherence } from "./api";
export type { InsightDTO as CorrelationInsight } from "./api";
export type { StreakDTO as AdherenceStreak } from "./api";
export type { AppointmentPrepDTO as AppointmentPrep, PrepItemDTO as AppointmentPrepItem } from "./api";
export type { LabInterpretationDTO as LabInterpretation } from "./api";

// Lab results need date hydration
export interface LabResult {
  id: string;
  title: string;
  date: Date;
  provider: string;
  type: "blood_panel" | "urine" | "cardiac" | "imaging" | "other";
  status: "normal" | "abnormal" | "critical";
  pages: number;
  fileSize: string;
  highlights: { label: string; value: string; unit: string; status: "normal" | "warning" | "critical" }[];
}

// ── DTO → Domain hydration ───────────────────────────────────────────────────

export function hydrateMedication(dto: MedicationDTO): Medication {
  return { ...dto, nextDoseTime: parseDate(dto.nextDoseTime) };
}

export function hydrateMedications(dtos: MedicationDTO[]): Medication[] {
  return dtos.map(hydrateMedication);
}

export function hydrateMedLog(dto: MedicationLogDTO): MedicationLog {
  return { ...dto, timestamp: parseDateRequired(dto.timestamp) };
}

export function hydrateMedLogs(dtos: MedicationLogDTO[]): MedicationLog[] {
  return dtos.map(hydrateMedLog);
}

export function hydrateObservation(dto: ObservationDTO): Observation {
  return { ...dto, effectiveDateTime: parseDateRequired(dto.effectiveDateTime) };
}

export function hydrateObservations(dtos: ObservationDTO[]): Observation[] {
  return dtos.map(hydrateObservation);
}

export function hydrateTask(dto: TaskDTO): Task {
  return {
    ...dto,
    dueDate: parseDateRequired(dto.dueDate),
    completedAt: parseDate(dto.completedAt),
  };
}

export function hydrateTasks(dtos: TaskDTO[]): Task[] {
  return dtos.map(hydrateTask);
}

export function hydrateAppointment(dto: AppointmentDTO): Appointment {
  return { ...dto, start: parseDateRequired(dto.start) };
}

export function hydrateAppointments(dtos: AppointmentDTO[]): Appointment[] {
  return dtos.map(hydrateAppointment);
}

export function hydrateObservationTrend(dto: ObservationTrendDTO): ObservationTrend {
  return {
    ...dto,
    data: dto.data.map((d) => ({ ...d, date: parseDateRequired(d.date) })),
  };
}

export function hydrateObservationTrends(dtos: ObservationTrendDTO[]): ObservationTrend[] {
  return dtos.map(hydrateObservationTrend);
}

export function hydrateRefill(dto: RefillDTO): MedicationRefill {
  return {
    ...dto,
    refillDueDate: parseDateRequired(dto.refillDueDate),
    lastRefillDate: parseDateRequired(dto.lastRefillDate),
    prescriptionDate: parseDateRequired(dto.prescriptionDate),
    refillHistory: dto.refillHistory.map((h) => ({
      ...h,
      date: parseDateRequired(h.date),
    })),
  };
}

export function hydrateMissedDose(dto: MissedDoseDTO): MissedDoseSummary {
  return { ...dto, date: parseDateRequired(dto.date) };
}

export function hydrateMissedDoses(dtos: MissedDoseDTO[]): MissedDoseSummary[] {
  return dtos.map(hydrateMissedDose);
}

export function hydrateLabResult(dto: import("./api").LabResultDTO): LabResult {
  return { ...dto, date: parseDateRequired(dto.date) };
}

export function hydrateLabResults(dtos: import("./api").LabResultDTO[]): LabResult[] {
  return dtos.map(hydrateLabResult);
}

// ── Derived computations ─────────────────────────────────────────────────────

export function getPatientAge(patient: Patient): number {
  const birth = new Date(patient.birthDate);
  const ageDiff = MOCK_NOW.getTime() - birth.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

export function getMedicationsDueToday(
  medications: Medication[],
  medicationLogs: MedicationLog[],
): Medication[] {
  const todayStr = `${MOCK_NOW.getFullYear()}-${MOCK_NOW.getMonth()}-${MOCK_NOW.getDate()}`;
  const takenTodayIds = new Set(
    medicationLogs
      .filter((log) => {
        const d = log.timestamp;
        const logDay = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return logDay === todayStr && log.status === "taken";
      })
      .map((log) => log.medicationId),
  );
  return medications.filter(
    (m) => m.status === "active" && !takenTodayIds.has(m.id),
  );
}

export function getLatestObservation(observations: Observation[]): Observation | null {
  const sorted = [...observations].sort(
    (a, b) => b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime(),
  );
  return sorted[0] ?? null;
}

export type ActiveState =
  | { kind: "medication"; medication: Medication; minutesUntil: number }
  | { kind: "appointment"; appointment: Appointment; minutesUntil: number }
  | null;

export function getActiveState(
  medications: Medication[],
  appointments: Appointment[],
): ActiveState {
  const horizon = new Date(MOCK_NOW.getTime() + 12 * 60 * 60 * 1000);

  const nextMed = medications
    .filter(
      (m) =>
        m.status === "active" &&
        m.nextDoseTime !== null &&
        m.nextDoseTime > MOCK_NOW &&
        m.nextDoseTime <= horizon,
    )
    .sort((a, b) => a.nextDoseTime!.getTime() - b.nextDoseTime!.getTime())[0];

  const nextAppt = appointments
    .filter(
      (a) =>
        a.status === "scheduled" &&
        a.start > MOCK_NOW &&
        a.start <= horizon,
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  const medTime = nextMed?.nextDoseTime?.getTime() ?? Infinity;
  const apptTime = nextAppt?.start.getTime() ?? Infinity;

  if (medTime === Infinity && apptTime === Infinity) return null;

  if (medTime <= apptTime && nextMed) {
    return {
      kind: "medication",
      medication: nextMed,
      minutesUntil: Math.round((medTime - MOCK_NOW.getTime()) / 60000),
    };
  }
  if (nextAppt) {
    return {
      kind: "appointment",
      appointment: nextAppt,
      minutesUntil: Math.round((apptTime - MOCK_NOW.getTime()) / 60000),
    };
  }
  return null;
}

export type TimelineEntry =
  | { kind: "medication_log"; data: MedicationLog; time: Date }
  | { kind: "observation"; data: Observation; time: Date }
  | { kind: "task"; data: Task; time: Date }
  | { kind: "appointment"; data: Appointment; time: Date };

export function getTimelineEntries(
  medicationLogs: MedicationLog[],
  observations: Observation[],
  tasks: Task[],
  appointments: Appointment[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...medicationLogs.map((d) => ({
      kind: "medication_log" as const,
      data: d,
      time: d.timestamp,
    })),
    ...observations.map((d) => ({
      kind: "observation" as const,
      data: d,
      time: d.effectiveDateTime,
    })),
    ...tasks
      .filter((t) => t.status === "completed" && t.completedAt)
      .map((d) => ({
        kind: "task" as const,
        data: d,
        time: d.completedAt!,
      })),
    ...appointments
      .filter((a) => a.start <= MOCK_NOW)
      .map((d) => ({
        kind: "appointment" as const,
        data: d,
        time: d.start,
      })),
  ];
  return entries.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
}

export function getOverallAdherence(adherenceStats: AdherenceDTO[]): number {
  const total = adherenceStats.reduce((s, a) => s + a.scheduledCount, 0);
  const taken = adherenceStats.reduce((s, a) => s + a.takenCount, 0);
  return total > 0 ? Math.round((taken / total) * 100) : 0;
}

export function isTakenToday(
  medicationId: string,
  medicationLogs: MedicationLog[],
): boolean {
  const todayStr = `${MOCK_NOW.getFullYear()}-${MOCK_NOW.getMonth()}-${MOCK_NOW.getDate()}`;
  return medicationLogs.some((log) => {
    const d = log.timestamp;
    const logDay = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return log.medicationId === medicationId && logDay === todayStr && log.status === "taken";
  });
}

export function getObservationTrend(
  type: string,
  trends: ObservationTrend[],
): ObservationTrend | undefined {
  return trends.find((t) => t.type === type);
}

export function getRefillData(
  medicationId: string,
  refills: MedicationRefill[],
): MedicationRefill | undefined {
  return refills.find((r) => r.medicationId === medicationId);
}

// ── Format helpers ───────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date): string {
  const now = MOCK_NOW;
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return `Today, ${formatTime(date)}`;
  if (isYesterday) return `Yesterday, ${formatTime(date)}`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}