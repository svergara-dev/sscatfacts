# Especificaciones Funcionales - SSCatFacts

## Índice de Documentos

Este directorio contiene las especificaciones detalladas para cada requerimiento funcional y no funcional del desafío técnico de la plataforma SSCatFacts.

---

## Requerimientos Funcionales (50 pts)

| # | Documento | Requerimiento | Puntos |
|---|-----------|---------------|--------|
| 1 | [01-REGISTRO-USUARIOS.md](./01-REGISTRO-USUARIOS.md) | Los usuarios deben poder registrarse en la plataforma | 10 pts |
| 2 | [02-INICIO-SESION.md](./02-INICIO-SESION.md) | Los usuarios registrados deben poder ingresar a la plataforma | 10 pts |
| 3 | [03-CONSULTAR-MARCAR-FACTS.md](./03-CONSULTAR-MARCAR-FACTS.md) | Los usuarios ingresados pueden consultar y marcar un cat Fact para indicar que les gusta | 10 pts |
| 4 | [04-LISTA-FACTS-GUSTADOS.md](./04-LISTA-FACTS-GUSTADOS.md) | Los usuarios ingresados deben poder ver una lista de los cat Facts que les ha gustado | 10 pts |
| 5 | [05-FACTS-POPULARES.md](./05-FACTS-POPULARES.md) | Los usuarios ingresados deben poder visualizar los cat Facts más populares de la comunidad | 10 pts |

**Total Funcional**: 50 puntos

---

## Requerimientos No Funcionales (100 pts)

### Arquitectura y Servicios (40 pts)

| # | Documento | Requerimiento | Puntos |
|---|-----------|---------------|--------|
| 6 | [06-ARQUITECTURA.md](./06-ARQUITECTURA.md) | Desacople frontend/backend + Arquitectura del sistema | 40 pts |

### Calidad de Desarrollo (50 pts)

| # | Documento | Requerimiento | Puntos |
|---|-----------|---------------|--------|
| 7 | [07-CALIDAD-DESARROLLO.md](./07-CALIDAD-DESARROLLO.md) | SOLID, Tests, Linters, Buenas prácticas Git | 50 pts |

### Bonus (45 pts)

| # | Documento | Requerimiento | Puntos |
|---|-----------|---------------|--------|
| 8 | [08-BONUS.md](./08-BONUS.md) | Docker, 2FA, CI/CD, Deploy, Tailwind CSS | 45 pts |

### Documentación UML (10 pts)

| # | Documento | Requerimiento | Puntos |
|---|-----------|---------------|--------|
| 9 | [09-UML.md](./09-UML.md) | Diagramas UML del sistema | 10 pts |

**Total No Funcional**: 100 puntos

---

## Resumen de Especificaciones

### 1. Registro de Usuarios
- Formulario con username (único) y contraseña (mínimo 8 caracteres)
- Validación de disponibilidad de username
- Encriptación de contraseña con bcrypt
- Rate limiting para prevenir registros masivos

### 2. Inicio de Sesión
- Autenticación con credenciales
- Generación de tokens JWT (24 horas de expiración)
- Rate limiting (5 intentos/minuto)
- Bloqueo temporal después de 5 intentos fallidos

### 3. Consultar y Marcar Cat Facts
- Consumo de API externa: https://catfact.ninja/
- Sistema de likes/unlikes
- Prevención de likes duplicados
- Manejo de errores de API externa

### 4. Lista de Cat Facts Gustados
- Historial de favoritos del usuario
- Paginación de resultados
- Eliminación de favoritos
- Conteo total de favoritos

### 5. Cat Facts Más Populares
- Ranking global de facts por likes
- Filtros por período (semana, mes, todo)
- Top N facts destacados
- Cache para optimización de rendimiento

### 6. Arquitectura del Sistema
- Desacople frontend-backend vía API REST
- Comunicación con JWT tokens
- CORS configurado
- Versionado de API (v1)
- Despliegue independiente

### 7. Calidad de Desarrollo
- Principios SOLID aplicados
- Testing: RSpec (backend), Jest (frontend)
- Coverage mínimo: 80%
- Linters: RuboCop (backend), ESLint + Prettier (frontend)
- Git Flow con Convencional Commits

### 8. Funcionalidades Bonus
- Docker + Docker Compose para desarrollo local
- Autenticación 2FA (TOTP)
- CI/CD con GitHub Actions
- Deploy en AWS (S3, CloudFront, ECS, RDS)
- Tailwind CSS para estilos

