/**
 * HealthPulse · API Routes
 * ═══════════════════════════════════════════════════════════════════════════════
 * All CRUD routes for the 5 ORCA objects + supporting entities.
 * Every route is prefixed with /make-server-2115a836.
 *
 * Entity KV key schema:
 *   {entity}:{patientId}:{entityId}
 *
 * Listing uses kv.getByPrefix("{entity}:{patientId}:")
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { seedAllData, isSeeded } from "./seed.tsx";

const PREFIX = "/make-server-2115a836";
const routes = new Hono();

// ─── Utility: error response ─────────────────────────────────────────────────
function errJson(c: any, msg: string, status: number = 500) {
  console.log(`[ERROR] ${msg}`);
  return c.json({ error: msg }, status);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED / INIT
// ═══════════════════════════════════════════════════════════════════════════════

/** POST /seed — Idempotent bootstrap of all mock data */
routes.post(`${PREFIX}/seed`, async (c) => {
  try {
    const alreadySeeded = await isSeeded();
    if (alreadySeeded) {
      return c.json({ message: "Data already seeded", seeded: 0 });
    }
    const result = await seedAllData();
    console.log(`[SEED] Seeded ${result.seeded} records`);
    return c.json({ message: "Seed complete", seeded: result.seeded });
  } catch (e: any) {
    return errJson(c, `Seed failed: ${e.message}`);
  }
});

/** POST /reseed — Force re-seed (overwrites existing data) */
routes.post(`${PREFIX}/reseed`, async (c) => {
  try {
    const result = await seedAllData();
    console.log(`[RESEED] Reseeded ${result.seeded} records`);
    return c.json({ message: "Reseed complete", seeded: result.seeded });
  } catch (e: any) {
    return errJson(c, `Reseed failed: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /patient/:id */
routes.get(`${PREFIX}/patient/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await kv.get(`patient:${id}`);
    if (!data) return errJson(c, `Patient ${id} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching patient: ${e.message}`);
  }
});

/** PUT /patient/:id */
routes.put(`${PREFIX}/patient/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`patient:${id}`);
    const updated = { ...existing, ...body, id };
    await kv.set(`patient:${id}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating patient: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /medications/:patientId — List all medications */
routes.get(`${PREFIX}/medications/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`medication:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing medications: ${e.message}`);
  }
});

/** GET /medications/:patientId/:id — Single medication */
routes.get(`${PREFIX}/medications/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const data = await kv.get(`medication:${pid}:${id}`);
    if (!data) return errJson(c, `Medication ${id} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching medication: ${e.message}`);
  }
});

/** PUT /medications/:patientId/:id — Update medication */
routes.put(`${PREFIX}/medications/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`medication:${pid}:${id}`);
    const updated = { ...existing, ...body, id };
    await kv.set(`medication:${pid}:${id}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating medication: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION LOGS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /medication-logs/:patientId — List all logs */
routes.get(`${PREFIX}/medication-logs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`medication_log:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing medication logs: ${e.message}`);
  }
});

/** POST /medication-logs/:patientId — Create new dose log */
routes.post(`${PREFIX}/medication-logs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `ML${Date.now()}`;
    const entry = { ...body, id, patientId: pid };
    await kv.set(`medication_log:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating medication log: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION REFILLS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /medication-refills/:patientId — List all refill data */
routes.get(`${PREFIX}/medication-refills/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`medication_refill:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing refills: ${e.message}`);
  }
});

