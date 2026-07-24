import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLike } from '@/hooks/useLike';
import * as factsService from '@/services/factsService';

vi.mock('@/services/factsService');

describe('useLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with isLoading false', () => {
    const { result } = renderHook(() => useLike());

    expect(result.current.isLoading).toBe(false);
  });

  it('calls likeFact and updates optimistically on like', async () => {
    vi.mocked(factsService.likeFact).mockResolvedValue({
      success: true,
      data: { liked: true, likesCount: 1 },
    });

    const { result } = renderHook(() => useLike());
    const onOptimisticUpdate = vi.fn();

    await act(async () => {
      await result.current.toggleLike(1, false, onOptimisticUpdate, 0);
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith(true, 1);
    expect(onOptimisticUpdate).toHaveBeenCalledWith(true, 1);
  });

  it('calls unlikeFact on unlike', async () => {
    vi.mocked(factsService.unlikeFact).mockResolvedValue({
      success: true,
      data: { liked: false, likesCount: 0 },
    });

    const { result } = renderHook(() => useLike());
    const onOptimisticUpdate = vi.fn();

    await act(async () => {
      await result.current.toggleLike(1, true, onOptimisticUpdate, 1);
    });

    expect(factsService.unlikeFact).toHaveBeenCalledWith(1);
    expect(onOptimisticUpdate).toHaveBeenCalledWith(false, 0);
  });

  it('reverts optimistic update on failure', async () => {
    vi.mocked(factsService.likeFact).mockResolvedValue({
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error' },
    });

    const { result } = renderHook(() => useLike());
    const onOptimisticUpdate = vi.fn();

    await act(async () => {
      await result.current.toggleLike(1, false, onOptimisticUpdate, 0);
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith(false, 0);
  });
});
