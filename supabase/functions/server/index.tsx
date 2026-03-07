import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { routes } from "./routes.tsx";
import { isSeeded, seedAllData } from "./seed.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ── Auto-seed middleware (runs before any route handler) ──────────────────────
let autoSeedDone = false;
app.use("*", async (_c, next) => {
  if (!autoSeedDone) {
    autoSeedDone = true;
    try {
      const seeded = await isSeeded();
      if (!seeded) {
        console.log("[AUTO-SEED] No data found, seeding...");
        const result = await seedAllData();
        console.log(`[AUTO-SEED] Complete — ${result.seeded} records`);
      } else {
        console.log("[AUTO-SEED] Data already present, skipping");
      }
    } catch (e: any) {
      console.log(`[AUTO-SEED] Error: ${e.message}`);
    }
  }
  await next();
});

// Health check endpoint
app.get("/make-server-2115a836/health", (c) => {
  return c.json({ status: "ok", autoSeeded: autoSeedDone });
});

// Mount all ORCA entity routes
app.route("/", routes);

Deno.serve(app.fetch);
