import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { AuthUser, Rol } from './types';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AjustadorDashboard from './pages/AjustadorDashboard';
import ClientDashboard from './pages/ClientDashboard';

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const DASHBOARD_PATH: Record<Rol, string> = {
  ADMIN: '/admin',
  AJUSTADOR: '/ajustador',
  CLIENTE: '/cliente',
};

function ProtectedRoute({ allowedRol }: { allowedRol: Rol }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== allowedRol) return <Navigate to={DASHBOARD_PATH[user.rol]} replace />;
  return <Outlet />;
}

function RootRedirect() {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={DASHBOARD_PATH[user.rol]} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute allowedRol="ADMIN" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRol="AJUSTADOR" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/ajustador" element={<AjustadorDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRol="CLIENTE" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/cliente" element={<ClientDashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
