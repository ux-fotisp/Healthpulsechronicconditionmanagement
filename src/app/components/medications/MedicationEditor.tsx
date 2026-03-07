/**
 * HealthPulse · Medication Editor
 * ════════════════════════════════
 * Full-screen modal for Add / Edit Dose / Discontinue medications.
 * Age-gated: patients >= threshold require doctor approval.
 *
 * WCAG 2.1 AA · 56px touch targets · Muted Healing Palette
 */

import { useState } from "react";
import {
  X, Plus, Pencil, Trash2, AlertTriangle, CheckCircle,
  Clock, ShieldCheck, Pill,
} from "lucide-react";
import { C, T, L } from "../../design/tokens";
import { toast } from "sonner";
import { useCreateMedChangeRequest, useCarePlanPrefs } from "../../hooks/useHealthData";
import type { MedicationDTO } from "../../data/api";

type ChangeType = "add" | "edit_dose" | "discontinue";

interface MedicationEditorProps {
  onClose: () => void;
  medications: MedicationDTO[];
  patientAge: number;
  onSuccess: () => void;
}

const ROUTES = ["Oral", "Sublingual", "Topical", "Injection", "Inhaled", "Rectal"];
const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Every 12 hours", "As needed", "Weekly"];
const SHAPES: ("round" | "oval" | "capsule" | "oblong")[] = ["round", "oval", "capsule", "oblong"];
const COLORS = ["#9DBB9B", "#BC6C8A", "#7B9ACC", "#C4A87A", "#D4A373", "#9B6BB5", "#5BA4A4"];

