import { useEffect, useState } from "react";
import { formatUnixTimestamp } from "../../lib/format";
import type { ExcerptDetail, UpdateExcerptInput } from "../../types/excerpt";

type ExcerptEditorPanelProps = {
  excerpt: ExcerptDetail;
  isSaving: boolean;
  isArchiving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateExcerptInput) => Promise<void>;
  onArchive: () => Promise<void>;
};

export function ExcerptEditorPanel({
  excerpt,
  isSaving,
  isArchiving,
  onClose,
  onSave,
  onArchive,
}: ExcerptEditorPanelProps) {
  const [excerptText, setExcerptText] = useState(excerpt.excerptText);
  const [note, setNote] = useState(excerpt.note ?? "");
  const [pageLabel, setPageLabel] = useState(excerpt.pageLabel ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExcerptText(excerpt.excerptText);
    setNote(excerpt.note ?? "");
    setPageLabel(excerpt.pageLabel ?? "");
    setError(null);
  }, [excerpt]);

  async function handleSave() {
    const trimmedExcerpt = excerptText.trim();
    const trimmedNote = note.trim();
    const trimmedPage = pageLabel.trim();

    if (!trimmedExcerpt) {
      setError("Excerpt text is required.");
      return;
    }

    try {
      setError(null);
      await onSave({
        excerptText: trimmedExcerpt,
        note: trimmedNote || null,
        pageLabel: trimmedPage || null,
      });
    } catch (saveError) {
      setError(String(saveError));
    }
  }

  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Excerpt editor</p>
          <h3>{excerpt.sourceTitle}</h3>
          <p className="detail-sidebar-subtitle">
            Refine the excerpt text, analyst note and citation location.
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="detail-grid">
        <label className="form-field">
          <span className="form-label">Excerpt text</span>
          <textarea
            className="form-textarea excerpt-textarea"
            onChange={(event) => setExcerptText(event.target.value)}
            rows={10}
            value={excerptText}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Page / location</span>
          <input
            className="form-input"
            onChange={(event) => setPageLabel(event.target.value)}
            type="text"
            value={pageLabel}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Analyst note</span>
          <textarea
            className="form-textarea"
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            value={note}
          />
        </label>
      </div>

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Citation</p>
          <p className="detail-value">{excerpt.citationText}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{excerpt.topicNames || "Inbox"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatUnixTimestamp(excerpt.createdAt)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatUnixTimestamp(excerpt.updatedAt)}</p>
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
          {isArchiving ? "Archiving..." : "Archive Excerpt"}
        </button>
      </div>

      <div className="form-actions">
        <button className="primary-btn" disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? "Saving..." : "Save Excerpt"}
        </button>
      </div>
    </aside>
  );
}