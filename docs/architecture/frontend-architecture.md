# Frontend Architecture

-### Admin Web (Vite + React)

- **Framework:** Vite 5 + React 18 + TypeScript, React Router v6, TanStack Query, Zustand, React Hook Form + Zod
- **Styling & Components:** Tailwind CSS + shadcn/ui（Radix primitives），自建 `libs/ui/components` 封装表单、数据表、抽屉等复合组件
- **Authentication:** Cognito Hosted UI (PKCE) → tokens stored in httpOnly cookies via lightweight BFF proxy within Nest; fallback to refresh-token rotation in SecureStore for mobile
- **Routing:** React Router nested routes with role-based guards; lazy loading per module
- **Data Fetching:** Axios-based SDK generated from OpenAPI; SSE/long polling for batch status updates
- **Hosting:** Vite build artifacts served as static assets by the NestJS API service (Express static middleware) so the ALB handles both UI and API traffic without extra hosting cost
- **Testing:** Playwright (E2E) + Jest + React Testing Library; Storybook for UI regression testing
- **Key Modules:** 收入/成本录入向导、预约/预期服务登记、现金交接批次、异常看板与报表中心。

## Mobile App (React Native + Expo)

- **Structure:** Expo Managed workflow, TypeScript, React Navigation
- **State/Data:** React Query + Zustand with offline cache (AsyncStorage) and background sync
- **Auth:** Cognito with PKCE flow and refresh tokens stored via Expo SecureStore
- **Integrations:** Camera & DocumentPicker for receipt capture; push notifications via Expo Push + SSE fallback
- **Styling & Components:** NativeBase 3 结合自定义 theme，与 Web 端 shadcn 共享 design tokens（颜色/排版/间距）以保持品牌一致
- **Distribution:** EAS Build/Submit + OTA updates with Expo Updates
- **Key Workflows:** 美容师录入服务与现金交接、补贴申请、查看预约任务与异常提醒。

## Shared UI & SDK

- Shared UI primitives 在 `libs/ui` 中维护：
  - `libs/ui/shadcn`：shadcn/ui 生成的基础组件与 Tailwind 主题（以 design tokens 抽离变量）
  - `libs/ui/charts`：封装 Tremor + Recharts 组合图表（折线、柱状、饼图、漏斗等），对外暴露 `<ChartCard>`, `<TrendChart>` 等统一 API
  - `libs/ui/native`：React Native (NativeBase) 组件主题，与 Web 共享颜色/间距 token
- Shared API SDK generated from OpenAPI definitions using Orval/Swagger Codegen; shared validation schemas in `libs/domain`
- **UI Design References:**
  - [UI/UX Specification](../front-end-spec.md) - Complete design system and component specifications
  - [ASCII Layout Designs](../ui-design/ascii-layouts.md) - Detailed wireframes for all screens
  - [UI Generation Prompts](../ui-prompts.md) - AI-ready prompts for UI implementation

### UI Library Setup Guidelines

- 安装 shadcn/ui CLI (`npx shadcn-ui@latest init`) 并将生成的组件输出目录指向 `libs/ui/shadcn`，所有新增组件统一通过 CLI 添加，避免在各 app 内部散落拷贝。
- 在 `libs/ui/theme` 中维护 Tailwind CSS 配置与 design tokens（颜色、字体、间距等），导出给 Web 端 (Tailwind config) 与 NativeBase theme 使用，确保跨端一致性。
- 图表组件层：
  - 底层库选 Tremor (`@tremor/react`) 作为快速仪表盘组件，针对特殊需求使用 Recharts。所有调用都通过 `libs/ui/charts` 暴露的包装组件。
  - 包装组件需接收统一的 `data`, `series`, `variant` props，内部将色板映射到 design tokens。
- Storybook：
  - 在根目录配置 Storybook 并注入 Tailwind/shadcn 主题；为 `libs/ui` 中的每个组件（包含 chart wrapper）提供故事，确保视觉回归。
- NativeBase：在 `libs/ui/native` 中定义 `nativeBaseTheme`，使用与 Tailwind 同步的 token（可以通过 JSON 导出），移动端组件均从该主题派生。
