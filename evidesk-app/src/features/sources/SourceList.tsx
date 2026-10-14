import { Panel } from "../../components/Panel";
import { formatFileSize, formatUnixTimestamp } from "../../lib/format";
import type { SourceListItem } from "../../types/source";

type SourceListProps = {
  title: string;
  sources: SourceListItem[];
  isLoadingSources: boolean;
  sourcesError: string | null;
  emptyMessage: string;
  selectedSourceId: string | null;
  onSourceSelect: (sourceId: string) => void;
};

export function SourceList({
  title,
  sources,
  isLoadingSources,
  sourcesError,
  emptyMessage,
  selectedSourceId,
  onSourceSelect,
}: SourceListProps) {
  if (isLoadingSources) {
    return (
      <Panel title={title}>
        <p className="muted-text">Reading sources from the local database...</p>
      </Panel>
    );
  }

  if (sourcesError) {
    return (
      <Panel title={title}>
        <p className="status-error">Could not load sources</p>
        <p className="muted-text">{sourcesError}</p>
      </Panel>
    );
  }

  if (sources.length === 0) {
    return (
      <Panel title={title}>
        <p className="muted-text">{emptyMessage}</p>
      </Panel>
    );
  }

  return (
    <div className="sources-list-block">
      {sources.map((source) => {
        const isSelected = source.id === selectedSourceId;
        const isPdf = source.kind === "pdf";

        return (
          <button
            className={`source-card source-card-button ${isSelected ? "source-card-selected" : ""}`}
            key={source.id}
            onClick={() => onSourceSelect(source.id)}
            type="button"
          >
            <div className="source-card-top">
              <div className="card-copy-block">
                <div className="card-badge-row">
                  <p className="source-kind-badge">{source.kind.toUpperCase()}</p>
                  <span className="entity-mini-pill">
                    {source.topicCount} topic{source.topicCount === 1 ? "" : "s"}
                  </span>
                  {isPdf && source.fileSizeBytes ? (
                    <span className="entity-mini-pill">
                      {formatFileSize(source.fileSizeBytes)}
                    </span>
                  ) : null}
                </div>

                <h3 className="source-card-title">{source.title}</h3>
              </div>

              <div className="card-date-block">
                <span className="card-date-label">Updated</span>
                <span className="card-date-value">
                  {formatUnixTimestamp(source.updatedAt)}
                </span>
              </div>
            </div>

            {source.description ? (
              <p className="source-card-description">{source.description}</p>
            ) : null}

            {source.sourceUrl ? (
              <p className="source-card-url">{source.sourceUrl}</p>
            ) : null}

            {isPdf && source.originalFilename ? (
              <div className="source-inline-file-meta">
                <span className="source-inline-file-name">{source.originalFilename}</span>
                <span className="source-inline-file-separator">•</span>
                <span className="source-inline-file-size">
                  {formatFileSize(source.fileSizeBytes)}
                </span>
              </div>
            ) : null}

            <div className="source-card-footer">
              <span className="source-card-meta">
                {source.topicNames || "Inbox"}
              </span>
              <span className="source-card-meta">Type: {source.kind}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}