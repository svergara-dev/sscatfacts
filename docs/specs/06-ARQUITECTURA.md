# Especificación: Arquitectura y Desacople de Componentes

## Resumen

Esta especificación define la arquitectura del sistema SSCatFacts, estableciendo el desacople entre frontend y backend, los contratos de comunicación y la estrategia de despliegue.

## Contexto del Negocio

- **Módulo**: Arquitectura del Sistema
- **Prioridad**: Alta (fundamento del proyecto)
- **Puntuación**: 40 puntos (20 desacople + 20 arquitectura)

---

## Requisitos Funcionales

### RF-06-01: Desacople Frontend-Backend

**Descripción**: El sistema debe implementar una arquitectura desacoplada donde frontend y backend sean aplicaciones independientes.

**Criterios**:
- Frontend y backend desplegados por separado
- Comunicación exclusiva vía HTTP/HTTPS
- Frontend no accede directamente a la base de datos
- Backend expone API REST como única interfaz de comunicación

### RF-06-02: API REST como Contrato

**Descripción**: El backend debe exponer una API RESTful que sirva como contrato entre frontend y backend.

**Criterios**:
- Endpoints documentados con OpenAPI/Swagger
- Versionado de API (v1, v2, etc.)
- Respuestas en formato JSON consistente
- Headers estándar (Content-Type, Authorization)

### RF-06-03: Autenticación basada en JWT

**Descripción**: La comunicación autenticada debe realizar mediante tokens JWT.

**Criterios**:
- Token generado en login
- Token enviado en header `Authorization: Bearer <token>`
- Token con expiración configurable
- Refresh token para sesiones largas (opcional)

### RF-06-04: CORS Configurado

**Descripción**: El backend debe configurar CORS para permitir solicitudes del frontend.

**Criterios**:
- Dominios permitidos configurables
- Headers permitidos: Authorization, Content-Type
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS
- Preflight cache: 24 horas máximo

---

## Requisitos No Funcionales

### Disponibilidad
- Frontend y backend deben escalarse independientemente
- Backend debe manejar caída del frontend gracefulmente
- Frontend debe mostrar mensajes amigables si backend no responde

### Rendimiento
- Tiempo de respuesta API < 500ms (95th percentile)
- Frontend debe cargar en < 3 segundos
- Assets estáticos servidos desde CDN

### Seguridad
- HTTPS obligatorio en producción
- CORS restrictivo (solo dominios conocidos)
- Rate limiting en endpoints públicos
- Sanitización de inputs en ambos lados

### Usabilidad y Responsive Design
- La aplicación debe visualizarse correctamente en dispositivos móviles, tablets y desktop
- Breakpoints estándar con Tailwind CSS:
  - Mobile: < 640px (`sm:`)
  - Tablet: 640px - 1024px (`md:`)
  - Desktop: > 1024px (`lg:`)
- Componentes deben ser responsivos y adaptables
- Navegación debe ser accesible en todos los tamaños de pantalla
- Touch targets mínimo 44x44px en dispositivos móviles

---

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                  │
│                      (Navegador)                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND                                     │
│              React + TypeScript + Vite                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │   Services  │             │
│  │             │  │             │  │  (Axios)    │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
│                                           │                     │
│                                    HTTP/HTTPS                    │
│                                    JSON + JWT                    │
└───────────────────────────────────────┬─────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND                                     │
│                   Ruby on Rails (API)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controllers │  │  Services   │  │   Models    │             │
│  │             │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
│                                           │                     │
│                                    ┌──────┴──────┐             │
│                                    │             │             │
│                                    ▼             ▼             │
│                          ┌─────────────┐ ┌─────────────┐       │
│                          │ PostgreSQL  │ │   Redis     │       │
│                          │   (RDS)     │ │ (ElastiCache)│      │
│                          └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │   API Externa            │
                          │   catfact.ninja          │
                          └─────────────────────────┘
