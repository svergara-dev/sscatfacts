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

### 2026-07-23 — Corrección: 3 rondas de consistencia cross-spec (13 specs)

**Contexto**: Se realizó auditoría completa de consistencia entre las 12 specs (01-05 funcionales, 06-09 no funcionales, README, SETUP) y DESAFIO_TECNICO.
**Corrección**: Se corrigieron 15+ inconsistencias en 3 rondas:
- **Ronda 1** (commits c26a546→2763f46): Endpoints, tablas, puertos, Redux→Context, formatos de respuesta
- **Ronda 2** (commit dfd86c8): HU-02 contradicción, README Redux→Context, Docker :8080, HU-12 period filter, paginación
- **Ronda 3** (commit 9c3a561): Tabla de errores completa (13 códigos), liked/likesCount en RF-03-01, Top N sin paginación, infinite scroll clarificado, password validation en modelo
- **AGENTS.md** (commit pendiente): DELETE favoritos, tabla two_factor_codes, puertos, formato respuesta, rate limiting, JWT
**Razón**: Las specs eran el contrato de implementación. Inconsistencias causarían bugs y retrabajo durante el desarrollo.
**Archivos**: Todas las specs en `docs/specs/`, `AGENTS.md`

---

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

### 2026-07-22 — Decisión: Responsive Design como No Funcional

**Contexto**: Definir si responsive design era bonus o requerimiento base.
**Decisión**: Agregar como Requerimiento No Funcional en `06-ARQUITECTURA.md`.
**Razón**:
- En 2026, toda app web debe ser responsive
- Tailwind ya está contemplado (bonus), hace responsive casi gratis
- El evaluador probará en diferentes dispositivos
- No es esfuerzo extra, es estándar de la industria
**Archivos**: `docs/specs/06-ARQUITECTURA.md`

---

### 2026-07-22 — Decisión: Infinite Scroll incluido

**Contexto**: Infinite scroll estaba en "No incluido" en las HUs.
**Decisión**: Mover a "Incluido" en HU-07b, HU-08, HU-11.
**Razón**:
- Demuestra manejo de grandes volúmeles de datos
- Mejor UX que paginación tradicional
- Técnica estándar en apps modernas
- Implementación viable con IntersectionObserver
**Archivos**: `docs/specs/03-CONSULTAR-MARCAR-FACTS.md`, `04-LISTA-FACTS-GUSTADOS.md`, `05-FACTS-POPULARES.md`

---

### 2026-07-22 — Decisión: Lefthook en lugar de Husky

**Contexto**: Elegir herramienta para Git hooks (pre-commit, pre-push).
**Decisión**: Usar Lefthook en lugar de Husky.
**Razón**:
- Lefthook funciona tanto para Ruby (backend) como JS (frontend)
- Un solo archivo de configuración para ambos
- Más rápido que Husky
- No depende de npm para el backend
**Archivos**: `docs/specs/07-CALIDAD-DESARROLLO.md` (sección 6.5), `AGENTS.md`

---

### 2026-07-22 — Decisión: SonarQube documentado pero no implementado

**Contexto**: Considerar herramientas de análisis estático de código.
**Decisión**: Documentar SonarQube como opción futura, no implementarlo ahora.
**Razón**:
- Para un test técnico, la configuración completa añade complejidad innecesaria
- Los linters (RuboCop, ESLint) ya cubren la mayoría de issues
- GitHub Actions ya ejecuta tests y lint en cada PR
- En producción con múltiples desarrolladores sería recomendable
**Archivos**: `docs/specs/README.md` (sección "Mejoras Futuras")

---

## Aprendizajes

### 2026-07-23 — Consistencia cross-spec es crítica antes de codificar

**Aprendizaje**: Antes de empezar a codificar, se debe hacer una auditoría completa de consistencia entre TODAS las specs. Las inconsistencias más comunes son:
- Nombres de tablas/campos diferentes entre specs
- Códigos de error no definidos en la tabla maestra (06-ARQUITECTURA)
- Formatos de respuesta diferentes entre endpoints
- Endpoints faltantes en la tabla consolidada
- Contradicciones entre HU "No incluido" y los RF

**Solución**: Tener 06-ARQUITECTURA.md como fuente de verdad para endpoints, tablas, errores y formatos. Todas las specs individuales deben referenciarla.

---

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

### 2026-07-23 — AGENTS.md debe alinearse con specs

**Aprendizaje**: AGENTS.md es el punto de entrada para AI assistants. Debe reflejar exactamente lo que dicen las specs:
- Endpoints correctos (incluyendo DELETE favoritos)
- Nombres de tablas correctos (`two_factor_codes`, no `two_factors`)
- Formato de respuesta estándar
- Rate limiting detallado
- JWT config (HS256, 24h)
- Puertos (8080 Docker, 5173 manual)
- State management: React Context + Custom Hooks (NO Redux/Zustand)

---

## Estado del Desarrollo

| Fase | Estado | Notas |
|------|--------|-------|
| Especificaciones | ✅ Completado | 100% cubierto, 3 rondas de consistencia |
| Consistencia cross-spec | ✅ Completado | 15+ inconsistencias corregidas |
| AGENTS.md | ✅ Completado | Actualizado con endpoints, puertos, JWT, rate limiting |
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
6. **No usar Redux** — Usar React Context + Custom Hooks
7. **No usar Repository Pattern** — ActiveRecord ya provee abstracción
8. **No usar `password_hash`** — Usar `password_digest` (bcrypt via `has_secure_password`)
9. **No olvidar `meta` fuera de `data`** — Formato de paginación: `{ success, data: { facts: [...] }, meta: { currentPage, ... } }`
10. **No documentar endpoints inexistentes** — API externa solo tiene `/fact` y `/facts`

---

## Próximos Pasos

1. ~~Auditar consistencia cross-spec~~ ✅ Completado (3 rondas, 15+ correcciones)
2. Crear rama `feature/01-registro-usuarios` desde `develop`
3. Inicializar backend con `rails new --api`
4. Configurar PostgreSQL y Redis
5. Implementar `01-REGISTRO-USUARIOS.md`
6. Seguir el orden de las specs (01 → 02 → 03 → ...)
7. Actualizar este archivo con cada corrección
