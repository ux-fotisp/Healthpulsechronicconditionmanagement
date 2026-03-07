/**
 * HealthPulse · Frontend API Client
 * ═══════════════════════════════════════════════════════════════════════════════
 * Typed HTTP layer for all ORCA entity routes.
 * Uses the KV-backed Hono server at /functions/v1/make-server-2115a836.
 *
 * Date handling: All dates are stored as ISO strings in KV.
 * The frontend converts them to Date objects in the hooks layer.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2115a836`;

const headers = (): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
});

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: { ...headers(), ...opts?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const msg = body?.error || `HTTP ${res.status}`;
    console.error(`[API] ${opts?.method || "GET"} ${path} → ${res.status}: ${msg}`);
    throw new Error(msg);
  }

  return res.json();
}

function get<T>(path: string) {
  return request<T>(path, { method: "GET" });
}
function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}
function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}
function del<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

// ── Default patient ID (single-patient prototype) ────────────────────────────
const PID = "P001";

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════════════════════

export const seed = () => post<{ message: string; seeded: number }>("/seed", {});
export const reseed = () => post<{ message: string; seeded: number }>("/reseed", {});

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatientDTO {
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

export const getPatient = (id = PID) => get<PatientDTO>(`/patient/${id}`);
export const updatePatient = (id: string, data: Partial<PatientDTO>) =>
  put<PatientDTO>(`/patient/${id}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MedicationDTO {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  status: "active" | "inactive";
  nextDoseTime: string | null;
  color: string;
  shape: "round" | "oval" | "capsule" | "oblong";
  quickInstruction: string;
}

export const getMedications = (pid = PID) =>
  get<MedicationDTO[]>(`/medications/${pid}`);
export const getMedication = (medId: string, pid = PID) =>
  get<MedicationDTO>(`/medications/${pid}/${medId}`);
export const updateMedication = (medId: string, data: Partial<MedicationDTO>, pid = PID) =>
  put<MedicationDTO>(`/medications/${pid}/${medId}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION LOGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MedicationLogDTO {
  id: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  timestamp: string;
  status: "taken" | "missed";
  notes: string;
}

export const getMedicationLogs = (pid = PID) =>
  get<MedicationLogDTO[]>(`/medication-logs/${pid}`);
export const createMedicationLog = (data: Omit<MedicationLogDTO, "id" | "patientId">, pid = PID) =>
  post<MedicationLogDTO>(`/medication-logs/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION REFILLS
// ═══════════════════════════════════════════════════════════════════════════════

export interface RefillDTO {
  medicationId: string;
  pillsRemaining: number;
  totalPills: number;
  refillDueDate: string;
  lastRefillDate: string;
  prescribingDoctor: string;
  prescriptionDate: string;
  orientation: string;
  prescriptionNumber: string;
  pharmacy: string;
  refillHistory: { date: string; quantity: number }[];
}

export const getRefills = (pid = PID) =>
  get<RefillDTO[]>(`/medication-refills/${pid}`);
export const getRefill = (medId: string, pid = PID) =>
  get<RefillDTO>(`/medication-refills/${pid}/${medId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  ADHERENCE (30-day stats)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdherenceDTO {
  medicationId: string;
  medicationName: string;
  dosage: string;
  takenCount: number;
  scheduledCount: number;
  color: string;
  shape: string;
}

export const getAdherence = (pid = PID) =>
  get<AdherenceDTO[]>(`/adherence/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  ADHERENCE STREAKS
// ═════════════════════════════════════════════════════════════════════════════

export interface StreakDTO {
  medicationId: string;
  medicationName: string;
  dosage: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  adherence30: number;
  adherence60: number;
  adherence90: number;
  last14Days: boolean[];
}

export const getStreaks = (pid = PID) =>
  get<StreakDTO[]>(`/streaks/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  CORRELATION INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface InsightDTO {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  medColor: string;
  effect: string;
  effectLabel: string;
  direction: "positive" | "negative";
  magnitude: number;
  condition: string;
  actionSuggest: string;
  sparkData: number[];
  conditionMet: boolean[];
}

export const getInsights = (pid = PID) =>
  get<InsightDTO[]>(`/insights/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  MISSED DOSES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MissedDoseDTO {
  id: string;
  medicationName: string;
  dosage: string;
  medColor: string;
  date: string;
  scheduledTime: string;
  reason: string;
}

export const getMissedDoses = (pid = PID) =>
  get<MissedDoseDTO[]>(`/missed-doses/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  OBSERVATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ObservationDTO {
  id: string;
  type: string;
  loincCode: string;
  value: string;
  unit: string;
  subjectId: string;
  effectiveDateTime: string;
  status: "normal" | "warning" | "critical";
}

export const getObservations = (pid = PID) =>
  get<ObservationDTO[]>(`/observations/${pid}`);
export const createObservation = (data: Omit<ObservationDTO, "id" | "subjectId">, pid = PID) =>
  post<ObservationDTO>(`/observations/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  OBSERVATION TRENDS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TrendPointDTO {
  date: string;
  value: number;
  status: "normal" | "warning" | "critical";
}

export interface ObservationTrendDTO {
  type: string;
  unit: string;
  data: TrendPointDTO[];
}

export const getObservationTrends = (pid = PID) =>
  get<ObservationTrendDTO[]>(`/observation-trends/${pid}`);
export const getObservationTrend = (type: string, pid = PID) =>
  get<ObservationTrendDTO>(`/observation-trends/${pid}/${encodeURIComponent(type)}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  TASKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TaskDTO {
  id: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  completedAt: string | null;
}

export const getTasks = (pid = PID) =>
  get<TaskDTO[]>(`/tasks/${pid}`);
export const createTask = (data: Omit<TaskDTO, "id">, pid = PID) =>
  post<TaskDTO>(`/tasks/${pid}`, data);
export const updateTask = (taskId: string, data: Partial<TaskDTO>, pid = PID) =>
  put<TaskDTO>(`/tasks/${pid}/${taskId}`, data);
export const deleteTask = (taskId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/tasks/${pid}/${taskId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AppointmentDTO {
  id: string;
  start: string;
  duration: number;
  modality: "Video" | "In-Person" | "Phone";
  status: "scheduled" | "cancelled" | "completed";
  provider: string;
  type: string;
}

export const getAppointments = (pid = PID) =>
  get<AppointmentDTO[]>(`/appointments/${pid}`);
export const getAppointment = (apptId: string, pid = PID) =>
  get<AppointmentDTO>(`/appointments/${pid}/${apptId}`);
export const updateAppointment = (apptId: string, data: Partial<AppointmentDTO>, pid = PID) =>
  put<AppointmentDTO>(`/appointments/${pid}/${apptId}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENT PREP
// ═══════════════════════════════════════════════════════════════════════════════

export interface PrepItemDTO {
  id: string;
  label: string;
  description: string;
  category: "documents" | "questions" | "logistics" | "health";
  completed: boolean;
}

export interface AppointmentPrepDTO {
  appointmentId: string;
  items: PrepItemDTO[];
}

export const getAppointmentPrep = (apptId: string, pid = PID) =>
  get<AppointmentPrepDTO>(`/appointment-prep/${pid}/${apptId}`);
export const updateAppointmentPrep = (apptId: string, data: Partial<AppointmentPrepDTO>, pid = PID) =>
  put<AppointmentPrepDTO>(`/appointment-prep/${pid}/${apptId}`, data);
export const togglePrepItem = (apptId: string, itemId: string, pid = PID) =>
  put<AppointmentPrepDTO>(`/appointment-prep/${pid}/${apptId}/toggle/${itemId}`, {});

// ═══════════════════════════════════════════════════════════════════════════════
//  LAB RESULTS
// ════════════════════════���═════════════════════════════════════════════════════

export interface LabHighlightDTO {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
}

export interface LabResultDTO {
  id: string;
  title: string;
  date: string;
  provider: string;
  type: "blood_panel" | "urine" | "cardiac" | "imaging" | "other";
  status: "normal" | "abnormal" | "critical";
  pages: number;
  fileSize: string;
  highlights: LabHighlightDTO[];
}

export const getLabs = (pid = PID) =>
  get<LabResultDTO[]>(`/labs/${pid}`);
export const getLab = (labId: string, pid = PID) =>
  get<LabResultDTO>(`/labs/${pid}/${labId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  LAB INTERPRETATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LabKeyPointDTO {
  label: string;
  text: string;
  sentiment: "positive" | "neutral" | "caution";
}

export interface LabInterpretationDTO {
  labId: string;
  headline: string;
  summary: string;
  keyPoints: LabKeyPointDTO[];
  nextSteps: string;
}

export const getLabInterpretation = (labId: string, pid = PID) =>
  get<LabInterpretationDTO>(`/lab-interpretation/${pid}/${labId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  HEALTH PROFILE (Onboarding)
// ═══════════════════════════════════════════════════════════════════════════════

export interface HealthProfileDTO {
  patientId: string;
  savedAt: string;
  name?: string;
  firstName?: string;
  dob?: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  surgeries?: { name: string; year: string }[];
  physician?: string;
  specialty?: string;
}

export const getHealthProfile = (pid = PID) =>
  get<HealthProfileDTO | null>(`/health-profile/${pid}`);
export const saveHealthProfile = (data: Omit<HealthProfileDTO, "patientId" | "savedAt">, pid = PID) =>
  post<HealthProfileDTO>(`/health-profile/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION CHANGE REQUESTS (Sprint 7 — Care Plan Self-Management)
// ═══════════════════════════════════════════════════════════════════════════════

export interface MedChangeRequestDTO {
  id: string;
  patientId: string;
  changeType: "add" | "edit_dose" | "discontinue";
  medicationId?: string;
  medicationName: string;
  currentDosage?: string;
  newDosage?: string;
  newFrequency?: string;
  newMedication?: Partial<MedicationDTO>;
  reason: string;
  status: "pending" | "approved" | "denied" | "auto_approved";
  requiresApproval: boolean;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
}

export const getMedChangeRequests = (pid = PID) =>
  get<MedChangeRequestDTO[]>(`/med-change-requests/${pid}`);
export const createMedChangeRequest = (data: Omit<MedChangeRequestDTO, "id" | "patientId" | "status" | "requiresApproval" | "createdAt" | "reviewedAt" | "reviewedBy" | "reviewNote">, pid = PID) =>
  post<MedChangeRequestDTO>(`/med-change-requests/${pid}`, data);
export const updateMedChangeRequest = (reqId: string, data: Partial<MedChangeRequestDTO>, pid = PID) =>
  put<MedChangeRequestDTO>(`/med-change-requests/${pid}/${reqId}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN PREFERENCES (Sprint 7 — Profile Settings)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CarePlanPrefsDTO {
  patientId: string;
  requireDoctorApproval: boolean;
  ageThreshold: number;
  notificationPreference: "in_app" | "email" | "both";
  updatedAt?: string;
}

export const getCarePlanPrefs = (pid = PID) =>
  get<CarePlanPrefsDTO>(`/care-plan-prefs/${pid}`);
export const updateCarePlanPrefs = (data: Partial<CarePlanPrefsDTO>, pid = PID) =>
  put<CarePlanPrefsDTO>(`/care-plan-prefs/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN SCORE (Sprint 7 — Composite Health Score)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScoreBreakdownItem {
  score: number;
  weight: number;
  label: string;
}

export interface CarePlanScoreDTO {
  patientId: string;
  composite: number;
  badge: "gold" | "silver" | "bronze" | "none";
  breakdown: {
    medication: ScoreBreakdownItem;
    vitals: ScoreBreakdownItem;
    appointments: ScoreBreakdownItem;
    tasks: ScoreBreakdownItem;
    checkins: ScoreBreakdownItem;
  };
  weeklyTrend: number[];
  activeMedications: number;
  computedAt: string;
}

export const getCarePlanScore = (pid = PID) =>
  get<CarePlanScoreDTO>(`/care-plan-score/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION CREATE & DELETE (Sprint 7 — Full CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

export const createMedication = (data: Omit<MedicationDTO, "id">, pid = PID) =>
  post<MedicationDTO>(`/medications/${pid}`, data);
export const deleteMedication = (medId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/medications/${pid}/${medId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD AGGREGATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface DashboardDTO {
  patient: PatientDTO;
  medications: MedicationDTO[];
  medicationLogs: MedicationLogDTO[];
  observations: ObservationDTO[];
  tasks: TaskDTO[];
  appointments: AppointmentDTO[];
  adherenceStats: AdherenceDTO[];
  streaks: StreakDTO[];
  insights: InsightDTO[];
  missedDoses: MissedDoseDTO[];
}

export const getDashboard = (pid = PID) =>
  get<DashboardDTO>(`/dashboard/${pid}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOOD PRESSURE READINGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BPReadingDTO {
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  timestamp: string;
  arm: "left" | "right";
  position: "sitting" | "standing" | "lying";
  notes: string;
}

export const getBPReadings = (pid = PID) =>
  get<BPReadingDTO[]>(`/bp-readings/${pid}`);
export const createBPReading = (data: Omit<BPReadingDTO, "id" | "patientId">, pid = PID) =>
  post<BPReadingDTO>(`/bp-readings/${pid}`, data);
export const deleteBPReading = (readingId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/bp-readings/${pid}/${readingId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  GLUCOSE ENTRIES (Sugar Level Tracker)
// ═══════════════════════════════════════════════════════════════════════════════

export interface GlucoseEntryDTO {
  id: string;
  patientId: string;
  timestamp: string;
  glucose: number;
  mealTag: string;
  carbs: number | null;
  mealDescription: string;
  insulinDose: number | null;
  insulinType: string | null;
  activityType: string;
  activityDuration: number | null;
  activityIntensity: string | null;
  tags: string[];
  mood: string | null;
  notes: string;
  ketones: number | null;
  weight: number | null;
  systolic: number | null;
  diastolic: number | null;
}

export const getGlucoseEntries = (pid = PID) =>
  get<GlucoseEntryDTO[]>(`/glucose-entries/${pid}`);
export const createGlucoseEntry = (data: Omit<GlucoseEntryDTO, "id" | "patientId">, pid = PID) =>
  post<GlucoseEntryDTO>(`/glucose-entries/${pid}`, data);
export const deleteGlucoseEntry = (entryId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/glucose-entries/${pid}/${entryId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  DAILY CHECK-INS (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CheckInDTO {
  id: string;
  patientId: string;
  date: string;
  savedAt: string;
  // Condition-specific fields
  energyLevel: number;          // 1–5 scale
  painLevel: number;            // 0–10 scale
  sleepQuality: number;         // 1–5 scale
  moodRating: number;           // 1–5 scale
  symptoms: string[];           // free-text symptom tags
  conditionChecks: {            // condition-specific Q&A
    question: string;
    answer: string | boolean | number;
  }[];
  notes: string;
}

export const getCheckIns = (pid = PID) =>
  get<CheckInDTO[]>(`/checkins/${pid}`);
export const getTodayCheckIn = (pid = PID) =>
  get<CheckInDTO | null>(`/checkins/${pid}/today`);
export const createCheckIn = (data: Omit<CheckInDTO, "id" | "patientId" | "date" | "savedAt">, pid = PID) =>
  post<CheckInDTO>(`/checkins/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  EMOTIONAL CHECK-INS (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmotionalCheckInDTO {
  id: string;
  patientId: string;
  timestamp: string;
  triggerType: string;          // "abnormal_reading" | "missed_dose" | "manual"
  triggerDetail: string;        // e.g., "BP 155/98 — High"
  emotion: string;              // "worried" | "calm" | "frustrated" | "anxious" | "hopeful" | "neutral"
  intensityLevel: number;       // 1–5
  copingAction: string;         // what the user plans to do
  notes: string;
}

export const getEmotionalCheckIns = (pid = PID) =>
  get<EmotionalCheckInDTO[]>(`/emotional-checkins/${pid}`);
export const createEmotionalCheckIn = (data: Omit<EmotionalCheckInDTO, "id" | "patientId" | "timestamp">, pid = PID) =>
  post<EmotionalCheckInDTO>(`/emotional-checkins/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  MISSED DOSE RECOVERY (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

export interface DoseRecoveryDTO {
  id: string;
  patientId: string;
  timestamp: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  missedAt: string;
  recoveryAction: "take_now" | "skip_dose" | "half_dose" | "contact_provider";
  reason: string;
  notes: string;
}

export const createDoseRecovery = (data: Omit<DoseRecoveryDTO, "id" | "patientId" | "timestamp">, pid = PID) =>
  post<DoseRecoveryDTO>(`/dose-recovery/${pid}`, data);

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN GOALS & MILESTONES (Sprint 8 — P2)
// ═══════════════════════════════════════════════════════════════════════════════

export interface MilestoneDTO {
  id: string;
  goalId: string;
  patientId: string;
  title: string;
  dueDate?: string;
  order: number;
  completed: boolean;
  completedAt: string | null;
}

export interface GoalDTO {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: "medication" | "vitals" | "lifestyle" | "appointment" | "custom";
  targetDate?: string;
  status: "active" | "completed" | "paused";
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
  milestones: MilestoneDTO[];
  createdAt: string;
  updatedAt: string;
}

export const getGoals = (pid = PID) =>
  get<GoalDTO[]>(`/goals/${pid}`);
export const getGoal = (goalId: string, pid = PID) =>
  get<GoalDTO>(`/goals/${pid}/${goalId}`);
export const createGoal = (data: {
  title: string;
  description: string;
  category: GoalDTO["category"];
  targetDate?: string;
  milestones?: { title: string; dueDate?: string }[];
}, pid = PID) =>
  post<GoalDTO>(`/goals/${pid}`, data);
export const updateGoal = (goalId: string, data: Partial<GoalDTO>, pid = PID) =>
  put<GoalDTO>(`/goals/${pid}/${goalId}`, data);
export const deleteGoal = (goalId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/goals/${pid}/${goalId}`);

export const createMilestone = (goalId: string, data: { title: string; dueDate?: string }, pid = PID) =>
  post<MilestoneDTO>(`/goals/${pid}/${goalId}/milestones`, data);
export const toggleMilestone = (goalId: string, msId: string, pid = PID) =>
  put<MilestoneDTO>(`/goals/${pid}/${goalId}/milestones/${msId}/toggle`, {});
export const deleteMilestone = (goalId: string, msId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/goals/${pid}/${goalId}/milestones/${msId}`);

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS — Persisted Push Alerts (Sprint 9)
// ═══════════════════════════════════════════════════════════════════════════════

export interface NotificationDTO {
  id: string;
  patientId: string;
  type: "medication" | "vital" | "appointment";
  severity: "overdue" | "due_soon" | "upcoming" | "info";
  title: string;
  detail: string;
  time: string;
  sourceKey: string;
  sourceId: string;
  navigateTo: string;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
}

export const getNotifications = (pid = PID) =>
  get<NotificationDTO[]>(`/notifications/${pid}`);
export const updateNotification = (notifId: string, data: Partial<NotificationDTO>, pid = PID) =>
  put<NotificationDTO>(`/notifications/${pid}/${notifId}`, data);
export const markAllNotificationsRead = (pid = PID) =>
  put<{ marked: number }>(`/notifications/${pid}/mark-all-read`, {});
export const deleteNotification = (notifId: string, pid = PID) =>
  del<{ deleted: boolean }>(`/notifications/${pid}/${notifId}`);
export const generateNotifications = (pid = PID) =>
  post<{ generated: number; notifications: NotificationDTO[] }>(`/notifications/${pid}/generate`, {});

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATION PREFERENCES (Sprint 9)
// ═══════════════════════════════════════════════════════════════════════════════

export interface NotificationPrefsDTO {
  patientId: string;
  mutedTypes: string[];
  mutedMedicationIds: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  medRemindersEnabled: boolean;
  vitalRemindersEnabled: boolean;
  appointmentRemindersEnabled: boolean;
  reminderLeadMinutes: number;
  updatedAt: string | null;
}

export const getNotificationPrefs = (pid = PID) =>
  get<NotificationPrefsDTO>(`/notification-prefs/${pid}`);
export const updateNotificationPrefs = (data: Partial<NotificationPrefsDTO>, pid = PID) =>
  put<NotificationPrefsDTO>(`/notification-prefs/${pid}`, data);