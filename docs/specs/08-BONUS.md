# Especificación: Funcionalidades Bonus

## Resumen

Esta especificación define las funcionalidades adicionales (bonus) del proyecto SSCatFacts, incluyendo Docker, 2FA, pipelines CI/CD, deploy y Tailwind CSS.

## Contexto del Negocio

- **Módulo**: Funcionalidades Bonus
- **Prioridad**: Media (agregan valor pero no son obligatorias)
- **Puntuación**: 45 puntos totales

---

## 1. Docker + Docker Compose (5 pts)

### 1.1 Requisitos

**Descripción**: El proyecto debe poder ejecutarse localmente usando Docker y Docker Compose.

**Criterios**:
- Todos los servicios definidos en `docker-compose.yml`
- Volumes para persistencia de datos
- Variables de entorno configurables
- Scripts de inicialización automáticos

### 1.2 Estructura de Contenedores

```
┌─────────────────────────────────────────────────────────────┐
│                    docker-compose                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   frontend  │    │   backend   │    │  postgres   │     │
│  │  React App  │    │  Rails API  │    │  Database   │     │
│  │   :8080     │    │   :3000     │    │   :5432     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                        │
│  │   redis     │    │   sidekiq   │                        │
│  │   Cache     │    │   Workers   │                        │
│  │   :6379     │    │             │                        │
│  └─────────────┘    └─────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Archivo docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend - React + TypeScript
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api/v1
    volumes:
      - ./frontend/src:/app/src  # Hot reload en desarrollo
    networks:
      - sscatfacts-network

  # Backend - Ruby on Rails API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sscatfacts_development
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET_KEY=dev-secret-key-change-in-production
      - CATFACT_API_URL=https://catfact.ninja
      - FRONTEND_URL=http://localhost:8080
      - RAILS_ENV=development
    volumes:
      - ./backend:/app  # Hot reload en desarrollo
      - bundle_cache:/usr/local/bundle
    networks:
      - sscatfacts-network

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=sscatfacts_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - sscatfacts-network

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sscatfacts-network

  # Sidekiq (Background Jobs)
  sidekiq:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: bundle exec sidekiq
    depends_on:
      - backend
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sscatfacts_development
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./backend:/app
    networks:
      - sscatfacts-network

volumes:
  postgres_data:
  redis_data:
  bundle_cache:

networks:
  sscatfacts-network:
    driver: bridge
```

### 1.4 Dockerfiles

**Backend (`./backend/Dockerfile`)**:
```dockerfile
FROM ruby:3.2-slim

# Instalar dependencias del sistema
RUN apt-get update -qq && \
    apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar gems
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 5

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["rails", "server", "-b", "0.0.0.0"]
```

**Frontend (`./frontend/Dockerfile`)**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["npm", "start"]
```

### 1.5 Scripts de Inicio

**`docker-setup.sh`**:
```bash
#!/bin/bash
echo "🚀 Configurando SSCatFacts..."

# Construir imágenes
docker-compose build

# Instalar dependencias backend
docker-compose run --rm backend bundle install

# Crear base de datos
docker-compose run --rm backend rails db:create

# Ejecutar migraciones
docker-compose run --rm backend rails db:migrate

# Semillar datos (opcional)
docker-compose run --rm backend rails db:seed

echo "✅ ¡Listo! Ejecuta: docker-compose up"
```

---

## 2. Autenticación en Dos Pasos - 2FA (15 pts)

### 2.1 Requisitos

**Descripción**: Implementar autenticación de dos factores (2FA) usando códigos TOTP (Time-based One-Time Password).

**Criterios**:
- Generar QR code para configurar en app de autenticación
- Validar códigos TOTP de 6 dígitos
- Permitir códigos de respaldo (backup codes)
- Opcional: obligatorio o voluntario para usuarios

### 2.2 Flujo de 2FA

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO 2FA                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuario activa 2FA                                      │
│     │                                                       │
│     ▼                                                       │
│  2. Backend genera secret TOTP                             │
│     │                                                       │
│     ▼                                                       │
│  3. Backend retorna QR code + backup codes                 │
│     │                                                       │
│     ▼                                                       │
│  4. Usuario escanea QR con Google Authenticator            │
│     │                                                       │
│     ▼                                                       │
│  5. Usuario ingresa código de 6 dígitos                    │
│     │                                                       │
│     ▼                                                       │
│  6. Backend valida código                                  │
│     │                                                       │
│     ├── Válido → 2FA activado                              │
│     └── Inválido → Error, reintentar                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Modelo de Datos

**Tabla: `users` (agregar columnas)**:
```sql
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT[];
```

**Tabla: `two_factor_codes` (opcional, para auditoría)**:
```sql
CREATE TABLE two_factor_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    code VARCHAR(6),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

