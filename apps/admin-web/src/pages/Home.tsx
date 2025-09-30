import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
    </div>
  );
}
