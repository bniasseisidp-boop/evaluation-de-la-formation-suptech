import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, FlaskConical,
  Mail, BarChart3, LogOut, Menu, X, ChevronRight, ShieldCheck, Send
} from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/admin/filieres',    icon: BookOpen,        label: 'Filières' },
  { to: '/admin/classes',     icon: GraduationCap,   label: 'Classes' },
  { to: '/admin/professeurs', icon: Users,           label: 'Professeurs' },
  { to: '/admin/matieres',    icon: FlaskConical,    label: 'Matières' },
  { to: '/admin/students',    icon: Users,           label: 'Étudiants' },
  { to: '/admin/invitations', icon: Mail,            label: 'Invitations' },
  { to: '/admin/reports',     icon: BarChart3,       label: 'Rapports & Exports' },
  { to: '/admin/emails',      icon: Send,            label: 'Envoi des rapports' },
  { to: '/admin/admins',      icon: ShieldCheck,     label: 'Administrateurs' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 ${mobile ? 'w-72' : sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>

      {/* Logo */}
      <div className={`p-4 border-b border-slate-100 flex items-center ${sidebarOpen || mobile ? 'gap-3' : 'justify-center'}`}>
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          <img src="/logo.png" alt="ISI" className="h-6 w-auto object-contain" />
        </div>
        {(sidebarOpen || mobile) && (
          <div className="overflow-hidden">
            <div className="text-slate-900 font-bold text-sm leading-tight">ISI / SUPTECH</div>
            <div className="text-blue-600 text-xs font-medium">Administration</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto px-2">
        {(sidebarOpen || mobile) && (
          <div className="px-3 mb-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Navigation</span>
          </div>
        )}
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {(sidebarOpen || mobile) && (
              <>
                <span className="truncate flex-1">{label}</span>
                <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-slate-100 ${sidebarOpen || mobile ? '' : 'flex justify-center'}`}>
        {(sidebarOpen || mobile) ? (
          <>
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 text-xs font-semibold truncate">{user?.name}</div>
                <div className="text-slate-400 text-xs truncate">{user?.email}</div>
              </div>
              <button onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 px-1 text-center">
              <div className="text-[10px] text-slate-400">Développé par</div>
              <div className="text-[10px] font-bold text-blue-600">MULTI BRAIN TECH</div>
            </div>
          </>
        ) : (
          <button onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden shadow-2xl">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-slate-900 font-bold text-sm">Espace Administrateur</div>
              <div className="text-slate-400 text-xs">ISI / SUPTECH — Plateforme d'Évaluation</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 text-xs font-medium">En ligne</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
