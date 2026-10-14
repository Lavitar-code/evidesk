export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskListItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  topicNames: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ArchivedTaskListItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  archivedAt: string;
  updatedAt: string;
};

export type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  topicNames: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  dueAt?: string | null;
  topicId?: string | null;
};

export type UpdateTaskInput = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | null;
};