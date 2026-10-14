import { Panel } from "../../components/Panel";
import { formatUnixTimestamp } from "../../lib/format";
import type { TaskListItem } from "../../types/task";

type TaskListProps = {
  title: string;
  tasks: TaskListItem[];
  isLoadingTasks: boolean;
  tasksError: string | null;
  emptyMessage: string;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
};

function prettyStatus(status: string) {
  switch (status) {
    case "todo":
      return "To do";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function prettyPriority(priority: string) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return priority;
  }
}

export function TaskList({
  title,
  tasks,
  isLoadingTasks,
  tasksError,
  emptyMessage,
  selectedTaskId,
  onTaskSelect,
}: TaskListProps) {
  if (isLoadingTasks) {
    return (
      <Panel title={title}>
        <p className="muted-text">Reading tasks from the local database...</p>
      </Panel>
    );
  }

  if (tasksError) {
    return (
      <Panel title={title}>
        <p className="status-error">Could not load tasks</p>
        <p className="muted-text">{tasksError}</p>
      </Panel>
    );
  }

  if (tasks.length === 0) {
    return (
      <Panel title={title}>
        <p className="muted-text">{emptyMessage}</p>
      </Panel>
    );
  }

  return (
    <div className="tasks-list-block">
      {tasks.map((task) => {
        const isSelected = task.id === selectedTaskId;

        return (
          <button
            className={`task-card source-card-button ${isSelected ? "source-card-selected" : ""}`}
            key={task.id}
            onClick={() => onTaskSelect(task.id)}
            type="button"
          >
            <div className="task-card-top">
              <div className="card-copy-block">
                <div className="card-badge-row">
                  <span className="task-kind-badge">TASK</span>
                  <span className={`task-status-pill task-status-${task.status}`}>
                    {prettyStatus(task.status)}
                  </span>
                  <span className={`task-priority-pill task-priority-${task.priority}`}>
                    {prettyPriority(task.priority)}
                  </span>
                </div>

                <h3 className="task-card-title">{task.title}</h3>
              </div>

              <div className="card-date-block">
                <span className="card-date-label">Updated</span>
                <span className="card-date-value">
                  {formatUnixTimestamp(task.updatedAt)}
                </span>
              </div>
            </div>

            {task.description ? (
              <p className="task-card-description">{task.description}</p>
            ) : null}

            <div className="task-card-footer">
              <span className="task-card-meta">{task.topicNames || "Inbox"}</span>
              <span className="task-card-meta">
                {task.dueAt ? `Due: ${task.dueAt}` : "No due date"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}