import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { register } from '@/services/authService';
import type { ApiResponse, UserData } from '@/types/api';

vi.mock('@/services/authService');

const mockRegister = register as MockedFunction<typeof register>;

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
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('registers successfully and sets user', async () => {
    const userData: UserData = { id: 1, username: 'catlover' };
    const successResponse: ApiResponse<UserData> = { success: true, data: userData };
    mockRegister.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

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
    const errorResponse: ApiResponse<UserData> = {
      success: false,
      error: { code: 'USER_EXISTS', message: 'Username already taken' },
    };
    mockRegister.mockResolvedValue(errorResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.register('catlover', 'pass1234', 'pass1234');
      expect(success).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(errorResponse.error);
    });
    expect(result.current.user).toBeNull();
  });

  it('clears error on clearError', async () => {
    const errorResponse: ApiResponse<UserData> = {
      success: false,
      error: { code: 'USER_EXISTS', message: 'Username already taken' },
    };
    mockRegister.mockResolvedValue(errorResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

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

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
