# Technology Stack

## Frontend Stack

### Admin Web (Vite + React)

- **Build Tool**: Vite 5
- **Framework**: React 19 with TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**:
  - shadcn/ui (Radix UI + Tailwind CSS)
  - Tremor for dashboard components
  - Recharts for data visualization
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library, Playwright (E2E)

### Mobile App (React Native)

- **Framework**: React Native with Expo (Managed Workflow)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **UI Components**: NativeBase
- **Navigation**: React Navigation
- **Storage**: Expo SecureStore (tokens), AsyncStorage (cache)
- **Testing**: Jest, React Native Testing Library, Detox (E2E)

## Backend Stack

### API Services (NestJS)

- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (TypeScript)
- **API Style**: RESTful
- **Database ORM**: Prisma
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Queue**: BullMQ with Redis (optional)
- **Scheduling**: Nest Schedule (cron jobs)
- **Testing**: Jest, Supertest

### Database & Storage

- **Primary Database**: PostgreSQL 15 (Amazon RDS)
- **Cache**: Redis (ElastiCache or self-managed)
- **Object Storage**: Amazon S3
- **File Processing**: Sharp (images), PDFKit (documents)

## Infrastructure & DevOps

### AWS Services

- **Compute**: Elastic Beanstalk (t4g.small Graviton instances)
- **Load Balancing**: Application Load Balancer (ALB)
- **Database**: RDS for PostgreSQL (Multi-AZ)
- **Storage**: S3 with Intelligent-Tiering
- **Identity**: Cognito User Pools
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch Logs/Metrics
- **Email**: Amazon SES
- **Backup**: AWS Backup
- **Network**: VPC with public/private subnets

### Development Tools

- **Monorepo**: Nx workspace
- **Package Manager**: npm (production), pnpm (optional dev)
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Container**: Docker
- **IaC**: AWS CDK (TypeScript)

## Shared Libraries

### Domain Layer

- **Validation**: Zod schemas
- **Types**: TypeScript interfaces/types
- **Constants**: Shared enums and constants
- **Utilities**: Date/number formatters, validators

### Authentication

- **JWT**: Cognito token validation
- **Permissions**: RBAC utilities
- **Session**: Token refresh logic

### Data Access

- **API Client**: Axios with interceptors
- **Error Handling**: Standardized error types
- **Retry Logic**: Exponential backoff

## Development Standards

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Commit Convention**: Conventional Commits

### Testing Strategy

- **Unit Tests**: 80% coverage target
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
- **Performance**: k6 for load testing

### Documentation

- **API**: Swagger/OpenAPI specs
- **Components**: Storybook
- **Architecture**: ADRs (Architecture Decision Records)

## Version Requirements

```json
{
  "node": ">=20.0.0",
  "npm": ">=10.0.0",
  "postgresql": "15.x",
  "redis": "7.x"
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Safari: Latest 2 versions
- Firefox: Latest 2 versions
- Mobile: iOS 14+, Android 10+
