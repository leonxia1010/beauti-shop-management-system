# Source Tree Structure

## Monorepo Organization

The beauty-shop-management-system uses an Nx-powered monorepo structure to maximize code sharing and maintain consistency across all applications and services.

```
/beauty-shop-management-system/
├── apps/                         # Application projects
│   ├── admin-web/               # Vite React admin dashboard
│   │   ├── src/
│   │   │   ├── app/           # Application shell
│   │   │   ├── pages/         # Route pages
│   │   │   ├── components/    # Local components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API integrations
│   │   │   └── styles/        # Global styles
│   │   ├── public/             # Static assets
│   │   └── vite.config.ts
│   │
│   ├── mobile-app/             # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/       # Screen components
│   │   │   ├── navigation/    # Navigation config
│   │   │   ├── components/    # Local components
│   │   │   └── services/      # API integrations
│   │   ├── app.json           # Expo config
│   │   └── metro.config.js
│   │
│   ├── api-gateway/            # NestJS REST API
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   ├── common/        # Shared utilities
│   │   │   ├── config/        # Configuration
│   │   │   └── main.ts        # Application entry
│   │   ├── test/              # E2E tests
│   │   └── Dockerfile
│   │
│   └── batch-jobs/             # Background workers
│       ├── src/
│       │   ├── jobs/          # Job definitions
│       │   ├── schedulers/    # Cron schedulers
│       │   └── processors/    # Queue processors
│       └── Dockerfile
│
├── libs/                        # Shared libraries
│   ├── domain/                # Core business logic
│   │   ├── src/
│   │   │   ├── models/       # Domain models
│   │   │   ├── schemas/      # Zod validation
│   │   │   ├── constants/    # Shared constants
│   │   │   └── utils/        # Business utilities
│   │   └── index.ts
│   │
│   ├── ui/                    # Shared UI components
│   │   ├── src/
│   │   │   ├── components/   # Cross-platform components
│   │   │   ├── themes/       # Design tokens
│   │   │   └── hooks/        # Shared React hooks
│   │   └── index.ts
│   │
│   ├── data-access/           # API client libraries
│   │   ├── src/
│   │   │   ├── api/          # API endpoints
│   │   │   ├── hooks/        # React Query hooks
│   │   │   └── types/        # API types
│   │   └── index.ts
│   │
│   ├── auth/                  # Authentication utilities
│   │   ├── src/
│   │   │   ├── cognito/      # Cognito integration
│   │   │   ├── guards/       # Auth guards
│   │   │   └── permissions/  # RBAC utilities
│   │   └── index.ts
│   │
│   └── infra/                 # Infrastructure utilities
│       ├── src/
│       │   ├── cdk/          # CDK constructs
│       │   └── utils/        # IaC helpers
│       └── index.ts
│
├── infra/                      # Infrastructure as Code
│   ├── cdk/                   # AWS CDK definitions
│   │   ├── bin/              # CDK app entry
│   │   ├── lib/              # Stack definitions
│   │   │   ├── network/      # VPC, subnets
│   │   │   ├── compute/      # Beanstalk, ALB
│   │   │   ├── database/     # RDS, Redis
│   │   │   └── storage/      # S3 buckets
│   │   └── cdk.json
│   │
│   └── pipelines/             # CI/CD definitions
│       ├── github/           # GitHub Actions
│       └── scripts/          # Deployment scripts
│
├── scripts/                    # Utility scripts
│   ├── db-migrations/         # Database migrations
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   ├── analytics/             # Analytics scripts
│   └── setup/                 # Development setup
│
├── tools/                      # Build & development tools
│   ├── config/                # Shared configurations
│   │   ├── eslint/           # ESLint rules
│   │   ├── prettier/         # Prettier config
│   │   └── jest/             # Jest presets
│   └── generators/            # Nx generators
│
├── docs/                       # Documentation
│   ├── architecture/          # Architecture docs
│   ├── prd/                  # Product requirements
│   ├── stories/              # User stories
│   └── qa/                   # QA documentation
│
├── .bmad-core/                # BMAD framework
│   ├── agents/               # AI agents
│   ├── tasks/                # Task definitions
│   └── templates/            # Templates
│
├── docker-compose.yml         # Local development
├── nx.json                    # Nx configuration
├── package.json              # Root package.json
├── tsconfig.base.json        # Base TypeScript config
└── README.md                 # Project documentation
```

## Key Directories

### Applications (`/apps`)

Each application is self-contained with its own configuration but shares common libraries:

- **admin-web**: Vite-based React admin dashboard
- **mobile-app**: Expo-managed React Native app
- **api-gateway**: NestJS REST API service
- **batch-jobs**: Background job processors

### Shared Libraries (`/libs`)

Reusable code shared across applications:

- **domain**: Core business logic and models
- **ui**: Shared UI components (React/React Native)
- **data-access**: API clients and data fetching
- **auth**: Authentication and authorization
- **infra**: Infrastructure utilities

### Infrastructure (`/infra`)

Infrastructure as Code and deployment:

- **cdk**: AWS CDK stack definitions
- **pipelines**: CI/CD pipeline configurations

### Scripts (`/scripts`)

Automation and utility scripts:

- **db-migrations**: Prisma schema and migrations
- **analytics**: Data analysis scripts
- **setup**: Development environment setup

### Tools (`/tools`)

Development tooling configuration:

- **config**: Centralized tool configurations
- **generators**: Custom Nx workspace generators

## File Naming Conventions

### TypeScript/JavaScript

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE in files (e.g., `API_ENDPOINTS.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Types/Interfaces**: PascalCase with `.types.ts` suffix

### Folders

- **Feature modules**: kebab-case (e.g., `user-management/`)
- **Shared utilities**: lowercase (e.g., `utils/`, `helpers/`)

### Test Files

- **Unit tests**: `*.spec.ts` or `*.test.ts`
- **E2E tests**: `*.e2e-spec.ts`
- **Test fixtures**: `*.fixture.ts`

## Import Path Aliases

Configured in `tsconfig.base.json`:

```typescript
{
  "paths": {
    "@beauty/domain": ["libs/domain/src/index.ts"],
    "@beauty/ui": ["libs/ui/src/index.ts"],
    "@beauty/data-access": ["libs/data-access/src/index.ts"],
    "@beauty/auth": ["libs/auth/src/index.ts"],
    "@beauty/infra": ["libs/infra/src/index.ts"]
  }
}
```

## Module Boundaries

Nx enforces module boundaries to maintain clean architecture:

- Apps can import from libs
- Libs cannot import from apps
- Domain lib cannot import from other libs
- UI lib can only import from domain
- Data-access can import from domain and auth

## Build Artifacts

Generated build outputs:

- `/dist/apps/` - Compiled applications
- `/dist/libs/` - Compiled libraries
- `/coverage/` - Test coverage reports
- `/storybook-static/` - Built Storybook
