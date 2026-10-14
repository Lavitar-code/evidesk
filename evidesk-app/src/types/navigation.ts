export type AppView =
  | { type: "inbox" }
  | { type: "sources" }
  | { type: "notes" }
  | { type: "tasks" }
  | { type: "search" }
  | { type: "topic"; topicId: string };