### 9. Documentación UML
- Diagramas de Secuencia
- Diagrama de Despliegue
- Diagrama Entidad-Relación
- Diagrama de Componentes
- Diagrama de Casos de Uso

---

## Mapa de Relaciones entre Specs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DEL SISTEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │  USUARIO    │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ESPEC FUNCIONALES (01-05)                        │   │
│  │                                                                     │   │
│  │  01-Registro ──▶ 02-Login ──▶ 03-Facts ──▶ 04-Favoritos           │   │
│  │                      │              │              │                │   │
│  │                      │              └──────────────┼──────────────▶ │   │
│  │                      │                             │  05-Populares │   │
│  │                      │                             │                │   │
│  └──────────────────────┼─────────────────────────────┼────────────────┘   │
│                         │                             │                      │
│                         ▼                             ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ESPEC NO FUNCIONALES                             │   │
│  │                                                                     │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │   │
│  │  │ 06-Arquitectura│  │ 07-Calidad  │    │   09-UML    │            │   │
│  │  │  (CÓMO se    │   │ (CÓMO se    │    │ (Cómo se    │            │   │
│  │  │  estructura) │   │  escribe)   │    │  ve)        │            │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘            │   │
│  │                                                                     │   │
│  │  ┌─────────────┐                                                   │   │
│  │  │  08-Bonus   │  ◄── Funcionalidades adicionales                 │   │
│  │  └─────────────┘                                                   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ¿Qué spec consultar según tu necesidad?

| Necesidad | Spec Principal | Specs Relacionadas |
|-----------|----------------|-------------------|
| ¿Cómo funciona el registro? | 01-REGISTRO-USUARIOS | 02, 07 |
| ¿Cómo funciona el login? | 02-INICIO-SESION | 01, 07, 08 (rate limiting) |
| ¿Cómo se consultan los facts? | 03-CONSULTAR-MARCAR-FACTS | 04, 05, 06 (API externa) |
| ¿Cómo se guardan favoritos? | 04-LISTA-FACTS-GUSTADOS | 03, 05 |
| ¿Cómo se ven populares? | 05-FACTS-POPULARES | 03, 04 |
| ¿Cómo está estructurado el sistema? | 06-ARQUITECTURA | 07, 09 |
| ¿Qué patrones usar? | 06-ARQUITECTURA + 07-CALIDAD | Todas |
| ¿Cómo configurar Docker? | 08-BONUS | 06 |
| ¿Cómo son los diagramas? | 09-UML | 06 |

---

## Glosario de Términos

### Abreviaturas

| Abreviatura | Significado |
|-------------|-------------|
| **RF** | Requerimiento Funcional |
| **NF** | Requerimiento No Funcional |
| **BD** | Base de Datos |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token |
| **CORS** | Cross-Origin Resource Sharing |
| **2FA** | Two-Factor Authentication (Autenticación en Dos Pasos) |
| **TOTP** | Time-based One-Time Password |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **CDN** | Content Delivery Network |
| **RDS** | Relational Database Service (AWS) |
| **ECS** | Elastic Container Service (AWS) |
| **PK** | Primary Key (Clave Primaria) |
| **FK** | Foreign Key (Clave Foránea) |

### Términos del Dominio

| Término | Definición | Spec de Referencia |
|---------|------------|-------------------|
| **Cat Fact** | Un dato o curiosidad sobre gatos obtenido de la API externa | 03-CONSULTAR-MARCAR-FACTS |
| **Like** | Acción de marcar un fact como "me gusta" | 03-CONSULTAR-MARCAR-FACTS |
| **Favorito** | Un fact que el usuario ha marcado con like | 04-LISTA-FACTS-GUSTADOS |
| **Popular** | Un fact con más likes de la comunidad | 05-FACTS-POPULARES |
| **API Externa** | catfact.ninja (fuente de facts) | 03-CONSULTAR-MARCAR-FACTS |
| **Backend** | Servidor API (Ruby on Rails) | 06-ARQUITECTURA |
| **Frontend** | Aplicación de usuario (React + TypeScript) | 06-ARQUITECTURA |
| **Token** | JWT generado en login para autenticación | 02-INICIO-SESION |

### Técnicos

