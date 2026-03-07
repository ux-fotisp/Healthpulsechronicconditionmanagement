/**
 * MediFlow · SideNav — Desktop sidebar navigation (768px+)
 * Replaces the BottomNav for tablet/desktop breakpoints.
 * Touch targets: 48px min-height per FL spec (tablet/desktop).
 */

import { Home, ClipboardList, Lock, CalendarDays, User, Activity, Target } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { FL_C } from "../../design/fluidSystem";
import { C } from "../../design/tokens";

const NAV_ITEMS = [
  { label: "Home",        icon: Home,          path: "/"            },
  { label: "Care Plan",   icon: ClipboardList, path: "/medications" },
  { label: "Goals",       icon: Target,        path: "/goals"       },
  { label: "Vitals",      icon: Activity,      path: "/observations"},
  { label: "Lab Vault",   icon: Lock,          path: "/labs"        },
  { label: "Schedule",    icon: CalendarDays,  path: "/appointments"},
  { label: "Profile",     icon: User,          path: "/profile"     },
];

export function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        width:       240,
        minWidth:    240,
        background:  C.nav,
        borderRight: `1px solid rgba(94,130,113,0.15)`,
        display:     "flex",
        flexDirection:"column",
        height:      "100svh",
        position:    "sticky",
        top:         0,
        flexShrink:  0,
      }}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div
        style={{
          padding:      "32px 20px 24px",
          borderBottom: `1px solid rgba(94,130,113,0.12)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width:          36,
              height:         36,
              background:     `${FL_C.primary}22`,
              border:         `1px solid ${FL_C.primaryBorder}`,
              borderRadius:   10,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <Activity size={18} color={FL_C.primary} />
          </div>
          <div>
            <p
              style={{
                color:      FL_C.textOnDark,
                fontSize:   "clamp(14px, 1.5vw, 16px)",
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                margin:     0,
                lineHeight: 1.2,
              }}
            >
              HealthPulse
            </p>
            <p
              style={{
                color:      "rgba(255,255,255,0.55)",
                fontSize:   11,
                fontFamily: "'Montserrat', sans-serif",
                margin:     0,
              }}
            >
              MediFlow · v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <p
          style={{
            color:         "rgba(255,255,255,0.25)",
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily:    "'Montserrat', sans-serif",
            padding:       "0 8px",
            marginBottom:  8,
          }}
        >
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

          const { icon: Icon } = item;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width:          "100%",
                minHeight:      48,             /* Tablet/Desktop: 48px */
                background:     isActive ? `${FL_C.primary}18` : "transparent",
                border:         isActive ? `1px solid ${FL_C.primaryBorder}` : "1px solid transparent",
                borderRadius:   12,
                display:        "flex",
                alignItems:     "center",
                gap:            12,
                padding:        "0 12px",
                cursor:         "pointer",
                marginBottom:   4,
                transition:     "background 0.15s ease, border 0.15s ease",
              }}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(107,158,135,0.10)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(107,158,135,0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                }
              }}
            >
              {/* Active indicator line */}
              {isActive && (
                <div
                  style={{
                    position:     "absolute",
                    left:         0,
                    width:        3,
                    height:       24,
                    background:   FL_C.primary,
                    borderRadius: "0 2px 2px 0",
                  }}
                  aria-hidden="true"
                />
              )}

              <Icon
                size={17}
                color={isActive ? FL_C.primary : "rgba(255,255,255,0.50)"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                style={{
                  color:      isActive ? FL_C.primary : "rgba(255,255,255,0.60)",
                  fontSize:   "clamp(13px, 1.3vw, 15px)",
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding:   "16px 20px",
          borderTop: `1px solid rgba(94,130,113,0.12)`,
        }}
      >
        <p
          style={{
            color:      "rgba(255,255,255,0.20)",
            fontSize:   10,
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: 1.5,
          }}
        >
          WCAG 2.1 AA · MediFlow Fluid System
        </p>
      </div>
    </nav>
  );
}