import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Home, Star, Shield, BookOpen, CheckCircle, LogOut, Menu, Bell } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import AIAssistant from '../ai/AIAssistant';

const NAV = [
  { to: '/portail',               icon: Home,        label: 'Mon tableau de bord', exact: true },
  { to: '/portail/qualite',       icon: Shield,      label: 'Qualité de service' },
  { to: '/portail/formation',     icon: BookOpen,    label: 'Évaluation formation' },
  { to: '/portail/mes-evaluations', icon: CheckCircle, label: 'Mes évaluations' },
];

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    toast.success('À bientôt ! 👋');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/70 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="ISI" className="h-9 w-auto object-contain" />
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm">ISI / SUPTECH</div>
              <div className="text-blue-300 text-xs">Portail Étudiant</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(({ to, icon: Icon, label, exact }) => (
              <NavLink key={to} to={to} end={exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'}`
                }>
                <Icon className="w-4 h-4" />
                <span className="hidden xl:block">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-white text-xs font-semibold">{user?.name}</div>
                <div className="text-blue-300 text-xs">{user?.classe?.nom || user?.filiere?.nom || 'Étudiant'}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="fixed top-16 left-0 right-0 bg-blue-900 border-b border-blue-700 z-30 lg:hidden px-4 py-3 space-y-1">
              {NAV.map(({ to, icon: Icon, label, exact }) => (
                <NavLink key={to} to={to} end={exact} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`
                  }>
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-blue-700 mt-2 pt-2 text-center text-xs text-blue-400">
                Développé par <strong>MULTI BRAIN TECH</strong>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Footer */}
      <footer className="mt-12 py-6 bg-blue-900/10 border-t border-blue-100 text-center">
        <div className="text-xs text-slate-400">
          ISI / SUPTECH — Plateforme d'Évaluation &nbsp;|&nbsp; Développé par <strong className="text-blue-600">MULTI BRAIN TECH</strong>
        </div>
      </footer>
    </div>
  );
}
