import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, FlaskConical,
  FileText, Mail, BarChart3, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/admin/filieres',    icon: BookOpen,         label: 'Filières' },
  { to: '/admin/classes',     icon: GraduationCap,    label: 'Classes' },
  { to: '/admin/professeurs', icon: Users,            label: 'Professeurs' },
  { to: '/admin/matieres',    icon: FlaskConical,     label: 'Matières' },
  { to: '/admin/students',    icon: Users,            label: 'Étudiants' },
  { to: '/admin/invitations', icon: Mail,             label: 'Invitations' },
  { to: '/admin/reports',     icon: BarChart3,        label: 'Rapports & Exports' },
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
    <div className={`flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 ${mobile ? 'w-72' : sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
      {/* Logo */}
      <div className={`p-4 border-b border-white/10 flex items-center ${sidebarOpen || mobile ? 'gap-3' : 'justify-center'}`}>
        <img src="/logo.png" alt="ISI" className="h-9 w-auto object-contain flex-shrink-0" />
        {(sidebarOpen || mobile) && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-tight">ISI / SUPTECH</div>
            <div className="text-blue-400 text-xs">Administration</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 active'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {(sidebarOpen || mobile) && <span className="truncate">{label}</span>}
            {(sidebarOpen || mobile) && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-white/10 ${sidebarOpen || mobile ? '' : 'flex justify-center'}`}>
        {(sidebarOpen || mobile) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MULTI BRAIN TECH */}
      {(sidebarOpen || mobile) && (
        <div className="px-3 pb-3 text-center">
          <div className="text-xs text-slate-600">Développé par</div>
          <div className="text-xs font-bold text-blue-500">MULTI BRAIN TECH</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(!mobileOpen); }}
              className="text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-white font-semibold text-sm">Espace Administrateur</div>
              <div className="text-slate-400 text-xs">ISI / SUPTECH — Plateforme d'Évaluation</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">En ligne</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
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