```

---

## Estructura del Repositorio

```
sscatfacts/
├── docs/
│   └── specs/                  ← Documentación del proyecto
│       ├── README.md           ← Índice y resumen general
│       ├── 01-REGISTRO-USUARIOS.md
│       ├── 02-INICIO-SESION.md
│       ├── 03-CONSULTAR-MARCAR-FACTS.md
│       ├── 04-LISTA-FACTS-GUSTADOS.md
│       ├── 05-FACTS-POPULARES.md
│       ├── 06-ARQUITECTURA.md  ← Este archivo
│       ├── 07-CALIDAD-DESARROLLO.md
│       ├── 08-BONUS.md
│       ├── 09-UML.md
│       └── SETUP.md            ← Guía de inicio rápido
│
├── frontend/                   ← React + TypeScript + Vite
│   ├── src/
│   │   ├── atoms/              ← Componentes básicos (Button, Input, Card)
│   │   ├── molecules/          ← Combinaciones (LoginForm, FactCard)
│   │   ├── organisms/          ← Componentes complejos (Header, FactsList)
│   │   ├── templates/          ← Layouts (AuthTemplate, DashboardTemplate)
│   │   ├── pages/              ← Páginas (LoginPage, FactsPage)
│   │   ├── hooks/              ← Custom hooks (useAuth, useFacts, useLike)
│   │   ├── services/           ← Capa API (apiClient, authService)
│   │   ├── store/              ← Estado global (Redux/Zustand)
│   │   ├── types/              ← TypeScript interfaces
│   │   └── utils/              ← Helpers puros
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                    ← Ruby on Rails API
│   ├── app/
│   │   ├── controllers/        ← API endpoints
│   │   │   └── api/v1/
│   │   ├── models/             ← Entidades (User, CatFact, UserLike)
│   │   ├── services/           ← Lógica de negocio
│   │   │   ├── auth/
│   │   │   ├── external/
│   │   │   └── cache/
│   │   ├── use_cases/          ← Casos de uso
│   │   │   ├── auth/
│   │   │   ├── facts/
│   │   │   └── likes/
│   │   └── serializers/        ← Formato de respuesta
│   ├── config/
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds.rb
│   ├── spec/                   ← Tests
│   │   ├── models/
│   │   ├── requests/
│   │   ├── services/
│   │   └── factories/
│   ├── Gemfile
│   ├── .rubocop.yml
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── ci.yml              ← Tests y linters
│       └── deploy.yml          ← Deploy automático
│
├── docker-compose.yml          ← Orquestación de servicios
├── .gitignore
├── .editorconfig
└── README.md                   ← Documentación principal
```

### Principios de Organización

| Capa | Carpeta | Responsabilidad |
|------|---------|-----------------|
| **Presentación** | `atoms/`, `molecules/`, `organisms/` | UI Components |
| **Contenedores** | `pages/`, `templates/` | Lógica de página |
| **Lógica** | `hooks/`, `services/` | Reutilización de lógica |
| **Estado** | `store/` | Estado global |
| **Dominio** | `models/`, `use_cases/` | Reglas de negocio |
| **Persistencia** | `db/`, `migrate/` | Datos |
| **API** | `controllers/`, `serializers/` | Comunicación HTTP |

---

## Arquitectura por Capas y Patrones de Diseño

### Frontend: Atomic Design + Patrones Adicionales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + TypeScript + Vite)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATRÓN PRINCIPAL: ATOMIC DESIGN                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   atoms/           molecules/        organisms/                     │   │
│  │   ┌─────┐         ┌─────────┐       ┌─────────────┐               │   │
│  │   │     │   ──▶   │         │  ──▶  │             │               │   │
│  │   └─────┘         └─────────┘       └─────────────┘               │   │
│  │   Básicos         Combinación       Complejos                      │   │
│  │                                                                     │   │
│  │                          │                                          │   │
│  │                          ▼                                          │   │
│  │   templates/            pages/                                      │   │
│  │   ┌─────────┐          ┌─────────┐                                 │   │
│  │   │         │    ──▶   │         │                                 │   │
│  │   └─────────┘          └─────────┘                                 │   │
│  │   Layouts              Rutas                                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ESTRUCTURA DE CARPETAS:                                                    │
│                                                                             │
│  src/                                                                       │
│  ├── atoms/              ← Componentes básicos                             │
│  │   ├── Button/                                                            │
│  │   ├── Input/                                                             │
│  │   ├── Card/                                                              │
│  │   └── Icon/                                                              │
│  │                                                                         │
│  ├── molecules/          ← Combinaciones simples                           │
│  │   ├── LoginForm/                                                         │
│  │   ├── FactCard/                                                          │
│  │   └── SearchBar/                                                         │
│  │                                                                         │
│  ├── organisms/          ← Componentes complejos                           │
│  │   ├── Header/                                                            │
│  │   ├── FactsList/                                                         │
│  │   └── FavoritesTable/                                                    │
│  │                                                                         │
│  ├── templates/          ← Layouts de página                               │
│  │   ├── AuthTemplate/                                                      │
│  │   └── DashboardTemplate/                                                 │
│  │                                                                         │
│  ├── pages/              ← Páginas completas (rutas)                       │
│  │   ├── LoginPage/                                                         │
│  │   ├── FactsPage/                                                         │
│  │   └── FavoritesPage/                                                     │
│  │                                                                         │
│  ├── hooks/              ← Custom hooks                                    │
│  │   ├── useAuth.ts                                                         │
│  │   ├── useFacts.ts                                                        │
│  │   ├── useLike.ts        ← Incluye Optimistic Updates                    │
│  │   └── usePagination.ts                                                   │
│  │                                                                         │
│  ├── services/           ← Capa API                                        │
│  │   ├── apiClient.ts      ← Axios instance                                │
│  │   ├── authService.ts                                                    │
│  │   └── factsService.ts                                                    │
│  │                                                                         │
│  ├── store/              ← Estado global (Redux Toolkit o Zustand)         │
│  │   ├── slices/                                                            │
│  │   │   ├── authSlice.ts                                                   │
│  │   │   ├── factsSlice.ts                                                  │
│  │   │   └── uiSlice.ts                                                     │
│  │   └── store.ts                                                           │
│  │                                                                         │
│  ├── components/                                                           │
│  │   └── ErrorBoundary.tsx  ← Manejo de errores                            │
│  │                                                                         │
│  ├── router/             ← React Router                                    │
│  │   └── AppRouter.tsx     ← Configuración de rutas                        │
│  │                                                                         │
│  ├── types/              ← TypeScript interfaces                           │
│  └── utils/              ← Helpers puros                                   │
│                                                                             │
│  PATRONES IMPLEMENTADOS:                                                    │
│  • Atomic Design → Organización de componentes por complejidad             │
│  • Container/Presentational → Separación lógica vs presentación            │
│  • API Client Pattern → Centralización de llamadas HTTP (Axios)            │
│  • Error Boundaries → Manejo elegante de errores                           │
│  • Optimistic Updates → UX instantánea en likes                            │
│  • Custom Hooks → Reutilización de lógica de estado                        │
│  • Redux/Zustand → Estado global predecible                                │
│  • React Router → Enrutamiento declarativo                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Backend: Clean Architecture + Patrones Adicionales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Ruby on Rails API)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATRÓN PRINCIPAL: CLEAN ARCHITECTURE                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   CAPA 1: ENTITIES (Domain)                                        │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │  app/models/                                                │   │   │
│  │   │  ├── user.rb                                                │   │   │
│  │   │  ├── cat_fact.rb                                            │   │   │
│  │   │  └── user_like.rb                                           │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                      │   │
│  │                              ▼                                      │   │
│  │   CAPA 2: USE CASES (Business Rules)                               │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │  app/use_cases/                                             │   │   │
│  │   │  ├── auth/                                                  │   │   │
│  │   │  │   ├── register_user.rb                                   │   │   │
│  │   │  │   └── login_user.rb                                      │   │   │
│  │   │  ├── facts/                                                 │   │   │
│  │   │  │   ├── fetch_random_fact.rb                               │   │   │
│  │   │  │   ├── list_facts.rb                                      │   │   │
│  │   │  │   └── get_popular_facts.rb                               │   │   │
│  │   │  └── likes/                                                 │   │   │
│  │   │      ├── like_fact.rb                                       │   │   │
│  │   │      ├── unlike_fact.rb                                     │   │   │
│  │   │      └── get_user_favorites.rb                              │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                      │   │
│  │                              ▼                                      │   │
│  │   CAPA 3: INTERFACE ADAPTERS (Controllers)                         │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │  app/controllers/api/v1/                                    │   │   │
│  │   │  ├── auth_controller.rb                                     │   │   │
│  │   │  ├── facts_controller.rb                                    │   │   │
│  │   │  └── users_controller.rb                                    │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                      │   │
│  │                              ▼                                      │   │
│  │   CAPA 4: FRAMEWORKS & DRIVERS (External)                          │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │  app/services/                                              │   │   │
│  │   │  ├── external/                                              │   │   │
│  │   │  │   └── cat_fact_api_service.rb  ← API externa + Circuit  │   │   │
│  │   │  │                                        Breaker          │   │   │
│  │   │  ├── auth/                                                  │   │   │
│  │   │  │   └── jwt_service.rb                                     │   │   │
│  │   │  └── cache/                                                 │   │   │
│  │   │      └── redis_cache_service.rb                             │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                      │   │
│  │                              ▼                                      │   │
│  │   CAPA 5: SERIALIZERS (Output Formatting)                          │   │
│  │   ┌─────────────────────────────────────────────────────────────┐   │   │
│  │   │  app/serializers/                                           │   │   │
│  │   │  ├── user_serializer.rb                                     │   │   │
│  │   │  ├── fact_serializer.rb                                     │   │   │
│  │   │  └── error_serializer.rb                                    │   │   │
│  │   └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PATRONES IMPLEMENTADOS:                                                    │
│  • Clean Architecture → Separación por capas de dependencia                │
│  • Service Objects → Lógica de negocio encapsulada                         │
│  • Circuit Breaker → Resiliencia con API externa                           │
│  • Null Object → Manejo elegante de objetos nulos                          │
│  • ActiveRecord → Acceso a datos (Repository implícito)                   │
│  • Serializers → Formato de respuesta JSON consistente                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Contratos de API

### Estructura de Respuesta Estándar

**Respuesta Exitosa (2xx)**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "totalPages": 10,
    "totalItems": 100
  }
}
```