| Término | Definición | Spec de Referencia |
|---------|------------|-------------------|
| **Atomic Design** | Patrón de organización de componentes por complejidad | 06-ARQUITECTURA, 07-CALIDAD |
| **Clean Architecture** | Arquitectura por capas con separación de dependencias | 06-ARQUITECTURA, 07-CALIDAD |
| **Service Object** | Patrón para encapsular lógica de negocio | 07-CALIDAD |
| **Circuit Breaker** | Patrón para resiliencia con servicios externos | 07-CALIDAD |
| **Optimistic Update** | Actualización de UI antes de confirmar con backend | 07-CALIDAD |
| **Rate Limiting** | Limitación de peticiones por tiempo | 02-INICIO-SESION |
| **Git Flow** | Convención de ramas para desarrollo | 07-CALIDAD |
| **Conventional Commits** | Convención de mensajes de commit | 07-CALIDAD |

---

## Fuentes de Verdad por Funcionalidad

### ¿Dónde está definido cada concepto?

| Funcionalidad | Definición Principal | Endpoints | Spec Completa |
|---------------|---------------------|-----------|---------------|
| **Registro** | `01-REGISTRO-USUARIOS.md` | POST `/api/v1/auth/register` | RF-01-01 a RF-01-05 |
| **Login** | `02-INICIO-SESION.md` | POST `/api/v1/auth/login` | RF-02-01 a RF-02-05 |
| **Fact Aleatorio** | `03-CONSULTAR-MARCAR-FACTS.md` | GET `/api/v1/facts/random` | RF-03-01 |
| **Like/Unlike** | `03-CONSULTAR-MARCAR-FACTS.md` | POST/DELETE `/api/v1/facts/:id/like` | RF-03-02, RF-03-03 |
| **Lista Facts** | `03-CONSULTAR-MARCAR-FACTS.md` | GET `/api/v1/facts/list` | RF-03-06 |
| **Favoritos** | `04-LISTA-FACTS-GUSTADOS.md` | GET `/api/v1/users/favorites` | RF-04-01 a RF-04-04 |
| **Populares** | `05-FACTS-POPULARES.md` | GET `/api/v1/facts/popular` | RF-05-01 a RF-05-05 |
| **Top N** | `05-FACTS-POPULARES.md` | GET `/api/v1/facts/top/:n` | RF-05-04 |

### ¿Qué spec consultar según el componente?

| Componente | Spec Principal | Contenido |
|------------|----------------|-----------|
| **Models** | Specs 01-05 | Tablas, relaciones, índices |
| **Controllers** | Specs 01-05 | Endpoints, request/response |
| **Services** | Spec 06, 07 | Clean Architecture, Service Objects |
| **Components (FE)** | Spec 06 | Atomic Design, estructura |
| **Hooks (FE)** | Spec 06, 07 | Custom Hooks, Optimistic Updates |
| **Testing** | Spec 07 | RSpec, Jest, coverage |
| **Linters** | Spec 07 | RuboCop, ESLint, Prettier |
| **Git** | Spec 07 | Git Flow, Conventional Commits |
| **Docker** | Spec 08 | docker-compose.yml |
| **CI/CD** | Spec 08 | GitHub Actions |
| **Deploy** | Spec 08 | AWS architecture |
| **UML** | Spec 09 | 5 diagramas |

---

## Modelo de Datos Consolidado

### Entidades Principales

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   cat_facts     │       │   user_likes    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ username (UNIQUE)│       │ fact_text       │       │ user_id (FK)    │
│ password_hash   │       │ length          │       │ fact_id (FK)    │
│ created_at      │       │ api_fact_id     │       │ created_at      │
│ updated_at      │       │ created_at      │       └─────────────────┘
└─────────────────┘       └─────────────────┘
                                    │
                                    │
                          ┌─────────────────┐
                          │ login_attempts  │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ ip_address      │
                          │ username        │
                          │ attempted_at    │
                          │ success         │
                          └─────────────────┘
```

---

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |

### Cat Facts

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/facts/random` | Obtener fact aleatorio | Sí |
| GET | `/api/facts/list` | Listar facts paginados | Sí |
| POST | `/api/facts/:id/like` | Dar like a fact | Sí |
| DELETE | `/api/facts/:id/like` | Quitar like | Sí |
| GET | `/api/facts/popular` | Facts más populares | Sí |
| GET | `/api/facts/top/:n` | Top N facts | Sí |

