import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

/* ── Carousel photos ── */
const SLIDES = [
  { src: '/images/vitrines/caroursel_isi_suptech_soutenace.jpg', caption: 'Cérémonies de soutenance — ISI SUPTECH' },
  { src: '/images/vitrines/etudant_farda.jpeg',                  caption: 'Étudiants actifs au quotidien' },
  { src: '/images/vitrines/Etudiant_gestion.jpeg',               caption: 'Cours pratiques & encadrement de qualité' },
];

function PhotoCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const prev = () => setIdx(i => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setIdx(i => (i + 1) % SLIDES.length);
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={SLIDES[idx].src} alt={SLIDES[idx].caption}
          initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.8 }}
          className="w-full h-full object-cover" />
      </AnimatePresence>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/75 to-blue-800/60" />
      {/* Caption */}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 z-10 px-6">
        <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.9, y: 0 }}
          className="text-white/80 text-xs text-center backdrop-blur-sm bg-black/20 rounded-full px-4 py-1.5">
          {SLIDES[idx].caption}
        </motion.p>
        <div className="flex items-center gap-4">
          <button onClick={prev} className="w-7 h-7 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-6' : 'bg-white/40 w-1.5'}`} />
            ))}
          </div>
          <button onClick={next} className="w-7 h-7 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Team photos strip ── */
const TEAM = [
  { src: '/images/admin/kara_directeur.jpg',  label: 'Direction' },
  { src: '/images/admin/mbene-tall.jpg',       label: 'Académique' },
  { src: '/images/admin/oumoukhairy.jpg',      label: 'Coordination' },
  { src: '/images/membres/cisse.jpeg',         label: 'Enseignant' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : '/portail');
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      setAuth(res.data.user, res.data.token);
      toast.success(`Bienvenue, ${res.data.user.name} !`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/portail');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ══ PANNEAU GAUCHE : photo ISI SUPTECH ══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col" style={{ minHeight: '100vh' }}>

        {/* Photo carousel background */}
        <PhotoCarousel />

        {/* Contenu au-dessus des photos */}
        <div className="relative z-10 flex flex-col h-full py-12 px-10 xl:px-14" style={{ minHeight: '100vh' }}>

          {/* TOP — logo + titre */}
          <div className="flex-shrink-0">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
              className="mb-7">
              <div className="w-20 h-20 rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl mb-5"
                style={{ boxShadow: '0 0 40px rgba(255,255,255,0.25)' }}>
                <img src="/isi-logo.png" alt="ISI SUPTECH" className="w-16 h-16 object-contain" />
              </div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-3 py-1.5 rounded-full mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/90 text-xs font-semibold tracking-wide">Plateforme officielle</span>
                </div>
                <h1 className="text-5xl xl:text-6xl font-black text-white leading-none mb-2">ISI<br />
                  <span style={{ color: 'transparent', background: 'linear-gradient(90deg,#93c5fd,#38bdf8)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>SUPTECH</span>
                </h1>
                <p className="text-white/65 text-sm leading-relaxed max-w-xs mt-4">
                  Évaluez vos formations et enseignants de manière <strong className="text-white/85">anonyme</strong> — école d'excellence à Dakar, Sénégal.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* MIDDLE — statistiques visuelles */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3 mb-8">
              {[
                { v: '57',    l: 'Professeurs',  e: '👨‍🏫' },
                { v: '18',    l: 'Classes',       e: '🏫' },
                { v: '100%',  l: 'Anonyme',       e: '🔒' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl mb-1">{s.e}</div>
                  <div className="text-white font-black text-xl">{s.v}</div>
                  <div className="text-white/55 text-xs mt-0.5">{s.l}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Avantages */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="space-y-2.5">
              {[
                { emoji: '⭐', text: 'Évaluations 100% anonymes — exprimez-vous librement' },
                { emoji: '📊', text: 'Rapports PDF personnalisés envoyés aux professeurs' },
                { emoji: '🚀', text: 'Accès rapide via lien unique par classe' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-sm">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-white/75 text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* BOTTOM — équipe + crédit */}
          <div className="flex-shrink-0 mt-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Notre équipe</p>
              <div className="flex items-center gap-2">
                {TEAM.map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/30 shadow-md">
                      <img src={m.src} alt={m.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white/40 text-[9px]">{m.label}</span>
                  </div>
                ))}
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ml-1">
                  <span className="text-white/50 text-xs font-bold">+</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="mt-4">
              <div className="text-white/30 text-[10px]">Développé par</div>
              <div className="text-blue-300 font-black text-sm tracking-widest">MULTI BRAIN TECH</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ PANNEAU DROIT : formulaire ══ */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white relative overflow-hidden min-h-screen px-4">

        {/* Fond subtil */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }} />
          <motion.div animate={{ scale: [1,1.5,1], opacity: [0.7,1,0.7] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)' }} />
          <motion.div animate={{ scale: [1,1.4,1], y: [0,20,0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)' }} />
        </div>

        {/* Logo mobile uniquement */}
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-12 w-auto object-contain" />
            <div>
              <div className="font-black text-slate-900 text-sm leading-tight">ISI / SUPTECH</div>
              <div className="text-blue-600 text-[10px] font-bold">Évaluation des Formations</div>
            </div>
          </Link>
        </div>

        {/* Formulaire */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10">

          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connexion sécurisée
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-3xl font-black text-slate-900 mb-2">
              Bon retour 👋
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm">
              Connectez-vous à votre espace ISI SUPTECH.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">Adresse email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center pointer-events-none">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <input {...register('email', { required: 'Email requis', pattern: { value: /^\S+@\S+$/, message: 'Email invalide' } })}
                  type="email" placeholder="votre@email.com"
                  className={`w-full border-2 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} text-slate-900 placeholder-slate-400 rounded-2xl pl-14 pr-4 py-3.5 text-sm focus:outline-none transition-all duration-200 bg-slate-50 focus:bg-white`} />
              </div>
              <AnimatePresence>
                {errors.email && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">Mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input {...register('password', { required: 'Mot de passe requis' })}
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`w-full border-2 ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} text-slate-900 placeholder-slate-400 rounded-2xl pl-14 pr-12 py-3.5 text-sm focus:outline-none transition-all duration-200 bg-slate-50 focus:bg-white`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1">
                  <AnimatePresence mode="wait">
                    <motion.div key={showPwd ? 'off' : 'on'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
              <AnimatePresence>
                {errors.password && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Forgot */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-right -mt-1">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <button type="submit" disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 rounded-2xl font-black text-base transition-all duration-200 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2.5">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Connexion...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <span>Se connecter</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </form>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-amber-700 text-xs leading-relaxed">
              <strong>Accès sur invitation uniquement.</strong><br />
              Vos identifiants vous ont été envoyés par email par l'administration ISI SUPTECH.
            </p>
          </motion.div>

          {/* Lien retour */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-6 text-center">
            <Link to="/" className="text-slate-400 hover:text-blue-600 text-sm transition-colors font-medium inline-flex items-center gap-1.5">
              ← Retour à l'accueil
            </Link>
          </motion.div>

          {/* Lien rejoindre (mobile) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="mt-3 text-center lg:hidden">
            <Link to="/rejoindre" className="text-blue-600 hover:text-blue-700 text-sm transition-colors font-medium">
              Pas encore inscrit ? Rejoindre une classe →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
