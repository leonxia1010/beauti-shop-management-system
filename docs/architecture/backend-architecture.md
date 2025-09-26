# Backend Architecture

## Service Breakdown

- **API Service (NestJS on Elastic Beanstalk)**

  - Domain modules: Auth, Appointments, Revenue, Cost, CashFlow, Reporting, Exception, Notifications
  - Exposes REST endpoints with OpenAPI spec auto-generated via Swagger module
  - Cognito JWT guard with role + store-scope decorators
  - Prisma as ORM; connection pooling handled via pgBouncer sidecar or RDS Proxy (optional)

- **Background Jobs**

  - Nest Schedule for cron jobs (daily close, report generation)
  - BullMQ queues (Redis) for long-running tasks like CSV ingestion、预约 vs. 实际对账、以及 OCR (phase 2)
  - Workers deployed as separate Beanstalk environment (worker tier) sharing the same codebase

- **OCR Pipeline (Phase 2)**
  - S3 upload triggers worker job via BullMQ queue; OCR processed by third-party API or AWS Textract invoked from worker

## API Layer

- RESTful endpoints grouped by domain under `/api/v1`
- DTOs validated via class-validator and Zod for additional runtime safety
- Pagination via cursor-based pattern for audit-heavy endpoints
- Rate limiting using Nest rate-limiter guard + ALB listener rules
- Webhook endpoints (future) for partner integrations; currently disabled

## Integration Contracts

- OpenAPI YAML committed to repo, drives SDK generation across web/mobile
- Event schemas documented for internal queues (BullMQ job payloads)
