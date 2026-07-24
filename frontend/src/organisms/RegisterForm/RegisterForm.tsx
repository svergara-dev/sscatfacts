import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { Button } from '@/atoms/Button/Button';
import { ErrorMessage } from '@/atoms/ErrorMessage/ErrorMessage';
import { FormField } from '@/molecules/FormField/FormField';

export function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>(
    {},
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    await register(formData.username, formData.password, formData.confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Registro</h1>

      {error && <ErrorMessage message={error.message} details={error.details} />}

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

      <FormField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirmar Contraseña"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} loadingText="Registrando..." className="w-full">
        Registrarse
      </Button>
    </form>
  );
}
