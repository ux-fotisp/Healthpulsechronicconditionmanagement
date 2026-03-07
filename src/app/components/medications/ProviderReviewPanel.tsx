/**
 * HealthPulse · Provider Review Panel
 * ════════════════════════════════════
 * Simulated doctor approval/denial for medication change requests.
 * Shows pending requests and allows approve/deny with notes.
 *
 * WCAG 2.1 AA · 56px touch targets · Muted Healing Palette
 */

import { useState } from "react";
import {
  X, ShieldCheck, CheckCircle, XCircle, Clock,
  Plus, Pencil, Trash2, Stethoscope,
} from "lucide-react";
import { C, T, L } from "../../design/tokens";
import { toast } from "sonner";
import { useMedChangeRequests, useUpdateMedChangeRequest } from "../../hooks/useHealthData";
import type { MedChangeRequestDTO } from "../../data/api";

const CHANGE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  add: Plus,
  edit_dose: Pencil,
  discontinue: Trash2,
};

const CHANGE_LABELS: Record<string, string> = {
  add: "Add Medication",
  edit_dose: "Change Dose",
  discontinue: "Discontinue",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending:       { color: "#C4A87A", bg: "rgba(196,168,122,0.1)", border: "rgba(196,168,122,0.25)", label: "Pending Review" },
  approved:      { color: C.successDark, bg: C.successLight, border: C.successBorder, label: "Approved" },
  denied:        { color: C.terracottaDark, bg: C.terracottaLight, border: C.terracottaBorder, label: "Denied" },
  auto_approved: { color: C.sageDark, bg: C.sageLight, border: C.sageBorder, label: "Auto-Approved" },
};

interface ProviderReviewPanelProps {
  onClose: () => void;
  onActionComplete: () => void;
}

export function ProviderReviewPanel({ onClose, onActionComplete }: ProviderReviewPanelProps) {
  const { data: requests, loading, refetch } = useMedChangeRequests();
  const { update, loading: updating } = useUpdateMedChangeRequest();
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const allRequests = (requests || []) as MedChangeRequestDTO[];
  const pending = allRequests.filter((r) => r.status === "pending");
  const resolved = allRequests.filter((r) => r.status !== "pending");

  const handleAction = async (reqId: string, action: "approved" | "denied") => {
    setActiveAction(reqId);
    try {
      await update(reqId, {
        status: action,
        reviewedBy: "Dr. Sarah Chen",
        reviewNote: reviewNote[reqId] || (action === "approved" ? "Approved by provider" : "Denied — please discuss at next visit"),
      });
      toast.success(`Request ${action === "approved" ? "approved" : "denied"}`);
      refetch();
      onActionComplete();
    } catch (e: any) {
      toast.error(`Failed to ${action}: ${e.message}`);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{ background: C.bg, maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Provider Review Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: "rgba(196,168,122,0.12)", border: "1px solid rgba(196,168,122,0.3)" }}
            >
              <Stethoscope size={20} color="#C4A87A" />
            </div>
            <div>
              <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
                Provider Review
              </h2>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", margin: 0 }}>
                Dr. Sarah Chen (simulated)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{ width: L.touch, height: L.touch, background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}`, color: C.textSub }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="px-5 py-8 flex items-center justify-center">
            <Clock size={20} color={C.textMuted} className="animate-spin" />
          </div>
        )}

        {!loading && allRequests.length === 0 && (
          <div className="px-5 py-12 flex flex-col items-center">
            <ShieldCheck size={40} color={C.borderLight} />
            <p style={{ color: C.textMuted, fontSize: T.bodySm, fontFamily: "inherit", marginTop: 12, textAlign: "center" }}>
              No medication change requests
            </p>
          </div>
        )}

        {/* Pending requests */}
        {pending.length > 0 && (
          <div className="px-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} color="#C4A87A" />
              <span style={{ color: "#7A6230", fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                PENDING REVIEW ({pending.length})
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {pending.map((req) => {
                const Icon = CHANGE_ICONS[req.changeType] || Pencil;
                const isProcessing = activeAction === req.id;
                return (
                  <div key={req.id} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid rgba(196,168,122,0.3)` }}>
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${C.borderLight}`, background: "rgba(196,168,122,0.06)" }}>
                      <Icon size={14} color="#C4A87A" />
                      <div className="flex-1">
                        <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
                          {CHANGE_LABELS[req.changeType]}
                        </p>
                        <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>
                          {req.medicationName}
                        </p>
                      </div>
                      <span className="rounded-full px-2 py-0.5" style={{ ...STATUS_CONFIG.pending, fontSize: 9, fontWeight: 700, fontFamily: "inherit" }}>
                        PENDING
                      </span>
                    </div>

                    <div className="px-4 py-3">
                      {req.changeType === "edit_dose" && (
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: C.textMuted, fontSize: T.nano, fontFamily: "inherit" }}>
                            {req.currentDosage} &rarr;
                          </span>
                          <span style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
                            {req.newDosage}
                          </span>
                          {req.newFrequency && (
                            <span style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>
                              ({req.newFrequency})
                            </span>
                          )}
                        </div>
                      )}
                      <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>
                        <strong>Reason:</strong> {req.reason}
                      </p>
                      <p style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit", marginTop: 4 }}>
                        Submitted {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        placeholder="Add a note (optional)"
                        value={reviewNote[req.id] || ""}
                        onChange={(e) => setReviewNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        style={{
                          width: "100%",
                          minHeight: 40,
                          background: C.bg,
                          border: `1px solid ${C.borderLight}`,
                          borderRadius: 10,
                          padding: "0 12px",
                          fontSize: T.nano,
                          fontFamily: "inherit",
                          color: C.text,
                          outline: "none",
                        }}
                        aria-label="Review note"
                      />
                    </div>

                    <div className="flex gap-2 px-4 pb-4">
                      <button
                        onClick={() => handleAction(req.id, "denied")}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                        style={{
                          minHeight: L.touch,
                          background: C.terracottaLight,
                          border: `1px solid ${C.terracottaBorder}`,
                          color: C.terracottaDark,
                          fontSize: T.bodySm,
                          fontWeight: 700,
                          fontFamily: "inherit",
                        }}
                        aria-label={`Deny ${req.medicationName} change`}
                      >
                        <XCircle size={14} />
                        Deny
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "approved")}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                        style={{
                          minHeight: L.touch,
                          background: C.primary,
                          border: `1px solid ${C.primaryBorder}`,
                          color: "#111820",
                          fontSize: T.bodySm,
                          fontWeight: 700,
                          fontFamily: "inherit",
                        }}
                        aria-label={`Approve ${req.medicationName} change`}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resolved requests */}
        {resolved.length > 0 && (
          <div className="px-5 mt-5 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={12} color={C.sage} />
              <span style={{ color: C.textSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                RESOLVED ({resolved.length})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {resolved.slice(0, 5).map((req) => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                const Icon = CHANGE_ICONS[req.changeType] || Pencil;
                return (
                  <div key={req.id} className="rounded-xl flex items-center gap-3 px-4 py-3" style={{ background: C.card, border: `1px solid ${C.borderLight}` }}>
                    <Icon size={13} color={cfg.color} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: C.text, fontSize: T.nano, fontWeight: 700, fontFamily: "inherit" }}>
                        {req.medicationName}
                      </p>
                      <p style={{ color: C.textMuted, fontSize: 9, fontFamily: "inherit" }}>
                        {CHANGE_LABELS[req.changeType]} · {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: 8, fontWeight: 700, fontFamily: "inherit" }}
                    >
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
