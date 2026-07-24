import { useState, useCallback } from 'react';
import { getRandomFact } from '@/services/factsService';
import type { FactData } from '@/types/api';

export function useFacts() {
  const [fact, setFact] = useState<FactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandom = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getRandomFact();

    setIsLoading(false);

    if (response.success && response.data) {
      setFact(response.data);
      return true;
    }

    if (response.error) {
      setError(response.error.message);
    }
    return false;
  }, []);

  const updateFactLike = useCallback((liked: boolean, likesCount: number) => {
    setFact((prev) => (prev ? { ...prev, liked, likesCount } : null));
  }, []);

  return { fact, isLoading, error, fetchRandom, updateFactLike };
}
