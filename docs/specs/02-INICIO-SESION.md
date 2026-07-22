# Especificación: Inicio de Sesión (Login)

## Resumen

Esta especificación define el módulo de autenticación que permite a los usuarios registrados acceder a la plataforma SSCatFacts mediante credenciales válidas.

## Contexto del Negocio

- **Módulo**: Autenticación - Login
- **Prioridad**: Alta (requisito fundamental para funcionalidades protegidas)
- **Puntuación**: 10 puntos

---

## Requisitos Funcionales

### RF-02-01: Formulario de Login

**Descripción**: El sistema debe presentar un formulario de inicio de sesión con los siguientes campos:

| Campo | Tipo | Validación | Obligatorio |
|-------|------|------------|-------------|
| username | text | Alfanumérico | Sí |
| password | password | Mínimo 8 caracteres | Sí |

### RF-02-02: Validación de Credenciales

**Descripción**: El sistema debe validar las credenciales contra la base de datos.

**Criterios de Validación**:
- Username debe existir en la tabla `users`
- Password hasheada debe coincidir con la almacenada
- Retornar error genérico por seguridad (no especificar si username o password es incorrecto)

### RF-02-03: Generación de Token JWT

**Descripción**: Al autenticar exitosamente, el sistema debe generar un token JWT con:
- **Payload**:
  ```json
  {
    "userId": "integer",
    "username": "string",
    "iat": "timestamp",
    "exp": "timestamp (24 horas)"
  }
  ```
- **Algoritmo**: HS256
- **Expiration**: 24 horas

### RF-02-04: Persistencia de Sesión

**Descripción**: El token JWT debe ser enviado al cliente y utilizado para todas las peticiones autenticadas.

### RF-02-05: Respuesta del Sistema

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "catlover123"
    }
  }
}
```

**Respuesta Error (401 Unauthorized)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciales incorrectas"
  }
}
```

---

## Requisitos No Funcionales

### Seguridad
- Rate limiting: máximo 5 intentos por minuto por IP
- Bloqueo temporal después de 5 intentos fallidos (15 minutos)
- Token JWT con secret key segura (almacenada en variables de entorno)
- HTTPS obligatorio en producción

### Rendimiento
- Tiempo de respuesta < 300ms para login
- Consulta optimizada a BD con índice en username

---

## Modelo de Datos

### Tabla: `users` (misma que registro)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `login_attempts` (opcional, para rate limiting)

```sql
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(30),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);
```

---

## API Contract

### POST `/api/auth/login`

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "token": "string (JWT)",
    "user": {
      "id": "integer",
      "username": "string"
    }
  }
}
```

**Response 401**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciales incorrectas"
  }
}
```

**Response 429**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiados intentos. Espere 15 minutos."
  }
}
```

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| Username no existe | Error 401 genérico |
| Password incorrecta | Error 401 genérico |
| Credenciales vacías | Error 400 campos requeridos |
| Token expirado | Error 401 "Token expirado" |
| Token inválido | Error 401 "Token inválido" |
| Intentos excedidos | Error 429 Rate Limit |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede iniciar sesión con credenciales válidas
- [ ] CA-02: Sistema retorna JWT token en respuesta exitosa
- [ ] CA-03: Sistema retorna error genérico para credenciales inválidas
- [ ] CA-04: Rate limiting bloquea después de 5 intentos fallidos
- [ ] CA-05: Token tiene expiración de 24 horas
- [ ] CA-06: Token se puede usar para acceder a rutas protegidas

---

## Historias de Usuario Relacionadas

### HU-03: Como usuario registrado, quiero iniciar sesión para acceder a funcionalidades protegidas.

**Alcance - Incluido:**
- Autenticación con username + password
- JWT token con expiración 24h
- Error genérico para credenciales inválidas
- Redirección a dashboard post-login

**Alcance - No incluido:**
- "Recordarme" (persistencia de sesión)
- Login con OAuth (Google, GitHub)
- Multi-device sessions
- Cambio de contraseña

**Given** que el usuario está en la página de login
**When** ingresa credenciales válidas
**Then** el sistema autentica y redirige al dashboard

### HU-04: Como usuario registrado, quiero que el sistema proteja mi cuenta con intentos limitados.

**Alcance - Incluido:**
- Límite de 5 intentos por minuto
- Bloqueo temporal de 15 minutos
- Mensaje de advertencia al acercarse al límite
- Reset del contador tras intento exitoso

**Alcance - No incluido:**
- Notificación por email de intentos sospechosos
- Bloqueo permanente
- Verificación por SMS
- Registro de IP del atacante

**Given** que un usuario intenta login con credenciales incorrectas
**When** supera 5 intentos en 1 minuto
**Then** el sistema bloquea temporalmente el acceso por 15 minutos

---

## Notas de Implementación

1. Usar middleware de verificación de JWT en todas las rutas protegidas
2. Implementar refresh token para sesiones largas (opcional)
3. Log de intentos de login fallidos para auditoría
4. Considerar integración con sistemas de SSO futuros
