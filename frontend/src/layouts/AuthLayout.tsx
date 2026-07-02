import { Outlet } from 'react-router-dom';
import AppFooter from '../components/AppFooter';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}
