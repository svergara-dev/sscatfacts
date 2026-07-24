import axios from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  FactData,
  FactLikeResponse,
  PaginatedFactsResponse,
  PaginationMeta,
  ListFactsParams,
} from '@/types/api';

export async function getRandomFact(): Promise<ApiResponse<FactData>> {
  try {
    const response = await apiClient.get<ApiResponse<FactData>>('/facts/random');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<FactData>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexion' },
    };
  }
}

export async function getFactsList(
  params: ListFactsParams = {},
): Promise<ApiResponse<PaginatedFactsResponse> & { meta?: PaginationMeta }> {
  try {
    const response = await apiClient.get<
      ApiResponse<PaginatedFactsResponse> & { meta?: PaginationMeta }
    >('/facts/list', { params });
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

export async function likeFact(factId: number): Promise<ApiResponse<FactLikeResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<FactLikeResponse>>(`/facts/${factId}/like`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<FactLikeResponse>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexion' },
    };
  }
}

export async function unlikeFact(factId: number): Promise<ApiResponse<FactLikeResponse>> {
  try {
    const response = await apiClient.delete<ApiResponse<FactLikeResponse>>(`/facts/${factId}/like`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<FactLikeResponse>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexion' },
    };
  }
}
