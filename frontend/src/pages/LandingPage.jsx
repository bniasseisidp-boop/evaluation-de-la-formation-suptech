import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Bot, FileText, Lock, Smartphone, TrendingUp,
  ChevronRight, ArrowRight, Star, Users, GraduationCap, Award,
  CheckCircle, MapPin, Zap, Sparkles, ShieldCheck,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import ThemeToggle from '../components/ui/ThemeToggle';

/* ══ MATRIX CANVAS: chiffres/lettres qui tombent VITE + anneaux tournants ══ */
function MatrixCanvas({ opacity = 0.55 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const CHARS = '0123456789ABCDEFabcdef∑∞π√01ISI%#@$GLBT';
    const COL_W = 16;
    const makeCols = () => {
      const n = Math.ceil(canvas.width / COL_W) + 2;
      return Array.from({ length: n }, () => ({
        y: Math.random() * -100,
        speed: 2.5 + Math.random() * 5,
        color: ['#3b82f6','#06b6d4','#818cf8','#2563eb','#0ea5e9','#a78bfa','#38bdf8'][Math.floor(Math.random() * 7)],
        alpha: 0.2 + Math.random() * 0.5,
        size: 10 + Math.floor(Math.random() * 6),
      }));
    };
    let cols = makeCols();
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cols.forEach((col, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.globalAlpha = col.alpha;
        ctx.fillStyle = col.color;
        ctx.font = `bold ${col.size}px monospace`;
        ctx.fillText(char, i * COL_W, col.y);
        col.y += col.speed;
        if (col.y > canvas.height + 30) {
          col.y = -20 - Math.random() * 60;
          col.speed = 2.5 + Math.random() * 5;
        }
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame % 400 === 0) cols = makeCols();
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
}

/* ══ CIRCUIT CANVAS: traces PCB animées ══ */
function CircuitCanvas({ opacity = 0.4, dark = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const C = dark ? '#60a5fa' : '#3b82f6';
    const GRID = 48;

    // Generate fixed circuit paths
    const makePaths = () => {
      const paths = [];
      const rows = Math.ceil(canvas.height / GRID) + 1;
      const cols = Math.ceil(canvas.width / GRID) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.65) continue;
          const x = c * GRID, y = r * GRID;
          const dir = Math.random() > 0.5 ? 'h' : 'v';
          const len = (1 + Math.floor(Math.random() * 3)) * GRID;
          paths.push({ x, y, dir, len, dot: Math.random() > 0.5, progress: Math.random(), speed: 0.003 + Math.random() * 0.006 });
        }
      }
      return paths;
    };
    let paths = makePaths();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paths.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1.3) p.progress = -0.3;

        // Base line
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.dir === 'h' ? p.x + p.len : p.x, p.dir === 'v' ? p.y + p.len : p.y);
        ctx.strokeStyle = dark ? 'rgba(96,165,250,0.12)' : 'rgba(59,130,246,0.10)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Travelling dot of light
        const t = Math.max(0, Math.min(1, p.progress));
        const ex = p.dir === 'h' ? p.x + p.len * t : p.x;
        const ey = p.dir === 'v' ? p.y + p.len * t : p.y;
        const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
        grd.addColorStop(0, dark ? 'rgba(147,197,253,0.9)' : 'rgba(59,130,246,0.8)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Junction dot
        if (p.dot) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = dark ? 'rgba(96,165,250,0.4)' : 'rgba(59,130,246,0.3)';
          ctx.fill();
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [dark]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
}

