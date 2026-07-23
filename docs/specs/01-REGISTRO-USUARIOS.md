# Especificación: Registro de Usuarios

## Resumen

Esta especificación define el módulo de registro de nuevos usuarios en la plataforma SSCatFacts. Permite a usuarios nuevos crear una cuenta válida para acceder a funcionalidades de consulta y marcado de cat facts.

## Contexto del Negocio

- **Módulo**: Autenticación - Registro
- **Prioridad**: Alta (requisito fundamental para acceso)
- **Puntuación**: 10 puntos

---

## Requisitos Funcionales

### RF-01-01: Formulario de Registro

**Descripción**: El sistema debe presentar un formulario de registro con los siguientes campos:

| Campo | Tipo | Validación | Obligatorio |
|-------|------|------------|-------------|
| username | text | Alfanumérico + guiones bajos (`_`), 3-30 caracteres, único en BD | Sí |
| password | password | Mínimo 8 caracteres | Sí |
| confirmPassword | password | Debe coincidir con password | Sí |

### RF-01-02: Validación de Username Único

**Descripción**: El sistema debe verificar que el username no exista previamente en la base de datos.

**Criterios de Validación**:
- Consulta a BD antes de insertar
- Retorna error 409 Conflict si el username ya existe
- Mensaje de error claro: "El nombre de usuario ya está en uso"

### RF-01-03: Validación de Contraseña

**Descripción**: El sistema debe validar que la contraseña cumpla con los requisitos de seguridad mínimos.

**Criterios**:
- Longitud mínima: 8 caracteres
- Mensaje de error si no cumple: "La contraseña debe tener al menos 8 caracteres"

### RF-01-04: Persistencia de Usuario

**Descripción**: Al registrar exitosamente, el sistema debe:
1. Encriptar la contraseña usando `bcrypt` via `has_secure_password` (genera `password_digest`)
2. Insertar el registro en la tabla `users`
3. Retornar respuesta exitosa con ID de usuario generado

### RF-01-05: Respuesta del Sistema

**Respuesta Exitosa (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "catlover123",
    "createdAt": "2026-07-20T10:30:00Z"
  }
}
```

**Respuesta Error (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El nombre de usuario ya está en uso"
  }
}
```

**Respuesta Error (409 Conflict)**:
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "El nombre de usuario ya está registrado"
  }
}
```

---

## Requisitos No Funcionales

### Seguridad
- Contraseña hasheada con `bcrypt` via `has_secure_password` (salt rounds >= 10)
- Rate limiting en endpoint de registro: máx 3 intentos/hora por IP (`rack-attack`)
- Input sanitization contra inyección SQL (ActiveRecord parameterized queries)

### Rendimiento
- Tiempo de respuesta < 500ms para registro
- Índice único en campo `username`

---

## Modelo de Datos

### Tabla: `users`

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_digest VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_username ON users(username);
```

---

## API Contract

### POST `/api/v1/auth/register`

**Request Body**:
```json
{
  "username": "string (required, 3-30 chars, alphanumeric + underscores)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "catlover123",
    "createdAt": "2026-07-20T10:30:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [
      {
        "field": "username",
        "message": "Ya existe un usuario con este nombre"
      }
    ]
  }
}
```

**Response 409 Conflict**:
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "El nombre de usuario ya está registrado"
  }
}
```

**Response 429 Too Many Requests**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiadas solicitudes. Intente más tarde."
  }
}
```

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| Username existente | Error 409 Conflict |
| Contraseña < 8 caracteres | Error 400 con mensaje específico |
| ConfirmPassword no coincide | Error 400 con mensaje "Las contraseñas no coinciden" |
| Campos vacíos | Error 400 con campos requeridos |
| Username con caracteres especiales | Error 400 "Username solo puede contener letras, números y guiones bajos" |
| Intentos excedidos | Error 429 Rate Limit |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede registrar con username válido (letras, números, guiones bajos) y contraseña >= 8 caracteres
- [ ] CA-02: Sistema rechaza username duplicado con error 409
- [ ] CA-03: Sistema rechaza contraseñas menores a 8 caracteres
- [ ] CA-04: Contraseña es encriptada con bcrypt (has_secure_password) antes de guardarse en BD
- [ ] CA-05: Registro exitoso retorna ID y datos del usuario (sin contraseña)
- [ ] CA-06: Rate limiting bloquea más de 3 intentos por hora desde misma IP
- [ ] CA-07: Campos de entrada son sanitizados correctamente

---

## Historias de Usuario Relacionadas

### HU-01: Como usuario nuevo, quiero registrarme en la plataforma para poder acceder a funcionalidades de cat facts.

