import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as factsService from '@/services/factsService';
import apiClient from '@/services/apiClient';

vi.mock('@/services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('factsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomFact', () => {
    it('returns fact data on success', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: { id: 1, fact: 'Cats purr', length: 10, liked: false, likesCount: 0 },
        },
      });

      const result = await factsService.getRandomFact();

      expect(result.success).toBe(true);
      expect(result.data?.fact).toBe('Cats purr');
    });

    it('returns error on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const result = await factsService.getRandomFact();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
    });
  });

  describe('getFactsList', () => {
    it('returns paginated facts', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: { facts: [{ id: 1, fact: 'Test', length: 4, liked: false, likesCount: 0 }] },
          meta: { currentPage: 1, totalPages: 5, totalItems: 50, itemsPerPage: 10 },
        },
      });

      const result = await factsService.getFactsList({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
    });
  });

  describe('likeFact', () => {
    it('returns liked status on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: { liked: true, likesCount: 1 } },
      });

      const result = await factsService.likeFact(1);

      expect(result.success).toBe(true);
      expect(result.data?.liked).toBe(true);
    });
  });

  describe('unlikeFact', () => {
    it('returns unliked status on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true, data: { liked: false, likesCount: 0 } },
      });

      const result = await factsService.unlikeFact(1);

      expect(result.success).toBe(true);
      expect(result.data?.liked).toBe(false);
    });
  });
});
