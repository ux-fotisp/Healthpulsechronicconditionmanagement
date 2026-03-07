/**
 * HealthPulse · RootLayout — Fluid Responsive Shell
 * ══════════════════════════════════════════════════════════════
 * Breakpoint logic (MediFlow 6-point scale):
 *   < 480px  — Mobile: bottom nav, max-width 430px centered
 *   480–767px — Tablet Portrait: side nav, full width
 *   768px+   — Tablet/Desktop: side nav, expanded content area
 */

import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { C } from "../../design/tokens";

export function RootLayout() {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    // ── Mobile layout: centered card, bottom nav ─────────────────────────
    return (
      <div
        className="flex flex-col min-h-screen"
        style={{ background: C.shell }}
      >
        <a href="#main-content" className="hp-skip-link">
          Skip to main content
        </a>
        <div
          className="relative mx-auto w-full"
          style={{ maxWidth: 430, minHeight: "100svh", background: C.shell }}
        >
          <main
            className="overflow-y-auto"
            style={{ paddingBottom: 80 }}
            id="main-content"
            aria-label="HealthPulse main content"
            tabIndex={-1}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
          <BottomNav />
        </div>
      </div>
    );
  }

  // ── Tablet/Desktop layout: side nav + content area ────────────────────
  return (
    <div
      style={{
        display:        "flex",
        minHeight:      "100svh",
        background:     C.shell,
      }}
    >
      <a href="#main-content" className="hp-skip-link">
        Skip to main content
      </a>
      <SideNav />

      {/* Main content — scrollable, constrained width */}
      <main
        style={{
          flex:       1,
          overflowY:  "auto",
          minHeight:  "100svh",
          background: C.shell,
        }}
        id="main-content"
        aria-label="HealthPulse main content"
        tabIndex={-1}
      >
        {/* Inner content wrapper — centers and caps width */}
        <div
          style={{
            maxWidth:  1280,
            margin:    "0 auto",
            minHeight: "100%",
          }}
        >
          <ErrorBoundary>
            <div className="min-h-full rounded-2xl" style={{ background: C.bg }}>
              <Outlet />
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}