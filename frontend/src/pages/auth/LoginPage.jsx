import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, BarChart3, Bot, FileText } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

/* ── Matrix canvas (même composant que LandingPage) ── */
function MatrixCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const CHARS = '0123456789ABCDEF∑∞πISI01GLbt%#';
    const W = 16;
    const mkCols = () => Array.from({ length: Math.ceil(c.width / W) + 2 }, () => ({
      y: Math.random() * -80, speed: 2 + Math.random() * 4.5,
      color: ['#60a5fa','#38bdf8','#a78bfa','#818cf8','#34d399'][Math.floor(Math.random() * 5)],
      alpha: 0.15 + Math.random() * 0.45, size: 10 + Math.floor(Math.random() * 5),
    }));
    let cols = mkCols(), frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      cols.forEach((col, i) => {
        ctx.globalAlpha = col.alpha;
        ctx.fillStyle = col.color;
        ctx.font = `bold ${col.size}px monospace`;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * W, col.y);
        col.y += col.speed;
        if (col.y > c.height + 30) { col.y = -20 - Math.random() * 60; col.speed = 2 + Math.random() * 4.5; }
      });
      ctx.globalAlpha = 1;
      if (++frame % 350 === 0) cols = mkCols();
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />;
}

/* ── Circuit canvas ── */
function CircuitCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const GRID = 44;
    const mkPaths = () => {
      const rows = Math.ceil(c.height / GRID) + 1, cols = Math.ceil(c.width / GRID) + 1;
      const out = [];
      for (let r = 0; r < rows; r++) for (let cl = 0; cl < cols; cl++) {
        if (Math.random() > 0.6) continue;
        const dir = Math.random() > 0.5 ? 'h' : 'v';
        const len = (1 + Math.floor(Math.random() * 3)) * GRID;
        out.push({ x: cl * GRID, y: r * GRID, dir, len, dot: Math.random() > 0.4, progress: Math.random(), speed: 0.003 + Math.random() * 0.007 });
      }
      return out;
    };
    let paths = mkPaths();
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      paths.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1.3) p.progress = -0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.dir === 'h' ? p.x + p.len : p.x, p.dir === 'v' ? p.y + p.len : p.y);
        ctx.strokeStyle = 'rgba(96,165,250,0.13)';
        ctx.lineWidth = 1;
        ctx.stroke();
        const t = Math.max(0, Math.min(1, p.progress));
        const ex = p.dir === 'h' ? p.x + p.len * t : p.x;
        const ey = p.dir === 'v' ? p.y + p.len * t : p.y;
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 7);
        g.addColorStop(0, 'rgba(147,197,253,0.95)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        if (p.dot) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(96,165,250,0.45)'; ctx.fill(); }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}

