# Especificación: Calidad de Desarrollo

## Resumen

Esta especificación define los estándares de calidad del código, incluyendo principios SOLID, estrategia de testing, configuración de linters y buenas prácticas de Git para el proyecto SSCatFacts.

## Contexto del Negocio

- **Módulo**: Calidad y Estándares de Desarrollo
- **Prioridad**: Alta (garantiza mantenibilidad y escalabilidad)
- **Puntuación**: 50 puntos

---

## 1. Principios SOLID (20 pts)

### 1.1 Single Responsibility Principle (SRP)

**Definición**: Cada clase, módulo o función debe tener una única responsabilidad.

**Aplicación en el Proyecto**:

| Capa | Ejemplo | Responsabilidad |
|------|---------|-----------------|
| **Controller** | `AuthController` | Solo manejar request/response de autenticación |
| **Service** | `LikeService` | Solo lógica de likes/unlikes |
| **Model** | `User` | Solo persistencia y validaciones de usuario |
| **Component** | `FactCard` | Solo mostrar un fact con su estado de like |

**Reglas**:
- Controllers no contienen lógica de negocio
- Services no conocen HTTP/HTTP
- Models no contienen lógica compleja de negocio

### 1.2 Open/Closed Principle (OCP)

**Definición**: Entidades de software deben estar abiertas para extensión, cerradas para modificación.

**Aplicación**:
- Usar interfaces/abstracciones para APIs externas
- Strategy pattern para diferentes fuentes de facts
- Plugins/módulos para funcionalidad extensible

```ruby
# Ejemplo: Interfaz para fuente de facts
class FactSource
  def fetch_random
    raise NotImplementedError
  end
end

class CatFactNinja < FactSource
  def fetch_random
    # Implementación específica
  end
end
```

### 1.3 Liskov Substitution Principle (LSP)

**Definición**: Objetos de una clase derivada deben poder sustituir a objetos de la clase base.

**Aplicación**:
- Services intercambiables si cumplen contrato
- Repositories con implementaciones testeables
- Mocks fáciles de crear en tests

### 1.4 Interface Segregation Principle (ISP)

**Definición**: Clientes no deben depender de interfaces que no usan.

**Aplicación**:
- APIs específicas por cliente (mobile, web)
- Serializadores diferentes según contexto
- Endpoints granularity adecuada

### 1.5 Dependency Inversion Principle (DIP)

**Definición**: Módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

**Aplicación**:

```ruby
# Alto nivel (Controller)
class FactsController
  def initialize(fact_service: FactService.new)
    @fact_service = fact_service
  end
end

# Bajo nivel (Service)
class FactService
  def initialize(api_client: CatFactClient.new)
    @api_client = api_client
  end
end
```

**Beneficio**: Fácil testing con mocks/stubs

---

## 2. Patrones de Diseño Implementados

### 2.1 Frontend (React + TypeScript + Vite)

| Patrón | Uso en el Proyecto | Beneficio |
|--------|-------------------|-----------|
| **Atomic Design** | Organización de componentes (atoms → pages) | Reutilización, testing, escalabilidad |
| **Custom Hooks** | `useAuth`, `useFacts`, `useLike`, `usePagination` | Reutilización de lógica de estado |
| **Container/Presentational** | Separación de lógica vs UI | Componentes testables y flexibles |
| **API Client Pattern** | Axios instance centralizada en `services/` | Interceptores, token management |
| **Error Boundaries** | Componente `ErrorBoundary` envolviendo rutas | Evita crashes, UI de fallback |
| **Optimistic Updates** | En `useLike` antes de confirmar con backend | UX instantánea, mejor percepción |
| **React Context** | Estado global con `context/` y hooks | Estado predecible, sin dependencias externas |
| **React Router** | Enrutamiento declarativo en `router/` | Navegación SPA, rutas protegidas |

### 2.2 Backend (Ruby on Rails)

| Patrón | Uso en el Proyecto | Beneficio |
|--------|-------------------|-----------|
| **Clean Architecture** | Capas: Entities → UseCases → Controllers → Services | Separación clara, testable, escalable |
| **Service Objects** | `AuthService`, `FactService`, `LikeService` | Lógica de negocio encapsulada |
| **Circuit Breaker** | En `CatFactApiService` para API externa | Resiliencia, no rompe si falla API |
| **Null Object** | Para evitar nil checks en relaciones | Código limpio, menos condicionales |
| **ActiveRecord** | Acceso a datos (Repository implícito) | Estándar Rails, ORM robusto |
| **Serializers** | Formato de respuesta en `app/serializers/` | Consistencia, desacople de formato |

