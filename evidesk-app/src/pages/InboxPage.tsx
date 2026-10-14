import { useMemo } from "react";
import { formatUnixTimestamp } from "../lib/format";
import type { SourceListItem } from "../types/source";

type InboxPageProps = {
  inboxSources: SourceListItem[];
  selectedSourceId: string | null;
  isLoadingSources: boolean;
  sourcesError: string | null;
  onSourceSelect: (sourceId: string) => void;
  onAddSourceClick: () => void;
  onImportPdfClick: () => void;
  onNewNoteClick: () => void;
};

export function InboxPage({
  inboxSources,
  selectedSourceId,
  isLoadingSources,
  sourcesError,
  onSourceSelect,
  onAddSourceClick,
  onImportPdfClick,
  onNewNoteClick,
}: InboxPageProps) {
  const totalSources = inboxSources.length;

  const pdfCount = useMemo(
    () => inboxSources.filter((source) => source.kind === "pdf").length,
    [inboxSources],
  );

  const urlCount = useMemo(
    () => inboxSources.filter((source) => source.kind === "url").length,
    [inboxSources],
  );

  const noteCount = useMemo(
    () => inboxSources.filter((source) => source.kind === "note").length,
    [inboxSources],
  );

  const recentSources = useMemo(() => {
    return [...inboxSources]
      .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
      .slice(0, 4);
  }, [inboxSources]);

  const latestUpdatedLabel = useMemo(() => {
    if (inboxSources.length === 0) {
      return "No activity yet";
    }

    const latest = [...inboxSources].sort(
      (a, b) => Number(b.updatedAt) - Number(a.updatedAt),
    )[0];

    return formatUnixTimestamp(latest.updatedAt);
  }, [inboxSources]);

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Capture</p>
          <h2>Inbox</h2>
          <p>
            Your unassigned research material lands here first. Review, triage and route sources
            into the right dossier when they are ready.
          </p>
        </div>

        <div className="topbar-actions">
          <button className="secondary-btn" onClick={onNewNoteClick} type="button">
            New Note
          </button>
          <button className="secondary-btn" onClick={onImportPdfClick} type="button">
            Import PDF
          </button>
          <button className="primary-btn" onClick={onAddSourceClick} type="button">
            Add URL
          </button>
        </div>
      </div>

      <div className="content-grid">
        <section className="panel hero-panel">
          <h3>Inbox workspace</h3>
          <p>
            Inbox is the fast capture layer of Evidesk. Unlinked material stays here until you
            assign it to one or more topics.
          </p>

          <div className="capability-chip-row inbox-chip-row">
            <span className="capability-chip">Fast capture</span>
            <span className="capability-chip">Local-first</span>
            <span className="capability-chip">Topic routing</span>
            <span className="capability-chip">Evidence-ready</span>
          </div>
        </section>

        <section className="panel">
          <h3>Database status</h3>
          <div className="status-stack">
            <span className="status-ok">Database ready</span>
            <span className="muted-text">Workspace initialized successfully</span>
            <div className="dashboard-mini-progress">
              <div className="dashboard-mini-progress-bar" />
            </div>
          </div>
        </section>
      </div>

      <div className="content-grid">
        <section className="panel">
          <h3>Workspace overview</h3>
          <div className="summary-stat-grid summary-stat-grid-3">
            <div className="summary-stat-card">
              <span className="summary-stat-label">Inbox items</span>
              <span className="summary-stat-value">{totalSources}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">PDFs</span>
              <span className="summary-stat-value">{pdfCount}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">URLs</span>
              <span className="summary-stat-value">{urlCount}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Notes as sources</span>
              <span className="summary-stat-value">{noteCount}</span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Latest update</span>
              <span className="summary-stat-value summary-stat-value-small">
                {latestUpdatedLabel}
              </span>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">State</span>
              <span className="summary-stat-value">
                {totalSources > 0 ? "Active" : "Ready"}
              </span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h3>Quick actions</h3>
          <div className="quick-action-grid">
            <button className="action-card" onClick={onAddSourceClick} type="button">
              <span className="action-card-title">Capture URL</span>
              <span className="action-card-copy">
                Add a web source directly into the workspace.
              </span>
            </button>

            <button className="action-card" onClick={onImportPdfClick} type="button">
              <span className="action-card-title">Import PDF</span>
              <span className="action-card-copy">
                Bring documents into the local research library.
              </span>
            </button>

            <button className="action-card" onClick={onNewNoteClick} type="button">
              <span className="action-card-title">Write Note</span>
              <span className="action-card-copy">
                Capture structured internal context before routing.
              </span>
            </button>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="search-group-header">
          <h3>Recent inbox activity</h3>
          <span>{recentSources.length}</span>
        </div>

        {recentSources.length === 0 ? (
          <p className="muted-text">
            No recent activity yet. Add a source, import a PDF or create a note to start filling
            your workspace.
          </p>
        ) : (
          <div className="recent-activity-list">
            {recentSources.map((source) => (
              <button
                className={`recent-activity-card ${
                  selectedSourceId === source.id ? "source-card-selected" : ""
                }`}
                key={source.id}
                onClick={() => onSourceSelect(source.id)}
                type="button"
              >
                <div className="recent-activity-top">
                  <div className="card-copy-block">
                    <div className="card-badge-row">
                      <span className="source-kind-badge">{source.kind.toUpperCase()}</span>
                      <span className="entity-mini-pill">
                        {source.topicCount > 0 ? `${source.topicCount} topics` : "Inbox"}
                      </span>
                    </div>

                    <h3 className="source-card-title">{source.title}</h3>

                    {source.description ? (
                      <p className="source-card-description">{source.description}</p>
                    ) : null}

                    {source.url ? <p className="source-card-url">{source.url}</p> : null}
                  </div>

                  <div className="card-date-block">
                    <span className="card-date-label">Updated</span>
                    <span className="card-date-value">
                      {formatUnixTimestamp(source.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="source-card-footer">
                  <span className="source-card-meta">{source.topicNames || "Inbox"}</span>
                  <span className="source-card-topic-count">Open details</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {isLoadingSources ? (
        <section className="panel">
          <h3>Loading inbox</h3>
          <p className="muted-text">Inbox items are loading...</p>
        </section>
      ) : null}

      {sourcesError ? (
        <section className="panel">
          <h3>Inbox unavailable</h3>
          <p className="status-error">{sourcesError}</p>
        </section>
      ) : null}

      {!isLoadingSources && !sourcesError && inboxSources.length === 0 ? (
        <section className="panel">
          <h3>Inbox is empty</h3>
          <p className="muted-text">
            No unlinked sources are waiting here. Material with no topic linkage will appear in this
            queue automatically.
          </p>
        </section>
      ) : null}

      {!isLoadingSources && !sourcesError && inboxSources.length > 0 ? (
        <div className="sources-list-block">
          {inboxSources.map((source) => (
            <button
              className={`source-card source-card-button ${
                selectedSourceId === source.id ? "source-card-selected" : ""
              }`}
              key={source.id}
              onClick={() => onSourceSelect(source.id)}
              type="button"
            >
              <div className="source-card-top">
                <div className="card-copy-block">
                  <div className="card-badge-row">
                    <span className="source-kind-badge">{source.kind.toUpperCase()}</span>
                    <span className="entity-mini-pill">
                      {source.topicCount > 0 ? `${source.topicCount} topics` : "Inbox"}
                    </span>
                  </div>

                  <h3 className="source-card-title">{source.title}</h3>

                  {source.description ? (
                    <p className="source-card-description">{source.description}</p>
                  ) : null}

                  {source.url ? <p className="source-card-url">{source.url}</p> : null}
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">
                    {formatUnixTimestamp(source.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="source-card-footer">
                <span className="source-card-meta">{source.topicNames || "Inbox"}</span>
                <span className="source-card-topic-count">Type: {source.kind}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}