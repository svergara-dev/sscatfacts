import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as favoritesService from '@/services/favoritesService';
import apiClient from '@/services/apiClient';

vi.mock('@/services/apiClient');

describe('favoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('returns favorites on success', async () => {
      const mockResponse = {
        success: true,
        data: {
          facts: [{ id: 1, fact: 'Cats purr', length: 10, likedAt: '2026-07-24T10:00:00Z' }],
        },
        meta: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await favoritesService.getFavorites({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.facts).toHaveLength(1);
    });

    it('returns error on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: {
          data: { success: false, error: { code: 'UNAUTHORIZED', message: 'Token invalido' } },
        },
      });

      const result = await favoritesService.getFavorites();

      expect(result.success).toBe(false);
    });
  });

  describe('removeFavorite', () => {
    it('removes favorite on success', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Fact eliminado de favoritos' },
      };
      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      const result = await favoritesService.removeFavorite(1);

      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue({
        response: {
          data: { success: false, error: { code: 'FAVORITE_NOT_FOUND', message: 'No encontrado' } },
        },
      });

      const result = await favoritesService.removeFavorite(1);

      expect(result.success).toBe(false);
    });
  });
});
