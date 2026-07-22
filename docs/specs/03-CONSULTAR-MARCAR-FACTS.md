# Especificación: Consultar y Marcar Cat Facts

## Resumen

Esta especificación define el módulo que permite a los usuarios autenticados consultar cat facts desde la API externa y marcar los que les gustan para guardarlos en su perfil.

## Contexto del Negocio

- **Módulo**: Cat Facts - Consulta y Likes
- **Prioridad**: Alta (funcionalidad principal de la plataforma)
- **Puntuación**: 10 puntos
- **API Externa**: https://catfact.ninja/

---

## Requisitos Funcionales

### RF-03-01: Consultar Cat Fact Aleatorio

**Descripción**: El sistema debe consumir la API externa de cat facts y presentar un fact aleatorio al usuario.

**Flujo**:
1. Usuario hace clic en "Obtener nuevo fact"
2. Backend consulta API externa `https://catfact.ninja/fact`
3. Backend retorna el fact al frontend
4. Frontend muestra el fact al usuario

### RF-03-02: Marcar Cat Fact como Favorito (Like)

**Descripción**: El sistema debe permitir al usuario marcar un cat fact como "me gusta".

**Criterios**:
- Solo usuarios autenticados pueden marcar facts
- Un usuario solo puede marcar un fact una vez
- El like se almacena en la base de datos
- El sistema debe verificar si el usuario ya marcó ese fact

### RF-03-03: Desmarcar Cat Fact (Unlike)

**Descripción**: El sistema debe permitir al usuario retirar su like de un fact.

**Criterios**:
- El like se elimina de la base de datos
- El contador de likes se actualiza

### RF-03-04: Mostrar Estado del Like

**Descripción**: El sistema debe indicar visualmente si el usuario actual ya marcó like a un fact.

**Indicadores**:
- Corazón vacío: No marcado
- Corazón lleno: Marcado con like
- Contador de likes del fact

### RF-03-05: Obtener Siguiente Fact

**Descripción**: El sistema debe permitir al usuario solicitar un nuevo fact sin recargar la página.

### RF-03-06: Listar Cat Facts Disponibles

**Descripción**: El sistema debe consumir el endpoint de listado de la API externa para mostrar múltiples facts disponibles.

**API Externa**: `GET https://catfact.ninja/facts`

**Respuesta de la API externa**:
```json
{
  "current_page": 1,
  "data": [
    {
      "fact": "Unlike dogs, cats do not have a sweet tooth...",
      "length": 114
    },
    {
      "fact": "When a cat chases its prey, it keeps its head level...",
      "length": 97
    }
  ],
  "last_page": 34,
  "per_page": 10,
  "total": 332
}
```

**Criterios**:
- Backend consume la API externa y retorna los facts al frontend
- Soporte para paginación (parámetros: `page`, `limit`)
- Cachear facts consultados para reducir llamadas externas
- Mostrar indicador de carga durante la consulta

---

## Requisitos No Funcionales

### Disponibilidad
- Manejar errores de la API externa con retry logic (máx 3 intentos)
- Mostrar mensaje amigable si la API externa no está disponible
- Cache de facts previamente consultados (opcional)

### Rendimiento
- Tiempo de respuesta < 1s para obtener fact (incluyendo llamada externa)
- Operaciones de like/unlike < 200ms

### Seguridad
- Solo usuarios autenticados (con JWT válido) pueden marcar facts
- Validar que el fact_id existe antes de crear like

---

## Modelo de Datos

### Tabla: `cat_facts`

```sql
CREATE TABLE cat_facts (
    id SERIAL PRIMARY KEY,
    fact_text TEXT NOT NULL,
    length INTEGER,
    api_fact_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(api_fact_id)
);
```

### Tabla: `user_likes`

```sql
CREATE TABLE user_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fact_id INTEGER NOT NULL REFERENCES cat_facts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fact_id)
);

CREATE INDEX idx_user_likes_user ON user_likes(user_id);
CREATE INDEX idx_user_likes_fact ON user_likes(fact_id);
```

---

## API Contract

### GET `/api/facts/random`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fact": "Cats have over 20 vocalizations, including the purr.",
    "length": 58,
    "liked": false,
    "likesCount": 42
  }
}
```

**Response 401**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token inválido o expirado"
  }
}
```

**Response 503**:
```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "No se pudo obtener el cat fact. Intente más tarde."
  }
}
```

---

### POST `/api/facts/:id/like`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 43
  }
}
```

**Response 409**:
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_LIKED",
    "message": "Ya has marcado like a este fact"
  }
}
```

---

### DELETE `/api/facts/:id/like`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response 200**:
```json
{
  "success": true,
  "data": {
    "liked": false,
    "likesCount": 42
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": {
    "code": "LIKE_NOT_FOUND",
    "message": "No tienes like en este fact"
  }
}
```

---

### GET `/api/facts/list`

**Headers**: `Authorization: Bearer <jwt_token>`

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 50)

**Descripción**: Obtiene una lista paginada de cat facts consumiendo la API externa.

