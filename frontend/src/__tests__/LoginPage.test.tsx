import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { getMe } from '@/services/authService';

vi.mock('@/services/authService');

const mockGetMe = getMe as MockedFunction<typeof getMe>;

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockGetMe.mockReset();
    mockGetMe.mockResolvedValue({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No autenticado' },
    });
    localStorage.clear();
  });

  it('renders the login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders inside AuthTemplate', () => {
    const { container } = renderWithProviders(<LoginPage />);

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });
});
