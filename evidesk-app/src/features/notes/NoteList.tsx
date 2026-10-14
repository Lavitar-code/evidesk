import { Panel } from "../../components/Panel";
import { formatUnixTimestamp } from "../../lib/format";
import type { NoteListItem } from "../../types/note";

type NoteListProps = {
  title: string;
  notes: NoteListItem[];
  isLoadingNotes: boolean;
  notesError: string | null;
  emptyMessage: string;
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
};

export function NoteList({
  title,
  notes,
  isLoadingNotes,
  notesError,
  emptyMessage,
  selectedNoteId,
  onNoteSelect,
}: NoteListProps) {
  if (isLoadingNotes) {
    return (
      <Panel title={title}>
        <p className="muted-text">Reading notes from the local database...</p>
      </Panel>
    );
  }

  if (notesError) {
    return (
      <Panel title={title}>
        <p className="status-error">Could not load notes</p>
        <p className="muted-text">{notesError}</p>
      </Panel>
    );
  }

  if (notes.length === 0) {
    return (
      <Panel title={title}>
        <p className="muted-text">{emptyMessage}</p>
      </Panel>
    );
  }

  return (
    <div className="notes-list-block">
      {notes.map((note) => {
        const isSelected = note.id === selectedNoteId;

        return (
          <button
            className={`note-card source-card-button ${isSelected ? "source-card-selected" : ""}`}
            key={note.id}
            onClick={() => onNoteSelect(note.id)}
            type="button"
          >
            <div className="note-card-top">
              <div className="card-copy-block">
                <div className="card-badge-row">
                  <p className="note-kind-badge">NOTE</p>
                  <span className="entity-mini-pill">
                    {note.topicCount} topic{note.topicCount === 1 ? "" : "s"}
                  </span>
                </div>

                <h3 className="note-card-title">{note.title}</h3>
              </div>

              <div className="card-date-block">
                <span className="card-date-label">Updated</span>
                <span className="card-date-value">
                  {formatUnixTimestamp(note.updatedAt)}
                </span>
              </div>
            </div>

            <p className="note-card-preview">{note.previewText}</p>

            <div className="note-card-footer">
              <span className="note-card-meta">{note.topicNames || "Inbox"}</span>
              <span className="note-card-meta">Markdown note</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}