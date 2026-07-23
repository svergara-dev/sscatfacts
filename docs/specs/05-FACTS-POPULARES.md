# Especificación: Cat Facts Más Populares

## Resumen

Esta especificación define el módulo que permite a los usuarios autenticados visualizar los cat facts más populares (con más likes) de toda la comunidad de la plataforma.

## Contexto del Negocio

- **Módulo**: Cat Facts - Ranking de Popularidad
- **Prioridad**: Alta (funcionalidad social y de engagement)
- **Puntuación**: 10 puntos

---

## Requisitos Funcionales

### RF-05-01: Consultar Facts Populares

**Descripción**: El sistema debe mostrar un ranking de los cat facts con más likes de todos los usuarios.

**Criterios**:
- Ordenados por cantidad de likes (descendente)
- Incluye el texto del fact y cantidad de likes
- Muestra si el usuario actual ya dio like

### RF-05-02: Filtrar por Período (Opcional)

**Descripción**: El sistema debe permitir filtrar facts populares por período de tiempo.

**Opciones**:
- Última semana
- Último mes
- Todo el tiempo (default)

### RF-05-03: Paginación de Resultados

**Descripción**: Los resultados deben paginarse para mejor rendimiento.

**Parámetros**:
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 50)
- `period`: Filtro de tiempo (week, month, all)

### RF-05-04: Top N Facts (Destacados)

**Descripción**: El sistema debe permitir obtener los N facts más populares (ej: Top 10, Top 20).

**Criterios**:
- Endpoint dedicado para Top N
- Default: Top 10

### RF-05-05: Interacción con Facts Populares

**Descripción**: El usuario debe poder dar/quitar like desde esta vista.

**Criterios**:
- Botón de like/unlike funcional
- Actualización en tiempo real del contador

---

## Requisitos No Funcionales

### Rendimiento
- Tiempo de respuesta < 1s para ranking paginado
- Consulta optimizada con agregación en BD
- Cache del Top 10 por 5 minutos

### Consistencia
- Contadores actualizados en máximo 5 segundos después de like/unlike
- Datos consistentes entre vistas (favoritos vs populares)

### Escalabilidad
- Manejar millones de likes eficientemente
- Índices optimizados para consultas de agregación

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

CREATE INDEX idx_user_likes_fact_created ON user_likes(fact_id, created_at);
```

### Consulta de Ranking Optimizada

```sql
-- Ranking de facts más populares (todos los tiempos)
SELECT 
    cf.id,
    cf.fact_text,
    cf.length,
    COUNT(ul.id) as likes_count,
    EXISTS(
        SELECT 1 FROM user_likes ul2 
        WHERE ul2.user_id = $1 AND ul2.fact_id = cf.id
    ) as user_liked
FROM cat_facts cf
LEFT JOIN user_likes ul ON cf.id = ul.fact_id
GROUP BY cf.id, cf.fact_text, cf.length
ORDER BY likes_count DESC
LIMIT $2 OFFSET $3;

-- Ranking de facts populares del último mes
SELECT 
    cf.id,
    cf.fact_text,
    cf.length,
    COUNT(ul.id) as likes_count,
    EXISTS(
        SELECT 1 FROM user_likes ul2 
        WHERE ul2.user_id = $1 AND ul2.fact_id = cf.id
    ) as user_liked
FROM cat_facts cf
LEFT JOIN user_likes ul ON cf.id = ul.fact_id 
    AND ul.created_at >= NOW() - INTERVAL '1 month'
GROUP BY cf.id, cf.fact_text, cf.length
ORDER BY likes_count DESC
LIMIT $2 OFFSET $3;
```

---

## API Contract

### GET `/api/v1/facts/popular`

**Headers**: `Authorization: Bearer <jwt_token>`

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 50)
- `period` (opcional): Filtro de tiempo - `week`, `month`, `all` (default: `all`)

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
        "likesCount": 142,
        "userLiked": true,
        "rank": 1
      },
      {
        "id": 5,
        "fact": "A group of cats is called a clowder...",
        "length": 42,
        "likesCount": 128,
        "userLiked": false,
        "rank": 2
      }
    ]
  },
  "meta": {
    "currentPage": 1,
    "totalPages": 12,
    "totalItems": 118,
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

### GET `/api/v1/facts/top/:n`

**Headers**: `Authorization: Bearer <jwt_token>`

**Path Parameters**:
- `n`: Número de facts a obtener (máximo 100)

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
        "likesCount": 142,
        "userLiked": true,
        "rank": 1
      }
    ]
  }
}
```

