export type ExcerptListItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceKind: string;
  previewText: string;
  note: string | null;
  citationText: string;
  pageLabel: string | null;
  topicNames: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchivedExcerptListItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  previewText: string;
  archivedAt: string;
  updatedAt: string;
};

export type ExcerptDetail = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceKind: string;
  excerptText: string;
  note: string | null;
  citationText: string;
  pageLabel: string | null;
  topicNames: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExcerptInput = {
  sourceId: string;
  excerptText: string;
  note?: string | null;
  pageLabel?: string | null;
};

export type UpdateExcerptInput = {
  excerptText: string;
  note?: string | null;
  pageLabel?: string | null;
};