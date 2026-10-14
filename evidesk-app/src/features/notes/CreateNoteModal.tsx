import { useState } from "react";
import type { CreateNoteInput } from "../../types/note";
import type { TopicListItem } from "../../types/topic";

type CreateNoteModalProps = {
  topics: TopicListItem[];
  initialTopicId?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateNoteInput) => Promise<unknown>;
};

export function CreateNoteModal({
  topics,
  initialTopicId = null,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!trimmedContent) {
      setError("Content is required.");
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        markdownContent: trimmedContent,
        topicId: selectedTopicId || null,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Note</h3>
          <button
            className="modal-close-btn"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form className="topic-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="create-note-title">
                Title
              </label>
              <input
                className="form-input"
                id="create-note-title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Travel research notes"
                type="text"
                value={title}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="create-note-content">
                Content
              </label>
              <textarea
                className="form-textarea form-textarea-large note-editor-textarea"
                id="create-note-content"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your markdown note here..."
                value={content}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="create-note-topic">
                Link to topic
              </label>
              <select
                className="form-select"
                id="create-note-topic"
                onChange={(event) => setSelectedTopicId(event.target.value)}
                value={selectedTopicId}
              >
                <option value="">Inbox (no topic)</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="form-actions">
              <button
                className="secondary-btn"
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>

              <button className="primary-btn" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}