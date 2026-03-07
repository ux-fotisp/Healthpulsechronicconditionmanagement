import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Heart, Activity, Droplets, Scale, Wind,
  CheckCircle, AlertTriangle, CircleAlert, ChevronLeft,
} from "lucide-react";
import { useObservations, useObservationTrends, useLogObservation } from "../hooks/useHealthData";
import { hydrateObservations, hydrateObservationTrends, formatDateTime, getObservationTrend as findTrend, type Observation, type ObservationTrend } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import type { StatusType } from "../components/shared/StatusBadge";
import { ReadingContext } from "../components/shared/ReadingContext";
import { Sparkline } from "../components/shared/Sparkline";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { LogVitalsModal } from "../components/shared/LogVitalsModal";
import { BloodPressureMonitor } from "../components/labs/BloodPressureMonitor";
import { SugarLevelTracker } from "../components/labs/SugarLevelTracker";
import { C, T, L } from "../design/tokens";

const OBS_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  "Blood Pressure": Heart,
  "Heart Rate": Activity,
  "Blood Glucose": Droplets,
  "Weight": Scale,
  "SpO₂": Wind,
};

// Observation type colors — individual identifiers (not status-semantic)
const OBS_COLORS: Record<string, string> = {
  "Blood Pressure": C.terracotta,
  "Heart Rate": C.teal,
  "Blood Glucose": C.purple,
  "Weight": C.sage,
  "SpO₂": C.teal,
};

