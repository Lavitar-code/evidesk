import { useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { useTopicFilterOptions } from "../hooks/useTopicFilterOptions";
import type { SourceListItem } from "../types/source";
import type { TopicListItem } from "../types/topic";

type SourcesPageProps = {
  sources: SourceListItem[];
  topics: TopicListItem[];
  selectedSourceId: string | null;
  isLoadingSources: boolean;
  sourcesError: string | null;
  onSourceSelect: (sourceId: string) => void;
  onAddSourceClick: () => void;
  onImportPdfClick: () => void;
};

export function SourcesPage({
  sources,
  topics,
  selectedSourceId,
  isLoadingSources,
  sourcesError,
  onSourceSelect,
  onAddSourceClick,
  onImportPdfClick,
}: SourcesPageProps) {
  const [topicFilter, setTopicFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");

  const topicOptions = useTopicFilterOptions(topics);

  const filteredSources = useMemo(() => {
    let nextItems = [...sources];

    if (topicFilter === "inbox") {
      nextItems = nextItems.filter((source) => source.topicCount === 0);
    } else if (topicFilter !== "all") {
      const selectedTopic = topics.find((topic) => topic.id === topicFilter);
      if (selectedTopic) {
        nextItems = nextItems.filter((source) =>
          source.topicNames
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(selectedTopic.title),
        );
      }
    }

    if (kindFilter !== "all") {
      nextItems = nextItems.filter((source) => source.kind === kindFilter);
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
  }, [kindFilter, sortBy, sources, topicFilter, topics]);

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Library</p>
          <h2>All sources</h2>
          <p>
            Review every active source in the workspace, inspect metadata and route material into
            dossiers.
          </p>
        </div>

        <div className="topbar-actions">
          <button className="secondary-btn" onClick={onImportPdfClick} type="button">
            Import PDF
          </button>
          <button className="primary-btn" onClick={onAddSourceClick} type="button">
            New Source
          </button>
        </div>
      </div>

      <FilterBar
        fields={[
          {
            key: "source-topic",
            label: "Topic",
            value: topicFilter,
            options: topicOptions,
            onChange: setTopicFilter,
          },
          {
            key: "source-kind",
            label: "Type",
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
            key: "source-sort",
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

      {isLoadingSources ? (
        <section className="panel">
          <h3>Loading sources</h3>
          <p className="muted-text">Active sources are loading...</p>
        </section>
      ) : null}

      {sourcesError ? (
        <section className="panel">
          <h3>Sources unavailable</h3>
          <p className="status-error">{sourcesError}</p>
        </section>
      ) : null}

      {!isLoadingSources && !sourcesError && filteredSources.length === 0 ? (
        <section className="panel">
          <h3>No matching sources</h3>
          <p className="muted-text">
            No active sources match the current filters. Try a different topic, type or sort.
          </p>
        </section>
      ) : null}

      {!isLoadingSources && !sourcesError && filteredSources.length > 0 ? (
        <div className="sources-list-block">
          {filteredSources.map((source) => (
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
                  </div>

                  <h3 className="source-card-title">{source.title}</h3>

                  {source.description ? (
                    <p className="source-card-description">{source.description}</p>
                  ) : null}

                  {source.url ? <p className="source-card-url">{source.url}</p> : null}
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">{source.updatedAt}</span>
                </div>
              </div>

              <div className="source-card-footer">
                <span className="source-card-meta">{source.topicNames || "Inbox"}</span>
                <span className="source-card-topic-count">{source.topicCount} topics</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}