/* ── Formes tournantes (vortex léger) ── */
function Vortex() {
  const SHAPES = [
    { w: 420, h: 190, dur: 14, top: '50%', left: '50%', bdr: 'rgba(96,165,250,0.18)',  r: '50%',  dir: 1 },
    { w: 280, h: 130, dur: 9,  top: '25%', left: '70%', bdr: 'rgba(167,139,250,0.15)', r: '50%',  dir: -1 },
    { w: 180, h: 180, dur: 6,  top: '75%', left: '25%', bdr: 'rgba(56,189,248,0.15)',  r: '50%',  dir: 1 },
    { w: 100, h: 100, dur: 4,  top: '20%', left: '15%', bdr: 'rgba(96,165,250,0.18)',  r: '12px', dir: -1 },
    { w: 70,  h: 70,  dur: 3,  top: '80%', left: '80%', bdr: 'rgba(167,139,250,0.2)',  r: '12px', dir: 1 },
    { w: 90,  h: 90,  dur: 5,  top: '45%', left: '88%', bdr: 'rgba(52,211,153,0.18)',  r: '8px',  dir: -1 },
    { w: 110, h: 110, dur: 7,  top: '10%', left: '55%', bdr: 'rgba(251,191,36,0.14)',  r: '8px',  dir: 1, init45: true },
    { w: 65,  h: 65,  dur: 4,  top: '65%', left: '60%', bdr: 'rgba(96,165,250,0.15)',  r: '8px',  dir: -1, init45: true },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes lCW  { from{transform:translate(-50%,-50%) rotate(0deg)}   to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes lCCW { from{transform:translate(-50%,-50%) rotate(0deg)}   to{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes lDCW { from{transform:translate(-50%,-50%) rotate(45deg)}  to{transform:translate(-50%,-50%) rotate(405deg)} }
        @keyframes lDCCW{ from{transform:translate(-50%,-50%) rotate(45deg)}  to{transform:translate(-50%,-50%) rotate(-315deg)} }
      `}</style>
      {SHAPES.map((s, i) => {
        const a = s.init45 ? (s.dir > 0 ? 'lDCW' : 'lDCCW') : (s.dir > 0 ? 'lCW' : 'lCCW');
        return (
          <div key={i} className="absolute"
            style={{ width: s.w, height: s.h, top: s.top, left: s.left, border: `1.5px solid ${s.bdr}`, borderRadius: s.r, background: 'transparent', animation: `${a} ${s.dur}s linear infinite` }} />
        );
      })}
    </div>
  );
}

const FEATURES = [
  { icon: BarChart3, text: 'Évaluez enseignants & formations', color: '#60a5fa' },
  { icon: Bot,       text: "Guidé par l'IA SUPTECH vocalement", color: '#a78bfa' },
  { icon: Lock,      text: 'Accès sécurisé sur invitation',    color: '#34d399' },
  { icon: FileText,  text: 'Export PDF en un clic',            color: '#fbbf24' },
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

      {/* ══ PANNEAU GAUCHE : WOW sombre + animations ══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1b3e 45%, #10103a 100%)', minHeight: '100vh' }}>

        <MatrixCanvas />
        <CircuitCanvas />
        <Vortex />

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1,1.3,1], opacity: [0.35,0.65,0.35] }} transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.25), transparent)' }} />
          <motion.div animate={{ scale: [1,1.2,1], opacity: [0.25,0.45,0.25] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/3 left-1/4 w-60 h-60 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent)' }} />
        </div>

        {/* Layout: 3 zones top / center / bottom */}
        <div className="relative z-10 flex flex-col h-full py-12 px-10 xl:px-14" style={{ minHeight: '100vh' }}>

          {/* ZONE TOP — logo + badge + titre */}
          <div className="flex-shrink-0">
            {/* Logo avec anneau tournant */}
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
              className="relative inline-flex items-center justify-center mb-7">
              {/* Anneaux qui tournent */}
              <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-blue-400/40"
                style={{ animation: 'lCW 6s linear infinite' }} />
              <div className="absolute w-36 h-36 rounded-full border border-blue-300/20"
                style={{ animation: 'lCCW 10s linear infinite' }} />
              <div className="absolute w-20 h-20 rounded-full border border-cyan-400/30"
                style={{ animation: 'lCW 4s linear infinite' }} />
              {/* Fond blanc arrondi avec glow */}
              <div className="relative w-16 h-16 rounded-2xl bg-white flex items-center justify-center"
                style={{ boxShadow: '0 0 30px rgba(96,165,250,0.6), 0 0 60px rgba(96,165,250,0.25)' }}>
                <img src="/logo.png" alt="ISI" className="w-12 h-12 object-contain" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 px-4 py-2 rounded-full mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </motion.div>
              <span className="text-blue-300 text-xs font-black tracking-widest uppercase">Plateforme officielle</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <h1 className="text-5xl xl:text-6xl font-black text-white leading-none mb-1">ISI</h1>
              <h1 className="text-5xl xl:text-6xl font-black leading-none mb-5"
                style={{ color: 'transparent', background: 'linear-gradient(90deg,#60a5fa,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                SUPTECH
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Évaluez vos formations, enseignants et services avec notre IA intégrée — école d'excellence à Dakar.
              </p>
            </motion.div>
          </div>

          {/* ZONE MILIEU — features (avec flex-1 pour occuper l'espace) */}
          <div className="flex-1 flex flex-col justify-center py-8">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-5">Ce que vous pouvez faire</motion.p>
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1, ease: [0.23,1,0.32,1] }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="flex items-center gap-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-5 py-3.5 backdrop-blur-sm cursor-default group">
                  <motion.div whileHover={{ rotate: [0,-12,12,0], scale: 1.15 }} transition={{ duration: 0.45 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.color + '1a', boxShadow: `0 0 16px ${f.color}35` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </motion.div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{f.text}</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ background: f.color }} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ZONE BOTTOM — statistiques + credit */}
          <div className="flex-shrink-0">
            {/* Mini stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="grid grid-cols-3 gap-3 mb-8">
              {[
                { v: '500+', l: 'Étudiants', c: '#60a5fa' },
                { v: '50+',  l: 'Profs',     c: '#a78bfa' },
                { v: '98%',  l: 'Satisf.',   c: '#34d399' },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 text-center">
                  <div className="text-xl font-black" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{s.l}</div>
                </div>
              ))}
            </motion.div>
            {/* Credit */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="flex items-center justify-between">
              <div>
                <div className="text-slate-600 text-xs">Développé par</div>
                <div className="text-blue-400 font-black text-sm tracking-widest">MULTI BRAIN TECH</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ PANNEAU DROIT : formulaire ══ */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white relative overflow-hidden min-h-screen px-4">

        {/* ── Fond animé professionnel ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grille de points subtile */}
          <div className="absolute inset-0 opacity-[0.045]"
            style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }} />

          {/* Grand orbe haut-droite */}
          <motion.div animate={{ scale: [1,1.5,1], x: [0,25,0], opacity: [0.7,1,0.7] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)' }} />
          {/* Orbe bas-gauche */}
          <motion.div animate={{ scale: [1,1.4,1], y: [0,20,0], opacity: [0.6,1,0.6] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)' }} />
          {/* Orbe centre */}
          <motion.div animate={{ scale: [1,1.6,1], opacity: [0.25,0.5,0.25] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)' }} />

          {/* Ellipse tournante principale */}
          <div className="absolute w-80 h-36 rounded-full border-2 border-blue-200/35"
            style={{ top: '50%', left: '50%', animation: 'lCW 22s linear infinite' }} />
          {/* Cercle moyen */}
          <div className="absolute w-52 h-52 rounded-full border border-cyan-200/30"
            style={{ top: '15%', right: '5%', animation: 'lCCW 16s linear infinite' }} />
          {/* Petit carré */}
          <div className="absolute w-24 h-24 border-2 border-violet-200/35"
            style={{ bottom: '18%', left: '6%', borderRadius: '14px', animation: 'lDCW 9s linear infinite' }} />
          {/* Losange */}
          <div className="absolute w-16 h-16 border border-blue-300/30"
            style={{ top: '22%', left: '10%', borderRadius: '6px', animation: 'lDCCW 7s linear infinite' }} />
          {/* Tout petit carré coin bas-droit */}
          <div className="absolute w-10 h-10 border border-cyan-300/25"
            style={{ bottom: '30%', right: '8%', borderRadius: '6px', animation: 'lCW 5s linear infinite' }} />

          {/* Ligne décorative gauche */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-blue-300/30 to-transparent" />
          {/* Ligne décorative haut */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />
        </div>

        {/* Logo mobile */}
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ISI" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-black text-slate-900 text-sm leading-tight">ISI / SUPTECH</div>
              <div className="text-blue-600 text-[10px] font-bold">Évaluation des Formations</div>
            </div>
          </Link>
        </div>

        {/* Formulaire */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md">

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

            {/* Forgot password */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="text-right -mt-1">
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

          {/* Info invitation */}
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-6 text-center">
            <Link to="/" className="text-slate-400 hover:text-blue-600 text-sm transition-colors font-medium inline-flex items-center gap-1.5">
              ← Retour à l'accueil
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