---

## 3. Flujo de Datos (Request Lifecycle)

### Frontend → Backend

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USUARIO hace clic en "Like"                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  1. UI (FactCard.tsx)                                                   │
│     └── onClick → llama a useLike().handleLike(factId)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. HOOK (useLike.ts) - Optimistic Update                              │
│     ├── setLiked(true)           ← Actualiza UI INSTANTÁNEO           │
│     └── factsService.like(id)    ← Llama al backend                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. SERVICE (factsService.ts)                                           │
│     └── apiClient.post('/facts/1/like')                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. API CLIENT (apiClient.ts)                                           │
│     └── Agrega header: Authorization: Bearer <jwt_token>              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. BACKEND (FactsController)                                           │
│     └── like_action → llama a LikeFactUseCase.execute(user, fact_id)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. USE CASE (like_fact.rb)                                             │
│     ├── Verifica si ya existe like (UserLike.find_by)                 │
│     ├── Crea like si no existe                                         │
│     └── Retorna { liked: true, likes_count: 43 }                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  7. SERIALIZER (fact_serializer.rb)                                     │
│     └── Formatea respuesta JSON con estructura estándar                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  8. BACKEND → FRONTEND                                                  │
│     └── Response JSON: { success: true, data: { liked: true, ... } }   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  9. HOOK actualiza estado final                                         │
│     └── Si falló, revierte el optimistic update                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Estrategia de Testing (10 pts)

### 4.1 Niveles de Testing

| Nivel | Tipo | Cobertura Objetivo | Herramientas |
|-------|------|-------------------|--------------|
| **Unit** | Pruebas aisladas | 80% mínimo | RSpec (backend), Jest (frontend) |
| **Integration** | Interacción entre componentes | 60% mínimo | RSpec, FactoryBot |
| **E2E** | Flujo completo de usuario | 20% mínimo | Cypress o Playwright |

### 4.2 Backend - Ruby on Rails (RSpec)

**Estructura de Tests**:
```
spec/
├── models/
│   ├── user_spec.rb
│   ├── cat_fact_spec.rb
│   └── user_like_spec.rb
├── requests/
│   ├── auth_spec.rb
│   ├── facts_spec.rb
│   └── users_spec.rb
├── services/
│   ├── fact_service_spec.rb
│   └── like_service_spec.rb
├── controllers/
│   └── concerns/
├── factories/
│   ├── users.rb
│   ├── cat_facts.rb
│   └── user_likes.rb
└── rails_helper.rb
```

**Ejemplo de Test**:
```ruby
# spec/requests/auth_spec.rb
require 'rails_helper'

RSpec.describe 'Auth API', type: :request do
  describe 'POST /api/v1/auth/register' do
    let(:valid_params) do
      {
        username: 'catlover123',
        password: 'password123',
        confirmPassword: 'password123'
      }
    end

    context 'with valid params' do
      it 'creates user and returns 201' do
        post '/api/v1/auth/register', params: valid_params
        
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['success']).to be true
        expect(User.count).to eq(1)
      end
    end

    context 'with duplicate username' do
      before { create(:user, username: 'catlover123') }

      it 'returns 409 Conflict' do
        post '/api/v1/auth/register', params: valid_params
        
        expect(response).to have_http_status(:conflict)
        expect(JSON.parse(response.body)['error']['code']).to eq('USER_EXISTS')
      end
    end
  end
end
```

### 4.3 Frontend - React + TypeScript + Vite (Jest)

**Estructura de Tests**:
```
src/
├── __tests__/
│   ├── components/
│   │   ├── FactCard.test.tsx
│   │   └── LoginForm.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── services/
│       └── api.test.ts
├── components/
│   ├── FactCard.tsx
│   └── FactCard.test.tsx  # Test junto al componente
└── setupTests.ts
```

**Ejemplo de Test**:
```typescript
// src/components/FactCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FactCard } from './FactCard';

describe('FactCard', () => {
  const mockFact = {
    id: 1,
    fact: 'Cats have over 20 vocalizations',
    liked: false,
    likesCount: 10
  };

  it('renders fact text', () => {
    render(<FactCard fact={mockFact} onLike={() => {}} />);
    expect(screen.getByText(/Cats have over 20/)).toBeInTheDocument();
  });

  it('shows empty heart when not liked', () => {
    render(<FactCard fact={mockFact} onLike={() => {}} />);
    expect(screen.getByTestId('heart-empty')).toBeInTheDocument();
  });

  it('calls onLike when heart clicked', () => {
    const handleLike = jest.fn();
    render(<FactCard fact={mockFact} onLike={handleLike} />);
    
    fireEvent.click(screen.getByTestId('like-button'));
    expect(handleLike).toHaveBeenCalledWith(1);
  });
});
```

