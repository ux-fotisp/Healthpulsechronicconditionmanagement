import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Pencil, User, Shield, Phone, Mail, Globe, Activity, ClipboardList, ShieldCheck, Bell } from "lucide-react";
import { usePatient, useCarePlanPrefs, useUpdateCarePlanPrefs } from "../hooks/useHealthData";
import { getPatientAge, type Patient } from "../data/helpers";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { toast } from "sonner";
import { C, T, L } from "../design/tokens";

/**
 * ProfileView — Patient Identity Record
 * ═══════════════════════════════════════
 * WCAG 2.1 AA compliant · Muted Healing Palette · Montserrat
 * Token-driven: all colors via C.*, font sizes via T.*, spacing via L.*
 */

const cardStyle = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: L.rLg,
  overflow: "hidden" as const,
};

const labelStyle = {
  color: C.textSub,
  fontSize: T.caption,
  fontWeight: 600 as const,
  letterSpacing: "0.04em",
  fontFamily: T.family,
};

const valueStyle = {
  color: C.text,
  fontSize: T.body,
  fontWeight: 500 as const,
  fontFamily: T.family,
  marginTop: 2,
  lineHeight: 1.5,
};

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <div
      className="flex items-start gap-3 px-5 py-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div
        style={{
          marginTop: 4,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.primaryLight,
          borderRadius: L.rSm,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <Icon size={16} color={C.textSub} />
      </div>
      <div>
        <p style={labelStyle}>{label.toUpperCase()}</p>
        <p style={valueStyle}>{value}</p>
      </div>
    </div>
  );
}

