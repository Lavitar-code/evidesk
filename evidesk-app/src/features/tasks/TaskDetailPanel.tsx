import { formatUnixTimestamp } from "../../lib/format";
import type { TaskDetail } from "../../types/task";

type TaskDetailPanelProps = {
  task: TaskDetail;
  onClose: () => void;
};

function prettyStatus(status: string) {
  switch (status) {
    case "todo":
      return "To do";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function prettyPriority(priority: string) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return priority;
  }
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Task detail</p>
          <h3>{task.title}</h3>
          <p className="detail-sidebar-subtitle">
            Operational work item connected to your local research workflow.
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="detail-hero-card">
        <span className="task-kind-badge">TASK</span>
        <p className="detail-hero-text">
          Tasks turn findings into execution: follow-ups, validations, reading queues and next actions.
        </p>
      </div>

      {task.description ? (
        <div className="detail-section">
          <p className="detail-label">Description</p>
          <p className="detail-value">{task.description}</p>
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Status</p>
          <p className="detail-value">{prettyStatus(task.status)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Priority</p>
          <p className="detail-value">{prettyPriority(task.priority)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{task.topicNames || "Inbox"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Due at</p>
          <p className="detail-value">{task.dueAt || "—"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatUnixTimestamp(task.createdAt)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatUnixTimestamp(task.updatedAt)}</p>
        </div>
      </div>
    </aside>
  );
}