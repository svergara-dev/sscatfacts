# Especificación: Diagramas UML

## Resumen

Esta especificación define los diagramas UML del sistema SSCatFacts, incluyendo diagramas de secuencia, despliegue, entidad-relación, componentes y casos de uso.

## Contexto del Negocio

- **Módulo**: Documentación UML
- **Prioridad**: Media (documentación visual del sistema)
- **Puntuación**: 10 puntos

---

## 1. Diagrama de Secuencia (3 pts)

### 1.1 Flujo: Registro de Usuario

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario │     │  Frontend   │     │   Backend   │     │  PostgreSQL │
│ (App)   │     │  (React)    │     │  (Rails)    │     │    (BD)     │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │                   │
     │  1. Ingresa     │                   │                   │
     │  username y     │                   │                   │
     │  password       │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 2. POST           │                   │
     │                 │ /api/v1/auth/     │                   │
     │                 │ register          │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 3. Verificar       │
     │                 │                   │ username único     │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │ 4. Retornar        │
     │                 │                   │ resultado         │
     │                 │                   │<──────────────────│
     │                 │                   │                   │
     │                 │                   │ 5. Hashear         │
     │                 │                   │ password          │
     │                 │                   │ (bcrypt)          │
     │                 │                   │                   │
     │                 │                   │ 6. Insertar        │
     │                 │                   │ usuario           │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │ 7. Confirmar       │
     │                 │                   │ inserción         │
     │                 │                   │<──────────────────│
     │                 │                   │                   │
     │                 │ 8. Retornar       │                   │
     │                 │ 201 Created       │                   │
     │                 │ { id, username }  │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │ 9. Mostrar      │                   │                   │
     │ mensaje éxito   │                   │                   │
     │ y redirigir     │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
```

### 1.2 Flujo: Login + Obtener Fact

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario │     │  Frontend   │     │   Backend   │     │ catfact.ninja│
│ (App)   │     │  (React)    │     │  (Rails)    │     │  (API Ext)  │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │                   │
     │ 1. Ingresa      │                   │                   │
     │ credenciales    │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 2. POST           │                   │
     │                 │ /api/v1/auth/     │                   │
     │                 │ login             │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │ 3. Verificar       │                   │
     │                 │ credenciales      │                   │
     │                 │                   │                   │
     │                 │ 4. Generar JWT    │                   │
     │                 │ token             │                   │
     │                 │                   │                   │
     │                 │ 5. Retornar       │                   │
     │                 │ token + user      │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │ 6. Almacenar    │                   │                   │
     │ token en        │                   │                   │
     │ localStorage    │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │ 7. Clic "Nuevo  │                   │                   │
     │ Fact"           │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 8. GET            │                   │
     │                 │ /api/v1/facts/    │                   │
     │                 │ random            │                   │
     │                 │ + JWT header      │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 9. GET             │
     │                 │                   │ /fact             │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │ 10. Retornar       │
     │                 │                   │ fact               │
     │                 │                   │<──────────────────│
     │                 │                   │                   │
     │                 │ 11. Retornar      │                   │
     │                 │ fact + likes      │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │ 12. Mostrar     │                   │                   │
     │ fact            │                   │                   │
     │<────────────────│                   │                   │
```

### 1.3 Flujo: Marcar Like

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario │     │  Frontend   │     │   Backend   │
│ (App)   │     │  (React)    │     │  (Rails)    │
└────┬────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │
     │ 1. Clic corazón │                   │
     │ (like)          │                   │
     │────────────────>│                   │
     │                 │                   │
     │                 │ 2. POST            │
     │                 │ /api/v1/facts/     │
     │                 │ {id}/like          │
     │                 │ + JWT header       │
     │                 │──────────────────>│
     │                 │                   │
     │                 │ 3. Verificar       │
     │                 │ like existente     │
     │                 │                   │
     │                 │ 4. Insertar        │
     │                 │ en user_likes      │
     │                 │                   │
     │                 │ 5. Actualizar      │
     │                 │ contador likes     │
     │                 │                   │
     │                 │ 6. Retornar        │
     │                 │ { liked: true,     │
     │                 │   likesCount: 43 } │
     │                 │<──────────────────│
     │                 │                   │
     │ 7. Actualizar   │                   │
     │ UI: corazón     │                   │
     │ lleno + count   │                   │
     │<────────────────│                   │
