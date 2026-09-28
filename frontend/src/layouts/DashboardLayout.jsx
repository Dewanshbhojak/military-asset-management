import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  Building2,
  Boxes,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  Flame,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Bases', path: '/bases', icon: Building2, roles: ['ADMIN'] },
    { label: 'Equipment', path: '/equipment', icon: Boxes, roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
    { label: 'Inventory', path: '/inventory', icon: Shield, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { label: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
    { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
    { label: 'Assignments', path: '/assignments', icon: UserCheck, roles: ['ADMIN', 'BASE_COMMANDER'] },
    { label: 'Expenditures', path: '/expenditures', icon: Flame, roles: ['ADMIN', 'BASE_COMMANDER'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['ADMIN'] },
    { label: 'Users', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !role || item.roles.includes(role)
  );

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'BASE_COMMANDER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOGISTICS_OFFICER':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-[0.14em] leading-tight">INDIAN ARMY</h1>
            <p className="text-[10px] uppercase tracking-[0.12em]">LOGISTICS COMMAND</p>
            <p className="text-[10px] uppercase tracking-[0.12em]">ASSET MANAGEMENT</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(role)}`}>
                  {role || 'USER'}
                </span>
                {user?.baseId && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    BASE: {({ 1: 'DELHI', 2: 'JAIPUR', 3: 'PUNE' })[user.baseId] || `#${user.baseId}`}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm text-slate-100">INDIAN ARMY · LOGISTICS COMMAND</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-200 font-semibold">{user?.email}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${getRoleBadgeStyle(role)}`}>
                {role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