/* ══ VORTEX: ellipses + carrés + triangles + losanges qui tournent ══ */
function Vortex({ dark = false }) {
  const c = (r, g, b, a) => `rgba(${r},${g},${b},${dark ? a * 1.8 : a})`;
  const SHAPES = [
    // Ellipses (originales)
    { shape: 'ellipse', w: 700, h: 320, dur: 16, top: '50%', left: '50%',  bdr: c(37,99,235,0.18),  dir: 1 },
    { shape: 'ellipse', w: 500, h: 220, dur: 10, top: '28%', left: '68%',  bdr: c(124,58,237,0.15), dir: -1 },
    { shape: 'ellipse', w: 340, h: 155, dur: 7,  top: '78%', left: '28%',  bdr: c(6,182,212,0.15),  dir: 1 },
    // Cercles simples
    { shape: 'circle',  w: 200, h: 200, dur: 5,  top: '15%', left: '15%',  bdr: c(37,99,235,0.15),  dir: -1 },
    { shape: 'circle',  w: 130, h: 130, dur: 3.5,top: '85%', left: '85%',  bdr: c(6,182,212,0.15),  dir: 1 },
    { shape: 'circle',  w: 80,  h: 80,  dur: 2.5,top: '40%', left: '90%',  bdr: c(167,139,250,0.2), dir: -1 },
    // Carrés tournants
    { shape: 'square',  w: 120, h: 120, dur: 8,  top: '65%', left: '12%',  bdr: c(124,58,237,0.18), dir: 1 },
    { shape: 'square',  w: 70,  h: 70,  dur: 5,  top: '20%', left: '78%',  bdr: c(37,99,235,0.15),  dir: -1 },
    { shape: 'square',  w: 160, h: 160, dur: 11, top: '50%', left: '5%',   bdr: c(6,182,212,0.12),  dir: 1 },
    // Losanges (carrés à 45°)
    { shape: 'diamond', w: 100, h: 100, dur: 6,  top: '35%', left: '55%',  bdr: c(245,158,11,0.18), dir: -1 },
    { shape: 'diamond', w: 60,  h: 60,  dur: 4,  top: '72%', left: '72%',  bdr: c(167,139,250,0.2), dir: 1 },
    { shape: 'diamond', w: 140, h: 140, dur: 9,  top: '8%',  left: '45%',  bdr: c(6,182,212,0.14),  dir: -1 },
    // Hexagones CSS (border-radius 50% avec rotation asymétrique)
    { shape: 'hex',     w: 180, h: 104, dur: 13, top: '90%', left: '55%',  bdr: c(37,99,235,0.14),  dir: 1 },
    { shape: 'hex',     w: 100, h: 58,  dur: 7,  top: '55%', left: '40%',  bdr: c(124,58,237,0.12), dir: -1 },
  ];

  const borderRadius = {
    ellipse: '50%',
    circle:  '50%',
    square:  '12px',
    diamond: '8px',
    hex:     '50% / 25%',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes vCW  { from{transform:translate(-50%,-50%) rotate(0deg)}   to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes vCCW { from{transform:translate(-50%,-50%) rotate(0deg)}   to{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes vDia { from{transform:translate(-50%,-50%) rotate(45deg)}  to{transform:translate(-50%,-50%) rotate(405deg)} }
        @keyframes vDiaR{ from{transform:translate(-50%,-50%) rotate(45deg)}  to{transform:translate(-50%,-50%) rotate(-315deg)} }
      `}</style>
      {SHAPES.map((r, i) => {
        const isDiamond = r.shape === 'diamond';
        const anim = isDiamond
          ? (r.dir > 0 ? 'vDia' : 'vDiaR')
          : (r.dir > 0 ? 'vCW' : 'vCCW');
        return (
          <div key={i} className="absolute"
            style={{
              width: r.w, height: r.h,
              top: r.top, left: r.left,
              background: 'transparent',
              border: `1.5px solid ${r.bdr}`,
              borderRadius: borderRadius[r.shape],
              animation: `${anim} ${r.dur}s linear infinite`,
            }} />
        );
      })}
    </div>
  );
}

/* ══ Particules chiffres/symboles flottants ══ */
function FloatingParticles({ dark = false }) {
  const items = ['01','10','ISI','GL','∑π','42','100','∞','AI','#1','BT','∆','≠','√2','07','99','{}','</>','λ','∂','⊕'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {Array.from({ length: 22 }, (_, i) => (
        <motion.span key={i}
          className="absolute font-mono font-black"
          style={{
            fontSize: `${8 + (i % 6) * 4}px`,
            left: `${4 + (i * 4.3) % 90}%`,
            top: `${6 + (i * 6.7) % 82}%`,
            color: dark ? 'rgba(99,179,237,0.3)' : 'rgba(37,99,235,0.13)',
          }}
          animate={{ y: [0, -(45 + (i % 4) * 35)], opacity: [0, dark ? 0.4 : 0.2, 0] }}
          transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: (i * 0.35) % 5, ease: 'linear' }}>
          {items[i % items.length]}
        </motion.span>
      ))}
    </div>
  );
}

/* ══ Click burst ══ */
function useClickBurst() {
  const [bursts, setBursts] = useState([]);
  const fire = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const id = Date.now();
    const C = ['#2563eb','#06b6d4','#7c3aed','#059669','#f59e0b','#ec4899','#f97316'];
    setBursts(p => [...p, { id, x, y, pts: Array.from({ length: 20 }, (_, i) => ({ angle: (i / 20) * 360, color: C[i % C.length], dist: 38 + Math.random() * 30 })) }]);
    setTimeout(() => setBursts(p => p.filter(b => b.id !== id)), 700);
  }, []);
  const Burst = () => (
    <>
      {bursts.map(b => (
        <span key={b.id} className="absolute pointer-events-none z-50" style={{ left: b.x, top: b.y }}>
          <motion.span initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 5, opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/50 block" />
          {b.pts.map((pt, i) => (
            <motion.span key={i} initial={{ x: 0, y: 0, scale: 1.4, opacity: 1 }}
              animate={{ x: Math.cos(pt.angle * Math.PI / 180) * pt.dist, y: Math.sin(pt.angle * Math.PI / 180) * pt.dist, scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full block" style={{ background: pt.color }} />
          ))}
        </span>
      ))}
    </>
  );
  return { fire, Burst };
}

/* ══ Bouton premium ══ */
function Btn({ children, onClick, variant = 'primary', className = '' }) {
  const { fire, Burst } = useClickBurst();
  const V = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60',
    outline: 'border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800',
    white:   'bg-white hover:bg-blue-50 text-blue-700 shadow-xl shadow-black/10',
  };
  return (
    <button onClick={e => { fire(e); onClick?.(); }}
      className={`group relative overflow-hidden flex items-center justify-center gap-2.5 font-black rounded-2xl px-8 py-4 text-base transition-all duration-200 hover:scale-105 active:scale-95 ${V[variant]} ${className}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
      <Burst />
      {children}
    </button>
  );
}

/* ══ Counter animé ══ */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: 'easeOut', onUpdate: n => setV(Math.floor(n)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ══ Icône premium ══ */
function PIcon({ icon: Icon, color, bg, size = 'md' }) {
  const sz = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const isz = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <motion.div whileHover={{ scale: 1.18, rotate: [0,-12,12,0] }} transition={{ duration: 0.45 }}
      className={`relative ${sz} rounded-2xl flex items-center justify-center flex-shrink-0 cursor-default`}
      style={{ background: bg, boxShadow: `0 0 18px ${color}28` }}>
      <Icon className={`${isz}`} style={{ color }} />
    </motion.div>
  );
}

/* ══ DATA ══ */
const FEATURES = [
  { icon: BarChart3,  title: 'Évaluation complète',   desc: 'Évaluez enseignants, services et formations via des questionnaires intelligents.', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { icon: Bot,        title: 'IA SUPTECH',             desc: 'Assistant vocal en français qui vous guide à chaque étape en temps réel.', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { icon: FileText,   title: 'Export PDF pro',          desc: 'Rapports détaillés par classe ou filière, téléchargeables en un clic.', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { icon: TrendingUp, title: 'Dashboard temps réel',   desc: 'Graphiques interactifs et statistiques mis à jour en continu.', color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
  { icon: Lock,       title: 'Sécurité maximale',       desc: 'Accès sur invitation uniquement. Données chiffrées et sessions sécurisées.', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { icon: Smartphone, title: 'Mobile First',            desc: 'Expérience optimisée sur téléphone, tablette et ordinateur.', color: '#db2777', bg: 'rgba(219,39,119,0.08)' },
];

const STATS = [
  { icon: Users,         number: 500, suffix: '+', label: 'Étudiants actifs',       color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  { icon: GraduationCap, number: 50,  suffix: '+', label: 'Professeurs évalués',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { icon: Award,         number: 4,   suffix: '',  label: "Filières d'excellence",  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { icon: Star,          number: 98,  suffix: '%', label: 'Taux de satisfaction',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
];

const TRUST = [
  { icon: ShieldCheck, label: 'Invitation requise', color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   bdr: 'rgba(22,163,74,0.25)' },
  { icon: Lock,        label: 'Données protégées',  color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   bdr: 'rgba(37,99,235,0.25)' },
  { icon: Bot,         label: 'IA Vocale fr-FR',    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  bdr: 'rgba(124,58,237,0.25)' },
  { icon: Smartphone,  label: 'Mobile First',       color: '#0891b2', bg: 'rgba(8,145,178,0.08)',   bdr: 'rgba(8,145,178,0.25)' },
];

const STEPS = [
  { emoji: '📩', title: 'Invitation email',    desc: "Recevez vos identifiants par email depuis l'administration ISI." },
  { emoji: '🔐', title: 'Connexion sécurisée', desc: 'Accédez à votre espace étudiant personnel et sécurisé.' },
  { emoji: '✍️', title: 'Évaluez',             desc: "Répondez aux questionnaires guidés par l'IA SUPTECH vocalement." },
  { emoji: '📊', title: 'Consultez',           desc: 'Retrouvez toutes vos évaluations dans votre espace.' },
];

const WORDS = ['les enseignements', 'les services', 'les formations'];

const MOCK_ROWS = [
  { label: 'Algorithmique',  prof: 'M. DIALLO', score: 87, color: '#22c55e' },
  { label: 'Java & POO',     prof: 'Mme. FALL',  score: 74, color: '#eab308' },
  { label: 'Base de données',prof: 'M. BEDA',   score: 92, color: '#22c55e' },
  { label: 'Réseaux',        prof: 'M. LO',      score: 61, color: '#f97316' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.55, ease: [0.23,1,0.32,1] } }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [typed, setTyped] = useState('');
  const [wIdx, setWIdx]   = useState(0);
  const [del, setDel]     = useState(false);

  useEffect(() => {
    const w = WORDS[wIdx];
    const t = setTimeout(() => {
      if (!del && typed.length < w.length) setTyped(w.slice(0, typed.length + 1));
      else if (!del) { setTimeout(() => setDel(true), 1800); return; }
      else if (del && typed.length > 0) setTyped(typed.slice(0, -1));
      else { setDel(false); setWIdx((wIdx + 1) % WORDS.length); }
    }, del ? 28 : 58);
    return () => clearTimeout(t);
  }, [typed, del, wIdx]);

  const go = () => navigate(isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/portail') : '/login');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">

      {/* ══ NAVBAR ══ */}
      <motion.nav initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/96 dark:bg-slate-900/96 backdrop-blur-lg border-b border-slate-100 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo.png" alt="ISI SUPTECH" className="h-10 w-auto object-contain flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-black text-slate-900 dark:text-white text-sm leading-tight truncate">ISI / SUPTECH</div>
              <div className="text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wide hidden sm:block">Évaluation des Formations</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Btn onClick={go} variant="primary" className="px-4 sm:px-6 py-2.5 text-sm rounded-xl flex-shrink-0">
              {isAuthenticated ? 'Mon espace' : 'Se connecter'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Btn>
          </div>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-white dark:bg-slate-950">
        <MatrixCanvas opacity={0.45} />
        <CircuitCanvas opacity={0.55} dark={false} />
        <Vortex />
        <FloatingParticles />

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ scale: [1,1.35,1], opacity: [0.5,0.9,0.5] }} transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-[-10%] right-[-8%] w-[550px] h-[550px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.11) 0%, transparent 70%)' }} />
          <motion.div animate={{ scale: [1,1.25,1], opacity: [0.4,0.7,0.4] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[-8%] left-[-6%] w-[450px] h-[450px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
          <motion.div animate={{ scale: [1,1.4,1], opacity: [0.3,0.6,0.3] }} transition={{ duration: 11, repeat: Infinity, delay: 4 }}
            className="absolute top-[40%] left-[28%] w-[380px] h-[380px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 py-20">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/15 text-blue-700 dark:text-blue-200 text-xs font-black px-4 py-2.5 rounded-full mb-8 border border-blue-200 dark:border-blue-400/40 shadow-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300" />
            </motion.div>
            Plateforme officielle ISI SUPTECH · Dakar
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-2">Évaluez</h1>
            <div className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-2 min-h-[1.15em]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400">
                {typed || ' '}<span className="text-blue-400 animate-pulse">|</span>
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-8">à ISI SUPTECH</h1>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-slate-500 dark:text-slate-300 text-base sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Plateforme intelligente avec IA intégrée pour mesurer et améliorer la qualité pédagogique.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Btn onClick={go} variant="primary" className="text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-10">
              <Zap className="w-5 h-5" />
              {isAuthenticated ? 'Mon espace' : "Commencer l'évaluation"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Btn>
            <Btn onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="outline" className="text-base sm:text-lg py-4 sm:py-5 px-8">
              Découvrir
            </Btn>
          </motion.div>

          {/* Trust badges — icônes PREMIUM */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {TRUST.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.06 }}
                className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl cursor-default"
                style={{ background: t.bg, border: `1.5px solid ${t.bdr}` }}>
                <motion.div whileHover={{ rotate: [0,-15,15,0] }} transition={{ duration: 0.4 }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.color + '20', boxShadow: `0 0 10px ${t.color}35` }}>
                  <t.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: t.color }} />
                </motion.div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{t.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-1.5">
          <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Défiler</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.3, repeat: Infinity }}
            className="w-5 h-5 border-b-2 border-r-2 border-slate-300 rotate-45" />
        </motion.div>
      </section>

      {/* ══ STATS (fond sombre) ══ */}
      <section id="stats" className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0c1a3a 100%)' }}>
        <MatrixCanvas opacity={0.22} />
        <CircuitCanvas opacity={0.5} dark />
        <Vortex dark />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="text-center group">
                <motion.div whileHover={{ scale: 1.2, rotate: [0,-10,10,0] }} transition={{ duration: 0.45 }}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-default"
                  style={{ background: s.bg, border: `1px solid ${s.color}30`, boxShadow: `0 0 0 0 ${s.color}00` }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 28px ${s.color}50` }} />
                  <s.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: s.color }} />
                </motion.div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <Counter to={s.number} suffix={s.suffix} />
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-medium mt-2">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-24 sm:py-28 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-100 dark:border-blue-700/50 mb-4">Fonctionnalités</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
              Tout ce qu'il vous faut,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">en un seul endroit</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="group relative p-6 sm:p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-default"
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 28px 50px -10px ${f.color}22`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" style={{ background: f.bg }} />
                <div className="relative z-10">
                  <PIcon icon={f.icon} color={f.color} bg={f.bg} />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2 mt-5">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STEPS ══ */}
      <section className="py-24 sm:py-28 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-25 pointer-events-none"><FloatingParticles dark /></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-100 dark:border-blue-700/50 mb-4">Processus</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">En 4 étapes simples</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 280 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-600 transition-colors">
                <motion.div whileHover={{ scale: 1.3, rotate: [0,-15,15,0] }} transition={{ duration: 0.5 }}
                  className="text-4xl sm:text-5xl mb-4 sm:mb-5 inline-block cursor-default">{step.emoji}</motion.div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-black rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-blue-500/30">{i + 1}</div>
                <h3 className="font-black text-slate-900 dark:text-white mb-2 text-sm sm:text-base">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="py-24 sm:py-28 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-100 dark:border-blue-700/50 mb-5">À propos</span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-5 leading-tight">
                ISI / SUPTECH<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Dakar, Sénégal</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-5">
                École d'informatique de référence à Dakar, formant les meilleurs ingénieurs et experts en technologies numériques.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Génie Logiciel','IA & Data','Réseaux','BT Informatique','Formation Continue'].map(t => (
                  <motion.span key={t} whileHover={{ scale: 1.08, y: -3 }}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-100 dark:border-blue-700/50 cursor-default">{t}</motion.span>
                ))}
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                École d'excellence · Dakar, Sénégal
              </div>
            </motion.div>

            {/* Mockup app */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ background: c }} className="w-2.5 h-2.5 rounded-full" />)}
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-lg h-5 flex items-center px-3">
                    <span className="text-slate-400 text-xs font-mono">isi-suptech.sn/portail</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-slate-50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">📊 Mes Évaluations</span>
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">GL L3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{l:'Notées',v:3,c:'#2563eb'},{l:'Restantes',v:2,c:'#f59e0b'},{l:'Moy.',v:'84%',c:'#059669'}].map((x,i)=>(
                      <motion.div key={i} initial={{scale:0.8,opacity:0}} whileInView={{scale:1,opacity:1}} transition={{delay:0.3+i*0.1}} viewport={{once:true}}
                        className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-slate-100">
                        <div className="text-lg font-black" style={{color:x.c}}>{x.v}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{x.l}</div>
                      </motion.div>
                    ))}
                  </div>
                  {MOCK_ROWS.map((row, i) => (
                    <motion.div key={i} initial={{x:20,opacity:0}} whileInView={{x:0,opacity:1}} transition={{delay:0.4+i*0.1}} viewport={{once:true}}
                      className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{row.label}</div>
                        <div className="text-[10px] text-slate-400">{row.prof}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{width:0}} whileInView={{width:`${row.score}%`}} transition={{delay:0.5+i*0.1,duration:0.9}} viewport={{once:true}} className="h-full rounded-full" style={{background:row.color}} />
                        </div>
                        <span className="text-xs font-black w-8" style={{color:row.color}}>{row.score}%</span>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div animate={{y:[0,-4,0]}} transition={{duration:2.5,repeat:Infinity}}
                    className="flex items-center gap-2.5 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
                    <div className="w-7 h-7 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-violet-800">IA SUPTECH</div>
                      <div className="text-[10px] text-violet-500">2 matières à évaluer 👋</div>
                    </div>
                  </motion.div>
                </div>
              </div>
              <motion.div animate={{y:[0,-8,0]}} transition={{duration:3,repeat:Infinity}}
                className="absolute -top-4 -right-3 sm:-top-5 sm:-right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 sm:p-3 flex items-center gap-2 z-20">
                <PIcon icon={CheckCircle} color="#16a34a" bg="rgba(22,163,74,0.1)" size="sm" />
                <div><div className="text-xs font-black text-slate-900">Accès sécurisé</div><div className="text-[10px] text-slate-400">Invitation uniquement</div></div>
              </motion.div>
              <motion.div animate={{y:[0,6,0]}} transition={{duration:3.5,repeat:Infinity,delay:1}}
                className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 sm:p-3 flex items-center gap-2 z-20">
                <PIcon icon={BarChart3} color="#2563eb" bg="rgba(37,99,235,0.1)" size="sm" />
                <div><div className="text-xs font-black text-slate-900">Export PDF</div><div className="text-[10px] text-slate-400">En 1 clic</div></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 sm:py-36 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0c1a3a 100%)' }}>
        <MatrixCanvas opacity={0.28} />
        <CircuitCanvas opacity={0.55} dark />
        <Vortex dark />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{scale:[1,1.3,1],opacity:[0.5,0.9,0.5]}} transition={{duration:7,repeat:Infinity}}
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl -translate-y-1/2"
            style={{background:'radial-gradient(circle, rgba(37,99,235,0.4), transparent)'}} />
          <motion.div animate={{scale:[1,1.2,1],opacity:[0.3,0.5,0.3]}} transition={{duration:9,repeat:Infinity,delay:2}}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl translate-y-1/2"
            style={{background:'radial-gradient(circle, rgba(124,58,237,0.25), transparent)'}} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{once:true}}>
            <motion.div animate={{rotate:[0,5,-5,0],scale:[1,1.04,1]}} transition={{duration:4,repeat:Infinity}}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-sm font-bold px-5 py-2.5 rounded-full mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
              Prêt à commencer ?
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
              Votre avis compte.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Faites-le entendre.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-xl mb-10">Connectez-vous avec vos identifiants ISI SUPTECH.</p>
            <Btn onClick={go} variant="white" className="text-lg sm:text-xl mx-auto px-10 sm:px-12 py-4 sm:py-5">
              {isAuthenticated ? 'Accéder à mon espace' : 'Se connecter maintenant'}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </Btn>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-white dark:bg-slate-950 py-8 border-t border-slate-100 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <img src="/logo.png" alt="ISI" className="h-9 w-auto object-contain" />
            <div>
              <div className="text-slate-900 dark:text-white font-black text-sm">ISI / SUPTECH</div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">© {new Date().getFullYear()} · Dakar, Sénégal</div>
            </div>
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-sm">Plateforme d'évaluation des formations</div>
          <div className="text-center sm:text-right">
            <div className="text-slate-400 dark:text-slate-500 text-xs">Développé par</div>
            <div className="text-blue-600 dark:text-blue-400 font-black text-sm tracking-wide">MULTI BRAIN TECH</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
