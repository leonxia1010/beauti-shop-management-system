import { Route, Routes, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '../components/ui/navigation-menu';
import { RevenueListPage } from '../pages/revenue/index';
import { BulkImportPage } from '../pages/revenue/bulk-import';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                美容院管理系统
              </h1>
            </div>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/revenue"
                        className={navigationMenuTriggerStyle()}
                      >
                        收入管理
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/costs"
                        className={navigationMenuTriggerStyle()}
                      >
                        成本管理
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/reports"
                        className={navigationMenuTriggerStyle()}
                      >
                        报表
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  欢迎使用美容院管理系统
                </h1>
                <p className="text-gray-600 mb-8">选择一个功能模块开始使用</p>
                <div className="flex justify-center space-x-6">
                  <Button asChild>
                    <Link to="/revenue">收入管理</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/revenue/bulk-import">批量导入</Link>
                  </Button>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/revenue" element={<RevenueListPage />} />
        <Route path="/revenue/bulk-import" element={<BulkImportPage />} />
        <Route
          path="/costs"
          element={
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      成本管理
                    </h1>
                    <p className="text-gray-600 mt-1">管理和查看门店成本记录</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-600">成本管理功能开发中...</p>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="/reports"
          element={
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">报表</h1>
                    <p className="text-gray-600 mt-1">查看各种数据分析报表</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-600">报表功能开发中...</p>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
