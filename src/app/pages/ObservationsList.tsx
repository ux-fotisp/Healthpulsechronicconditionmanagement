import {
  Heart,
  ChevronLeft,
  Activity,
  Droplets,
  Scale,
  Wind,
  CheckCircle,
  AlertTriangle,
  CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useObservations, useObservationTrends } from "../hooks/useHealthData";
import { hydrateObservations, hydrateObservationTrends, formatDateTime, getObservationTrend as findTrend, type Observation, type ObservationTrend } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import type { StatusType } from "../components/shared/StatusBadge";
import { ReadingContext } from "../components/shared/ReadingContext";
import { Sparkline } from "../components/shared/Sparkline";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";

const OBS_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  "Blood Pressure": Heart,
  "Heart Rate": Activity,
  "Blood Glucose": Droplets,
  "Weight": Scale,
  "SpO₂": Wind,
};

// Observation type colors — individual identifiers (not status-semantic)
const OBS_COLORS: Record<string, string> = {
  "Blood Pressure": "#D9A596",   // Pale Terracotta as BP type identifier
  "Heart Rate": "#7C9A92",       // Dusty Teal
  "Blood Glucose": "#9B6BB5",    // keep purple as distinct identifier
  "Weight": "#9DBB9B",           // Muted Sage
  "SpO₂": "#7C9A92",             // Dusty Teal
};

function ObsCard({ obs, trends }: { obs: Observation; trends: ObservationTrend[] }) {
  const Icon = OBS_ICONS[obs.type] ?? Activity;
  const color = OBS_COLORS[obs.type] ?? "#9DBB9B";
  const statusType = obs.status as StatusType;

  const StatusIcon =
    statusType === "normal" ? CheckCircle : statusType === "warning" ? AlertTriangle : CircleAlert;
  const statusIconColor = statusType === "normal" ? "#9DBB9B" : "#D9A596";
  const statusTextBg = statusType === "normal" ? "rgba(157,187,155,0.12)" : "rgba(217,165,150,0.12)";

  const trend = findTrend(obs.type, trends);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#F7F9F7",
        border: `1px solid ${statusType !== "normal" ? "rgba(217,165,150,0.4)" : "#BABCBF"}`,
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
          <p style={{ color: "#3B3D40", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
            {obs.type}
          </p>
          <p style={{ color: "rgba(59,61,64,0.4)", fontSize: 10, fontFamily: "inherit", marginTop: 1, letterSpacing: "0.04em" }}>
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
                color: "#3B3D40",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              {obs.value}
            </span>
            <span style={{ color: "rgba(59,61,64,0.5)", fontSize: 13, fontFamily: "inherit" }}>
              {obs.unit}
            </span>
          </div>
          <p style={{ color: "rgba(59,61,64,0.45)", fontSize: 11, fontFamily: "inherit", marginTop: 6 }}>
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
            <p style={{ color: "rgba(59,61,64,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "inherit" }}>
              30-DAY TREND
            </p>
            <p style={{ color: "rgba(59,61,64,0.35)", fontSize: 9, fontFamily: "inherit" }}>
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
  const { data: rawObs, loading: loadingObs } = useObservations();
  const { data: rawTrends, loading: loadingTrends } = useObservationTrends();

  if (loadingObs || loadingTrends) return <PageSkeleton title="Health Labs" cardCount={4} />;

  const observations = rawObs ? hydrateObservations(rawObs) : [];
  const trends = rawTrends ? hydrateObservationTrends(rawTrends) : [];
  const sorted = [...observations].sort(
    (a, b) => b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime()
  );

  const warnings = sorted.filter((o) => o.status !== "normal");
  const normals = sorted.filter((o) => o.status === "normal");

  return (
    <div style={{ background: "#1A2B1C", minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: "1px solid rgba(157,187,155,0.15)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: "rgba(247,249,247,0.06)",
            border: "1px solid rgba(157,187,155,0.2)",
            color: "rgba(255,255,255,0.7)",
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 700, fontFamily: "inherit" }}>
            Health Labs
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "inherit" }}>
            Observations – Vitals & Results
          </p>
        </div>

        <button
          className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2"
          style={{
            background: "#9DBB9B",
            color: "#3B3D40",
            fontSize: 11,
            fontWeight: 700,
            border: "1px solid rgba(157,187,155,0.4)",
            fontFamily: "inherit",
          }}
          aria-label="Log new vital"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#86A684";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#9DBB9B";
          }}
        >
          <Activity size={11} />
          Log Vitals
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Attention needed */}
        {warnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertTriangle size={12} color="#D9A596" />
              <p style={{ color: "#9B5940", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
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
            <CheckCircle size={12} color="#9DBB9B" />
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
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
    </div>
  );
}