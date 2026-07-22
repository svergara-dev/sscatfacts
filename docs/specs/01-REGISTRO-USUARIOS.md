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
| username | text | Alfanumérico, 3-30 caracteres, único en BD | Sí |
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
1. Encriptar la contraseña (bcrypt o similar)
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
- Contraseña hasheada con bcrypt (salt rounds >= 10)
- Rate limiting en endpoint de registro (máx 5 intentos/minuto por IP)
- Input sanitization contra inyección SQL

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
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

---

## API Contract

### POST `/api/auth/register`

**Request Body**:
```json
{
  "username": "string (required, 3-30 chars, alphanumeric)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "username": "string",
    "createdAt": "ISO8601 datetime"
  }
}
```

**Response 400**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "details": []
  }
}
```

**Response 409**:
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "El nombre de usuario ya está registrado"
  }
}
```

**Response 429**:
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
| Username con caracteres especiales | Error 400 "Username solo puede contener letras y números" |
| Intentos excedidos | Error 429 Rate Limit |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede registrar con username válido y contraseña >= 8 caracteres
- [ ] CA-02: Sistema rechaza username duplicado con error 409
- [ ] CA-03: Sistema rechaza contraseñas menores a 8 caracteres
- [ ] CA-04: Contraseña es encriptada antes de guardarse en BD
- [ ] CA-05: Registro exitoso retorna ID y datos del usuario
- [ ] CA-06: Rate limiting bloquea más de 5 intentos por minuto desde misma IP
- [ ] CA-07: Campos de entrada son sanitizados correctamente

---

## Historias de Usuario Relacionadas

### HU-01: Como usuario nuevo, quiero registrarme en la plataforma para poder acceder a funcionalidades de cat facts.

**Given** que el usuario está en la página de registro
**When** ingresa un username válido, contraseña >= 8 caracteres y confirma la contraseña
**Then** el sistema crea la cuenta y muestra mensaje de éxito

### HU-02: Como usuario nuevo, quiero que el sistema valide que mi username esté disponible

**Given** que el usuario está en la página de registro
**When** ingresa un username que ya existe en el sistema
**Then** el sistema muestra error "El nombre de usuario ya está en uso"

---

## Notas de Implementación

1. Usar validación tanto en frontend ( UX) como en backend (seguridad)
2. Considerar usar library de validación como `joi` o `zod`
3. Implementar logging de intentos de registro fallidos
4. Considerar CAPTCHA para prevenir registros automáticos