### 4.4 Coverage Mínimo

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Line Coverage | 80% | 80% |
| Branch Coverage | 75% | 75% |
| Function Coverage | 85% | 85% |

---

## 5. Configuración de Linters (5 pts)

### 5.1 Backend - RuboCop

**Archivo `.rubocop.yml`**:
```yaml
AllCops:
  TargetRubyVersion: 3.2
  NewCops: enable
  Exclude:
    - 'db/schema.rb'
    - 'bin/*'
    - 'node_modules/**/*'

# Style
Style/StringLiterals:
  EnforcedStyle: double_quotes

Style/FrozenStringLiteralComment:
  Enabled: false

# Metrics
Metrics/MethodLength:
  Max: 20

Metrics/ClassLength:
  Max: 150

Metrics/BlockLength:
  Max: 30
  Exclude:
    - 'spec/**/*'

# Layout
Layout/LineLength:
  Max: 120
```

**Comandos**:
```bash
# Verificar
bundle exec rubocop

# Autocorregir
bundle exec rubocop -A
```

### 5.2 Frontend - ESLint + Prettier

**Archivo `.eslintrc.js`**:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off'
  }
};
```

**Archivo `.prettierrc`**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Comandos**:
```bash
# Verificar
npm run lint

# Autocorregir
npm run lint:fix

# Formatear
npm run format
```

---

## 6. Buenas Prácticas de Git (5 pts)

### 6.1 Convención de Ramas - Git Flow

```
main (producción)
  │
  ├── develop (desarrollo integrado)
  │     │
  │     ├── feature/register-user
  │     ├── feature/login-auth
  │     ├── feature/fact-likes
  │     │
  │     └── release/v1.0.0
  │
  └── hotfix/fix-login-error