export function MedicationEditor({ onClose, medications, patientAge, onSuccess }: MedicationEditorProps) {
  const [changeType, setChangeType] = useState<ChangeType | null>(null);
  const [selectedMedId, setSelectedMedId] = useState<string>("");
  const [step, setStep] = useState<"select" | "form" | "confirm" | "result">("select");

  // Add form
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newRoute, setNewRoute] = useState("Oral");
  const [newFrequency, setNewFrequency] = useState("Once daily");
  const [newShape, setNewShape] = useState<"round" | "oval" | "capsule" | "oblong">("round");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newInstruction, setNewInstruction] = useState("");

  // Edit form
  const [editDosage, setEditDosage] = useState("");
  const [editFrequency, setEditFrequency] = useState("");

  // Shared
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; requiresApproval: boolean } | null>(null);

  const { create } = useCreateMedChangeRequest();
  const { data: prefs } = useCarePlanPrefs();

  const activeMeds = medications.filter((m) => m.status === "active");
  const selectedMed = medications.find((m) => m.id === selectedMedId);

  const requiresApproval = prefs?.requireDoctorApproval ?? (patientAge >= (prefs?.ageThreshold ?? 52));

  const handleSelectType = (type: ChangeType) => {
    setChangeType(type);
    if (type === "add") {
      setStep("form");
    } else {
      setStep(activeMeds.length > 0 ? "select" : "form");
    }
  };

  const handleSelectMed = (medId: string) => {
    setSelectedMedId(medId);
    const med = medications.find((m) => m.id === medId);
    if (med && changeType === "edit_dose") {
      setEditDosage(med.dosage);
      setEditFrequency(med.frequency);
    }
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!changeType || !reason.trim()) return;
    setSubmitting(true);

    try {
      let payload: any = {
        changeType,
        reason,
        medicationName: "",
      };

      if (changeType === "add") {
        payload.medicationName = newName;
        payload.newDosage = newDosage;
        payload.newFrequency = newFrequency;
        payload.newMedication = {
          name: newName,
          dosage: newDosage,
          route: newRoute,
          frequency: newFrequency,
          shape: newShape,
          color: newColor,
          quickInstruction: newInstruction || `Take ${newDosage} ${newFrequency.toLowerCase()}`,
          nextDoseTime: null,
          status: "active",
        };
      } else if (changeType === "edit_dose") {
        payload.medicationId = selectedMedId;
        payload.medicationName = selectedMed?.name || "";
        payload.currentDosage = selectedMed?.dosage || "";
        payload.newDosage = editDosage;
        payload.newFrequency = editFrequency;
      } else if (changeType === "discontinue") {
        payload.medicationId = selectedMedId;
        payload.medicationName = selectedMed?.name || "";
        payload.currentDosage = selectedMed?.dosage || "";
      }

      const res = await create(payload);
      setResult({ status: res.status, requiresApproval: res.requiresApproval });
      setStep("result");

      if (res.status === "auto_approved") {
        toast.success(`Change applied: ${payload.medicationName}`);
      } else {
        toast.info(`Change request sent for doctor review`);
      }
    } catch (e: any) {
      toast.error(`Failed to submit: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    minHeight: L.touch,
    background: C.card,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: T.body,
    fontWeight: 600 as const,
    fontFamily: "inherit",
    outline: "none",
    borderRadius: L.rMd,
    padding: "0 16px",
    width: "100%",
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
        aria-label="Medication Editor"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, background: C.primaryLight, border: `1px solid ${C.primaryBorder}` }}
            >
              <Pill size={20} color={C.primary} />
            </div>
            <div>
              <h2 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", margin: 0 }}>
                Manage Medications
              </h2>
              <p style={{ color: C.textSub, fontSize: T.caption, fontFamily: "inherit", margin: 0 }}>
                Add, adjust, or discontinue
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

        {/* Approval notice */}
        {requiresApproval && (
          <div className="mx-5 mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(196,168,122,0.1)", border: "1px solid rgba(196,168,122,0.25)" }}>
            <ShieldCheck size={16} color="#C4A87A" />
            <p style={{ color: "#7A6230", fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", lineHeight: 1.4 }}>
              Changes require doctor approval (age {patientAge}, threshold: {prefs?.ageThreshold ?? 52})
            </p>
          </div>
        )}

        {/* Step: Choose action type */}
        {!changeType && (
          <div className="px-5 py-5 flex flex-col gap-3">
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              WHAT WOULD YOU LIKE TO DO?
            </p>
            {([
              { type: "add" as ChangeType, icon: Plus, label: "Add New Medication", desc: "Add a medication to your care plan", color: C.primary },
              { type: "edit_dose" as ChangeType, icon: Pencil, label: "Change Dose", desc: "Adjust dosage or frequency", color: C.teal },
              { type: "discontinue" as ChangeType, icon: Trash2, label: "Discontinue Medication", desc: "Stop taking a medication", color: C.terracotta },
            ]).map((action) => (
              <button
                key={action.type}
                onClick={() => handleSelectType(action.type)}
                className="w-full rounded-xl flex items-center gap-4 px-4 text-left transition-all"
                style={{
                  minHeight: L.touch,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                }}
                aria-label={action.label}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 40, height: 40, background: `${action.color}15`, border: `1px solid ${action.color}30` }}
                >
                  <action.icon size={18} color={action.color} />
                </div>
                <div>
                  <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{action.label}</p>
                  <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit", marginTop: 1 }}>{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step: Select medication (for edit/discontinue) */}
        {changeType && changeType !== "add" && step === "select" && (
          <div className="px-5 py-5 flex flex-col gap-3">
            <button onClick={() => { setChangeType(null); setStep("select"); }} className="flex items-center gap-1 mb-1" style={{ background: "none", border: "none", color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              &larr; Back
            </button>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              SELECT MEDICATION
            </p>
            {activeMeds.map((med) => (
              <button
                key={med.id}
                onClick={() => handleSelectMed(med.id)}
                className="w-full rounded-xl flex items-center gap-3 px-4 py-3 text-left transition-all"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  className="rounded-full flex-shrink-0"
                  style={{ width: 12, height: 12, background: med.color, border: `2px solid ${med.color}80` }}
                />
                <div className="flex-1">
                  <p style={{ color: C.text, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>{med.name}</p>
                  <p style={{ color: C.textSub, fontSize: T.nano, fontFamily: "inherit" }}>{med.dosage} · {med.frequency}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step: Form — Add */}
        {changeType === "add" && step === "form" && (
          <div className="px-5 py-4 flex flex-col gap-3">
            <button onClick={() => { setChangeType(null); setStep("select"); }} className="flex items-center gap-1 mb-1" style={{ background: "none", border: "none", color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              &larr; Back
            </button>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              ADD NEW MEDICATION
            </p>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Medication Name *</label>
              <input type="text" placeholder="e.g. Metformin" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Medication name" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Dosage *</label>
                <input type="text" placeholder="e.g. 500mg" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Dosage" />
              </div>
              <div className="flex-1">
                <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Route</label>
                <select value={newRoute} onChange={(e) => setNewRoute(e.target.value)} style={{ ...inputStyle, marginTop: 4, appearance: "auto" as any }} aria-label="Route">
                  {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Frequency</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setNewFrequency(f)}
                    className="rounded-full px-3 py-2 transition-all"
                    style={{
                      background: newFrequency === f ? C.primaryLight : "transparent",
                      border: `1px solid ${newFrequency === f ? C.primary : C.borderLight}`,
                      color: newFrequency === f ? C.successDark : C.textSub,
                      fontSize: 10, fontWeight: 600, fontFamily: "inherit",
                    }}
                    aria-pressed={newFrequency === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Pill Color</label>
              <div className="flex gap-2 mt-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="rounded-full transition-all"
                    style={{
                      width: 32, height: 32,
                      background: c,
                      border: newColor === c ? `3px solid ${C.text}` : `2px solid ${c}60`,
                      outline: newColor === c ? `2px solid ${C.bg}` : "none",
                    }}
                    aria-label={`Color ${c}`}
                    aria-pressed={newColor === c}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Shape</label>
              <div className="flex gap-2 mt-2">
                {SHAPES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewShape(s)}
                    className="flex-1 rounded-lg py-2 transition-all capitalize"
                    style={{
                      background: newShape === s ? C.primaryLight : "transparent",
                      border: `1px solid ${newShape === s ? C.primary : C.borderLight}`,
                      color: newShape === s ? C.successDark : C.textSub,
                      fontSize: 10, fontWeight: 600, fontFamily: "inherit",
                    }}
                    aria-pressed={newShape === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Instructions (optional)</label>
              <input type="text" placeholder="e.g. Take with food" value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Instructions" />
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Reason for adding *</label>
              <input type="text" placeholder="e.g. Doctor prescribed for blood sugar" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Reason" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!newName || !newDosage || !reason || submitting}
              className="w-full rounded-xl flex items-center justify-center gap-2 mt-2 transition-all"
              style={{
                minHeight: L.touch,
                background: newName && newDosage && reason ? C.primary : C.borderLight,
                border: `1px solid ${C.primaryBorder}`,
                color: newName && newDosage && reason ? "#111820" : C.textMuted,
                fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit",
              }}
              aria-label="Submit medication addition"
            >
              {submitting ? <Clock size={14} className="animate-spin" /> : <Plus size={14} />}
              {requiresApproval ? "Submit for Approval" : "Add Medication"}
            </button>
          </div>
        )}

        {/* Step: Form — Edit Dose */}
        {changeType === "edit_dose" && step === "form" && selectedMed && (
          <div className="px-5 py-4 flex flex-col gap-3">
            <button onClick={() => setStep("select")} className="flex items-center gap-1 mb-1" style={{ background: "none", border: "none", color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              &larr; Back
            </button>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              CHANGE DOSE — {selectedMed.name.toUpperCase()}
            </p>

            <div className="rounded-xl px-4 py-3" style={{ background: C.secondaryLight, border: `1px solid ${C.secondaryBorder}` }}>
              <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Current</p>
              <p style={{ color: C.text, fontSize: T.bodyMd, fontWeight: 700, fontFamily: "inherit" }}>
                {selectedMed.dosage} · {selectedMed.frequency}
              </p>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>New Dosage *</label>
              <input type="text" placeholder="e.g. 10mg" value={editDosage} onChange={(e) => setEditDosage(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="New dosage" />
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>New Frequency</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setEditFrequency(f)}
                    className="rounded-full px-3 py-2 transition-all"
                    style={{
                      background: editFrequency === f ? C.primaryLight : "transparent",
                      border: `1px solid ${editFrequency === f ? C.primary : C.borderLight}`,
                      color: editFrequency === f ? C.successDark : C.textSub,
                      fontSize: 10, fontWeight: 600, fontFamily: "inherit",
                    }}
                    aria-pressed={editFrequency === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Reason for change *</label>
              <input type="text" placeholder="e.g. Side effects at current dose" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Reason" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!editDosage || !reason || submitting}
              className="w-full rounded-xl flex items-center justify-center gap-2 mt-2 transition-all"
              style={{
                minHeight: L.touch,
                background: editDosage && reason ? C.primary : C.borderLight,
                border: `1px solid ${C.primaryBorder}`,
                color: editDosage && reason ? "#111820" : C.textMuted,
                fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit",
              }}
            >
              {submitting ? <Clock size={14} className="animate-spin" /> : <Pencil size={14} />}
              {requiresApproval ? "Submit for Approval" : "Apply Change"}
            </button>
          </div>
        )}

        {/* Step: Form — Discontinue */}
        {changeType === "discontinue" && step === "form" && selectedMed && (
          <div className="px-5 py-4 flex flex-col gap-3">
            <button onClick={() => setStep("select")} className="flex items-center gap-1 mb-1" style={{ background: "none", border: "none", color: C.textMuted, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              &larr; Back
            </button>
            <p style={{ color: C.textMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
              DISCONTINUE — {selectedMed.name.toUpperCase()}
            </p>

            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: C.alertLight, border: `1px solid ${C.alertBorder}` }}>
              <AlertTriangle size={18} color={C.alert} />
              <div>
                <p style={{ color: C.alertText, fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit" }}>
                  This will stop {selectedMed.name}
                </p>
                <p style={{ color: C.alertText, fontSize: T.nano, fontFamily: "inherit", opacity: 0.8 }}>
                  {selectedMed.dosage} · {selectedMed.frequency}
                </p>
              </div>
            </div>

            <div>
              <label style={{ color: C.textSub, fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>Reason for stopping *</label>
              <input type="text" placeholder="e.g. No longer needed, side effects" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} aria-label="Reason" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full rounded-xl flex items-center justify-center gap-2 mt-2 transition-all"
              style={{
                minHeight: L.touch,
                background: reason ? C.terracotta : C.borderLight,
                border: `1px solid ${reason ? C.terracottaBorder : C.borderLight}`,
                color: reason ? "#fff" : C.textMuted,
                fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit",
              }}
            >
              {submitting ? <Clock size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {requiresApproval ? "Submit for Approval" : "Discontinue"}
            </button>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && result && (
          <div className="px-5 py-8 flex flex-col items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 72, height: 72,
                background: result.status === "auto_approved" ? C.successLight : "rgba(196,168,122,0.12)",
                border: `2px solid ${result.status === "auto_approved" ? C.successBorder : "rgba(196,168,122,0.3)"}`,
              }}
            >
              {result.status === "auto_approved"
                ? <CheckCircle size={32} color={C.success} />
                : <Clock size={32} color="#C4A87A" />}
            </div>

            <h3 style={{ color: C.text, fontSize: T.h2, fontWeight: 700, fontFamily: "inherit", textAlign: "center" }}>
              {result.status === "auto_approved" ? "Change Applied" : "Sent for Review"}
            </h3>
            <p style={{ color: C.textSub, fontSize: T.bodySm, fontFamily: "inherit", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
              {result.status === "auto_approved"
                ? "Your medication change has been applied right away."
                : "Your request has been sent to your doctor for review. You'll be notified when they respond."}
            </p>

            {result.requiresApproval && result.status !== "auto_approved" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(196,168,122,0.1)", border: "1px solid rgba(196,168,122,0.25)" }}>
                <ShieldCheck size={14} color="#C4A87A" />
                <span style={{ color: "#7A6230", fontSize: T.nano, fontWeight: 600, fontFamily: "inherit" }}>
                  Doctor approval required
                </span>
              </div>
            )}

            <button
              onClick={() => { onSuccess(); onClose(); }}
              className="w-full rounded-xl flex items-center justify-center gap-2 mt-4 transition-all"
              style={{
                minHeight: L.touch,
                background: C.primary,
                border: `1px solid ${C.primaryBorder}`,
                color: "#111820",
                fontSize: T.bodySm, fontWeight: 700, fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        )}

        {/* Bottom padding */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
