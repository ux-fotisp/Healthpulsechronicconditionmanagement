/**
 * HealthPulse · DashboardMonitor — Tabbed Submenu
 * ═══════════════════════════════════════════════════════════════════════════════
 * Three-tab dashboard monitor showing:
 *   1. Medications — all active medications with status, dosage, next dose
 *   2. Vitals — latest readings for each vital type with status indicators
 *   3. Examinations — upcoming scheduled appointments/exams
 *
 * WCAG 2.1 AA: 56px touch targets, role=tablist, aria-selected, 4.5:1 contrast
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Pill,
  Activity,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Heart,
  Stethoscope,
  TrendingUp,
  MapPin,
  Video,
  Phone,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { useIllnessStage, type IllnessStage } from "../../hooks/IllnessStageContext";
import {
  MOCK_NOW,
  formatTime,
  type Medication,
  type Observation,
  type Appointment,
} from "../../data/helpers";
import { PillBadge } from "../shared/PillVisualizer";
import { StatusBadge, type StatusType } from "../shared/StatusBadge";
import { C, T, L } from "../../design/tokens";

type Tab = "medications" | "vitals" | "examinations";

const TABS: { id: Tab; label: string; icon: typeof Pill }[] = [
  { id: "medications", label: "Medications", icon: Pill },
  { id: "vitals", label: "Vitals", icon: Activity },
  { id: "examinations", label: "Exams", icon: Calendar },
];

// ── Medications Tab ──────────────────────────────────────────────────────────
function MedicationsPanel({
  medications,
  medicationLogs,
}: {
  medications: Medication[];
  medicationLogs: any[];
}) {
  const navigate = useNavigate();
  const active = medications.filter((m) => m.status === "active");
  const inactive = medications.filter((m) => m.status === "inactive");

  if (medications.length === 0) {
    return (
      <EmptyState
        icon={Pill}
        message="No medications on record"
        sub="Medications will appear here once prescribed."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Active medications */}
      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel label={`ACTIVE (${active.length})`} color={C.primaryDark} />
          {active.map((med) => {
            const isOverdue =
              med.nextDoseTime !== null &&
              med.nextDoseTime.getTime() < MOCK_NOW.getTime();
            const isDueSoon =
              med.nextDoseTime !== null &&
              !isOverdue &&
              med.nextDoseTime.getTime() - MOCK_NOW.getTime() <
                60 * 60 * 1000;

            return (
              <button
                key={med.id}
                onClick={() => navigate(`/medications/${med.id}`)}
                className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150"
                style={{
                  background: isOverdue
                    ? C.alertLight
                    : isDueSoon
                      ? "rgba(212,163,115,0.06)"
                      : "rgba(142,175,157,0.04)",
                  border: `1px solid ${isOverdue ? C.alertBorder : isDueSoon ? "rgba(212,163,115,0.2)" : C.borderLight}`,
                  minHeight: L.touch,
                  cursor: "pointer",
                }}
                aria-label={`${med.name} ${med.dosage} — ${med.frequency}${isOverdue ? " — overdue" : isDueSoon ? " — due soon" : ""}`}
              >
                <PillBadge color={med.color} shape={med.shape} size="sm" />
                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      color: C.text,
                      fontSize: T.bodySm,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      lineHeight: 1.3,
                    }}
                  >
                    {med.name}
                  </p>
                  <p
                    style={{
                      color: C.textSub,
                      fontSize: T.caption,
                      fontWeight: 500,
                      fontFamily: "inherit",
                      marginTop: 1,
                    }}
                  >
                    {med.dosage} · {med.frequency}
                  </p>
                  {med.nextDoseTime && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock
                        size={10}
                        color={isOverdue ? C.alert : isDueSoon ? C.amber : C.textMuted}
                      />
                      <span
                        style={{
                          color: isOverdue
                            ? C.alertText
                            : isDueSoon
                              ? C.amberDark
                              : C.textSub,
                          fontSize: T.nano,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {isOverdue
                          ? `Overdue — was due ${formatTime(med.nextDoseTime)}`
                          : `Next: ${formatTime(med.nextDoseTime)}`}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight size={14} color={C.textMuted} />
              </button>
            );
          })}
        </div>
      )}

      {/* Inactive medications */}
      {inactive.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <SectionLabel label={`INACTIVE (${inactive.length})`} color={C.textMuted} />
          {inactive.map((med) => (
            <button
              key={med.id}
              onClick={() => navigate(`/medications/${med.id}`)}
              className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all"
              style={{
                background: "rgba(100,116,139,0.04)",
                border: `1px solid ${C.borderLight}`,
                minHeight: L.touch,
                cursor: "pointer",
                opacity: 0.7,
              }}
              aria-label={`${med.name} ${med.dosage} — inactive`}
            >
              <PillBadge color={med.color} shape={med.shape} size="sm" />
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    color: C.textSub,
                    fontSize: T.bodySm,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {med.name}
                </p>
                <p
                  style={{
                    color: C.textMuted,
                    fontSize: T.caption,
                    fontWeight: 500,
                    fontFamily: "inherit",
                  }}
                >
                  {med.dosage} · Inactive
                </p>
              </div>
              <ChevronRight size={14} color={C.textMuted} />
            </button>
          ))}
        </div>
      )}

      {/* View all link */}
      <button
        onClick={() => navigate("/medications")}
        className="flex items-center justify-center gap-1.5 mt-1 transition-all"
        style={{
          background: "transparent",
          border: "none",
          color: C.primary,
          fontSize: T.caption,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          padding: "8px 0",
          minHeight: L.touch,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: C.primaryBorder,
        }}
        aria-label="View all medications"
      >
        View All Medications
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