```

**Definición de Ramas**:

| Rama | Origen | Destino | Uso |
|------|--------|---------|-----|
| `main` | - | - | Código en producción |
| `develop` | `main` | `main` | Código integrado para release |
| `feature/*` | `develop` | `develop` | Nuevas funcionalidades |
| `release/*` | `develop` | `main` + `develop` | Preparar release |
| `hotfix/*` | `main` | `main` + `develop` | Correcciones urgentes |

### 6.2 Convenção de Commits - Conventional Commits

**Formato**:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:
| Type | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Cambios de formato (no afecta lógica) |
| `refactor` | Refactorización (no agrega funcionalidad) |
| `test` | Agrega o corrige tests |
| `chore` | Tareas de mantenimiento |

**Ejemplos**:
```
feat(auth): implement user registration
fix(facts): prevent duplicate likes
docs(readme): update setup instructions
refactor(services): extract FactService class
test(auth): add registration tests
chore(deps): update ruby version
```

### 6.3 Reglas de Commits

- **Commits pequeños**: Máximo 200 líneas por commit
- **Un commit = una tarea**: No mezclar funcionalidades
- **Mensaje claro**: Describir qué y por qué (no cómo)
- **Tests pasando**: Nunca commit con tests rotos

### 6.4 Configuración de Git

**`.gitignore`**:
```gitignore
# Dependencies
/node_modules/
/vendor/bundle

# Environment
.env
.env.local

# Build
/dist/
/build/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

**`.editorconfig`**:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.rb]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 6.5 Hooks de Git (Lefthook)

**Descripción**: Usar Lefthook para ejecutar lint y tests automáticamente antes de commits y pushes.

**Instalación**:
```bash
# Backend
bundle add lefthook --development

# Frontend
npm install --save-dev lefthook
```

**Archivo `lefthook.yml` (raíz del proyecto)**:
```yaml
pre-commit:
  commands:
    lint-backend:
      glob: "*.rb"
      run: bundle exec rubocop {staged_files}
    lint-frontend:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{ts,tsx,rb}"
      run: npx prettier --write {staged_files}

pre-push:
  commands:
    test-backend:
      run: bundle exec rspec
    test-frontend:
      run: npm test
    lint-all:
      run: bundle exec rubocop && npm run lint
```

**Ventajas sobre Husky**:
- Funciona tanto para Ruby (backend) como JS (frontend)
- Un solo archivo de configuración para ambos
- Más rápido que Husky
- No depende de npm para el backend

---

## 7. Convenciones de Código

### 7.1 Nomenclatura

| Tipo | Frontend (TypeScript) | Backend (Ruby) |
|------|----------------------|----------------|
| Variables | camelCase | snake_case |
| Funciones | camelCase | snake_case |
| Componentes | PascalCase | - |
| Modelos | - | PascalCase |
| Archivos | kebab-case | snake_case |
| CSS Classes | Tailwind utilities | - |

### 7.2 Ejemplos de Nomenclatura

**Frontend:**
```typescript
// Variables
const userName = 'catlover123';
const factId = 1;
const isLiked = true;

// Funciones
const fetchRandomFact = async () => { ... };
const handleLikeClick = (factId: number) => { ... };

// Componentes
const FactCard: React.FC<Props> = ({ fact }) => { ... };
const LoginForm: React.FC = () => { ... };

// Archivos
// fact-card.tsx
// use-auth.ts
// facts-service.ts
```

**Backend:**
```ruby
# Variables y métodos
user_name = 'catlover123'
fact_id = 1
is_liked = true

def fetch_random_fact
  # ...
end

def handle_like_click(fact_id)
  # ...
end

# Modelos
class CatFact < ApplicationRecord
  # ...
end

# Archivos
# cat_fact.rb
# fact_service.rb
# facts_controller.rb
```

### 7.3 Estructura de Archivos

**Frontend:**
```
src/
├── atoms/
│   └── Button/
│       ├── Button.tsx          # Componente
│       ├── Button.test.tsx     # Test
│       ├── Button.stories.tsx  # Storybook (opcional)
│       └── index.ts           # Export
├── hooks/
│   └── useAuth.ts
├── services/
│   └── factsService.ts
└── types/
    └── fact.types.ts
```

**Backend:**
```
app/
├── controllers/
│   └── api/v1/
│       └── facts_controller.rb
├── models/
│   └── cat_fact.rb
├── services/
│   └── fact_service.rb
├── use_cases/
│   └── fetch_random_fact.rb
└── serializers/
    └── fact_serializer.rb
```

### 7.4 Formato de Código

**TypeScript:**
- 2 espacios de indentación
- Punto y coma al final
- Comillas simples
- Máximo 100 caracteres por línea

**Ruby:**
- 2 espacios de indentación
- Comillas dobles
- Máximo 120 caracteres por línea
- `rubocop` para validación

---

## Criterios de Aceptación

### SOLID (20 pts)
- [ ] CA-01: Cada clase tiene una única responsabilidad
- [ ] CA-02: Controllers no contienen lógica de negocio
- [ ] CA-03: Services son independientes de HTTP
- [ ] CA-04: Se usan interfaces/abstracciones
- [ ] CA-05: Dependencies son inyectadas (no hardcodeadas)

### Testing (10 pts)
- [ ] CA-06: Tests unitarios con 80% cobertura mínimo
- [ ] CA-07: Tests de integración para servicios críticos
- [ ] CA-08: Tests E2E para flujos principales
- [ ] CA-09: Todos los tests pasan en CI

### Linters (5 pts)
- [ ] CA-10: RuboCop configurado y sin ofensas
- [ ] CA-11: ESLint configurado y sin ofensas
- [ ] CA-12: Prettier formatea código automáticamente
- [ ] CA-13: Linters integrados en pre-commit hooks

### Git (5 pts)
- [ ] CA-14: Git Flow implementado
- [ ] CA-15: Commits siguen Convencional Commits
- [ ] CA-16: Commits son pequeños y atómicos
- [ ] CA-17: `.gitignore` configurado correctamente

---

## Dependencias y Herramientas

### Backend
- `rspec-rails`: Testing framework
- `factory_bot_rails`: Test data generation
- `rubocop`: Linter
- `rubocop-rails`: Rails-specific rules
- `simplecov`: Code coverage

### Frontend
- `jest`: Testing framework
- `@testing-library/react`: React testing utilities
- `eslint`: Linter
- `prettier`: Code formatter
- `eslint-config-prettier`: ESLint + Prettier integration

---

## Notas de Implementación

1. Instalar pre-commit hooks para ejecutar linters automáticamente
2. Configurar CI para ejecutar tests y linters en cada PR
3. Usar `bundle exec guard` para tests automáticos en desarrollo
4. Documentar decisiones de arquitectura en README del proyecto
5. Mantener coverage reports en CI para tracking
