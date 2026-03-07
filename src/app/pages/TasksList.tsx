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
import { toast } from "sonner";

function priorityColor(priority: string): string {
  if (priority === "high") return "#D9A596";
  if (priority === "medium") return "#C9A070";
  return "#9DBB9B";
}

function priorityTextColor(priority: string): string {
  if (priority === "high") return "#9B5940";
  if (priority === "medium") return "#7A5A28";
  return "#5A7D58";
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string, status: string) => void }) {
  const isOverdue =
    task.status === "pending" && task.dueDate < MOCK_NOW;
  const isCompleted = task.status === "completed";

  const StatusIcon = isCompleted ? CheckCircle : isOverdue ? AlertTriangle : Clock;
  const statusIconColor = isCompleted ? "#9DBB9B" : isOverdue ? "#D9A596" : "rgba(59,61,64,0.4)";
  const statusTextColor = isCompleted ? "#5A7D58" : isOverdue ? "#9B5940" : "rgba(59,61,64,0.5)";
  const statusLabel = isCompleted ? "COMPLETED" : isOverdue ? "OVERDUE" : "PENDING";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isOverdue ? "rgba(247,249,247,0.97)" : "#F7F9F7",
        border: `1px solid ${isOverdue ? "rgba(217,165,150,0.4)" : isCompleted ? "rgba(157,187,155,0.25)" : "#BABCBF"}`,
        opacity: isCompleted ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        {/* Priority dot / status icon — clickable for toggle */}
        <button
          className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5"
          onClick={() => onToggle(task.id, task.status)}
          aria-label={isCompleted ? `Mark "${task.description}" as pending` : `Mark "${task.description}" as completed`}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          {isCompleted ? (
            <CheckCircle size={20} color="#9DBB9B" />
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
              color: isCompleted ? "rgba(59,61,64,0.5)" : "#3B3D40",
              fontSize: 13,
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
              <Clock size={10} color="rgba(59,61,64,0.35)" />
              <span style={{ color: isOverdue ? "#9B5940" : "rgba(59,61,64,0.45)", fontSize: 10, fontFamily: "inherit" }}>
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
                fontSize: 9,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 100,
                letterSpacing: "0.08em",
                fontFamily: "inherit",
              }}
            >
              {task.priority.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <StatusIcon size={10} color={statusIconColor} />
            <span
              style={{
                color: statusTextColor,
                fontSize: 9,
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
    <div style={{ background: "#1A2B1C", minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: "1px solid rgba(157,187,155,0.15)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: "rgba(247,249,247,0.06)",
            border: "1px solid rgba(157,187,155,0.2)",
            color: "rgba(255,255,255,0.7)",
          }}
          aria-label="Go back to home"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 700, fontFamily: "inherit" }}>
            Care Plan
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "inherit" }}>
            Tasks – Daily Health To-Dos
          </p>
        </div>
        <div
          className="ml-auto flex items-center justify-center rounded-full"
          style={{
            width: 28,
            height: 28,
            background: overdue.length > 0 ? "rgba(217,165,150,0.15)" : "rgba(157,187,155,0.12)",
            border: `1px solid ${overdue.length > 0 ? "rgba(217,165,150,0.35)" : "rgba(157,187,155,0.3)"}`,
          }}
          aria-label={`${overdue.length} overdue tasks`}
        >
          <span style={{ color: overdue.length > 0 ? "#9B5940" : "#5A7D58", fontSize: 11, fontWeight: 800, fontFamily: "inherit" }}>
            {pending.length + overdue.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertTriangle size={12} color="#D9A596" />
              <p style={{ color: "#9B5940", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
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
              <Clock size={12} color="rgba(255,255,255,0.4)" />
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
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
              <CheckCircle size={12} color="#9DBB9B" />
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "inherit" }}>
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
            style={{ border: "1px solid #BABCBF", background: "#F7F9F7" }}
            role="status"
          >
            <ClipboardList size={28} color="rgba(59,61,64,0.25)" />
            <p style={{ color: "rgba(59,61,64,0.4)", fontSize: 13, fontFamily: "inherit", marginTop: 8 }}>
              No tasks due today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}