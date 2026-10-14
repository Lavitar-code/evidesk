export type TopicListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  color: string | null;
  sourceCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TopicDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  color: string | null;
  sourceCount: number;
  noteCount: number;
  excerptCount: number;
  pdfCount: number;
  urlCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTopicInput = {
  title: string;
  description?: string | null;
  color?: string | null;
};