/** GET /medication-refills/:patientId/:medId — Refill for specific med */
routes.get(`${PREFIX}/medication-refills/:patientId/:medId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const medId = c.req.param("medId");
    const data = await kv.get(`medication_refill:${pid}:${medId}`);
    if (!data) return errJson(c, `Refill data for ${medId} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching refill: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION ADHERENCE (30-day stats)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /adherence/:patientId — All adherence stats */
routes.get(`${PREFIX}/adherence/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`medication_adherence:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing adherence: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ADHERENCE STREAKS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /streaks/:patientId — All streak data */
routes.get(`${PREFIX}/streaks/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`adherence_streak:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing streaks: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CORRELATION INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /insights/:patientId — All correlation insights */
routes.get(`${PREFIX}/insights/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`correlation_insight:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing insights: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MISSED DOSES
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /missed-doses/:patientId — All missed dose summaries */
routes.get(`${PREFIX}/missed-doses/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`missed_dose:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing missed doses: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  OBSERVATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /observations/:patientId — List all observations */
routes.get(`${PREFIX}/observations/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`observation:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing observations: ${e.message}`);
  }
});

/** POST /observations/:patientId — Log new observation */
routes.post(`${PREFIX}/observations/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `O${Date.now()}`;
    const entry = { ...body, id, subjectId: pid };
    await kv.set(`observation:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating observation: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  OBSERVATION TRENDS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /observation-trends/:patientId — All trend data */
routes.get(`${PREFIX}/observation-trends/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`observation_trend:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing trends: ${e.message}`);
  }
});

/** GET /observation-trends/:patientId/:type — Trend for specific type */
routes.get(`${PREFIX}/observation-trends/:patientId/:type`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const type = decodeURIComponent(c.req.param("type"));
    const data = await kv.get(`observation_trend:${pid}:${type}`);
    if (!data) return errJson(c, `Trend for ${type} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching trend: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TASKS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /tasks/:patientId — List all tasks */
routes.get(`${PREFIX}/tasks/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`task:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing tasks: ${e.message}`);
  }
});

/** POST /tasks/:patientId — Create new task */
routes.post(`${PREFIX}/tasks/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `T${Date.now()}`;
    const entry = { ...body, id };
    await kv.set(`task:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating task: ${e.message}`);
  }
});

/** PUT /tasks/:patientId/:id — Update task (e.g., toggle completion) */
routes.put(`${PREFIX}/tasks/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`task:${pid}:${id}`);
    if (!existing) return errJson(c, `Task ${id} not found`, 404);
    const updated = { ...existing, ...body, id };
    await kv.set(`task:${pid}:${id}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating task: ${e.message}`);
  }
});

/** DELETE /tasks/:patientId/:id */
routes.delete(`${PREFIX}/tasks/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    await kv.del(`task:${pid}:${id}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting task: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /appointments/:patientId — List all appointments */
routes.get(`${PREFIX}/appointments/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`appointment:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing appointments: ${e.message}`);
  }
});

/** GET /appointments/:patientId/:id — Single appointment */
routes.get(`${PREFIX}/appointments/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const data = await kv.get(`appointment:${pid}:${id}`);
    if (!data) return errJson(c, `Appointment ${id} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching appointment: ${e.message}`);
  }
});

/** PUT /appointments/:patientId/:id — Update appointment */
routes.put(`${PREFIX}/appointments/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`appointment:${pid}:${id}`);
    if (!existing) return errJson(c, `Appointment ${id} not found`, 404);
    const updated = { ...existing, ...body, id };
    await kv.set(`appointment:${pid}:${id}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating appointment: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENT PREP
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /appointment-prep/:patientId/:apptId — Prep checklist */
routes.get(`${PREFIX}/appointment-prep/:patientId/:apptId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const apptId = c.req.param("apptId");
    const data = await kv.get(`appointment_prep:${pid}:${apptId}`);
    if (!data) return errJson(c, `Prep for appointment ${apptId} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching appointment prep: ${e.message}`);
  }
});

/** PUT /appointment-prep/:patientId/:apptId — Update prep (toggle items) */
routes.put(`${PREFIX}/appointment-prep/:patientId/:apptId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const apptId = c.req.param("apptId");
    const body = await c.req.json();
    const existing = await kv.get(`appointment_prep:${pid}:${apptId}`);
    if (!existing) return errJson(c, `Prep for appointment ${apptId} not found`, 404);
    const updated = { ...existing, ...body, appointmentId: apptId };
    await kv.set(`appointment_prep:${pid}:${apptId}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating appointment prep: ${e.message}`);
  }
});

/** PUT /appointment-prep/:patientId/:apptId/toggle/:itemId — Toggle single prep item */
routes.put(`${PREFIX}/appointment-prep/:patientId/:apptId/toggle/:itemId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const apptId = c.req.param("apptId");
    const itemId = c.req.param("itemId");
    const prep = await kv.get(`appointment_prep:${pid}:${apptId}`);
    if (!prep) return errJson(c, `Prep for appointment ${apptId} not found`, 404);
    const items = prep.items.map((item: any) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updated = { ...prep, items };
    await kv.set(`appointment_prep:${pid}:${apptId}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error toggling prep item: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  LAB RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /labs/:patientId — List all lab results */
routes.get(`${PREFIX}/labs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`lab_result:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing labs: ${e.message}`);
  }
});

/** GET /labs/:patientId/:id — Single lab result */
routes.get(`${PREFIX}/labs/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const data = await kv.get(`lab_result:${pid}:${id}`);
    if (!data) return errJson(c, `Lab ${id} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching lab: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  LAB INTERPRETATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /lab-interpretation/:patientId/:labId — Interpretation for specific lab */
routes.get(`${PREFIX}/lab-interpretation/:patientId/:labId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const labId = c.req.param("labId");
    const data = await kv.get(`lab_interpretation:${pid}:${labId}`);
    if (!data) return errJson(c, `Interpretation for lab ${labId} not found`, 404);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching lab interpretation: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  HEALTH PROFILE (Onboarding Wizard)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /health-profile/:patientId */
routes.get(`${PREFIX}/health-profile/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.get(`health_profile:${pid}`);
    if (!data) return c.json(null);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching health profile: ${e.message}`);
  }
});

