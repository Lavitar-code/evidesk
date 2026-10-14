import { useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { useTopicFilterOptions } from "../hooks/useTopicFilterOptions";
import type { NoteListItem } from "../types/note";
import type { TopicListItem } from "../types/topic";

type NotesPageProps = {
  notes: NoteListItem[];
  topics: TopicListItem[];
  selectedNoteId: string | null;
  isLoadingNotes: boolean;
  notesError: string | null;
  onNoteSelect: (noteId: string) => void;
  onNewNoteClick: () => void;
};

export function NotesPage({
  notes,
  topics,
  selectedNoteId,
  isLoadingNotes,
  notesError,
  onNoteSelect,
  onNewNoteClick,
}: NotesPageProps) {
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");

  const topicOptions = useTopicFilterOptions(topics);

  const filteredNotes = useMemo(() => {
    let nextItems = [...notes];

    if (topicFilter === "inbox") {
      nextItems = nextItems.filter((note) => note.topicCount === 0);
    } else if (topicFilter !== "all") {
      const selectedTopic = topics.find((topic) => topic.id === topicFilter);
      if (selectedTopic) {
        nextItems = nextItems.filter((note) =>
          note.topicNames
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(selectedTopic.title),
        );
      }
    }

    switch (sortBy) {
      case "title_asc":
        nextItems.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        nextItems.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "created_desc":
        nextItems.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        break;
      case "created_asc":
        nextItems.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
        break;
      case "updated_asc":
        nextItems.sort((a, b) => Number(a.updatedAt) - Number(b.updatedAt));
        break;
      case "updated_desc":
      default:
        nextItems.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        break;
    }

    return nextItems;
  }, [notes, sortBy, topicFilter, topics]);

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Markdown</p>
          <h2>Notes</h2>
          <p>Structured internal notes connected to your research workspace and dossiers.</p>
        </div>

        <div className="topbar-actions">
          <button className="primary-btn" onClick={onNewNoteClick} type="button">
            New Note
          </button>
        </div>
      </div>

      <FilterBar
        fields={[
          {
            key: "note-topic",
            label: "Topic",
            value: topicFilter,
            options: topicOptions,
            onChange: setTopicFilter,
          },
          {
            key: "note-sort",
            label: "Sort",
            value: sortBy,
            options: [
              { value: "updated_desc", label: "Recently updated" },
              { value: "updated_asc", label: "Oldest updated" },
              { value: "created_desc", label: "Recently created" },
              { value: "created_asc", label: "Oldest created" },
              { value: "title_asc", label: "Title A-Z" },
              { value: "title_desc", label: "Title Z-A" },
            ],
            onChange: setSortBy,
          },
        ]}
      />

      {isLoadingNotes ? (
        <section className="panel">
          <h3>Loading notes</h3>
          <p className="muted-text">Notes are loading...</p>
        </section>
      ) : null}

      {notesError ? (
        <section className="panel">
          <h3>Notes unavailable</h3>
          <p className="status-error">{notesError}</p>
        </section>
      ) : null}

      {!isLoadingNotes && !notesError && filteredNotes.length === 0 ? (
        <section className="panel">
          <h3>No matching notes</h3>
          <p className="muted-text">No notes match the current topic or sorting criteria.</p>
        </section>
      ) : null}

      {!isLoadingNotes && !notesError && filteredNotes.length > 0 ? (
        <div className="notes-list-block">
          {filteredNotes.map((note) => (
            <button
              className={`note-card ${selectedNoteId === note.id ? "source-card-selected" : ""}`}
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              type="button"
            >
              <div className="note-card-top">
                <div className="card-copy-block">
                  <div className="card-badge-row">
                    <span className="note-kind-badge">NOTE</span>
                  </div>

                  <h3 className="note-card-title">{note.title}</h3>
                  <p className="note-card-preview">{note.contentPreview}</p>
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">{note.updatedAt}</span>
                </div>
              </div>

              <div className="note-card-footer">
                <span className="note-card-meta">{note.topicNames || "Inbox"}</span>
                <span className="note-card-topic-count">{note.topicCount} topics</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}