```

---

## 2. Diagrama de Despliegue (3 pts)

### 2.1 Arquitectura AWS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                       │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROUTE 53                                           │
│                    DNS: sscatfacts.com                                        │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFRONT                                           │
│                    CDN + SSL/TLS Certificate                                 │
│                    (AWS Certificate Manager)                                 │
└───────────┬─────────────────────────────┴───────────────────────────────────┘
            │                                             │
            ▼                                             ▼
┌───────────────────────┐                 ┌─────────────────────────────────┐
│         S3            │                 │            ALB                  │
│   Frontend Bucket     │                 │   Application Load Balancer     │
│                       │                 │                                 │
│   - index.html        │                 │   - Target Group: Backend       │
│   - static/           │                 │   - Health Check: /health       │
│   - assets/           │                 │   - SSL Termination             │
│                       │                 │                                 │
│   www.sscatfacts.com  │                 │   api.sscatfacts.com            │
└───────────────────────┘                 └───────────────┬─────────────────┘
                                                          │
                                                          ▼
                                        ┌─────────────────────────────────┐
                                        │           ECS/FARGATE           │
                                        │                                 │
                                        │   ┌─────────────────────────┐   │
                                        │   │    Backend Container    │   │
                                        │   │      Ruby on Rails      │   │
                                        │   │        (API)            │   │
                                        │   │                         │   │
                                        │   │   - Port: 3000          │   │
                                        │   │   - Memory: 512MB       │   │
                                        │   │   - CPU: 256 units      │   │
                                        │   └─────────────────────────┘   │
                                        │                                 │
                                        │   ┌─────────────────────────┐   │
                                        │   │    Sidekiq Container    │   │
                                        │   │   Background Workers    │   │
                                        │   └─────────────────────────┘   │
                                        │                                 │
                                        │   Service: sscatfacts-backend   │
                                        │   Cluster: sscatfacts-prod      │
                                        └───────────────┬─────────────────┘
                                                        │
                              ┌─────────────────────────┼─────────────────────────┐
                              │                         │                         │
                              ▼                         ▼                         ▼
                ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
                │         RDS           │ │     ElastiCache       │ │        ECR            │
                │     PostgreSQL        │ │        Redis          │ │   Docker Registry     │
                │                       │ │                       │ │                       │
                │   - Engine: 15.x      │ │   - Engine: 7.x       │ │   - Repositories:     │
                │   - Instance: db.t3   │ │   - Instance: cache   │ │     - sscatfacts-     │
                │     .medium           │ │     .t3.small         │ │       backend         │
                │   - Multi-AZ: Yes     │ │   - Cluster Mode: No  │ │     - sscatfacts-     │
                │   - Backup: Daily     │ │   - Encryption: Yes   │ │       sidekiq         │
                │                       │ │                       │ │                       │
                │   sscatfacts-db       │ │   sscatfacts-redis    │ │                       │
                └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### 2.2 Desarrollo Local (Docker)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE (Local)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │    Frontend     │    │    Backend      │    │    PostgreSQL   │         │
│  │   React:8080    │───▶│   Rails:3000    │───▶│    :5432        │         │
│  │                 │    │                 │    │                 │         │
│  │  Volumes:       │    │  Volumes:       │    │  Volumes:       │         │
│  │  ./src:/app/src │    │  ./backend:/app │    │  postgres_data  │         │
│  └─────────────────┘    └────────┬────────┘    └─────────────────┘         │
│                                  │                                          │
│                                  │                                          │
│                                  ▼                                          │
│                    ┌─────────────────────┐                                  │
│                    │       Redis         │                                  │
│                    │       :6379         │                                  │
│                    │                     │                                  │
│                    │  Volumes:           │                                  │
│                    │  redis_data         │                                  │
│                    └─────────────────────┘                                  │
│                                                                             │
│  Red: sscatfacts-network (bridge)                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Diagrama Entidad-Relación (2 pts)

### 3.1 Modelo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMA ENTIDAD-RELACIÓN                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────┐
    │            users              │
    ├───────────────────────────────┤
    │ PK id                         │
    │    username (UNIQUE, NOT NULL)│
    │    password_digest (NOT NULL)  │
    │    email (UNIQUE, NULL)       │  ← Opcional
    │    two_factor_secret (NULL)   │  ← Opcional (2FA)
    │    two_factor_enabled         │  ← Default: FALSE
    │    created_at                 │
    │    updated_at                 │
    └───────────────┬───────────────┘
                    │
                    │ 1
                    │
                    │ N
    ┌───────────────┴───────────────┐
    │         user_likes            │
    ├───────────────────────────────┤
    │ PK id                         │
    │ FK user_id → users.id         │
    │ FK fact_id → cat_facts.id     │
    │    created_at                 │
    ├───────────────────────────────┤
    │ UNIQUE(user_id, fact_id)      │
    └───────────────┬───────────────┘
                    │
                    │ N
                    │
                    │ 1
    ┌───────────────┴───────────────┐
    │          cat_facts            │
    ├───────────────────────────────┤
    │ PK id                         │
    │    fact_text (NOT NULL)       │
    │    length                     │
    │    api_fact_id (UNIQUE)       │  ← ID de la API externa
    │    created_at                 │
    └───────────────────────────────┘


    ┌───────────────────────────────┐
    │       login_attempts          │  ← Opcional (auditoría)
    ├───────────────────────────────┤
    │ PK id                         │
    │ FK user_id → users.id (NULL)  │  ← Puede ser NULL si usuario no existe
    │    ip_address (NOT NULL)      │
    │    attempted_at               │
    │    success (DEFAULT: FALSE)   │
    │    user_agent (NULL)          │
    └───────────────────────────────┘
```

