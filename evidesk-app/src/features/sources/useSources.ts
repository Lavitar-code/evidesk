import { useCallback, useEffect, useState } from "react";
import {
  archiveSource,
  createUrlSource,
  importPdfSource,
  listSources,
} from "../../lib/tauri";
import type { CreateUrlSourceInput, ImportPdfSourceInput, SourceListItem } from "../../types/source";

export function useSources() {
  const [sources, setSources] = useState<SourceListItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  const reloadSources = useCallback(async () => {
    try {
      setIsLoadingSources(true);
      setSourcesError(null);
      const nextSources = await listSources();
      setSources(nextSources);
      return nextSources;
    } catch (error) {
      setSourcesError(String(error));
      throw error;
    } finally {
      setIsLoadingSources(false);
    }
  }, []);

  useEffect(() => {
    void reloadSources();
  }, [reloadSources]);

  const createNewUrlSource = useCallback(
    async (payload: CreateUrlSourceInput) => {
      const createdSource = await createUrlSource(payload);
      setSources((current) => [createdSource, ...current]);
      return createdSource;
    },
    [],
  );

  const importNewPdfSource = useCallback(
    async (payload: ImportPdfSourceInput) => {
      const createdSource = await importPdfSource(payload);
      setSources((current) => [createdSource, ...current]);
      return createdSource;
    },
    [],
  );

  const archiveExistingSource = useCallback(async (sourceId: string) => {
    await archiveSource(sourceId);
    setSources((current) => current.filter((source) => source.id !== sourceId));
  }, []);

  return {
    sources,
    isLoadingSources,
    sourcesError,
    reloadSources,
    createNewUrlSource,
    importNewPdfSource,
    archiveExistingSource,
  };
}