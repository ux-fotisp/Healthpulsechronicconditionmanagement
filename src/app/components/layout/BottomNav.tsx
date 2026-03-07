/**
 * HealthPulse · BottomNav
 * Token: Secondary #64748B (idle), Primary #8EAF9D (active)
 * MediFlow tab: uses MF palette (#5E8271) when active
 * Touch target: 56px minimum per WCAG 2.1 AA (--hp-touch)
 */

import { Home, ClipboardList, Lock, CalendarDays } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { C } from "../../design/tokens";
import { MF_C } from "../../design/mediflow";

const NAV_ITEMS = [
  { label: "Home",       icon: Home,          path: "/",             isMediFlow: false },
  { label: "Care Plan",  icon: ClipboardList, path: "/medications",  isMediFlow: false },
  { label: "Lab Vault",  icon: Lock,          path: "/labs",         isMediFlow: false },
  { label: "Schedule",   icon: CalendarDays,  path: "/appointments", isMediFlow: false },
];

export function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: C.nav,
        borderTop:  `1px solid rgba(142,175,157,0.15)`,
        boxShadow:  "0 -4px 24px rgba(0,0,0,0.45)",
        maxWidth:   430,
        margin:     "0 auto",
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          // MediFlow tab is active for all /mediflow/* routes
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

          const { icon: Icon, isMediFlow } = item as typeof NAV_ITEMS[0] & { isMediFlow?: boolean };
          const activeColor = isMediFlow ? MF_C.primary : C.primary;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center relative transition-all duration-200"
              style={{
                background:    "transparent",
                border:        "none",
                color:         isActive ? activeColor : C.secondary,
                cursor:        "pointer",
                minHeight:     56,   /* WCAG touch target */
                paddingTop:    8,
                paddingBottom: 8,
              }}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2"
                  style={{
                    width:        isMediFlow ? 22 : 28,
                    height:       2,
                    background:   activeColor,
                    borderRadius: "0 0 2px 2px",
                    transform:    "translateX(-50%)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  width:      28,
                  height:     28,
                  background: isActive
                    ? isMediFlow
                      ? `${MF_C.primary}18`
                      : "rgba(142,175,157,0.15)"
                    : "transparent",
                }}
              >
                <Icon
                  size={isActive && isMediFlow ? 15 : 17}
                  color={isActive ? activeColor : C.secondary}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize:      9,
                  fontWeight:    isActive ? 700 : 500,
                  letterSpacing: isActive ? "0.04em" : "0.02em",
                  color:         isActive ? activeColor : C.secondary,
                  marginTop:     3,
                  fontFamily:    "inherit",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}