### Usuario

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/users/favorites` | Lista de favoritos | Sí |
| DELETE | `/api/users/favorites/:factId` | Eliminar de favoritos | Sí |

---

## Criterios de Aceptación Consolidados

### Módulo Autenticación (RF-01, RF-02)
- [ ] Usuario puede registrar con username válido y contraseña >= 8 caracteres
- [ ] Sistema rechaza username duplicado con error 409
- [ ] Sistema rechaza contraseñas menores a 8 caracteres
- [ ] Contraseña es encriptada antes de guardarse en BD
- [ ] Registro exitoso retorna ID y datos del usuario
- [ ] Usuario puede iniciar sesión con credenciales válidas
- [ ] Sistema retorna JWT token en respuesta exitosa
- [ ] Rate limiting bloquea después de 5 intentos fallidos

### Módulo Cat Facts (RF-03, RF-04, RF-05)
- [ ] Usuario puede obtener un cat fact aleatorio de la API externa
- [ ] Usuario puede marcar un fact como favorito
- [ ] Sistema previene likes duplicados
- [ ] Usuario puede desmarcar un fact
- [ ] El estado del like se muestra correctamente
- [ ] Usuario puede ver lista de sus facts favoritos
- [ ] Lista muestra facts ordenados por fecha (más reciente primero)
- [ ] Paginación funciona correctamente
- [ ] Usuario puede ver ranking de facts más populares
- [ ] Filtro por período funciona correctamente
- [ ] Se muestra si el usuario actual dio like a cada fact
- [ ] Usuario puede listar múltiples facts paginados desde API externa
- [ ] Se muestra indicador de carga durante consulta a API externa

### Módulo Arquitectura (Spec 06)
- [ ] Frontend y backend son desplegados independientemente
- [ ] Comunicación vía HTTP/HTTPS con JSON
- [ ] API documentada con OpenAPI/Swagger
- [ ] CORS configurado correctamente
- [ ] Versionado de API implementado (v1)
- [ ] JWT funciona para autenticación

### Módulo Calidad (Spec 07)
- [ ] Principios SOLID aplicados en el código
- [ ] Tests unitarios con 80% cobertura mínimo
- [ ] RuboCop y ESLint configurados sin ofensas
- [ ] Git Flow implementado
- [ ] Commits siguen Convencional Commits

### Módulo Bonus (Spec 08)
- [ ] Docker Compose levanta todos los servicios
- [ ] 2FA funciona con códigos TOTP
- [ ] CI/CD ejecuta tests y linters en cada PR
- [ ] Deploy automático a producción
- [ ] Tailwind CSS configurado y funcionando

### Módulo UML (Spec 09)
- [ ] Diagramas de Secuencia documentados
- [ ] Diagrama de Despliegue completo
- [ ] Diagrama Entidad-Relación actualizado
- [ ] Diagrama de Componentes documentado
- [ ] Diagrama de Casos de Uso incluido

---

## Notas de Implementación

### Backend - Ruby on Rails

- **API Mode**: Configurar Rails en modo API para servir JSON
- **Autenticación**: Usar `devise` con `devise-jwt` para autenticación JWT
- **Serialización**: Usar `active_model_serializers` o `jsonapi-serializer`
- **Rate Limiting**: Implementar con `rack-attack` y Redis
- **Background Jobs**: Usar `Sidekiq` con Redis para tareas asíncronas
- **External API**: Consumir con `faraday` o `httparty`
- **Testing**: RSpec con FactoryBot

### Frontend - React + TypeScript

- **State Management**: Redux Toolkit o Zustand
- **HTTP Client**: Axios con interceptores para JWT
- **UI Components**: Tailwind CSS (bonus) o Material UI
- **Form Validation**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

### Base de Datos - PostgreSQL

- **Migrations**: Usar ActiveRecord migrations de Rails
- **Índices**: Crear índices en foreign keys y campos de búsqueda
- **Seeders**: Desarrollar seeds para datos de prueba
- **Backups**: Configurar pg_dump automático

### Cache - Redis

- **Sesiones**: Almacenar sesiones de usuario en Redis
- **Rate Limiting**: Implementar contador de intentos en Redis
- **Cache de API**: Cachear respuestas de API externa (TTL: 5 min)
- **Cola de Trabajos**: Sidekiq para procesamiento asíncrono

### AWS (Producción)

- **EC2**: Servidores backend Rails
- **RDS**: PostgreSQL administrado
- **ElastiCache**: Redis administrado
- **S3**: Almacenamiento de assets estáticos
- **CloudFront**: CDN para frontend
- **Route 53**: DNS management

### Docker + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/sscatfacts
      REDIS_URL: redis://redis:6379

  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Seguridad

- Contraseñas hasheadas con bcrypt (via Devise)
- JWT con expiración de 24 horas y refresh token
- Rate limiting con `rack-attack` y Redis
- Input sanitization con ActiveRecord (SQL injection prevention)
- HTTPS obligatorio en producción (AWS Certificate Manager)
- CORS configurado para dominios permitidos
- Environment variables para secrets (no hardcodear)

### Rendimiento

- Índices optimizados en tablas principales (users, cat_facts, user_likes)
- Cache de Top 10 con Redis (TTL: 5 minutos)
- Consultas paginadas por defecto (máx 50 elementos)
- Circuit breaker para API externa (usar `semian` o implementación custom)
- N+1 query prevention con `includes` en Rails
- Paginación con `kaminari` o `will_paginate`

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
      - name: Install dependencies
        run: bundle install
      - name: Run tests
        run: bundle exec rspec
      - name: Run linter
        run: bundle exec rubocop
```