**Respuesta Error (4xx/5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error",
    "details": []
  }
}
```

### Headers Estándar

| Header | Descripción | Ejemplo |
|--------|-------------|---------|
| `Content-Type` | Tipo de contenido | `application/json` |
| `Authorization` | Token JWT | `Bearer eyJhbGciOi...` |
| `X-Request-ID` | ID de request para tracking | `uuid-v4` |
| `X-RateLimit-Limit` | Límite de requests | `100` |
| `X-RateLimit-Remaining` | Requests restantes | `95` |

### Versionado de API

```
/api/v1/auth/login
/api/v1/facts/random
/api/v1/facts/popular
```

**Criterios de Versionado**:
- Cambios menores (bug fixes): misma versión
- Cambios breaking: nueva versión
- Mantener versión anterior por 6 meses mínimo

---

## Estrategia de Despliegue

### Entornos

| Entorno | URL | Descripción |
|---------|-----|-------------|
| Development | `localhost:3000` / `localhost:8080` | Desarrollo local |
| Staging | `staging.sscatfacts.com` | QA y testing |
| Production | `sscatfacts.com` | Producción |

### Desacole de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (React + Vite)                      │
│                                                             │
│  Build: npm run build                                       │
│  Output: /dist (archivos estáticos)                         │
│  Deploy: AWS S3 + CloudFront                                │
│  URL: https://sscatfacts.com                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Rails API)                       │
│                                                             │
│  Build: bundle install                                      │
│  Deploy: AWS EC2 / ECS                                      │
│  URL: https://api.sscatfacts.com                            │
│  Port: 3000                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Variables de Entorno

### Backend (Rails)

```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/sscatfacts

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

