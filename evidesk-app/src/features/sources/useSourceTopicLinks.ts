import { useCallback, useEffect, useState } from "react";
import { addSourceToTopic, getSourceTopicLinks, removeSourceFromTopic } from "../../lib/tauri";
import type { SourceTopicLinksDetail } from "../../types/source";

export function useSourceTopicLinks(sourceId: string | null) {
  const [detail, setDetail] = useState<SourceTopicLinksDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const reload = useCallback(async () => {
    if (!sourceId) {
      setDetail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextDetail = await getSourceTopicLinks(sourceId);
      setDetail(nextDetail);
    } catch (loadError) {
      setDetail(null);
      setError(String(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);

  const linkTopic = useCallback(
    async (topicId: string) => {
      if (!sourceId) return;

      try {
        setIsMutating(true);
        setError(null);
        const nextDetail = await addSourceToTopic(sourceId, topicId);
        setDetail(nextDetail);
      } catch (mutationError) {
        setError(String(mutationError));
        throw mutationError;
      } finally {
        setIsMutating(false);
      }
    },
    [sourceId],
  );

  const unlinkTopic = useCallback(
    async (topicId: string) => {
      if (!sourceId) return;

      try {
        setIsMutating(true);
        setError(null);
        const nextDetail = await removeSourceFromTopic(sourceId, topicId);
        setDetail(nextDetail);
      } catch (mutationError) {
        setError(String(mutationError));
        throw mutationError;
      } finally {
        setIsMutating(false);
      }
    },
    [sourceId],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    detail,
    isLoading,
    error,
    isMutating,
    reload,
    linkTopic,
    unlinkTopic,
  };
}