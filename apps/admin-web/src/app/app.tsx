import { Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { routes } from '../Routes';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