# API Externa
CATFACT_API_URL=https://catfact.ninja

# CORS
FRONTEND_URL=http://localhost:8080

# Environment
RAILS_ENV=production
```

### Frontend (React + Vite)

```bash
# API Backend
VITE_API_URL=https://api.sscatfacts.com/api/v1

# Environment
NODE_ENV=production
```

---

## API Endpoints (Consolidado)

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Registrar usuario | No |
| POST | `/api/v1/auth/login` | Iniciar sesión | No |

### Cat Facts

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/facts/random` | Fact aleatorio | Sí |
| GET | `/api/v1/facts/list` | Lista paginada | Sí |
| POST | `/api/v1/facts/:id/like` | Dar like | Sí |
| DELETE | `/api/vacts/:id/like` | Quitar like | Sí |
| GET | `/api/v1/facts/popular` | Facts populares | Sí |
| GET | `/api/v1/facts/top/:n` | Top N facts | Sí |

### Usuario

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/favorites` | Lista favoritos | Sí |
| DELETE | `/api/v1/users/favorites/:factId` | Eliminar favorito | Sí |

---

## Decisiones de Arquitectura y Alternativas No Implementadas

### Patrones No Implementados (y por qué)

| Patrón | ¿Por qué no se implementó? | ¿Cuándo implementarlo? |
|--------|----------------------------|------------------------|
| **Repository Pattern** | Rails ya tiene ActiveRecord (es un Repository implícito) | Si se cambia a ORM custom o microservicios |
| **Value Objects** | Pocos casos de uso en esta app específica | Si el dominio crece (e-commerce, pagos complejos) |
| **Decorator Pattern** | Serializers son suficientes para esta app | Si se necesita lógica de presentación compleja |
| **Domain Events** | No hay event-driven workflow | Si se integran múltiples sistemas |
| **State Machines (XState)** | Estados de UI son simples | Si hay flujos complejos con múltiples estados |
| **HOC (Higher-Order Components)** | Custom Hooks los reemplazan y son más limpios | Nunca (Hooks es el estándar actual) |
| **Render Props** | Custom Hooks los reemplazan | Nunca (Hooks es el estándar actual) |

### Arquitecturas No Implementadas

| Arquitectura | ¿Por qué no se implementó? | ¿Cuándo implementarlo? |
|--------------|----------------------------|------------------------|
| **Microservicios** | App monolítica suficiente para el alcance | Equipo > 5 devs, dominios distintos |
| **GraphQL** | REST es más simple, frontend conoce sus queries | Múltiples clientes con diferentes necesidades |
| **Event Sourcing** | No hay necesidad de auditoría completa | Si se requiere historial completo de cambios |
| **Serverless** | Requiere más configuración AWS | Tráfico variable/estacional extremo |
| **CQRS** | CRUD simple, no hay separación lectura/escritura | Apps con reads extremadamente optimizados |

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| Backend no disponible | Frontend muestra "Servicio no disponible" |
| Token expirado | Redirect a login con mensaje |
| CORS bloqueado | Error 403 con mensaje descriptivo |
| Rate limit excedido | Error 429 con tiempo de espera |
| API externa no disponible | Backend reintenta 3 veces, luego error 503 |

---

## Criterios de Aceptación

- [ ] CA-01: Frontend y backend son desplegados independientemente
- [ ] CA-02: Comunicación vía HTTP/HTTPS con JSON
- [ ] CA-03: API documentada con OpenAPI/Swagger
- [ ] CA-04: CORS configurado correctamente
- [ ] CA-05: JWT funciona para autenticación
- [ ] CA-06: Versionado de API implementado
- [ ] CA-07: Headers estándar en todas las respuestas
- [ ] CA-08: Entornos separados (dev, staging, production)

---

## Dependencias

- **Frontend**: React, Axios, TypeScript
- **Backend**: Ruby on Rails, devise-jwt, rack-cors
- **Infraestructura**: AWS (S3, CloudFront, EC2, RDS)
- **API Externa**: catfact.ninja

---

## Estrategia de Manejo de Errores

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El nombre de usuario ya está en uso",
    "details": [
      {
        "field": "username",
        "message": "Ya existe un usuario con este nombre"
      }
    ]
  }
}
```