---

## Dependencias Externas

- **API Cat Facts**: https://catfact.ninja/
  - GET `/fact` - Fact aleatorio
  - GET `/facts` - Lista de facts paginados (332 facts, 10 por página)
  - Sin autenticación requerida
  - Rate limiting no documentado (usar con cuidado)

---

## Dependencias Principales

### Backend (Ruby on Rails)

| Gem | Propósito | Spec Referencia |
|-----|-----------|-----------------|
| `devise-jwt` | Autenticación JWT | 02-INICIO-SESION |
| `rack-attack` | Rate limiting | 02-INICIO-SESION |
| `faraday` | Consumo de API externa | 03-CONSULTAR-MARCAR-FACTS |
| `redis` | Cache y sesiones | 06-ARQUITECTURA |
| `sidekiq` | Background jobs | 08-BONUS |
| `rspec-rails` | Testing | 07-CALIDAD |
| `factory_bot_rails` | Test data | 07-CALIDAD |
| `rubocop` | Linter | 07-CALIDAD |
| `simplecov` | Code coverage | 07-CALIDAD |
| `kaminari` | Paginación | 04-LISTA-FACTS-GUSTADOS, 05-FACTS-POPULARES |

### Frontend (React + TypeScript)

| Paquete | Propósito | Spec Referencia |
|---------|-----------|-----------------|
| `axios` | HTTP client | 03-CONSULTAR-MARCAR-FACTS |
| `@reduxjs/toolkit` | Estado global | 06-ARQUITECTURA |
| `react-router-dom` | Enrutamiento | 06-ARQUITECTURA |
| `react-hook-form` | Formularios | 01-REGISTRO, 02-INICIO-SESION |
| `zod` | Validación de schemas | 01-REGISTRO, 02-INICIO-SESION |
| `jest` | Testing | 07-CALIDAD |
| `@testing-library/react` | React testing | 07-CALIDAD |
| `eslint` | Linter | 07-CALIDAD |
| `prettier` | Code formatter | 07-CALIDAD |
| `tailwindcss` | Estilos (bonus) | 08-BONUS |

### Infraestructura

| Servicio | Propósito | Spec Referencia |
|----------|-----------|-----------------|
| **PostgreSQL** | Base de datos relacional | 06-ARQUITECTURA |
| **Redis** | Cache, sesiones, rate limiting | 06-ARQUITECTURA |
| **AWS S3** | Frontend estático | 08-BONUS |
| **AWS CloudFront** | CDN | 08-BONUS |
| **AWS ECS/EC2** | Backend containers | 08-BONUS |
| **AWS RDS** | PostgreSQL administrado | 08-BONUS |
| **AWS ElastiCache** | Redis administrado | 08-BONUS |
| **Docker** | Contenedores | 08-BONUS |
| **GitHub Actions** | CI/CD | 08-BONUS |

---

## Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| `DESAFIO_TECNICO.md` | Requerimientos originales del desafío |
| `06-ARQUITECTURA.md` | Arquitectura y desacople del sistema |
| `07-CALIDAD-DESARROLLO.md` | SOLID, testing, linters, Git |
| `08-BONUS.md` | Docker, 2FA, CI/CD, Deploy, Tailwind |
| `09-UML.md` | Diagramas UML del sistema |

---

*Documento generado: Julio 2026*
*Plataforma: SSCatFacts*
*Stack Tecnológico: SSINDEX (Rails, PostgreSQL, Redis, React, AWS, Python, Docker)*
*Última actualización: Specs completas (155 puntos totales)*