### 2.4 API Endpoints

**POST `/api/v1/auth/2fa/enable`**:
```json
// Request
{
  "password": "user_password"
}

// Response 200
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,...",
    "backupCodes": ["ABC123", "DEF456", "GHI789"]
  }
}
```

**POST `/api/v1/auth/2fa/verify`**:
```json
// Request
{
  "code": "123456"
}

// Response 200
{
  "success": true,
  "data": {
    "verified": true,
    "token": "jwt_token_with_2fa"
  }
}
```

**POST `/api/v1/auth/2fa/disable`**:
```json
// Request
{
  "password": "user_password",
  "code": "123456"
}

// Response 200
{
  "success": true,
  "message": "2FA desactivado correctamente"
}
```

### 2.5 Implementación Backend

**Gem necesaria**: `rotp` (Ruby One-Time Password)

```ruby
# app/services/two_factor_service.rb
class TwoFactorService
  def initialize(user)
    @user = user
  end

  def enable
    secret = ROTP::Base32.random_base32
    totp = ROTP::TOTP.new(secret, issuer: 'SSCatFacts')
    
    @user.update!(
      two_factor_secret: secret,
      two_factor_enabled: false  # Se activa después de verificar
    )
    
    {
      secret: secret,
      qrCode: totp.provisioning_uri(@user.email),
      backupCodes: generate_backup_codes
    }
  end

  def verify(code)
    totp = ROTP::TOTP.new(@user.two_factor_secret, issuer: 'SSCatFacts')
    
    if totp.verify(code, drift_behind: 30)
      @user.update!(two_factor_enabled: true)
      true
    else
      false
    end
  end

  private

  def generate_backup_codes
    codes = []
    10.times { codes << SecureRandom.hex(3).upcase }
    codes
  end
end
```

---

## 3. Pipelines de GitHub Actions (10 pts)

### 3.1 Pipeline de Tests y Linter

**`.github/workflows/ci.yml`**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: sscatfacts_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      
      - name: Install dependencies
        run: bundle install
      
      - name: Setup database
        run: bundle exec rails db:create db:schema:load
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/sscatfacts_test
      
      - name: Run RuboCop
        run: bundle exec rubocop
      
      - name: Run RSpec
        run: bundle exec rspec
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/sscatfacts_test
          REDIS_URL: redis://localhost:6379/0

  # Frontend Tests
  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 3.2 Pipeline de Deploy

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: backend-test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_API_URL: https://api.sscatfacts.com/api/v1
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync ./build s3://sscatfacts-frontend --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"

  deploy-backend:
    runs-on: ubuntu-latest
    needs: backend-test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/sscatfacts
            git pull origin main
            docker-compose build
            docker-compose up -d
            docker-compose run --rm backend rails db:migrate
```

---

## 4. Deploy en AWS (10 pts)

### 4.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS CLOUD                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Route 53                          │   │
│  │              DNS: sscatfacts.com                     │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  CloudFront                          │   │
│  │              CDN + SSL Certificate                   │   │
│  └──────────┬────────────────────────┬─────────────────┘   │
│             │                        │                      │
│             ▼                        ▼                      │
│  ┌─────────────────┐    ┌─────────────────────────────┐   │
│  │      S3         │    │          ALB                │   │
│  │  Frontend App   │    │    Application Load Balancer│   │
│  │  (Static Files) │    │                             │   │
│  └─────────────────┘    └──────────────┬──────────────┘   │
│                                        │                   │
│                                        ▼                   │
│                            ┌─────────────────────────┐   │
│                            │         ECS/EKS         │   │
│                            │    Backend Containers   │   │
│                            │     (Rails API)         │   │
│                            └──────────────┬──────────┘   │
│                                           │               │
│                            ┌──────────────┴──────────┐   │
│                            │                         │   │
│                            ▼                         ▼   │
│                  ┌───────────────┐         ┌─────────────┐│
│                  │     RDS       │         │ ElastiCache ││
│                  │  PostgreSQL   │         │    Redis    ││
│                  └───────────────┘         └─────────────┘│
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Servicios AWS

| Servicio | Uso | Configuración |
|----------|-----|---------------|
| **S3** | Frontend estático | Bucket: `sscatfacts-frontend` |
| **CloudFront** | CDN + SSL | Distribution ID en secrets |
| **ECS/EKS** | Backend containers | Fargate o EC2 |
| **RDS** | PostgreSQL | db.t3.micro (dev), db.t3.medium (prod) |
| **ElastiCache** | Redis | cache.t3.micro (dev), cache.t3.small (prod) |
| **Route 53** | DNS | Registro `sscatfacts.com` |
| **ACM** | SSL Certificates | Certificado wildcard |
| **ECR** | Docker images | Repositorio `sscatfacts` |

### 4.3 Variables de Entorno (Secrets)

**GitHub Secrets necesarios**:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
EC2_HOST
EC2_SSH_KEY
CLOUDFRONT_DISTRIBUTION_ID
DATABASE_URL
REDIS_URL
JWT_SECRET_KEY
```

