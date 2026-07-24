import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '@/atoms/ErrorMessage/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the message', () => {
    render(<ErrorMessage message="Algo salió mal" />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('renders details when provided', () => {
    render(
      <ErrorMessage
        message="Error de validación"
        details={[
          { field: 'username', message: 'Ya existe' },
          { field: 'email', message: 'Formato inválido' },
        ]}
      />,
    );

    expect(screen.getByText('Error de validación')).toBeInTheDocument();
    expect(screen.getByText('Ya existe')).toBeInTheDocument();
    expect(screen.getByText('Formato inválido')).toBeInTheDocument();
  });

  it('renders without details', () => {
    render(<ErrorMessage message="Error simple" />);
    expect(screen.getByText('Error simple')).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders empty details array', () => {
    render(<ErrorMessage message="Sin detalles" details={[]} />);
    expect(screen.getByText('Sin detalles')).toBeInTheDocument();
  });
});