// ── Vitals Tab ───────────────────────────────────────────────────────────────
function VitalsPanel({
  observations,
}: {
  observations: Observation[];
}) {
  const navigate = useNavigate();

  if (observations.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        message="No vitals recorded"
        sub="Your vital readings will appear here."
      />
    );
  }

  // Group by type, take latest of each
  const byType = new Map<string, Observation>();
  const sorted = [...observations].sort(
    (a, b) =>
      b.effectiveDateTime.getTime() - a.effectiveDateTime.getTime(),
  );
  sorted.forEach((obs) => {
    if (!byType.has(obs.type)) byType.set(obs.type, obs);
  });

  const latestByType = Array.from(byType.values());

  const typeIcons: Record<string, typeof Heart> = {
    "Blood Pressure": Heart,
    "Heart Rate": Activity,
    "Blood Glucose": TrendingUp,
  };

  return (
    <div className="flex flex-col gap-2">
      {latestByType.map((obs) => {
        const Icon = typeIcons[obs.type] ?? Stethoscope;
        const statusColor =
          obs.status === "normal"
            ? C.success
            : obs.status === "warning"
              ? C.alert
              : C.terracotta;
        const statusBg =
          obs.status === "normal"
            ? C.successLight
            : obs.status === "warning"
              ? C.alertLight
              : C.terracottaLight;

        return (
          <button
            key={obs.id}
            onClick={() => navigate("/observations")}
            className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150"
            style={{
              background: statusBg,
              border: `1px solid ${obs.status === "normal" ? C.successBorder : obs.status === "warning" ? C.alertBorder : C.terracottaBorder}`,
              minHeight: L.touch,
              cursor: "pointer",
            }}
            aria-label={`${obs.type}: ${obs.value} ${obs.unit} — ${obs.status}`}
          >
            {/* Vital icon */}
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                background: C.card,
                border: `1px solid ${obs.status === "normal" ? C.successBorder : C.alertBorder}`,
              }}
              aria-hidden="true"
            >
              <Icon size={20} color={statusColor} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                style={{
                  color: C.text,
                  fontSize: T.bodySm,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  lineHeight: 1.3,
                }}
              >
                {obs.type}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  style={{
                    color: C.text,
                    fontSize: T.body,
                    fontWeight: 800,
                    fontFamily: "inherit",
                  }}
                >
                  {obs.value}
                </span>
                <span
                  style={{
                    color: C.textSub,
                    fontSize: T.caption,
                    fontWeight: 500,
                    fontFamily: "inherit",
                  }}
                >
                  {obs.unit}
                </span>
              </div>
              <p
                style={{
                  color: C.textMuted,
                  fontSize: T.nano,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  marginTop: 2,
                }}
              >
                {obs.effectiveDateTime.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {obs.effectiveDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Status badge */}
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={obs.status as StatusType} size="sm" />
              <ChevronRight size={14} color={C.textMuted} />
            </div>
          </button>
        );
      })}

      {/* View all link */}
      <button
        onClick={() => navigate("/observations")}
        className="flex items-center justify-center gap-1.5 mt-1 transition-all"
        style={{
          background: "transparent",
          border: "none",
          color: C.primary,
          fontSize: T.caption,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          padding: "8px 0",
          minHeight: L.touch,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: C.primaryBorder,
        }}
        aria-label="View all vitals and trends"
      >
        View All Vitals & Trends
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

