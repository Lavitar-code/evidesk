import { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import type { CreateUrlSourceInput, SourceListItem } from "../../types/source";
import type { TopicListItem } from "../../types/topic";

type CreateUrlSourceModalProps = {
  topics: TopicListItem[];
  initialTopicId?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUrlSourceInput) => Promise<SourceListItem>;
};

export function CreateUrlSourceModal({
  topics,
  initialTopicId,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateUrlSourceModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [error, setError] = useState<string | null>(null);

  const topicOptions = useMemo(() => topics, [topics]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedUrl) {
      setError("URL is required.");
      return;
    }

    if (
      !trimmedUrl.toLowerCase().startsWith("http://") &&
      !trimmedUrl.toLowerCase().startsWith("https://")
    ) {
      setError("URL must start with http:// or https://");
      return;
    }

    try {
      setError(null);

      await onSubmit({
        url: trimmedUrl,
        title: trimmedTitle || null,
        description: trimmedDescription || null,
        topicId: topicId || null,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <Modal onClose={onClose} title="Add URL Source">
      <form className="topic-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">URL</span>
          <input
            autoFocus
            className="form-input"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
            type="text"
            value={url}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            className="form-input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional custom title"
            type="text"
            value={title}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Description</span>
          <textarea
            className="form-textarea"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional note about this source"
            rows={4}
            value={description}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Link to topic</span>
          <select
            className="form-select"
            onChange={(event) => setTopicId(event.target.value)}
            value={topicId}
          >
            <option value="">Inbox (no topic)</option>
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
            {isSubmitting ? "Saving..." : "Save Source"}
          </button>
        </div>
      </form>
    </Modal>
  );
}