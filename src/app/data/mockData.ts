// ─── HealthPulse · Mock Data (Sprint 1) ──────────────────────────────────────
// Today: Monday, March 2, 2026 · Current mock time: 09:45 AM

export const MOCK_NOW = new Date(2026, 2, 2, 9, 45, 0);

// ─── Patient ──────────────────────────────────────────────────────────────────
export const patient = {
  id: "P001",
  name: "Sarah Mitchell",
  birthDate: "1978-04-15",
  gender: "Female",
  mrn: "123-456",
  contactPhone: "+1 (555) 234-5678",
  contactEmail: "sarah.mitchell@email.com",
  preferredLanguage: "English",
  conditions: ["Hypertension", "Type 2 Diabetes"],
  careTeam: "Dr. Emily Chen, Dr. James Park",
};

// ─── Medications ─────────────────────────────────────────────────────────────
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

export const medications: Medication[] = [
  {
    id: "M001",
    name: "Lisinopril",
    dosage: "10mg",
    route: "Oral",
    frequency: "Once daily (morning)",
    status: "active",
    nextDoseTime: new Date(2026, 2, 2, 10, 45, 0), // 10:45 AM – in 1 hour
    color: "#4A90C4",
    shape: "round",
    quickInstruction: "Take on empty stomach",
  },
  {
    id: "M002",
    name: "Metformin",
    dosage: "500mg",
    route: "Oral",
    frequency: "Twice daily",
    status: "active",
    nextDoseTime: new Date(2026, 2, 2, 13, 0, 0), // 1:00 PM
    color: "#6B8E6B",
    shape: "oblong",
    quickInstruction: "Take with food",
  },
  {
    id: "M003",
    name: "Amlodipine",
    dosage: "5mg",
    route: "Oral",
    frequency: "Once daily (evening)",
    status: "active",
    nextDoseTime: new Date(2026, 2, 2, 20, 0, 0), // 8:00 PM
    color: "#9B6BB5",
    shape: "capsule",
    quickInstruction: "Avoid grapefruit",
  },
  {
    id: "M004",
    name: "Atorvastatin",
    dosage: "20mg",
    route: "Oral",
    frequency: "Once daily at bedtime",
    status: "inactive",
    nextDoseTime: null,
    color: "#7A8A9A",
    shape: "oval",
    quickInstruction: "Take at bedtime",
  },
];

// ─── Medication Logs ─────────────────────────────────────────────────────────
export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  timestamp: Date;
  status: "taken" | "missed";
  notes: string;
}

export const medicationLogs: MedicationLog[] = [
  {
    id: "ML001",
    medicationId: "M002",
    medicationName: "Metformin",
    patientId: "P001",
    timestamp: new Date(2026, 2, 2, 7, 30, 0), // Today 7:30 AM – taken
    status: "taken",
    notes: "Taken with breakfast",
  },
  {
    id: "ML002",
    medicationId: "M001",
    medicationName: "Lisinopril",
    patientId: "P001",
    timestamp: new Date(2026, 2, 1, 9, 0, 0), // Yesterday – taken
    status: "taken",
    notes: "",
  },
  {
    id: "ML003",
    medicationId: "M003",
    medicationName: "Amlodipine",
    patientId: "P001",
    timestamp: new Date(2026, 2, 1, 20, 15, 0), // Yesterday evening – taken
    status: "taken",
    notes: "",
  },
  {
    id: "ML004",
    medicationId: "M002",
    medicationName: "Metformin",
    patientId: "P001",
    timestamp: new Date(2026, 2, 1, 7, 45, 0), // Yesterday morning – taken
    status: "taken",
    notes: "",
  },
  {
    id: "ML005",
    medicationId: "M001",
    medicationName: "Lisinopril",
    patientId: "P001",
    timestamp: new Date(2026, 2, 0, 9, 0, 0), // Feb 28 – missed
    status: "missed",
    notes: "Forgot while traveling",
  },
];

// ─── Observations ────────────────────────────────────────────────────────────
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