**Alcance - Incluido:**
- Validación de username único
- Contraseña ≥ 8 caracteres
- Confirmación de contraseña
- Rate limiting (3 intentos/hora por IP)
- Respuesta con ID y datos del usuario (sin contraseña)

**Alcance - No incluido:**
- Recuperación de contraseña
- Verificación de email
- Perfil de usuario
- Login automático post-registro
- OAuth (Google, GitHub, etc.)

**Given** que el usuario está en la página de registro
**When** ingresa un username válido, contraseña >= 8 caracteres y confirma la contraseña
**Then** el sistema crea la cuenta y muestra mensaje de éxito

### HU-02: Como usuario nuevo, quiero que el sistema valide que mi username esté disponible

**Alcance - Incluido:**
- Validación al enviar formulario (submit)
- Mensaje de error claro si username ya existe
- HTTP 409 para conflicto

**Alcance - No incluido:**
- Sugerencias de usernames alternativos
- Validación de caracteres especiales
- Validación en tiempo real mientras el usuario escribe (debounce)

**Given** que el usuario está en la página de registro
**When** ingresa un username que ya existe en el sistema
**Then** el sistema muestra error "El nombre de usuario ya está en uso"

---

## Arquitectura (Clean Architecture)

Siguiendo la arquitectura definida en `06-ARQUITECTURA.md`, el registro se implementa en las siguientes capas:

### Backend (Ruby on Rails API)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 3: CONTROLLER                                                     │
│  app/controllers/api/v1/auth_controller.rb                              │
│  ├── register(): Extrae params, llama al Use Case, retorna JSON         │
│  └── NO contiene lógica de negocio                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 2: USE CASE                                                       │
│  app/use_cases/auth/register_user.rb                                    │
│  ├── execute(username, password): Orquesta el flujo completo            │
│  ├── Verifica username único (llama a Service)                          │
│  ├── Crea usuario (llama a Service)                                     │
│  └── Retorna resultado Success o Failure                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 1: SERVICE                                                        │
│  app/services/auth/auth_service.rb                                      │
│  ├── create_user(username, password): Persiste en BD                    │
│  ├── username_exists?(username): Consulta BD                            │
│  └── Independiente de HTTP, testeable con mocks                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 0: MODEL (Entity)                                                 │
│  app/models/user.rb                                                     │
│  ├── has_secure_password (bcrypt)                                       │
│  ├── validates :username, uniqueness, format, length                    │
│  └── Solo persistencia y validaciones                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend (React + TypeScript)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PAGES (rutas)                                                          │
│  src/pages/RegisterPage/RegisterPage.tsx                                │
│  └── Renderiza AuthTemplate + RegisterForm                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  MOLECULES (componentes compuestos)                                     │
│  src/molecules/RegisterForm/RegisterForm.tsx                            │
│  ├── Formulario con validación zod                                      │
│  ├── Llama a useAuth().register()                                       │
│  └── Muestra errores con toast notifications                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SERVICES (capa API)                                                    │
│  src/services/authService.ts                                            │
│  ├── register(username, password): POST /api/v1/auth/register           │
│  └── Usa apiClient (Axios instance con interceptores)                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  HOOKS                                                                  │
│  src/hooks/useAuth.ts                                                   │
│  ├── register(): Orquesta llamada + manejo de estado                    │
│  └── Retorna { register, isLoading, error }                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Validación de Inputs (zod)

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

### Modelo de Datos (ActiveRecord)

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  validates :username,
    presence: true,
    uniqueness: true,
    length: { minimum: 3, maximum: 30 },
    format: { with: /\A[a-zA-Z0-9_]+\z/, message: "solo puede contener letras, números y guiones bajos" }
end
```

### Rate Limiting (rack-attack)

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle("registration attempts by ip", limit: 3, period: 1.hour) do |req|
  req.ip if req.path == '/api/v1/auth/register' && req.post?
end
```

---

## Notas de Implementación

1. Usar validación tanto en frontend (`zod`) como en backend (ActiveRecord validates) — ver `06-ARQUITECTURA.md`
2. `has_secure_password` gestiona el hashing con bcrypt y la comparación automática
3. Implementar logging de intentos de registro fallidos (`Rails.logger.info`)
4. El endpoint es `/api/v1/auth/register` (versionado, consistente con arquitectura)
5. Respuestas JSON siguen el formato estándar definido en `06-ARQUITECTURA.md`
6. Seguir principios SOLID y Clean Architecture definidos en `07-CALIDAD-DESARROLLO.md`
7. Tests con RSpec + FactoryBot (backend) y Jest + React Testing Library (frontend)
