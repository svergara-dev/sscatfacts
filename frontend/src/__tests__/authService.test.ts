import { vi, type MockedFunction } from 'vitest';
import { register, login, getMe } from '@/services/authService';
import apiClient from '@/services/apiClient';
import type { ApiResponse, UserData, LoginResponse } from '@/types/api';

vi.mock('@/services/apiClient');

const mockPost = apiClient.post as MockedFunction<typeof apiClient.post>;
const mockGet = apiClient.get as MockedFunction<typeof apiClient.get>;

describe('authService', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    localStorage.clear();
  });

  describe('register', () => {
    it('registers successfully', async () => {
      const userData: UserData = { id: 1, username: 'catlover' };
      const successResponse: ApiResponse<UserData> = { success: true, data: userData };
      mockPost.mockResolvedValue({ data: successResponse });

      const result = await register({
        username: 'catlover',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result).toEqual(successResponse);
      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        username: 'catlover',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });
    });

    it('handles API error response', async () => {
      const errorResponse: ApiResponse<UserData> = {
        success: false,
        error: { code: 'USER_EXISTS', message: 'Username already taken' },
      };

      const axiosError = {
        response: { data: errorResponse },
        isAxiosError: true,
        message: 'Request failed with status code 422',
      };

      mockPost.mockRejectedValue(axiosError);

      const result = await register({
        username: 'catlover',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result).toEqual(errorResponse);
    });

    it('handles network error', async () => {
      mockPost.mockRejectedValue(new Error('Network Error'));

      const result = await register({
        username: 'catlover',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      });

      expect(result).toEqual({
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Error de conexión' },
      });
    });
  });

  describe('login', () => {
    it('logs in successfully and stores token', async () => {
      const loginData: LoginResponse = {
        token: 'jwt.token.here',
        user: { id: 1, username: 'catlover' },
      };
      const successResponse: ApiResponse<LoginResponse> = { success: true, data: loginData };
      mockPost.mockResolvedValue({ data: successResponse });

      const result = await login({ username: 'catlover', password: 'pass1234' });

      expect(result).toEqual(successResponse);
      expect(localStorage.getItem('token')).toBe('jwt.token.here');
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        username: 'catlover',
        password: 'pass1234',
      });
    });

    it('handles invalid credentials', async () => {
      const errorResponse: ApiResponse<LoginResponse> = {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' },
      };

      const axiosError = {
        response: { data: errorResponse },
        isAxiosError: true,
        message: 'Request failed with status code 401',
      };

      mockPost.mockRejectedValue(axiosError);

      const result = await login({ username: 'catlover', password: 'wrong' });

      expect(result).toEqual(errorResponse);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles network error', async () => {
      mockPost.mockRejectedValue(new Error('Network Error'));

      const result = await login({ username: 'catlover', password: 'pass1234' });

      expect(result).toEqual({
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Error de conexión' },
      });
    });
  });

  describe('getMe', () => {
    it('returns user data for valid token', async () => {
      const userData: UserData = { id: 1, username: 'catlover' };
      const successResponse: ApiResponse<UserData> = { success: true, data: userData };
      mockGet.mockResolvedValue({ data: successResponse });

      const result = await getMe();

      expect(result).toEqual(successResponse);
      expect(mockGet).toHaveBeenCalledWith('/auth/me');
    });

    it('handles unauthorized (expired/invalid token)', async () => {
      const errorResponse: ApiResponse<UserData> = {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token inválido' },
      };

      const axiosError = {
        response: { data: errorResponse },
        isAxiosError: true,
        message: 'Request failed with status code 401',
      };

      mockGet.mockRejectedValue(axiosError);

      const result = await getMe();

      expect(result).toEqual(errorResponse);
    });

    it('handles network error', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'));

      const result = await getMe();

      expect(result).toEqual({
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Error de conexión' },
      });
    });
  });
});