### 4.4 Configuración Terraform (Opcional)

```hcl
# infrastructure/main.tf
provider "aws" {
  region = "us-east-1"
}

# S3 Bucket para Frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "sscatfacts-frontend"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-sscatfacts"
  }

  enabled             = true
  default_root_object = "index.html"
  
  # SPA routing
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "sscatfacts-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
  
  db_name  = "sscatfacts"
  username = "admin"
  password = var.db_password
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "sscatfacts-redis"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
}
```

---

## 5. Tailwind CSS (10 pts)

### 5.1 Requisitos

**Descripción**: Implementar Tailwind CSS como librería de estilos para el frontend.

**Criterios**:
- Configuración personalizada con colores del proyecto
- Componentes reutilizables con Tailwind
- Responsive design
- Dark mode (opcional)

### 5.2 Configuración

**`tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        'cat': {
          'orange': '#FF6B35',
          'brown': '#8B4513',
          'cream': '#FFFDD0',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 5.3 Ejemplo de Componentes

**FactCard.tsx**:
```tsx
import React from 'react';

interface FactCardProps {
  fact: string;
  liked: boolean;
  likesCount: number;
  onLike: () => void;
}

export const FactCard: React.FC<FactCardProps> = ({
  fact,
  liked,
  likesCount,
  onLike
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <p className="text-gray-800 text-lg leading-relaxed mb-4">
        {fact}
      </p>
      
      <div className="flex items-center justify-between">
        <button
          onClick={onLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            liked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg
            className={`w-5 h-5 ${liked ? 'fill-current' : 'stroke-current'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{likesCount}</span>
        </button>
        
        <span className="text-sm text-gray-500">
          {liked ? 'Te gusta' : 'Marca tu like'}
        </span>
      </div>
    </div>
  );
};
```

---

## Criterios de Aceptación

### Docker (5 pts)
- [ ] CA-01: `docker-compose up` levanta todos los servicios
- [ ] CA-02: Frontend accesible en `localhost:8080`
- [ ] CA-03: Backend accesible en `localhost:3000`
- [ ] CA-04: Base de datos se inicializa automáticamente
- [ ] CA-05: Hot reload funciona en desarrollo

### 2FA (15 pts)
- [ ] CA-06: Usuario puede activar 2FA
- [ ] CA-07: QR code se genera correctamente
- [ ] CA-08: Códigos TOTP se validan
- [ ] CA-09: Backup codes funcionan
- [ ] CA-10: 2FA se puede desactivar

### CI/CD (10 pts)
- [ ] CA-11: Tests se ejecutan en cada PR
- [ ] CA-12: Linters se ejecutan en cada PR
- [ ] CA-13: Deploy automático a main
- [ ] CA-14: Frontend se despliega a S3
- [ ] CA-15: Backend se despliega a EC2/ECS

### Deploy (10 pts)
- [ ] CA-16: App accesible vía HTTPS
- [ ] CA-17: SSL certificate configurado
- [ ] CA-18: DNS configurado
- [ ] CA-19: RDS y ElastiCache funcionando

### Tailwind CSS (10 pts)
- [ ] CA-20: Tailwind configurado
- [ ] CA-21: Colores personalizados funcionan
- [ ] CA-22: Componentes son responsivos
- [ ] CA-23: Dark mode implementado (opcional)

---

## Dependencias

### Backend (2FA)
- `rotp`: Generación de TOTP
- `rqrcode`: Generación de QR codes

### Frontend (Tailwind)
- `tailwindcss`: Core library
- `postcss`: CSS processing
- `autoprefixer`: CSS vendor prefixes

### Infraestructura
- AWS CLI
- Terraform (opcional)
- Docker + Docker Compose

---

## Notas de Implementación

1. **Docker**: Usar multi-stage builds para reducir tamaño de imágenes
2. **2FA**: Almacenar secrets encriptados en base de datos
3. **CI/CD**: Usar GitHub Secrets para credenciales
4. **Deploy**: Implementar blue-green deployment para cero downtime
5. **Tailwind**: Usar PurgeCSS para eliminar CSS no utilizado
