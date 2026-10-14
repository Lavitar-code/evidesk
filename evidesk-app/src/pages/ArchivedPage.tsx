import { formatUnixTimestamp } from "../lib/format";
import type { ArchivedExcerptListItem } from "../types/excerpt";
import type { ArchivedNoteListItem } from "../types/note";
import type { ArchivedSourceListItem } from "../types/source";
import type { ArchivedTaskListItem } from "../types/task";

type ArchivedPageProps = {
  archivedSources: ArchivedSourceListItem[];
  archivedNotes: ArchivedNoteListItem[];
  archivedExcerpts: ArchivedExcerptListItem[];
  archivedTasks: ArchivedTaskListItem[];
  isLoadingArchive: boolean;
  archiveError: string | null;
  onRestoreSource: (sourceId: string) => Promise<void>;
  onRestoreNote: (noteId: string) => Promise<void>;
  onRestoreExcerpt: (excerptId: string) => Promise<void>;
  onRestoreTask: (taskId: string) => Promise<void>;
};

export function ArchivedPage({
  archivedSources,
  archivedNotes,
  archivedExcerpts,
  archivedTasks,
  isLoadingArchive,
  archiveError,
  onRestoreSource,
  onRestoreNote,
  onRestoreExcerpt,
  onRestoreTask,
}: ArchivedPageProps) {
  const totalArchived =
    archivedSources.length +
    archivedNotes.length +
    archivedExcerpts.length +
    archivedTasks.length;

  const hasItems = totalArchived > 0;

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Archive</p>
          <h2>Archived items</h2>
          <p>
            Soft-archived entities stay recoverable here. Restore anything back into the active
            workspace in one click.
          </p>
        </div>
      </div>

      <div className="content-grid">
        <section className="panel">
          <h3>Archive summary</h3>
          <div className="summary-stat-grid summary-stat-grid-3">
            <div className="summary-stat-card">
              <span className="summary-stat-label">Total</span>
              <span className="summary-stat-value">{totalArchived}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Sources</span>
              <span className="summary-stat-value">{archivedSources.length}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Notes</span>
              <span className="summary-stat-value">{archivedNotes.length}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Excerpts</span>
              <span className="summary-stat-value">{archivedExcerpts.length}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Tasks</span>
              <span className="summary-stat-value">{archivedTasks.length}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">State</span>
              <span className="summary-stat-value">
                {hasItems ? "Recoverable" : "Clean"}
              </span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h3>How it works</h3>
          <div className="capability-chip-row">
            <span className="capability-chip">Soft delete</span>
            <span className="capability-chip">Restore anytime</span>
            <span className="capability-chip">Local-first</span>
            <span className="capability-chip">Safe workflow</span>
          </div>
        </section>
      </div>

      {isLoadingArchive ? (
        <section className="panel">
          <h3>Loading archive</h3>
          <p className="muted-text">Recoverable items are loading...</p>
        </section>
      ) : null}

      {archiveError ? (
        <section className="panel">
          <h3>Archive unavailable</h3>
          <p className="status-error">{archiveError}</p>
        </section>
      ) : null}

      {!isLoadingArchive && !archiveError && !hasItems ? (
        <section className="panel">
          <h3>Archive is empty</h3>
          <p className="muted-text">
            Nothing is archived right now. Archived sources, notes, excerpts and tasks will appear
            here.
          </p>
        </section>
      ) : null}

      {!isLoadingArchive && !archiveError && hasItems ? (
        <div className="archive-sections">
          <ArchiveGroup
            title="Archived Sources"
            emptyText="No archived sources."
            items={archivedSources.map((item) => ({
              id: item.id,
              badge: item.kind.toUpperCase(),
              title: item.title,
              description: item.url || item.description || "Archived source",
              meta: `Archived ${formatUnixTimestamp(item.archivedAt)}`,
              onRestore: () => onRestoreSource(item.id),
            }))}
          />

          <ArchiveGroup
            title="Archived Notes"
            emptyText="No archived notes."
            items={archivedNotes.map((item) => ({
              id: item.id,
              badge: "NOTE",
              title: item.title,
              description: item.contentPreview,
              meta: `Archived ${formatUnixTimestamp(item.archivedAt)}`,
              onRestore: () => onRestoreNote(item.id),
            }))}
          />

          <ArchiveGroup
            title="Archived Excerpts"
            emptyText="No archived excerpts."
            items={archivedExcerpts.map((item) => ({
              id: item.id,
              badge: "EXCERPT",
              title: item.sourceTitle,
              description: item.previewText,
              meta: `Archived ${formatUnixTimestamp(item.archivedAt)}`,
              onRestore: () => onRestoreExcerpt(item.id),
            }))}
          />

          <ArchiveGroup
            title="Archived Tasks"
            emptyText="No archived tasks."
            items={archivedTasks.map((item) => ({
              id: item.id,
              badge: "TASK",
              title: item.title,
              description: item.description || `${item.status} · ${item.priority}`,
              meta: `Archived ${formatUnixTimestamp(item.archivedAt)}`,
              onRestore: () => onRestoreTask(item.id),
            }))}
          />
        </div>
      ) : null}
    </div>
  );
}

type ArchiveGroupItem = {
  id: string;
  badge: string;
  title: string;
  description: string;
  meta: string;
  onRestore: () => Promise<void>;
};

type ArchiveGroupProps = {
  title: string;
  emptyText: string;
  items: ArchiveGroupItem[];
};

function ArchiveGroup({ title, emptyText, items }: ArchiveGroupProps) {
  return (
    <section className="panel">
      <div className="search-group-header">
        <h3>{title}</h3>
        <span>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="muted-text">{emptyText}</p>
      ) : (
        <div className="archive-list">
          {items.map((item) => (
            <div className="archive-item" key={item.id}>
              <div className="archive-item-main">
                <span className="archive-badge">{item.badge}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="archive-meta">{item.meta}</span>
              </div>

              <div className="archive-item-actions">
                <button className="secondary-btn" onClick={() => void item.onRestore()} type="button">
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}