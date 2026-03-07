/**
 * HealthPulse · SectionBanner — Frosted Glass Insight Banner
 * ═══════════════════════════════════════════════════════════════════════════════
 * Reusable pill-shaped banner matching the Figma "Section" component.
 * Used for illness-stage contextual banners, adaptive insight cards, etc.
 *
 * Visual spec (from Figma):
 *   - Soft tinted background with inset border overlay
 *   - Semi-transparent white icon container (frosted)
 *   - Extrabold uppercase title with tracking
 *   - Regular weight subtitle at 80% opacity
 *   - Optional trailing icon (default: Activity) at 40% opacity
 *   - 18px border-radius pill shape
 *
 * WCAG 2.1 AA: semantic section landmark, aria-label, contrast-safe tokens.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React from "react";
import { Activity } from "lucide-react";
import { T } from "../../design/tokens";

export interface SectionBannerProps {
  /** Primary accent color for text and icon tinting (e.g. "#1E4A8A") */
  color: string;
  /** Background fill (e.g. "rgba(123,154,204,0.1)") */
  bg: string;
  /** Border color (e.g. "rgba(123,154,204,0.3)") */
  border: string;
  /** Icon rendered inside the frosted container */
  icon: React.ReactNode;
  /** Title text (displayed uppercase) */
  title: string;
  /** Subtitle / description text */
  desc: string;
  /** Optional trailing icon — defaults to Activity at 40% opacity */
  trailingIcon?: React.ReactNode;
  /** Extra className on root */
  className?: string;
  /** aria-label override */
  ariaLabel?: string;
}

export function SectionBanner({
  color,
  bg,
  border,
  icon,
  title,
  desc,
  trailingIcon,
  className = "",
  ariaLabel,
}: SectionBannerProps) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-[18px] px-5 py-3 ${className}`}
      style={{ background: bg }}
      role="status"
      aria-label={ariaLabel ?? title}
    >
      {/* Inset border overlay (matches Figma's absolute border layer) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{ border: `1px solid ${border}` }}
      />

      {/* Frosted icon container */}
      <div
        className="flex items-center justify-center shrink-0 rounded-[18px]"
        style={{
          width: 36,
          height: 36,
          background: "rgba(255,255,255,0.6)",
          border: `1px solid ${border}`,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p
          style={{
            color: "#FFFFFF",
            fontSize: T.nano,
            fontWeight: 800,
            fontFamily: "inherit",
            letterSpacing: "0.05em",
            lineHeight: 1.5,
          }}
        >
          {title.toUpperCase()}
        </p>
        <p
          style={{
            color: "#FFFFFF",
            fontSize: T.nano,
            fontWeight: 400,
            fontFamily: "inherit",
            opacity: 0.8,
            lineHeight: 1.5,
            marginTop: 1,
          }}
        >
          {desc}
        </p>
      </div>

      {/* Trailing icon */}
      {trailingIcon !== undefined ? (
        trailingIcon
      ) : (
        <Activity
          size={16}
          color={color}
          style={{ opacity: 0.4, flexShrink: 0 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}