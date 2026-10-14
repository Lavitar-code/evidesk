import { useEffect, useState } from "react";
import { formatUnixTimestamp } from "../../lib/format";
import type { TaskDetail, TaskPriority, TaskStatus, UpdateTaskInput } from "../../types/task";

type TaskEditorPanelProps = {
  task: TaskDetail;
  isSaving: boolean;
  isArchiving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateTaskInput) => Promise<void>;
  onArchive: () => Promise<void>;
};

export function TaskEditorPanel({
  task,
  isSaving,
  isArchiving,
  onClose,
  onSave,
  onArchive,
}: TaskEditorPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueAt, setDueAt] = useState(task.dueAt ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueAt(task.dueAt ?? "");
    setError(null);
  }, [task]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedDueAt = dueAt.trim();

    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    try {
      setError(null);
      await onSave({
        title: trimmedTitle,
        description: trimmedDescription || null,
        status,
        priority,
        dueAt: trimmedDueAt || null,
      });
    } catch (saveError) {
      setError(String(saveError));
    }
  }

  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Task editor</p>
          <h3>{task.title}</h3>
          <p className="detail-sidebar-subtitle">
            Update operational metadata and execution state.
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="detail-grid">
        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            className="form-input"
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            value={title}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Description</span>
          <textarea
            className="form-textarea"
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            value={description}
          />
        </label>

        <div className="form-split-grid">
          <label className="form-field">
            <span className="form-label">Status</span>
            <select
              className="form-select"
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              value={status}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Priority</span>
            <select
              className="form-select"
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              value={priority}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <label className="form-field">
          <span className="form-label">Due at</span>
          <input
            className="form-input"
            onChange={(event) => setDueAt(event.target.value)}
            type="text"
            value={dueAt}
          />
        </label>
      </div>

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{task.topicNames || "Inbox"}</p>
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

      {error ? <p className="form-error">{error}</p> : null}

      <div className="detail-danger-zone">
        <button
          className="danger-btn danger-btn-secondary"
          disabled={isArchiving}
          onClick={() => void onArchive()}
          type="button"
        >
          {isArchiving ? "Archiving..." : "Archive Task"}
        </button>
      </div>

      <div className="form-actions">
        <button className="primary-btn" disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? "Saving..." : "Save Task"}
        </button>
      </div>
    </aside>
  );
}