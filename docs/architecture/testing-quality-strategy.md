# Testing & Quality Strategy

- **Unit Tests:** Jest for backend modules, React Testing Library for components, Zod schema tests for data contracts.
- **Integration Tests:** Pact (consumer-driven) between frontend SDK and API; supertest for API endpoints against ephemeral Postgres via Testcontainers.
- **E2E:** Playwright (admin web), Detox (mobile), mini program automated tests via miniprogram-automation.
- **Performance:** k6 scripts for API throughput, AWS Distributed Load Testing for full system.
- **Security:** Snyk/Dependabot for dependency scanning, AWS Inspector for container images, Zap baseline scans for web.