### 3.2 Relaciones

| Relación | Tipo | Cardinalidad | Descripción |
|----------|------|--------------|-------------|
| users → user_likes | 1:N | Un usuario tiene muchos likes | Un usuario puede marcar múltiples facts |
| cat_facts → user_likes | 1:N | Un fact tiene muchos likes | Un fact puede ser gustado por múltiples usuarios |
| users → login_attempts | 1:N | Un usuario tiene muchos intentos | Auditoría de intentos de login |

### 3.3 Índices

```sql
-- users
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- user_likes
CREATE UNIQUE INDEX idx_user_likes_unique ON user_likes(user_id, fact_id);
CREATE INDEX idx_user_likes_user ON user_likes(user_id);
CREATE INDEX idx_user_likes_fact ON user_likes(fact_id);

-- cat_facts
CREATE UNIQUE INDEX idx_cat_facts_api_id ON cat_facts(api_fact_id);

-- login_attempts
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);
CREATE INDEX idx_login_attempts_user ON login_attempts(user_id);
```

---

## 4. Diagrama de Componentes (1 pt)

### 4.1 Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMA DE COMPONENTES                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                           React + TypeScript                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │     Pages       │  │   Components    │  │     Hooks       │             │
│  │                 │  │                 │  │                 │             │
│  │  - LoginPage    │  │  - FactCard     │  │  - useAuth      │             │
│  │  - RegisterPage │  │  - LoginForm    │  │  - useFacts     │             │
│  │  - FactsPage    │  │  - RegisterForm │  │  - useLikes     │             │
│  │  - FavoritesPage│  │  - LikeButton   │  │                 │             │
│  │  - PopularPage  │  │  - Pagination   │  │                 │             │
│  │                 │  │  - Header       │  │                 │             │
│  │                 │  │  - Loading      │  │                 │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Services (API)                              │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │   authService   │  │   factsService  │  │   usersService  │     │   │
│  │  │                 │  │                 │  │                 │     │   │
│  │  │  - register()   │  │  - getRandom()  │  │  - getFavorites│     │   │
│  │  │  - login()      │  │  - getList()    │  │  - addFavorite │     │   │
│  │  │  - logout()     │  │  - like()       │  │  - removeFav   │     │   │
│  │  │                 │  │  - unlike()     │  │                 │     │   │
│  │  │                 │  │  - getPopular() │  │                 │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                │ Axios (HTTP)                               │
│                                │ + JWT Header                               │
│                                ▼                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │ JSON
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                         │
│                          Ruby on Rails (API)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Controllers                                  │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │  AuthController │  │  FactsController│  │ UsersController │     │   │
│  │  │                 │  │                 │  │                 │     │   │
│  │  │  - register()   │  │  - random()     │  │  - favorites()  │     │   │
│  │  │  - login()      │  │  - list()       │  │  - addFav()     │     │   │
│  │  │                 │  │  - like()       │  │  - removeFav()  │     │   │
│  │  │                 │  │  - unlike()     │  │                 │     │   │
│  │  │                 │  │  - popular()    │  │                 │     │   │
│  │  │                 │  │  - topN()       │  │                 │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Services                                    │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │  AuthService    │  │  FactService    │  │  LikeService    │     │   │
│  │  │                 │  │                 │  │                 │     │   │
│  │  │  - register()   │  │  - fetchRandom()│  │  - like()       │     │   │
│  │  │  - login()      │  │  - fetchList()  │  │  - unlike()     │     │   │
│  │  │  - generateJWT()│  │  - cache()      │  │  - getLikeStatus│     │   │
│  │  │                 │  │                 │  │  - getCount()   │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Models                                      │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │      User       │  │    CatFact      │  │    UserLike     │     │   │
│  │  │                 │  │                 │  │                 │     │   │
│  │  │  - has_many     │  │  - has_many     │  │  - belongs_to   │     │   │
│  │  │    :likes       │  │    :likes       │  │    :user        │     │   │
│  │  │                 │  │                 │  │  - belongs_to   │     │   │
│  │  │                 │  │                 │  │    :fact        │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ ActiveRecord
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL                                         │
│                             (RDS)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │    users    │  │  cat_facts  │  │ user_likes  │  │login_attempt│       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Diagrama de Casos de Uso (1 pt)

