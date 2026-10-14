import { useEffect, useState } from "react";
import { getTopicDetail } from "../../lib/tauri";
import type { TopicDetail } from "../../types/topic";

export function useTopicDetail(topicId: string | null) {
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoadingTopicDetail, setIsLoadingTopicDetail] = useState(false);
  const [topicDetailError, setTopicDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) {
      setTopicDetail(null);
      setTopicDetailError(null);
      setIsLoadingTopicDetail(false);
      return;
    }

    let isMounted = true;

    async function loadTopicDetail() {
      try {
        setIsLoadingTopicDetail(true);
        setTopicDetailError(null);

        const result = await getTopicDetail(topicId);

        if (isMounted) {
          setTopicDetail(result);
        }
      } catch (error) {
        if (isMounted) {
          setTopicDetail(null);
          setTopicDetailError(String(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingTopicDetail(false);
        }
      }
    }

    loadTopicDetail();

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  return {
    topicDetail,
    isLoadingTopicDetail,
    topicDetailError,
  };
}