/** POST /health-profile/:patientId — Save onboarding data */
routes.post(`${PREFIX}/health-profile/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const profile = { ...body, patientId: pid, savedAt: new Date().toISOString() };
    await kv.set(`health_profile:${pid}`, profile);
    return c.json(profile, 201);
  } catch (e: any) {
    return errJson(c, `Error saving health profile: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOOD PRESSURE READINGS
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /bp-readings/:patientId — List all BP readings */
routes.get(`${PREFIX}/bp-readings/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`bp_reading:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing BP readings: ${e.message}`);
  }
});

/** POST /bp-readings/:patientId — Create new BP reading */
routes.post(`${PREFIX}/bp-readings/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `BP${Date.now()}`;
    const entry = { ...body, id, patientId: pid };
    await kv.set(`bp_reading:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating BP reading: ${e.message}`);
  }
});

/** DELETE /bp-readings/:patientId/:id */
routes.delete(`${PREFIX}/bp-readings/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    await kv.del(`bp_reading:${pid}:${id}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting BP reading: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GLUCOSE ENTRIES (Sugar Level Tracker)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /glucose-entries/:patientId — List all glucose entries */
routes.get(`${PREFIX}/glucose-entries/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`glucose_entry:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing glucose entries: ${e.message}`);
  }
});

/** POST /glucose-entries/:patientId — Create new glucose entry */
routes.post(`${PREFIX}/glucose-entries/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `GL${Date.now()}`;
    const entry = { ...body, id, patientId: pid };
    await kv.set(`glucose_entry:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating glucose entry: ${e.message}`);
  }
});

/** DELETE /glucose-entries/:patientId/:id */
routes.delete(`${PREFIX}/glucose-entries/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    await kv.del(`glucose_entry:${pid}:${id}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting glucose entry: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  DAILY CHECK-INS (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /checkins/:patientId — List all check-ins */
routes.get(`${PREFIX}/checkins/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`checkin:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing check-ins: ${e.message}`);
  }
});

/** GET /checkins/:patientId/today — Today's check-in only */
routes.get(`${PREFIX}/checkins/:patientId/today`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const today = new Date().toISOString().split("T")[0];
    const data = await kv.get(`checkin:${pid}:${today}`);
    return c.json(data || null);
  } catch (e: any) {
    return errJson(c, `Error fetching today's check-in: ${e.message}`);
  }
});

