import { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import type { CreateTaskInput, TaskListItem, TaskPriority, TaskStatus } from "../../types/task";
import type { TopicListItem } from "../../types/topic";

type CreateTaskModalProps = {
  topics: TopicListItem[];
  initialTopicId?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskInput) => Promise<TaskListItem>;
};

export function CreateTaskModal({
  topics,
  initialTopicId,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const topicOptions = useMemo(() => topics, [topics]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueAt, setDueAt] = useState("");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedDueAt = dueAt.trim();

    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    try {
      setError(null);

      await onSubmit({
        title: trimmedTitle,
        description: trimmedDescription || null,
        status,
        priority,
        dueAt: trimmedDueAt || null,
        topicId: topicId || null,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <Modal onClose={onClose} title="Create Task">
      <form className="topic-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            className="form-input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            type="text"
            value={title}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Description</span>
          <textarea
            className="form-textarea"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional task context"
            rows={5}
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
            placeholder="e.g. 2026-03-20 or next week"
            type="text"
            value={dueAt}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Link to topic</span>
          <select
            className="form-select"
            onChange={(event) => setTopicId(event.target.value)}
            value={topicId}
          >
            <option value="">Inbox / unassigned</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="secondary-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}