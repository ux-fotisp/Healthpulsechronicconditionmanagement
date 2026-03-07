/**
 * HealthPulse · Sprint 2 — S2-4 Plain-Language Lab Interpretation
 * Grade 6-8 reading level · WCAG 2.1 AA compliant
 * "Never show a number without a frame." — Design Principle 2
 */

import { CheckCircle, AlertTriangle, Info, ArrowRight, BookOpen } from "lucide-react";
import { useLabInterpretation } from "../../hooks/useHealthData";
import type { LabInterpretation } from "../../data/helpers";
import { C, T, L } from "../../design/tokens";

interface LabInterpretationCardProps {
  labId: string;
}

const SENTIMENT_CONFIG = {
  positive: {
    bg:     C.successLight,
    border: C.successBorder,
    icon:   C.success,
    text:   C.successDark,
    Icon:   CheckCircle,
  },
  neutral: {
    bg:     C.secondaryLight,
    border: C.secondaryBorder,
    icon:   C.secondary,
    text:   C.textSub,
    Icon:   Info,
  },
  caution: {
    bg:     C.alertLight,
    border: C.alertBorder,
    icon:   C.alert,
    text:   C.alertText,
    Icon:   AlertTriangle,
  },
} as const;

export function LabInterpretationCard({ labId }: LabInterpretationCardProps) {
  const { data: interp, loading } = useLabInterpretation(labId);
  if (loading || !interp) return null;

  const hasCaution = interp.keyPoints.some((p) => p.sentiment === "caution");

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: C.bg,
        border: `1px solid ${hasCaution ? C.alertBorder : C.borderLight}`,
      }}
      role="region"
      aria-label={`Lab interpretation: ${interp.headline}`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{
          background: hasCaution ? C.alertLight : "rgba(142,175,157,0.06)",
          borderBottom: `1px solid ${hasCaution ? C.alertBorder : C.borderLight}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 28,
            height: 28,
            background: hasCaution ? "rgba(212,163,115,0.15)" : C.primaryLight,
            border: `1px solid ${hasCaution ? C.alertBorder : C.primaryBorder}`,
          }}
          aria-hidden="true"
        >
          <BookOpen size={13} color={hasCaution ? C.alert : C.primary} />
        </div>
        <span
          style={{
            color: C.textSub,
            fontSize: T.nano,
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontFamily: "inherit",
          }}
        >
          WHAT THIS MEANS FOR YOU
        </span>
      </div>

      <div className="px-4 py-4">
        {/* Headline */}
        <p
          style={{
            color: C.text,
            fontSize: T.body,
            fontWeight: 700,
            lineHeight: 1.4,
            fontFamily: "inherit",
            marginBottom: 8,
          }}
        >
          {interp.headline}
        </p>

        {/* Summary */}
        <p
          style={{
            color: C.textSub,
            fontSize: T.caption,
            lineHeight: 1.65,
            fontFamily: "inherit",
            marginBottom: 16,
          }}
        >
          {interp.summary}
        </p>

        {/* Key Points */}
        <div className="flex flex-col gap-2.5">
          {interp.keyPoints.map((point, idx) => {
            const cfg = SENTIMENT_CONFIG[point.sentiment];
            const { Icon } = cfg;

            return (
              <div
                key={idx}
                className="rounded-xl px-3.5 py-3"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={14} color={cfg.icon} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        color: cfg.text,
                        fontSize: T.bodySm,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        lineHeight: 1.3,
                        marginBottom: 3,
                      }}
                    >
                      {point.label}
                    </p>
                    <p
                      style={{
                        color: C.textSub,
                        fontSize: 12,
                        fontFamily: "inherit",
                        lineHeight: 1.6,
                      }}
                    >
                      {point.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        <div
          className="rounded-xl px-3.5 py-3 mt-3 flex items-start gap-2.5"
          style={{
            background: C.primaryLight,
            border: `1px solid ${C.primaryBorder}`,
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <ArrowRight size={14} color={C.primary} aria-hidden="true" />
          </div>
          <div>
            <p
              style={{
                color: C.primary,
                fontSize: T.nano,
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontFamily: "inherit",
                marginBottom: 3,
              }}
            >
              NEXT STEPS
            </p>
            <p
              style={{
                color: C.textSub,
                fontSize: 12,
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            >
              {interp.nextSteps}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}