import { useEffect, useState } from "react";
import { searchAll } from "../../lib/tauri";
import type { SearchResultItem } from "../../types/search";

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearchError(null);
      setIsLoadingSearch(false);
      return;
    }

    let isMounted = true;

    const timeout = window.setTimeout(async () => {
      try {
        setIsLoadingSearch(true);
        setSearchError(null);

        const nextResults = await searchAll(trimmedQuery, 8);

        if (isMounted) {
          setResults(nextResults);
        }
      } catch (error) {
        if (isMounted) {
          setSearchError(String(error));
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSearch(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  return {
    results,
    isLoadingSearch,
    searchError,
  };
}