export const observations: Observation[] = [
  {
    id: "O001",
    type: "Blood Pressure",
    loincCode: "85354-9",
    value: "132/84",
    unit: "mmHg",
    subjectId: "P001",
    effectiveDateTime: new Date(2026, 2, 2, 8, 15, 0), // Today 8:15 AM
    status: "warning",
  },
  {
    id: "O002",
    type: "Heart Rate",
    loincCode: "8867-4",
    value: "76",
    unit: "bpm",
    subjectId: "P001",
    effectiveDateTime: new Date(2026, 2, 2, 8, 16, 0), // Today 8:16 AM
    status: "normal",
  },
  {
    id: "O003",
    type: "Blood Glucose",
    loincCode: "2339-0",
    value: "118",
    unit: "mg/dL",
    subjectId: "P001",
    effectiveDateTime: new Date(2026, 2, 1, 7, 30, 0), // Yesterday
    status: "normal",
  },
  {
    id: "O004",
    type: "Weight",
    loincCode: "29463-7",
    value: "72.5",
    unit: "kg",
    subjectId: "P001",
    effectiveDateTime: new Date(2026, 2, 1, 9, 0, 0), // Yesterday
    status: "normal",
  },
  {
    id: "O005",
    type: "SpO₂",
    loincCode: "59408-5",
    value: "98",
    unit: "%",
    subjectId: "P001",
    effectiveDateTime: new Date(2026, 1, 28, 8, 0, 0), // Feb 28
    status: "normal",
  },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  description: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  completedAt: Date | null;
}

export const tasks: Task[] = [
  {
    id: "T001",
    description: "Log morning blood pressure",
    dueDate: new Date(2026, 2, 2, 10, 0, 0),
    priority: "high",
    status: "completed",
    completedAt: new Date(2026, 2, 2, 8, 15, 0),
  },
  {
    id: "T002",
    description: "Take Lisinopril morning dose",
    dueDate: new Date(2026, 2, 2, 10, 45, 0),
    priority: "high",
    status: "pending",
    completedAt: null,
  },
  {
    id: "T003",
    description: "Log afternoon blood glucose",
    dueDate: new Date(2026, 2, 2, 13, 30, 0),
    priority: "medium",
    status: "pending",
    completedAt: null,
  },
  {
    id: "T004",
    description: "Complete weekly wellness check-in",
    dueDate: new Date(2026, 2, 2, 23, 59, 0),
    priority: "low",
    status: "pending",
    completedAt: null,
  },
  {
    id: "T005",
    description: "Review cardiologist notes",
    dueDate: new Date(2026, 2, 1, 17, 0, 0),
    priority: "medium",
    status: "completed",
    completedAt: new Date(2026, 2, 1, 16, 30, 0),
  },
];

// ─── Appointments ─────────────────────────────────────────────────────────────
export interface Appointment {
  id: string;
  start: Date;
  duration: number;
  modality: "Video" | "In-Person" | "Phone";
  status: "scheduled" | "cancelled" | "completed";
  provider: string;
  type: string;
}

export const appointments: Appointment[] = [
  {
    id: "A001",
    start: new Date(2026, 2, 2, 15, 30, 0), // Today 3:30 PM
    duration: 30,
    modality: "Video",
    status: "scheduled",
    provider: "Dr. Emily Chen",
    type: "Cardiology Follow-up",
  },
  {
    id: "A002",
    start: new Date(2026, 2, 3, 14, 0, 0), // Tomorrow 2:00 PM
    duration: 60,
    modality: "In-Person",
    status: "scheduled",
    provider: "Dr. James Park",
    type: "Lab Results Review",
  },
  {
    id: "A003",
    start: new Date(2026, 2, 10, 11, 0, 0), // March 10
    duration: 30,
    modality: "Video",
    status: "scheduled",
    provider: "Dr. Emily Chen",
    type: "Monthly Hypertension Check",
  },
];

// ─── Derived helpers ─────────────────────────────────────────────────────────

/** Medications due today with no log entry */
export function getMedicationsDueToday(): Medication[] {
  const todayStr = `${MOCK_NOW.getFullYear()}-${MOCK_NOW.getMonth()}-${MOCK_NOW.getDate()}`;
  const takenTodayIds = new Set(
    medicationLogs
      .filter((log) => {
        const d = log.timestamp;
        const logDay = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return logDay === todayStr && log.status === "taken";
      })
      .map((log) => log.medicationId)
  );
  return medications.filter(
    (m) => m.status === "active" && !takenTodayIds.has(m.id)
  );
}

