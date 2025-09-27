import { RouteObject } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { RevenueListPage } from './pages/revenue/RevenueList';
import { BulkImportPage } from './pages/revenue/BulkImport';
import { CostsPage } from './pages/Costs';
import { ReportsPage } from './pages/Reports';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/revenue',
    element: <RevenueListPage />,
  },
  {
    path: '/revenue/bulk-import',
    element: <BulkImportPage />,
  },
  {
    path: '/costs',
    element: <CostsPage />,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
];
