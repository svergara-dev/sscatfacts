import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RegisterForm } from '@/molecules/RegisterForm/RegisterForm';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  it('renders the form fields', () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows error for short username', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { name: 'username', value: 'ab' } });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { name: 'confirmPassword', value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid username characters', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'invalid-user!' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { name: 'confirmPassword', value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/letras, números y guiones bajos/i)).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { name: 'confirmPassword', value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { name: 'confirmPassword', value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('clears field error when user types', async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

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
    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { name: 'username', value: 'catlover123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { name: 'password', value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { name: 'confirmPassword', value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrando/i })).toBeDisabled();
    });
  });
});
