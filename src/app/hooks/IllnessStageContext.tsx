/**
 * HealthPulse · IllnessStageContext
 * ═══════════════════════════════════════════════════════════════════════════════
 * Derives and persists the patient's chronic-care illness stage from live
 * glucose data stored in the KV-backed API.
 *
 * Stage classification (mirrors SugarLevelTracker.tsx logic):
 *   "learning"    → < 5 glucose logs OR Time-in-Range < 60%
 *                    (gathering baseline, encourage detailed logging)
 *   "stabilizing" → TIR 60–79%
 *                    (trending upward, reinforce habit formation)
 *   "stable"      → TIR ≥ 80%
 *                    (maintenance mode, shift focus to goals & longevity)
 *
 * Consumed by:
 *   · DashboardMonitor.tsx — drives default active tab
 *   · Home.tsx             — drives adaptive section priority order
 *   · SugarLevelTracker.tsx can call refreshStage() after logging a new entry
 *
 * Persistence:
 *   Writes to KV via PUT /illness-stage/:patientId whenever the stage changes,
 *   enabling future backend features (scheduled SMS alerts, provider reports).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import * as api from "../data/api";

// ── Public Types ──────────────────────────────────────────────────────────────

export type IllnessStage = "learning" | "stabilizing" | "stable";

export interface IllnessStageValue {
  illnessStage: IllnessStage;
  timeInRange: number;    // 0–100 (%)
  logCount: number;       // total persisted glucose entries
  stageLoading: boolean;
  /** Re-fetch glucose entries and recompute stage. Call after logging. */
  refreshStage: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const IllnessStageCtx = createContext<IllnessStageValue>({
  illnessStage: "learning",
  timeInRange: 0,
  logCount: 0,
  stageLoading: true,
  refreshStage: () => {},
});

// ── Stage classifier ──────────────────────────────────────────────────────────

function computeStage(tir: number, logCount: number): IllnessStage {
  if (logCount < 5) return "learning";
  if (tir >= 80)    return "stable";
  if (tir >= 60)    return "stabilizing";
  return "learning";
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function IllnessStageProvider({ children }: { children: ReactNode }) {
  const [illnessStage, setIllnessStage] = useState<IllnessStage>("learning");
  const [timeInRange,  setTimeInRange]  = useState(0);
  const [logCount,     setLogCount]     = useState(0);
  const [stageLoading, setStageLoading] = useState(true);

  // Track the last persisted stage to avoid redundant KV writes
  const lastPersistedRef = useRef<IllnessStage | null>(null);

  const fetchAndCompute = useCallback(async () => {
    setStageLoading(true);
    try {
      const entries = await api.getGlucoseEntries();
      const count   = entries.length;
      const inRange = entries.filter(
        (e) => e.glucose >= 70 && e.glucose <= 180,
      ).length;
      const tir   = count === 0 ? 0 : Math.round((inRange / count) * 100);
      const stage = computeStage(tir, count);

      setLogCount(count);
      setTimeInRange(tir);
      setIllnessStage(stage);

      // Persist to KV only when the stage changes (reduces write load)
      if (stage !== lastPersistedRef.current) {
        lastPersistedRef.current = stage;
        api
          .setIllnessStage({ stage, timeInRange: tir, logCount: count })
          .then(() =>
            console.log(
              `[IllnessStage] Persisted '${stage}' → TIR ${tir}%, ${count} entries`,
            ),
          )
          .catch((err: any) =>
            console.warn("[IllnessStage] Persist non-fatal:", err.message),
          );
      }
    } catch (e: any) {
      console.error("[IllnessStage] Compute failed:", e.message);
    } finally {
      setStageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndCompute();
  }, [fetchAndCompute]);

  return (
    <IllnessStageCtx.Provider
      value={{
        illnessStage,
        timeInRange,
        logCount,
        stageLoading,
        refreshStage: fetchAndCompute,
      }}
    >
      {children}
    </IllnessStageCtx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useIllnessStage(): IllnessStageValue {
  return useContext(IllnessStageCtx);
}