### Códigos de Error Estándar

| Código HTTP | Código de Error | Descripción |
|-------------|-----------------|-------------|
| 400 | `VALIDATION_ERROR` | Error de validación |
| 401 | `UNAUTHORIZED` | No autenticado |
| 403 | `FORBIDDEN` | Sin permisos |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto (duplicado) |
| 422 | `UNPROCESSABLE_ENTITY` | Error de negocio |
| 429 | `RATE_LIMIT_EXCEEDED` | Límite de peticiones |
| 500 | `INTERNAL_ERROR` | Error del servidor |
| 503 | `EXTERNAL_API_ERROR` | Error de API externa |

### Manejo por Capa

**Backend (Rails):**

```ruby
# app/controllers/concerns/error_handler.rb
module ErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      render json: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: e.message
        }
      }, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      render json: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: e.message,
          details: e.record.errors.full_messages
        }
      }, status: :unprocessable_entity
    end
  end
end
```

**Frontend (React):**

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// hooks/useErrorHandler.ts
const useErrorHandler = () => {
  const handleError = (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      toast.error('Demasiadas peticiones. Intenta más tarde.');
    } else {
      toast.error('Ocurrió un error. Intenta nuevamente.');
    }
  };

  return { handleError };
};
```

### Toast Notifications (Frontend)

```typescript
// services/notificationService.ts
import { toast } from 'react-toastify';

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
};

