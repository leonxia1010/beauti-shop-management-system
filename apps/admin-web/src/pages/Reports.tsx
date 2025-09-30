import { PageLayout, EmptyState } from '../components/layout/PageLayout';

export function ReportsPage() {
  return (
    <PageLayout title="报表" subtitle="查看各种数据分析报表">
      <EmptyState message="报表功能开发中..." />
    </PageLayout>
  );
}