export function ProfileView() {
  const navigate = useNavigate();
  const { data: patient, loading } = usePatient();
  const { data: prefs, loading: prefsLoading, refetch: refetchPrefs } = useCarePlanPrefs();
  const { update: updatePrefs, loading: savingPrefs } = useUpdateCarePlanPrefs();

  if (loading || !patient) return <PageSkeleton title="Profile" cardCount={3} dark={false} />;

  const age = getPatientAge(patient as Patient);

  const handleToggleApproval = async () => {
    try {
      await updatePrefs({ requireDoctorApproval: !prefs?.requireDoctorApproval });
      refetchPrefs();
      toast.success(`Doctor approval ${prefs?.requireDoctorApproval ? "disabled" : "enabled"}`);
    } catch (e: any) {
      toast.error(`Failed to update: ${e.message}`);
    }
  };

  const handleThresholdChange = async (val: number) => {
    try {
      await updatePrefs({ ageThreshold: val });
      refetchPrefs();
    } catch (e: any) {
      toast.error(`Failed to update: ${e.message}`);
    }
  };

  const handleNotifChange = async (pref: "in_app" | "email" | "both") => {
    try {
      await updatePrefs({ notificationPreference: pref });
      refetchPrefs();
    } catch (e: any) {
      toast.error(`Failed to update: ${e.message}`);
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-xl"
          style={{
            width: L.touch,
            height: L.touch,
            background: C.card,
            border: `1px solid ${C.border}`,
            color: C.text,
            cursor: "pointer",
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1
            style={{
              color: C.text,
              fontSize: T.h2,
              fontWeight: 700,
              fontFamily: T.family,
              margin: 0,
            }}
          >
            Profile
          </h1>
          <p
            style={{
              color: C.textSub,
              fontSize: T.caption,
              fontFamily: T.family,
              margin: 0,
            }}
          >
            Patient Identity Record
          </p>
        </div>
        <button
          className="ml-auto flex items-center gap-2 rounded-xl px-4 transition-all duration-200"
          style={{
            background: C.primaryLight,
            border: `1px solid ${C.primaryBorder}`,
            color: C.text,
            fontSize: T.bodyMd + 1,
            fontWeight: 600,
            fontFamily: T.family,
            minHeight: 48,
            cursor: "pointer",
          }}
          aria-label="Edit profile"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.primary;
            (e.currentTarget as HTMLButtonElement).style.color = C.text;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight;
            (e.currentTarget as HTMLButtonElement).style.color = C.text;
          }}
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Avatar section */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={cardStyle}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
              border: `2px solid ${C.primaryBorder}`,
              flexShrink: 0,
            }}
          >
            <User size={32} color={C.textOnDark} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: C.text,
                fontSize: T.h2,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontFamily: T.family,
                margin: 0,
              }}
            >
              {patient.name}
            </h2>
            <p
              style={{
                color: C.textSub,
                fontSize: T.bodyMd + 1,
                fontFamily: T.family,
                marginTop: 4,
              }}
            >
              {age} years · {patient.gender}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Shield size={14} color={C.secondary} />
              <span
                style={{
                  color: C.secondary,
                  fontSize: T.caption,
                  fontFamily: T.family,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                MRN: {patient.mrn}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {patient.conditions.map((c) => (
                <span
                  key={c}
                  style={{
                    background: "rgba(61,107,79,0.08)",
                    border: "1px solid rgba(61,107,79,0.20)",
                    color: C.successDark,
                    fontSize: T.caption,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: L.rFull,
                    letterSpacing: "0.02em",
                    fontFamily: T.family,
                  }}
                >
                  {c.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div style={cardStyle}>
          <div
            className="px-5 py-3"
            style={{
              borderBottom: `1px solid ${C.border}`,
              background: C.primaryLight,
            }}
          >
            <p style={labelStyle}>CONTACT INFORMATION</p>
          </div>
          <InfoRow label="Phone" value={patient.contactPhone} icon={Phone} />
          <InfoRow label="Email" value={patient.contactEmail} icon={Mail} />
          <InfoRow label="Preferred Language" value={patient.preferredLanguage} icon={Globe} />
        </div>

        {/* Clinical info */}
        <div style={cardStyle}>
          <div
            className="px-5 py-3"
            style={{
              borderBottom: `1px solid ${C.border}`,
              background: C.primaryLight,
            }}
          >
            <p style={labelStyle}>CLINICAL DETAILS</p>
          </div>
          <InfoRow label="Date of Birth" value="April 15, 1978" icon={User} />
          <InfoRow label="Gender" value={patient.gender} icon={User} />
          <InfoRow label="Care Team" value={patient.careTeam} icon={Activity} />
          <div className="px-5 py-4">
            <p style={labelStyle}>CONDITIONS</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {patient.conditions.map((c) => (
                <span
                  key={c}
                  style={{
                    background: "rgba(61,107,79,0.08)",
                    border: "1px solid rgba(61,107,79,0.20)",
                    color: C.successDark,
                    fontSize: T.bodyMd + 1,
                    fontWeight: 500,
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontFamily: T.family,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Health Profile Setup CTA */}
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full rounded-2xl overflow-hidden flex items-center gap-3 px-5 py-4 transition-all"
          style={{
            background: "rgba(142,175,157,0.08)",
            border: `1px solid ${C.primaryBorder}`,
            cursor: "pointer",
            textAlign: "left",
            minHeight: L.touch,
          }}
          aria-label="Complete your health profile"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(142,175,157,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(142,175,157,0.08)";
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              background: C.primaryLight,
              border: `1px solid ${C.primaryBorder}`,
            }}
            aria-hidden="true"
          >
            <ClipboardList size={22} color={C.successDark} />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: C.text,
                fontSize: T.body,
                fontWeight: 700,
                fontFamily: T.family,
                margin: 0,
              }}
            >
              Complete Health Profile
            </p>
            <p
              style={{
                color: C.textSub,
                fontSize: T.caption,
                fontFamily: T.family,
                marginTop: 2,
              }}
            >
              Step-by-step medical history setup
            </p>
          </div>
          <ChevronRight size={18} color={C.secondary} />
        </button>

        {/* ── Care Plan Preferences (Sprint 7) ──────────────────────── */}
        <div style={cardStyle}>
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              borderBottom: `1px solid ${C.border}`,
              background: "rgba(196,168,122,0.06)",
            }}
          >
            <ShieldCheck size={14} color={C.amberDark} />
            <p style={{ ...labelStyle, color: C.amberDark }}>CARE PLAN PREFERENCES</p>
          </div>

          {/* Doctor approval toggle */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex-1 min-w-0">
              <p style={{ color: C.text, fontSize: T.bodyMd + 1, fontWeight: 600, fontFamily: T.family }}>
                Require doctor approval
              </p>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: T.family, marginTop: 2 }}>
                Medication changes need your doctor's OK
              </p>
            </div>
            <button
              onClick={handleToggleApproval}
              disabled={savingPrefs || prefsLoading}
              className="rounded-full transition-all flex-shrink-0"
              style={{
                width: 52,
                height: 32,
                background: prefs?.requireDoctorApproval ? C.primary : C.border,
                border: "none",
                cursor: "pointer",
                position: "relative",
                minHeight: 32,
              }}
              role="switch"
              aria-checked={!!prefs?.requireDoctorApproval}
              aria-label="Toggle doctor approval requirement"
            >
              <div
                className="rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: C.card,
                  position: "absolute",
                  top: 3,
                  left: prefs?.requireDoctorApproval ? 23 : 3,
                  transition: "left 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>

          {/* Age threshold */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ color: C.text, fontSize: T.bodyMd + 1, fontWeight: 600, fontFamily: T.family }}>
                Age threshold
              </p>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: T.family, marginTop: 2 }}>
                Auto-enable approval above this age
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleThresholdChange(Math.max(18, (prefs?.ageThreshold ?? 52) - 1))}
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  background: C.primaryLight,
                  border: `1px solid ${C.primaryBorder}`,
                  color: C.text,
                  fontSize: T.body,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                aria-label="Decrease age threshold"
              >
                &minus;
              </button>
              <span style={{
                color: C.text,
                fontSize: 20,
                fontWeight: 800,
                fontFamily: T.family,
                minWidth: 32,
                textAlign: "center",
              }}>
                {prefs?.ageThreshold ?? 52}
              </span>
              <button
                onClick={() => handleThresholdChange(Math.min(100, (prefs?.ageThreshold ?? 52) + 1))}
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  background: C.primaryLight,
                  border: `1px solid ${C.primaryBorder}`,
                  color: C.text,
                  fontSize: T.body,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                aria-label="Increase age threshold"
              >
                +
              </button>
            </div>
          </div>

          {/* Notification preference */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} color={C.secondary} />
              <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 600, fontFamily: T.family }}>
                Notification method
              </p>
            </div>
            <div className="flex gap-2">
              {([
                { value: "in_app" as const, label: "In-App" },
                { value: "email" as const, label: "Email" },
                { value: "both" as const, label: "Both" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleNotifChange(opt.value)}
                  className="flex-1 rounded-lg py-2.5 transition-all"
                  style={{
                    background: prefs?.notificationPreference === opt.value ? "rgba(142,175,157,0.15)" : C.card,
                    border: `1px solid ${prefs?.notificationPreference === opt.value ? C.primary : C.border}`,
                    color: prefs?.notificationPreference === opt.value ? C.successDark : C.textSub,
                    fontSize: T.caption,
                    fontWeight: 600,
                    fontFamily: T.family,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                  aria-pressed={prefs?.notificationPreference === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age context */}
          <div className="px-5 pb-4">
            <div className="rounded-xl px-4 py-3" style={{ background: C.primaryLight, border: `1px solid rgba(142,175,157,0.15)` }}>
              <p style={{ color: C.textSub, fontSize: T.bodySm, fontFamily: T.family, lineHeight: 1.5 }}>
                Your age: <strong style={{ color: C.text }}>{age}</strong> · 
                Threshold: <strong style={{ color: C.text }}>{prefs?.ageThreshold ?? 52}</strong> · 
                Approval: <strong style={{ color: age >= (prefs?.ageThreshold ?? 52) ? C.alertText : C.successDark }}>
                  {prefs?.requireDoctorApproval ? "Required" : "Not required"}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
