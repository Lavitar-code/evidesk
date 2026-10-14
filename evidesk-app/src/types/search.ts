export type SearchResultItem = {
  id: string;
  entityType: "topic" | "source" | "note";
  title: string;
  subtitle: string | null;
  snippet: string | null;
  matchedField: string;
  updatedAt: string;
};