# Coding Standards

## Core Principles

### SOLID, KISS, DRY

- **Single Responsibility**: Each function/class does one thing well
- **Keep It Simple**: Avoid premature abstractions and clever code
- **Don't Repeat Yourself**: Extract shared logic to `libs/`
- **Interface Segregation**: Small, focused interfaces over large ones
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### Type Safety

- **Never use `any`**: Use `unknown` with type guards when needed
- **No `@ts-ignore`**: Fix the type issue or document with review approval
- **Strict mode**: TypeScript strict mode enabled project-wide
- **Type imports**: Use `import type` for type-only imports

## Critical Standards

### Type Sharing

- All DTOs and domain types defined in `libs/domain`
- Clients must import types rather than redefining
- Use Zod schemas for runtime validation
- Export both TypeScript types and Zod schemas

### Authorization

- Every API handler must invoke `AuthzGuard` with role + store scope
- Never bypass authorization checks
- Use decorator pattern for consistent auth: `@UseGuards(AuthzGuard)`
- Implement least privilege principle

### Data Validation

- Use Zod schemas for all inbound payloads before persistence
- Validate at the edge (API layer)
- Return detailed validation errors
- Never trust client data

### Logging

- All domain mutations must emit structured logs with:
  - requestId
  - actorId
  - storeId
  - timestamp
- Use correlation IDs for request tracing
- Log levels: ERROR, WARN, INFO, DEBUG

### Error Handling

- Throw `DomainError` subclasses for business errors
- Backend responds via global filter for consistent `ApiError` shape
- Never swallow errors silently
- Include error context for debugging

### Secrets Management

- Never read `process.env` directly outside config module
- Use centralized `ConfigService` only
- Store secrets in AWS Secrets Manager
- Rotate secrets regularly

## Frontend Standards

### Component Organization

- Components, hooks from `libs/ui` / `libs/domain`
- No relative imports across app boundaries
- Feature folders contain:
  - components/
  - hooks/
  - services/
  - types/

### Chart Usage

- All charts via `libs/ui/charts` wrapper components
- Never instantiate Tremor/Recharts directly in features
- Consistent theming through wrapper layer
- Responsive by default

### CSS/Styling

- Tailwind classes from design tokens only
- No hardcoded colors or spacing
- shadcn components: modifications in `libs/ui/shadcn`
- CSS modules for component-specific styles when needed

### API Integration

- Use generated SDK (axios wrapper) exclusively
- No manual `fetch()` calls
- Centralized error handling
- Request/response interceptors for auth

## Backend Standards

### Repository Pattern

- All Prisma operations through Repository layer
- No direct Prisma client usage in services
- Transaction support at repository level
- Query optimization in repositories

### Service Layer

- Business logic in services, not controllers
- Services are stateless
- Dependency injection for all dependencies
- Unit testable without database

### API Design

- RESTful conventions
- Versioned endpoints (`/api/v1/`)
- Consistent response format
- Pagination for list endpoints

## Naming Conventions

| Element          | Frontend                 | Backend                  | Example                  |
| ---------------- | ------------------------ | ------------------------ | ------------------------ |
| **Files**        |                          |                          |                          |
| Components       | PascalCase.tsx           | -                        | `UserProfile.tsx`        |
| Hooks            | camelCase.ts             | -                        | `useAuth.ts`             |
| Services         | camelCase.service.ts     | camelCase.service.ts     | `user.service.ts`        |
| Controllers      | -                        | camelCase.controller.ts  | `user.controller.ts`     |
| Modules          | -                        | camelCase.module.ts      | `user.module.ts`         |
|                  |                          |                          |                          |
| **Code**         |                          |                          |                          |
| Variables        | camelCase                | camelCase                | `firstName`              |
| Constants        | UPPER_SNAKE_CASE         | UPPER_SNAKE_CASE         | `MAX_RETRY_COUNT`        |
| Functions        | camelCase                | camelCase                | `calculateTotal()`       |
| Classes          | PascalCase               | PascalCase               | `UserService`            |
| Interfaces       | PascalCase with I prefix | PascalCase with I prefix | `IUserRepository`        |
| Types            | PascalCase               | PascalCase               | `UserDto`                |
| Enums            | PascalCase               | PascalCase               | `UserRole`               |
|                  |                          |                          |                          |
| **API/Database** |                          |                          |                          |
| API Routes       | -                        | kebab-case               | `/api/v1/cash-handovers` |
| Database Tables  | -                        | snake_case               | `cash_handover_batches`  |
| Database Columns | -                        | snake_case               | `created_at`             |
| Event Names      | camelCase                | kebab-case               | `cash.batch-closed`      |
| Queue Names      | -                        | kebab-case               | `cash-handover-workers`  |

## Testing Standards

### Test Coverage

- Minimum 80% unit test coverage
- Critical paths require integration tests
- E2E tests for user journeys
- Performance tests for high-traffic endpoints

### Test Organization

- Tests next to source files (`.spec.ts`, `.test.ts`)
- Test fixtures in `__fixtures__/`
- Mocks in `__mocks__/`
- E2E tests in `/test/e2e/`

### Test Naming

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', () => {});
    it('should throw error when email exists', () => {});
  });
});
```

## Code Review Checklist

### Before Submitting PR

- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Secrets not hardcoded

### Review Focus Areas

- Business logic correctness
- Security vulnerabilities
- Performance implications
- Code reusability
- Error handling
- Test coverage

## Git Conventions

### Branch Naming

- `feature/story-1.1-description`
- `bugfix/issue-123-description`
- `hotfix/critical-issue`
- `chore/update-dependencies`

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Performance Guidelines

### Frontend

- Lazy load routes and components
- Memoize expensive computations
- Virtualize long lists
- Optimize images (WebP, lazy loading)
- Bundle splitting by route

### Backend

- Use database indexes appropriately
- Implement caching strategy (Redis)
- Paginate large result sets
- Use connection pooling
- Optimize N+1 queries

## Security Guidelines

### Input Validation

- Validate all user inputs
- Sanitize data before storage
- Use parameterized queries
- Implement rate limiting

### Authentication

- JWT tokens with short expiry
- Refresh token rotation
- MFA for sensitive operations
- Session invalidation on logout

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS everywhere
- Implement CORS properly
- Regular security audits
