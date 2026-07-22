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
│                  React + TypeScript                              │
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

## Arquitectura por Capas y Patrones de Diseño

### Frontend: Atomic Design + Patrones Adicionales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                       │
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
│                    FRONTEND (React)                          │
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

### Frontend (React)

```bash
# API Backend
REACT_APP_API_URL=https://api.sscatfacts.com/api/v1

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

## Notas de Implementación

1. Usar `rack-cors` gem para configuración CORS en Rails
2. Frontend construido con `npm run build` y servido desde S3
3. Backend desplegado en EC2 con Docker o ECS
4. CloudFront como CDN para frontend
5. API Gateway opcional para manejo de rate limiting
