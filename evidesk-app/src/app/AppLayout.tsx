import type { ReactNode } from "react";
import type { TopicListItem } from "../types/topic";

type AppLayoutProps = {
  children: ReactNode;
  rightPanel?: ReactNode;
  topics: TopicListItem[];
  activeTopicId?: string;
  activeViewLabel: string;
  isLoadingTopics: boolean;
  topicsError: string | null;
  showCommandHint: boolean;
  onInboxClick: () => void;
  onSourcesClick: () => void;
  onNotesClick: () => void;
  onExcerptsClick: () => void;
  onTasksClick: () => void;
  onSearchClick: () => void;
  onArchivedClick: () => void;
  onTopicSelect: (topicId: string) => void;
  onCreateTopicClick: () => void;
  onOpenSettingsClick: () => void;
};

export function AppLayout({
  children,
  rightPanel,
  topics,
  activeTopicId,
  activeViewLabel,
  isLoadingTopics,
  topicsError,
  showCommandHint,
  onInboxClick,
  onSourcesClick,
  onNotesClick,
  onExcerptsClick,
  onTasksClick,
  onSearchClick,
  onArchivedClick,
  onTopicSelect,
  onCreateTopicClick,
  onOpenSettingsClick,
}: AppLayoutProps) {
  return (
    <div className={rightPanel ? "app-shell app-shell-with-detail" : "app-shell"}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-block">
            <div className="brand-mark">E</div>

            <div className="brand-text">
              <div className="brand-title-row">
                <h1>Evidesk</h1>
                <span className="brand-pill">Local-first</span>
              </div>

              <p>Research intelligence workspace</p>
            </div>
          </div>

          {showCommandHint ? (
            <div className="sidebar-command-hint">
              <span>Quick command palette</span>
              <strong>Ctrl/Cmd + K</strong>
            </div>
          ) : null}

          <nav className="sidebar-nav">
            <NavItem
              hint="Capture"
              isActive={activeViewLabel === "Capture"}
              label="Inbox"
              onClick={onInboxClick}
            />

            <NavItem
              hint="Library"
              isActive={activeViewLabel === "Library"}
              label="All Sources"
              onClick={onSourcesClick}
            />

            <NavItem
              hint="Markdown"
              isActive={activeViewLabel === "Markdown"}
              label="Notes"
              onClick={onNotesClick}
            />

            <NavItem
              hint="Evidence"
              isActive={activeViewLabel === "Evidence"}
              label="Excerpts"
              onClick={onExcerptsClick}
            />

            <NavItem
              hint="Action"
              isActive={activeViewLabel === "Action"}
              label="Tasks"
              onClick={onTasksClick}
            />

            <NavItem
              hint="Retrieve"
              isActive={activeViewLabel === "Retrieve"}
              label="Search"
              onClick={onSearchClick}
            />

            <NavItem
              hint="Trash"
              isActive={activeViewLabel === "Archive"}
              label="Archived"
              onClick={onArchivedClick}
            />
          </nav>

          <div className="topics-section">
            <div className="topics-section-header">
              <div className="topics-section-title-row">
                <span className="topics-section-label">Topics</span>
                <span className="topics-count">{topics.length}</span>
              </div>

              <button className="topics-create-btn" onClick={onCreateTopicClick} type="button">
                New Topic
              </button>
            </div>

            {isLoadingTopics ? (
              <div className="topics-empty-state">
                <span className="muted-text">Loading topics...</span>
              </div>
            ) : null}

            {topicsError ? (
              <div className="topics-empty-state">
                <span className="status-error">{topicsError}</span>
              </div>
            ) : null}

            <div className="topics-list">
              {topics.map((topic) => (
                <button
                  className={`topic-row ${topic.id === activeTopicId ? "topic-row-active" : ""}`}
                  key={topic.id}
                  onClick={() => onTopicSelect(topic.id)}
                  type="button"
                >
                  <span className="topic-row-left">
                    <span className="topic-dot" style={{ backgroundColor: topic.color }} />
                    <span className="topic-title">{topic.title}</span>
                  </span>

                  <span className="topics-count">{topic.realSourceCount}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <p className="sidebar-footer-label">Workspace status</p>

            <div className="sidebar-status-row">
              <span className="status-dot" />
              <span>Operational</span>
            </div>

            <button className="secondary-btn sidebar-settings-btn" onClick={onOpenSettingsClick} type="button">
              Settings
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      {rightPanel ? rightPanel : null}
    </div>
  );
}

type NavItemProps = {
  label: string;
  hint: string;
  isActive: boolean;
  onClick: () => void;
};

function NavItem({ label, hint, isActive, onClick }: NavItemProps) {
  return (
    <button
      className={`nav-item ${isActive ? "nav-item-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="nav-item-label">{label}</span>
      <span className="nav-item-hint">{hint}</span>
    </button>
  );
}