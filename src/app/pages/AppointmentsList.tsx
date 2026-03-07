import { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Video,
  MapPin,
  Phone,
  FileText,
  MessageSquare,
  Heart,
  X,
  CalendarDays,
  Calendar,
  User,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAppointments, useAppointmentPrep, useTogglePrepItem } from "../hooks/useHealthData";
import { hydrateAppointments, MOCK_NOW, formatTime, type Appointment, type AppointmentPrepItem } from "../data/helpers";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { C, T, L } from "../design/tokens";

const MODALITY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Video: Video,
  "In-Person": MapPin,
  Phone: Phone,
};

// Modality colors are distinct identifiers, not status signals
const MODALITY_COLORS: Record<string, string> = {
  Video: "#7C9A92",       // Dusty Teal
  "In-Person": "#9DBB9B", // Muted Sage
  Phone: "#9B6BB5",       // keep purple as distinct identifier
};

const PREP_CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  documents: FileText,
  questions: MessageSquare,
  logistics: MapPin,
  health:    Heart,
};

const PREP_CATEGORY_COLORS: Record<string, { icon: string; bg: string; border: string }> = {
  documents: { icon: "#7C9A92", bg: "rgba(124,154,146,0.1)",  border: "rgba(124,154,146,0.25)" },
  questions: { icon: "#9B6BB5", bg: "rgba(155,107,181,0.08)", border: "rgba(155,107,181,0.2)"  },
  logistics: { icon: "#D9A596", bg: "rgba(217,165,150,0.1)",  border: "rgba(217,165,150,0.25)" },
  health:    { icon: "#9DBB9B", bg: "rgba(157,187,155,0.1)",  border: "rgba(157,187,155,0.25)" },
};