### 5.1 Actores

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ACTORES UML                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │  🧑 Usuario │  ← Actor principal
    │  Anónimo    │
    └─────────────┘
           │
           │ Puede realizar:
           │
           ├── Registrar cuenta
           ├── Iniciar sesión
           │
           └── (Después de login):
               ├── Ver cat facts
               ├── Marcar like
               ├── Ver favoritos
               ├── Ver populares
               └── Cerrar sesión


    ┌─────────────┐
    │  👤 Usuario │  ← Actor autenticado
    │  Registrado │
    └─────────────┘
           │
           ├── Todas las acciones del anónimo
           │
           └── Acciones adicionales:
               ├── Gestionar perfil
               ├── Activar 2FA (opcional)
               └── Ver historial de likes
```

### 5.2 Diagrama de Casos de Uso

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DIAGRAMA DE CASOS DE USO                                │
│                         SSCatFacts                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │  🧑 Usuario │
    │  Anónimo    │
    └──────┬──────┘
           │
           │
    ┌──────┴──────────────────────────────────────────────────────────────┐
    │                                                                      │
    │  ┌─────────────────────────────┐    ┌─────────────────────────────┐ │
    │  │    Registrar Cuenta         │    │     Iniciar Sesión          │ │
    │  │                             │    │                             │ │
    │  │  - Ingresar username        │    │  - Ingresar credenciales    │ │
    │  │  - Ingresar password        │    │  - Obtener JWT token        │ │
    │  │  - Confirmar password       │    │                             │ │
    │  │  - Verificar username único │    │                             │ │
    │  │                             │    │                             │ │
    │  └─────────────────────────────┘    └─────────────────────────────┘ │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ <<include>>
                                    ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                                                                      │
    │  ┌─────────────────────────────┐    ┌─────────────────────────────┐ │
    │  │   Ver Cat Facts             │    │    Marcar Like              │ │
    │  │                             │    │                             │ │
    │  │  - Obtener fact aleatorio   │    │  - Dar like a fact          │ │
    │  │  - Listar facts paginados   │    │  - Quitar like              │ │
    │  │  - Ver facts populares      │    │  - Ver contador de likes    │ │
    │  │                             │    │                             │ │
    │  └─────────────────────────────┘    └─────────────────────────────┘ │
    │                                                                      │
    │  ┌─────────────────────────────┐    ┌─────────────────────────────┐ │
    │  │   Ver Favoritos             │    │    Cerrar Sesión            │ │
    │  │                             │    │                             │ │
    │  │  - Lista de facts gustados  │    │  - Invalidar token          │ │
    │  │  - Eliminar de favoritos    │    │  - Limpiar sesión           │ │
    │  │  - Conteo total             │    │                             │ │
    │  │                             │    │                             │ │
    │  └─────────────────────────────┘    └─────────────────────────────┘ │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ <<extend>> (opcional)
                                    ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                                                                      │
    │  ┌─────────────────────────────┐    ┌─────────────────────────────┐ │
    │  │   Activar 2FA               │    │   Configurar Perfil         │ │
    │  │   (Bonus)                   │    │                             │ │
    │  │                             │    │  - Actualizar email         │ │
    │  │  - Generar QR code          │    │  - Cambiar contraseña       │ │
    │  │  - Verificar código TOTP    │    │                             │ │
    │  │  - Guardar backup codes     │    │                             │ │
    │  │                             │    │                             │ │
    │  └─────────────────────────────┘    └─────────────────────────────┘ │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘
```

