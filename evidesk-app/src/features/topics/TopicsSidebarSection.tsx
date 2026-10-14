import type { TopicListItem } from "../../types/topic";

type TopicsSidebarSectionProps = {
  topics: TopicListItem[];
  activeTopicId?: string;
  isLoadingTopics: boolean;
  topicsError: string | null;
  onTopicSelect: (topicId: string) => void;
  onCreateTopicClick: () => void;
};

export function TopicsSidebarSection({
  topics,
  activeTopicId,
  isLoadingTopics,
  topicsError,
  onTopicSelect,
  onCreateTopicClick,
}: TopicsSidebarSectionProps) {
  return (
    <div className="topics-section">
      <div className="topics-section-header">
        <div className="topics-section-title-row">
          <span className="topics-section-label">Topics</span>
          <span className="topics-count">{topics.length}</span>
        </div>

        <button
          className="topics-create-btn"
          onClick={onCreateTopicClick}
          type="button"
        >
          New Topic
        </button>
      </div>

      {isLoadingTopics ? (
        <div className="topics-empty-state">
          <p className="muted-text">Loading topics...</p>
        </div>
      ) : null}

      {!isLoadingTopics && topicsError ? (
        <div className="topics-empty-state">
          <p className="status-error">Could not load topics</p>
          <p className="muted-text">{topicsError}</p>
        </div>
      ) : null}

      {!isLoadingTopics && !topicsError && topics.length === 0 ? (
        <div className="topics-empty-state">
          <p className="muted-text">No topics yet.</p>
          <p className="muted-text">Create your first research topic.</p>
        </div>
      ) : null}

      {!isLoadingTopics && !topicsError && topics.length > 0 ? (
        <div className="topics-list">
          {topics.map((topic) => {
            const isActive = topic.id === activeTopicId;

            return (
              <button
                className={`topic-row ${isActive ? "topic-row-active" : ""}`}
                key={topic.id}
                onClick={() => onTopicSelect(topic.id)}
                type="button"
              >
                <span className="topic-row-left">
                  <span
                    className="topic-dot"
                    style={{ backgroundColor: topic.color ?? "#4f8cff" }}
                  />
                  <span className="topic-title">{topic.title}</span>
                </span>

                <span className="topic-count">{topic.sourceCount}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}