import { useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { formatUnixTimestamp } from "../lib/format";
import type { SearchResultItem } from "../types/search";

type SearchPageProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  results: SearchResultItem[];
  isLoadingSearch: boolean;
  searchError: string | null;
  onResultClick: (result: SearchResultItem) => void;
};

export function SearchPage({
  searchQuery,
  onSearchQueryChange,
  results,
  isLoadingSearch,
  searchError,
  onResultClick,
}: SearchPageProps) {
  const groupedResults = useMemo(() => {
    return {
      topics: results.filter((result) => result.entityType === "topic"),
      sources: results.filter((result) => result.entityType === "source"),
      notes: results.filter((result) => result.entityType === "note"),
    };
  }, [results]);

  function renderGroup(label: string, items: SearchResultItem[]) {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="search-group">
        <div className="search-group-header">
          <h3>{label}</h3>
          <span>{items.length}</span>
        </div>

        <div className="search-results-stack">
          {items.map((item) => (
            <button
              className="search-result-card"
              key={`${item.entityType}-${item.id}`}
              onClick={() => onResultClick(item)}
              type="button"
            >
              <div className="search-result-top">
                <div className="card-copy-block">
                  <div className="search-result-badges">
                    <span className="search-result-type">
                      {item.entityType.toUpperCase()}
                    </span>
                    <span className="search-result-match">
                      match: {item.matchedField}
                    </span>
                  </div>

                  <h4 className="search-result-title">{item.title}</h4>
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">
                    {formatUnixTimestamp(item.updatedAt)}
                  </span>
                </div>
              </div>

              {item.subtitle ? (
                <p className="search-result-subtitle">{item.subtitle}</p>
              ) : null}

              {item.snippet ? (
                <p className="search-result-snippet">{item.snippet}</p>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Search"
        description="Retrieve topics, sources and notes across your local workspace."
        eyebrow="Retrieval"
        actions={
          <button className="secondary-btn" type="button">
            Local search
          </button>
        }
      />

      <section className="content-grid sources-grid">
        <Panel className="search-input-panel" title="Search workspace">
          <p className="muted-text">
            Search currently covers topic titles, source titles and URLs, plus
            markdown note content.
          </p>

          <div className="search-input-shell">
            <input
              className="search-input"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search topics, sources, notes..."
              type="text"
              value={searchQuery}
            />
          </div>
        </Panel>

        <Panel title="Search status">
          {!searchQuery.trim() ? (
            <p className="muted-text">
              Start typing to search your local workspace.
            </p>
          ) : null}

          {searchQuery.trim() && isLoadingSearch ? (
            <p className="muted-text">Searching local records...</p>
          ) : null}

          {searchQuery.trim() && !isLoadingSearch && !searchError ? (
            <div className="summary-stat-grid">
              <div className="summary-stat-card">
                <span className="summary-stat-label">Query</span>
                <strong className="summary-stat-value">{searchQuery}</strong>
              </div>
              <div className="summary-stat-card">
                <span className="summary-stat-label">Results</span>
                <strong className="summary-stat-value">{results.length}</strong>
              </div>
            </div>
          ) : null}

          {searchError ? (
            <>
              <p className="status-error">Search failed</p>
              <p className="muted-text">{searchError}</p>
            </>
          ) : null}
        </Panel>

        {!searchQuery.trim() ? (
          <Panel title="Ready to search">
            <p className="muted-text">
              Try searching for a topic title, URL fragment, markdown phrase or
              note title.
            </p>
          </Panel>
        ) : null}

        {searchQuery.trim() && !isLoadingSearch && !searchError && results.length === 0 ? (
          <Panel title="No results">
            <p className="muted-text">
              No local records matched this query yet.
            </p>
          </Panel>
        ) : null}

        {searchQuery.trim() && !isLoadingSearch && !searchError && results.length > 0 ? (
          <div className="search-groups-block">
            {renderGroup("Topics", groupedResults.topics)}
            {renderGroup("Sources", groupedResults.sources)}
            {renderGroup("Notes", groupedResults.notes)}
          </div>
        ) : null}
      </section>
    </>
  );
}