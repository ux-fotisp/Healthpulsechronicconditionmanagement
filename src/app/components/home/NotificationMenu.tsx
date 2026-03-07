/**
 * HealthPulse · NotificationMenu — Persisted Push Alerts (Sprint 9+)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Features:
 *   1. Server-persisted notifications via generate → GET → PUT (mark read)
 *   2. Direct navigation: each notification routes to its source page
 *   3. Notification Preferences panel: mute by type, per-med muting, quiet hours
 *   4. Badge pulse animation when new notifications arrive
 *   5. Background polling (60s interval) for live updates without reload
 * WCAG 2.1 AA: 56px touch targets, 4.5:1 contrast, focus management, aria roles
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  X,
  Pill,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Settings,
  ArrowLeft,
  BellOff,
  Moon,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router";
import { C, T, L } from "../../design/tokens";
import * as api from "../../data/api";
import type { NotificationDTO, NotificationPrefsDTO, MedicationDTO } from "../../data/api";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 60_000; // 60 seconds
const PULSE_DURATION_MS = 3_000; // Badge pulse lasts 3 seconds

// ── CSS Keyframes (injected once) ────────────────────────────────────────────
const STYLE_ID = "hp-notif-pulse-styles";
function ensurePulseStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes hp-badge-pulse {
      0%   { transform: scale(1);   box-shadow: 0 0 0 0 rgba(220,38,38,0.55); }
      50%  { transform: scale(1.25); box-shadow: 0 0 0 8px rgba(220,38,38,0); }
      100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(220,38,38,0); }
    }
    @keyframes hp-bell-ring {
      0%   { transform: rotate(0deg); }
      15%  { transform: rotate(14deg); }
      30%  { transform: rotate(-12deg); }
      45%  { transform: rotate(8deg); }
      60%  { transform: rotate(-6deg); }
      75%  { transform: rotate(3deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

// ── Severity styles ──────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  overdue: {
    bg: C.alertLight,
    border: C.alertBorder,
    iconColor: C.alert,
    textColor: C.alertText,
    label: "OVERDUE",
  },
  due_soon: {
    bg: "rgba(212,163,115,0.08)",
    border: "rgba(212,163,115,0.2)",
    iconColor: C.amber,
    textColor: C.amberDark,
    label: "DUE SOON",
  },
  upcoming: {
    bg: C.primaryLight,
    border: C.primaryBorder,
    iconColor: C.primary,
    textColor: C.primaryDark,
    label: "UPCOMING",
  },
  info: {
    bg: C.secondaryLight,
    border: C.secondaryBorder,
    iconColor: C.secondary,
    textColor: C.secondaryDark,
    label: "INFO",
  },
} as const;

const TYPE_ICON = {
  medication: Pill,
  vital: Activity,
  appointment: Calendar,
} as const;

type PanelView = "list" | "preferences";

// ── Component ────────────────────────────────────────────────────────────────
export function NotificationMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>("list");
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevUnreadRef = useRef<number>(0);

  // Inject CSS once
  useEffect(() => { ensurePulseStyles(); }, []);

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;
  const activeNotifs = notifications.filter((n) => !n.dismissed);

  // ── Detect new arrivals → trigger pulse ────────────────────────────────
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
      setPulsing(true);
      setBellRinging(true);
      const pulseTimer = setTimeout(() => setPulsing(false), PULSE_DURATION_MS);
      const ringTimer = setTimeout(() => setBellRinging(false), 800);
      prevUnreadRef.current = unreadCount;
      return () => { clearTimeout(pulseTimer); clearTimeout(ringTimer); };
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // ── Fetch notifications (silent = no loading spinner for polls) ─────────
  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      await api.generateNotifications();
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e: any) {
      console.error("[NotificationMenu] Failed to load notifications:", e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadPrefs = useCallback(async () => {
    try {
      const data = await api.getNotificationPrefs();
      setPrefs(data);
    } catch (e: any) {
      console.error("[NotificationMenu] Failed to load preferences:", e.message);
    }
  }, []);

  // ── Initial load on mount ──────────────────────────────────────────────
  useEffect(() => {
    // Suppress the initial pulse by setting prevUnreadRef to -1
    prevUnreadRef.current = -1;
    fetchNotifications(true).then(() => {
      // After first fetch, allow future increases to trigger pulse
      // (the useEffect on unreadCount will fire, but prevUnreadRef is already set)
    });
    loadPrefs();
  }, [fetchNotifications, loadPrefs]);

  // ── Load when panel opens ──────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      fetchNotifications(false);
      loadPrefs();
    }
  }, [open, fetchNotifications, loadPrefs]);

  // ── Background polling every 60s ───────────────────────────────────────
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications(true); // silent poll
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // ── Mark single as read + navigate ─────────────────────────────────────
  const handleNotificationClick = useCallback(async (notif: NotificationDTO) => {
    if (!notif.read) {
      try {
        await api.updateNotification(notif.id, { read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (e: any) {
        console.error("[NotificationMenu] Failed to mark read:", e.message);
      }
    }
    if (notif.navigateTo) {
      setOpen(false);
      navigate(notif.navigateTo);
    }
  }, [navigate]);

  // ── Mark all read ──────────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e: any) {
      console.error("[NotificationMenu] Failed to mark all read:", e.message);
    }
  }, []);

  // ── Dismiss notification ───────────────────────────────────────────────
  const handleDismiss = useCallback(async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err: any) {
      console.error("[NotificationMenu] Failed to dismiss:", err.message);
    }
  }, []);

  // ── Update preferences ─────────────────────────────────────────────────
  const handlePrefChange = useCallback(async (update: Partial<NotificationPrefsDTO>) => {
    if (!prefs) return;
    setSavingPrefs(true);
    const newPrefs = { ...prefs, ...update };
    setPrefs(newPrefs);
    try {
      await api.updateNotificationPrefs(update);
    } catch (e: any) {
      console.error("[NotificationMenu] Failed to save prefs:", e.message);
    } finally {
      setSavingPrefs(false);
    }
  }, [prefs]);

  const toggleMutedType = useCallback((type: string) => {
    if (!prefs) return;
    const current = prefs.mutedTypes || [];
    const newMuted = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    handlePrefChange({ mutedTypes: newMuted });
  }, [prefs, handlePrefChange]);

  const toggleMutedMedication = useCallback((medId: string) => {
    if (!prefs) return;
    const current = prefs.mutedMedicationIds || [];
    const newMuted = current.includes(medId)
      ? current.filter((id) => id !== medId)
      : [...current, medId];
    handlePrefChange({ mutedMedicationIds: newMuted });
  }, [prefs, handlePrefChange]);

  // ── Close on outside click ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setView("list");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Close on Escape ────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (view === "preferences") {
          setView("list");
        } else {
          setOpen(false);
        }
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, view]);

  return (
    <div className="relative">
      {/* Bell button — 56px touch target */}
      <button
        ref={buttonRef}
        onClick={() => { setOpen((prev) => !prev); setView("list"); }}
        className="flex items-center justify-center rounded-xl transition-all duration-200"
        style={{
          width: L.touch,
          height: L.touch,
          background: open ? "rgba(142,175,157,0.2)" : "rgba(142,175,157,0.12)",
          border: "1px solid rgba(142,175,157,0.4)",
          position: "relative",
          cursor: "pointer",
        }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span
          style={{
            display: "inline-flex",
            animation: bellRinging ? "hp-bell-ring 0.8s ease-in-out" : "none",
            transformOrigin: "top center",
          }}
        >
          <Bell size={20} color={C.textOnDark} />
        </span>

        {/* Badge with pulse */}
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center"
            style={{
              top: 6,
              right: 6,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: C.alert,
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "inherit",
              padding: "0 4px",
              border: `2px solid ${C.shell}`,
              animation: pulsing ? "hp-badge-pulse 0.6s ease-in-out 3" : "none",
            }}
            aria-hidden="true"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute z-50"
          style={{
            top: "calc(100% + 8px)", right: 0, width: "min(400px, 92vw)",
            maxHeight: "75vh", overflowY: "auto", background: C.bg,
            borderRadius: L.rXl, border: `1px solid ${C.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)",
          }}
          role="dialog"
          aria-label={view === "preferences" ? "Notification preferences" : "Notifications panel"}
        >
          {view === "list" ? (
            <NotificationListView
              notifications={activeNotifs}
              unreadCount={unreadCount}
              loading={loading}
              onClose={() => setOpen(false)}
              onMarkAllRead={handleMarkAllRead}
              onNotificationClick={handleNotificationClick}
              onDismiss={handleDismiss}
              onOpenPreferences={() => setView("preferences")}
            />
          ) : (
            <PreferencesView
              prefs={prefs}
              saving={savingPrefs}
              onBack={() => setView("list")}
              onPrefChange={handlePrefChange}
              onToggleMuted={toggleMutedType}
              onToggleMutedMed={toggleMutedMedication}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function NotificationListView({
  notifications,
  unreadCount,
  loading,
  onClose,
  onMarkAllRead,
  onNotificationClick,
  onDismiss,
  onOpenPreferences,
}: {
  notifications: NotificationDTO[];
  unreadCount: number;
  loading: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: NotificationDTO) => void;
  onDismiss: (e: React.MouseEvent, id: string) => void;
  onOpenPreferences: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0"
        style={{ background: C.bg, borderBottom: `1px solid ${C.borderLight}`, zIndex: 1 }}
      >
        <div className="flex items-center gap-2">
          <Bell size={14} color={C.primary} />
          <span style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 700, fontFamily: "inherit" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="flex items-center justify-center"
              style={{
                minWidth: 20, height: 20, borderRadius: 10, background: C.alertLight,
                color: C.alertText, fontSize: T.nano, fontWeight: 800, fontFamily: "inherit", padding: "0 5px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                background: "transparent", border: "none", color: C.primary,
                fontSize: T.caption, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: "4px 8px",
              }}
              aria-label="Mark all notifications as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onOpenPreferences}
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: "rgba(100,116,139,0.08)", border: "none", cursor: "pointer" }}
            aria-label="Notification settings"
          >
            <Settings size={15} color={C.textSub} />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: "rgba(100,116,139,0.08)", border: "none", cursor: "pointer" }}
            aria-label="Close notifications"
          >
            <X size={16} color={C.textSub} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-3 flex flex-col gap-2" aria-live="polite">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="rounded-full"
              style={{
                width: 24, height: 24, border: `3px solid ${C.borderLight}`,
                borderTopColor: C.primary, animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8" role="status">
            <CheckCircle size={28} color={C.success} />
            <p className="mt-2" style={{ color: C.textSub, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>
              All caught up!
            </p>
            <p style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit", marginTop: 4 }}>
              No pending notifications
            </p>
          </div>
        ) : (
          notifications.map((note) => {
            const sev = SEVERITY_STYLES[note.severity] || SEVERITY_STYLES.info;
            const Icon = TYPE_ICON[note.type] || Bell;
            const isRead = note.read;

            return (
              <div
                key={note.id}
                className="flex items-start gap-3 rounded-xl p-3 transition-all duration-150 group"
                style={{
                  background: isRead ? "transparent" : sev.bg,
                  border: `1px solid ${isRead ? C.borderLight : sev.border}`,
                  minHeight: L.touch,
                  cursor: "pointer",
                  opacity: isRead ? 0.7 : 1,
                  position: "relative",
                }}
                role="button"
                tabIndex={0}
                onClick={() => onNotificationClick(note)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNotificationClick(note);
                  }
                }}
                aria-label={`${note.title} — ${note.detail} — ${sev.label}. ${note.navigateTo ? "Tap to navigate." : ""}`}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 40, height: 40, background: C.card, border: `1px solid ${sev.border}` }}
                  aria-hidden="true"
                >
                  <Icon size={18} color={sev.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: isRead ? 500 : 700, lineHeight: 1.35, fontFamily: "inherit" }}>
                      {note.title}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isRead && (
                        <span
                          style={{ width: 8, height: 8, borderRadius: 4, background: sev.iconColor }}
                          aria-hidden="true"
                        />
                      )}
                      <button
                        onClick={(e) => onDismiss(e, note.id)}
                        className="flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ width: 24, height: 24, background: "rgba(100,116,139,0.08)", border: "none", cursor: "pointer" }}
                        aria-label={`Dismiss notification: ${note.title}`}
                      >
                        <X size={12} color={C.textMuted} />
                      </button>
                    </div>
                  </div>
                  <p style={{ color: C.textSub, fontSize: T.caption, fontWeight: 500, marginTop: 2, fontFamily: "inherit", lineHeight: 1.3 }}>
                    {note.detail}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1">
                      {note.severity === "overdue" ? (
                        <AlertTriangle size={10} color={sev.iconColor} />
                      ) : (
                        <Clock size={10} color={sev.iconColor} />
                      )}
                      <span style={{ color: sev.textColor, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "inherit" }}>
                        {sev.label}
                      </span>
                    </div>
                    {note.navigateTo && (
                      <div className="flex items-center gap-0.5">
                        <ChevronRight size={10} color={C.primary} />
                        <span style={{ color: C.primary, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>
                          View
                        </span>
                      </div>
                    )}
                    <span style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit", marginLeft: "auto" }}>
                      {formatNotifTime(note.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PREFERENCES VIEW
// ═══════════════════════════════════════════════════════════════════════════════

function PreferencesView({
  prefs,
  saving,
  onBack,
  onPrefChange,
  onToggleMuted,
  onToggleMutedMed,
}: {
  prefs: NotificationPrefsDTO | null;
  saving: boolean;
  onBack: () => void;
  onPrefChange: (update: Partial<NotificationPrefsDTO>) => void;
  onToggleMuted: (type: string) => void;
  onToggleMutedMed: (medId: string) => void;
}) {
  const [medications, setMedications] = useState<MedicationDTO[]>([]);
  const [medsExpanded, setMedsExpanded] = useState(false);
  const [medsLoading, setMedsLoading] = useState(false);

  // Fetch active medications when this section expands
  useEffect(() => {
    if (medsExpanded && medications.length === 0) {
      setMedsLoading(true);
      api.getMedications()
        .then((meds) => setMedications(meds.filter((m) => m.status === "active")))
        .catch((e) => console.error("[Prefs] Failed to load medications:", e.message))
        .finally(() => setMedsLoading(false));
    }
  }, [medsExpanded, medications.length]);

  if (!prefs) return null;

  const mutedTypes = prefs.mutedTypes || [];
  const mutedMedIds = prefs.mutedMedicationIds || [];
  const isMedTypeMuted = mutedTypes.includes("medication");

  const notifTypes: { id: string; label: string; desc: string; icon: typeof Pill }[] = [
    { id: "medication", label: "Medication Reminders", desc: "Dose due, overdue, and intake alerts", icon: Pill },
    { id: "vital", label: "Vital Alerts", desc: "Abnormal readings and logging reminders", icon: Activity },
    { id: "appointment", label: "Appointment Alerts", desc: "Upcoming exams and schedule reminders", icon: Calendar },
  ];

  const leadOptions = [15, 30, 60, 120];

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0"
        style={{ background: C.bg, borderBottom: `1px solid ${C.borderLight}`, zIndex: 1 }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-lg"
          style={{ width: 32, height: 32, background: "rgba(100,116,139,0.08)", border: "none", cursor: "pointer" }}
          aria-label="Back to notifications"
        >
          <ArrowLeft size={16} color={C.textSub} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Settings size={14} color={C.primary} />
          <span style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 700, fontFamily: "inherit" }}>
            Preferences
          </span>
        </div>
        {saving && (
          <span style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>
            Saving...
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* ── Alert Type Toggles ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BellOff size={12} color={C.textSub} />
            <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              ALERT TYPES
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {notifTypes.map(({ id, label, desc, icon: TypeIcon }) => {
              const isMuted = mutedTypes.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => onToggleMuted(id)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150"
                  style={{
                    background: isMuted ? "rgba(100,116,139,0.04)" : C.primaryLight,
                    border: `1px solid ${isMuted ? C.borderLight : C.primaryBorder}`,
                    minHeight: L.touch,
                    cursor: "pointer",
                  }}
                  aria-label={`${label}: ${isMuted ? "muted" : "active"}. Tap to ${isMuted ? "unmute" : "mute"}.`}
                  aria-pressed={!isMuted}
                >
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      width: 40, height: 40,
                      background: isMuted ? C.secondaryLight : C.card,
                      border: `1px solid ${isMuted ? C.secondaryBorder : C.primaryBorder}`,
                    }}
                    aria-hidden="true"
                  >
                    <TypeIcon size={18} color={isMuted ? C.textMuted : C.primary} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{
                      color: isMuted ? C.textMuted : C.text,
                      fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit",
                      textDecoration: isMuted ? "line-through" : "none",
                    }}>
                      {label}
                    </p>
                    <p style={{ color: C.textMuted, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit", marginTop: 1 }}>
                      {desc}
                    </p>
                  </div>
                  <TogglePill active={!isMuted} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Per-Medication Muting ─────────────────────────────────────── */}
        {!isMedTypeMuted && (
          <div>
            <button
              onClick={() => setMedsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-xl p-3 text-left transition-all"
              style={{
                background: "rgba(100,116,139,0.04)",
                border: `1px solid ${C.borderLight}`,
                minHeight: L.touch,
                cursor: "pointer",
              }}
              aria-expanded={medsExpanded}
              aria-label="Per-medication alert settings"
            >
              <div className="flex items-center gap-2">
                <Pill size={14} color={C.textSub} />
                <div>
                  <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>
                    Per-Medication Alerts
                  </p>
                  <p style={{ color: C.textMuted, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit", marginTop: 1 }}>
                    {mutedMedIds.length > 0
                      ? `${mutedMedIds.length} medication${mutedMedIds.length > 1 ? "s" : ""} muted`
                      : "All medications active"}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                color={C.textSub}
                style={{
                  transform: medsExpanded ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {/* Expanded per-medication list */}
            {medsExpanded && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: `1px solid ${C.borderLight}` }}
              >
                {medsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div
                      className="rounded-full"
                      style={{
                        width: 20, height: 20, border: `2px solid ${C.borderLight}`,
                        borderTopColor: C.primary, animation: "spin 1s linear infinite",
                      }}
                    />
                  </div>
                ) : medications.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p style={{ color: C.textMuted, fontSize: T.caption, fontFamily: "inherit" }}>
                      No active medications
                    </p>
                  </div>
                ) : (
                  medications.map((med, i) => {
                    const isMedMuted = mutedMedIds.includes(med.id);
                    return (
                      <button
                        key={med.id}
                        onClick={() => onToggleMutedMed(med.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150"
                        style={{
                          background: isMedMuted ? "rgba(100,116,139,0.04)" : "transparent",
                          borderTop: i > 0 ? `1px solid ${C.borderLight}` : "none",
                          minHeight: 48,
                          cursor: "pointer",
                          border: "none",
                          borderBottom: i < medications.length - 1 ? `1px solid ${C.borderLight}` : "none",
                        }}
                        aria-label={`${med.name} ${med.dosage}: ${isMedMuted ? "muted" : "active"}. Tap to ${isMedMuted ? "unmute" : "mute"}.`}
                        aria-pressed={!isMedMuted}
                      >
                        {/* Color dot */}
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: 10,
                            height: 10,
                            background: med.color || C.primary,
                            opacity: isMedMuted ? 0.3 : 1,
                          }}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p style={{
                            color: isMedMuted ? C.textMuted : C.text,
                            fontSize: T.caption, fontWeight: 600, fontFamily: "inherit",
                            textDecoration: isMedMuted ? "line-through" : "none",
                          }}>
                            {med.name}
                          </p>
                          <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 500, fontFamily: "inherit" }}>
                            {med.dosage} · {med.frequency}
                          </p>
                        </div>
                        {/* Mute indicator */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isMedMuted ? (
                            <VolumeX size={14} color={C.textMuted} />
                          ) : (
                            <Volume2 size={14} color={C.primary} />
                          )}
                        </div>
                        <TogglePill active={!isMedMuted} small />
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Quiet Hours ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon size={12} color={C.textSub} />
            <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              QUIET HOURS
            </span>
          </div>

          <button
            onClick={() => onPrefChange({ quietHoursEnabled: !prefs.quietHoursEnabled })}
            className="w-full flex items-center justify-between rounded-xl p-3 text-left transition-all"
            style={{
              background: prefs.quietHoursEnabled ? C.primaryLight : "rgba(100,116,139,0.04)",
              border: `1px solid ${prefs.quietHoursEnabled ? C.primaryBorder : C.borderLight}`,
              minHeight: L.touch, cursor: "pointer",
            }}
            aria-label={`Quiet hours: ${prefs.quietHoursEnabled ? "enabled" : "disabled"}`}
            aria-pressed={prefs.quietHoursEnabled}
          >
            <div>
              <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 600, fontFamily: "inherit" }}>
                Do Not Disturb
              </p>
              <p style={{ color: C.textMuted, fontSize: T.caption, fontWeight: 500, fontFamily: "inherit", marginTop: 1 }}>
                {prefs.quietHoursStart} — {prefs.quietHoursEnd}
              </p>
            </div>
            <TogglePill active={prefs.quietHoursEnabled} />
          </button>

          {prefs.quietHoursEnabled && (
            <div className="flex items-center gap-2 mt-2">
              <TimeInput
                label="Start"
                value={prefs.quietHoursStart}
                onChange={(v) => onPrefChange({ quietHoursStart: v })}
              />
              <span style={{ color: C.textMuted, fontSize: T.caption, fontWeight: 600 }}>to</span>
              <TimeInput
                label="End"
                value={prefs.quietHoursEnd}
                onChange={(v) => onPrefChange({ quietHoursEnd: v })}
              />
            </div>
          )}
        </div>

        {/* ── Reminder Lead Time ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Timer size={12} color={C.textSub} />
            <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              REMINDER LEAD TIME
            </span>
          </div>
          <div className="flex gap-2">
            {leadOptions.map((mins) => {
              const active = prefs.reminderLeadMinutes === mins;
              return (
                <button
                  key={mins}
                  onClick={() => onPrefChange({ reminderLeadMinutes: mins })}
                  className="flex-1 flex items-center justify-center rounded-xl transition-all"
                  style={{
                    background: active ? C.primary : "rgba(100,116,139,0.06)",
                    border: `1px solid ${active ? C.primaryBorder : C.borderLight}`,
                    color: active ? C.text : C.textSub,
                    fontSize: T.caption, fontWeight: active ? 700 : 500,
                    fontFamily: "inherit", minHeight: L.touch, cursor: "pointer",
                  }}
                  aria-label={`Remind ${mins >= 60 ? `${mins / 60} hour${mins > 60 ? "s" : ""}` : `${mins} minutes`} before`}
                  aria-pressed={active}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              );
            })}
          </div>
          <p style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit", marginTop: 6, textAlign: "center" }}>
            Alert {prefs.reminderLeadMinutes >= 60
              ? `${prefs.reminderLeadMinutes / 60} hour${prefs.reminderLeadMinutes > 60 ? "s" : ""}`
              : `${prefs.reminderLeadMinutes} minutes`} before scheduled events
          </p>
        </div>
      </div>
    </>
  );
}

// ── Shared Toggle Pill ───────────────────────────────────────────────────────
function TogglePill({ active, small }: { active: boolean; small?: boolean }) {
  const w = small ? 36 : 44;
  const h = small ? 20 : 24;
  const dot = small ? 16 : 20;
  const travel = w - dot - 4; // padding = 2 each side
  return (
    <div
      className="flex-shrink-0 rounded-full transition-all duration-200"
      style={{ width: w, height: h, padding: 2, background: active ? C.primary : C.borderLight }}
      aria-hidden="true"
    >
      <div
        className="rounded-full transition-all duration-200"
        style={{
          width: dot, height: dot, background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transform: active ? `translateX(${travel}px)` : "translateX(0)",
        }}
      />
    </div>
  );
}

// ── Time Input ───────────────────────────────────────────────────────────────
function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1">
      <label
        style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", display: "block", marginBottom: 2 }}
      >
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3"
        style={{
          background: C.card,
          border: `1px solid ${C.borderLight}`,
          color: C.text,
          fontSize: T.caption,
          fontFamily: "inherit",
          fontWeight: 600,
          height: 40,
          outline: "none",
        }}
        aria-label={`${label} time`}
      />
    </div>
  );
}

// ── Format helper ────────────────────────────────────────────────────────────
function formatNotifTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}