---

### POST `/api/v1/facts/:id/like`

Igual que en especificación 03 - Consultar y Marcar Cat Facts

### DELETE `/api/v1/facts/:id/like`

Igual que en especificación 03 - Consultar y Marcar Cat Facts

---

## Casos Límite y Manejo de Errores

| Caso | Resultado Esperado |
|------|-------------------|
| No hay facts con likes | Respuesta 200 con array vacío |
| Período inválido | Error 400 "Período no válido" |
| N mayor a 100 | Se ajusta a 100 automáticamente |
| Página fuera de rango | Última página válida |
| Token expirado | Error 401 |

---

## Criterios de Aceptación

- [ ] CA-01: Usuario puede ver ranking de facts más populares
- [ ] CA-02: Facts ordenados por cantidad de likes (descendente)
- [ ] CA-03: Filtro por período funciona correctamente
- [ ] CA-04: Paginación funciona con page, limit y period
- [ ] CA-05: Top N retorna la cantidad solicitada
- [ ] CA-06: Se muestra si el usuario actual dio like a cada fact
- [ ] CA-07: Like/unlike actualiza el ranking dinámicamente
- [ ] CA-08: Tiempo de respuesta es aceptable (< 1s)
- [ ] CA-09: Cache funciona correctamente (datos frescos después de 5 min)

---

## Historias de Usuario Relacionadas

### HU-11: Como usuario autenticado, quiero ver qué facts son los más populares para descubrir contenido de calidad.

**Alcance - Incluido:**
- Ranking de facts por cantidad de likes con infinite scroll
- Carga incremental al hacer scroll
- Indicador de like del usuario actual
- Tiempo de respuesta < 1s

**Alcance - No incluido:**
- Tendencias (facts que suben rápido)
- Recomendaciones personalizadas
- Ranking global vs por usuario

**Given** que el usuario accede a "Facts Populares"
**When** se carga la página
**Then** el sistema muestra el ranking de facts con más likes

### HU-12: Como usuario autenticado, quiero filtrar facts populares por período.

**Alcance - Incluido:**
- Filtros: Última semana, Último mes, Último año, Todo
- Actualización del ranking al cambiar filtro
- Estado activo del filtro seleccionado

**Alcance - No incluido:**
- Rango de fechas personalizado
- Comparación entre períodos
- Exportar datos del período

**Given** que el usuario está en la vista de facts populares
**When** selecciona "Último mes"
**Then** el sistema muestra solo facts popularizados en el último mes

### HU-13: Como usuario autenticado, quiero dar like desde la vista de populares.

**Alcance - Incluido:**
- Like/unlike directo desde el ranking
- Actualización inmediata del ranking
- Optimistic update
- Contador de likes actualizado

**Alcance - No incluido:**
- Like múltiple (selección en lote)
- Notificar cuando un fact tuyo sube al ranking
- Compartir fact popular

**Given** que el usuario ve un fact popular sin su like
**When** hace clic en el corazón
**Then** el like se registra y el ranking se actualiza

---

## Diagrama de Ranking

```
┌─────────────────────────────────────────────────────────────┐
│  Facts Más Populares 🏆                            [Filtro] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🥇 #1  "Cats have over 20 vocalizations..."       ❤️ 142  │
│                                                             │
│  🥈 #2  "A group of cats is called a clowder..."   🤍 128  │
│                                                             │
│  🥉 #3  "Cats sleep 12-16 hours per day..."         ❤️ 95  │
│                                                             │
│  #4  "A cat's purr vibrates at 25-150 Hz..."        🤍 87  │
│                                                             │
│  #5  "Cats have 230 bones..."                        ❤️ 76  │
│                                                             │
│  ← Anterior  Página 1 de 12  Siguiente →                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Notas de Implementación

1. Crear vista materializada `mv_fact_popularity` para consultas rápidas
2. Actualizar vista con trigger después de INSERT/DELETE en `user_likes`
3. Implementar Redis cache para Top 10 (TTL: 5 minutos)
4. Considerar job en background para recálculo periódico
5. Índice parcial para filtros de tiempo eficientes
