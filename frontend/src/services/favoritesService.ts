import axios from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  GetFavoritesParams,
  PaginatedFactsResponse,
  PaginationMeta,
} from '@/types/api';

export async function getFavorites(
  params: GetFavoritesParams = {},
): Promise<ApiResponse<PaginatedFactsResponse> & { meta?: PaginationMeta }> {
  try {
    const response = await apiClient.get<
      ApiResponse<PaginatedFactsResponse> & { meta?: PaginationMeta }
    >('/users/favorites', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<PaginatedFactsResponse> & {
        meta?: PaginationMeta;
      };
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexion' },
    };
  }
}

export async function removeFavorite(factId: number): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/users/favorites/${factId}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<{ message: string }>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexion' },
    };
  }
}
