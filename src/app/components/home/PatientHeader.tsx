/**
 * HealthPulse · PatientHeader
 * H1 = 26px Bold Montserrat (--hp-h1)
 * Brand: HealthPulse · Primary #8EAF9D · Secondary #64748B
 */

import { User, Pencil, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardContext } from "../../hooks/DashboardContext";
import { getPatientAge } from "../../data/helpers";
import { C, T, L, BRAND_NAME } from "../../design/tokens";
import { NotificationMenu } from "./NotificationMenu";

export function PatientHeader() {
  const navigate = useNavigate();
  const { data } = useDashboardContext();
  if (!data) return null;
  const { patient } = data;
  const age = getPatientAge(patient);

  return (
    <div
      style={{
        background:   "linear-gradient(145deg, #111820 0%, #1A2B1C 100%)",
        borderBottom: `1px solid rgba(142,175,157,0.18)`,
      }}
      className="px-4 pt-10 pb-4"
    >
      {/* ── Brand bar ── */}
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2.5 flex-1">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width:      36,
              height:     36,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
              boxShadow:  `0 2px 8px rgba(142,175,157,0.35)`,
            }}
            aria-hidden="true"
          >
            <Activity size={18} color="#FFFFFF" />
          </div>
          <div>
            <span
              style={{
                color:         C.textOnDark,
                fontSize:      T.h1,        /* 26px Bold — H1 Montserrat */
                fontWeight:    700,
                letterSpacing: "-0.03em",
                lineHeight:    1,
                fontFamily:    "inherit",
                display:       "block",
              }}
            >
              {BRAND_NAME}
            </span>
            <span
              style={{
                color:         C.textOnDarkMuted,
                fontSize:      T.nano,
                fontWeight:    500,
                letterSpacing: "0.08em",
                fontFamily:    "inherit",
              }}
            >
              CHRONIC CARE · SIMPLIFIED
            </span>
          </div>
        </div>

        {/* Notification bell */}
        <NotificationMenu />
      </div>

      {/* ── Patient identity card ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(251,251,251,0.06)",
          border:     `1px solid rgba(142,175,157,0.22)`,
          boxShadow:  "0 2px 16px rgba(0,0,0,0.28)",
        }}
        role="region"
        aria-label="Patient identity"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + info */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width:      52,
                height:     52,
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
                border:     `2px solid rgba(142,175,157,0.5)`,
              }}
              aria-hidden="true"
            >
              <User size={24} color="rgba(255,255,255,0.95)" />
            </div>
            <div>
              {/* Patient name — BodyL 18px */}
              <h1
                style={{
                  color:         C.textOnDark,
                  fontSize:      T.body,     /* 18px body — patient-facing data */
                  fontWeight:    800,
                  letterSpacing: "-0.02em",
                  lineHeight:    1.25,
                  fontFamily:    "inherit",
                  margin:        0,
                }}
              >
                {patient.name}
              </h1>
              <p
                style={{
                  color:      C.textOnDarkSub,
                  fontSize:   T.caption,    /* 14px caption */
                  fontWeight: 500,
                  marginTop:  3,
                  fontFamily: "inherit",
                }}
              >
                {age} yrs · {patient.gender}
              </p>
              <p
                style={{
                  color:         C.textOnDarkMuted,
                  fontSize:      T.micro,
                  fontWeight:    500,
                  letterSpacing: "0.04em",
                  fontFamily:    "inherit",
                  marginTop:     2,
                }}
              >
                MRN: {patient.mrn}
              </p>
            </div>
          </div>

          {/* Edit profile — 56px touch target */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 rounded-xl px-3 transition-all duration-200 flex-shrink-0"
            style={{
              border:      `1px solid rgba(142,175,157,0.4)`,
              color:       C.textOnDark,
              background:  "rgba(142,175,157,0.12)",
              fontSize:    T.caption,
              fontWeight:  600,
              letterSpacing: "0.02em",
              fontFamily:  "inherit",
              minHeight:   L.touch,        /* 56px */
            }}
            aria-label="Edit patient profile"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = C.primary;
              (e.currentTarget as HTMLButtonElement).style.color = "#111820";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(142,175,157,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = C.textOnDark;
            }}
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>

        {/* Condition tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {patient.conditions.map((cond) => (
            <span
              key={cond}
              style={{
                background:    "rgba(142,175,157,0.2)",
                border:        `1px solid rgba(142,175,157,0.38)`,
                color:         "rgba(255,255,255,0.85)",
                fontSize:      T.nano,
                fontWeight:    700,
                letterSpacing: "0.06em",
                padding:       "3px 10px",
                borderRadius:  L.rFull,
                fontFamily:    "inherit",
              }}
            >
              {cond.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}