import { render, screen } from '@testing-library/react';
import { AuthTemplate } from '@/templates/AuthTemplate/AuthTemplate';

describe('AuthTemplate', () => {
  it('renders children', () => {
    render(
      <AuthTemplate>
        <div>Contenido de prueba</div>
      </AuthTemplate>,
    );
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <AuthTemplate>
        <h1>Título</h1>
        <p>Párrafo</p>
      </AuthTemplate>,
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Párrafo')).toBeInTheDocument();
  });
});
