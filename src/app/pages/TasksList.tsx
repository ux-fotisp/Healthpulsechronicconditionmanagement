import {
  ClipboardList,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTasks, useToggleTask } from "../hooks/useHealthData";
import { hydrateTasks, MOCK_NOW, formatDateTime, type Task } from "../data/helpers";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { C, T, L } from "../design/tokens";
import { toast } from "sonner";

function priorityColor(priority: string): string {
  if (priority === "high") return C.terracotta;
  if (priority === "medium") return C.amber;
  return C.sage;
}

function priorityTextColor(priority: string): string {
  if (priority === "high") return C.terracottaDark;
  if (priority === "medium") return C.amberDark;
  return C.sageDark;
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string, status: string) => void }) {
  const isOverdue = task.status === "pending" && task.dueDate < MOCK_NOW;
  const isCompleted = task.status === "completed";

  const StatusIcon = isCompleted ? CheckCircle : isOverdue ? AlertTriangle : Clock;
  const statusIconColor = isCompleted ? C.sage : isOverdue ? C.terracotta : C.cardTextFaint;
  const statusTextColor = isCompleted ? C.sageDark : isOverdue ? C.terracottaDark : C.cardTextSub;
  const statusLabel = isCompleted ? "COMPLETED" : isOverdue ? "OVERDUE" : "PENDING";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isOverdue ? "rgba(247,249,247,0.97)" : C.cardBg,
        border: `1px solid ${isOverdue ? C.terracottaBorder : isCompleted ? C.sageBorder : C.cardBorder}`,
        opacity: isCompleted ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        {/* Priority dot / status icon — clickable for toggle */}
        <button
          className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5"
          onClick={() => onToggle(task.id, task.status)}
          aria-label={isCompleted ? `Mark "${task.description}" as pending` : `Mark "${task.description}" as completed`}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, margin: -8, minWidth: 36, minHeight: 36 }}
        >
          {isCompleted ? (
            <CheckCircle size={20} color={C.sage} />
          ) : (
            <div
              className="rounded-full"
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${priorityColor(task.priority)}`,
                background: isOverdue ? `${priorityColor(task.priority)}18` : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isOverdue && <div style={{ width: 6, height: 6, borderRadius: "50%", background: priorityColor(task.priority) }} />}
            </div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              color: isCompleted ? C.cardTextSub : C.cardText,
              fontSize: T.bodySm,
              fontWeight: 600,
              lineHeight: 1.4,
              fontFamily: "inherit",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {task.description}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock size={T.nano} color={C.cardTextFaint} />
              <span style={{ color: isOverdue ? C.terracottaDark : C.cardTextSub, fontSize: T.nano, fontFamily: "inherit" }}>
                {isCompleted && task.completedAt
                  ? `Done: ${formatDateTime(task.completedAt)}`
                  : `Due: ${formatDateTime(task.dueDate)}`}
              </span>
            </div>

            <span
              style={{
                background: `${priorityColor(task.priority)}18`,
                border: `1px solid ${priorityColor(task.priority)}35`,
                color: priorityTextColor(task.priority),
                fontSize: T.pill,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: L.rFull,
                letterSpacing: "0.08em",
                fontFamily: "inherit",
              }}
            >
              {task.priority.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <StatusIcon size={T.nano} color={statusIconColor} />
            <span
              style={{
                color: statusTextColor,
                fontSize: T.pill,
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "inherit",
              }}
              role="status"
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksList() {
  const navigate = useNavigate();
  const { data: rawTasks, loading, refetch } = useTasks();
  const { toggle } = useToggleTask();

  if (loading) return <PageSkeleton title="Care Plan" cardCount={4} />;

  const tasks = rawTasks ? hydrateTasks(rawTasks) : [];

  const overdue = tasks.filter((t) => t.status === "pending" && t.dueDate < MOCK_NOW);
  const pending = tasks.filter((t) => t.status === "pending" && t.dueDate >= MOCK_NOW);
  const completed = tasks.filter((t) => t.status === "completed");

  async function handleToggle(taskId: string, currentStatus: string) {
    try {
      await toggle(taskId, currentStatus);
      refetch();
      toast.success(`Task ${currentStatus === "completed" ? "reopened" : "completed"}`);
    } catch (e) {
      console.error("Failed to toggle task:", e);
      toast.error("Failed to update task status");
    }
  }

  return (
    <div style={{ background: C.shellAlt, minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: `1px solid ${C.sageBorder}` }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 44,
            height: 44,
            background: "rgba(247,249,247,0.06)",
            border: `1px solid ${C.sageBorder}`,
            color: C.textOnDarkSub,
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: C.textOnDark, fontSize: T.h3, fontWeight: 700, fontFamily: "inherit" }}>
            Care Plan
          </h1>
          <p style={{ color: C.textOnDarkMuted, fontSize: T.micro, fontFamily: "inherit" }}>
            Tasks – Daily Health To-Dos
          </p>
        </div>
        <div
          className="ml-auto flex items-center justify-center rounded-full"
          style={{
            width: 28,
            height: 28,
            background: overdue.length > 0 ? "rgba(217,165,150,0.15)" : C.sageLight,
            border: `1px solid ${overdue.length > 0 ? C.terracottaBorder : C.sageBorder}`,
          }}
          aria-label={`${overdue.length} overdue tasks`}
        >
          <span style={{ color: overdue.length > 0 ? C.terracottaDark : C.sageDark, fontSize: T.micro, fontWeight: 800, fontFamily: "inherit" }}>
            {pending.length + overdue.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertTriangle size={12} color={C.terracotta} />
              <p style={{ color: C.terracottaDark, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                OVERDUE ({overdue.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {overdue.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} />)}
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={12} color={C.textOnDarkMuted} />
              <p style={{ color: C.textOnDarkSub, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                PENDING ({pending.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {pending.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} />)}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <CheckCircle size={12} color={C.sage} />
              <p style={{ color: C.textOnDarkMuted, fontSize: T.nano, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
                COMPLETED ({completed.length})
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {completed.map((t) => <TaskCard key={t.id} task={t} onToggle={handleToggle} />)}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ border: `1px solid ${C.cardBorder}`, background: C.cardBg }}
            role="status"
          >
            <ClipboardList size={28} color={C.cardTextFaint} />
            <p style={{ color: C.cardTextMuted, fontSize: T.bodySm, fontFamily: "inherit", marginTop: 8 }}>
              No tasks due today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}