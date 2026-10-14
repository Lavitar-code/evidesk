export type NoteListItem = {
  id: string;
  title: string;
  contentPreview: string;
  topicNames: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ArchivedNoteListItem = {
  id: string;
  title: string;
  contentPreview: string;
  archivedAt: string;
  updatedAt: string;
};

export type NoteDetail = {
  id: string;
  title: string;
  markdownContent: string;
  topicNames: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  markdownContent: string;
  topicId?: string | null;
};

export type UpdateNoteInput = {
  title: string;
  markdownContent: string;
};