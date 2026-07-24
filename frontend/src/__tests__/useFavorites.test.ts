import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';
import * as favoritesService from '@/services/favoritesService';

vi.mock('@/services/favoritesService');

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with empty state', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.meta).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches favorites successfully', async () => {
    const mockFavorites = [
      { id: 1, fact: 'Cats purr', length: 10, likedAt: '2026-07-24T10:00:00Z' },
    ];
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: true,
      data: { facts: mockFavorites },
      meta: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
    });

    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.fetchFavorites(1);
    });

    expect(result.current.favorites).toEqual(mockFavorites);
    expect(result.current.meta?.totalItems).toBe(1);
  });

  it('sets error on failure', async () => {
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token invalido' },
    });

    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.fetchFavorites();
    });

    expect(result.current.error).toBe('Token invalido');
    expect(result.current.favorites).toEqual([]);
  });

  it('removes favorite from state', async () => {
    vi.mocked(favoritesService.getFavorites).mockResolvedValue({
      success: true,
      data: {
        facts: [
          { id: 1, fact: 'Cats purr', length: 10, likedAt: '2026-07-24T10:00:00Z' },
          { id: 2, fact: 'Cats knead', length: 11, likedAt: '2026-07-24T11:00:00Z' },
        ],
      },
      meta: { currentPage: 1, totalPages: 1, totalItems: 2, itemsPerPage: 10 },
    });

    vi.mocked(favoritesService.removeFavorite).mockResolvedValue({
      success: true,
      data: { message: 'Fact eliminado de favoritos' },
    });

    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.fetchFavorites(1);
    });

    await act(async () => {
      await result.current.remove(1);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].id).toBe(2);
  });
});
