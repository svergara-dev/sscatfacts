import axios from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  UserData,
  RegisterParams,
  LoginParams,
  LoginResponse,
} from '@/types/api';

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

export async function login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      username: params.username,
      password: params.password,
    });

    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<LoginResponse>;
    }
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Error de conexión' },
    };
  }
}

export async function getMe(): Promise<ApiResponse<UserData>> {
  try {
    const response = await apiClient.get<ApiResponse<UserData>>('/auth/me');
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