/** POST /checkins/:patientId — Create or update today's check-in */
routes.post(`${PREFIX}/checkins/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const today = new Date().toISOString().split("T")[0];
    const id = body.id || `CK-${today}`;
    const entry = { ...body, id, patientId: pid, date: today, savedAt: new Date().toISOString() };
    await kv.set(`checkin:${pid}:${today}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error saving check-in: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EMOTIONAL CHECK-INS (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /emotional-checkins/:patientId — List all emotional check-ins */
routes.get(`${PREFIX}/emotional-checkins/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`emotion:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing emotional check-ins: ${e.message}`);
  }
});

/** POST /emotional-checkins/:patientId — Create emotional check-in */
routes.post(`${PREFIX}/emotional-checkins/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `EM${Date.now()}`;
    const entry = { ...body, id, patientId: pid, timestamp: new Date().toISOString() };
    await kv.set(`emotion:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error saving emotional check-in: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MISSED DOSE RECOVERY (Sprint 5 — Behavioral Scaffolding)
// ═══════════════════════════════════════════════════════════════════════════════

/** POST /dose-recovery/:patientId — Log missed dose recovery action */
routes.post(`${PREFIX}/dose-recovery/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `DR${Date.now()}`;
    const entry = { ...body, id, patientId: pid, timestamp: new Date().toISOString() };
    await kv.set(`dose_recovery:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error saving dose recovery: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION CHANGE REQUESTS (Sprint 7 — Care Plan Self-Management)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /med-change-requests/:patientId — List all change requests */
routes.get(`${PREFIX}/med-change-requests/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`med_change_req:${pid}:`);
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing medication change requests: ${e.message}`);
  }
});

/** POST /med-change-requests/:patientId — Create a medication change request */
routes.post(`${PREFIX}/med-change-requests/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `MCR${Date.now()}`;

    // Determine if doctor approval is needed
    const patient = await kv.get(`patient:${pid}`);
    const prefs = await kv.get(`care_plan_prefs:${pid}`);
    const age = patient?.birthDate
      ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    const ageThreshold = prefs?.ageThreshold ?? 52;
    const requireApproval = prefs?.requireDoctorApproval ?? (age >= ageThreshold);
    const status = requireApproval ? "pending" : "auto_approved";

    const entry = {
      ...body,
      id,
      patientId: pid,
      status,
      requiresApproval: requireApproval,
      createdAt: new Date().toISOString(),
      reviewedAt: status === "auto_approved" ? new Date().toISOString() : null,
      reviewedBy: status === "auto_approved" ? "system" : null,
      reviewNote: status === "auto_approved" ? "Auto-approved: patient age below threshold" : null,
    };
    await kv.set(`med_change_req:${pid}:${id}`, entry);

    // If auto-approved, apply the change immediately
    if (status === "auto_approved") {
      await applyMedChange(pid, entry);
    }

    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating medication change request: ${e.message}`);
  }
});

/** PUT /med-change-requests/:patientId/:id — Update (approve/deny) a change request */
routes.put(`${PREFIX}/med-change-requests/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`med_change_req:${pid}:${id}`);
    if (!existing) return errJson(c, `Change request ${id} not found`, 404);

    const updated = {
      ...existing,
      ...body,
      id,
      reviewedAt: new Date().toISOString(),
    };
    await kv.set(`med_change_req:${pid}:${id}`, updated);

    // If approved, apply the medication change
    if (updated.status === "approved") {
      await applyMedChange(pid, updated);
    }

    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating medication change request: ${e.message}`);
  }
});

/** Helper: Apply a medication change to the actual medication record */
async function applyMedChange(pid: string, request: any) {
  try {
    if (request.changeType === "add") {
      const medId = request.newMedication?.id || `M${Date.now()}`;
      const med = {
        ...request.newMedication,
        id: medId,
        status: "active",
      };
      await kv.set(`medication:${pid}:${medId}`, med);
    } else if (request.changeType === "edit_dose") {
      const existing = await kv.get(`medication:${pid}:${request.medicationId}`);
      if (existing) {
        const updated = { ...existing, dosage: request.newDosage };
        if (request.newFrequency) updated.frequency = request.newFrequency;
        await kv.set(`medication:${pid}:${request.medicationId}`, updated);
      }
    } else if (request.changeType === "discontinue") {
      const existing = await kv.get(`medication:${pid}:${request.medicationId}`);
      if (existing) {
        await kv.set(`medication:${pid}:${request.medicationId}`, { ...existing, status: "inactive" });
      }
    }
  } catch (e: any) {
    console.log(`[applyMedChange] Error applying change: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN PREFERENCES (Sprint 7 — Profile Settings)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /care-plan-prefs/:patientId */
routes.get(`${PREFIX}/care-plan-prefs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.get(`care_plan_prefs:${pid}`);
    // Return defaults if none saved
    if (!data) {
      const patient = await kv.get(`patient:${pid}`);
      const age = patient?.birthDate
        ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;
      return c.json({
        patientId: pid,
        requireDoctorApproval: age >= 52,
        ageThreshold: 52,
        notificationPreference: "in_app",
      });
    }
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching care plan preferences: ${e.message}`);
  }
});

