/**
 * HealthPulse · KV Seed Module
 * ═══════════════════════════════════════════════════════════════════════════════
 * Bootstraps all ORCA entity mock data into kv_store_2115a836.
 *
 * Key schema:  {entity}:{patientId}:{entityId}
 *   patient:P001                            → Patient record
 *   medication:P001:M001                    → Single medication
 *   medication_log:P001:ML001               → Dose log entry
 *   medication_refill:P001:M001             → Refill data per med
 *   medication_adherence:P001:M001          → 30-day adherence stats
 *   adherence_streak:P001:M001              → Streak tracker
 *   correlation_insight:P001:CI001          → Correlation insight
 *   missed_dose:P001:MD001                  → Missed dose summary
 *   observation:P001:O001                   → Single observation
 *   observation_trend:P001:Blood Pressure   → 30-day trend data
 *   task:P001:T001                          → Task record
 *   appointment:P001:A001                   → Appointment record
 *   appointment_prep:P001:A001              → Prep checklist
 *   lab_result:P001:LR001                   → Lab result
 *   lab_interpretation:P001:LR001           → Lab interpretation
 *   health_profile:P001                     → Onboarding wizard data
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as kv from "./kv_store.tsx";

export async function seedAllData(): Promise<{ seeded: number }> {
  const keys: string[] = [];
  const values: any[] = [];

  // ── Patient ────────────────────────────────────────────────────────────────
  keys.push("patient:P001");
  values.push({
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
  });

  // ── Medications ────────────────────────────────────────────────────────────
  const medications = [
    { id: "M001", name: "Lisinopril", dosage: "10mg", route: "Oral", frequency: "Once daily (morning)", status: "active", nextDoseTime: "2026-03-02T10:45:00", color: "#4A90C4", shape: "round", quickInstruction: "Take on empty stomach" },
    { id: "M002", name: "Metformin", dosage: "500mg", route: "Oral", frequency: "Twice daily", status: "active", nextDoseTime: "2026-03-02T13:00:00", color: "#6B8E6B", shape: "oblong", quickInstruction: "Take with food" },
    { id: "M003", name: "Amlodipine", dosage: "5mg", route: "Oral", frequency: "Once daily (evening)", status: "active", nextDoseTime: "2026-03-02T20:00:00", color: "#9B6BB5", shape: "capsule", quickInstruction: "Avoid grapefruit" },
    { id: "M004", name: "Atorvastatin", dosage: "20mg", route: "Oral", frequency: "Once daily at bedtime", status: "inactive", nextDoseTime: null, color: "#7A8A9A", shape: "oval", quickInstruction: "Take at bedtime" },
  ];
  for (const m of medications) {
    keys.push(`medication:P001:${m.id}`);
    values.push(m);
  }

  // ── Medication Logs ────────────────────────────────────────────────────────
  const medLogs = [
    { id: "ML001", medicationId: "M002", medicationName: "Metformin", patientId: "P001", timestamp: "2026-03-02T07:30:00", status: "taken", notes: "Taken with breakfast" },
    { id: "ML002", medicationId: "M001", medicationName: "Lisinopril", patientId: "P001", timestamp: "2026-03-01T09:00:00", status: "taken", notes: "" },
    { id: "ML003", medicationId: "M003", medicationName: "Amlodipine", patientId: "P001", timestamp: "2026-03-01T20:15:00", status: "taken", notes: "" },
    { id: "ML004", medicationId: "M002", medicationName: "Metformin", patientId: "P001", timestamp: "2026-03-01T07:45:00", status: "taken", notes: "" },
    { id: "ML005", medicationId: "M001", medicationName: "Lisinopril", patientId: "P001", timestamp: "2026-02-28T09:00:00", status: "missed", notes: "Forgot while traveling" },
  ];
  for (const ml of medLogs) {
    keys.push(`medication_log:P001:${ml.id}`);
    values.push(ml);
  }

  // ── Medication Refills ─────────────────────────────────────────────────────
  const refills = [
    {
      medicationId: "M001", pillsRemaining: 18, totalPills: 30,
      refillDueDate: "2026-03-15", lastRefillDate: "2026-02-15",
      prescribingDoctor: "Dr. Emily Chen", prescriptionDate: "2026-01-10",
      orientation: "Take with a full glass of water in the morning, before breakfast. Avoid potassium-rich foods.",
      prescriptionNumber: "RX-20260110-001", pharmacy: "Walgreens – 5th Ave",
      refillHistory: [
        { date: "2026-02-15", quantity: 30 },
        { date: "2026-01-15", quantity: 30 },
        { date: "2025-12-15", quantity: 30 },
      ],
    },
    {
      medicationId: "M002", pillsRemaining: 42, totalPills: 60,
      refillDueDate: "2026-03-20", lastRefillDate: "2026-02-20",
      prescribingDoctor: "Dr. James Park", prescriptionDate: "2026-01-05",
      orientation: "Take with food. Do not crush or chew. If you miss a dose, take it as soon as remembered unless it is close to the next scheduled dose.",
      prescriptionNumber: "RX-20260105-002", pharmacy: "CVS – Main St",
      refillHistory: [
        { date: "2026-02-20", quantity: 60 },
        { date: "2026-01-20", quantity: 60 },
      ],
    },
    {
      medicationId: "M003", pillsRemaining: 7, totalPills: 30,
      refillDueDate: "2026-03-08", lastRefillDate: "2026-02-08",
      prescribingDoctor: "Dr. Emily Chen", prescriptionDate: "2026-01-10",
      orientation: "Take once daily in the evening. May be taken with or without food. Do not take grapefruit juice while on this medication.",
      prescriptionNumber: "RX-20260110-003", pharmacy: "Walgreens – 5th Ave",
      refillHistory: [
        { date: "2026-02-08", quantity: 30 },
        { date: "2026-01-08", quantity: 30 },
      ],
    },
  ];
  for (const r of refills) {
    keys.push(`medication_refill:P001:${r.medicationId}`);
    values.push(r);
  }

  // ── 30-Day Adherence Stats ─────────────────────────────────────────────────
  const adherenceStats = [
    { medicationId: "M001", medicationName: "Lisinopril", dosage: "10mg", takenCount: 24, scheduledCount: 30, color: "#4A90C4", shape: "round" },
    { medicationId: "M002", medicationName: "Metformin", dosage: "500mg", takenCount: 56, scheduledCount: 60, color: "#6B8E6B", shape: "oblong" },
    { medicationId: "M003", medicationName: "Amlodipine", dosage: "5mg", takenCount: 26, scheduledCount: 30, color: "#9B6BB5", shape: "capsule" },
  ];
  for (const a of adherenceStats) {
    keys.push(`medication_adherence:P001:${a.medicationId}`);
    values.push(a);
  }

  // ── Adherence Streaks ────���─────────────────────────────────────────────────
  const streaks = [
    { medicationId: "M001", medicationName: "Lisinopril", dosage: "10mg", color: "#4A90C4", currentStreak: 3, longestStreak: 12, adherence30: 80, adherence60: 78, adherence90: 82, last14Days: [true, true, false, true, true, true, false, true, true, true, false, true, true, true] },
    { medicationId: "M002", medicationName: "Metformin", dosage: "500mg", color: "#6B8E6B", currentStreak: 8, longestStreak: 21, adherence30: 93, adherence60: 91, adherence90: 89, last14Days: [true, true, true, true, false, true, true, true, true, true, true, true, true, true] },
    { medicationId: "M003", medicationName: "Amlodipine", dosage: "5mg", color: "#9B6BB5", currentStreak: 5, longestStreak: 18, adherence30: 87, adherence60: 84, adherence90: 86, last14Days: [true, false, true, true, true, false, true, true, false, true, true, true, true, true] },
  ];
  for (const s of streaks) {
    keys.push(`adherence_streak:P001:${s.medicationId}`);
    values.push(s);
  }

  // ── Correlation Insights ───────────────────────────────────────────────────
  const insights = [
    { id: "CI001", medicationId: "M001", medicationName: "Lisinopril", dosage: "10mg", medColor: "#4A90C4", effect: "energy", effectLabel: "Energy Level", direction: "positive", magnitude: 20, condition: "before 9:00 AM", actionSuggest: "Shift your Lisinopril reminder to 8:30 AM?", sparkData: [58,42,71,65,79,44,73,68,82,76,91,57,83,88], conditionMet: [true,false,true,true,true,false,true,true,true,true,true,false,true,true] },
    { id: "CI002", medicationId: "M002", medicationName: "Metformin", dosage: "500mg", medColor: "#6B8E6B", effect: "nausea", effectLabel: "Nausea Score", direction: "negative", magnitude: 35, condition: "with a full meal", actionSuggest: "Always take Metformin with breakfast or lunch?", sparkData: [72,68,40,38,71,69,42,44,70,73,38,72,68,66], conditionMet: [true,true,false,false,true,true,false,false,true,true,false,true,true,true] },
    { id: "CI003", medicationId: "M003", medicationName: "Amlodipine", dosage: "5mg", medColor: "#9B6BB5", effect: "bp", effectLabel: "Blood Pressure", direction: "positive", magnitude: 12, condition: "at the same time each evening", actionSuggest: "Set a consistent 8:00 PM reminder for Amlodipine?", sparkData: [60,74,78,55,80,82,53,78,83,76,89,81,75,90], conditionMet: [false,true,true,false,true,true,false,true,true,true,true,true,true,true] },
  ];
  for (const ci of insights) {
    keys.push(`correlation_insight:P001:${ci.id}`);
    values.push(ci);
  }

  // ── Missed Dose Summaries ──────────────────────────────────────────────────
  const missedDoses = [
    { id: "MD001", medicationName: "Lisinopril", dosage: "10mg", medColor: "#4A90C4", date: "2026-02-28", scheduledTime: "9:00 AM", reason: "Forgot while traveling" },
    { id: "MD002", medicationName: "Lisinopril", dosage: "10mg", medColor: "#4A90C4", date: "2026-02-22", scheduledTime: "9:00 AM", reason: "Slept through alarm" },
    { id: "MD003", medicationName: "Lisinopril", dosage: "10mg", medColor: "#4A90C4", date: "2026-02-15", scheduledTime: "9:00 AM", reason: "Out of supply" },
    { id: "MD004", medicationName: "Amlodipine", dosage: "5mg", medColor: "#9B6BB5", date: "2026-02-19", scheduledTime: "8:00 PM", reason: "Forgot" },
    { id: "MD005", medicationName: "Amlodipine", dosage: "5mg", medColor: "#9B6BB5", date: "2026-02-10", scheduledTime: "8:00 PM", reason: "Forgot" },
    { id: "MD006", medicationName: "Metformin", dosage: "500mg", medColor: "#6B8E6B", date: "2026-02-25", scheduledTime: "1:00 PM", reason: "Missed lunch dose" },
  ];
  for (const md of missedDoses) {
    keys.push(`missed_dose:P001:${md.id}`);
    values.push(md);
  }

  // ── Observations ───────────────────────────────────────────────────────────
  const observations = [
    { id: "O001", type: "Blood Pressure", loincCode: "85354-9", value: "132/84", unit: "mmHg", subjectId: "P001", effectiveDateTime: "2026-03-02T08:15:00", status: "warning" },
    { id: "O002", type: "Heart Rate", loincCode: "8867-4", value: "76", unit: "bpm", subjectId: "P001", effectiveDateTime: "2026-03-02T08:16:00", status: "normal" },
    { id: "O003", type: "Blood Glucose", loincCode: "2339-0", value: "118", unit: "mg/dL", subjectId: "P001", effectiveDateTime: "2026-03-01T07:30:00", status: "normal" },
    { id: "O004", type: "Weight", loincCode: "29463-7", value: "72.5", unit: "kg", subjectId: "P001", effectiveDateTime: "2026-03-01T09:00:00", status: "normal" },
    { id: "O005", type: "SpO₂", loincCode: "59408-5", value: "98", unit: "%", subjectId: "P001", effectiveDateTime: "2026-02-28T08:00:00", status: "normal" },
  ];
  for (const o of observations) {
    keys.push(`observation:P001:${o.id}`);
    values.push(o);
  }

  // ── Observation Trends ─────────────────────────────────────────────────────
  const trends = [
    {
      type: "Blood Pressure", unit: "mmHg (systolic)",
      data: [
        { date: "2026-02-01", value: 138, status: "warning" }, { date: "2026-02-03", value: 134, status: "warning" },
        { date: "2026-02-05", value: 130, status: "warning" }, { date: "2026-02-08", value: 128, status: "normal" },
        { date: "2026-02-10", value: 135, status: "warning" }, { date: "2026-02-12", value: 131, status: "warning" },
        { date: "2026-02-15", value: 126, status: "normal" },  { date: "2026-02-17", value: 129, status: "normal" },
        { date: "2026-02-19", value: 133, status: "warning" }, { date: "2026-02-22", value: 127, status: "normal" },
        { date: "2026-02-24", value: 130, status: "warning" }, { date: "2026-02-26", value: 128, status: "normal" },
        { date: "2026-02-28", value: 134, status: "warning" }, { date: "2026-03-01", value: 131, status: "warning" },
        { date: "2026-03-02", value: 132, status: "warning" },
      ],
    },
    {
      type: "Blood Glucose", unit: "mg/dL",
      data: [
        { date: "2026-02-01", value: 124, status: "warning" }, { date: "2026-02-04", value: 115, status: "warning" },
        { date: "2026-02-07", value: 108, status: "warning" }, { date: "2026-02-10", value: 112, status: "warning" },
        { date: "2026-02-13", value: 105, status: "warning" }, { date: "2026-02-16", value: 98,  status: "normal" },
        { date: "2026-02-19", value: 110, status: "warning" }, { date: "2026-02-22", value: 102, status: "warning" },
        { date: "2026-02-25", value: 95,  status: "normal" },  { date: "2026-02-28", value: 118, status: "warning" },
        { date: "2026-03-01", value: 118, status: "warning" },
      ],
    },
    {
      type: "Heart Rate", unit: "bpm",
      data: [
        { date: "2026-02-01", value: 72, status: "normal" }, { date: "2026-02-05", value: 78, status: "normal" },
        { date: "2026-02-10", value: 74, status: "normal" }, { date: "2026-02-14", value: 80, status: "normal" },
        { date: "2026-02-18", value: 71, status: "normal" }, { date: "2026-02-22", value: 76, status: "normal" },
        { date: "2026-02-26", value: 73, status: "normal" }, { date: "2026-03-02", value: 76, status: "normal" },
      ],
    },
    {
      type: "Weight", unit: "kg",
      data: [
        { date: "2026-02-01", value: 73.2, status: "normal" }, { date: "2026-02-08", value: 73.0, status: "normal" },
        { date: "2026-02-15", value: 72.8, status: "normal" }, { date: "2026-02-22", value: 72.6, status: "normal" },
        { date: "2026-03-01", value: 72.5, status: "normal" },
      ],
    },
  ];
  for (const t of trends) {
    keys.push(`observation_trend:P001:${t.type}`);
    values.push(t);
  }

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const tasks = [
    { id: "T001", description: "Log morning blood pressure", dueDate: "2026-03-02T10:00:00", priority: "high", status: "completed", completedAt: "2026-03-02T08:15:00" },
    { id: "T002", description: "Take Lisinopril morning dose", dueDate: "2026-03-02T10:45:00", priority: "high", status: "pending", completedAt: null },
    { id: "T003", description: "Log afternoon blood glucose", dueDate: "2026-03-02T13:30:00", priority: "medium", status: "pending", completedAt: null },
    { id: "T004", description: "Complete weekly wellness check-in", dueDate: "2026-03-02T23:59:00", priority: "low", status: "pending", completedAt: null },
    { id: "T005", description: "Review cardiologist notes", dueDate: "2026-03-01T17:00:00", priority: "medium", status: "completed", completedAt: "2026-03-01T16:30:00" },
  ];
  for (const t of tasks) {
    keys.push(`task:P001:${t.id}`);
    values.push(t);
  }

  // ── Appointments ───────────────────────────────────────────────────────────
  const appointments = [
    { id: "A001", start: "2026-03-02T15:30:00", duration: 30, modality: "Video", status: "scheduled", provider: "Dr. Emily Chen", type: "Cardiology Follow-up" },
    { id: "A002", start: "2026-03-03T14:00:00", duration: 60, modality: "In-Person", status: "scheduled", provider: "Dr. James Park", type: "Lab Results Review" },
    { id: "A003", start: "2026-03-10T11:00:00", duration: 30, modality: "Video", status: "scheduled", provider: "Dr. Emily Chen", type: "Monthly Hypertension Check" },
  ];
  for (const a of appointments) {
    keys.push(`appointment:P001:${a.id}`);
    values.push(a);
  }

  // ── Appointment Prep Checklists ────────────────────────────────────────────
  const preps = [
    {
      appointmentId: "A001",
      items: [
        { id: "P001-1", label: "Review recent blood pressure readings", description: "Check your last 7 days of BP logs to discuss trends with Dr. Chen.", category: "health", completed: false },
        { id: "P001-2", label: "List any new symptoms or concerns", description: "Write down anything new: dizziness, headaches, swelling, or changes in how you feel.", category: "questions", completed: false },
        { id: "P001-3", label: "Confirm your medication list is up to date", description: "Make sure your HealthPulse medications match what you're actually taking.", category: "documents", completed: false },
        { id: "P001-4", label: "Test your video call setup", description: "Check your internet, camera, and microphone 15 minutes before the appointment.", category: "logistics", completed: false },
        { id: "P001-5", label: "Prepare questions for your doctor", description: "Examples: 'Should I adjust my Lisinopril dose?' or 'Is my BP improving enough?'", category: "questions", completed: false },
      ],
    },
    {
      appointmentId: "A002",
      items: [
        { id: "P002-1", label: "Bring your photo ID and insurance card", description: "You'll need these for check-in at the front desk.", category: "logistics", completed: false },
        { id: "P002-2", label: "Fast for 8 hours if requested", description: "If Dr. Park asked for fasting labs, don't eat or drink (except water) beforehand.", category: "health", completed: false },
        { id: "P002-3", label: "Review your recent lab results", description: "Look over your Comprehensive Metabolic Panel and Lipid Panel from Feb 28.", category: "documents", completed: false },
        { id: "P002-4", label: "Write down questions about your results", description: "Examples: 'What does my HbA1c of 6.8% mean?' or 'Should I change my diet?'", category: "questions", completed: false },
        { id: "P002-5", label: "Arrive 15 minutes early", description: "Allow time for parking and check-in at the clinic.", category: "logistics", completed: false },
      ],
    },
    {
      appointmentId: "A003",
      items: [
        { id: "P003-1", label: "Log blood pressure daily this week", description: "Dr. Chen will want to see your readings from the full week before this appointment.", category: "health", completed: false },
        { id: "P003-2", label: "Track any side effects from medications", description: "Note any dizziness, fatigue, or other issues you experience this week.", category: "health", completed: false },
        { id: "P003-3", label: "Test your video call setup", description: "Check your internet, camera, and microphone 15 minutes before the appointment.", category: "logistics", completed: false },
        { id: "P003-4", label: "Prepare monthly progress questions", description: "Examples: 'Is my treatment plan working?' or 'Do I need any new tests?'", category: "questions", completed: false },
      ],
    },
  ];
  for (const p of preps) {
    keys.push(`appointment_prep:P001:${p.appointmentId}`);
    values.push(p);
  }

  // ── Lab Results ────────────────────────────────────────────────────────────
  const labResults = [
    {
      id: "LR001", title: "Comprehensive Metabolic Panel", date: "2026-02-28", provider: "Dr. James Park",
      type: "blood_panel", status: "abnormal", pages: 3, fileSize: "1.2 MB",
      highlights: [
        { label: "Glucose (fasting)", value: "118", unit: "mg/dL", status: "warning" },
        { label: "HbA1c", value: "6.8", unit: "%", status: "warning" },
        { label: "Creatinine", value: "0.92", unit: "mg/dL", status: "normal" },
        { label: "eGFR", value: "82", unit: "mL/min", status: "normal" },
        { label: "Potassium", value: "4.1", unit: "mEq/L", status: "normal" },
      ],
    },
    {
      id: "LR002", title: "Lipid Panel", date: "2026-02-28", provider: "Dr. James Park",
      type: "blood_panel", status: "normal", pages: 2, fileSize: "0.8 MB",
      highlights: [
        { label: "Total Cholesterol", value: "188", unit: "mg/dL", status: "normal" },
        { label: "LDL", value: "112", unit: "mg/dL", status: "normal" },
        { label: "HDL", value: "52", unit: "mg/dL", status: "normal" },
        { label: "Triglycerides", value: "148", unit: "mg/dL", status: "normal" },
      ],
    },
    {
      id: "LR003", title: "Cardiac Stress Test", date: "2026-02-10", provider: "Dr. Emily Chen",
      type: "cardiac", status: "normal", pages: 5, fileSize: "3.4 MB",
      highlights: [
        { label: "Max Heart Rate", value: "162", unit: "bpm", status: "normal" },
        { label: "ST Changes", value: "None", unit: "", status: "normal" },
        { label: "Exercise Tolerance", value: "Good", unit: "", status: "normal" },
      ],
    },
    {
      id: "LR004", title: "Urinalysis", date: "2026-01-20", provider: "Dr. James Park",
      type: "urine", status: "normal", pages: 2, fileSize: "0.5 MB",
      highlights: [
        { label: "Protein", value: "Negative", unit: "", status: "normal" },
        { label: "Glucose", value: "Trace", unit: "", status: "warning" },
        { label: "pH", value: "6.5", unit: "", status: "normal" },
      ],
    },
  ];
  for (const lr of labResults) {
    keys.push(`lab_result:P001:${lr.id}`);
    values.push(lr);
  }

  // ── Lab Interpretations ────────────────────────────────────────────────────
  const labInterpretations = [
    {
      labId: "LR001", headline: "Your blood sugar numbers need attention",
      summary: "Most of your results look healthy, but two numbers — your fasting glucose and HbA1c — are higher than the target range. This means your blood sugar has been running a little high over the last few months.",
      keyPoints: [
        { label: "Fasting Glucose", text: "118 mg/dL is above the normal range of 70–99. This puts it in the 'prediabetes' zone. Diet and medication adjustments can help bring it down.", sentiment: "caution" },
        { label: "HbA1c", text: "6.8% is slightly above the 6.5% threshold. It shows your average blood sugar over 3 months. Your doctor may want to adjust your Metformin dosage.", sentiment: "caution" },
        { label: "Kidney Function", text: "Your creatinine (0.92) and eGFR (82) look healthy. This means your kidneys are filtering well — important to monitor with diabetes and blood pressure medication.", sentiment: "positive" },
        { label: "Potassium", text: "4.1 mEq/L is in the normal range. This is important to check because Lisinopril can sometimes raise potassium levels.", sentiment: "positive" },
      ],
      nextSteps: "Discuss your glucose and HbA1c with Dr. Park at your upcoming Lab Results Review appointment. Ask about adjusting your Metformin dose or making dietary changes.",
    },
    {
      labId: "LR002", headline: "Your cholesterol looks great!",
      summary: "All four cholesterol markers are in healthy ranges. This is a positive sign that your current treatment and lifestyle are working well together.",
      keyPoints: [
        { label: "Total Cholesterol", text: "188 mg/dL is below 200, which is the healthy target. Great job!", sentiment: "positive" },
        { label: "LDL ('Bad')", text: "112 mg/dL is within an acceptable range. For people with hypertension, keeping LDL under 130 is typically recommended.", sentiment: "positive" },
        { label: "HDL ('Good')", text: "52 mg/dL is above the minimum of 40 for men and 50 for women. Higher HDL helps protect your heart.", sentiment: "positive" },
        { label: "Triglycerides", text: "148 mg/dL is under the 150 target. Triglycerides can go up with high-sugar diets, so this is a good sign for your diabetes management.", sentiment: "positive" },
      ],
      nextSteps: "No immediate action needed. Continue your current medications and healthy eating habits. Your next lipid panel will likely be in 6 months.",
    },
    {
      labId: "LR003", headline: "Your heart handled the stress test well",
      summary: "The cardiac stress test showed that your heart is responding normally to exercise. No concerning changes were found in your heart rhythm during the test.",
      keyPoints: [
        { label: "Heart Rate Response", text: "Your heart reached 162 bpm during exercise, which is a healthy response for your age.", sentiment: "positive" },
        { label: "Heart Rhythm", text: "No ST segment changes were detected. This means there are no signs of reduced blood flow to the heart during exercise.", sentiment: "positive" },
        { label: "Exercise Tolerance", text: "Your ability to exercise was rated as 'Good,' meaning your heart and lungs are working well together.", sentiment: "positive" },
      ],
      nextSteps: "This is reassuring news. Continue your blood pressure medications as prescribed. Stay physically active — walking 30 minutes daily is a great target.",
    },
    {
      labId: "LR004", headline: "Urine test is mostly normal",
      summary: "Your urinalysis shows healthy kidney function overall. A tiny trace of glucose was found in your urine, which can happen with elevated blood sugar levels.",
      keyPoints: [
        { label: "Protein", text: "Negative — this is good news. Protein in urine can be an early sign of kidney stress, especially with diabetes.", sentiment: "positive" },
        { label: "Glucose", text: "Trace amounts were found. This can happen when blood sugar runs above 180 mg/dL. It's not alarming, but it connects to your elevated fasting glucose.", sentiment: "caution" },
        { label: "pH Level", text: "6.5 is in the normal range of 4.5–8.0. This shows your kidneys are balancing acid levels properly.", sentiment: "positive" },
      ],
      nextSteps: "The trace glucose is worth monitoring. Focus on keeping your blood sugar in range with diet and Metformin. Mention this finding to Dr. Park at your next visit.",
    },
  ];
  for (const li of labInterpretations) {
    keys.push(`lab_interpretation:P001:${li.labId}`);
    values.push(li);
  }

  // ── Batch write ────────────────────────────────────────────────────────────
  // mset has a practical limit; split into chunks of 50
  const CHUNK = 50;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const kSlice = keys.slice(i, i + CHUNK);
    const vSlice = values.slice(i, i + CHUNK);
    await kv.mset(kSlice, vSlice);
  }

  return { seeded: keys.length };
}

/** Check if data has already been seeded */
export async function isSeeded(): Promise<boolean> {
  const patient = await kv.get("patient:P001");
  return patient !== null && patient !== undefined;
}
