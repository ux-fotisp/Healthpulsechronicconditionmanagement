/**
 * MediFlow · useBreakpoint — 6-Point Responsive Hook
 * ══════════════════════════════════════════════════════════════
 * Returns the current active breakpoint key based on window.innerWidth,
 * updated live on resize. Matches the FL 6-point scale exactly.
 */

import { useState, useEffect } from "react";
import { type BreakpointKey, BP } from "../design/fluidSystem";

function getBreakpoint(width: number): BreakpointKey {
  if (width >= BP.desktopWide)     return "desktopWide";
  if (width >= BP.desktopBase)     return "desktopBase";
  if (width >= BP.tabletLandscape) return "tabletLandscape";
  if (width >= BP.tabletPortrait)  return "tabletPortrait";
  if (width >= BP.mobileStandard)  return "mobileStandard";
  return "mobileCompact";
}

export interface BreakpointInfo {
  /** Current breakpoint key */
  bp:              BreakpointKey;
  /** Raw window width in px */
  width:           number;

  /** True for mobile compact + standard (< 480px) */
  isMobile:        boolean;
  /** True for tablet portrait + landscape (480 – 1023px) */
  isTablet:        boolean;
  /** True for desktop base + wide (≥ 1024px) */
  isDesktop:       boolean;

  /** True for any touch-primary context (mobile + tablet) */
  isTouch:         boolean;

  /** Touch target height — 56px mobile, 48px tablet/desktop */
  touchTarget:     number;

  /** Input max width — "100%" mobile, "600px" desktop */
  inputMaxW:       string;

  /** Column count for card grids */
  gridCols:        number;

  /** App content max-width for centering */
  contentMaxW:     number | "100%";
}

export function useBreakpoint(): BreakpointInfo {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 375
  );

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bp       = getBreakpoint(width);
  const isMobile  = bp === "mobileCompact" || bp === "mobileStandard";
  const isTablet  = bp === "tabletPortrait" || bp === "tabletLandscape";
  const isDesktop = bp === "desktopBase" || bp === "desktopWide";
  const isTouch   = isMobile || isTablet;

  return {
    bp,
    width,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    touchTarget:  isMobile ? 56 : 48,
    inputMaxW:    isMobile ? "100%" : "600px",
    gridCols:     isMobile ? 1 : isTablet ? 2 : 3,
    contentMaxW:  isMobile ? 430 : isTablet ? 768 : 1280,
  };
}