/** Latest observation for current patient */
export function getLatestObservation(): Observation | null {
  const patientObs = observations
    .filter((o) => o.subjectId === patient.id)
    .sort((a, b) => b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime());
  return patientObs[0] ?? null;
}

/** Active state: next medication or appointment within 12 hours */
export type ActiveState =
  | { kind: "medication"; medication: Medication; minutesUntil: number }
  | { kind: "appointment"; appointment: Appointment; minutesUntil: number }
  | null;

export function getActiveState(): ActiveState {
  const horizon = new Date(MOCK_NOW.getTime() + 12 * 60 * 60 * 1000);

  const nextMed = medications
    .filter(
      (m) =>
        m.status === "active" &&
        m.nextDoseTime !== null &&
        m.nextDoseTime > MOCK_NOW &&
        m.nextDoseTime <= horizon
    )
    .sort(
      (a, b) => a.nextDoseTime!.getTime() - b.nextDoseTime!.getTime()
    )[0];

  const nextAppt = appointments
    .filter(
      (a) =>
        a.status === "scheduled" &&
        a.start > MOCK_NOW &&
        a.start <= horizon
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

/** Merged timeline (last 10 entries) */
export type TimelineEntry =
  | { kind: "medication_log"; data: MedicationLog; time: Date }
  | { kind: "observation"; data: Observation; time: Date }
  | { kind: "task"; data: Task; time: Date }
  | { kind: "appointment"; data: Appointment; time: Date };

export function getTimelineEntries(): TimelineEntry[] {
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
  return entries
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);
}

/** Format time for display */
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

export function getPatientAge(): number {
  const birth = new Date(patient.birthDate);
  const ageDiff = MOCK_NOW.getTime() - birth.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}

// ─── Refill Data ────────────────────────────────────────────────────────────
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

export const refillData: MedicationRefill[] = [
  {
    medicationId: "M001",
    pillsRemaining: 18,
    totalPills: 30,
    refillDueDate: new Date(2026, 2, 15),
    lastRefillDate: new Date(2026, 1, 15),
    prescribingDoctor: "Dr. Emily Chen",
    prescriptionDate: new Date(2026, 0, 10),
    orientation: "Take with a full glass of water in the morning, before breakfast. Avoid potassium-rich foods.",
    prescriptionNumber: "RX-20260110-001",
    pharmacy: "Walgreens – 5th Ave",
    refillHistory: [
      { date: new Date(2026, 1, 15), quantity: 30 },
      { date: new Date(2026, 0, 15), quantity: 30 },
      { date: new Date(2025, 11, 15), quantity: 30 },
    ],
  },
  {
    medicationId: "M002",
    pillsRemaining: 42,
    totalPills: 60,
    refillDueDate: new Date(2026, 2, 20),
    lastRefillDate: new Date(2026, 1, 20),
    prescribingDoctor: "Dr. James Park",
    prescriptionDate: new Date(2026, 0, 5),
    orientation: "Take with food. Do not crush or chew. If you miss a dose, take it as soon as remembered unless it is close to the next scheduled dose.",
    prescriptionNumber: "RX-20260105-002",
    pharmacy: "CVS – Main St",
    refillHistory: [
      { date: new Date(2026, 1, 20), quantity: 60 },
      { date: new Date(2025, 12, 20), quantity: 60 },
    ],
  },
  {
    medicationId: "M003",
    pillsRemaining: 7,
    totalPills: 30,
    refillDueDate: new Date(2026, 2, 8),
    lastRefillDate: new Date(2026, 1, 8),
    prescribingDoctor: "Dr. Emily Chen",
    prescriptionDate: new Date(2026, 0, 10),
    orientation: "Take once daily in the evening. May be taken with or without food. Do not take grapefruit juice while on this medication.",
    prescriptionNumber: "RX-20260110-003",
    pharmacy: "Walgreens – 5th Ave",
    refillHistory: [
      { date: new Date(2026, 1, 8), quantity: 30 },
      { date: new Date(2026, 0, 8), quantity: 30 },
    ],
  },
];

export function getRefillData(medicationId: string): MedicationRefill | undefined {
  return refillData.find((r) => r.medicationId === medicationId);
}

// ─── Lab Results (PDF Vault) ─────────────────────────────────────────────────
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

export const labResults: LabResult[] = [
  {
    id: "LR001",
    title: "Comprehensive Metabolic Panel",
    date: new Date(2026, 1, 28),
    provider: "Dr. James Park",
    type: "blood_panel",
    status: "abnormal",
    pages: 3,
    fileSize: "1.2 MB",
    highlights: [
      { label: "Glucose (fasting)", value: "118", unit: "mg/dL", status: "warning" },
      { label: "HbA1c", value: "6.8", unit: "%", status: "warning" },
      { label: "Creatinine", value: "0.92", unit: "mg/dL", status: "normal" },
      { label: "eGFR", value: "82", unit: "mL/min", status: "normal" },
      { label: "Potassium", value: "4.1", unit: "mEq/L", status: "normal" },
    ],
  },
  {
    id: "LR002",
    title: "Lipid Panel",
    date: new Date(2026, 1, 28),
    provider: "Dr. James Park",
    type: "blood_panel",
    status: "normal",
    pages: 2,
    fileSize: "0.8 MB",
    highlights: [
      { label: "Total Cholesterol", value: "188", unit: "mg/dL", status: "normal" },
      { label: "LDL", value: "112", unit: "mg/dL", status: "normal" },
      { label: "HDL", value: "52", unit: "mg/dL", status: "normal" },
      { label: "Triglycerides", value: "148", unit: "mg/dL", status: "normal" },
    ],
  },
  {
    id: "LR003",
    title: "Cardiac Stress Test",
    date: new Date(2026, 1, 10),
    provider: "Dr. Emily Chen",
    type: "cardiac",
    status: "normal",
    pages: 5,
    fileSize: "3.4 MB",
    highlights: [
      { label: "Max Heart Rate", value: "162", unit: "bpm", status: "normal" },
      { label: "ST Changes", value: "None", unit: "", status: "normal" },
      { label: "Exercise Tolerance", value: "Good", unit: "", status: "normal" },
    ],
  },
  {
    id: "LR004",
    title: "Urinalysis",
    date: new Date(2026, 0, 20),
    provider: "Dr. James Park",
    type: "urine",
    status: "normal",
    pages: 2,
    fileSize: "0.5 MB",
    highlights: [
      { label: "Protein", value: "Negative", unit: "", status: "normal" },
      { label: "Glucose", value: "Trace", unit: "", status: "warning" },
      { label: "pH", value: "6.5", unit: "", status: "normal" },
    ],
  },
];

// ─── 30-Day Medication Adherence ──────────────────────────────────────────────
export interface MedicationAdherence {
  medicationId: string;
  medicationName: string;
  dosage: string;
  takenCount: number;
  scheduledCount: number;
  color: string;
  shape: "round" | "oval" | "capsule" | "oblong";
}

export const adherence30Day: MedicationAdherence[] = [
  {
    medicationId: "M001",
    medicationName: "Lisinopril",
    dosage: "10mg",
    takenCount: 24,
    scheduledCount: 30,
    color: "#4A90C4",
    shape: "round",
  },
  {
    medicationId: "M002",
    medicationName: "Metformin",
    dosage: "500mg",
    takenCount: 56,
    scheduledCount: 60,
    color: "#6B8E6B",
    shape: "oblong",
  },
  {
    medicationId: "M003",
    medicationName: "Amlodipine",
    dosage: "5mg",
    takenCount: 26,
    scheduledCount: 30,
    color: "#9B6BB5",
    shape: "capsule",
  },
];

export function getOverallAdherence(): number {
  const total = adherence30Day.reduce((s, a) => s + a.scheduledCount, 0);
  const taken = adherence30Day.reduce((s, a) => s + a.takenCount, 0);
  return total > 0 ? Math.round((taken / total) * 100) : 0;
}

// ─── Correlation Insights (User Story 1) ─────────────────────────────────────
// Simulated correlation engine: medication timing × patient-reported outcomes.
// sparkData = 14-day relative outcome score (0–100, higher = better for positive effects).
// conditionMet = whether the timing condition was satisfied each day.
export interface CorrelationInsight {
  id:            string;
  medicationId:  string;
  medicationName:string;
  dosage:        string;
  medColor:      string;
  effect:        "energy" | "nausea" | "bp" | "sleep" | "mood";
  effectLabel:   string;
  direction:     "positive" | "negative";
  magnitude:     number;       // % improvement
  condition:     string;       // timing condition label
  actionSuggest: string;       // the "Adjust Schedule?" copy
  sparkData:     number[];     // 14 daily values 0–100
  conditionMet:  boolean[];    // whether condition was met each day
}

export const correlationInsights: CorrelationInsight[] = [
  {
    id:             "CI001",
    medicationId:   "M001",
    medicationName: "Lisinopril",
    dosage:         "10mg",
    medColor:       "#4A90C4",
    effect:         "energy",
    effectLabel:    "Energy Level",
    direction:      "positive",
    magnitude:      20,
    condition:      "before 9:00 AM",
    actionSuggest:  "Shift your Lisinopril reminder to 8:30 AM?",
    // ↑ higher = more energy; dips correspond to conditionMet = false
    sparkData:    [58, 42, 71, 65, 79, 44, 73, 68, 82, 76, 91, 57, 83, 88],
    conditionMet: [true, false, true, true, true, false, true, true, true, true, true, false, true, true],
  },
  {
    id:             "CI002",
    medicationId:   "M002",
    medicationName: "Metformin",
    dosage:         "500mg",
    medColor:       "#6B8E6B",
    effect:         "nausea",
    effectLabel:    "Nausea Score",
    direction:      "negative",  // lower nausea = better
    magnitude:      35,
    condition:      "with a full meal",
    actionSuggest:  "Always take Metformin with breakfast or lunch?",
    // ↑ higher score = less nausea (inverted for display); dips = condition not met
    sparkData:    [72, 68, 40, 38, 71, 69, 42, 44, 70, 73, 38, 72, 68, 66],
    conditionMet: [true, true, false, false, true, true, false, false, true, true, false, true, true, true],
  },
  {
    id:             "CI003",
    medicationId:   "M003",
    medicationName: "Amlodipine",
    dosage:         "5mg",
    medColor:       "#9B6BB5",
    effect:         "bp",
    effectLabel:    "Blood Pressure",
    direction:      "positive",
    magnitude:      12,
    condition:      "at the same time each evening",
    actionSuggest:  "Set a consistent 8:00 PM reminder for Amlodipine?",
    sparkData:    [60, 74, 78, 55, 80, 82, 53, 78, 83, 76, 89, 81, 75, 90],
    conditionMet: [false, true, true, false, true, true, false, true, true, true, true, true, true, true],
  },
];

// ─── Missed Dose Summary (used by AppointmentExport, User Story 3) ────────────
export interface MissedDoseSummary {
  medicationName: string;
  dosage:         string;
  medColor:       string;
  date:           Date;
  scheduledTime:  string;
  reason:         string;
}

export const missedDoses30Day: MissedDoseSummary[] = [
  { medicationName: "Lisinopril",  dosage: "10mg", medColor: "#4A90C4", date: new Date(2026, 1, 28), scheduledTime: "9:00 AM",  reason: "Forgot while traveling" },
  { medicationName: "Lisinopril",  dosage: "10mg", medColor: "#4A90C4", date: new Date(2026, 1, 22), scheduledTime: "9:00 AM",  reason: "Slept through alarm" },
  { medicationName: "Lisinopril",  dosage: "10mg", medColor: "#4A90C4", date: new Date(2026, 1, 15), scheduledTime: "9:00 AM",  reason: "Out of supply" },
  { medicationName: "Amlodipine",  dosage: "5mg",  medColor: "#9B6BB5", date: new Date(2026, 1, 19), scheduledTime: "8:00 PM",  reason: "Forgot" },
  { medicationName: "Amlodipine",  dosage: "5mg",  medColor: "#9B6BB5", date: new Date(2026, 1, 10), scheduledTime: "8:00 PM",  reason: "Forgot" },
  { medicationName: "Metformin",   dosage: "500mg",medColor: "#6B8E6B", date: new Date(2026, 1, 25), scheduledTime: "1:00 PM",  reason: "Missed lunch dose" },
];

// ─── Sprint 2: Medication Adherence Streaks ──────────────────────────────────
export interface AdherenceStreak {
  medicationId:   string;
  medicationName: string;
  dosage:         string;
  color:          string;
  currentStreak:  number;  // consecutive days taken
  longestStreak:  number;
  adherence30:    number;  // % over last 30 days
  adherence60:    number;
  adherence90:    number;
  last14Days:     boolean[];  // true = taken, false = missed (index 13 = today)
}

export const medicationStreaks: AdherenceStreak[] = [
  {
    medicationId:   "M001",
    medicationName: "Lisinopril",
    dosage:         "10mg",
    color:          "#4A90C4",
    currentStreak:  3,
    longestStreak:  12,
    adherence30:    80,
    adherence60:    78,
    adherence90:    82,
    last14Days: [true, true, false, true, true, true, false, true, true, true, false, true, true, true],
  },
  {
    medicationId:   "M002",
    medicationName: "Metformin",
    dosage:         "500mg",
    color:          "#6B8E6B",
    currentStreak:  8,
    longestStreak:  21,
    adherence30:    93,
    adherence60:    91,
    adherence90:    89,
    last14Days: [true, true, true, true, false, true, true, true, true, true, true, true, true, true],
  },
  {
    medicationId:   "M003",
    medicationName: "Amlodipine",
    dosage:         "5mg",
    color:          "#9B6BB5",
    currentStreak:  5,
    longestStreak:  18,
    adherence30:    87,
    adherence60:    84,
    adherence90:    86,
    last14Days: [true, false, true, true, true, false, true, true, false, true, true, true, true, true],
  },
];

// ─── Sprint 2: 30-Day Observation Trend Data ─────────────────────────────────
export interface ObservationTrend {
  type:     string;
  unit:     string;
  data:     { date: Date; value: number; status: "normal" | "warning" | "critical" }[];
}

export const observationTrends: ObservationTrend[] = [
  {
    type: "Blood Pressure",
    unit: "mmHg (systolic)",
    data: [
      { date: new Date(2026, 1, 1),  value: 138, status: "warning"  },
      { date: new Date(2026, 1, 3),  value: 134, status: "warning"  },
      { date: new Date(2026, 1, 5),  value: 130, status: "warning"  },
      { date: new Date(2026, 1, 8),  value: 128, status: "normal"   },
      { date: new Date(2026, 1, 10), value: 135, status: "warning"  },
      { date: new Date(2026, 1, 12), value: 131, status: "warning"  },
      { date: new Date(2026, 1, 15), value: 126, status: "normal"   },
      { date: new Date(2026, 1, 17), value: 129, status: "normal"   },
      { date: new Date(2026, 1, 19), value: 133, status: "warning"  },
      { date: new Date(2026, 1, 22), value: 127, status: "normal"   },
      { date: new Date(2026, 1, 24), value: 130, status: "warning"  },
      { date: new Date(2026, 1, 26), value: 128, status: "normal"   },
      { date: new Date(2026, 1, 28), value: 134, status: "warning"  },
      { date: new Date(2026, 2, 1),  value: 131, status: "warning"  },
      { date: new Date(2026, 2, 2),  value: 132, status: "warning"  },
    ],
  },
  {
    type: "Blood Glucose",
    unit: "mg/dL",
    data: [
      { date: new Date(2026, 1, 1),  value: 124, status: "warning"  },
      { date: new Date(2026, 1, 4),  value: 115, status: "warning"  },
      { date: new Date(2026, 1, 7),  value: 108, status: "warning"  },
      { date: new Date(2026, 1, 10), value: 112, status: "warning"  },
      { date: new Date(2026, 1, 13), value: 105, status: "warning"  },
      { date: new Date(2026, 1, 16), value: 98,  status: "normal"   },
      { date: new Date(2026, 1, 19), value: 110, status: "warning"  },
      { date: new Date(2026, 1, 22), value: 102, status: "warning"  },
      { date: new Date(2026, 1, 25), value: 95,  status: "normal"   },
      { date: new Date(2026, 1, 28), value: 118, status: "warning"  },
      { date: new Date(2026, 2, 1),  value: 118, status: "warning"  },
    ],
  },
  {
    type: "Heart Rate",
    unit: "bpm",
    data: [
      { date: new Date(2026, 1, 1),  value: 72, status: "normal" },
      { date: new Date(2026, 1, 5),  value: 78, status: "normal" },
      { date: new Date(2026, 1, 10), value: 74, status: "normal" },
      { date: new Date(2026, 1, 14), value: 80, status: "normal" },
      { date: new Date(2026, 1, 18), value: 71, status: "normal" },
      { date: new Date(2026, 1, 22), value: 76, status: "normal" },
      { date: new Date(2026, 1, 26), value: 73, status: "normal" },
      { date: new Date(2026, 2, 2),  value: 76, status: "normal" },
    ],
  },
  {
    type: "Weight",
    unit: "kg",
    data: [
      { date: new Date(2026, 1, 1),  value: 73.2, status: "normal" },
      { date: new Date(2026, 1, 8),  value: 73.0, status: "normal" },
      { date: new Date(2026, 1, 15), value: 72.8, status: "normal" },
      { date: new Date(2026, 1, 22), value: 72.6, status: "normal" },
      { date: new Date(2026, 2, 1),  value: 72.5, status: "normal" },
    ],
  },
];

export function getObservationTrend(type: string): ObservationTrend | undefined {
  return observationTrends.find((t) => t.type === type);
}

// ─── Sprint 2: Appointment Preparation Checklists ────────────────────────────
export interface AppointmentPrepItem {
  id:          string;
  label:       string;
  description: string;
  category:    "documents" | "questions" | "logistics" | "health";
}

export interface AppointmentPrep {
  appointmentId: string;
  items:         AppointmentPrepItem[];
}

export const appointmentPreps: AppointmentPrep[] = [
  {
    appointmentId: "A001",
    items: [
      { id: "P001-1", label: "Review recent blood pressure readings",       description: "Check your last 7 days of BP logs to discuss trends with Dr. Chen.",              category: "health"    },
      { id: "P001-2", label: "List any new symptoms or concerns",           description: "Write down anything new: dizziness, headaches, swelling, or changes in how you feel.", category: "questions" },
      { id: "P001-3", label: "Confirm your medication list is up to date",  description: "Make sure your HealthPulse medications match what you're actually taking.",          category: "documents" },
      { id: "P001-4", label: "Test your video call setup",                  description: "Check your internet, camera, and microphone 15 minutes before the appointment.",      category: "logistics" },
      { id: "P001-5", label: "Prepare questions for your doctor",           description: "Examples: 'Should I adjust my Lisinopril dose?' or 'Is my BP improving enough?'",    category: "questions" },
    ],
  },
  {
    appointmentId: "A002",
    items: [
      { id: "P002-1", label: "Bring your photo ID and insurance card",      description: "You'll need these for check-in at the front desk.",                                   category: "logistics" },
      { id: "P002-2", label: "Fast for 8 hours if requested",              description: "If Dr. Park asked for fasting labs, don't eat or drink (except water) beforehand.",    category: "health"    },
      { id: "P002-3", label: "Review your recent lab results",             description: "Look over your Comprehensive Metabolic Panel and Lipid Panel from Feb 28.",            category: "documents" },
      { id: "P002-4", label: "Write down questions about your results",    description: "Examples: 'What does my HbA1c of 6.8% mean?' or 'Should I change my diet?'",          category: "questions" },
      { id: "P002-5", label: "Arrive 15 minutes early",                    description: "Allow time for parking and check-in at the clinic.",                                   category: "logistics" },
    ],
  },
  {
    appointmentId: "A003",
    items: [
      { id: "P003-1", label: "Log blood pressure daily this week",         description: "Dr. Chen will want to see your readings from the full week before this appointment.",  category: "health"    },
      { id: "P003-2", label: "Track any side effects from medications",    description: "Note any dizziness, fatigue, or other issues you experience this week.",               category: "health"    },
      { id: "P003-3", label: "Test your video call setup",                 description: "Check your internet, camera, and microphone 15 minutes before the appointment.",       category: "logistics" },
      { id: "P003-4", label: "Prepare monthly progress questions",         description: "Examples: 'Is my treatment plan working?' or 'Do I need any new tests?'",              category: "questions" },
    ],
  },
];

export function getAppointmentPrep(appointmentId: string): AppointmentPrep | undefined {
  return appointmentPreps.find((p) => p.appointmentId === appointmentId);
}

// ─── Sprint 2: Plain-Language Lab Interpretations ────────────────────────────
export interface LabInterpretation {
  labId:      string;
  headline:   string;
  summary:    string;
  keyPoints:  { label: string; text: string; sentiment: "positive" | "neutral" | "caution" }[];
  nextSteps:  string;
}

export const labInterpretations: LabInterpretation[] = [
  {
    labId:     "LR001",
    headline:  "Your blood sugar numbers need attention",
    summary:   "Most of your results look healthy, but two numbers — your fasting glucose and HbA1c — are higher than the target range. This means your blood sugar has been running a little high over the last few months.",
    keyPoints: [
      { label: "Fasting Glucose", text: "118 mg/dL is above the normal range of 70–99. This puts it in the 'prediabetes' zone. Diet and medication adjustments can help bring it down.",                       sentiment: "caution"  },
      { label: "HbA1c",           text: "6.8% is slightly above the 6.5% threshold. It shows your average blood sugar over 3 months. Your doctor may want to adjust your Metformin dosage.",                  sentiment: "caution"  },
      { label: "Kidney Function",  text: "Your creatinine (0.92) and eGFR (82) look healthy. This means your kidneys are filtering well — important to monitor with diabetes and blood pressure medication.",  sentiment: "positive" },
      { label: "Potassium",        text: "4.1 mEq/L is in the normal range. This is important to check because Lisinopril can sometimes raise potassium levels.",                                             sentiment: "positive" },
    ],
    nextSteps: "Discuss your glucose and HbA1c with Dr. Park at your upcoming Lab Results Review appointment. Ask about adjusting your Metformin dose or making dietary changes.",
  },
  {
    labId:     "LR002",
    headline:  "Your cholesterol looks great!",
    summary:   "All four cholesterol markers are in healthy ranges. This is a positive sign that your current treatment and lifestyle are working well together.",
    keyPoints: [
      { label: "Total Cholesterol", text: "188 mg/dL is below 200, which is the healthy target. Great job!",                                                                     sentiment: "positive" },
      { label: "LDL ('Bad')",       text: "112 mg/dL is within an acceptable range. For people with hypertension, keeping LDL under 130 is typically recommended.",                sentiment: "positive" },
      { label: "HDL ('Good')",      text: "52 mg/dL is above the minimum of 40 for men and 50 for women. Higher HDL helps protect your heart.",                                   sentiment: "positive" },
      { label: "Triglycerides",     text: "148 mg/dL is under the 150 target. Triglycerides can go up with high-sugar diets, so this is a good sign for your diabetes management.", sentiment: "positive" },
    ],
    nextSteps: "No immediate action needed. Continue your current medications and healthy eating habits. Your next lipid panel will likely be in 6 months.",
  },
  {
    labId:     "LR003",
    headline:  "Your heart handled the stress test well",
    summary:   "The cardiac stress test showed that your heart is responding normally to exercise. No concerning changes were found in your heart rhythm during the test.",
    keyPoints: [
      { label: "Heart Rate Response", text: "Your heart reached 162 bpm during exercise, which is a healthy response for your age.",   sentiment: "positive" },
      { label: "Heart Rhythm",        text: "No ST segment changes were detected. This means there are no signs of reduced blood flow to the heart during exercise.", sentiment: "positive" },
      { label: "Exercise Tolerance",  text: "Your ability to exercise was rated as 'Good,' meaning your heart and lungs are working well together.",                  sentiment: "positive" },
    ],
    nextSteps: "This is reassuring news. Continue your blood pressure medications as prescribed. Stay physically active — walking 30 minutes daily is a great target.",
  },
  {
    labId:     "LR004",
    headline:  "Urine test is mostly normal",
    summary:   "Your urinalysis shows healthy kidney function overall. A tiny trace of glucose was found in your urine, which can happen with elevated blood sugar levels.",
    keyPoints: [
      { label: "Protein",  text: "Negative — this is good news. Protein in urine can be an early sign of kidney stress, especially with diabetes.",                                            sentiment: "positive" },
      { label: "Glucose",  text: "Trace amounts were found. This can happen when blood sugar runs above 180 mg/dL. It's not alarming, but it connects to your elevated fasting glucose.",       sentiment: "caution"  },
      { label: "pH Level", text: "6.5 is in the normal range of 4.5–8.0. This shows your kidneys are balancing acid levels properly.",                                                          sentiment: "positive" },
    ],
    nextSteps: "The trace glucose is worth monitoring. Focus on keeping your blood sugar in range with diet and Metformin. Mention this finding to Dr. Park at your next visit.",
  },
];

export function getLabInterpretation(labId: string): LabInterpretation | undefined {
  return labInterpretations.find((i) => i.labId === labId);
}