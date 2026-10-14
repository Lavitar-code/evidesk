import { useCallback, useEffect, useState } from "react";
import {
  listArchivedExcerpts,
  listArchivedNotes,
  listArchivedSources,
  listArchivedTasks,
  restoreExcerpt,
  restoreNote,
  restoreSource,
  restoreTask,
} from "../../lib/tauri";
import type { ArchivedExcerptListItem } from "../../types/excerpt";
import type { ArchivedNoteListItem } from "../../types/note";
import type { ArchivedSourceListItem } from "../../types/source";
import type { ArchivedTaskListItem } from "../../types/task";

export function useArchive() {
  const [archivedSources, setArchivedSources] = useState<ArchivedSourceListItem[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<ArchivedNoteListItem[]>([]);
  const [archivedExcerpts, setArchivedExcerpts] = useState<ArchivedExcerptListItem[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTaskListItem[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(true);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const loadArchive = useCallback(async () => {
    try {
      setIsLoadingArchive(true);
      setArchiveError(null);

      const [sources, notes, excerpts, tasks] = await Promise.all([
        listArchivedSources(),
        listArchivedNotes(),
        listArchivedExcerpts(),
        listArchivedTasks(),
      ]);

      setArchivedSources(sources);
      setArchivedNotes(notes);
      setArchivedExcerpts(excerpts);
      setArchivedTasks(tasks);
    } catch (error) {
      setArchiveError(String(error));
    } finally {
      setIsLoadingArchive(false);
    }
  }, []);

  const restoreArchivedSource = useCallback(async (sourceId: string) => {
    await restoreSource(sourceId);
    setArchivedSources((current) => current.filter((item) => item.id !== sourceId));
  }, []);

  const restoreArchivedNote = useCallback(async (noteId: string) => {
    await restoreNote(noteId);
    setArchivedNotes((current) => current.filter((item) => item.id !== noteId));
  }, []);

  const restoreArchivedExcerpt = useCallback(async (excerptId: string) => {
    await restoreExcerpt(excerptId);
    setArchivedExcerpts((current) => current.filter((item) => item.id !== excerptId));
  }, []);

  const restoreArchivedTask = useCallback(async (taskId: string) => {
    await restoreTask(taskId);
    setArchivedTasks((current) => current.filter((item) => item.id !== taskId));
  }, []);

  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  return {
    archivedSources,
    archivedNotes,
    archivedExcerpts,
    archivedTasks,
    isLoadingArchive,
    archiveError,
    reloadArchive: loadArchive,
    restoreArchivedSource,
    restoreArchivedNote,
    restoreArchivedExcerpt,
    restoreArchivedTask,
  };
}