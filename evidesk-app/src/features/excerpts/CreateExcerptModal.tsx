import { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import type { CreateExcerptInput, ExcerptListItem } from "../../types/excerpt";
import type { SourceListItem } from "../../types/source";

type CreateExcerptModalProps = {
  sources: SourceListItem[];
  initialSourceId?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExcerptInput) => Promise<ExcerptListItem>;
};

export function CreateExcerptModal({
  sources,
  initialSourceId,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateExcerptModalProps) {
  const [sourceId, setSourceId] = useState(initialSourceId ?? "");
  const [excerptText, setExcerptText] = useState("");
  const [pageLabel, setPageLabel] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sourceOptions = useMemo(() => sources, [sources]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedExcerpt = excerptText.trim();
    const trimmedPage = pageLabel.trim();
    const trimmedNote = note.trim();

    if (!sourceId) {
      setError("Choose a source first.");
      return;
    }

    if (!trimmedExcerpt) {
      setError("Excerpt text is required.");
      return;
    }

    try {
      setError(null);

      await onSubmit({
        sourceId,
        excerptText: trimmedExcerpt,
        pageLabel: trimmedPage || null,
        note: trimmedNote || null,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <Modal onClose={onClose} title="Create Excerpt">
      <form className="topic-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Source</span>
          <select
            className="form-select"
            onChange={(event) => setSourceId(event.target.value)}
            value={sourceId}
          >
            <option value="">Select a source</option>
            {sourceOptions.map((source) => (
              <option key={source.id} value={source.id}>
                [{source.kind.toUpperCase()}] {source.title}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Excerpt text</span>
          <textarea
            className="form-textarea excerpt-textarea"
            onChange={(event) => setExcerptText(event.target.value)}
            placeholder="Paste or write the quote / excerpt here..."
            rows={8}
            value={excerptText}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Page / location</span>
          <input
            className="form-input"
            onChange={(event) => setPageLabel(event.target.value)}
            placeholder="e.g. 12, 14-15, section 2"
            type="text"
            value={pageLabel}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Analyst note</span>
          <textarea
            className="form-textarea excerpt-note-textarea"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional interpretation or context"
            rows={4}
            value={note}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="secondary-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create Excerpt"}
          </button>
        </div>
      </form>
    </Modal>
  );
}