import { useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Modal } from "../../components/Modal";
import type { ImportPdfSourceInput, SourceListItem } from "../../types/source";
import type { TopicListItem } from "../../types/topic";

type ImportPdfModalProps = {
  topics: TopicListItem[];
  initialTopicId?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ImportPdfSourceInput) => Promise<SourceListItem>;
};

export function ImportPdfModal({
  topics,
  initialTopicId,
  isSubmitting,
  onClose,
  onSubmit,
}: ImportPdfModalProps) {
  const [filePath, setFilePath] = useState("");
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [error, setError] = useState<string | null>(null);

  const topicOptions = useMemo(() => topics, [topics]);

  const selectedFileName = useMemo(() => {
    if (!filePath) {
      return "";
    }

    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] ?? filePath;
  }, [filePath]);

  async function handlePickFile() {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
      });

      if (!selected) {
        return;
      }

      const nextPath = Array.isArray(selected) ? selected[0] : selected;

      if (!nextPath || !nextPath.toLowerCase().endsWith(".pdf")) {
        setError("Please choose a PDF file.");
        return;
      }

      setError(null);
      setFilePath(nextPath);

      if (!title.trim()) {
        const parts = nextPath.split(/[/\\]/);
        const fileName = parts[parts.length - 1] ?? "";
        setTitle(fileName);
      }
    } catch (pickError) {
      setError(String(pickError));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!filePath.trim()) {
      setError("Choose a PDF file first.");
      return;
    }

    try {
      setError(null);

      await onSubmit({
        filePath,
        title: trimmedTitle || null,
        topicId: topicId || null,
      });
    } catch (submitError) {
      setError(String(submitError));
    }
  }

  return (
    <Modal onClose={onClose} title="Import PDF">
      <form className="topic-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <span className="form-label">PDF file</span>
          <div className="pdf-picker-row">
            <button
              className="secondary-btn"
              onClick={handlePickFile}
              type="button"
            >
              Choose PDF
            </button>
          </div>

          {filePath ? (
            <div className="picked-file-card">
              <p className="picked-file-name">{selectedFileName}</p>
              <p className="picked-file-path">{filePath}</p>
            </div>
          ) : (
            <p className="muted-text">No file selected yet.</p>
          )}
        </div>

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
            {isSubmitting ? "Importing..." : "Import PDF"}
          </button>
        </div>
      </form>
    </Modal>
  );
}