// ── Examinations Tab ─────────────────────────────────────────────────────────
function ExaminationsPanel({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const navigate = useNavigate();

  const upcoming = appointments
    .filter((a) => a.status === "scheduled" && a.start >= MOCK_NOW)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const past = appointments
    .filter((a) => a.status === "completed" || a.start < MOCK_NOW)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .slice(0, 3);

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        message="No examinations scheduled"
        sub="Upcoming appointments will appear here."
      />
    );
  }

  const modalityIcon: Record<string, typeof Video> = {
    Video: Video,
    "In-Person": MapPin,
    Phone: Phone,
  };

  function AppointmentRow({
    appt,
    isUpcoming,
  }: {
    appt: Appointment;
    isUpcoming: boolean;
  }) {
    const ModalityIcon = modalityIcon[appt.modality] ?? Calendar;
    const isToday =
      appt.start.toDateString() === MOCK_NOW.toDateString();
    const isTomorrow =
      appt.start.toDateString() ===
      new Date(MOCK_NOW.getTime() + 86400000).toDateString();

    const dayLabel = isToday
      ? "Today"
      : isTomorrow
        ? "Tomorrow"
        : appt.start.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

    return (
      <button
        onClick={() => navigate("/appointments")}
        className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150"
        style={{
          background: isUpcoming
            ? isToday
              ? C.tealLight
              : "rgba(124,154,146,0.05)"
            : "rgba(100,116,139,0.04)",
          border: `1px solid ${isUpcoming ? (isToday ? C.tealBorder : C.borderLight) : C.borderLight}`,
          minHeight: L.touch,
          cursor: "pointer",
          opacity: isUpcoming ? 1 : 0.65,
        }}
        aria-label={`${appt.type} with ${appt.provider} — ${dayLabel} at ${appt.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} — ${appt.modality}`}
      >
        {/* Modality icon */}
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            background: C.card,
            border: `1px solid ${isToday ? C.tealBorder : C.borderLight}`,
          }}
          aria-hidden="true"
        >
          <ModalityIcon
            size={20}
            color={isUpcoming ? C.teal : C.textMuted}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              color: C.text,
              fontSize: T.bodySm,
              fontWeight: 700,
              fontFamily: "inherit",
              lineHeight: 1.3,
            }}
          >
            {appt.type}
          </p>
          <p
            style={{
              color: C.textSub,
              fontSize: T.caption,
              fontWeight: 500,
              fontFamily: "inherit",
              marginTop: 1,
            }}
          >
            {appt.provider} · {appt.modality}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock
              size={10}
              color={isToday ? C.teal : C.textMuted}
            />
            <span
              style={{
                color: isToday ? C.tealDark : C.textSub,
                fontSize: T.nano,
                fontWeight: 700,
                letterSpacing: "0.04em",
                fontFamily: "inherit",
              }}
            >
              {dayLabel} ·{" "}
              {appt.start.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            {isToday && (
              <span
                style={{
                  background: C.tealLight,
                  border: `1px solid ${C.tealBorder}`,
                  color: C.tealDark,
                  fontSize: T.pill,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: L.rFull,
                  fontFamily: "inherit",
                  letterSpacing: "0.06em",
                }}
              >
                TODAY
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={14} color={C.textMuted} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {upcoming.length > 0 && (
        <>
          <SectionLabel
            label={`UPCOMING (${upcoming.length})`}
            color={C.tealDark}
          />
          {upcoming.map((appt) => (
            <AppointmentRow key={appt.id} appt={appt} isUpcoming />
          ))}
        </>
      )}

      {past.length > 0 && (
        <div className="mt-1">
          <SectionLabel
            label={`RECENT (${past.length})`}
            color={C.textMuted}
          />
          {past.map((appt) => (
            <AppointmentRow
              key={appt.id}
              appt={appt}
              isUpcoming={false}
            />
          ))}
        </div>
      )}

      {/* View all link */}
      <button
        onClick={() => navigate("/appointments")}
        className="flex items-center justify-center gap-1.5 mt-1 transition-all"
        style={{
          background: "transparent",
          border: "none",
          color: C.primary,
          fontSize: T.caption,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          padding: "8px 0",
          minHeight: L.touch,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          textDecorationColor: C.primaryBorder,
        }}
        aria-label="View all appointments"
      >
        View All Appointments
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

// ── Shared helpers ───────────────────────────────────────────────────────────
function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <p
      style={{
        color,
        fontSize: T.nano,
        fontWeight: 700,
        letterSpacing: "0.1em",
        fontFamily: "inherit",
        padding: "4px 0",
      }}
    >
      {label}
    </p>
  );
}

function EmptyState({
  icon: Icon,
  message,
  sub,
}: {
  icon: typeof Pill;
  message: string;
  sub: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 rounded-xl"
      style={{
        background: C.secondaryLight,
        border: `1px solid ${C.secondaryBorder}`,
      }}
      role="status"
    >
      <Icon size={28} color={C.secondary} />
      <p
        className="mt-2"
        style={{
          color: C.textSub,
          fontSize: T.bodySm,
          fontWeight: 600,
          fontFamily: "inherit",
        }}
      >
        {message}
      </p>
      <p
        style={{
          color: C.textMuted,
          fontSize: T.caption,
          fontFamily: "inherit",
          marginTop: 4,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

// ── Stage badge config ───────────────────────────────────────────────────────
const STAGE_META: Record<
  IllnessStage,
  { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
  learning: {
    label: "Learning",
    bg: "rgba(123,154,204,0.15)",
    color: "#1E4A8A",
    icon: <GraduationCap size={10} color="#1E4A8A" />,
  },
  stabilizing: {
    label: "Stabilizing",
    bg: "rgba(212,163,115,0.18)",
    color: "#92400E",
    icon: <TrendingUp size={10} color="#92400E" />,
  },
  stable: {
    label: "Stable",
    bg: "rgba(142,175,157,0.2)",
    color: "#2D6A4F",
    icon: <Sparkles size={10} color="#2D6A4F" />,
  },
};

// ── Main DashboardMonitor ────────────────────────────────────────────────────
export function DashboardMonitor() {
  const [activeTab, setActiveTab] = useState<Tab>("medications");
  const { data } = useDashboardContext();
  const { illnessStage, stageLoading } = useIllnessStage();

  // Set the initial tab once — after the illness stage resolves:
  //   learning / stabilizing → "vitals" (watch readings closely)
  //   stable               → "medications" (maintenance focus)
  const tabInitialized = useRef(false);
  useEffect(() => {
    if (!stageLoading && !tabInitialized.current) {
      tabInitialized.current = true;
      setActiveTab(illnessStage === "stable" ? "medications" : "vitals");
    }
  }, [stageLoading, illnessStage]);

  if (!data) return null;

  // Count badges for tabs
  const dueMedCount = data.medications.filter(
    (m) => m.status === "active",
  ).length;
  const abnormalVitalCount = data.observations.filter(
    (o) => o.status === "warning" || o.status === "critical",
  ).length;
  const upcomingApptCount = data.appointments.filter(
    (a) =>
      a.status === "scheduled" && a.start >= MOCK_NOW,
  ).length;

  const tabCounts: Record<Tab, number> = {
    medications: dueMedCount,
    vitals: abnormalVitalCount,
    examinations: upcomingApptCount,
  };

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
      role="region"
      aria-label="Dashboard monitor — medications, vitals, and examinations"
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
          background: "rgba(142,175,157,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <Stethoscope size={14} color={C.primary} aria-hidden="true" />
          <span
            style={{
              color: C.textSub,
              fontSize: T.nano,
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontFamily: "inherit",
            }}
          >
            CARE DASHBOARD
          </span>
        </div>

        {/* Illness stage pill */}
        {!stageLoading && (() => {
          const meta = STAGE_META[illnessStage];
          return (
            <div
              className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                background: meta.bg,
                border: `1px solid ${meta.color}30`,
              }}
              aria-label={`Illness stage: ${meta.label}`}
            >
              {meta.icon}
              <span
                style={{
                  color: meta.color,
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  letterSpacing: "0.06em",
                }}
              >
                {meta.label.toUpperCase()}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Tab bar */}
      <div
        className="flex"
        role="tablist"
        aria-label="Dashboard monitor tabs"
        style={{
          borderBottom: `1px solid ${C.borderLight}`,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const { icon: TabIcon } = tab;
          const count = tabCounts[tab.id];

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 relative transition-all duration-200"
              style={{
                background: isActive
                  ? "rgba(142,175,157,0.08)"
                  : "transparent",
                border: "none",
                color: isActive ? C.primary : C.textSub,
                fontSize: T.caption,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "inherit",
                cursor: "pointer",
                minHeight: L.touch,
                padding: "12px 8px",
              }}
            >
              <TabIcon
                size={14}
                color={isActive ? C.primary : C.secondary}
              />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    background: isActive
                      ? C.primaryLight
                      : C.secondaryLight,
                    color: isActive ? C.primaryDark : C.secondary,
                    fontSize: T.nano,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    padding: "0 4px",
                  }}
                  aria-label={`${count} items`}
                >
                  {count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-1/2"
                  style={{
                    width: "60%",
                    height: 2,
                    background: C.primary,
                    borderRadius: "2px 2px 0 0",
                    transform: "translateX(-50%)",
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        className="px-4 py-4"
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "medications" && (
          <MedicationsPanel
            medications={data.medications}
            medicationLogs={data.medicationLogs}
          />
        )}
        {activeTab === "vitals" && (
          <VitalsPanel observations={data.observations} />
        )}
        {activeTab === "examinations" && (
          <ExaminationsPanel appointments={data.appointments} />
        )}
      </div>
    </div>
  );
}