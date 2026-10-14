import { useMemo, useState } from "react";
import { formatUnixTimestamp } from "../../lib/format";
import type { SourceListItem, SourceTopicLinkItem } from "../../types/source";
import type { TopicListItem } from "../../types/topic";

type SourceDetailPanelProps = {
  source: SourceListItem;
  topics: TopicListItem[];
  linkedTopics: SourceTopicLinkItem[];
  isLoadingTopicLinks: boolean;
  topicLinksError: string | null;
  isUpdatingTopics: boolean;
  onAddTopicLink: (topicId: string) => Promise<void>;
  onRemoveTopicLink: (topicId: string) => Promise<void>;
  onClose: () => void;
  onCreateExcerpt: (sourceId: string) => void;
  onArchive: () => Promise<void>;
  isArchiving: boolean;
};

export function SourceDetailPanel({
  source,
  topics,
  linkedTopics,
  isLoadingTopicLinks,
  topicLinksError,
  isUpdatingTopics,
  onAddTopicLink,
  onRemoveTopicLink,
  onClose,
  onCreateExcerpt,
  onArchive,
  isArchiving,
}: SourceDetailPanelProps) {
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const linkedTopicIds = useMemo(() => new Set(linkedTopics.map((topic) => topic.topicId)), [linkedTopics]);

  const availableTopics = useMemo(
    () => topics.filter((topic) => !linkedTopicIds.has(topic.id)),
    [topics, linkedTopicIds],
  );

  async function handleAddTopic() {
    if (!selectedTopicId) return;
    await onAddTopicLink(selectedTopicId);
    setSelectedTopicId("");
  }

  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Source detail</p>
          <h3>{source.title}</h3>
          <p className="detail-sidebar-subtitle">
            Inspect source metadata and manage topic linkage directly from the panel.
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="detail-hero-card">
        <span className="source-kind-badge">{source.kind.toUpperCase()}</span>
        <p className="detail-hero-text">
          This source is part of your research workspace and can connect to multiple dossiers.
        </p>
      </div>

      {source.url ? (
        <div className="detail-section">
          <p className="detail-label">URL</p>
          <p className="detail-url">{source.url}</p>
        </div>
      ) : null}

      {source.description ? (
        <div className="detail-section">
          <p className="detail-label">Description</p>
          <p className="detail-value">{source.description}</p>
        </div>
      ) : null}

      <div className="detail-section">
        <p className="detail-label">Linked topics</p>

        {isLoadingTopicLinks ? <p className="muted-text">Loading topic links...</p> : null}
        {topicLinksError ? <p className="status-error">{topicLinksError}</p> : null}

        {!isLoadingTopicLinks && linkedTopics.length === 0 ? (
          <p className="muted-text">This source is currently in Inbox only.</p>
        ) : null}

        {linkedTopics.length > 0 ? (
          <div className="topic-chip-list">
            {linkedTopics.map((topic) => (
              <button
                className="topic-chip topic-chip-removable"
                disabled={isUpdatingTopics}
                key={topic.topicId}
                onClick={() => void onRemoveTopicLink(topic.topicId)}
                type="button"
              >
                <span
                  className="topic-chip-dot"
                  style={{ backgroundColor: topic.topicColor }}
                />
                <span>{topic.topicTitle}</span>
                <span className="topic-chip-remove">×</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="topic-link-row">
          <select
            className="form-select"
            disabled={isUpdatingTopics || availableTopics.length === 0}
            onChange={(event) => setSelectedTopicId(event.target.value)}
            value={selectedTopicId}
          >
            <option value="">Select topic to link</option>
            {availableTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>

          <button
            className="secondary-btn"
            disabled={!selectedTopicId || isUpdatingTopics}
            onClick={() => void handleAddTopic()}
            type="button"
          >
            {isUpdatingTopics ? "Updating..." : "Add Topic"}
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{source.topicNames || "Inbox"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Topic count</p>
          <p className="detail-value">{source.topicCount}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatUnixTimestamp(source.createdAt)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatUnixTimestamp(source.updatedAt)}</p>
        </div>
      </div>

      <div className="detail-inline-actions">
        <button className="secondary-btn" onClick={() => onCreateExcerpt(source.id)} type="button">
          New Excerpt
        </button>
      </div>

      <div className="detail-danger-zone">
        <button
          className="danger-btn danger-btn-secondary"
          disabled={isArchiving}
          onClick={() => void onArchive()}
          type="button"
        >
          {isArchiving ? "Archiving..." : "Archive Source"}
        </button>
      </div>
    </aside>
  );
}