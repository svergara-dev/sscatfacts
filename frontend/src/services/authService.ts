import axios from 'axios';
import apiClient from './apiClient';
import type { ApiResponse, UserData, RegisterParams } from '@/types/api';

export async function register(params: RegisterParams): Promise<ApiResponse<UserData>> {
  try {
    const response = await apiClient.post<ApiResponse<UserData>>('/auth/register', {
      username: params.username,
      password: params.password,
      confirmPassword: params.confirmPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<UserData>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexión' },
    };
  }
}
