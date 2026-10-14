import { invoke } from "@tauri-apps/api/core";
import type { WorkspaceBackupMeta } from "../types/backup";
import type {
  ArchivedExcerptListItem,
  CreateExcerptInput,
  ExcerptDetail,
  ExcerptListItem,
  UpdateExcerptInput,
} from "../types/excerpt";
import type {
  ArchivedNoteListItem,
  CreateNoteInput,
  NoteDetail,
  NoteListItem,
  UpdateNoteInput,
} from "../types/note";
import type { SearchResultItem } from "../types/search";
import type {
  ArchivedSourceListItem,
  CreateUrlSourceInput,
  ImportPdfSourceInput,
  SourceListItem,
  SourceTopicLinksDetail,
} from "../types/source";
import type { DatabaseStatus } from "../types/system";
import type {
  ArchivedTaskListItem,
  CreateTaskInput,
  TaskDetail,
  TaskListItem,
  UpdateTaskInput,
} from "../types/task";
import type { CreateTopicInput, TopicDetail, TopicListItem } from "../types/topic";

export async function getDatabaseStatus() {
  return invoke<DatabaseStatus>("get_database_status");
}

export async function listTopics() {
  return invoke<TopicListItem[]>("list_topics");
}

export async function getTopicDetail(topicId: string) {
  return invoke<TopicDetail>("get_topic_detail", {
    payload: { id: topicId },
  });
}

export async function createTopic(payload: CreateTopicInput) {
  return invoke<TopicListItem>("create_topic", { payload });
}

export async function listSources() {
  return invoke<SourceListItem[]>("list_sources");
}

export async function listArchivedSources() {
  return invoke<ArchivedSourceListItem[]>("list_archived_sources");
}

export async function getSourceTopicLinks(sourceId: string) {
  return invoke<SourceTopicLinksDetail>("get_source_topic_links", {
    payload: { sourceId },
  });
}

export async function addSourceToTopic(sourceId: string, topicId: string) {
  return invoke<SourceTopicLinksDetail>("add_source_to_topic", {
    payload: { sourceId, topicId },
  });
}

export async function removeSourceFromTopic(sourceId: string, topicId: string) {
  return invoke<SourceTopicLinksDetail>("remove_source_from_topic", {
    payload: { sourceId, topicId },
  });
}

export async function createUrlSource(payload: CreateUrlSourceInput) {
  return invoke<SourceListItem>("create_url_source", { payload });
}

export async function importPdfSource(payload: ImportPdfSourceInput) {
  return invoke<SourceListItem>("import_pdf_source", { payload });
}

export async function archiveSource(sourceId: string) {
  return invoke<void>("archive_source", {
    payload: { id: sourceId },
  });
}

export async function restoreSource(sourceId: string) {
  return invoke<void>("restore_source", {
    payload: { id: sourceId },
  });
}

export async function listNotes() {
  return invoke<NoteListItem[]>("list_notes");
}

export async function listArchivedNotes() {
  return invoke<ArchivedNoteListItem[]>("list_archived_notes");
}

export async function createNote(payload: CreateNoteInput) {
  return invoke<NoteListItem>("create_note", { payload });
}

export async function getNoteDetail(noteId: string) {
  return invoke<NoteDetail>("get_note_detail", {
    payload: { id: noteId },
  });
}

export async function updateNote(noteId: string, payload: UpdateNoteInput) {
  return invoke<NoteDetail>("update_note", {
    payload: {
      id: noteId,
      ...payload,
    },
  });
}

export async function archiveNote(noteId: string) {
  return invoke<void>("archive_note", {
    payload: { id: noteId },
  });
}

export async function restoreNote(noteId: string) {
  return invoke<void>("restore_note", {
    payload: { id: noteId },
  });
}

export async function listExcerpts() {
  return invoke<ExcerptListItem[]>("list_excerpts");
}

export async function listArchivedExcerpts() {
  return invoke<ArchivedExcerptListItem[]>("list_archived_excerpts");
}

export async function getExcerptDetail(excerptId: string) {
  return invoke<ExcerptDetail>("get_excerpt_detail", {
    payload: { id: excerptId },
  });
}

export async function createExcerpt(payload: CreateExcerptInput) {
  return invoke<ExcerptListItem>("create_excerpt", { payload });
}

export async function updateExcerpt(excerptId: string, payload: UpdateExcerptInput) {
  return invoke<ExcerptDetail>("update_excerpt", {
    payload: {
      id: excerptId,
      ...payload,
    },
  });
}

export async function archiveExcerpt(excerptId: string) {
  return invoke<void>("archive_excerpt", {
    payload: { id: excerptId },
  });
}

export async function restoreExcerpt(excerptId: string) {
  return invoke<void>("restore_excerpt", {
    payload: { id: excerptId },
  });
}

export async function listTasks() {
  return invoke<TaskListItem[]>("list_tasks");
}

export async function listArchivedTasks() {
  return invoke<ArchivedTaskListItem[]>("list_archived_tasks");
}

export async function getTaskDetail(taskId: string) {
  return invoke<TaskDetail>("get_task_detail", {
    payload: { id: taskId },
  });
}

export async function createTask(payload: CreateTaskInput) {
  return invoke<TaskListItem>("create_task", { payload });
}

export async function updateTask(taskId: string, payload: UpdateTaskInput) {
  return invoke<TaskDetail>("update_task", {
    payload: {
      id: taskId,
      ...payload,
    },
  });
}

export async function archiveTask(taskId: string) {
  return invoke<void>("archive_task", {
    payload: { id: taskId },
  });
}

export async function restoreTask(taskId: string) {
  return invoke<void>("restore_task", {
    payload: { id: taskId },
  });
}

export async function searchAll(query: string, limit = 8) {
  return invoke<SearchResultItem[]>("search_all", {
    payload: {
      query,
      limit,
    },
  });
}

export async function exportWorkspaceBackup() {
  return invoke<WorkspaceBackupMeta>("export_workspace_backup");
}

export async function importWorkspaceBackup(filePath: string) {
  return invoke<void>("import_workspace_backup", {
    payload: { filePath },
  });
}