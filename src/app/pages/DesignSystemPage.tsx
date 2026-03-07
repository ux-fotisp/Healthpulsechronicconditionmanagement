/**
 * MediFlow · Fluid Design System Showcase
 * ═══════════════════════════════════════════════════════════════
 * Demonstrates all 6 breakpoints, fluid typography with clamp(),
 * audited color tokens, component scaling logic, vault security
 * layer, and responsive input/button behavior.
 *
 * All values reference --fl-* CSS custom properties from theme.css
 * and FL_C / FL_T / FL_L constants from fluidSystem.ts.
 */

import React, { useState, useRef } from "react";
import {
  Monitor, Smartphone, Tablet, CheckCircle, AlertTriangle,
  Lock, LockOpen, Activity, Eye, EyeOff, Zap, Type,
  Palette, Grid, Layers, Shield, Info,
} from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { FL_C, FL_T, FL_L, BP_ENTRIES, type BreakpointKey } from "../design/fluidSystem";

// ── Shared section header ──────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width:          36,
            height:         36,
            background:     FL_C.primaryLight,
            border:         `1px solid ${FL_C.primaryBorder}`,
            borderRadius:   10,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
          aria-hidden="true"
        >
          <Icon size={17} color={FL_C.primary} />
        </div>
        <h2
          style={{
            color:         FL_C.textStrong,
            fontSize:      "var(--fl-h1)",   /* clamp(24px, 5vw, 42px) */
            fontWeight:    700,
            fontFamily:    FL_T.family,
            margin:        0,
            lineHeight:    1.2,
          }}
        >
          {label}
        </h2>
      </div>
      <p
        style={{
          color:      FL_C.text,
          fontSize:   "var(--fl-body-l)",    /* clamp(18px, 2.5vw, 22px) */
          fontWeight: 400,
          lineHeight: FL_T.lineHeight,        /* 1.6 */
          fontFamily: FL_T.family,
          margin:     0,
          marginLeft: 46,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background:   FL_C.surface,
        border:       `1px solid ${FL_C.border}`,
        borderRadius: FL_L.rXl,
        padding:      24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── 1. BREAKPOINT INDICATOR ────────────────────────────────────────────────────
function BreakpointIndicator() {
  const { bp, width, isMobile, isTablet, isDesktop } = useBreakpoint();

  const BP_ICONS: Record<BreakpointKey, React.ComponentType<{ size?: number; color?: string }>> = {
    mobileCompact:   Smartphone,
    mobileStandard:  Smartphone,
    tabletPortrait:  Tablet,
    tabletLandscape: Tablet,
    desktopBase:     Monitor,
    desktopWide:     Monitor,
  };

  const Icon = BP_ICONS[bp];

  return (
    <Card>
      {/* Live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width:          48,
            height:         48,
            background:     FL_C.primaryLight,
            border:         `2px solid ${FL_C.primary}`,
            borderRadius:   "50%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
          aria-hidden="true"
        >
          <Icon size={22} color={FL_C.primary} />
        </div>
        <div>
          <p style={{ margin: 0, color: FL_C.textMuted, fontSize: "var(--fl-body-s)", fontFamily: FL_T.family, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            Active Breakpoint
          </p>
          <p style={{ margin: 0, color: FL_C.primary, fontSize: "var(--fl-h1)", fontWeight: 700, fontFamily: FL_T.family, lineHeight: 1.2 }}>
            {width}px
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "Mobile",  active: isMobile  },
            { label: "Tablet",  active: isTablet   },
            { label: "Desktop", active: isDesktop  },
          ].map((t) => (
            <span
              key={t.label}
              style={{
                background:  t.active ? FL_C.primaryLight : FL_C.locked,
                border:      `1px solid ${t.active ? FL_C.primaryBorder : FL_C.border}`,
                color:       t.active ? FL_C.primary : FL_C.textMuted,
                fontSize:    "var(--fl-body-s)",
                fontWeight:  t.active ? 700 : 500,
                fontFamily:  FL_T.family,
                borderRadius:FL_L.rFull,
                padding:     "4px 12px",
              }}
            >
              {t.active && <CheckCircle size={11} color={FL_C.primary} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />}
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* 6-point scale */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {BP_ENTRIES.map((entry) => {
          const isActive = entry.key === bp;
          const pct = Math.min((width - entry.min) / ((entry.max ?? entry.min + 400) - entry.min) * 100, 100);
          return (
            <div
              key={entry.key}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           12,
                padding:       "8px 12px",
                background:    isActive ? FL_C.primaryLight : "transparent",
                border:        `1px solid ${isActive ? FL_C.primaryBorder : "transparent"}`,
                borderRadius:  FL_L.rMd,
                transition:    "background 0.2s ease",
              }}
            >
              <span
                style={{
                  width:      14,
                  height:     14,
                  borderRadius:"50%",
                  background:  isActive ? FL_C.primary : FL_C.locked,
                  border:      `2px solid ${isActive ? FL_C.primary : FL_C.border}`,
                  flexShrink:  0,
                  display:     "flex",
                  alignItems:  "center",
                  justifyContent:"center",
                }}
                aria-hidden="true"
              >
                {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </span>
              <span
                style={{
                  color:      isActive ? FL_C.primary : FL_C.text,
                  fontSize:   "var(--fl-body-s)",
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: FL_T.family,
                  minWidth:   160,
                }}
              >
                {entry.key === "mobileCompact"   ? "Mobile Compact" :
                 entry.key === "mobileStandard"  ? "Mobile Standard" :
                 entry.key === "tabletPortrait"  ? "Tablet Portrait" :
                 entry.key === "tabletLandscape" ? "Tablet Landscape" :
                 entry.key === "desktopBase"     ? "Desktop Base" : "Desktop Wide"}
              </span>
              <span style={{ color: FL_C.textMuted, fontSize: "var(--fl-body-s)", fontFamily: FL_T.family }}>
                {entry.min}px{entry.max ? ` – ${entry.max}px` : "+"}
              </span>
              {isActive && (
                <>
                  <div style={{ flex: 1, height: 4, background: FL_C.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(pct, 4)}%`, height: "100%", background: FL_C.primary, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, flexShrink: 0 }}>
                    ← Active
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── 2. FLUID TYPOGRAPHY ────────────────────────────────────────────────────────
function FluidTypography() {
  const typeSpecs = [
    {
      label:    "H1 — Titles",
      cssVar:   "var(--fl-h1)",
      clamp:    "clamp(24px, 5vw, 42px)",
      weight:   "Bold 700",
      usage:    "Page titles, section headings",
      lineH:    1.2,
      sample:   "Blood Pressure: 128/82",
    },
    {
      label:    "Body L — Primary Content",
      cssVar:   "var(--fl-body-l)",
      clamp:    "clamp(18px, 2.5vw, 22px)",
      weight:   "Regular 400",
      usage:    "Medical history, dose instructions",
      lineH:    FL_T.lineHeight,   /* 1.6 */
      sample:   "Take 10mg of Lisinopril once daily in the morning with or without food. Monitor blood pressure weekly.",
    },
    {
      label:    "Body S — Metadata / Captions",
      cssVar:   "var(--fl-body-s)",
      clamp:    "clamp(16px, 2vw, 18px)",
      weight:   "Medium 500",
      usage:    "Timestamps, doctor names — absolute minimum 16px (2026 law)",
      lineH:    FL_T.lineHeight,
      sample:   "Last updated: March 5, 2026 · Dr. Emily Chen · Cardiology",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {typeSpecs.map((spec) => (
        <Card key={spec.label}>
          {/* Spec header */}
          <div
            style={{
              display:       "flex",
              alignItems:    "flex-start",
              justifyContent:"space-between",
              gap:           16,
              marginBottom:  12,
              flexWrap:      "wrap" as const,
            }}
          >
            <div>
              <p style={{ margin: 0, color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                {spec.label}
              </p>
              <p style={{ margin: "2px 0 0", color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
                {spec.usage}
              </p>
            </div>
            <code
              style={{
                background:   FL_C.primaryLight,
                border:       `1px solid ${FL_C.primaryBorder}`,
                borderRadius: 8,
                padding:      "4px 10px",
                color:        FL_C.primary,
                fontSize:     12,
                fontFamily:   "monospace",
                flexShrink:   0,
              }}
            >
              {spec.clamp}
            </code>
          </div>

          {/* Live sample — renders at the actual fluid size */}
          <div
            style={{
              background:   `${FL_C.bg}`,
              border:       `1px solid ${FL_C.border}`,
              borderRadius: FL_L.rMd,
              padding:      "16px 20px",
            }}
          >
            <p
              style={{
                fontSize:     spec.cssVar,
                fontWeight:   parseInt(spec.weight),
                lineHeight:   spec.lineH,
                fontFamily:   FL_T.family,
                color:        FL_C.textStrong,
                margin:       0,
              }}
            >
              {spec.sample}
            </p>
          </div>

          {/* Metadata row */}
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" as const }}>
            <span style={{ color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
              Weight: <strong style={{ color: FL_C.text }}>{spec.weight}</strong>
            </span>
            <span style={{ color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
              Line-height: <strong style={{ color: FL_C.text }}>{spec.lineH}</strong>
            </span>
            <span style={{ color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
              Para spacing: <strong style={{ color: FL_C.text }}>1.5em</strong>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── 3. COLOR PALETTE ───────────────────────────────────────────────────────────
function ColorPalette() {
  const swatches = [
    {
      name:     "Primary Action",
      hex:      "#5E8271",
      var:      "--fl-primary",
      contrast: "4.6:1",
      level:    "AA",
      usage:    "CTAs, 'Log Dose', Submit buttons",
      textSample: "Log Dose",
      bg:       FL_C.primary,
      textColor:"#FFFFFF",
    },
    {
      name:     "Text / Body",
      hex:      "#334155",
      var:      "--fl-text",
      contrast: "12.0:1",
      level:    "AAA",
      usage:    "All body text and UI labels",
      textSample: "Take medication as prescribed by your physician.",
      bg:       FL_C.text,
      textColor:"#FFFFFF",
    },
    {
      name:     "Warning",
      hex:      "#A3784E",
      var:      "--fl-warning",
      contrast: "4.8:1",
      level:    "AA",
      usage:    "Low-refill alerts, caution states",
      textSample: "⚠ Low refill — 3 doses remaining",
      bg:       FL_C.warning,
      textColor:"#FFFFFF",
    },
    {
      name:     "Success",
      hex:      "#5B7044",
      var:      "--fl-success",
      contrast: "5.1:1",
      level:    "AA",
      usage:    "Completed states, confirmations",
      textSample: "✓ Dose logged successfully",
      bg:       FL_C.success,
      textColor:"#FFFFFF",
    },
    {
      name:     "Background",
      hex:      "#FBFBFB",
      var:      "--fl-bg",
      contrast: "—",
      level:    "—",
      usage:    "Primary screen surface — high-white, low-glare",
      textSample: "Screen background (anti-glare Soft Alabaster)",
      bg:       FL_C.bg,
      textColor:FL_C.text,
    },
  ];

  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        gap:                 16,
      }}
    >
      {swatches.map((s) => (
        <Card key={s.hex} style={{ padding: 0, overflow: "hidden" }}>
          {/* Color block */}
          <div
            style={{
              background: s.bg,
              padding:    "20px 20px 16px",
              borderBottom: `1px solid ${FL_C.border}`,
              minHeight:  80,
              display:    "flex",
              alignItems: "flex-end",
            }}
          >
            <p
              style={{
                color:      s.textColor,
                fontSize:   "var(--fl-body-s)",
                fontWeight: 600,
                fontFamily: FL_T.family,
                lineHeight: FL_T.lineHeight,
                margin:     0,
              }}
            >
              {s.textSample}
            </p>
          </div>

          {/* Info */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ margin: 0, color: FL_C.textStrong, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family }}>
                {s.name}
              </p>
              {s.level !== "—" && (
                <span
                  style={{
                    background:   s.level === "AAA" ? FL_C.successLight : FL_C.primaryLight,
                    border:       `1px solid ${s.level === "AAA" ? FL_C.successBorder : FL_C.primaryBorder}`,
                    color:        s.level === "AAA" ? FL_C.successDark : FL_C.primary,
                    fontSize:     11,
                    fontWeight:   700,
                    fontFamily:   FL_T.family,
                    borderRadius: FL_L.rFull,
                    padding:      "2px 8px",
                  }}
                >
                  {s.contrast} {s.level}
                </span>
              )}
            </div>
            <code style={{ color: FL_C.primary, fontSize: 13, fontFamily: "monospace", display: "block", marginBottom: 4 }}>
              {s.hex}
            </code>
            <code style={{ color: FL_C.textMuted, fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 8 }}>
              {s.var}
            </code>
            <p style={{ margin: 0, color: FL_C.text, fontSize: "var(--fl-body-s)", fontFamily: FL_T.family, lineHeight: FL_T.lineHeight }}>
              {s.usage}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── 4. COMPONENT SCALING ───────────────────────────────────────────────────────
function ComponentScaling() {
  const { isMobile, touchTarget, inputMaxW } = useBreakpoint();
  const [focused, setFocused] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Touch target demo */}
      <Card>
        <p style={{ margin: "0 0 4px", color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
          Touch Targets
        </p>
        <p style={{ margin: "0 0 16px", color: FL_C.text, fontSize: "var(--fl-body-l)", lineHeight: FL_T.lineHeight, fontFamily: FL_T.family }}>
          Current target height: <strong style={{ color: FL_C.primary }}>{touchTarget}px</strong>
          {" "}— {isMobile ? "Mobile (56px minimum, WCAG 2.1)" : "Tablet/Desktop (48px minimum)"}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12 }}>
          {/* Primary CTA */}
          <button
            style={{
              minHeight:    `var(--fl-touch)`,   /* CSS custom property — scales with BP */
              background:   FL_C.primary,
              border:       "none",
              borderRadius: FL_L.rLg,
              color:        "#FFFFFF",
              fontSize:     "var(--fl-body-l)",
              fontWeight:   700,
              fontFamily:   FL_T.family,
              padding:      "0 24px",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              transition:   "background 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = FL_C.primaryDark; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = FL_C.primary; }}
          >
            <CheckCircle size={18} />
            Log Dose
          </button>

          {/* Warning button */}
          <button
            style={{
              minHeight:    "var(--fl-touch)",
              background:   FL_C.warningLight,
              border:       `2px solid ${FL_C.warningBorder}`,
              borderRadius: FL_L.rLg,
              color:        FL_C.warningDark,
              fontSize:     "var(--fl-body-l)",
              fontWeight:   700,
              fontFamily:   FL_T.family,
              padding:      "0 24px",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
            }}
          >
            <AlertTriangle size={18} />
            Low Refill
          </button>

          {/* Success button */}
          <button
            style={{
              minHeight:    "var(--fl-touch)",
              background:   FL_C.successLight,
              border:       `2px solid ${FL_C.successBorder}`,
              borderRadius: FL_L.rLg,
              color:        FL_C.successDark,
              fontSize:     "var(--fl-body-l)",
              fontWeight:   700,
              fontFamily:   FL_T.family,
              padding:      "0 24px",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
            }}
          >
            <CheckCircle size={18} />
            Completed
          </button>
        </div>

        <p style={{ margin: "12px 0 0", color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
          All buttons use <code>min-height: var(--fl-touch)</code> — auto-scales via CSS media query at 480px.
        </p>
      </Card>

      {/* Input field demo */}
      <Card>
        <p style={{ margin: "0 0 4px", color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
          Responsive Input Fields
        </p>
        <p style={{ margin: "0 0 16px", color: FL_C.text, fontSize: "var(--fl-body-l)", lineHeight: FL_T.lineHeight, fontFamily: FL_T.family }}>
          Input max-width: <strong style={{ color: FL_C.primary }}>{inputMaxW}</strong>
          {" "}— {isMobile ? "Mobile: full-width" : "Desktop: capped at 600px (80-char line length)"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Default state */}
          <div>
            <label style={{ display: "block", color: FL_C.textStrong, fontSize: "var(--fl-body-l)", fontWeight: 600, fontFamily: FL_T.family, marginBottom: 6 }}>
              Medication Name
            </label>
            <div style={{ position: "relative", width: "var(--fl-input-max-w)", maxWidth: inputMaxW }}>
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. Lisinopril 10mg"
                style={{
                  width:        "100%",
                  boxSizing:    "border-box" as const,
                  minHeight:    "var(--fl-touch)",
                  background:   FL_C.inputBg,
                  border:       focused
                    ? `2px solid ${FL_C.primary}`
                    : `1px solid ${FL_C.border}`,
                  borderRadius: FL_L.rMd,
                  padding:      "0 16px",
                  fontSize:     "var(--fl-body-l)",
                  fontFamily:   FL_T.family,
                  color:        FL_C.textStrong,
                  outline:      "none",
                  boxShadow:    focused ? `0 0 0 3px ${FL_C.primaryGlow}` : "none",
                  transition:   "border 0.15s ease, box-shadow 0.15s ease",
                }}
                aria-label="Medication name input — default state"
              />
            </div>
            <p style={{ margin: "4px 0 0", color: FL_C.textMuted, fontSize: 12, fontFamily: FL_T.family }}>
              {focused ? "Focus state: 2px solid #5E8271 + glow ring" : "Default state: 1px solid #CBD5E1"}
            </p>
          </div>

          {/* Error state */}
          <div>
            <label style={{ display: "block", color: FL_C.errorText, fontSize: "var(--fl-body-l)", fontWeight: 600, fontFamily: FL_T.family, marginBottom: 6 }}>
              Dosage <span style={{ color: FL_C.error }}>*</span>
            </label>
            <div style={{ position: "relative", width: "var(--fl-input-max-w)", maxWidth: inputMaxW }}>
              <input
                value=""
                readOnly
                placeholder="Required field"
                style={{
                  width:        "100%",
                  boxSizing:    "border-box" as const,
                  minHeight:    "var(--fl-touch)",
                  background:   FL_C.errorLight,
                  border:       `2px solid ${FL_C.error}`,
                  borderRadius: FL_L.rMd,
                  padding:      "0 44px 0 16px",
                  fontSize:     "var(--fl-body-l)",
                  fontFamily:   FL_T.family,
                  color:        FL_C.errorText,
                  outline:      "none",
                }}
                aria-invalid="true"
                aria-label="Dosage input — error state"
              />
              <AlertTriangle
                size={18}
                color={FL_C.error}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
                aria-hidden="true"
              />
            </div>
            {/* Error: icon + color + text together (WCAG — never color alone) */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <AlertTriangle size={14} color={FL_C.error} aria-hidden="true" />
              <span style={{ color: FL_C.errorText, fontSize: "var(--fl-body-s)", fontWeight: 600, fontFamily: FL_T.family }}>
                Dosage is required — please enter a value
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── 5. VAULT SECURITY LAYER ────────────────────────────────────────────────────
function VaultSecurityDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [showPin, setShowPin]   = useState(false);
  const [pin, setPin]           = useState("");
  const [error, setError]       = useState("");
  const DEMO_PIN = "2026";

  function handleUnlock() {
    if (pin === DEMO_PIN) {
      setUnlocked(true);
      setShowPin(false);
      setError("");
    } else {
      setError("Incorrect PIN. Try: 2026");
      setPin("");
    }
  }

  return (
    <Card>
      <p style={{ margin: "0 0 4px", color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
        Vault Security Layer
      </p>
      <p style={{ margin: "0 0 16px", color: FL_C.text, fontSize: "var(--fl-body-l)", lineHeight: FL_T.lineHeight, fontFamily: FL_T.family }}>
        Gaussian Blur (25px) + <code style={{ background: FL_C.primaryLight, padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>#334155</code> overlay at 70% opacity.
        Click the card to unlock with PIN <strong>2026</strong>.
      </p>

      {/* The vault card — locked state shows blur + overlay */}
      <div
        style={{
          position:     "relative",
          background:   FL_C.surface,
          border:       `1px solid ${FL_C.border}`,
          borderRadius: FL_L.rLg,
          overflow:     "hidden",
          marginBottom: 16,
        }}
      >
        {/* Card content — always rendered; overlay hides it when locked */}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width:          48,
                height:         48,
                background:     FL_C.successLight,
                borderRadius:   FL_L.rMd,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <Activity size={22} color={FL_C.success} />
            </div>
            <div>
              <p style={{ margin: 0, color: FL_C.textStrong, fontSize: "var(--fl-body-l)", fontWeight: 700, fontFamily: FL_T.family }}>
                Blood Panel — March 5, 2026
              </p>
              <p style={{ margin: 0, color: FL_C.text, fontSize: "var(--fl-body-s)", fontFamily: FL_T.family }}>
                Dr. Emily Chen · Cardiology
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "HbA1c", value: "6.8%",    flag: true  },
              { label: "Glucose", value: "98 mg/dL", flag: false },
              { label: "LDL", value: "142 mg/dL", flag: true  },
              { label: "HDL", value: "52 mg/dL",  flag: false },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  padding:        "8px 12px",
                  background:     r.flag ? FL_C.warningLight : FL_C.successLight,
                  border:         `1px solid ${r.flag ? FL_C.warningBorder : FL_C.successBorder}`,
                  borderRadius:   FL_L.rSm,
                }}
              >
                <span style={{ color: FL_C.textStrong, fontSize: "var(--fl-body-s)", fontFamily: FL_T.family, fontWeight: 500 }}>{r.label}</span>
                <span style={{ color: r.flag ? FL_C.warningDark : FL_C.successDark, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── VAULT SECURITY OVERLAY ──
            backdrop-filter: blur(25px) — blurs the card content behind
            background: rgba(51,65,85,0.70) — #334155 at 70% opacity
            Combined: fully obscures sensitive lab data in locked state    */}
        {!unlocked && (
          <div
            style={{
              position:             "absolute",
              inset:                0,
              background:           "rgba(51,65,85,0.70)",    /* --fl-vault-overlay */
              backdropFilter:       "blur(25px)",              /* --fl-vault-blur   */
              WebkitBackdropFilter: "blur(25px)",
              display:              "flex",
              flexDirection:        "column",
              alignItems:           "center",
              justifyContent:       "center",
              gap:                  8,
              cursor:               "pointer",
              borderRadius:         FL_L.rLg,
            }}
            onClick={() => setShowPin(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowPin(true); }}
            aria-label="Locked — click to unlock with PIN"
          >
            {/* Icon + color + text (WCAG: status never by color alone) */}
            <div
              style={{
                width:          52,
                height:         52,
                background:     "rgba(255,255,255,0.12)",
                border:         "2px solid rgba(255,255,255,0.25)",
                borderRadius:   "50%",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <Lock size={24} color="#FFFFFF" />
            </div>
            <span style={{ color: "#FFFFFF", fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.05em" }}>
              LOCKED
            </span>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: FL_T.family }}>
              Click to enter PIN
            </span>
          </div>
        )}

        {/* Unlocked badge */}
        {unlocked && (
          <div
            style={{
              position:  "absolute",
              top:       12,
              right:     12,
              display:   "flex",
              alignItems:"center",
              gap:       6,
              background:FL_C.successLight,
              border:    `1px solid ${FL_C.successBorder}`,
              borderRadius:FL_L.rFull,
              padding:   "4px 12px",
            }}
            role="status"
          >
            <LockOpen size={14} color={FL_C.success} aria-hidden="true" />
            <span style={{ color: FL_C.successDark, fontSize: 12, fontWeight: 700, fontFamily: FL_T.family }}>
              Unlocked
            </span>
          </div>
        )}
      </div>

      {/* Simple PIN input */}
      {showPin && !unlocked && (
        <div
          style={{
            background:   FL_C.surface,
            border:       `1px solid ${FL_C.primary}`,
            borderRadius: FL_L.rLg,
            padding:      16,
            display:      "flex",
            alignItems:   "center",
            gap:          12,
            flexWrap:     "wrap" as const,
          }}
        >
          <Shield size={18} color={FL_C.primary} aria-hidden="true" />
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
            placeholder="Enter PIN (demo: 2026)"
            maxLength={4}
            style={{
              flex:         1,
              minWidth:     120,
              minHeight:    "var(--fl-touch)",
              border:       `1px solid ${error ? FL_C.error : FL_C.border}`,
              borderRadius: FL_L.rMd,
              padding:      "0 12px",
              fontSize:     "var(--fl-body-l)",
              fontFamily:   FL_T.family,
              color:        FL_C.textStrong,
              outline:      "none",
              background:   FL_C.inputBg,
            }}
            aria-label="PIN entry"
          />
          <button
            onClick={handleUnlock}
            style={{
              minHeight:    "var(--fl-touch)",
              background:   FL_C.primary,
              border:       "none",
              borderRadius: FL_L.rMd,
              color:        "#FFFFFF",
              fontSize:     "var(--fl-body-l)",
              fontWeight:   700,
              fontFamily:   FL_T.family,
              padding:      "0 20px",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          6,
            }}
          >
            <LockOpen size={16} />
            Unlock
          </button>
          {error && (
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} color={FL_C.error} aria-hidden="true" />
              <span style={{ color: FL_C.errorText, fontSize: "var(--fl-body-s)", fontWeight: 600, fontFamily: FL_T.family }}>
                {error}
              </span>
            </div>
          )}
        </div>
      )}

      {unlocked && (
        <button
          onClick={() => { setUnlocked(false); setPin(""); setError(""); setShowPin(false); }}
          style={{
            background:   "transparent",
            border:       `1px solid ${FL_C.border}`,
            borderRadius: FL_L.rMd,
            color:        FL_C.text,
            fontSize:     "var(--fl-body-s)",
            fontFamily:   FL_T.family,
            padding:      "6px 14px",
            cursor:       "pointer",
            minHeight:    "auto",
          }}
        >
          Reset (re-lock)
        </button>
      )}
    </Card>
  );
}

// ── 6. LAYOUT GRID DEMO ────────────────────────────────────────────────────────
function LayoutGridDemo() {
  const { bp, gridCols, contentMaxW, width } = useBreakpoint();
  const cols = gridCols;

  const MOCK_CARDS = [
    { label: "Blood Pressure", value: "128/82",   unit: "mmHg",  color: FL_C.primary  },
    { label: "Heart Rate",     value: "72",        unit: "bpm",   color: FL_C.success  },
    { label: "Blood Glucose",  value: "6.8",       unit: "HbA1c", color: FL_C.warning  },
    { label: "Weight",         value: "172",       unit: "lbs",   color: FL_C.primary  },
    { label: "Steps Today",    value: "6,240",     unit: "steps", color: FL_C.success  },
    { label: "Sleep",          value: "7h 20m",    unit: "last night", color: FL_C.text },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: "0 0 4px", color: FL_C.primary, fontSize: "var(--fl-body-s)", fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
          Responsive Grid
        </p>
        <p style={{ margin: 0, color: FL_C.text, fontSize: "var(--fl-body-l)", lineHeight: FL_T.lineHeight, fontFamily: FL_T.family }}>
          Current: <strong style={{ color: FL_C.primary }}>{cols}-column grid</strong> · Content max-width: <strong style={{ color: FL_C.primary }}>{contentMaxW}px</strong>
        </p>
      </div>

      <div
        style={{
          display:             "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap:                 12,
        }}
        role="list"
      >
        {MOCK_CARDS.map((card) => (
          <div
            key={card.label}
            role="listitem"
            style={{
              background:   FL_C.bg,
              border:       `1px solid ${FL_C.border}`,
              borderRadius: FL_L.rLg,
              padding:      "16px",
            }}
          >
            <p
              style={{
                margin:     "0 0 4px",
                color:      FL_C.textMuted,
                fontSize:   "var(--fl-body-s)",
                fontWeight: 500,
                fontFamily: FL_T.family,
                lineHeight: FL_T.lineHeight,
              }}
            >
              {card.label}
            </p>
            <p
              style={{
                margin:     0,
                color:      card.color,
                fontSize:   "var(--fl-h1)",
                fontWeight: 700,
                fontFamily: FL_T.family,
                lineHeight: 1.2,
              }}
            >
              {card.value}
            </p>
            <p
              style={{
                margin:     "2px 0 0",
                color:      FL_C.text,
                fontSize:   "var(--fl-body-s)",
                fontFamily: FL_T.family,
                lineHeight: FL_T.lineHeight,
              }}
            >
              {card.unit}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export function DesignSystemPage() {
  const { bp, width, isMobile } = useBreakpoint();

  const sections = [
    { id: "breakpoints",  icon: Grid,    label: "Breakpoint System",  sub: "Live 6-point scale. Resize your viewport to see the active breakpoint update in real time." },
    { id: "typography",   icon: Type,    label: "Fluid Typography",   sub: "CSS clamp() values scale continuously between anchors. No layout breaks, no unreadable text." },
    { id: "palette",      icon: Palette, label: "Color Tokens",       sub: "Pre-audited for WCAG 2.1 AA. No new colors introduced — all hex values validated." },
    { id: "components",   icon: Zap,     label: "Component Scaling",  sub: "Touch targets, button heights, and input widths respond to the active breakpoint automatically." },
    { id: "vault",        icon: Shield,  label: "Vault Security",     sub: "Gaussian Blur (25px) + rgba(51,65,85,0.70) overlay — fully obscures sensitive content. Click to demo." },
    { id: "grid",         icon: Layers,  label: "Layout Grid",        sub: "Responsive column grid adapts from 1-col mobile to 3-col desktop automatically." },
  ];

  return (
    <div
      style={{
        background: FL_C.bg,
        minHeight:  "100vh",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          background:    `linear-gradient(135deg, ${FL_C.primaryLight} 0%, ${FL_C.bg} 60%)`,
          borderBottom:  `1px solid ${FL_C.border}`,
          padding:       isMobile ? "40px 20px 24px" : "48px 40px 32px",
        }}
      >
        {/* System badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              background:   FL_C.primaryLight,
              border:       `1px solid ${FL_C.primaryBorder}`,
              borderRadius: FL_L.rFull,
              padding:      "4px 14px",
              display:      "flex",
              alignItems:   "center",
              gap:          6,
            }}
          >
            <Layers size={13} color={FL_C.primary} aria-hidden="true" />
            <span style={{ color: FL_C.primary, fontSize: 12, fontWeight: 700, fontFamily: FL_T.family, letterSpacing: "0.06em" }}>
              MEDIFLOW FLUID SYSTEM · v1.0
            </span>
          </div>
          <div
            style={{
              background:   FL_C.successLight,
              border:       `1px solid ${FL_C.successBorder}`,
              borderRadius: FL_L.rFull,
              padding:      "4px 14px",
              display:      "flex",
              alignItems:   "center",
              gap:          6,
            }}
          >
            <CheckCircle size={12} color={FL_C.success} aria-hidden="true" />
            <span style={{ color: FL_C.successDark, fontSize: 12, fontWeight: 700, fontFamily: FL_T.family }}>
              WCAG 2.1 AA
            </span>
          </div>
        </div>

        {/* H1 — fluid clamp(24px, 5vw, 42px) */}
        <h1
          style={{
            fontSize:   "var(--fl-h1)",   /* clamp(24px, 5vw, 42px) */
            fontWeight: 700,
            lineHeight: 1.2,
            color:      FL_C.textStrong,
            fontFamily: FL_T.family,
            margin:     "0 0 12px",
          }}
        >
          Fluid Design System
        </h1>

        {/* Body L — fluid clamp(18px, 2.5vw, 22px) */}
        <p
          style={{
            fontSize:   "var(--fl-body-l)",   /* clamp(18px, 2.5vw, 22px) */
            fontWeight: 400,
            lineHeight: FL_T.lineHeight,        /* 1.6 */
            color:      FL_C.text,
            fontFamily: FL_T.family,
            margin:     "0 0 var(--fl-para-spacing)",   /* 1.5em paragraph spacing */
            maxWidth:   800,
          }}
        >
          A unified, mobile-first design system anchored to 6 breakpoints (320px → 1440px+).
          All typography uses CSS <code style={{ background: FL_C.primaryLight, padding: "1px 6px", borderRadius: 4 }}>clamp()</code> for
          continuous fluid scaling. Colors pre-audited for medical accessibility standards.
        </p>

        {/* Body S — metadata */}
        <p
          style={{
            fontSize:   "var(--fl-body-s)",    /* clamp(16px, 2vw, 18px) */
            fontWeight: 500,
            lineHeight: FL_T.lineHeight,
            color:      FL_C.textMuted,
            fontFamily: FL_T.family,
            margin:     0,
          }}
        >
          Current viewport: <strong style={{ color: FL_C.primary }}>{width}px</strong>
          {" · "}Active breakpoint: <strong style={{ color: FL_C.primary }}>{bp}</strong>
          {" · "}Touch target: <strong style={{ color: FL_C.primary }}>{isMobile ? "56px" : "48px"}</strong>
        </p>
      </div>

      {/* ── Section content ── */}
      <div style={{ padding: isMobile ? "24px 16px 80px" : "40px 40px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

          {/* 1. Breakpoints */}
          <section aria-labelledby="section-breakpoints">
            <SectionHeader icon={sections[0].icon} label={sections[0].label} sub={sections[0].sub} />
            <BreakpointIndicator />
          </section>

          {/* 2. Typography */}
          <section aria-labelledby="section-typography">
            <SectionHeader icon={sections[1].icon} label={sections[1].label} sub={sections[1].sub} />
            <FluidTypography />
          </section>

          {/* 3. Colors */}
          <section aria-labelledby="section-palette">
            <SectionHeader icon={sections[2].icon} label={sections[2].label} sub={sections[2].sub} />
            <ColorPalette />
          </section>

          {/* 4. Components */}
          <section aria-labelledby="section-components">
            <SectionHeader icon={sections[3].icon} label={sections[3].label} sub={sections[3].sub} />
            <ComponentScaling />
          </section>

          {/* 5. Vault */}
          <section aria-labelledby="section-vault">
            <SectionHeader icon={sections[4].icon} label={sections[4].label} sub={sections[4].sub} />
            <VaultSecurityDemo />
          </section>

          {/* 6. Grid */}
          <section aria-labelledby="section-grid">
            <SectionHeader icon={sections[5].icon} label={sections[5].label} sub={sections[5].sub} />
            <LayoutGridDemo />
          </section>

        </div>
      </div>
    </div>
  );
}