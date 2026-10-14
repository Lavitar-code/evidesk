import type { ExcerptListItem } from "../types/excerpt";
import type { NoteListItem } from "../types/note";
import type { SourceListItem } from "../types/source";
import type { TaskListItem } from "../types/task";

export type SortMode = "updated_desc" | "created_desc" | "title_asc";

function splitTopicNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function matchesTopic(topicNames: string, selectedTopic: string) {
  if (!selectedTopic) {
    return true;
  }

  if (selectedTopic === "__inbox__") {
    return splitTopicNames(topicNames).length === 0;
  }

  return splitTopicNames(topicNames).includes(selectedTopic);
}

function compareBySortMode<T extends { title: string; createdAt: string; updatedAt: string }>(
  left: T,
  right: T,
  sortMode: SortMode,
) {
  switch (sortMode) {
    case "created_desc":
      return Number(right.createdAt) - Number(left.createdAt);
    case "title_asc":
      return left.title.localeCompare(right.title);
    case "updated_desc":
    default:
      return Number(right.updatedAt) - Number(left.updatedAt);
  }
}

export function filterAndSortSources(
  items: SourceListItem[],
  options: {
    kind: string;
    topic: string;
    sortMode: SortMode;
  },
) {
  return items
    .filter((item) => (options.kind ? item.kind === options.kind : true))
    .filter((item) => matchesTopic(item.topicNames, options.topic))
    .sort((a, b) => compareBySortMode(a, b, options.sortMode));
}

export function filterAndSortNotes(
  items: NoteListItem[],
  options: {
    topic: string;
    sortMode: SortMode;
  },
) {
  return items
    .filter((item) => matchesTopic(item.topicNames, options.topic))
    .sort((a, b) => compareBySortMode(a, b, options.sortMode));
}

export function filterAndSortExcerpts(
  items: ExcerptListItem[],
  options: {
    topic: string;
    sortMode: SortMode;
  },
) {
  return items
    .filter((item) => matchesTopic(item.topicNames, options.topic))
    .sort((a, b) => compareBySortMode(a, b, options.sortMode));
}

export function filterAndSortTasks(
  items: TaskListItem[],
  options: {
    topic: string;
    status: string;
    priority: string;
    sortMode: SortMode;
  },
) {
  return items
    .filter((item) => matchesTopic(item.topicNames, options.topic))
    .filter((item) => (options.status ? item.status === options.status : true))
    .filter((item) => (options.priority ? item.priority === options.priority : true))
    .sort((a, b) => compareBySortMode(a, b, options.sortMode));
}