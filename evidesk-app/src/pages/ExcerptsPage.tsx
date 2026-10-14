import { useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { useTopicFilterOptions } from "../hooks/useTopicFilterOptions";
import type { ExcerptListItem } from "../types/excerpt";
import type { TopicListItem } from "../types/topic";

type ExcerptsPageProps = {
  excerpts: ExcerptListItem[];
  topics: TopicListItem[];
  selectedExcerptId: string | null;
  isLoadingExcerpts: boolean;
  excerptsError: string | null;
  onExcerptSelect: (excerptId: string) => void;
  onNewExcerptClick: () => void;
};

export function ExcerptsPage({
  excerpts,
  topics,
  selectedExcerptId,
  isLoadingExcerpts,
  excerptsError,
  onExcerptSelect,
  onNewExcerptClick,
}: ExcerptsPageProps) {
  const [topicFilter, setTopicFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");

  const topicOptions = useTopicFilterOptions(topics);

  const filteredExcerpts = useMemo(() => {
    let nextItems = [...excerpts];

    if (topicFilter !== "all") {
      const selectedTopic = topics.find((topic) => topic.id === topicFilter);
      if (selectedTopic) {
        nextItems = nextItems.filter((excerpt) =>
          excerpt.topicNames
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(selectedTopic.title),
        );
      }
    }

    if (kindFilter !== "all") {
      nextItems = nextItems.filter((excerpt) => excerpt.sourceKind === kindFilter);
    }

    switch (sortBy) {
      case "created_desc":
        nextItems.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        break;
      case "created_asc":
        nextItems.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
        break;
      case "updated_asc":
        nextItems.sort((a, b) => Number(a.updatedAt) - Number(b.updatedAt));
        break;
      case "source_asc":
        nextItems.sort((a, b) => a.sourceTitle.localeCompare(b.sourceTitle));
        break;
      case "source_desc":
        nextItems.sort((a, b) => b.sourceTitle.localeCompare(a.sourceTitle));
        break;
      case "updated_desc":
      default:
        nextItems.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        break;
    }

    return nextItems;
  }, [excerpts, kindFilter, sortBy, topicFilter, topics]);

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Evidence</p>
          <h2>Excerpts</h2>
          <p>Captured evidence snippets across documents, URLs and notes.</p>
        </div>

        <div className="topbar-actions">
          <button className="primary-btn" onClick={onNewExcerptClick} type="button">
            New Excerpt
          </button>
        </div>
      </div>

      <FilterBar
        fields={[
          {
            key: "excerpt-topic",
            label: "Topic",
            value: topicFilter,
            options: [{ value: "all", label: "All topics" }, ...topicOptions.slice(1)],
            onChange: setTopicFilter,
          },
          {
            key: "excerpt-kind",
            label: "Source type",
            value: kindFilter,
            options: [
              { value: "all", label: "All types" },
              { value: "url", label: "Web" },
              { value: "pdf", label: "PDF" },
              { value: "note", label: "Note source" },
            ],
            onChange: setKindFilter,
          },
          {
            key: "excerpt-sort",
            label: "Sort",
            value: sortBy,
            options: [
              { value: "updated_desc", label: "Recently updated" },
              { value: "updated_asc", label: "Oldest updated" },
              { value: "created_desc", label: "Recently created" },
              { value: "created_asc", label: "Oldest created" },
              { value: "source_asc", label: "Source A-Z" },
              { value: "source_desc", label: "Source Z-A" },
            ],
            onChange: setSortBy,
          },
        ]}
      />

      {isLoadingExcerpts ? (
        <section className="panel">
          <h3>Loading excerpts</h3>
          <p className="muted-text">Evidence snippets are loading...</p>
        </section>
      ) : null}

      {excerptsError ? (
        <section className="panel">
          <h3>Excerpts unavailable</h3>
          <p className="status-error">{excerptsError}</p>
        </section>
      ) : null}

      {!isLoadingExcerpts && !excerptsError && filteredExcerpts.length === 0 ? (
        <section className="panel">
          <h3>No matching excerpts</h3>
          <p className="muted-text">No excerpts match the current filters.</p>
        </section>
      ) : null}

      {!isLoadingExcerpts && !excerptsError && filteredExcerpts.length > 0 ? (
        <div className="excerpts-list-block">
          {filteredExcerpts.map((excerpt) => (
            <button
              className={`excerpt-card ${selectedExcerptId === excerpt.id ? "source-card-selected" : ""}`}
              key={excerpt.id}
              onClick={() => onExcerptSelect(excerpt.id)}
              type="button"
            >
              <div className="excerpt-card-top">
                <div className="card-copy-block">
                  <div className="card-badge-row">
                    <span className="excerpt-kind-badge">{excerpt.sourceKind.toUpperCase()}</span>
                  </div>

                  <h3 className="excerpt-card-title">{excerpt.sourceTitle}</h3>
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">{excerpt.updatedAt}</span>
                </div>
              </div>

              <p className="excerpt-card-quote">{excerpt.previewText}</p>

              {excerpt.note ? <p className="excerpt-card-note">{excerpt.note}</p> : null}

              <div className="excerpt-citation-row">
                <span className="excerpt-citation-label">Citation</span>
                <span className="excerpt-citation-text">{excerpt.citationText}</span>
              </div>

              <div className="excerpt-card-footer">
                <span className="excerpt-card-meta">{excerpt.topicNames || "Unlinked"}</span>
                <span className="excerpt-card-meta">{excerpt.pageLabel || "No page label"}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}