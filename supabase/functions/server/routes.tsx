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

export { routes };