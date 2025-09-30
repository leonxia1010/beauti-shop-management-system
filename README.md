# 🌸 Beauty Shop Management System

[![Simple CI Pipeline](https://img.shields.io/badge/CI-Simple%20Pipeline-brightgreen.svg)](https://github.com/YOUR_USERNAME/beauty-shop-management-system/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

A modern, enterprise-grade beauty shop management system built with cutting-edge technologies. This **Nx monorepo** provides a complete solution including web admin dashboard, mobile app, REST API, and background job processing.

## 🚀 Project Status

- ✅ **Story 1.1 Complete**: Monorepo baseline infrastructure setup
- 🔄 **Current Phase**: Ready for business feature development
- 📊 **QA Status**: PASS - All quality gates met

## 🏗️ Tech Stack

### Core Technologies

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo
- **Backend**: NestJS + Node.js 20
- **Database**: PostgreSQL 15 + Redis 7
- **Build Tools**: Nx Monorepo + Webpack/Vite
- **Deployment**: Docker + AWS

### Application Architecture

```
apps/
├── admin-web/     # 🌐 Web Admin Dashboard (React + Vite)
├── mobile-app/    # 📱 Mobile Application (React Native)
├── api-gateway/   # 🚀 REST API Service (NestJS)
└── batch-jobs/    # ⚙️ Background Job Processor (NestJS)

libs/
├── domain/        # 📋 Business Domain Models
├── ui/           # 🎨 Shared UI Components
├── data-access/  # 🔌 Data Access Layer
├── auth/         # 🔐 Authentication & Authorization
└── infra/        # 🛠️ Infrastructure Utilities
```

## 🚦 Quick Start

### Prerequisites

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Docker & Docker Compose

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd beauty-shop-management-system
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and set these required values:
# - DB_PASSWORD: Your PostgreSQL password
# - REDIS_PASSWORD: Your Redis password
# - JWT_SECRET: Generate with the following command
openssl rand -base64 64
```

### 4️⃣ Start Database Services

```bash
npm run db:start
```

### 5️⃣ Launch Applications

```bash
# Start API service (localhost:3010)
npm run dev:api

# Start Web admin dashboard (localhost:4200)
npm run dev:web
```

## 📋 Available Scripts

### 🚀 Development Services

```bash
npm run dev:api      # Start API Gateway service
npm run dev:web      # Start Web admin dashboard
npm run dev:mobile   # Start Mobile application
npm run dev:jobs     # Start Background job processor
```

### 🗄️ Database Management

```bash
npm run db:start     # Start PostgreSQL + Redis
npm run db:stop      # Stop database services
npm run db:reset     # Reset database (removes all data)
npm run db:logs      # View database logs
```

### 🐳 Docker Operations

```bash
npm run docker:up    # Start all Docker services
npm run docker:down  # Stop all Docker services
```

### 🔍 Code Quality

```bash
npm run lint         # Run ESLint checks
npm run test         # Run all tests
npm run build        # Build all projects
npm run check        # Run comprehensive quality checks
npm run fix          # Auto-fix formatting issues
```

### 📊 Nx Tools

```bash
npm run graph           # Visualize project dependency graph
npm run affected:test   # Test only affected projects
npm run affected:lint   # Lint only affected projects
npm run affected:build  # Build only affected projects
```

## 🌐 Service Endpoints

| Service        | URL                       | Description          |
| -------------- | ------------------------- | -------------------- |
| 🌐 Admin Web   | http://localhost:4200     | Management dashboard |
| 🚀 API Gateway | http://localhost:3010/api | REST API service     |
| 🗄️ PostgreSQL  | localhost:5432            | Primary database     |
| 🔴 Redis       | localhost:6379            | Cache service        |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific project tests
npx nx test admin-web
npx nx test api-gateway

# Test with coverage
npm run test -- --coverage
```

## 📦 Build & Deploy

```bash
# Build all projects
npm run build

# Build specific project
npx nx build admin-web
npx nx build api-gateway

# Docker deployment
npm run docker:up
```

## 📁 Project Structure

### Applications (`apps/`)

- **admin-web**: Vite + React admin dashboard with shadcn/ui components
- **mobile-app**: Expo-managed React Native mobile application
- **api-gateway**: NestJS REST API gateway handling business logic
- **batch-jobs**: Background job processor for async operations

### Shared Libraries (`libs/`)

- **domain**: Business models, Zod validation schemas, constants
- **ui**: Cross-platform UI components, design tokens, shared hooks
- **data-access**: API clients, React Query hooks, type definitions
- **auth**: Cognito integration, auth guards, RBAC utilities
- **infra**: CDK constructs, infrastructure helper utilities

## 🔐 Security Features

- ✅ ESLint security plugin (11 security rules active)
- ✅ Environment variable encryption
- ✅ JWT token authentication
- ✅ No hardcoded credentials
- ✅ Docker service isolation

## 🚀 Performance Optimizations

- ✅ Vite fast builds (232KB gzipped admin bundle)
- ✅ Webpack-optimized NestJS bundles (2.72KB)
- ✅ Docker health checks
- ✅ Nx caching and parallel execution

## 🤝 Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/story-x.x-description`
2. **Development**: Use `npm run dev:*` commands to start services
3. **Quality Check**: Run `npm run check` before committing
4. **Commit**: Git hooks automatically run linting and formatting
5. **CI/CD**: GitHub Actions automatically builds and tests

## 📚 Documentation

- [Architecture Documentation](docs/architecture/)
- [Product Requirements](docs/prd/)
- [User Stories](docs/stories/)
- [QA Documentation](docs/qa/)

## 🛠️ Development Tools

- **VS Code**: Recommended with Nx Console extension
- **Debugging**: API service supports Node.js debugging (port 9229)
- **Dependency Graph**: Run `npm run graph` to visualize project structure

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---
