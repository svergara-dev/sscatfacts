import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { Button } from '@/atoms/Button/Button';
import { ErrorMessage } from '@/atoms/ErrorMessage/ErrorMessage';
import { FormField } from '@/molecules/FormField/FormField';

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    await login(formData.username, formData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

      {error && <ErrorMessage message={error.message} />}

      <FormField
        id="username"
        name="username"
        label="Username"
        value={formData.username}
        onChange={handleChange}
        error={fieldErrors.username}
        disabled={isLoading}
      />

      <FormField
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
        disabled={isLoading}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText="Iniciando sesión..."
        className="w-full"
      >
        Iniciar Sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