### 5.3 Tabla de Casos de Uso

| ID | Caso de Uso | Actor | Precondición | Flujo Principal | Postcondición |
|----|-------------|-------|--------------|-----------------|---------------|
| UC-01 | Registrar Cuenta | Usuario Anónimo | No tener cuenta | 1. Ingresa datos<br>2. Sistema valida<br>3. Crea usuario | Cuenta creada |
| UC-02 | Iniciar Sesión | Usuario Anónimo | Tener cuenta | 1. Ingresa credenciales<br>2. Sistema valida<br>3. Retorna JWT | Sesión iniciada |
| UC-03 | Ver Cat Facts | Usuario Registrado | Sesión iniciada | 1. Solicita fact<br>2. Backend consulta API<br>3. Retorna fact | Fact mostrado |
| UC-04 | Marcar Like | Usuario Registrado | Ver fact | 1. Clic corazón<br>2. Sistema registra<br>3. Actualiza UI | Like registrado |
| UC-05 | Ver Favoritos | Usuario Registrado | Tener favoritos | 1. Accede a lista<br>2. Sistema consulta BD<br>3. Retorna lista | Lista mostrada |
| UC-06 | Ver Populares | Usuario Registrado | Sesión iniciada | 1. Accede a populares<br>2. Sistema calcula ranking<br>3. Retorna ranking | Ranking mostrado |
| UC-07 | Cerrar Sesión | Usuario Registrado | Sesión iniciada | 1. Solicita logout<br>2. Sistema invalida token<br>3. Redirige a login | Sesión cerrada |
| UC-08 | Activar 2FA | Usuario Registrado | Tener cuenta | 1. Solicita activar<br>2. Sistema genera QR<br>3. Usuario verifica | 2FA activado |

---

## Herramientas Recomendadas para Diagramas

| Diagrama | Herramienta | Formato |
|----------|-------------|---------|
| Secuencia | PlantUML, Mermaid, draw.io | .puml, .md, .drawio |
| Despliegue | draw.io, Lucidchart, Excalidraw | .drawio, .json |
| Entidad-Relación | dbdiagram.io, Lucidchart, pgAdmin | .dbml, .sql |
| Componentes | PlantUML, Mermaid, draw.io | .puml, .md, .drawio |
| Casos de Uso | PlantUML, StarUML, draw.io | .puml, .md, .drawio |

---

## Criterios de Aceptación

- [ ] CA-01: Diagrama de Secuencia para registro y login
- [ ] CA-02: Diagrama de Secuencia para obtener fact y like
- [ ] CA-03: Diagrama de Despliegue AWS completo
- [ ] CA-04: Diagrama de Despliegue Docker local
- [ ] CA-05: Diagrama Entidad-Relación con todas las tablas
- [ ] CA-06: Diagrama de Componentes Frontend y Backend
- [ ] CA-07: Diagrama de Casos de Uso con actores y relaciones
- [ ] CA-08: Todos los diagramas documentados en formato accesible

---

## Notas de Implementación

1. Usar Mermaid en Markdown para versionado en Git
2. Mantener diagramas actualizados con el código
3. Generar diagramas desde código cuando sea posible
4. Incluir diagramas en documentación del proyecto