**Response 200**:
```json
{
  "success": true,
  "data": {
    "facts": [
      {
        "id": "ext_abc123",
        "fact": "Unlike dogs, cats do not have a sweet tooth...",
        "length": 114,
        "liked": false,
        "likesCount": 12
      },
      {
        "id": "ext_def456",
        "fact": "When a cat chases its prey, it keeps its head level...",
        "length": 97,
        "liked": true,
        "likesCount": 8
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 34,
      "totalItems": 332,
      "itemsPerPage": 10
    }
  }
}
```

**Response 503**:
```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "No se pudieron obtener los facts. Intente más tarde."
  }
}
```

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| API externa no disponible | Reintentar 3 veces, luego error 503 |
| Usuario no autenticado | Error 401 |
| Fact ya marcado con like | Error 409 |
| Intentar unlike sin like previo | Error 404 |
| ID de fact no existe | Error 404 |
| Token expirado | Error 401 |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede obtener un cat fact aleatorio de la API externa
- [ ] CA-02: Usuario puede marcar un fact como favorito
- [ ] CA-03: Sistema previene likes duplicados
- [ ] CA-04: Usuario puede desmarcar un fact
- [ ] CA-05: El estado del like se muestra correctamente
- [ ] CA-06: Se muestra el contador de likes actualizado
- [ ] CA-07: Se maneja correctamente errores de la API externa
- [ ] CA-08: Solo usuarios autenticados pueden interactuar
- [ ] CA-09: Usuario puede listar múltiples facts paginados desde la API externa
- [ ] CA-10: Paginación funciona correctamente (page, limit)
- [ ] CA-11: Se muestra indicador de carga durante consulta a API externa
- [ ] CA-12: Facts se cachean para reducir llamadas externas

---

## Historias de Usuario Relacionadas

### HU-05: Como usuario autenticado, quiero ver cat facts aleatorios para divertirme y aprender.

**Alcance - Incluido:**
- Botón "Nuevo Fact" que consulta API externa
- Indicador de carga durante consulta
- Manejo de errores de API externa
- Cache de facts consultados

**Alcance - No incluido:**
- Historial de facts consultados
- Favoritos en la vista de facts
- Compartir facts en redes sociales
- Facts por categoría

**Given** que el usuario está en la página principal autenticado
**When** hace clic en "Nuevo Fact"
**Then** el sistema muestra un nuevo cat fact de la API externa

### HU-06: Como usuario autenticado, quiero marcar los facts que me gustan para guardarlos.

**Alcance - Incluido:**
- Corazón como botón de like
- Optimistic update (UI instantánea)
- Contador de likes actualizado
- Prevención de likes duplicados

**Alcance - No incluido:**
- Comentarios en facts
- Rating (1-5 estrellas)
- Compartir fact específico
- Notificar al autor del like

**Given** que el usuario ve un cat fact
**When** hace clic en el corazón para marcar like
**Then** el sistema guarda el like y muestra el corazón lleno

### HU-07: Como usuario autenticado, quiero quitar mi like si cambio de opinión.

**Alcance - Incluido:**
- Toggle del corazón (lleno/vacío)
- Optimistic update
- Contador de likes actualizado
- Confirmación visual inmediata

**Alcance - No incluido:**
- Historial de likes removidos
- Límite de cambios por día
- Notificación de cambio

**Given** que el usuario tiene marcado like a un fact
**When** hace clic en el corazón lleno
**Then** el sistema elimina el like y muestra el corazón vacío

### HU-07b: Como usuario autenticado, quiero ver una lista de facts para explorar más contenido.

**Alcance - Incluido:**
- Lista de facts con infinite scroll
- Carga incremental al hacer scroll
- Indicador de carga durante fetch
- Estado de like por fact
- Manejo de grandes volúmenes de datos

**Alcance - No incluido:**
- Búsqueda de facts
- Filtros por categoría
- Ordenamiento personalizado
- Infinite scroll

**Given** que el usuario accede a la sección de facts
**When** se carga la página
**Then** el sistema muestra una lista paginada de facts disponibles

---

## Diagrama de Secuencia

```
User -> Frontend: Clic "Nuevo Fact"
Frontend -> Backend: GET /api/facts/random
Backend -> API Externa: GET https://catfact.ninja/fact
API Externa --> Backend: { fact: "..." }
Backend -> BD: Guardar/Obtener fact
Backend --> Frontend: { fact, liked: false, likesCount }
Frontend --> User: Mostrar fact con corazón vacío

User -> Frontend: Clic corazón (like)
Frontend -> Backend: POST /api/facts/:id/like
Backend -> BD: INSERT INTO user_likes
Backend --> Frontend: { liked: true, likesCount: 43 }
Frontend --> User: Corazón lleno, contador actualizado

User -> Frontend: Accede a "Lista de Facts"
Frontend -> Backend: GET /api/facts/list?page=1&limit=10
Backend -> API Externa: GET https://catfact.ninja/facts?page=1
API Externa --> Backend: { data: [...], total: 332 }
Backend -> BD: Verificar likes del usuario
Backend --> Frontend: { facts: [...], pagination }
Frontend --> User: Mostrar lista paginada de facts
```

---

## Notas de Implementación

1. Implementar servicio de caché para facts consultados
2. Usar circuit breaker pattern para llamadas a API externa
3. Considerar cola de mensajes si la API externa tiene rate limiting estricto
4. Logging de llamadas a API externa para monitoreo
