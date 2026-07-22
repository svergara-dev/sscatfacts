# MEMORY.md — Registro de Correcciones y Decisiones

Este archivo captura correcciones, decisiones y aprendizajes durante el desarrollo del proyecto SSCatFacts.

---

## Formato de Registro

Cada entrada debe seguir este formato:

```
### [Fecha] — [Tipo: Corrección | Decisión | Aprendizaje]

**Contexto**: Qué estaba pasando
**Corrección/Decisión**: Qué se hizo
**Razón**: Por qué se hizo así
**Archivo(s)**: Dónde se aplicó
```

---

## Registro de Correcciones

### 2026-07-22 — Corrección: Archivo SET UP.md duplicado con espacio

**Contexto**: Se creó un archivo `SET UP.md` (con espacio) que era un duplicado corrupto de `SETUP.md`.
**Corrección**: Se eliminó el duplicado y se creó `SETUP.md` (sin espacio) con el contenido completo.
**Razón**: Los archivos con espacios en el nombre causan problemas con herramientas de línea de comandos y Git.
**Archivos**: `docs/specs/SETUP.md`

---

### 2026-07-22 — Corrección: Endpoint /breeds no existe

**Contexto**: Inicialmente se documentó un endpoint `/breeds` que no existe en la API catfact.ninja.
**Corrección**: Se eliminaron todas las referencias a `/breeds` de las specs (03-CONSULTAR-MARCAR-FACTS.md y README.md).
**Razón**: La API externa solo tiene `/fact` y `/facts`. Documentar algo que no existe causa confusión.
**Archivos**: `docs/specs/03-CONSULTAR-MARCAR-FACTS.md`, `docs/specs/README.md`

---

## Registro de Decisiones

### 2026-07-22 — Decisión: Monolito vs Monorepo

**Contexto**: Decidir estructura del repositorio.
**Decisión**: Monorepo con `backend/` y `frontend/` en el mismo repositorio.
**Razón**: Para un test técnico, un monorepo es más fácil de revisar y evaluar. En producción se usarían repos separados.
**Archivos**: `README.md` (documentado)

---

### 2026-07-22 — Decisión: Patrones de diseño seleccionados

**Contexto**: Definir qué patrones aplicar y cuáles no.
**Decisión**: Clean Architecture, Atomic Design, Service Objects, Circuit Breaker, Null Object, Optimistic Updates, Error Boundary.
**NO usar**: Repository Pattern, Value Objects, Domain Events, Microservices.
**Razón**: Los patrones seleccionados resuelven problemas reales del proyecto. Los rechazados añaden complejidad innecesaria para el alcance actual.
**Archivos**: `docs/specs/06-ARQUITECTURA.md`, `docs/specs/07-CALIDAD-DESARROLLO.md`

---

### 2026-07-22 — Decisión: API versioning `/api/v1/`

**Contexto**: Definir estructura de endpoints.
**Decisión**: Usar prefijo `/api/v1/` para todos los endpoints.
**Razón**: Permite evolucionar la API sin romper clientes existentes. Es un estándar de la industria.
**Archivos**: `docs/specs/06-ARQUITECTURA.md`

---

### 2026-07-22 — Decisión: Vite como bundler del frontend

**Contexto**: Elegir herramienta de build para React + TypeScript.
**Decisión**: Usar Vite en lugar de Create React App (CRA).
**Razón**:
- Vite es significativamente más rápido (HMR instantáneo)
- CRA está oficialmente deprecated (2023)
- Vite tiene mejor soporte para TypeScript y ESM
- Configuración mínima out-of-the-box
- Mejor experiencia de desarrollo
**Archivos**: `AGENTS.md` (stack tecnológico)

---

## Aprendizajes

### 2026-07-22 — API catfact.ninja limitada

**Aprendizaje**: La API catfact.ninja solo tiene 2 endpoints funcionales:
- `GET /fact` → fact aleatorio
- `GET /facts?limit=N` → lista paginada

**NO existe**: `/breeds`, `/categories`, ni ningún otro endpoint. No asumir funcionalidad que no está documentada.

---

### 2026-07-22 — Specs deben cubrir 100% de puntos

**Aprendizaje**: El DESAFIO_TECNICO.md tiene:
- 50 pts Requerimientos Funcionales
- 50 pts No Funcionales
- 75 pts Bonus (disponibles)

Total: 175 pts. Las specs deben cubrir el 100% + extras.

---

## Estado del Desarrollo

| Fase | Estado | Notas |
|------|--------|-------|
| Especificaciones | ✅ Completado | 100% cubierto |
| AGENTS.md | ✅ Completado | Contexto para AI assistants |
| MEMORY.md | ✅ Completado | Este archivo |
| Setup Backend | ⏳ Pendiente | Ruby on Rails API |
| Setup Frontend | ⏳ Pendiente | React + TypeScript |
| Funcionalidades | ⏳ Pendiente | RF-01 a RF-05 |
| Tests | ⏳ Pendiente | Unit + Integration |
| Docker | ⏳ Pendiente | docker-compose.yml |
| CI/CD | ⏳ Pendiente | GitHub Actions |
| Deploy | ⏳ Pendiente | AWS |

---

## Errores Comunes a Evitar

1. **No usar `/breeds`** — No existe en la API externa
2. **No crear archivos con espacios** — Usar kebab-case o snake_case
3. **No saltar eager loading** — Siempre usar `.includes()` para evitar N+1
4. **No hardcodear secretos** — Usar variables de entorno
5. **No mezclar funcionalidades** — Un commit = una tarea
6. **No usar Redux** — Usar React hooks para estado
7. **No usar Repository Pattern** — ActiveRecord ya provee abstracción

---

## Próximos Pasos

1. Inicializar backend con `rails new --api`
2. Configurar PostgreSQL y Redis
3. Implementar `01-REGISTRO-USUARIOS.md`
4. Seguir el orden de las specs
5. Actualizar este archivo con cada corrección
