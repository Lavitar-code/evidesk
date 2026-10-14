import { useMemo, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { useTopicFilterOptions } from "../hooks/useTopicFilterOptions";
import type { TaskListItem } from "../types/task";
import type { TopicListItem } from "../types/topic";

type TasksPageProps = {
  tasks: TaskListItem[];
  topics: TopicListItem[];
  selectedTaskId: string | null;
  isLoadingTasks: boolean;
  tasksError: string | null;
  onTaskSelect: (taskId: string) => void;
  onNewTaskClick: () => void;
};

export function TasksPage({
  tasks,
  topics,
  selectedTaskId,
  isLoadingTasks,
  tasksError,
  onTaskSelect,
  onNewTaskClick,
}: TasksPageProps) {
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority_status");

  const topicOptions = useTopicFilterOptions(topics);

  const filteredTasks = useMemo(() => {
    let nextItems = [...tasks];

    if (topicFilter === "inbox") {
      nextItems = nextItems.filter((task) => task.topicCount === 0);
    } else if (topicFilter !== "all") {
      const selectedTopic = topics.find((topic) => topic.id === topicFilter);
      if (selectedTopic) {
        nextItems = nextItems.filter((task) =>
          task.topicNames
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(selectedTopic.title),
        );
      }
    }

    if (statusFilter !== "all") {
      nextItems = nextItems.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      nextItems = nextItems.filter((task) => task.priority === priorityFilter);
    }

    switch (sortBy) {
      case "title_asc":
        nextItems.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        nextItems.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "updated_desc":
        nextItems.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        break;
      case "updated_asc":
        nextItems.sort((a, b) => Number(a.updatedAt) - Number(b.updatedAt));
        break;
      case "priority_status":
      default:
        nextItems.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const statusOrder = { todo: 0, in_progress: 1, done: 2 };

          const priorityDiff =
            priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;

          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;

          return Number(b.updatedAt) - Number(a.updatedAt);
        });
        break;
    }

    return nextItems;
  }, [priorityFilter, sortBy, statusFilter, tasks, topicFilter, topics]);

  return (
    <div className="workspace-page">
      <div className="topbar">
        <div className="topbar-copy">
          <p className="topbar-eyebrow">Action</p>
          <h2>Tasks</h2>
          <p>Operational tasks linked to your dossiers, priorities and execution state.</p>
        </div>

        <div className="topbar-actions">
          <button className="primary-btn" onClick={onNewTaskClick} type="button">
            New Task
          </button>
        </div>
      </div>

      <FilterBar
        fields={[
          {
            key: "task-topic",
            label: "Topic",
            value: topicFilter,
            options: topicOptions,
            onChange: setTopicFilter,
          },
          {
            key: "task-status",
            label: "Status",
            value: statusFilter,
            options: [
              { value: "all", label: "All statuses" },
              { value: "todo", label: "To do" },
              { value: "in_progress", label: "In progress" },
              { value: "done", label: "Done" },
            ],
            onChange: setStatusFilter,
          },
          {
            key: "task-priority",
            label: "Priority",
            value: priorityFilter,
            options: [
              { value: "all", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
            onChange: setPriorityFilter,
          },
          {
            key: "task-sort",
            label: "Sort",
            value: sortBy,
            options: [
              { value: "priority_status", label: "Priority + status" },
              { value: "updated_desc", label: "Recently updated" },
              { value: "updated_asc", label: "Oldest updated" },
              { value: "title_asc", label: "Title A-Z" },
              { value: "title_desc", label: "Title Z-A" },
            ],
            onChange: setSortBy,
          },
        ]}
      />

      {isLoadingTasks ? (
        <section className="panel">
          <h3>Loading tasks</h3>
          <p className="muted-text">Tasks are loading...</p>
        </section>
      ) : null}

      {tasksError ? (
        <section className="panel">
          <h3>Tasks unavailable</h3>
          <p className="status-error">{tasksError}</p>
        </section>
      ) : null}

      {!isLoadingTasks && !tasksError && filteredTasks.length === 0 ? (
        <section className="panel">
          <h3>No matching tasks</h3>
          <p className="muted-text">No tasks match the current filters.</p>
        </section>
      ) : null}

      {!isLoadingTasks && !tasksError && filteredTasks.length > 0 ? (
        <div className="tasks-list-block">
          {filteredTasks.map((task) => (
            <button
              className={`task-card ${selectedTaskId === task.id ? "source-card-selected" : ""}`}
              key={task.id}
              onClick={() => onTaskSelect(task.id)}
              type="button"
            >
              <div className="task-card-top">
                <div className="card-copy-block">
                  <div className="card-badge-row">
                    <span className="task-kind-badge">TASK</span>
                    <span className={`task-status-pill task-status-${task.status}`}>
                      {task.status}
                    </span>
                    <span className={`task-priority-pill task-priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="task-card-title">{task.title}</h3>

                  {task.description ? (
                    <p className="task-card-description">{task.description}</p>
                  ) : null}
                </div>

                <div className="card-date-block">
                  <span className="card-date-label">Updated</span>
                  <span className="card-date-value">{task.updatedAt}</span>
                </div>
              </div>

              <div className="task-card-footer">
                <span className="task-card-meta">{task.topicNames || "Inbox"}</span>
                <span className="task-card-meta">{task.dueAt || "No due date"}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}