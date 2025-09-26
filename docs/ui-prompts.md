[Context & Tech Stack]

- Project: “beauty-shop-management-system” (multi-store beauty salon finance management)
- Web app: Vite + React 18 + TypeScript
- State/Data: TanStack Query, Zustand, React Hook Form
- UI library & tokens: shadcn/ui + Tailwind CSS; primary color #14B8A6, secondary #0F172A,
  success #10B981, warning #F59E0B, danger #EF4444, neutral background #F8FAFC
- Layout: Web 12-column grid, spacing scale 4/8/12/16/24/32px
- Component set: Table (inline edit), Stepper Form, Drawer/Modal, Toast, Kanban columns,
  ChartCard/TrendChart/DonutChart (Tremor + Recharts wrappers), Calendar, Tabs, Timeline, Tag/
  Badge, Notification Drawer
- Accessibility: keyboard navigable, focus visible, aria-live on feedback, contrast ≥4.5:1 (key
  KPI cards ≥7:1)
- Breakpoints: Mobile <768px, Tablet 768–1023px, Desktop 1024–1439px, Wide ≥1440px
- Backend context: NestJS REST API at `/api/v1/...`; cash-handovers, revenue entries, cost
  entries, appointments, exceptions, reports (JSON). Assume JWT auth header `Authorization:
Bearer <token>`.

[High-Level Goal]
Create the initial admin web shell plus three critical screens (Dashboard overview, Daily
Revenue Import flow, Cash Handover list/detail) with responsive layout and shared design
tokens, following the UI/UX specification.

[Detailed Step-by-Step Instructions]

1. Set up project structure inside `/apps/admin-web` (Vite + React TS). Configure Tailwind with
   the provided color palette and spacing; install shadcn/ui, Tremor, Recharts, TanStack Query,
   Zustand, React Hook Form.
2. Create a shared design system in `libs/ui`:
   2.1 Configure Tailwind theme (colors, typography: H1 24/32 600, H2 20/28 600, H3 18/26 500,
   Body 14/22 400, Small 12/18 400).
   2.2 Generate shadcn components into `libs/ui/shadcn` (Button, Card, Tabs, Drawer, Dialog,
   Toast, Table, Form controls, Badge, Skeleton).
   2.3 Build `libs/ui/charts` wrappers: `<ChartCard>`, `<TrendChart>`, `<DonutChart>` using
   Tremor/Recharts and default color palette.
   2.4 Export design tokens (colors, spacing, shadows) via a theme file to be shared by admin
   web.
3. Implement global app shell (`App.tsx`) with:
   3.1 Fixed side navigation (Dashboard, 日终收入, 成本, 现金交接, 报表, 异常, 预约管理, 设置)
   that collapses on <1024px.
   3.2 Top bar with environment switch placeholder, search input, notification bell (drawer on
   click), user menu.
   3.3 Mobile layout: hamburger that opens nav drawer; sticky bottom quick actions (导入、现金
   交接、异常).
   3.4 Route placeholders using React Router; set base routes `/dashboard`, `/revenue`, `/cash-
handovers`, `/reports`, `/exceptions`, `/appointments`, `/settings`.
4. Screen: Dashboard (`/dashboard`)
   4.1 Layout: top metrics row (今日净收入、未交接现金、异常待处理) using `<Card>` with KPI
   values and icons.
   4.2 Middle column (left) shows revenue trend line + top stores table; (right) shows 异常待处
   理列表 (mini Kanban) + 最新现金交接任务.
   4.3 Bottom section with recent batches table and 预约提醒日历 widget.
   4.4 Include skeleton loaders and empty-state placeholder.
   4.5 Fetch mock data via TanStack Query; create `api/mock/dashboard.ts` returning shape
   consistent with eventual API (document interface in `libs/domain/dashboard.ts`).
5. Screen: 日终收入录入 (`/revenue`)
   5.1 Stepper layout: Step 1 上传 (Dropzone, template download link), Step 2 预览 (inline-edit
   table), Step 3 结果 (success/failure summary, export errors).
   5.2 Include validation summary section (list of issues) and Toast notifications.
   5.3 Provide sample API call `POST /api/v1/revenues/import` with payload { fileId,
   overwrite?: boolean } and state transitions; stub with mock function.
   5.4 Add inline edit modal/drawer for fixing individual rows.
6. Screen: 现金交接 (`/cash-handovers`)
   6.1 List view with status tabs (Open, Pending, Closed) and search filters; support card +
   table toggle.
   6.2 Each batch card shows expected vs actual, variance badge, quick actions (Approve,
   Return, Assign).
   6.3 Detail drawer with summary on left, approval timeline on right; include variance reason
   field.
   6.4 Implement action modal to handle approve/return; call stubbed API `PATCH /api/v1/cash-
handovers/:id`.
   6.5 Provide notifications on success/failure using Toast and update list via TanStack Query
   invalidate.
7. Shared components/services:
   7.1 Layout components (`AdminLayout`, `SideNav`, `TopBar`, `MobileQuickActions`).
   7.2 Utility hooks: `useBreakpoint`, `useAuthUser`, `useOfflineToast` (for future integration
   with mobile flows).
   7.3 Zustand stores for UI state (drawer visibility, filters).
8. Styling details:
   8.1 Primary color `#14B8A6` for primary buttons, links, active state; use gradient accent
   for key metrics optionally.
   8.2 Ensure error states highlight rows in `#FEE2E2` with `#EF4444` border.
   8.3 Focus outlines: 2px solid `#14B8A6` on buttons & inputs.
9. Responsiveness & Accessibility:
   9.1 Mobile-first CSS: start with single column; enhance for >=768px (two-column) and
   > =1024px (full 12-column).
   > 9.2 All forms must be keyboard navigable; provide aria-label for icons & aria-live for
   > import/approval results.
10. Testing scaffolding:
    10.1 Add Vitest or Jest setup with simple tests verifying layout renders and stepper
    navigation.
    10.2 Include Storybook stories for new components (KPI card, upload stepper, batch card).
11. Leave placeholder comments where design assets (Figma links) would be inserted. Note TODOs
    for hooking to real API later.

[Reference Structures & Constraints]

- Domain types (create in `libs/domain`): `DashboardSummary`, `RevenueImportStatus`,
  `CashHandoverBatch`.
- API endpoints (stubbed):
  - `POST /api/v1/revenues/import` → { importId, successCount, errorCount, errors[] }
  - `GET /api/v1/cash-handovers?status=` → list of batches
  - `PATCH /api/v1/cash-handovers/:id` → { status, variance, approvedBy }
- Do NOT modify mobile app files under `/apps/mobile-app`.
- Only work inside `/apps/admin-web`, `libs/ui`, `libs/domain`, and `/apps/admin-web/src/api`
  stubs.
- Follow existing ESLint/Prettier/TypeScript config (strict mode).
- Use environment variables via `import.meta.env` pattern (e.g., API base URL).

[Strict Scope]

- Focus on admin web; mobile app remains untouched.
- Do not scaffold authentication UI; assume user already logged in.
- Do not alter repos outside admin web & shared libs.
- Provide mock data/service layer to simulate backend; real integration will be done later.

[Reminder]
Review and test all generated code manually; ensure accessibility, responsiveness, and business
logic align with requirements before production use.
