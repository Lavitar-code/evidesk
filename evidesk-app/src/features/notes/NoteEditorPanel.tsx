import { useEffect, useState } from "react";
import { formatUnixTimestamp } from "../../lib/format";
import type { NoteDetail, UpdateNoteInput } from "../../types/note";

type NoteEditorPanelProps = {
  note: NoteDetail;
  isSaving: boolean;
  isArchiving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateNoteInput) => Promise<void>;
  onArchive: () => Promise<void>;
};

export function NoteEditorPanel({
  note,
  isSaving,
  isArchiving,
  onClose,
  onSave,
  onArchive,
}: NoteEditorPanelProps) {
  const [title, setTitle] = useState(note.title);
  const [markdownContent, setMarkdownContent] = useState(note.markdownContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setMarkdownContent(note.markdownContent);
    setError(null);
  }, [note]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedContent = markdownContent.trim();

    if (!trimmedTitle) {
      setError("Note title is required.");
      return;
    }

    if (!trimmedContent) {
      setError("Note content cannot be empty.");
      return;
    }

    try {
      setError(null);
      await onSave({
        title: trimmedTitle,
        markdownContent: trimmedContent,
      });
    } catch (saveError) {
      setError(String(saveError));
    }
  }

  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Note editor</p>
          <h3>{note.title}</h3>
          <p className="detail-sidebar-subtitle">
            Edit markdown content directly inside the workspace.
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
          <span className="form-label">Markdown content</span>
          <textarea
            className="form-textarea form-textarea-large note-editor-textarea"
            onChange={(event) => setMarkdownContent(event.target.value)}
            rows={16}
            value={markdownContent}
          />
        </label>
      </div>

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{note.topicNames || "Inbox"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatUnixTimestamp(note.createdAt)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatUnixTimestamp(note.updatedAt)}</p>
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
          {isArchiving ? "Archiving..." : "Archive Note"}
        </button>
      </div>

      <div className="form-actions">
        <button className="primary-btn" disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </aside>
  );
}