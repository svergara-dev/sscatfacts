# Especificación: Lista de Cat Facts Gustados

## Resumen

Esta especificación define el módulo que permite a los usuarios autenticados visualizar todos los cat facts que han marcado como favoritos (con like) en la plataforma.

## Contexto del Negocio

- **Módulo**: Cat Facts - Historial de Favoritos
- **Prioridad**: Alta (funcionalidad de retención de usuario)
- **Puntuación**: 10 puntos

---

## Requisitos Funcionales

### RF-04-01: Consultar Lista de Favoritos

**Descripción**: El sistema debe permitir al usuario visualizar todos los cat facts que ha marcado como favoritos.

**Criterios**:
- Solo muestra facts del usuario autenticado
- Ordenados por fecha de like (más recientes primero)
- Incluye el texto del fact y fecha en que se marcó

### RF-04-02: Paginación de Resultados

**Descripción**: La lista debe implementar paginación para manejar grandes volúmenes de datos.

**Parámetros**:
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 50)

### RF-04-03: Eliminar de Favoritos

**Descripción**: Desde la lista de favoritos, el usuario debe poder eliminar un fact de su lista.

**Criterios**:
- Confirmación antes de eliminar
- Se elimina el registro de la tabla `user_likes`
- La lista se actualiza dinámicamente

### RF-04-04: Conteo Total de Favoritos

**Descripción**: El sistema debe mostrar el total de facts favoritos del usuario.

**Criterios**:
- Contador visible en la interfaz
- Se actualiza al agregar/eliminar favoritos

---

## Requisitos No Funcionales

### Rendimiento
- Tiempo de respuesta < 500ms para obtener lista paginada
- Consulta optimizada con índices en `user_likes`

### Usabilidad
- Scroll infinito o paginación tradicional (decidir según UX)
- Indicador de carga al obtener datos
- Mensaje claro cuando no hay favoritos

---

## Modelo de Datos

### Tablas Utilizadas

**Tabla `cat_facts`**:
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

**Tabla `user_likes`**:
```sql
CREATE TABLE user_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fact_id INTEGER NOT NULL REFERENCES cat_facts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fact_id)
);
```

### Consulta Optimizada

```sql
SELECT 
    cf.id,
    cf.fact_text,
    cf.length,
    ul.created_at as liked_at
FROM user_likes ul
JOIN cat_facts cf ON ul.fact_id = cf.id
WHERE ul.user_id = $1
ORDER BY ul.created_at DESC
LIMIT $2 OFFSET $3;
```

---

## API Contract

### GET `/api/v1/users/favorites`

**Headers**: `Authorization: Bearer <jwt_token>`

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 50)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "facts": [
      {
        "id": 1,
        "fact": "Cats have over 20 vocalizations...",
        "length": 58,
        "likedAt": "2026-07-20T10:30:00Z"
      },
      {
        "id": 2,
        "fact": "A group of cats is called a clowder...",
        "length": 42,
        "likedAt": "2026-07-19T15:45:00Z"
      }
    ]
  },
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10
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

---

### DELETE `/api/v1/users/favorites/:factId`

**Headers**: `Authorization: Bearer <jwt_token>`

**Response 200**:
```json
{
  "success": true,
  "message": "Fact eliminado de favoritos"
}
```

**Response 404**:
```json
{
  "success": false,
  "error": {
    "code": "FAVORITE_NOT_FOUND",
    "message": "Este fact no está en tus favoritos"
  }
}
```

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| Usuario sin favoritos | Respuesta 200 con array vacío |
| Página fuera de rango | Respuesta 200 con última página válida |
| Intentar eliminar fact no favorito | Error 404 |
| Token expirado | Error 401 |
| Límite mayor a 50 | Se ajusta a 50 automáticamente |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede ver lista de sus facts favoritos
- [ ] CA-02: Lista muestra facts ordenados por fecha (más reciente primero)
- [ ] CA-03: Paginación funciona correctamente con page y limit
- [ ] CA-04: Contador total refleja cantidad real de favoritos
- [ ] CA-05: Usuario puede eliminar facts de favoritos
- [ ] CA-06: Se muestra mensaje cuando no hay favoritos
- [ ] CA-07: Tiempo de respuesta es aceptable (< 500ms)
- [ ] CA-08: Solo muestra facts del usuario autenticado

---

## Historias de Usuario Relacionadas

### HU-08: Como usuario autenticado, quiero ver todos mis facts favoritos para revisarlos después.

**Alcance - Incluido:**
- Lista de facts favoritos con infinite scroll
- Carga incremental al hacer scroll
- Ordenamiento por fecha (más reciente primero)
- Texto del fact y fecha de like
- Contador total de favoritos

**Alcance - No incluido:**
- Exportar favoritos (CSV, PDF)
- Compartir lista de favoritos
- Carpeta/categoría de favoritos
- Búsqueda dentro de favoritos

**Given** que el usuario tiene facts marcados como favoritos
**When** accede a "Mis Favoritos"
**Then** el sistema muestra la lista paginada de facts

### HU-09: Como usuario autenticado, quiero quitar facts de mi lista de favoritos.

**Alcance - Incluido:**
- Botón de eliminar por fact
- Confirmación antes de eliminar
- Actualización inmediata de la lista
- Contador actualizado

**Alcance - No incluido:**
- Eliminación múltiple (selección en lote)
- Papelera de reciclaje (restaurar)
- Notificación de confirmación

**Given** que el usuario está en su lista de favoritos
**When** hace clic en eliminar un fact
**Then** el sistema elimina el fact de la lista y actualiza el contador

### HU-10: Como usuario autenticado, quiero saber cuántos facts tengo guardados.

**Alcance - Incluido:**
- Contador visible en la vista de favoritos
- Actualización en tiempo real
- Formato legible (ej: "48 facts")

**Alcance - No incluido:**
- Estadísticas detalladas (likes por día, etc.)
- Gráficos de actividad
- Comparación con otros usuarios

**Given** que el usuario accede a su perfil o lista de favoritos
**When** se carga la página
**Then** se muestra el total de facts favoritos

---

## Interfaz de Usuario (Wireframe)

```
┌─────────────────────────────────────────────────────────────┐
│  Mis Facts Favoritos                              Total: 48  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ "Cats have over 20 vocalizations..."                │    │
│  │ Liked: 20/07/2026 10:30                    [Eliminar]│    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ "A group of cats is called a clowder..."           │    │
│  │ Liked: 19/07/2026 15:45                    [Eliminar]│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ← Anterior  Página 1 de 5  Siguiente →                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Notas de Implementación

1. Crear vista materializada si la tabla crece mucho
2. Implementar lazy loading para mejorar UX
3. Considerar exportar lista a CSV/PDF como funcionalidad adicional
4. Cache de primera página para carga rápida
