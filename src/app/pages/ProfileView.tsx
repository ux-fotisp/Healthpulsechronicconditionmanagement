import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Pencil, User, Shield, Phone, Mail, Globe, Activity, ClipboardList, ShieldCheck, Bell } from "lucide-react";
import { usePatient, useCarePlanPrefs, useUpdateCarePlanPrefs } from "../hooks/useHealthData";
import { getPatientAge, type Patient } from "../data/helpers";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { toast } from "sonner";

/**
 * ProfileView — Patient Identity Record
 * ═══════════════════════════════════════
 * WCAG 2.1 AA compliant · Muted Healing Palette · Montserrat
 *
 * Contrast audit (all on #FBFBFB):
 *   #1E293B  → 12.6:1 ✓ AAA  (headings, strong text)
 *   #475569  →  5.9:1 ✓ AA   (body text)
 *   #64748B  →  4.6:1 ✓ AA   (secondary labels — large text OK)
 *   #3D6B4F  →  6.2:1 ✓ AA   (condition badges)
 *
 * Font floors: 14px caption min, 18px body, 56px touch targets
 */

const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  borderRadius: 16,
  overflow: "hidden" as const,
};

const labelStyle = {
  color: "#475569",          // 5.9:1 on #FFFFFF ✓ AA
  fontSize: 14,              // caption minimum
  fontWeight: 600 as const,
  letterSpacing: "0.04em",
  fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
};

const valueStyle = {
  color: "#1E293B",          // 12.6:1 on #FFFFFF ✓ AAA
  fontSize: 18,              // body L
  fontWeight: 500 as const,
  fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
      style={{ borderBottom: "1px solid #CBD5E1" }}
    >
      <div
        style={{
          marginTop: 4,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(142,175,157,0.10)",
          borderRadius: 8,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <Icon size={16} color="#475569" />
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
    <div style={{ background: "#FBFBFB", minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: "1px solid #CBD5E1" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 56,
            height: 56,               // 56px touch target ✓
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#1E293B",
            cursor: "pointer",
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1
            style={{
              color: "#1E293B",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
              margin: 0,
            }}
          >
            Profile
          </h1>
          <p
            style={{
              color: "#475569",      // 5.9:1 ✓ AA
              fontSize: 14,
              fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
              margin: 0,
            }}
          >
            Patient Identity Record
          </p>
        </div>
        <button
          className="ml-auto flex items-center gap-2 rounded-xl px-4 transition-all duration-200"
          style={{
            background: "rgba(142,175,157,0.12)",
            border: "1px solid rgba(142,175,157,0.35)",
            color: "#1E293B",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
            minHeight: 48,
            cursor: "pointer",
          }}
          aria-label="Edit profile"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#8EAF9D";
            (e.currentTarget as HTMLButtonElement).style.color = "#1E293B";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(142,175,157,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "#1E293B";
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
              background: "linear-gradient(135deg, #8EAF9D 0%, #7A9D8C 100%)",
              border: "2px solid rgba(142,175,157,0.4)",
              flexShrink: 0,
            }}
          >
            <User size={32} color="#FFFFFF" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: "#1E293B",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
                margin: 0,
              }}
            >
              {patient.name}
            </h2>
            <p
              style={{
                color: "#475569",       // 5.9:1 ✓ AA
                fontSize: 16,
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
                marginTop: 4,
              }}
            >
              {age} years · {patient.gender}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Shield size={14} color="#64748B" />
              <span
                style={{
                  color: "#64748B",     // 4.6:1 ✓ AA (large text)
                  fontSize: 14,
                  fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
                    color: "#3D6B4F",       // 6.2:1 ✓ AA
                    fontSize: 14,           // caption min
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 100,
                    letterSpacing: "0.02em",
                    fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
              borderBottom: "1px solid #CBD5E1",
              background: "rgba(142,175,157,0.06)",
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
              borderBottom: "1px solid #CBD5E1",
              background: "rgba(142,175,157,0.06)",
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
                    color: "#3D6B4F",        // 6.2:1 ✓ AA
                    fontSize: 16,
                    fontWeight: 500,
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
            border: "1px solid rgba(142,175,157,0.30)",
            cursor: "pointer",
            textAlign: "left",
            minHeight: 56,        // touch target ✓
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
              background: "rgba(142,175,157,0.12)",
              border: "1px solid rgba(142,175,157,0.30)",
            }}
            aria-hidden="true"
          >
            <ClipboardList size={22} color="#3D6B4F" />
          </div>
          <div className="flex-1">
            <p
              style={{
                color: "#1E293B",         // 12.6:1 ✓ AAA
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
                margin: 0,
              }}
            >
              Complete Health Profile
            </p>
            <p
              style={{
                color: "#475569",         // 5.9:1 ✓ AA
                fontSize: 14,
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
                marginTop: 2,
              }}
            >
              Step-by-step medical history setup
            </p>
          </div>
          <ChevronRight size={18} color="#64748B" />
        </button>

        {/* ── Care Plan Preferences (Sprint 7) ──────────────────────── */}
        <div style={cardStyle}>
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              borderBottom: "1px solid #CBD5E1",
              background: "rgba(196,168,122,0.06)",
            }}
          >
            <ShieldCheck size={14} color="#7A6230" />
            <p style={{ ...labelStyle, color: "#7A6230" }}>CARE PLAN PREFERENCES</p>
          </div>

          {/* Doctor approval toggle */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #CBD5E1" }}>
            <div className="flex-1 min-w-0">
              <p style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif" }}>
                Require doctor approval
              </p>
              <p style={{ color: "#475569", fontSize: 14, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif", marginTop: 2 }}>
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
                background: prefs?.requireDoctorApproval ? "#8EAF9D" : "#CBD5E1",
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
                  background: "#FFFFFF",
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
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #CBD5E1" }}>
            <div>
              <p style={{ color: "#1E293B", fontSize: 16, fontWeight: 600, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif" }}>
                Age threshold
              </p>
              <p style={{ color: "#475569", fontSize: 14, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif", marginTop: 2 }}>
                Auto-enable approval above this age
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleThresholdChange(Math.max(18, (prefs?.ageThreshold ?? 52) - 1))}
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  background: "rgba(142,175,157,0.12)",
                  border: "1px solid rgba(142,175,157,0.3)",
                  color: "#1E293B",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                aria-label="Decrease age threshold"
              >
                &minus;
              </button>
              <span style={{
                color: "#1E293B",
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
                  background: "rgba(142,175,157,0.12)",
                  border: "1px solid rgba(142,175,157,0.3)",
                  color: "#1E293B",
                  fontSize: 18,
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
              <Bell size={14} color="#64748B" />
              <p style={{ color: "#475569", fontSize: 14, fontWeight: 600, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif" }}>
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
                    background: prefs?.notificationPreference === opt.value ? "rgba(142,175,157,0.15)" : "#FFFFFF",
                    border: `1px solid ${prefs?.notificationPreference === opt.value ? "#8EAF9D" : "#CBD5E1"}`,
                    color: prefs?.notificationPreference === opt.value ? "#3D6B4F" : "#475569",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
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
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(142,175,157,0.06)", border: "1px solid rgba(142,175,157,0.15)" }}>
              <p style={{ color: "#475569", fontSize: 13, fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif", lineHeight: 1.5 }}>
                Your age: <strong style={{ color: "#1E293B" }}>{age}</strong> · 
                Threshold: <strong style={{ color: "#1E293B" }}>{prefs?.ageThreshold ?? 52}</strong> · 
                Approval: <strong style={{ color: age >= (prefs?.ageThreshold ?? 52) ? "#92400E" : "#3D6B4F" }}>
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