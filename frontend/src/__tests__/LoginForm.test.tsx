import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '@/organisms/LoginForm/LoginForm';
import { login, getMe } from '@/services/authService';

vi.mock('@/services/authService');

const mockLogin = login as MockedFunction<typeof login>;
const mockGetMe = getMe as MockedFunction<typeof getMe>;

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockGetMe.mockReset();
    localStorage.clear();
  });

  it('renders the form fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByText(/¿no tienes cuenta\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /regístrate/i })).toHaveAttribute('href', '/register');
  });

  it('shows error when submitting empty form', async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials', async () => {
    mockLogin.mockResolvedValue(true);

    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'catlover123', password: 'password123' });
    });
  });

  it('shows error message on login failure', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' },
    });

    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument();
    });
  });

  it('clears field error when user types', async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'cat' },
    });

    await waitFor(() => {
      expect(screen.queryByText(/mínimo 3 caracteres/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();
    });
  });
});
