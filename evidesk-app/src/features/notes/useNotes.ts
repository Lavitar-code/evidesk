import { useCallback, useEffect, useState } from "react";
import {
  archiveNote,
  createNote,
  getNoteDetail,
  listNotes,
  updateNote,
} from "../../lib/tauri";
import type {
  CreateNoteInput,
  NoteDetail,
  NoteListItem,
  UpdateNoteInput,
} from "../../types/note";

export function useNotes() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setIsLoadingNotes(true);
      setNotesError(null);

      const result = await listNotes();
      setNotes(result);
    } catch (error) {
      setNotesError(String(error));
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  const createNewNote = useCallback(async (payload: CreateNoteInput) => {
    const createdNote = await createNote(payload);
    setNotes((current) => [createdNote, ...current]);
    return createdNote;
  }, []);

  const fetchNoteDetail = useCallback(async (noteId: string) => {
    return getNoteDetail(noteId);
  }, []);

  const updateExistingNote = useCallback(async (noteId: string, payload: UpdateNoteInput) => {
    const updatedNote = await updateNote(noteId, payload);

    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: updatedNote.title,
              contentPreview:
                updatedNote.markdownContent.length > 180
                  ? `${updatedNote.markdownContent.slice(0, 180)}...`
                  : updatedNote.markdownContent,
              updatedAt: updatedNote.updatedAt,
            }
          : note,
      ),
    );

    return updatedNote;
  }, []);

  const archiveExistingNote = useCallback(async (noteId: string) => {
    await archiveNote(noteId);
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    notes,
    isLoadingNotes,
    notesError,
    reloadNotes: loadNotes,
    createNewNote,
    fetchNoteDetail,
    updateExistingNote,
    archiveExistingNote,
  };
}