/**
 * HealthPulse · Loading Skeleton
 * Muted Healing Palette · accessible pulse animation
 */

import { C } from "../../design/tokens";

/** Animated pulse bar */
function PulseBar({
  width = "100%",
  height = 16,
  radius = 8,
  dark = false,
}: {
  width?: string | number;
  height?: number;
  radius?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(142,175,157,0.12)",
      }}
      aria-hidden="true"
    />
  );
}

/** Card-level skeleton — light background */
export function CardSkeleton({ lines = 3, dark = false }: { lines?: number; dark?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: dark ? "rgba(251,251,251,0.04)" : C.bg,
        border: `1px solid ${dark ? "rgba(142,175,157,0.15)" : C.border}`,
      }}
      role="status"
      aria-label="Loading content"
    >
      <PulseBar width="60%" height={14} dark={dark} />
      {Array.from({ length: lines }).map((_, i) => (
        <PulseBar key={i} width={i === lines - 1 ? "40%" : "90%"} height={12} dark={dark} />
      ))}
    </div>
  );
}

/** Full-page skeleton for dark-shell pages */
export function PageSkeleton({
  title,
  cardCount = 3,
  dark = true,
}: {
  title?: string;
  cardCount?: number;
  dark?: boolean;
}) {
  const bg = dark ? "#1A2B1C" : C.bg;
  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      {/* Header skeleton */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: `1px solid ${dark ? "rgba(157,187,155,0.15)" : C.border}` }}
      >
        <PulseBar width={36} height={36} radius={10} dark={dark} />
        <div className="flex flex-col gap-2 flex-1">
          {title ? (
            <span
              style={{
                color: dark ? "#FFFFFF" : C.text,
                fontSize: 17,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {title}
            </span>
          ) : (
            <PulseBar width="50%" height={17} dark={dark} />
          )}
          <PulseBar width="35%" height={11} dark={dark} />
        </div>
      </div>

      {/* Card skeletons */}
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} lines={i === 0 ? 4 : 3} dark={dark} />
        ))}
      </div>
    </div>
  );
}

/** Home dashboard skeleton — dark shell */
export function DashboardSkeleton() {
  return (
    <div style={{ background: C.shell, minHeight: "100vh" }} aria-label="Loading dashboard">
      {/* Patient header skeleton */}
      <div
        className="px-4 pt-10 pb-4"
        style={{
          background: "linear-gradient(145deg, #111820 0%, #1A2B1C 100%)",
          borderBottom: "1px solid rgba(142,175,157,0.18)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <PulseBar width={36} height={36} radius={12} dark />
          <div className="flex flex-col gap-1.5">
            <PulseBar width={120} height={20} dark />
            <PulseBar width={80} height={10} dark />
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(251,251,251,0.06)", border: "1px solid rgba(142,175,157,0.22)" }}>
          <div className="flex items-center gap-3">
            <PulseBar width={52} height={52} radius={9999} dark />
            <div className="flex flex-col gap-2 flex-1">
              <PulseBar width="70%" height={16} dark />
              <PulseBar width="40%" height={12} dark />
              <PulseBar width="30%" height={10} dark />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard card skeletons */}
      <div className="flex flex-col gap-4 py-4">
        {[4, 3, 3, 2, 3].map((lines, i) => (
          <div key={i} className="mx-4">
            <CardSkeleton lines={lines} />
          </div>
        ))}
      </div>
    </div>
  );
}
