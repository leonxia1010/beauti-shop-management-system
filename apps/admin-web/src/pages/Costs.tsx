import { PageLayout, EmptyState } from '../components/layout/PageLayout';

export function CostsPage() {
  return (
    <PageLayout title="成本管理" subtitle="管理和查看门店成本记录">
      <EmptyState message="成本管理功能开发中..." />
    </PageLayout>
  );
}