function ObsCard({ obs, trends }: { obs: Observation; trends: ObservationTrend[] }) {
  const Icon = OBS_ICONS[obs.type] ?? Activity;
  const color = OBS_COLORS[obs.type] ?? C.sage;
  const statusType = obs.status as StatusType;

  const StatusIcon =
    statusType === "normal" ? CheckCircle : statusType === "warning" ? AlertTriangle : CircleAlert;
  const statusIconColor = statusType === "normal" ? C.sage : C.terracotta;
  const statusTextBg = statusType === "normal" ? C.sageLight : C.terracottaLight;

  const trend = findTrend(obs.type, trends);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.cardBg,
        border: `1px solid ${statusType !== "normal" ? C.terracottaBorder : C.cardBorder}`,
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(186,188,191,0.3)" }}
      >
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 40,
            height: 40,
            background: `${color}18`,
            border: `1px solid ${color}35`,
          }}
        >
          <Icon size={18} color={color} />
        </div>
        <div className="flex-1">
          <p style={{ color: C.cardText, fontSize: T.caption, fontWeight: 700, fontFamily: "inherit" }}>
            {obs.type}
          </p>
          <p style={{ color: C.cardTextMuted, fontSize: T.nano, fontFamily: "inherit", marginTop: 1, letterSpacing: "0.04em" }}>
            LOINC: {obs.loincCode}
          </p>
        </div>
        <StatusBadge status={statusType} size="sm" />
      </div>

      {/* Value block */}
      <div className="px-4 py-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              style={{
                color: C.cardText,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              {obs.value}
            </span>
            <span style={{ color: C.cardTextSub, fontSize: T.bodySm, fontFamily: "inherit" }}>
              {obs.unit}
            </span>
          </div>
          <p style={{ color: C.cardTextMuted, fontSize: T.micro, fontFamily: "inherit", marginTop: 6 }}>
            {formatDateTime(obs.effectiveDateTime)}
          </p>
        </div>

        {/* Status circle — icon communicates state, not color alone */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: statusTextBg,
            border: `1px solid ${statusIconColor}35`,
          }}
        >
          <StatusIcon size={20} color={statusIconColor} />
        </div>
      </div>

      {/* Sprint 2: Reading Context — plain-language interpretation */}
      <div className="px-4 pb-3">
        <ReadingContext
          type={obs.type}
          value={obs.value}
          status={obs.status}
          compact
        />
      </div>

      {/* Sprint 2: 30-day trend sparkline */}
      {trend && trend.data.length >= 2 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p style={{ color: C.cardTextMuted, fontSize: T.pill, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
              30-DAY TREND
            </p>
            <p style={{ color: C.cardTextFaint, fontSize: T.pill, fontFamily: "inherit" }}>
              {trend.data.length} readings
            </p>
          </div>
          <div
            className="rounded-xl px-3 py-2"
            style={{ background: "rgba(157,187,155,0.06)", border: "1px solid rgba(186,188,191,0.25)" }}
          >
            <Sparkline
              id={`obs-trend-${obs.id}`}
              data={trend.data.map((d) => d.value)}
              statuses={trend.data.map((d) => d.status)}
              color={color}
              width={240}
              height={36}
              showEndDot
            />
            <div className="flex items-center justify-between mt-0.5">
              <span style={{ color: "rgba(59,61,64,0.3)", fontSize: 8, fontFamily: "inherit" }}>
                {trend.data[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ color: "rgba(59,61,64,0.3)", fontSize: 8, fontFamily: "inherit" }}>
                Today
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ObservationsList() {
  const navigate = useNavigate();
  const { data: rawObs, loading: loadingObs, refetch } = useObservations();
  const { data: rawTrends, loading: loadingTrends } = useObservationTrends();
  const { logObservation, loading: loggingObs } = useLogObservation();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showBP, setShowBP] = useState(false);
  const [showSugar, setShowSugar] = useState(false);

  if (loadingObs || loadingTrends) return <PageSkeleton title="Health Labs" cardCount={4} />;

  const observations = rawObs ? hydrateObservations(rawObs) : [];
  const trends = rawTrends ? hydrateObservationTrends(rawTrends) : [];
  const sorted = [...observations].sort(
    (a, b) => b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime()
  );

  const warnings = sorted.filter((o) => o.status !== "normal");
  const normals = sorted.filter((o) => o.status === "normal");

  return (
    <div style={{ background: C.shellAlt, minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: `1px solid ${C.sageBorder}` }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: L.touch,
            height: L.touch,
            background: "rgba(247,249,247,0.06)",
            border: `1px solid ${C.sageBorder}`,
            color: C.textOnDarkSub,
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: C.textOnDark, fontSize: T.h3, fontWeight: 700, fontFamily: "inherit" }}>
            Health Labs
          </h1>
          <p style={{ color: C.textOnDarkMuted, fontSize: T.micro, fontFamily: "inherit" }}>
            Observations – Vitals & Results
          </p>
        </div>

        <button
          className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2"
          style={{
            background: C.sage,
            color: C.cardText,
            fontSize: T.micro,
            fontWeight: 700,
            border: `1px solid ${C.sageBorder}`,
            fontFamily: "inherit",
            minHeight: L.touch,
          }}
          aria-label="Log new vital"
          onClick={() => setShowLogModal(true)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.sageHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.sage;
          }}
        >
          <Activity size={11} />
          Log Vitals
        </button>
      </div>

      {/* ── Vitals Trackers ─────────────────────────────────────── */}
      <div className="flex gap-3 mx-4 mt-4">
        <button
          onClick={() => setShowBP(true)}
          className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center gap-2 py-4 px-3 transition-all"
          style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, minHeight: L.touch }}
          aria-label="Open Blood Pressure Monitor"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.rose; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.cardBorder; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: C.roseLight, border: `1px solid ${C.roseBorder}` }}
          >
            <Heart size={22} color={C.rose} />
          </div>
          <span style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Blood Pressure
          </span>
          <span style={{ color: C.cardTextSub, fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
            Monitor & Log BP
          </span>
        </button>

        <button
          onClick={() => setShowSugar(true)}
          className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center gap-2 py-4 px-3 transition-all"
          style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, minHeight: L.touch }}
          aria-label="Open Sugar Level Tracker"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.alert; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.cardBorder; }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, background: C.alertLight, border: `1px solid ${C.alertBorder}` }}
          >
            <Droplets size={22} color={C.alert} />
          </div>
          <span style={{ color: C.cardText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
            Sugar Levels
          </span>
          <span style={{ color: C.cardTextSub, fontSize: T.nano, fontFamily: "inherit", textAlign: "center" }}>
            Diabetes Management
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4" aria-live="polite">
        {/* Attention needed */}
        {warnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertTriangle size={12} color={C.terracotta} />
              <p style={{ color: C.terracottaDark, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                ATTENTION NEEDED ({warnings.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {warnings.map((obs) => (
                <ObsCard key={obs.id} obs={obs} trends={trends} />
              ))}
            </div>
          </div>
        )}

        {/* Normal readings */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CheckCircle size={12} color={C.sage} />
            <p style={{ color: C.textOnDarkSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              NORMAL READINGS ({normals.length})
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {normals.map((obs) => (
              <ObsCard key={obs.id} obs={obs} trends={trends} />
            ))}
          </div>
        </div>
      </div>

      <LogVitalsModal
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLog={async (type, value, unit, status, loincCode) => {
          await logObservation(type, value, unit, status, loincCode);
          refetch();
        }}
        logging={loggingObs}
      />
      {showBP && <BloodPressureMonitor onClose={() => setShowBP(false)} />}
      {showSugar && <SugarLevelTracker onClose={() => setShowSugar(false)} />}
    </div>
  );
}