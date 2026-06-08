import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Home, Star, Shield, BookOpen, CheckCircle, LogOut, Menu, X } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import AIAssistant from '../ai/AIAssistant';

const NAV = [
  { to: '/portail',                 icon: Home,        label: 'Mon tableau de bord', exact: true },
  { to: '/portail/qualite',         icon: Shield,      label: 'Qualité de service' },
  { to: '/portail/formation',       icon: BookOpen,    label: 'Évaluation formation' },
  { to: '/portail/mes-evaluations', icon: CheckCircle, label: 'Mes évaluations' },
];

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    toast.success('À bientôt !');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — white, clean */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-500 hover:text-blue-600 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src="/logo.png" alt="ISI" className="h-5 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-900 font-bold text-sm leading-tight">ISI / SUPTECH</div>
              <div className="text-slate-400 text-xs">Portail Étudiant</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(({ to, icon: Icon, label, exact }) => (
              <NavLink key={to} to={to} end={exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User info + logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-slate-800 text-xs font-semibold leading-tight">{user?.name}</div>
                <div className="text-slate-400 text-xs">{user?.classe?.nom || user?.filiere?.nom || 'Étudiant'}</div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
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
              className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="fixed top-14 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-30 lg:hidden px-4 py-3 space-y-1">
              {NAV.map(({ to, icon: Icon, label, exact }) => (
                <NavLink key={to} to={to} end={exact} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }>
                  <Icon className="w-4 h-4" />{label}
                </NavLink>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-3 pb-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                  <LogOut className="w-4 h-4" />Déconnexion
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </motion.main>

      <AIAssistant />

      <footer className="mt-12 py-5 bg-white border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          ISI / SUPTECH — Plateforme d'Évaluation &nbsp;|&nbsp; Développé par{' '}
          <strong className="text-blue-600">MULTI BRAIN TECH</strong>
        </p>
      </footer>
    </div>
  );
}
