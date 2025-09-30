import { RouteObject } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { RevenuePage } from './pages/revenue';
import { CostsPage } from './pages/costs';
import { ReportsPage } from './pages/reports/index';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/revenue',
    element: <RevenuePage />,
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
