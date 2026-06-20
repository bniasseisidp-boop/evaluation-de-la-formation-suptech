import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles,
  BarChart3, Globe, Zap, UserCheck, GraduationCap,
} from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

/* ════════════════════════════════════════════
   CANVAS VORTEX — particules spiralées
════════════════════════════════════════════ */
function VortexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf, frame = 0;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLS = ['#60a5fa','#38bdf8','#818cf8','#c084fc','#34d399','#f472b6','#a78bfa','#fbbf24'];
    const mkP = (l) => ({
      a: Math.random() * Math.PI * 2,
      r0: 40 + l * 54 + Math.random() * 40,
      rw: 8 + Math.random() * 22,
      ws: 0.012 + Math.random() * 0.03,
      wo: Math.random() * Math.PI * 2,
      spd: (0.006 + Math.random() * 0.024) * (l % 2 === 0 ? 1 : -1),
      sz: 0.9 + Math.random() * (l < 2 ? 3.2 : 2),
      col: COLS[Math.floor(Math.random() * COLS.length)],
      op: 0.32 + Math.random() * 0.52,
      tr: [], tl: Math.floor(8 + Math.random() * 28),
    });
    const ps = [];
    [44, 36, 28, 22].forEach((n, l) => { for (let i = 0; i < n; i++) ps.push(mkP(l)); });

    const draw = () => {
      frame++;
      ctx.fillStyle = 'rgba(2,8,23,0.15)';
      ctx.fillRect(0, 0, c.width, c.height);
      const cx = c.width / 2, cy = c.height / 2;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220 + Math.sin(frame * 0.016) * 50);
      gr.addColorStop(0, 'rgba(59,130,246,0.16)');
      gr.addColorStop(0.5, 'rgba(99,102,241,0.06)');
      gr.addColorStop(1, 'transparent');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, c.width, c.height);

      ps.forEach(p => {
        p.a += p.spd;
        const r = p.r0 + Math.sin(frame * p.ws + p.wo) * p.rw;
        const x = cx + Math.cos(p.a) * r;
        const y = cy + Math.sin(p.a) * r;
        p.tr.push({ x, y });
        if (p.tr.length > p.tl) p.tr.shift();

        for (let i = 1; i < p.tr.length; i++) {
          const t = i / p.tr.length;
          ctx.beginPath();
          ctx.moveTo(p.tr[i - 1].x, p.tr[i - 1].y);
          ctx.lineTo(p.tr[i].x, p.tr[i].y);
          ctx.strokeStyle = p.col;
          ctx.lineWidth = p.sz * t * 0.9;
          ctx.globalAlpha = p.op * t * 0.48;
          ctx.stroke();
        }
        ctx.shadowBlur = 16; ctx.shadowColor = p.col;
        ctx.beginPath(); ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.globalAlpha = p.op * 0.9;
        ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Données ── */
const TEAM = [
  { src: '/images/admin/kara_directeur.jpg', label: 'Direction' },
  { src: '/images/admin/mbene-tall.jpg',     label: 'Académique' },
  { src: '/images/admin/oumoukhairy.jpg',    label: 'Coord.' },
  { src: '/images/membres/cisse.jpeg',       label: 'Prof' },
];

const FEATURES = [
  { icon: Lock,      col: '#60a5fa', bg: 'rgba(37,99,235,0.18)',  text: 'Évaluations 100 % anonymes et sécurisées' },
  { icon: BarChart3, col: '#a78bfa', bg: 'rgba(124,58,237,0.18)', text: 'Rapports PDF personnalisés pour chaque prof' },
  { icon: Zap,       col: '#34d399', bg: 'rgba(5,150,105,0.18)',  text: 'Accès instantané via lien de classe unique' },
  { icon: Globe,     col: '#f472b6', bg: 'rgba(219,39,119,0.15)', text: 'Plateforme officielle ISI SUPTECH — Dakar' },
];

const STATS = [
  { v: '57',   l: 'Professeurs', c: '#60a5fa' },
  { v: '18',   l: 'Classes',     c: '#a78bfa' },
  { v: '100%', l: 'Anonyme',     c: '#34d399' },
];

/* ════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading]  = useState(false);
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
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">

      {/* ══════════════ PANNEAU GAUCHE — VORTEX ══════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(150deg,#020817 0%,#0d1b3e 55%,#10083a 100%)', minHeight: '100vh' }}>

        {/* Canvas vortex */}
        <VortexCanvas />

        {/* Orbes CSS additionnels */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale:[1,1.55,1], opacity:[0.28,0.58,0.28] }}
            transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(37,99,235,0.32),transparent)' }} />
          <motion.div animate={{ scale:[1,1.3,1], opacity:[0.18,0.4,0.18] }}
            transition={{ duration:12, repeat:Infinity, delay:4 }}
            className="absolute bottom-1/4 left-1/5 w-80 h-80 rounded-full"
            style={{ background:'radial-gradient(circle,rgba(124,58,237,0.28),transparent)' }} />
          <motion.div animate={{ scale:[1,1.4,1], opacity:[0.12,0.3,0.12] }}
            transition={{ duration:9, repeat:Infinity, delay:2 }}
            className="absolute top-12 right-8 w-56 h-56 rounded-full"
            style={{ background:'radial-gradient(circle,rgba(6,182,212,0.22),transparent)' }} />
        </div>

        {/* ── Contenu ── */}
        <div className="relative z-10 flex flex-col h-full py-12 px-10 xl:px-14">

          {/* Logo ISI + titre */}
          <div className="flex-shrink-0 mb-6">
            <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.1, type:'spring', stiffness:120 }}
              className="mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white/95 flex items-center justify-center mb-5"
                style={{ boxShadow:'0 0 50px rgba(255,255,255,0.2),0 0 100px rgba(59,130,246,0.35)' }}>
                <img src="/isi-logo.png" alt="ISI SUPTECH" className="w-16 h-16 object-contain" />
              </div>
              <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full mb-4">
                  <motion.span animate={{ rotate:360 }} transition={{ duration:4, repeat:Infinity, ease:'linear' }}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </motion.span>
                  <span className="text-blue-300 text-xs font-black tracking-widest uppercase">Plateforme officielle</span>
                </div>
                <h1 className="text-5xl xl:text-6xl font-black text-white leading-none mb-1">ISI</h1>
                <h1 className="text-5xl xl:text-6xl font-black leading-none mb-4"
                  style={{ color:'transparent', background:'linear-gradient(90deg,#60a5fa,#38bdf8,#a78bfa)', WebkitBackgroundClip:'text', backgroundClip:'text' }}>
                  SUPTECH
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Évaluez vos formations et enseignants avec notre plateforme d'excellence — Dakar, Sénégal.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Features animées */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4">Ce que vous pouvez faire</p>
            <div className="space-y-2.5">
              {FEATURES.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-32 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.45 + i * 0.1, ease:[0.23,1,0.32,1] }}
                  whileHover={{ x:7, scale:1.02 }}
                  className="flex items-center gap-4 rounded-2xl px-5 py-3.5 border border-white/[0.07] cursor-default group"
                  style={{ background:f.bg }}>
                  <motion.div whileHover={{ rotate:[0,-12,12,0], scale:1.18 }} transition={{ duration:0.4 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:`${f.col}22`, boxShadow:`0 0 18px ${f.col}35` }}>
                    <f.icon className="w-5 h-5" style={{ color:f.col }} />
                  </motion.div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{f.text}</span>
                  <motion.div className="ml-auto w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 shrink-0"
                    style={{ background:f.col }} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats + équipe */}
          <div className="flex-shrink-0">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.9 }}
              className="grid grid-cols-3 gap-3 mb-7">
              {STATS.map((s, i) => (
                <motion.div key={i} whileHover={{ scale:1.06 }}
                  className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-3 text-center">
                  <motion.div className="text-xl font-black" style={{ color:s.c }}
                    animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity, delay:i*0.7 }}>
                    {s.v}
                  </motion.div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{s.l}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Photos équipe */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}>
              <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest mb-3">Notre équipe</p>
              <div className="flex items-center gap-2 mb-5">
                {TEAM.map((m, i) => (
                  <motion.div key={i} whileHover={{ y:-6, scale:1.1 }} transition={{ type:'spring', stiffness:300 }}
                    className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white/25 shadow-md">
                      <img src={m.src} alt={m.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white/35 text-[9px]">{m.label}</span>
                  </motion.div>
                ))}
              </div>
              <div className="text-slate-600 text-[10px]">Développé par</div>
              <div className="text-blue-400 font-black text-sm tracking-widest">MULTI BRAIN TECH</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════ PANNEAU DROIT — FORMULAIRE ══════════════ */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center bg-white relative overflow-hidden min-h-screen px-4">

        {/* Background orbes subtils */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage:'radial-gradient(circle,#2563eb 1.2px,transparent 1.2px)', backgroundSize:'28px 28px' }} />
          <motion.div animate={{ scale:[1,1.5,1], opacity:[0.7,1,0.7] }} transition={{ duration:8, repeat:Infinity }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(37,99,235,0.09),transparent)' }} />
          <motion.div animate={{ scale:[1,1.4,1], y:[0,20,0] }} transition={{ duration:11, repeat:Infinity, delay:2 }}
            className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(6,182,212,0.08),transparent)' }} />
          <motion.div animate={{ scale:[1,1.6,1], opacity:[0.2,0.45,0.2] }} transition={{ duration:14, repeat:Infinity, delay:5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{ background:'radial-gradient(circle,rgba(124,58,237,0.06),transparent)' }} />
        </div>

        {/* Logo mobile */}
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-12 w-auto object-contain" />
            <div>
              <div className="font-black text-slate-900 text-sm leading-tight">ISI / SUPTECH</div>
              <div className="text-blue-600 text-[10px] font-bold">Évaluation des Formations</div>
            </div>
          </Link>
        </div>

        {/* Formulaire */}
        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.6, ease:'easeOut' }}
          className="w-full max-w-md relative z-10">

          <div className="mb-8">
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connexion sécurisée
            </motion.div>
            <motion.h2 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="text-3xl font-black text-slate-900 mb-2">Bon retour 👋</motion.h2>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
              className="text-slate-500 text-sm">Connectez-vous à votre espace ISI SUPTECH.</motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">Adresse email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center pointer-events-none">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <input {...register('email',{required:'Email requis',pattern:{value:/^\S+@\S+$/,message:'Email invalide'}})}
                  type="email" placeholder="votre@email.com"
                  className={`w-full border-2 ${errors.email?'border-red-400 focus:border-red-500':'border-slate-200 focus:border-blue-500'} text-slate-900 placeholder-slate-400 rounded-2xl pl-14 pr-4 py-3.5 text-sm focus:outline-none transition-all bg-slate-50 focus:bg-white`} />
              </div>
              <AnimatePresence>
                {errors.email && <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                  className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Mot de passe */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">Mot de passe</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input {...register('password',{required:'Mot de passe requis'})}
                  type={showPwd?'text':'password'} placeholder="••••••••"
                  className={`w-full border-2 ${errors.password?'border-red-400 focus:border-red-500':'border-slate-200 focus:border-blue-500'} text-slate-900 placeholder-slate-400 rounded-2xl pl-14 pr-12 py-3.5 text-sm focus:outline-none transition-all bg-slate-50 focus:bg-white`} />
                <button type="button" onClick={()=>setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1">
                  <AnimatePresence mode="wait">
                    <motion.div key={showPwd?'off':'on'} initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.15}}>
                      {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
              <AnimatePresence>
                {errors.password && <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                  className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Forgot */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} className="text-right -mt-1">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.65}}>
              <motion.button type="submit" disabled={loading}
                whileHover={!loading?{scale:1.02,y:-2}:{}}
                whileTap={!loading?{scale:0.98}:{}}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-black text-base transition-all shadow-xl shadow-blue-500/30 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2.5">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                <AnimatePresence mode="wait">
                  {loading?(
                    <motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/><span>Connexion...</span>
                    </motion.div>
                  ):(
                    <motion.div key="b" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2">
                      <span>Se connecter</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Info invitation */}
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.85}}
            className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500"/>
            </div>
            <p className="text-amber-700 text-xs leading-relaxed">
              <strong>Accès sur invitation uniquement.</strong><br/>
              Vos identifiants vous ont été envoyés par email par l'administration ISI SUPTECH.
            </p>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}} className="mt-6 text-center">
            <Link to="/" className="text-slate-400 hover:text-blue-600 text-sm transition-colors font-medium">
              ← Retour à l'accueil
            </Link>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}} className="mt-3 text-center lg:hidden">
            <Link to="/rejoindre" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Pas encore inscrit ? Rejoindre une classe →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