// Uso en componentes
import { notify } from '@/services/notificationService';

const handleLike = async (factId: number) => {
  try {
    await factsService.like(factId);
    notify.success('Fact marcado como favorito');
  } catch (error) {
    notify.error('No se pudo marcar el fact');
  }
};
```

---

## Estrategia de Logging

### Niveles de Log

| Nivel | Uso | Ejemplo |
|-------|-----|---------|
| `DEBUG` | Información detallada para debugging | Request/Response completo |
| `INFO` | Eventos normales del sistema | Login exitoso, fact consultado |
| `WARN` | Advertencias que no rompen el sistema | Rate limit casi alcanzado |
| `ERROR` | Errores que requieren atención | API externa falló |

### Backend (Rails)

**Configuración:**
```ruby
# config/environments/production.rb
config.logger = Logger.new(STDOUT)
config.log_level = :info

config.log_formatter = proc do |severity, datetime, progname, msg|
  "[#{datetime.strftime('%Y-%m-%d %H:%M:%S')}] #{severity}: #{msg}\n"
end
```

**Uso:**
```ruby
# app/services/fact_service.rb
class FactService
  def fetch_random_fact
    Rails.logger.info("Fetching random fact from external API")
    
    response = HTTP.get("https://catfact.ninja/fact")
    
    if response.status.success?
      Rails.logger.info("Fact fetched successfully")
      response.parse
    else
      Rails.logger.error("Failed to fetch fact: #{response.status}")
      nil
    end
  rescue => e
    Rails.logger.error("Error fetching fact: #{e.message}")
    nil
  end
