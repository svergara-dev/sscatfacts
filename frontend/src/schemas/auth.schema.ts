import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(30, 'Máximo 30 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30, 'Máximo 30 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