/** PUT /care-plan-prefs/:patientId */
routes.put(`${PREFIX}/care-plan-prefs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const existing = (await kv.get(`care_plan_prefs:${pid}`)) || {};
    const updated = { ...existing, ...body, patientId: pid, updatedAt: new Date().toISOString() };
    await kv.set(`care_plan_prefs:${pid}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating care plan preferences: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN SCORE (Sprint 7 — Composite Health Score)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /care-plan-score/:patientId — Computed composite score */
routes.get(`${PREFIX}/care-plan-score/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");

    const [
      adherenceStats,
      streaks,
      observations,
      tasks,
      appointments,
      checkins,
      medications,
    ] = await Promise.all([
      kv.getByPrefix(`medication_adherence:${pid}:`),
      kv.getByPrefix(`adherence_streak:${pid}:`),
      kv.getByPrefix(`observation:${pid}:`),
      kv.getByPrefix(`task:${pid}:`),
      kv.getByPrefix(`appointment:${pid}:`),
      kv.getByPrefix(`checkin:${pid}:`),
      kv.getByPrefix(`medication:${pid}:`),
    ]);

    // 1. Medication adherence (35%) — average adherence across all meds
    let medScore = 100;
    if (adherenceStats.length > 0) {
      const totalAdherence = adherenceStats.reduce((sum: number, a: any) => {
        const pct = a.scheduledCount > 0 ? (a.takenCount / a.scheduledCount) * 100 : 100;
        return sum + pct;
      }, 0);
      medScore = Math.round(totalAdherence / adherenceStats.length);
    }

    // 2. Vitals logging consistency (20%) — how many days in last 14 have observations
    let vitalsScore = 100;
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentObs = observations.filter((o: any) => new Date(o.effectiveDateTime) > fourteenDaysAgo);
    const uniqueObsDays = new Set(recentObs.map((o: any) => new Date(o.effectiveDateTime).toDateString())).size;
    vitalsScore = Math.min(100, Math.round((uniqueObsDays / 10) * 100)); // 10 of 14 days = 100%

    // 3. Appointment attendance (15%) — completed vs total
    let apptScore = 100;
    if (appointments.length > 0) {
      const completed = appointments.filter((a: any) => a.status === "completed").length;
      const cancelled = appointments.filter((a: any) => a.status === "cancelled").length;
      const relevant = completed + cancelled;
      apptScore = relevant > 0 ? Math.round((completed / relevant) * 100) : 100;
    }

    // 4. Task completion rate (15%) — completed vs total
    let taskScore = 100;
    if (tasks.length > 0) {
      const completed = tasks.filter((t: any) => t.status === "completed").length;
      taskScore = Math.round((completed / tasks.length) * 100);
    }

    // 5. Daily check-in streak (15%) — checkins in last 7 days
    let checkinScore = 100;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCheckins = checkins.filter((ci: any) => new Date(ci.savedAt || ci.date) > sevenDaysAgo);
    checkinScore = Math.min(100, Math.round((recentCheckins.length / 5) * 100)); // 5 of 7 days = 100%

    // Weighted composite
    const composite = Math.round(
      medScore * 0.35 +
      vitalsScore * 0.20 +
      apptScore * 0.15 +
      taskScore * 0.15 +
      checkinScore * 0.15
    );

    // Badge level
    const badge = composite >= 90 ? "gold" : composite >= 75 ? "silver" : composite >= 60 ? "bronze" : "none";

    // Trend — last 4 weeks (simulated for demo)
    const weeklyTrend = [
      Math.max(0, Math.min(100, composite - 8 + Math.floor(Math.random() * 5))),
      Math.max(0, Math.min(100, composite - 5 + Math.floor(Math.random() * 5))),
      Math.max(0, Math.min(100, composite - 2 + Math.floor(Math.random() * 5))),
      composite,
    ];

    return c.json({
      patientId: pid,
      composite,
      badge,
      breakdown: {
        medication: { score: medScore, weight: 35, label: "Medication Adherence" },
        vitals: { score: vitalsScore, weight: 20, label: "Vitals Tracking" },
        appointments: { score: apptScore, weight: 15, label: "Appointment Attendance" },
        tasks: { score: taskScore, weight: 15, label: "Task Completion" },
        checkins: { score: checkinScore, weight: 15, label: "Daily Check-ins" },
      },
      weeklyTrend,
      activeMedications: medications.filter((m: any) => m.status === "active").length,
      computedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return errJson(c, `Error computing care plan score: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDICATION CREATE & DELETE (Sprint 7 — Full CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

/** POST /medications/:patientId — Create new medication */
routes.post(`${PREFIX}/medications/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `M${Date.now()}`;
    const entry = { ...body, id };
    await kv.set(`medication:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating medication: ${e.message}`);
  }
});

/** DELETE /medications/:patientId/:id — Delete medication */
routes.delete(`${PREFIX}/medications/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    await kv.del(`medication:${pid}:${id}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting medication: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  AGGREGATE: Dashboard data (reduces round-trips)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /dashboard/:patientId — All data needed for the home dashboard */
routes.get(`${PREFIX}/dashboard/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const [
      patient,
      medications,
      medicationLogs,
      observations,
      tasks,
      appointments,
      adherenceStats,
      streaks,
      insights,
      missedDoses,
    ] = await Promise.all([
      kv.get(`patient:${pid}`),
      kv.getByPrefix(`medication:${pid}:`),
      kv.getByPrefix(`medication_log:${pid}:`),
      kv.getByPrefix(`observation:${pid}:`),
      kv.getByPrefix(`task:${pid}:`),
      kv.getByPrefix(`appointment:${pid}:`),
      kv.getByPrefix(`medication_adherence:${pid}:`),
      kv.getByPrefix(`adherence_streak:${pid}:`),
      kv.getByPrefix(`correlation_insight:${pid}:`),
      kv.getByPrefix(`missed_dose:${pid}:`),
    ]);

    return c.json({
      patient,
      medications,
      medicationLogs,
      observations,
      tasks,
      appointments,
      adherenceStats,
      streaks,
      insights,
      missedDoses,
    });
  } catch (e: any) {
    return errJson(c, `Error fetching dashboard: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CARE PLAN GOALS & MILESTONES (Sprint 8 — P2)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /goals/:patientId — List all goals */
routes.get(`${PREFIX}/goals/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goals = await kv.getByPrefix(`goal:${pid}:`);
    // Attach milestones to each goal
    const enriched = await Promise.all(
      goals.map(async (g: any) => {
        const milestones = await kv.getByPrefix(`milestone:${pid}:${g.id}:`);
        const sorted = milestones.sort((a: any, b: any) => a.order - b.order);
        const completedCount = sorted.filter((m: any) => m.completed).length;
        const progress = sorted.length > 0 ? Math.round((completedCount / sorted.length) * 100) : 0;
        return { ...g, milestones: sorted, progress, completedMilestones: completedCount, totalMilestones: sorted.length };
      })
    );
    return c.json(enriched);
  } catch (e: any) {
    return errJson(c, `Error listing goals: ${e.message}`);
  }
});

/** GET /goals/:patientId/:goalId — Single goal with milestones */
routes.get(`${PREFIX}/goals/:patientId/:goalId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    const goal = await kv.get(`goal:${pid}:${goalId}`);
    if (!goal) return errJson(c, `Goal ${goalId} not found`, 404);
    const milestones = await kv.getByPrefix(`milestone:${pid}:${goalId}:`);
    const sorted = milestones.sort((a: any, b: any) => a.order - b.order);
    const completedCount = sorted.filter((m: any) => m.completed).length;
    const progress = sorted.length > 0 ? Math.round((completedCount / sorted.length) * 100) : 0;
    return c.json({ ...goal, milestones: sorted, progress, completedMilestones: completedCount, totalMilestones: sorted.length });
  } catch (e: any) {
    return errJson(c, `Error fetching goal: ${e.message}`);
  }
});

/** POST /goals/:patientId — Create new goal */
routes.post(`${PREFIX}/goals/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `G${Date.now()}`;
    const entry = {
      ...body,
      id,
      patientId: pid,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`goal:${pid}:${id}`, entry);

    // Create milestones if provided
    const milestones = body.milestones || [];
    for (let i = 0; i < milestones.length; i++) {
      const ms = milestones[i];
      const msId = ms.id || `MS${Date.now()}_${i}`;
      const msEntry = {
        ...ms,
        id: msId,
        goalId: id,
        patientId: pid,
        order: ms.order ?? i,
        completed: false,
        completedAt: null,
      };
      await kv.set(`milestone:${pid}:${id}:${msId}`, msEntry);
    }

    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating goal: ${e.message}`);
  }
});

/** PUT /goals/:patientId/:goalId — Update goal */
routes.put(`${PREFIX}/goals/:patientId/:goalId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    const body = await c.req.json();
    const existing = await kv.get(`goal:${pid}:${goalId}`);
    const updated = { ...existing, ...body, id: goalId, patientId: pid, updatedAt: new Date().toISOString() };
    await kv.set(`goal:${pid}:${goalId}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating goal: ${e.message}`);
  }
});

/** DELETE /goals/:patientId/:goalId — Delete goal and its milestones */
routes.delete(`${PREFIX}/goals/:patientId/:goalId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    // Delete all milestones first
    const milestones = await kv.getByPrefix(`milestone:${pid}:${goalId}:`);
    for (const ms of milestones) {
      await kv.del(`milestone:${pid}:${goalId}:${(ms as any).id}`);
    }
    await kv.del(`goal:${pid}:${goalId}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting goal: ${e.message}`);
  }
});

/** POST /goals/:patientId/:goalId/milestones — Add milestone */
routes.post(`${PREFIX}/goals/:patientId/:goalId/milestones`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    const body = await c.req.json();
    const id = body.id || `MS${Date.now()}`;
    // Find highest order
    const existing = await kv.getByPrefix(`milestone:${pid}:${goalId}:`);
    const maxOrder = existing.reduce((max: number, m: any) => Math.max(max, m.order ?? 0), -1);
    const entry = {
      ...body,
      id,
      goalId,
      patientId: pid,
      order: body.order ?? maxOrder + 1,
      completed: false,
      completedAt: null,
    };
    await kv.set(`milestone:${pid}:${goalId}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating milestone: ${e.message}`);
  }
});

/** PUT /goals/:patientId/:goalId/milestones/:msId/toggle — Toggle milestone */
routes.put(`${PREFIX}/goals/:patientId/:goalId/milestones/:msId/toggle`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    const msId = c.req.param("msId");
    const existing = await kv.get(`milestone:${pid}:${goalId}:${msId}`);
    if (!existing) return errJson(c, `Milestone ${msId} not found`, 404);
    const toggled = {
      ...existing,
      completed: !(existing as any).completed,
      completedAt: !(existing as any).completed ? new Date().toISOString() : null,
    };
    await kv.set(`milestone:${pid}:${goalId}:${msId}`, toggled);

    // Check if all milestones completed → auto-complete goal
    const allMs = await kv.getByPrefix(`milestone:${pid}:${goalId}:`);
    const allMsUpdated = allMs.map((m: any) => m.id === msId ? toggled : m);
    const allCompleted = allMsUpdated.length > 0 && allMsUpdated.every((m: any) => m.completed);
    if (allCompleted) {
      const goal = await kv.get(`goal:${pid}:${goalId}`);
      if (goal) {
        await kv.set(`goal:${pid}:${goalId}`, { ...goal, status: "completed", updatedAt: new Date().toISOString() });
      }
    }

    return c.json(toggled);
  } catch (e: any) {
    return errJson(c, `Error toggling milestone: ${e.message}`);
  }
});

/** DELETE /goals/:patientId/:goalId/milestones/:msId — Delete milestone */
routes.delete(`${PREFIX}/goals/:patientId/:goalId/milestones/:msId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const goalId = c.req.param("goalId");
    const msId = c.req.param("msId");
    await kv.del(`milestone:${pid}:${goalId}:${msId}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting milestone: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS — Persisted Push-Style Alerts (Sprint 9)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /notifications/:patientId — List all notifications */
routes.get(`${PREFIX}/notifications/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.getByPrefix(`notification:${pid}:`);
    data.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error listing notifications: ${e.message}`);
  }
});

/** POST /notifications/:patientId — Create a single notification */
routes.post(`${PREFIX}/notifications/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const id = body.id || `NTF${Date.now()}`;
    const entry = {
      ...body,
      id,
      patientId: pid,
      read: false,
      dismissed: false,
      createdAt: body.createdAt || new Date().toISOString(),
    };
    await kv.set(`notification:${pid}:${id}`, entry);
    return c.json(entry, 201);
  } catch (e: any) {
    return errJson(c, `Error creating notification: ${e.message}`);
  }
});

