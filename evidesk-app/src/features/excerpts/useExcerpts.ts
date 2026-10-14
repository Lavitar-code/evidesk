import { useCallback, useEffect, useState } from "react";
import {
  archiveExcerpt,
  createExcerpt,
  getExcerptDetail,
  listExcerpts,
  updateExcerpt,
} from "../../lib/tauri";
import type {
  CreateExcerptInput,
  ExcerptDetail,
  ExcerptListItem,
  UpdateExcerptInput,
} from "../../types/excerpt";

export function useExcerpts() {
  const [excerpts, setExcerpts] = useState<ExcerptListItem[]>([]);
  const [isLoadingExcerpts, setIsLoadingExcerpts] = useState(true);
  const [excerptsError, setExcerptsError] = useState<string | null>(null);

  const loadExcerpts = useCallback(async () => {
    try {
      setIsLoadingExcerpts(true);
      setExcerptsError(null);

      const result = await listExcerpts();
      setExcerpts(result);
    } catch (error) {
      setExcerptsError(String(error));
    } finally {
      setIsLoadingExcerpts(false);
    }
  }, []);

  const createNewExcerpt = useCallback(async (payload: CreateExcerptInput) => {
    const createdExcerpt = await createExcerpt(payload);
    setExcerpts((current) => [createdExcerpt, ...current]);
    return createdExcerpt;
  }, []);

  const fetchExcerptDetail = useCallback(async (excerptId: string) => {
    return getExcerptDetail(excerptId);
  }, []);

  const updateExistingExcerpt = useCallback(
    async (excerptId: string, payload: UpdateExcerptInput) => {
      const updatedExcerpt = await updateExcerpt(excerptId, payload);

      setExcerpts((current) =>
        current.map((excerpt) =>
          excerpt.id === excerptId
            ? {
                ...excerpt,
                previewText:
                  updatedExcerpt.excerptText.length > 180
                    ? `${updatedExcerpt.excerptText.slice(0, 180)}...`
                    : updatedExcerpt.excerptText,
                note: updatedExcerpt.note,
                citationText: updatedExcerpt.citationText,
                pageLabel: updatedExcerpt.pageLabel,
                updatedAt: updatedExcerpt.updatedAt,
              }
            : excerpt,
        ),
      );

      return updatedExcerpt;
    },
    [],
  );

  const archiveExistingExcerpt = useCallback(async (excerptId: string) => {
    await archiveExcerpt(excerptId);
    setExcerpts((current) => current.filter((excerpt) => excerpt.id !== excerptId));
  }, []);

  useEffect(() => {
    loadExcerpts();
  }, [loadExcerpts]);

  return {
    excerpts,
    isLoadingExcerpts,
    excerptsError,
    reloadExcerpts: loadExcerpts,
    createNewExcerpt,
    fetchExcerptDetail,
    updateExistingExcerpt,
    archiveExistingExcerpt,
  };
}