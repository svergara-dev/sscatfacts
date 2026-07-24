import { useState, useCallback } from 'react';
import { likeFact, unlikeFact } from '@/services/factsService';

export function useLike() {
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = useCallback(
    async (
      factId: number,
      currentLiked: boolean,
      onOptimisticUpdate: (liked: boolean, likesCount: number) => void,
      currentLikesCount: number,
    ) => {
      setIsLoading(true);

      const newLiked = !currentLiked;
      const newLikesCount = newLiked ? currentLikesCount + 1 : currentLikesCount - 1;

      onOptimisticUpdate(newLiked, newLikesCount);

      const response = newLiked ? await likeFact(factId) : await unlikeFact(factId);

      setIsLoading(false);

      if (response.success && response.data) {
        onOptimisticUpdate(response.data.liked, response.data.likesCount);
        return true;
      }

      onOptimisticUpdate(currentLiked, currentLikesCount);
      return false;
    },
    [],
  );

  return { isLoading, toggleLike };
}