/** PUT /notifications/:patientId/mark-all-read — Batch mark all as read */
/** NOTE: Must be registered BEFORE the /:id route to avoid parameter matching */
routes.put(`${PREFIX}/notifications/:patientId/mark-all-read`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const all = await kv.getByPrefix(`notification:${pid}:`);
    let count = 0;
    for (const n of all) {
      if (!(n as any).read) {
        await kv.set(`notification:${pid}:${(n as any).id}`, { ...n, read: true });
        count++;
      }
    }
    return c.json({ marked: count });
  } catch (e: any) {
    return errJson(c, `Error marking all notifications read: ${e.message}`);
  }
});

/** PUT /notifications/:patientId/:id — Update notification (mark read, dismiss) */
routes.put(`${PREFIX}/notifications/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`notification:${pid}:${id}`);
    if (!existing) return errJson(c, `Notification ${id} not found`, 404);
    const updated = { ...existing, ...body, id, patientId: pid };
    await kv.set(`notification:${pid}:${id}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating notification: ${e.message}`);
  }
});

/** DELETE /notifications/:patientId/:id — Dismiss a notification */
routes.delete(`${PREFIX}/notifications/:patientId/:id`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const id = c.req.param("id");
    await kv.del(`notification:${pid}:${id}`);
    return c.json({ deleted: true });
  } catch (e: any) {
    return errJson(c, `Error deleting notification: ${e.message}`);
  }
});

/**
 * POST /notifications/:patientId/generate — Server-side scheduled notification generation
 * Scans medications, observations, and appointments to produce persisted alerts.
 * Idempotent: skips if a notification with the same sourceKey already exists.
 */
routes.post(`${PREFIX}/notifications/:patientId/generate`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const now = new Date();

    // Load prefs to check muted types and per-medication muting
    const prefs = (await kv.get(`notification_prefs:${pid}`)) as any || {};
    const mutedTypes: string[] = prefs.mutedTypes || [];
    const mutedMedicationIds: string[] = prefs.mutedMedicationIds || [];

    // Load existing notifications to deduplicate
    const existing = await kv.getByPrefix(`notification:${pid}:`);
    const existingKeys = new Set(existing.map((n: any) => n.sourceKey).filter(Boolean));

    const [medications, medicationLogs, observations, appointments] = await Promise.all([
      kv.getByPrefix(`medication:${pid}:`),
      kv.getByPrefix(`medication_log:${pid}:`),
      kv.getByPrefix(`observation:${pid}:`),
      kv.getByPrefix(`appointment:${pid}:`),
    ]);

    const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const takenTodayIds = new Set(
      (medicationLogs as any[])
        .filter((log: any) => {
          const d = new Date(log.timestamp);
          const logDay = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          return logDay === todayStr && log.status === "taken";
        })
        .map((log: any) => log.medicationId)
    );

    const created: any[] = [];

    // 1. Medication intake alerts
    if (!mutedTypes.includes("medication")) {
      for (const med of medications as any[]) {
        if (med.status !== "active" || takenTodayIds.has(med.id)) continue;
        // Skip per-medication muted IDs
        if (mutedMedicationIds.includes(med.id)) continue;
        const nextDose = med.nextDoseTime ? new Date(med.nextDoseTime) : null;
        if (!nextDose) continue;

        const isOverdue = nextDose.getTime() < now.getTime();
        const isDueSoon = !isOverdue && (nextDose.getTime() - now.getTime()) < 60 * 60 * 1000;
        if (!isOverdue && !isDueSoon) continue;

        const sourceKey = `med:${med.id}:${todayStr}`;
        if (existingKeys.has(sourceKey)) continue;

        const id = `NTF${Date.now()}_${med.id}`;
        const entry = {
          id, patientId: pid, type: "medication",
          severity: isOverdue ? "overdue" : "due_soon",
          title: isOverdue ? `${med.name} dose overdue` : `${med.name} due soon`,
          detail: `${med.dosage} · ${med.frequency}${med.quickInstruction ? ` · ${med.quickInstruction}` : ""}`,
          time: nextDose.toISOString(), sourceKey, sourceId: med.id,
          navigateTo: `/medications/${med.id}`,
          read: false, dismissed: false, createdAt: now.toISOString(),
        };
        await kv.set(`notification:${pid}:${id}`, entry);
        created.push(entry);
      }
    }

    // 2. Abnormal vital alerts
    if (!mutedTypes.includes("vital")) {
      const sortedObs = (observations as any[]).sort(
        (a: any, b: any) => new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime()
      );
      const seenTypes = new Set<string>();
      for (const obs of sortedObs) {
        if (seenTypes.has(obs.type)) continue;
        seenTypes.add(obs.type);
        if (obs.status !== "warning" && obs.status !== "critical") continue;

        const sourceKey = `vital:${obs.id}`;
        if (existingKeys.has(sourceKey)) continue;

        const id = `NTF${Date.now()}_${obs.id}`;
        const entry = {
          id, patientId: pid, type: "vital",
          severity: obs.status === "critical" ? "overdue" : "due_soon",
          title: `${obs.type} reading ${obs.status}`,
          detail: `${obs.value} ${obs.unit} — requires attention`,
          time: obs.effectiveDateTime, sourceKey, sourceId: obs.id,
          navigateTo: "/observations",
          read: false, dismissed: false, createdAt: now.toISOString(),
        };
        await kv.set(`notification:${pid}:${id}`, entry);
        created.push(entry);
      }
    }

    // 3. Upcoming appointment alerts (next 48h)
    if (!mutedTypes.includes("appointment")) {
      const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const upcoming = (appointments as any[]).filter(
        (a: any) => a.status === "scheduled" && new Date(a.start) > now && new Date(a.start) <= horizon
      );
      for (const appt of upcoming) {
        const isToday = new Date(appt.start).toDateString() === now.toDateString();
        const sourceKey = `appt:${appt.id}:${todayStr}`;
        if (existingKeys.has(sourceKey)) continue;

        const id = `NTF${Date.now()}_${appt.id}`;
        const entry = {
          id, patientId: pid, type: "appointment",
          severity: isToday ? "due_soon" : "upcoming",
          title: `${appt.type}${isToday ? " today" : " tomorrow"}`,
          detail: `${appt.provider} · ${appt.modality}`,
          time: appt.start, sourceKey, sourceId: appt.id,
          navigateTo: "/appointments",
          read: false, dismissed: false, createdAt: now.toISOString(),
        };
        await kv.set(`notification:${pid}:${id}`, entry);
        created.push(entry);
      }
    }

    return c.json({ generated: created.length, notifications: created });
  } catch (e: any) {
    return errJson(c, `Error generating notifications: ${e.message}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATION PREFERENCES — Muting & Scheduling (Sprint 9)
// ═══════════════════════════════════════════════════════════════════════════════

/** GET /notification-prefs/:patientId */
routes.get(`${PREFIX}/notification-prefs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const data = await kv.get(`notification_prefs:${pid}`);
    if (!data) {
      return c.json({
        patientId: pid,
        mutedTypes: [],
        mutedMedicationIds: [],
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        medRemindersEnabled: true,
        vitalRemindersEnabled: true,
        appointmentRemindersEnabled: true,
        reminderLeadMinutes: 30,
        updatedAt: null,
      });
    }
    return c.json(data);
  } catch (e: any) {
    return errJson(c, `Error fetching notification preferences: ${e.message}`);
  }
});

/** PUT /notification-prefs/:patientId */
routes.put(`${PREFIX}/notification-prefs/:patientId`, async (c) => {
  try {
    const pid = c.req.param("patientId");
    const body = await c.req.json();
    const existing = (await kv.get(`notification_prefs:${pid}`)) || {};
    const updated = {
      ...existing,
      ...body,
      patientId: pid,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`notification_prefs:${pid}`, updated);
    return c.json(updated);
  } catch (e: any) {
    return errJson(c, `Error updating notification preferences: ${e.message}`);
  }
});

export { routes };