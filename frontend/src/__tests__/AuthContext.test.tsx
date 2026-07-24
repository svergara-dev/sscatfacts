import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { register, login, getMe } from '@/services/authService';
import type { ApiResponse, UserData, LoginResponse } from '@/types/api';

vi.mock('@/services/authService');

const mockRegister = register as MockedFunction<typeof register>;
const mockLogin = login as MockedFunction<typeof login>;
const mockGetMe = getMe as MockedFunction<typeof getMe>;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockLogin.mockReset();
    mockGetMe.mockReset();
    localStorage.clear();
  });

  it('provides initial state', async () => {
    mockGetMe.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('register', () => {
    it('registers successfully and sets user', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const userData: UserData = { id: 1, username: 'catlover' };
      const successResponse: ApiResponse<UserData> = { success: true, data: userData };
      mockRegister.mockResolvedValue(successResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        const success = await result.current.register('catlover', 'pass1234', 'pass1234');
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(userData);
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles register error', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const errorResponse: ApiResponse<UserData> = {
        success: false,
        error: { code: 'USER_EXISTS', message: 'Username already taken' },
      };
      mockRegister.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        const success = await result.current.register('catlover', 'pass1234', 'pass1234');
        expect(success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(errorResponse.error);
      });
      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('logs in successfully and sets user', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const loginData: LoginResponse = {
        token: 'jwt.token.here',
        user: { id: 1, username: 'catlover' },
      };
      const successResponse: ApiResponse<LoginResponse> = { success: true, data: loginData };
      mockLogin.mockImplementation(async () => {
        localStorage.setItem('token', loginData.token);
        return successResponse;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        const success = await result.current.login('catlover', 'pass1234');
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(loginData.user);
      });
      expect(localStorage.getItem('token')).toBe('jwt.token.here');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles login error', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const errorResponse: ApiResponse<LoginResponse> = {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' },
      };
      mockLogin.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        const success = await result.current.login('catlover', 'wrong');
        expect(success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(errorResponse.error);
      });
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user and token', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const loginData: LoginResponse = {
        token: 'jwt.token.here',
        user: { id: 1, username: 'catlover' },
      };
      mockLogin.mockResolvedValue({ success: true, data: loginData });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        await result.current.login('catlover', 'pass1234');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(loginData.user);
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('session restoration', () => {
    it('restores user from token on mount', async () => {
      const userData: UserData = { id: 1, username: 'catlover' };
      mockGetMe.mockResolvedValue({ success: true, data: userData });
      localStorage.setItem('token', 'existing.token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      expect(result.current.user).toEqual(userData);
    });

    it('clears token if /me fails', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      localStorage.setItem('token', 'invalid.token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('clears token if /me throws', async () => {
      mockGetMe.mockRejectedValue(new Error('Network Error'));
      localStorage.setItem('token', 'invalid.token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('skips restoration if no token', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(mockGetMe).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('clears error on clearError', async () => {
      mockGetMe.mockResolvedValue({ success: false });
      const errorResponse: ApiResponse<UserData> = {
        success: false,
        error: { code: 'USER_EXISTS', message: 'Username already taken' },
      };
      mockRegister.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      await act(async () => {
        await result.current.register('catlover', 'pass1234', 'pass1234');
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
