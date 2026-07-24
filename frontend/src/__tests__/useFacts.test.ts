import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFacts } from '@/hooks/useFacts';
import * as factsService from '@/services/factsService';

vi.mock('@/services/factsService');

describe('useFacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with null fact and no loading', () => {
    const { result } = renderHook(() => useFacts());

    expect(result.current.fact).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches random fact successfully', async () => {
    const mockFact = { id: 1, fact: 'Cats purr', length: 10, liked: false, likesCount: 0 };
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: true,
      data: mockFact,
    });

    const { result } = renderHook(() => useFacts());

    await act(async () => {
      await result.current.fetchRandom();
    });

    expect(result.current.fact).toEqual(mockFact);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets error on failure', async () => {
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: false,
      error: { code: 'EXTERNAL_API_ERROR', message: 'API unavailable' },
    });

    const { result } = renderHook(() => useFacts());

    await act(async () => {
      await result.current.fetchRandom();
    });

    expect(result.current.error).toBe('API unavailable');
    expect(result.current.fact).toBeNull();
  });

  it('updates fact like state', async () => {
    const mockFact = { id: 1, fact: 'Cats purr', length: 10, liked: false, likesCount: 0 };
    vi.mocked(factsService.getRandomFact).mockResolvedValue({
      success: true,
      data: mockFact,
    });

    const { result } = renderHook(() => useFacts());

    await act(async () => {
      await result.current.fetchRandom();
    });

    act(() => {
      result.current.updateFactLike(true, 1);
    });

    expect(result.current.fact?.liked).toBe(true);
    expect(result.current.fact?.likesCount).toBe(1);
  });
});
