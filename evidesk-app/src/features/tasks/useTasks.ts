import { useCallback, useEffect, useState } from "react";
import {
  archiveTask,
  createTask,
  getTaskDetail,
  listTasks,
  updateTask,
} from "../../lib/tauri";
import type {
  CreateTaskInput,
  TaskDetail,
  TaskListItem,
  UpdateTaskInput,
} from "../../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      setTasksError(null);

      const result = await listTasks();
      setTasks(result);
    } catch (error) {
      setTasksError(String(error));
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  const createNewTask = useCallback(async (payload: CreateTaskInput) => {
    const createdTask = await createTask(payload);
    setTasks((current) => [createdTask, ...current]);
    return createdTask;
  }, []);

  const fetchTaskDetail = useCallback(async (taskId: string) => {
    return getTaskDetail(taskId);
  }, []);

  const updateExistingTask = useCallback(async (taskId: string, payload: UpdateTaskInput) => {
    const updatedTask = await updateTask(taskId, payload);

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: updatedTask.title,
              description: updatedTask.description,
              status: updatedTask.status,
              priority: updatedTask.priority,
              dueAt: updatedTask.dueAt,
              updatedAt: updatedTask.updatedAt,
            }
          : task,
      ),
    );

    return updatedTask;
  }, []);

  const archiveExistingTask = useCallback(async (taskId: string) => {
    await archiveTask(taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoadingTasks,
    tasksError,
    reloadTasks: loadTasks,
    createNewTask,
    fetchTaskDetail,
    updateExistingTask,
    archiveExistingTask,
  };
}