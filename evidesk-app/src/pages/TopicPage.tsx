import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExcerptList } from "../features/excerpts/ExcerptList";
import { NoteList } from "../features/notes/NoteList";
import { SourceList } from "../features/sources/SourceList";
import { TaskList } from "../features/tasks/TaskList";
import type { ExcerptListItem } from "../types/excerpt";
import type { NoteListItem } from "../types/note";
import type { SourceListItem } from "../types/source";
import type { TaskListItem } from "../types/task";
import type { TopicDetail, TopicListItem } from "../types/topic";

type TopicPageProps = {
  topic: TopicListItem;
  topicDetail: TopicDetail | null;
  isLoadingTopicDetail: boolean;
  topicDetailError: string | null;
  topicSources: SourceListItem[];
  topicNotes: NoteListItem[];
  topicExcerpts: ExcerptListItem[];
  topicTasks: TaskListItem[];
  isLoadingSources: boolean;
  isLoadingNotes: boolean;
  isLoadingExcerpts: boolean;
  isLoadingTasks: boolean;
  sourcesError: string | null;
  notesError: string | null;
  excerptsError: string | null;
  tasksError: string | null;
  selectedSourceId: string | null;
  selectedNoteId: string | null;
  selectedExcerptId: string | null;
  selectedTaskId: string | null;
  onSourceSelect: (sourceId: string) => void;
  onNoteSelect: (noteId: string) => void;
  onExcerptSelect: (excerptId: string) => void;
  onTaskSelect: (taskId: string) => void;
  onAddSourceClick: () => void;
  onImportPdfClick: () => void;
  onNewNoteClick: () => void;
  onNewExcerptClick: () => void;
  onNewTaskClick: () => void;
};

export function TopicPage({
  topic,
  topicDetail,
  isLoadingTopicDetail,
  topicDetailError,
  topicSources,
  topicNotes,
  topicExcerpts,
  topicTasks,
  isLoadingSources,
  isLoadingNotes,
  isLoadingExcerpts,
  isLoadingTasks,
  sourcesError,
  notesError,
  excerptsError,
  tasksError,
  selectedSourceId,
  selectedNoteId,
  selectedExcerptId,
  selectedTaskId,
  onSourceSelect,
  onNoteSelect,
  onExcerptSelect,
  onTaskSelect,
  onAddSourceClick,
  onImportPdfClick,
  onNewNoteClick,
  onNewExcerptClick,
  onNewTaskClick,
}: TopicPageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Dossier"
        title={topic.title}
        description={topic.description ?? "Topic research workspace and dossier view."}
        actions={
          <>
            <button className="secondary-btn" onClick={onNewNoteClick} type="button">
              New Note
            </button>
            <button className="secondary-btn" onClick={onNewExcerptClick} type="button">
              New Excerpt
            </button>
            <button className="secondary-btn" onClick={onNewTaskClick} type="button">
              New Task
            </button>
            <button className="secondary-btn" onClick={onImportPdfClick} type="button">
              Import PDF
            </button>
            <button className="primary-btn" onClick={onAddSourceClick} type="button">
              Add URL
            </button>
          </>
        }
      />

      <section className="content-grid">
        <Panel className="hero-panel" title="Topic overview">
          {isLoadingTopicDetail ? (
            <p className="muted-text">Loading topic dossier...</p>
          ) : topicDetailError ? (
            <>
              <p className="status-error">Could not load topic detail</p>
              <p className="muted-text">{topicDetailError}</p>
            </>
          ) : (
            <p>
              This dossier is now a real workspace for one research thread:
              sources, notes, excerpts and tasks converge here for focused analysis.
            </p>
          )}
        </Panel>

        <Panel title="Topic details">
          <div className="summary-stat-grid summary-stat-grid-3">
            <div className="summary-stat-card">
              <span className="summary-stat-label">Sources</span>
              <strong className="summary-stat-value">
                {topicDetail?.sourceCount ?? topic.sourceCount}
              </strong>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Notes</span>
              <strong className="summary-stat-value">
                {topicDetail?.noteCount ?? 0}
              </strong>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Excerpts</span>
              <strong className="summary-stat-value">
                {topicDetail?.excerptCount ?? 0}
              </strong>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">Tasks</span>
              <strong className="summary-stat-value">
                {topicDetail?.taskCount ?? 0}
              </strong>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">PDFs</span>
              <strong className="summary-stat-value">
                {topicDetail?.pdfCount ?? 0}
              </strong>
            </div>

            <div className="summary-stat-card">
              <span className="summary-stat-label">URLs</span>
              <strong className="summary-stat-value">
                {topicDetail?.urlCount ?? 0}
              </strong>
            </div>
          </div>

          <div className="topic-meta-row">
            <span className="topic-meta-label">Slug</span>
            <span className="topic-meta-value">{topic.slug}</span>
          </div>

          <div className="topic-meta-row">
            <span className="topic-meta-label">Color</span>
            <span className="topic-meta-value">
              <span
                className="topic-dot"
                style={{ backgroundColor: topic.color ?? "#4f8cff" }}
              />
              {topic.color ?? "#4f8cff"}
            </span>
          </div>
        </Panel>

        <SourceList
          emptyMessage="No sources linked to this topic yet."
          isLoadingSources={isLoadingSources}
          onSourceSelect={onSourceSelect}
          selectedSourceId={selectedSourceId}
          sources={topicSources}
          sourcesError={sourcesError}
          title="Topic sources"
        />

        <NoteList
          emptyMessage="No notes linked to this topic yet."
          isLoadingNotes={isLoadingNotes}
          notes={topicNotes}
          notesError={notesError}
          onNoteSelect={onNoteSelect}
          selectedNoteId={selectedNoteId}
          title="Topic notes"
        />

        <ExcerptList
          emptyMessage="No excerpts linked to this topic yet."
          excerpts={topicExcerpts}
          excerptsError={excerptsError}
          isLoadingExcerpts={isLoadingExcerpts}
          onExcerptSelect={onExcerptSelect}
          selectedExcerptId={selectedExcerptId}
          title="Topic excerpts"
        />

        <TaskList
          emptyMessage="No tasks linked to this topic yet."
          isLoadingTasks={isLoadingTasks}
          onTaskSelect={onTaskSelect}
          selectedTaskId={selectedTaskId}
          tasks={topicTasks}
          tasksError={tasksError}
          title="Topic tasks"
        />
      </section>
    </>
  );
}