# AGENTS.md — Contexto del Proyecto SSCatFacts

Este archivo proporciona contexto a los AI assistants sobre cómo trabajar con este proyecto.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React + TypeScript | React 18+ |
| **Bundler** | Vite | 5+ |
| **Backend** | Ruby on Rails (API mode) | Rails 7+ |
| **Base de Datos** | PostgreSQL | 15+ |
| **Caché/Colas** | Redis | 7+ |
| **Autenticación** | JWT (devise-jwt) | - |
| **Estilos** | Tailwind CSS | 3+ |
| **Containerización** | Docker + Docker Compose | 24+ / 2.20+ |
| **CI/CD** | GitHub Actions | - |
| **Cloud** | AWS (S3, CloudFront, EC2, RDS) | - |

---

## Arquitectura

### Patrones a seguir

| Patrón | Dónde aplica |
|--------|-------------|
| **Clean Architecture** | Backend — capas: Controllers → Use Cases → Services → Models |
| **Atomic Design** | Frontend — átomos, moléculas, organismos, plantillas, páginas |
| **Service Objects** | Backend — encapsular lógica de negocio compleja |
| **Circuit Breaker** | Conexión con API externa catfact.ninja |
| **Null Object** | Respuestas vacías de la API externa |
| **Optimistic Updates** | Frontend — likes en UI antes de confirmar backend |
| **Error Boundary** | Frontend — captura de errores de renderizado |
| **Singleton** | Servicios con estado global (Cache, Logger) |

### Patrones que NO usar

| Patrón | Razón |
|--------|-------|
| **Repository Pattern** | ActiveRecord ya provee abstracción de BD |
| **Value Objects** | Rails no los requiere para este alcance |
| **Domain Events** | Complejidad innecesaria para el tamaño del proyecto |
| **Microservices** | Monolito es suficiente y más simple |
| **N+1 Queries** | Siempre usar eager loading |

---

## Estructura del Proyecto

```
sscatfacts/
├── backend/                    # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/api/v1/ # API versioned
│   │   ├── models/             # ActiveRecord
│   │   ├── services/           # Service objects
│   │   └── use_cases/          # Use cases
│   ├── config/
│   ├── db/
│   └── spec/                   # RSpec tests
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── atoms/              # Componentes básicos
│   │   ├── molecules/          # Componentes compuestos
│   │   ├── organisms/          # Componentes complejos
│   │   ├── templates/          # Plantillas
│   │   ├── pages/              # Páginas
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   └── public/
│
├── docs/
│   └── specs/                  # Especificaciones completas
│
├── docker-compose.yml
├── AGENTS.md                   # Este archivo
├── MEMORY.md                   # Registro de correcciones
└── README.md
```

---

## Reglas de Código

### Backend (Ruby on Rails)

- **Indentación**: 2 espacios
- **Líneas máximas**: 120 caracteres
- **Strings**: dobles (`"string"`)
- **API versioning**: prefijo `/api/v1/`
- **Autenticación**: JWT en header `Authorization: Bearer <token>`
- **Rate limiting**: `rack-attack` para endpoints públicos
- **Tests**: RSpec con FactoryBot
- **Linter**: RuboCop (sin ofensas)

### Frontend (React + TypeScript)

- **Indentación**: 2 espacios
- **Líneas máximas**: 100 caracteres
- **Strings**: simples (`'string'`)
- **Componentes**: PascalCase (`FactCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Archivos**: kebab-case (`fact-card.tsx`)
- **Estado**: React hooks (useState, useEffect) — NO Redux
- **HTTP**: Axios con interceptores
- **Tests**: Jest + React Testing Library
- **Linter**: ESLint + Prettier (sin ofensas)
- **Estilos**: Tailwind CSS utility-first

---

## API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Registro |
| POST | `/api/v1/auth/login` | No | Login |
| GET | `/api/v1/facts/random` | Sí | Fact aleatorio |
| POST | `/api/v1/facts/:id/like` | Sí | Marcar like |
| DELETE | `/api/v1/facts/:id/like` | Sí | Quitar like |
| GET | `/api/v1/facts/list` | Sí | Lista facts API |
| GET | `/api/v1/users/favorites` | Sí | Facts favoritos |
| GET | `/api/v1/facts/popular` | Sí | Facts populares |
| GET | `/api/v1/facts/top/:n` | Sí | Top N populares |

---

## API Externa

**catfact.ninja** — Solo dos endpoints:
- `GET /fact` → `{ fact: "string" }`
- `GET /facts?limit=N` → `{ data: [...], last_page: N }`

**NO existe endpoint `/breeds`** — No usar ni documentar.

---

## Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con username único |
| `cat_facts` | Facts cacheados de la API externa |
| `user_likes` | Relación usuario-fact (like) |
| `two_factors` | Datos 2FA (TOTP secret) |

---

## Referencia a Specs

Las especificaciones completas están en `docs/specs/`:

| Spec | Contenido |
|------|-----------|
| `README.md` | Índice maestro, glosario, mapa de relaciones |
| `SETUP.md` | Guía de instalación |
| `01-REGISTRO-USUARIOS.md` | Registro de usuarios |
| `02-INICIO-SESION.md` | Login + JWT |
| `03-CONSULTAR-MARCAR-FACTS.md` | Consultar y marcar facts |
| `04-LISTA-FACTS-GUSTADOS.md` | Lista de favoritos |
| `05-FACTS-POPULARES.md` | Facts populares |
| `06-ARQUITECTURA.md` | Arquitectura, patrones, API, deploy, error handling, logging, seguridad, performance |
| `07-CALIDAD-DESARROLLO.md` | SOLID, testing, linting, git, convenciones |
| `08-BONUS.md` | Docker, 2FA, CI/CD, deploy, Tailwind |
| `09-UML.md` | Diagramas UML |

**Siempre consultar las specs antes de implementar.**

---

## Criterios de Calidad

- [ ] Tests unitarios ≥80% cobertura
- [ ] Tests de integración para servicios críticos
- [ ] RuboCop sin ofensas (backend)
- [ ] ESLint + Prettier sin ofensas (frontend)
- [ ] Commits pequeños (max 200 líneas)
- [ ] Convencional Commits en mensajes
- [ ] Git Flow para ramas
- [ ] Documentación de decisiones de arquitectura
