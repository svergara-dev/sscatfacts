import { vi, type MockedFunction } from 'vitest';
import { register } from '@/services/authService';
import apiClient from '@/services/apiClient';
import type { ApiResponse, UserData } from '@/types/api';

vi.mock('@/services/apiClient');

const mockPost = apiClient.post as MockedFunction<typeof apiClient.post>;

describe('authService', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

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
