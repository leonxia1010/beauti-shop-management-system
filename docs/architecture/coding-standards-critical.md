# Coding Standards (Critical)

- **Type Sharing:** All DTOs and domain types defined in `libs/domain`; clients must import types rather than redefining.
- **Authorization:** Every API handler must invoke the `AuthzGuard` with role + store scope enforcement; never bypass.
- **Data Validation:** Use Zod schemas for inbound payloads before persistence, even if DTOs exist.
- **Logging:** All domain mutations must emit structured logs with requestId, actorId, storeId.
- **Error Handling:** Throw `DomainError` subclasses; backend responds via global filter ensuring consistent ApiError shape.
- **Secrets:** Never read `process.env` directly outside config module; use centralized `ConfigService` only.
- **Frontend Imports:** Web 端组件、hooks 必须从 `libs/ui` / `libs/domain` 导入，不得直接引用 app 内部相对路径，以避免重复实现。
- **Chart Usage:** 所有图表统一通过 `libs/ui/charts` 暴露的封装组件调用，禁止在 feature 模块直接实例化 Tremor/Recharts 组件。
- **CSS/Styling:** Tailwind class 必须来源于 tokens（`theme` 中定义），避免硬编码颜色、间距；shadcn 组件不直接修改生成源码，公共改动放在 `libs/ui/shadcn`。
- **API Layer:** 前端调用统一使用生成的 SDK（axios 封装），禁止手写 `fetch`；后端所有 Prisma 操作必须走 Repository 层，避免散落的直接查询。
- **Design Principles:** 所有模块遵循 SOLID、KISS、DRY：函数单一职责、避免过度抽象；能共享的逻辑移入 `libs`，重复代码需抽象为复用单元；接口命名保持简单直观。
- **Type Safety:** 严禁使用 `any`；如遇框架限制需使用 `unknown` + 类型守卫或 `satisfies` 来确保类型安全，所有 `@ts-ignore` 需附注释并提交代码评审批准。

## Naming Conventions

| Element         | Frontend             | Backend    | Example                  |
| --------------- | -------------------- | ---------- | ------------------------ |
| Components      | PascalCase           | -          | `DailySummaryCard.tsx`   |
| Hooks           | camelCase with `use` | -          | `useCashBatchStatus.ts`  |
| API Routes      | -                    | kebab-case | `/api/v1/cash-handovers` |
| Database Tables | -                    | snake_case | `cash_handover_batches`  |
| Event Names     | camelCase            | kebab-case | `cash.batchClosed`       |
| SQS Queues      | -                    | kebab-case | `cash-handover-workers`  |
