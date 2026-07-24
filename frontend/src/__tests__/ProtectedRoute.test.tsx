import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getMe } from '@/services/authService';
import type { UserData } from '@/types/api';

vi.mock('@/services/authService');

const mockGetMe = getMe as MockedFunction<typeof getMe>;

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockGetMe.mockReset();
    localStorage.clear();
  });

  it('redirects to /login when not authenticated', async () => {
    mockGetMe.mockResolvedValue({ success: false });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
  });

  it('renders children when authenticated', async () => {
    const userData: UserData = { id: 1, username: 'catlover' };
    mockGetMe.mockResolvedValue({ success: true, data: userData });
    localStorage.setItem('token', 'valid.token');

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });
  });

  it('redirects to /login when no token', async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
  });
});
