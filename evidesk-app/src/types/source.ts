export type SourceListItem = {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  description: string | null;
  topicNames: string;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ArchivedSourceListItem = {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  description: string | null;
  archivedAt: string;
  updatedAt: string;
};

export type SourceTopicLinkItem = {
  topicId: string;
  topicTitle: string;
  topicColor: string;
};

export type SourceTopicLinksDetail = {
  sourceId: string;
  topics: SourceTopicLinkItem[];
};

export type CreateUrlSourceInput = {
  url: string;
  title?: string | null;
  description?: string | null;
  topicId?: string | null;
};

export type ImportPdfSourceInput = {
  filePath: string;
  title?: string | null;
  description?: string | null;
  topicId?: string | null;
};