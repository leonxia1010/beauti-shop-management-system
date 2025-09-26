# High Level Architecture

## Technical Summary

beauty-shop-management-system adopts a modular, cost-conscious fullstack architecture anchored on AWS. The frontend surfaces include an admin web console built with Vite + React 18 + TypeScript and a React Native (Expo) mobile app; the WeChat mini program is deferred until demand justifies it. Backend services run on NestJS (TypeScript) packaged in Docker and deployed via AWS Elastic Beanstalk (single container mode) atop t4g.small instances for low operational cost. RESTful APIs are exposed through an Application Load Balancer secured with Cognito-issued JWTs. Core data resides in Amazon RDS for PostgreSQL (t4g.small, Multi-AZ), with Amazon S3 handling document storage and Amazon SES used for lightweight notifications. Security is enforced through Cognito for auth, VPC network isolation, KMS-encrypted storage, and CloudWatch logging. This setup keeps monthly spend lean while preserving a clean developer experience through a monorepo and shared TypeScript domain models.

## Platform and Infrastructure Choice

**Platform:** AWS (Primary)
**Key Services:** VPC (public/private subnets), Elastic Beanstalk (Docker), Application Load Balancer, Amazon RDS for PostgreSQL (Multi-AZ t4g.small), Amazon S3, Amazon Cognito, AWS Certificate Manager, AWS Secrets Manager, Amazon SES (notifications), Amazon CloudWatch Logs/Metrics, AWS Backup (snapshots), IAM
**Deployment Host and Regions:** ap-southeast-2 (Sydney) primary with automated backups replicated to ap-northeast-1 (Tokyo)

**Rationale:**

- Elastic Beanstalk abstracts EC2/ALB provisioning while allowing cost control via Graviton (t4g) instances.
- RDS for PostgreSQL provides managed backups and Multi-AZ at lower cost than Aurora.
- Cognito’s free tier covers initial user volume, integrates with React and React Native clients, and supports future MFA.
- Removing optional services (WAF, GuardDuty, EventBridge, SQS) keeps the stack simple; security relies on private subnets, security groups, and IAM least privilege.
- SES offers cost-effective email notifications; SMS/WeChat can be added later if needed.

## Repository Structure

Adopt an Nx-powered monorepo (pnpm workspace) to maximize code sharing across web, mobile, backend services, shared libraries, and infrastructure-as-code. Use npm as the default package manager for production deployments (pnpm can remain as optional dev tool if team prefers, but npm lockfile will be canonical).

```
/beauty-shop-management-system
  apps/
    admin-web/            # Vite + React 18 (TypeScript)
    mobile-app/           # React Native (Expo Managed)
    api-gateway/          # NestJS application (REST + background workers)
    batch-jobs/           # Scheduled workers for reconciliation, exports
  libs/
    domain/               # Shared domain models, validation schemas (Zod)
    ui/                   # Shared UI components (React Native Web compatible)
    data-access/          # API clients, GraphQL hooks (if added later)
    auth/                 # Cognito wrappers, permission helpers
    infra/                # CDK constructs, IaC utilities
  infra/
    cdk/                  # AWS CDK stacks (network, database, services)
    pipelines/            # CI/CD definitions
  scripts/
    db-migrations/
    analytics/
  tools/
  package.json
  pnpm-workspace.yaml
  nx.json
  turbo.json
```

## Runtime Component Stack

- **Frontend**

  - Admin Web: Vite 5 + React 18 + TypeScript, TanStack Query, Zustand, React Hook Form; UI 由 shadcn/ui（Radix + Tailwind）驱动，并通过 Tremor + Recharts 封装统计图表组件
  - Mobile App: React Native + Expo, React Query + Zustand, NativeBase component library, Expo SecureStore for token storage

- **Backend**

  - NestJS (Node 20) packaged as Docker container, deployed via AWS Elastic Beanstalk (single-container)
  - RESTful APIs behind Application Load Balancer; no API Gateway to reduce cost/latency
  - Background jobs using Nest Schedule (cron) and BullMQ (Redis) running inside the same service cluster (optionally Redis hosted via ElastiCache or self-managed)
  - Data layer using Prisma ORM targeting PostgreSQL

- **Database & Storage**

  - Amazon RDS for PostgreSQL (t4g.small Multi-AZ) as single source of truth
  - Amazon S3 for receipt/document storage with lifecycle policies to Intelligent-Tiering
  - (Optional later) Amazon Glacier for long-term archival if compliance requires

- **Integration & Messaging**

  - Email notifications via Amazon SES
  - In-app notifications stored in PostgreSQL; push notifications via Expo push service

- **Identity & Access**

  - Cognito User Pools for partner, store manager, beautician roles; future federation ready
  - IAM roles with least privilege; Secrets Manager for database credentials

- **DevEx & Tooling**
  - npm + Nx for monorepo management (pnpm optional for dev caching)
  - Storybook for admin UI + NativeBase components, MSW for API mocking
  - ESLint + Prettier + lint-staged（配置集中在 `tools/config`）：提交前强制执行 `npm run lint` / `npm run format`，统一代码风格

## High-Level Architecture Diagram

```mermaid
graph TD
  subgraph Client
    A[Admin Web (Vite + React)]
    B[Mobile App (React Native)]
  end

  subgraph Identity
    Cognito[(AWS Cognito)]
  end

  subgraph API Layer
    ALB[Application Load Balancer]
  end

  subgraph Services
    Beanstalk[Elastic Beanstalk - NestJS]
    Scheduler[Nest Scheduled Jobs]
    Redis[(Redis/BullMQ optional)]
  end

  subgraph Data
    RDS[(RDS PostgreSQL)]
    S3Data[(S3 Receipts)]
    Secrets[Secrets Manager]
  end

  subgraph Observability
    CloudWatch
    Sentry[(Sentry Optional)]
  end

  A --> ALB
  B --> ALB
  ALB --> Beanstalk
  Cognito --> A
  Cognito --> B
  Beanstalk --> RDS
  Beanstalk --> S3Data
  Scheduler --> Beanstalk
  Beanstalk --> CloudWatch
  Secrets --> Beanstalk
  Beanstalk --> Sentry
```
