import { Panel } from "../../components/Panel";
import { formatUnixTimestamp } from "../../lib/format";
import type { ExcerptListItem } from "../../types/excerpt";

type ExcerptListProps = {
  title: string;
  excerpts: ExcerptListItem[];
  isLoadingExcerpts: boolean;
  excerptsError: string | null;
  emptyMessage: string;
  selectedExcerptId: string | null;
  onExcerptSelect: (excerptId: string) => void;
};

export function ExcerptList({
  title,
  excerpts,
  isLoadingExcerpts,
  excerptsError,
  emptyMessage,
  selectedExcerptId,
  onExcerptSelect,
}: ExcerptListProps) {
  if (isLoadingExcerpts) {
    return (
      <Panel title={title}>
        <p className="muted-text">Reading excerpts from the local database...</p>
      </Panel>
    );
  }

  if (excerptsError) {
    return (
      <Panel title={title}>
        <p className="status-error">Could not load excerpts</p>
        <p className="muted-text">{excerptsError}</p>
      </Panel>
    );
  }

  if (excerpts.length === 0) {
    return (
      <Panel title={title}>
        <p className="muted-text">{emptyMessage}</p>
      </Panel>
    );
  }

  return (
    <div className="excerpts-list-block">
      {excerpts.map((excerpt) => {
        const isSelected = excerpt.id === selectedExcerptId;

        return (
          <button
            className={`excerpt-card source-card-button ${isSelected ? "source-card-selected" : ""}`}
            key={excerpt.id}
            onClick={() => onExcerptSelect(excerpt.id)}
            type="button"
          >
            <div className="excerpt-card-top">
              <div className="card-copy-block">
                <div className="card-badge-row">
                  <span className="excerpt-kind-badge">EXCERPT</span>
                  <span className="entity-mini-pill">
                    {excerpt.sourceKind.toUpperCase()}
                  </span>
                </div>

                <h3 className="excerpt-card-title">{excerpt.sourceTitle}</h3>
              </div>

              <div className="card-date-block">
                <span className="card-date-label">Updated</span>
                <span className="card-date-value">
                  {formatUnixTimestamp(excerpt.updatedAt)}
                </span>
              </div>
            </div>

            <blockquote className="excerpt-card-quote">
              {excerpt.previewText}
            </blockquote>

            <div className="excerpt-citation-row">
              <span className="excerpt-citation-label">Citation</span>
              <span className="excerpt-citation-text">{excerpt.citationText}</span>
            </div>

            {excerpt.note ? (
              <p className="excerpt-card-note">{excerpt.note}</p>
            ) : null}

            <div className="excerpt-card-footer">
              <span className="excerpt-card-meta">
                {excerpt.topicNames || "Inbox"}
              </span>
              <span className="excerpt-card-meta">
                {excerpt.pageLabel ? `Location: ${excerpt.pageLabel}` : "Manual excerpt"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}