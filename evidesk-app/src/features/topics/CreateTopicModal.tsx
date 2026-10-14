import { useState } from "react";
import { Modal } from "../../components/Modal";
import type { CreateTopicInput, TopicListItem } from "../../types/topic";

type CreateTopicModalProps = {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTopicInput) => Promise<TopicListItem>;
};

const COLOR_OPTIONS = [
  "#4f8cff",
  "#34d399",
  "#f59e0b",
  "#f87171",
  "#a78bfa",
  "#22c55e",
];

export function CreateTopicModal({
  isSubmitting,
  onClose,
  onSubmit,
}: CreateTopicModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (trimmedTitle.length > 120) {
      setError("Title is too long.");
      return;
    }

    try {
      setError(null);

      await onSubmit({
        title: trimmedTitle,
        description: trimmedDescription || null,
        color,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <Modal onClose={onClose} title="Create Topic">
      <form className="topic-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            autoFocus
            className="form-input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter topic title"
            type="text"
            value={title}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Description</span>
          <textarea
            className="form-textarea"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            rows={4}
            value={description}
          />
        </label>

        <div className="form-field">
          <span className="form-label">Color</span>
          <div className="color-picker-row">
            {COLOR_OPTIONS.map((option) => {
              const isSelected = option === color;

              return (
                <button
                  key={option}
                  className={`color-swatch ${isSelected ? "color-swatch-selected" : ""}`}
                  onClick={() => setColor(option)}
                  style={{ backgroundColor: option }}
                  type="button"
                />
              );
            })}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="secondary-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create Topic"}
          </button>
        </div>
      </form>
    </Modal>
  );
}