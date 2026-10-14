import { useMemo } from "react";
import type { TopicListItem } from "../types/topic";

export function useTopicFilterOptions(topics: TopicListItem[]) {
  return useMemo(() => {
    return [
      { value: "all", label: "All topics" },
      { value: "inbox", label: "Inbox only" },
      ...topics.map((topic) => ({
        value: topic.id,
        label: topic.title,
      })),
    ];
  }, [topics]);
}