function formatApptDate(date: Date): string {
  const now = MOCK_NOW;
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isTomorrow =
    date.getDate() === now.getDate() + 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const ModalityIcon = MODALITY_ICONS[appt.modality] ?? Calendar;
  const modalityColor = MODALITY_COLORS[appt.modality] ?? "#9DBB9B";
  const isPast = appt.start < MOCK_NOW;
  const isToday =
    appt.start.getDate() === MOCK_NOW.getDate() &&
    appt.start.getMonth() === MOCK_NOW.getMonth();
  const isSoon = !isPast && (appt.start.getTime() - MOCK_NOW.getTime()) < 6 * 60 * 60 * 1000;

  const { data: prepData } = useAppointmentPrep(appt.id);
  const prep = prepData ?? null;
  const [showPrep, setShowPrep] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  function toggleCheck(itemId: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const prepProgress = prep
    ? Math.round((checkedItems.size / prep.items.length) * 100)
    : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#F7F9F7",
        border: `1px solid ${isToday ? "rgba(124,154,146,0.4)" : "#BABCBF"}`,
      }}
    >
      {/* Date badge strip */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          borderBottom: "1px solid rgba(186,188,191,0.3)",
          background: isToday ? "rgba(124,154,146,0.1)" : "rgba(157,187,155,0.05)",
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={12} color={isToday ? "#7C9A92" : "rgba(59,61,64,0.4)"} />
          <span
            style={{
              color: isToday ? "#4A6E67" : "rgba(59,61,64,0.55)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontFamily: "inherit",
            }}
          >
            {formatApptDate(appt.start).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={10} color="rgba(59,61,64,0.4)" />
          <span style={{ color: "rgba(59,61,64,0.55)", fontSize: 11, fontFamily: "inherit" }}>
            {formatTime(appt.start)}
          </span>
          <span style={{ color: "rgba(59,61,64,0.35)", fontSize: 11, fontFamily: "inherit" }}>
            · {appt.duration}min
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          {/* Modality icon */}
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: `${modalityColor}15`,
              border: `1px solid ${modalityColor}35`,
            }}
          >
            <ModalityIcon size={20} color={modalityColor} />
          </div>

          <div className="flex-1 min-w-0">
            <p style={{ color: "#3B3D40", fontSize: 14, fontWeight: 700, lineHeight: 1.3, fontFamily: "inherit" }}>
              {appt.type}
            </p>

            <div className="flex items-center gap-1.5 mt-1.5">
              <User size={11} color="rgba(59,61,64,0.4)" />
              <span style={{ color: "rgba(59,61,64,0.6)", fontSize: 12, fontFamily: "inherit" }}>
                {appt.provider}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <ModalityIcon size={11} color={modalityColor} />
              <span style={{ color: modalityColor, fontSize: 11, fontWeight: 500, fontFamily: "inherit" }}>
                {appt.modality}
              </span>
            </div>

            {/* Status badge — icon + label always together */}
            <div className="mt-2.5">
              <StatusBadge
                status={isPast ? "completed" : isSoon ? "urgent" : "upcoming"}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Action button for today's appointment */}
        {isToday && !isPast && (
          <button
            className="w-full rounded-xl py-2.5 mt-3 flex items-center justify-center gap-2 transition-all"
            style={{
              background: "#9DBB9B",
              color: "#3B3D40",
              fontSize: 12,
              fontWeight: 700,
              border: "1px solid rgba(157,187,155,0.4)",
              fontFamily: "inherit",
            }}
            aria-label={`Join ${appt.modality === "Video" ? "video call" : "view details"} for ${appt.type}`}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#86A684";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#9DBB9B";
            }}
          >
            {appt.modality === "Video" ? <Video size={13} /> : <MapPin size={13} />}
            {appt.modality === "Video" ? "Join Video Call" : "View Details"}
          </button>
        )}

        {/* Sprint 2: Appointment Preparation Checklist */}
        {prep && !isPast && (
          <div className="mt-3">
            <button
              onClick={() => setShowPrep(!showPrep)}
              className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
              style={{
                background: showPrep ? "rgba(124,154,146,0.12)" : "rgba(124,154,146,0.06)",
                border: "1px solid rgba(124,154,146,0.25)",
                color: "#4A6E67",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "inherit",
                minHeight: 44,
              }}
              aria-expanded={showPrep}
              aria-label={`Preparation checklist: ${checkedItems.size} of ${prep.items.length} completed`}
            >
              <ClipboardCheck size={14} color="#7C9A92" />
              Prep Checklist
              <span
                style={{
                  background: prepProgress === 100 ? "rgba(157,187,155,0.2)" : "rgba(124,154,146,0.15)",
                  border: `1px solid ${prepProgress === 100 ? "rgba(157,187,155,0.35)" : "rgba(124,154,146,0.25)"}`,
                  color: prepProgress === 100 ? "#5A7D58" : "#4A6E67",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 100,
                  fontFamily: "inherit",
                }}
              >
                {checkedItems.size}/{prep.items.length}
              </span>
              {showPrep ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showPrep && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(186,188,191,0.25)" }}
                role="list"
                aria-label="Appointment preparation items"
              >
                {/* Progress bar */}
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: "rgba(59,61,64,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>
                      PREPARATION PROGRESS
                    </span>
                    <span style={{ color: prepProgress === 100 ? "#5A7D58" : "#4A6E67", fontSize: 10, fontWeight: 700, fontFamily: "inherit" }}>
                      {prepProgress}%
                    </span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 6, background: "rgba(186,188,191,0.2)" }}>
                    <div
                      style={{
                        width: `${prepProgress}%`,
                        height: "100%",
                        background: prepProgress === 100 ? "#9DBB9B" : "#7C9A92",
                        borderRadius: 100,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                {prep.items.map((item, idx) => {
                  const checked = checkedItems.has(item.id);
                  const catCfg = PREP_CATEGORY_COLORS[item.category] ?? PREP_CATEGORY_COLORS.health;
                  const CatIcon = PREP_CATEGORY_ICONS[item.category] ?? Heart;

                  return (
                    <button
                      key={item.id}
                      role="listitem"
                      onClick={() => toggleCheck(item.id)}
                      className="w-full flex items-start gap-3 px-3 py-3 text-left transition-all"
                      style={{
                        borderTop: idx > 0 ? "1px solid rgba(186,188,191,0.15)" : undefined,
                        background: checked ? "rgba(157,187,155,0.06)" : "transparent",
                        opacity: checked ? 0.7 : 1,
                        minHeight: 56,
                      }}
                      aria-label={`${checked ? "Completed" : "Not completed"}: ${item.label}`}
                      aria-pressed={checked}
                    >
                      {/* Checkbox */}
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                        style={{
                          width: 24,
                          height: 24,
                          background: checked ? "#9DBB9B" : catCfg.bg,
                          border: `1.5px solid ${checked ? "#9DBB9B" : catCfg.border}`,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {checked ? (
                          <CheckCircle size={14} color="#FFFFFF" />
                        ) : (
                          <CatIcon size={12} color={catCfg.icon} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            color: checked ? "rgba(59,61,64,0.45)" : "#3B3D40",
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            lineHeight: 1.35,
                            textDecoration: checked ? "line-through" : "none",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            color: "rgba(59,61,64,0.4)",
                            fontSize: 11,
                            fontFamily: "inherit",
                            lineHeight: 1.5,
                            marginTop: 2,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* All done message */}
                {prepProgress === 100 && (
                  <div
                    className="flex items-center justify-center gap-2 px-3 py-3"
                    style={{ background: "rgba(157,187,155,0.1)", borderTop: "1px solid rgba(157,187,155,0.2)" }}
                    role="status"
                  >
                    <CheckCircle size={14} color="#9DBB9B" />
                    <span style={{ color: "#5A7D58", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                      You're all set for this appointment!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AppointmentsList() {
  const navigate = useNavigate();
  const { data: rawAppts, loading } = useAppointments();

  if (loading) return <PageSkeleton title="Health Dates" cardCount={3} />;

  const allAppts = rawAppts ? hydrateAppointments(rawAppts) : [];

  const upcoming = [...allAppts]
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const todayAppts = upcoming.filter((a) => {
    return (
      a.start.getDate() === MOCK_NOW.getDate() &&
      a.start.getMonth() === MOCK_NOW.getMonth()
    );
  });

  const futureAppts = upcoming.filter((a) => {
    const isToday =
      a.start.getDate() === MOCK_NOW.getDate() &&
      a.start.getMonth() === MOCK_NOW.getMonth();
    return !isToday;
  });

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
            Health Dates
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "inherit" }}>
            Appointments – Clinical Visits
          </p>
        </div>
        <span
          className="ml-auto"
          style={{
            background: "rgba(124,154,146,0.15)",
            border: "1px solid rgba(124,154,146,0.3)",
            color: "#7C9A92",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 100,
            fontFamily: "inherit",
          }}
        >
          {upcoming.length} upcoming
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Today */}
        {todayAppts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C9A92" }} />
              <p style={{ color: "#7C9A92", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                TODAY ({todayAppts.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {todayAppts.map((a) => <AppointmentCard key={a.id} appt={a} />)}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {futureAppts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                UPCOMING ({futureAppts.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {futureAppts.map((a) => <AppointmentCard key={a.id} appt={a} />)}
            </div>
          </div>
        )}

        {upcoming.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ border: "1px solid #BABCBF", background: "#F7F9F7" }}
            role="status"
          >
            <Calendar size={28} color="rgba(59,61,64,0.25)" />
            <p style={{ color: "rgba(59,61,64,0.4)", fontSize: 13, fontFamily: "inherit", marginTop: 8 }}>
              No upcoming appointments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}