import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [particles] = useState(() => Array.from({ length: 15 }, (_, i) => ({
    id: i, x: Math.random() * 100, size: Math.random() * 4 + 2,
    dur: Math.random() * 5 + 5, delay: Math.random() * 5,
  })));

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : '/portail');
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.user, res.data.token);
      toast.success(`Bienvenue, ${res.data.user.name} ! 🎉`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/portail');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/50 to-slate-950" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full bg-blue-400/15"
          style={{ width: p.size, height: p.size, left: `${p.x}%`,
            animation: `particle-float ${p.dur}s ${p.delay}s ease-in-out infinite` }} />
      ))}

      {/* Logo top left */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-20">
        <img src="/logo.png" alt="ISI" className="h-10 object-contain" />
        <span className="text-white font-bold text-sm hidden sm:block">ISI / SUPTECH</span>
      </Link>

      {/* MULTI BRAIN TECH badge */}
      <div className="absolute bottom-6 w-full text-center z-20">
        <span className="text-xs text-slate-500">Développé par </span>
        <span className="text-xs font-bold text-blue-400">MULTI BRAIN TECH</span>
      </div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.7 }}
        className="relative z-10 w-full max-w-md mx-4">

        <div className="glass border border-white/15 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 animate-pulse" />
                <img src="/logo.png" alt="ISI" className="relative h-20 w-auto object-contain" />
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-2xl font-black text-white">ISI / SUPTECH</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-slate-400 text-sm mt-1">Plateforme d'Évaluation des Formations</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 mt-3 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Connexion sécurisée</span>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('email', { required: 'Email requis', pattern: { value: /^\S+@\S+$/, message: 'Email invalide' } })}
                  type="email" placeholder="votre@email.com"
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/15'} text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-200`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label className="text-slate-300 text-sm font-medium mb-2 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('password', { required: 'Mot de passe requis' })}
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/15'} text-white placeholder-slate-500 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-200`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </motion.div>

            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              type="submit" disabled={loading}
              className="w-full relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 overflow-hidden group">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    🚀 Se connecter
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
            </motion.button>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-300 text-xs text-center leading-relaxed">
              📧 Accès réservé aux personnes invitées par l'administration.<br />
              Vérifiez votre email pour vos identifiants de connexion.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-4 text-center">
            <Link to="/" className="text-slate-400 hover:text-white text-xs transition-colors">
              ← Retour à l'accueil
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