end
```

### Frontend (React)

**Configuración:**
```typescript
// utils/logger.ts
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  debug: (message: string, data?: any) => {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

**Uso:**
```typescript
// hooks/useFacts.ts
import { logger } from '@/utils/logger';

const useFacts = () => {
  const fetchRandomFact = async () => {
    logger.info('Fetching random fact');
    
    try {
      const fact = await factsService.getRandom();
      logger.debug('Fact fetched', fact);
      return fact;
    } catch (error) {
      logger.error('Failed to fetch fact', error);
      throw error;
    }
  };

  return { fetchRandomFact };
};
```

### Logs Esperados

**Backend:**
```
[2026-07-22 10:30:00] INFO: User registered successfully (username: catlover123)
[2026-07-22 10:30:05] INFO: User logged in (username: catlover123)
[2026-07-22 10:30:10] INFO: Fetching random fact from external API
[2026-07-22 10:30:11] INFO: Fact fetched successfully
[2026-07-22 10:30:15] INFO: Like added (user_id: 1, fact_id: 42)
[2026-07-22 10:31:00] WARN: Rate limit approaching for IP 192.168.1.1
[2026-07-22 10:31:30] ERROR: External API unavailable (catfact.ninja)
```

---

## Documentación de Seguridad

### Headers de Seguridad

**Backend (Rails):**
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://sscatfacts.com'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      max_age: 86400
  end
end
```

**Nginx/Apache (Producción):**
```
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

### OWASP Top 10 - Medidas Implementadas

| Vulnerabilidad | Medida | Implementación |
|----------------|--------|----------------|
| **A01: Broken Access Control** | JWT + Authorization headers | `devise-jwt` |
| **A02: Cryptographic Failures** | Bcrypt para contraseñas | `devise` |
| **A03: Injection** | Parámetros preparados | ActiveRecord |
| **A04: Insecure Design** | Validación de entrada | `rack-attack` + modelos |
| **A05: Security Misconfiguration** | Variables de entorno | `.env` files |
| **A06: Vulnerable Components** | Dependencias actualizadas | `bundle audit` |
| **A07: Auth Failures** | Rate limiting | `rack-attack` |
| **A08: Data Integrity** | Migraciones verificadas | ActiveRecord |
| **A09: Logging** | Auditoría de acciones | Rails logger |
| **A10: SSRF** | URLs whitelist | Faraday configuration |

### Autenticación y Autorización

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    token = request.headers['Authorization']&.split(' ')&.last
    
    begin
      decoded = JWT.decode(token, Rails.application.secrets.jwt_secret_key, true, algorithm: 'HS256')
      @current_user = User.find(decoded[0]['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Token inválido' } 
      }, status: :unauthorized
    end
  end
end
```

### Rate Limiting Detallado

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle("requests by ip", limit: 100, period: 1.minute) do |req|
  req.ip unless req.path.start_with?('/assets')
end

Rack::Attack.throttle("login attempts by ip", limit: 5, period: 1.minute) do |req|
  req.ip if req.path == '/api/v1/auth/login' && req.post?
end

Rack::Attack.throttle("registration attempts by ip", limit: 3, period: 1.hour) do |req|
  req.ip if req.path == '/api/v1/auth/register' && req.post?
end
```

### Validación de Inputs

```ruby
# app/models/user.rb
class User < ApplicationRecord
  validates :username, 
    presence: true, 
    uniqueness: true, 
    length: { minimum: 3, maximum: 30 },
    format: { with: /\A[a-zA-Z0-9_]+\z/, message: "solo puede contener letras, números y guiones bajos" }
  
  validates :password, 
    presence: true, 
    length: { minimum: 8 },
    if: :password_required?
end
```

```typescript
// schemas/auth.schema.ts
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

---

## Estrategia de Performance

### Métricas Objetivo

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| Time to First Byte (TTFB) | < 200ms | Lighthouse |
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| API Response Time (95th) | < 500ms | New Relic/Datadog |
| Database Query Time | < 100ms | Rails logs |

### Backend - Optimizaciones

**1. N+1 Query Prevention:**
```ruby
# MALO - N+1 queries
facts = CatFact.all
facts.each { |fact| fact.user_likes.count }

# BUENO - Eager loading
facts = CatFact.includes(:user_likes).all
facts.each { |fact| fact.user_likes.count }
```

**2. Índices de Base de Datos:**
```ruby
# db/migrate/xxx_add_indexes.rb
class AddIndexes < ActiveRecord::Migration[7.0]
  def change
    add_index :users, :username, unique: true
    add_index :user_likes, [:user_id, :fact_id], unique: true
    add_index :user_likes, :fact_id
    add_index :cat_facts, :api_fact_id, unique: true
  end
end
```

**3. Caché con Redis:**
```ruby
# app/services/fact_service.rb
class FactService
  def get_popular_facts(limit: 10)
    cache_key = "popular_facts_#{limit}"
    
    Rails.cache.fetch(cache_key, expires_in: 5.minutes) do
      CatFact
        .left_joins(:user_likes)
        .group(:id)
        .order('COUNT(user_likes.id) DESC')
        .limit(limit)
    end
  end
end
```

**4. Paginación:**
```ruby
# app/controllers/api/v1/facts_controller.rb
def list
  page = params[:page] || 1
  limit = [params[:limit] || 10, 50].min
  
  facts = CatFact.page(page).per(limit)
  
  render json: {
    success: true,
    data: {
      facts: facts,
      pagination: {
        currentPage: facts.current_page,
        totalPages: facts.total_pages,
        totalItems: facts.total_count
      }
    }
  }
end
```

### Frontend - Optimizaciones

**1. Lazy Loading:**
```typescript
// App.tsx
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const FactsPage = React.lazy(() => import('./pages/FactsPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/facts" element={<FactsPage />} />
      </Routes>
    </Suspense>
  );
}
```

**2. Memoización:**
```typescript
// components/FactCard.tsx
const FactCard: React.FC<Props> = React.memo(({ fact, onLike }) => {
  return (
    <div>
      <p>{fact.fact}</p>
      <button onClick={() => onLike(fact.id)}>Like</button>
    </div>
  );
});
```

**3. Debounce en Búsquedas:**
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**4. Optimistic Updates:**
```typescript
// hooks/useLike.ts
const useLike = () => {
  const handleLike = async (factId: number) => {
    setLiked(true);
    setLikesCount(prev => prev + 1);
    
    try {
      await factsService.like(factId);
    } catch (error) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    }
  };

  return { handleLike };
};
```

**5. Infinite Scroll:**
```typescript
// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean) {
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [onLoadMore, hasMore]);
  
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);
  
  return { lastElementRef };
}

