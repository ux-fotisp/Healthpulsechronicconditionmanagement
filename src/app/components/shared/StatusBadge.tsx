import React from "react";
import { CheckCircle, AlertTriangle, CircleAlert, Clock, CircleX } from "lucide-react";
import { C } from "../../design/tokens";

export type StatusType =
  | "normal"
  | "warning"
  | "critical"
  | "urgent"
  | "completed"
  | "missed"
  | "overdue"
  | "upcoming"
  | "immediate"
  | "scheduled";

interface StatusBadgeProps {
  status:      StatusType;
  size?:       "sm" | "md";
  showLabel?:  boolean;
  className?:  string;
}

const STATUS_CONFIG: Record<
  StatusType,
  {
    label:     string;
    iconColor: string;
    textColor: string;
    bg:        string;
    border:    string;
    Icon:      React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  /* ── Stable / positive ─────────────────────────────────────────── */
  normal: {
    label: "NORMAL", iconColor: C.success, textColor: C.successDark,
    bg: C.successLight, border: C.successBorder, Icon: CheckCircle,
  },
  completed: {
    label: "COMPLETED", iconColor: C.success, textColor: C.successDark,
    bg: C.successLight, border: C.successBorder, Icon: CheckCircle,
  },
  scheduled: {
    label: "SCHEDULED", iconColor: C.success, textColor: C.successDark,
    bg: C.successLight, border: C.successBorder, Icon: CheckCircle,
  },
  upcoming: {
    label: "UPCOMING", iconColor: C.primary, textColor: "#2D6A5A",
    bg: "rgba(142,175,157,0.14)", border: "rgba(142,175,157,0.3)", Icon: Clock,
  },
  /* ── Alert / negative ──────────────────────────────────────────── */
  warning: {
    label: "WARNING", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: AlertTriangle,
  },
  urgent: {
    label: "URGENT", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: AlertTriangle,
  },
  critical: {
    label: "CRITICAL", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: CircleAlert,
  },
  missed: {
    label: "MISSED", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: CircleX,
  },
  overdue: {
    label: "OVERDUE", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: AlertTriangle,
  },
  immediate: {
    label: "IMMEDIATE", iconColor: C.alert, textColor: C.alertText,
    bg: C.alertLight, border: C.alertBorder, Icon: CircleAlert,
  },
};

export function StatusBadge({
  status,
  size      = "sm",
  showLabel = true,
  className = "",
}: StatusBadgeProps) {
  const cfg      = STATUS_CONFIG[status];
  const { Icon } = cfg;
  const iconSize = size === "sm" ? 12 : 14;
  const textSize = size === "sm" ? "10px" : "11px";
  const padX     = size === "sm" ? "6px" : "8px";
  const padY     = size === "sm" ? "3px" : "4px";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${className}`}
      style={{
        backgroundColor: cfg.bg,
        border:          `1px solid ${cfg.border}`,
        paddingLeft:     padX,
        paddingRight:    padX,
        paddingTop:      padY,
        paddingBottom:   padY,
      }}
      role="status"
      aria-label={cfg.label}
    >
      <Icon
        size={iconSize}
        className="flex-shrink-0"
        style={{ color: cfg.iconColor } as React.CSSProperties}
      />
      {showLabel && (
        <span
          style={{
            fontSize:      textSize,
            fontWeight:    700,
            letterSpacing: "0.06em",
            fontFamily:    "inherit",
            color:         cfg.textColor,
          }}
        >
          {cfg.label}
        </span>
      )}
    </span>
  );
}

export function getStatusColor(status: StatusType): string {
  return STATUS_CONFIG[status]?.iconColor ?? C.success;
}