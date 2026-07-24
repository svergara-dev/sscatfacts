import { useState, useCallback } from 'react';
import { getFavorites, removeFavorite } from '@/services/favoritesService';
import type { FavoriteFactData, PaginationMeta } from '@/types/api';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteFactData[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);

    const response = await getFavorites({ page, limit });

    setIsLoading(false);

    if (response.success && response.data) {
      setFavorites(response.data.facts);
      if (response.meta) {
        setMeta(response.meta);
      }
      return true;
    }

    if (response.error) {
      setError(response.error.message);
    }
    return false;
  }, []);

  const remove = useCallback(async (factId: number) => {
    const response = await removeFavorite(factId);

    if (response.success) {
      setFavorites((prev) => prev.filter((f) => f.id !== factId));
      setMeta((prev) => (prev ? { ...prev, totalItems: prev.totalItems - 1 } : null));
      return true;
    }

    if (response.error) {
      setError(response.error.message);
    }
    return false;
  }, []);

  return { favorites, meta, isLoading, error, fetchFavorites, remove };
}