// Uso en componente
const FactsList = () => {
  const [facts, setFacts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = async () => {
    const newFacts = await factsService.getFacts(page + 1);
    setFacts(prev => [...prev, ...newFacts]);
    setHasMore(newFacts.length > 0);
  };
  
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore);
  
  return (
    <div>
      {facts.map((fact, index) => (
        <FactCard 
          key={fact.id} 
          fact={fact}
          ref={index === facts.length - 1 ? lastElementRef : null}
        />
      ))}
    </div>
  );
};
```

### Cache Strategy

| Tipo | TTL | Herramienta | Uso |
|------|-----|-------------|-----|
| **API Response** | 5 min | Redis | Facts populares |
| **Session** | 24 hrs | Redis | JWT validation |
| **Static Assets** | 1 year | CDN/CloudFront | Imágenes, CSS, JS |
| **HTML** | No cache | - | SPA index.html |

### Monitoring (Producción)

```ruby
# Gemfile
gem 'newrelic_rpm'
gem 'sentry-ruby'
```

```typescript
// Frontend monitoring
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Notas de Implementación

1. Usar `rack-cors` gem para configuración CORS en Rails
2. Frontend construido con `npm run build` y servido desde S3
3. Backend desplegado en EC2 con Docker o ECS
4. CloudFront como CDN para frontend
5. API Gateway opcional para manejo de rate limiting
