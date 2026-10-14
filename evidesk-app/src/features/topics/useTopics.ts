import { useCallback, useEffect, useState } from "react";
import { createTopic, listTopics } from "../../lib/tauri";
import type { CreateTopicInput, TopicListItem } from "../../types/topic";

export function useTopics() {
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setIsLoadingTopics(true);
      setTopicsError(null);

      const result = await listTopics();
      setTopics(result);
    } catch (error) {
      setTopicsError(String(error));
    } finally {
      setIsLoadingTopics(false);
    }
  }, []);

  const createNewTopic = useCallback(async (payload: CreateTopicInput) => {
    const createdTopic = await createTopic(payload);

    setTopics((current) => [createdTopic, ...current]);
    return createdTopic;
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  return {
    topics,
    isLoadingTopics,
    topicsError,
    reloadTopics: loadTopics,
    createNewTopic,
  };
}