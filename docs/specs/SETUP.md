# Guía de Setup - SSCatFacts

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Verificar con |
|-------------|----------------|---------------|
| **Ruby** | 3.2+ | `ruby --version` |
| **Node.js** | 18+ | `node --version` |
| **PostgreSQL** | 15+ | `psql --version` |
| **Redis** | 7+ | `redis-cli --version` |
| **Docker** | 24+ | `docker --version` |
| **Docker Compose** | 2.20+ | `docker-compose --version` |

---

## Opción 1: Instalación con Docker (Recomendada)

### 1. Clonar el repositorio

```bash
git clone https://github.com/svergara-dev/sscatfacts.git
cd sscatfacts
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Backend
RAILS_ENV=development
DATABASE_URL=postgres://postgres:postgres@db:5432/sscatfacts_development
REDIS_URL=redis://redis:6379/0
JWT_SECRET_KEY=tu-clave-secreta-jwt

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Levantar servicios

```bash
docker-compose up -d
```

### 4. Instalar dependencias y configurar BD

```bash
# Backend
docker-compose exec backend bundle install
docker-compose exec backend rails db:create db:migrate

# Frontend
docker-compose exec frontend npm install
```

### 5. Verificar funcionamiento

```bash
# Verificar servicios corriendo
docker-compose ps

# Verificar backend
curl http://localhost:3000/health

# Verificar frontend
curl http://localhost:8080
```

### 6. Acceder a la aplicación

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:8080 |
| **Backend API** | http://localhost:3000/api/v1 |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |

---

## Opción 2: Instalación Manual

### Backend (Ruby on Rails)

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Instalar gems
bundle install

# 3. Configurar base de datos
rails db:create
rails db:migrate
rails db:seed  # Datos iniciales (opcional)

# 4. Iniciar servidor
rails server -p 3000
```

### Frontend (React + TypeScript + Vite)

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Windows (usar Docker o WSL)
docker run -d -p 6379:6379 redis:7-alpine
```

---

## Variables de Entorno

### Backend (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `RAILS_ENV` | Entorno de ejecución | `development`, `production` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | URL de conexión a Redis | `redis://localhost:6379/0` |
| `JWT_SECRET_KEY` | Clave secreta para JWT | String aleatorio de 64+ caracteres |
| `CATFACT_API_URL` | URL de la API externa | `https://catfact.ninja` |

### Frontend (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Nombre de la aplicación | `SSCatFacts` |

---

## Comandos Útiles

### Docker

```bash
# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener todo
docker-compose down

# Reconstruir
docker-compose up -d --build

# Limpiar volúmenes
docker-compose down -v
```

### Backend

```bash
# Consola Rails
rails console

# Correr tests
bundle exec rspec

# Linter
bundle exec rubocop

# Migraciones
rails db:migrate
rails db:rollback
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm test

# Linter
npm run lint
```

---

## Estructura del Repositorio

```
sscatfacts/
├── backend/                    # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/        # API controllers
│   │   ├── models/             # ActiveRecord models
│   │   ├── services/           # Service objects
│   │   └── use_cases/          # Use cases
│   ├── config/
│   ├── db/
│   └── spec/                   # Tests RSpec
│
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── atoms/              # Componentes básicos
│   │   ├── molecules/          # Componentes compuestos
│   │   ├── organisms/          # Componentes complejos
│   │   ├── templates/          # Plantillas de página
│   │   ├── pages/              # Páginas
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   └── public/
│
├── docs/
│   └── specs/                  # Documentación de especificaciones
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Troubleshooting

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| Puerto ya en uso | Cambiar puerto en docker-compose.yml o .env |
| Permisos denegados | `chmod +x` en scripts o verificar permisos Docker |
| Base de datos no existe | Ejecutar `rails db:create` |
| Redis no conecta | Verificar que Redis esté corriendo: `redis-cli ping` |
| Errores de CORS | Verificar configuración CORS en backend |
| Tests fallan | Verificar que todas las dependencias estén instaladas |

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend

# Ver últimos 100 logs
docker-compose logs --tail=100 backend
```

---

## Siguientes Pasos

Una vez configurado el entorno:

1. Revisar las especificaciones en `docs/specs/`
2. Comenzar con el `01-REGISTRO-USUARIOS.md`
3. Seguir el orden de las specs (01 → 02 → 03 → ...)
4. Ejecutar tests después de cada funcionalidad

---

## Soporte

Si tienes problemas:

1. Revisar esta guía de setup
2. Consultar `docs/specs/README.md` para navegar las especificaciones
3. Verificar que todas las versiones mínimas estén instaladas
4. Revisar logs para errores específicos
