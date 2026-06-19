import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ── Variants réutilisables ── */
const fade    = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const springIn = { hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 14 } } };

/* Emoji flottant réutilisable */
function FloatEmoji({ emoji, delay = 0, className = '' }) {
  return (
    <motion.span className={`inline-block ${className}`}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}>
      {emoji}
    </motion.span>
  );
}

/* ── Carousel photos ── */
function Carousel({ images, className = '', interval = 4000 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx].src} alt={images[idx].alt || ''}
          initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.85 }}
          className="w-full h-full object-cover" />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Icône illustrée (SVG simple coloré) ── */
function IlluIcon({ type, size = 48 }) {
  const icons = {
    heart: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#fee2e2" />
        <path d="M24 35s-11-7.5-11-15a7 7 0 0 1 11-5.74A7 7 0 0 1 35 20c0 7.5-11 15-11 15z" fill="#ef4444" />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#dbeafe" />
        <rect x="14" y="22" width="20" height="14" rx="3" fill="#2563eb" />
        <path d="M17 22v-4a7 7 0 1 1 14 0v4" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="29" r="2" fill="white" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#dcfce7" />
        <rect x="13" y="28" width="5" height="8" rx="1.5" fill="#16a34a" />
        <rect x="21" y="22" width="5" height="14" rx="1.5" fill="#22c55e" />
        <rect x="29" y="15" width="5" height="21" rx="1.5" fill="#4ade80" />
        <path d="M13 26l8-6 8 4 6-8" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    zap: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#fef9c3" />
        <path d="M26 12l-10 14h9l-3 10 10-14h-9l3-10z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#e0f2fe" />
        <circle cx="24" cy="24" r="10" fill="#0284c7" />
        <path d="M19 24l3.5 3.5L30 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <circle cx="24" cy="24" r="24" fill="#fef3c7" />
        <path d="M24 13l2.9 8.9H36l-7.5 5.4 2.9 8.9L24 31l-7.4 5.2 2.9-8.9L12 21.9h9.1z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[type] || null;
}

/* ── DATA ── */
const VITRINES = [
  { src: '/images/vitrines/caroursel_isi_suptech_soutenace.jpg', alt: 'Soutenance ISI SUPTECH' },
  { src: '/images/vitrines/etudant_farda.jpeg',                  alt: 'Étudiant ISI SUPTECH' },
  { src: '/images/vitrines/Etudiant_gestion.jpeg',               alt: 'Cours ISI SUPTECH' },
];

const PARTENAIRES = [
  { src: '/images/partenaires/3FPT.png',       alt: '3FPT' },
  { src: '/images/partenaires/aws-academy.png', alt: 'AWS Academy' },
  { src: '/images/partenaires/cames_logo.png',  alt: 'CAMES' },
  { src: '/images/partenaires/cisco.png',       alt: 'Cisco' },
  { src: '/images/partenaires/demdik.jpeg',     alt: 'Demdik' },
  { src: '/images/partenaires/huawei.png',      alt: 'Huawei' },
  { src: '/images/partenaires/logo_anaq.png',   alt: 'ANAQ' },
  { src: '/images/partenaires/onfp.png',        alt: 'ONFP' },
];

const TEAM_ADMIN = [
  { src: '/images/admin/kara_directeur.jpg', nom: 'Directeur Général',  titre: 'Direction',    color: '#3b82f6' },
  { src: '/images/admin/mbene-tall.jpg',     nom: 'Resp. Académique',   titre: 'Académique',   color: '#22c55e' },
  { src: '/images/admin/oumoukhairy.jpg',    nom: 'Coordinatrice',      titre: 'Coordination', color: '#f59e0b' },
  { src: '/images/admin/samba.jpg',          nom: 'Resp. Pédagogique',  titre: 'Pédagogie',    color: '#a855f7' },
];

const TEAM_PROFS = [
  { src: '/images/membres/cisse.jpeg',    nom: 'M. CISSE',   titre: 'Marketing',         color: '#ef4444' },
  { src: '/images/membres/junior.jpeg',   nom: 'M. JUNIOR',  titre: 'Développement Web', color: '#06b6d4' },
  { src: '/images/membres/mr_robert.jpeg',nom: 'M. ROBERT',  titre: 'PHP & SGF',         color: '#8b5cf6' },
];

/* ── Tourbillon orbital ── */
function TeamOrbit() {
  const [selected, setSelected] = useState(null);
  const paused  = !!selected;
  const N       = TEAM_ADMIN.length;
  const NP      = TEAM_PROFS.length;
  const R       = 165;   // rayon anneau admin (interne)
  const RP      = 270;   // rayon anneau profs (externe)
  const SIZE    = 620;
  const SPEED   = 10;    // admin : 10s/tour
  const SPEEDP  = 14;    // profs : 14s/tour sens inverse

  const open  = (m) => setSelected(m);
  const close = ()  => setSelected(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <style>{`
        @keyframes orb-cw   { from{transform:rotate(0deg)}  to{transform:rotate(360deg)}  }
        @keyframes orb-ccw  { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
        @keyframes isi-pulse{ 0%,100%{box-shadow:0 0 0 6px #dbeafe,0 8px 32px rgba(59,130,246,.22)}
                              50%{box-shadow:0 0 0 14px #bfdbfe,0 14px 44px rgba(59,130,246,.38)} }
        .orb-admin  { animation: orb-cw   ${SPEED}s  linear infinite; animation-play-state:var(--op); }
        .orb-profs  { animation: orb-ccw  ${SPEEDP}s linear infinite; animation-play-state:var(--op); }
        .orb-dec1   { animation: orb-ccw  ${SPEED*3}s linear infinite; animation-play-state:var(--op); }
        .orb-dec2   { animation: orb-cw   ${SPEED*2}s linear infinite; animation-play-state:var(--op); }
        .cnt-admin  { animation: orb-ccw  ${SPEED}s  linear infinite; animation-play-state:var(--op); }
        .cnt-profs  { animation: orb-cw   ${SPEEDP}s linear infinite; animation-play-state:var(--op); }
        .isi-pulse  { animation: isi-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* Container */}
      <div style={{ position:'relative', width:SIZE, height:SIZE, '--op': paused ? 'paused' : 'running' }}>

        {/* Anneaux décoratifs */}
        <div className="orb-dec1" style={{ position:'absolute', inset:4,  borderRadius:'50%', border:'2px dashed rgba(59,130,246,0.18)' }} />
        <div className="orb-dec2" style={{ position:'absolute', inset:60, borderRadius:'50%', border:'1.5px solid rgba(99,102,241,0.12)' }} />
        <div className="orb-dec1" style={{ position:'absolute', inset:120,borderRadius:'50%', border:'1px solid rgba(59,130,246,0.09)' }} />

        {/* ── Centre : wrapper fixe (positionnement ≠ animation) ── */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:30 }}>
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="logo"
                initial={{ opacity:0, scale:.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.6 }}
                transition={{ duration:.3 }}
                className="isi-pulse"
                style={{ width:106, height:106, background:'white', borderRadius:'50%',
                         display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src="/isi-logo.png" alt="ISI" style={{ width:80, height:80, objectFit:'contain', padding:4 }} />
              </motion.div>
            ) : (
              <motion.div key={selected.nom}
                initial={{ opacity:0, scale:.5 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.5 }}
                transition={{ type:'spring', stiffness:300, damping:22 }}
                style={{ width:170, textAlign:'center' }}>
                <div style={{ width:104, height:104, borderRadius:'50%', overflow:'hidden', margin:'0 auto 8px',
                              border:`4px solid ${selected.color}`,
                              boxShadow:`0 0 0 4px white, 0 8px 32px ${selected.color}66` }}>
                  <img src={selected.src} alt={selected.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ fontWeight:900, color:'#0f172a', fontSize:13, marginBottom:5 }}>{selected.nom}</div>
                <div style={{ display:'inline-block', backgroundColor:selected.color, color:'white',
                              fontSize:10, fontWeight:800, padding:'3px 12px', borderRadius:20,
                              boxShadow:`0 3px 10px ${selected.color}55`, marginBottom:10 }}>
                  {selected.titre}
                </div>
                <div>
                  <button onClick={close}
                    style={{ background:'#f1f5f9', border:'none', cursor:'pointer', borderRadius:20,
                             fontSize:11, fontWeight:700, color:'#64748b', padding:'5px 14px',
                             boxShadow:'0 2px 8px rgba(0,0,0,0.1)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>
                    ✕ Fermer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Anneau ADMIN (interne, CW) ── */}
        <div className="orb-admin" style={{ position:'absolute', inset:0 }}>
          {TEAM_ADMIN.map((m, i) => {
            const a = (i / N) * 360;
            const isActive = selected?.nom === m.nom;
            return (
              <div key={i} style={{
                position:'absolute', top:'50%', left:'50%',
                transform:`rotate(${a}deg) translate(${R}px) rotate(-${a}deg) translate(-50%,-50%)`,
                zIndex:20,
              }}>
                <div className="cnt-admin" style={{ cursor:'pointer' }} onClick={() => open(m)}>
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <div style={{ position:'absolute', bottom:'100%', left:'50%',
                                  transform:'translateX(-50%) translateY(-5px)',
                                  backgroundColor:m.color, color:'white',
                                  fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:20,
                                  whiteSpace:'nowrap', boxShadow:`0 3px 10px ${m.color}55`, zIndex:40 }}>
                      {m.titre}
                    </div>
                    <div style={{ width:68, height:68, borderRadius:'50%', overflow:'hidden',
                                  border: isActive ? `4px solid ${m.color}` : `3px solid ${m.color}`,
                                  boxShadow: isActive ? `0 0 0 3px white,0 0 20px 6px ${m.color}88` : `0 0 0 3px white,0 4px 16px ${m.color}44`,
                                  transition:'all .25s', transform: isActive ? 'scale(1.14)' : 'scale(1)' }}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1.12)'; }}
                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1)'; }}>
                      <img src={m.src} alt={m.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div style={{ position:'absolute', top:'100%', left:'50%',
                                  transform:'translateX(-50%) translateY(7px)',
                                  background:'white', color:'#1e293b', fontSize:10, fontWeight:700,
                                  padding:'2px 9px', borderRadius:20, whiteSpace:'nowrap',
                                  boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>{m.nom}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Anneau PROFS (externe, CCW) ── */}
        <div className="orb-profs" style={{ position:'absolute', inset:0 }}>
          {TEAM_PROFS.map((m, i) => {
            const a = (i / NP) * 360;
            const isActive = selected?.nom === m.nom;
            return (
              <div key={i} style={{
                position:'absolute', top:'50%', left:'50%',
                transform:`rotate(${a}deg) translate(${RP}px) rotate(-${a}deg) translate(-50%,-50%)`,
                zIndex:20,
              }}>
                <div className="cnt-profs" style={{ cursor:'pointer' }} onClick={() => open(m)}>
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <div style={{ position:'absolute', bottom:'100%', left:'50%',
                                  transform:'translateX(-50%) translateY(-5px)',
                                  backgroundColor:m.color, color:'white',
                                  fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:20,
                                  whiteSpace:'nowrap', boxShadow:`0 3px 10px ${m.color}55`, zIndex:40 }}>
                      {m.titre}
                    </div>
                    <div style={{ width:68, height:68, borderRadius:'50%', overflow:'hidden',
                                  border: isActive ? `4px solid ${m.color}` : `3px solid ${m.color}`,
                                  boxShadow: isActive ? `0 0 0 3px white,0 0 20px 6px ${m.color}88` : `0 0 0 3px white,0 4px 16px ${m.color}44`,
                                  transition:'all .25s', transform: isActive ? 'scale(1.14)' : 'scale(1)' }}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1.12)'; }}
                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1)'; }}>
                      <img src={m.src} alt={m.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div style={{ position:'absolute', top:'100%', left:'50%',
                                  transform:'translateX(-50%) translateY(7px)',
                                  background:'white', color:'#1e293b', fontSize:10, fontWeight:700,
                                  padding:'2px 9px', borderRadius:20, whiteSpace:'nowrap',
                                  boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>{m.nom}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Légende */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>Administration</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"/>Corps professoral</span>
      </div>
      <p className="text-slate-400 text-sm -mt-3">
        {paused ? '▶ Cliquez sur "Fermer" pour reprendre' : 'Cliquez sur un membre pour en savoir plus'}
      </p>
    </div>
  );
}

const STATS = [
  { value: '57',   label: 'Professeurs',     emoji: '👨‍🏫', color: '#3b82f6' },
  { value: '18',   label: 'Classes actives', emoji: '🏫',   color: '#8b5cf6' },
  { value: '5',    label: 'Filières',        emoji: '📚',   color: '#06b6d4' },
  { value: '100%', label: 'Anonyme',         emoji: '🔒',   color: '#22c55e' },
];

const STEPS = [
  { num: '1', emoji: '🔗', title: 'Accède au lien de ta classe',     desc: "L'administration t'envoie un lien unique. Crée ton compte en 30 secondes.", color: '#3b82f6' },
  { num: '2', emoji: '⭐', title: 'Évalue tes professeurs',          desc: '10 questions courtes par matière, anonymes, en moins de 3 minutes.',        color: '#f59e0b' },
  { num: '3', emoji: '📊', title: 'Les profs reçoivent leurs résultats', desc: 'Rapport PDF personnalisé envoyé directement à chaque enseignant.',      color: '#22c55e' },
];

const FILIERES = [
  { code: 'FC',   nom: 'Comptabilité Finance',             color: '#f97316', bg: '#fff7ed', emoji: '💼', desc: 'Maîtrisez la comptabilité, la finance et la gestion d\'entreprise.',    debouches: 'Comptable · Contrôleur financier · Auditeur' },
  { code: 'IAGE', nom: 'Informatique & Gestion',           color: '#3b82f6', bg: '#eff6ff', emoji: '💻', desc: 'Allier les outils informatiques à la gestion d\'entreprise moderne.',   debouches: 'Chef de projet · Analyste · Développeur' },
  { code: 'RI',   nom: 'Réseaux Informatiques',            color: '#06b6d4', bg: '#ecfeff', emoji: '🌐', desc: 'Concevez et administrez des réseaux et infrastructures systèmes.',      debouches: 'Admin réseau · Ingénieur systèmes · Cybersécurité' },
  { code: 'GL',   nom: 'Génie Logiciel',                   color: '#22c55e', bg: '#f0fdf4', emoji: '⚙️', desc: 'Concevez des logiciels robustes avec les meilleures pratiques du code.', debouches: 'Développeur · Architecte logiciel · DevOps' },
  { code: 'BT',   nom: 'Brevet Technicien',                color: '#a855f7', bg: '#faf5ff', emoji: '🔧', desc: 'Formation technique et pratique pour intégrer rapidement le marché.',  debouches: 'Technicien · Support · Maintenance IT' },
];

const AVANTAGES = [
  { icon: 'heart', title: "Tu améliores ta formation",  desc: "Tes retours permettent d'identifier ce qui fonctionne et ce qui doit changer.", bg: '#fee2e2' },
  { icon: 'lock',  title: "C'est 100% anonyme",         desc: "Ton identité n'est jamais révélée. Exprime-toi librement.",                    bg: '#dbeafe' },
  { icon: 'chart', title: "Les profs s'améliorent",     desc: "Chaque professeur reçoit un rapport détaillé pour progresser.",               bg: '#dcfce7' },
  { icon: 'zap',   title: "Rapide et simple",           desc: "10 questions par matière, moins de 5 minutes par prof.",                      bg: '#fef9c3' },
  { icon: 'check', title: "Suivi en temps réel",        desc: "Vois quelles matières tu as déjà évaluées depuis ton tableau de bord.",       bg: '#e0f2fe' },
  { icon: 'star',  title: "Qualité ISI SUPTECH",        desc: "ISI s'engage à agir sur tes retours pour maintenir l'excellence.",            bg: '#fef3c7' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : '/portail', { replace: true });
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.img src="/isi-logo.png" alt="ISI SUPTECH"
              className="h-10 w-auto object-contain"
              whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/rejoindre" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block">
              Je suis étudiant
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                Connexion <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <div className="absolute inset-0">
          <Carousel images={VITRINES} className="w-full h-full" interval={5000} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/75 to-blue-900/60" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 w-full">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
            <motion.div variants={fade}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6 text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Plateforme officielle ISI / SUPTECH — Dakar, Sénégal
            </motion.div>

            <motion.h1 variants={fade} className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white">
              Ton avis améliore<br />
              <motion.span className="text-yellow-300 inline-block"
                animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                la qualité
              </motion.span><br />
              de ta formation
            </motion.h1>

            <motion.p variants={fade} className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
              Évalue tes professeurs de manière <strong className="text-white">anonyme</strong> et aide ISI SUPTECH
              à maintenir un enseignement d'excellence.
            </motion.p>

            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/rejoindre"
                  className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl">
                  <GraduationCap className="w-5 h-5" /> Je suis étudiant
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login"
                  className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all backdrop-blur-sm">
                  Espace Administrateur
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} variants={springIn}
                whileHover={{ y: -6, boxShadow: `0 12px 28px ${s.color}25` }}
                className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-6 cursor-default transition-shadow">
                <motion.div className="text-4xl mb-3"
                  whileHover={{ scale: 1.4, rotate: 10 }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
                  {s.emoji}
                </motion.div>
                <motion.div className="text-3xl font-black mb-1" style={{ color: s.color }}
                  initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200 }}>
                  {s.value}
                </motion.div>
                <div className="text-slate-500 text-sm font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Comment ça marche ?</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">3 étapes simples pour améliorer ta formation.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <motion.div key={i} variants={fade}
                  whileHover={{ y: -8, boxShadow: `0 20px 40px ${s.color}20` }}
                  className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm transition-shadow cursor-default">
                  <div className="flex items-center gap-3 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -8 }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                      style={{ background: s.color }}>
                      {s.num}
                    </motion.div>
                    <motion.span className="text-4xl"
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}>
                      {s.emoji}
                    </motion.span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VIE À ISI SUPTECH ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">La vie à ISI SUPTECH</h2>
              <p className="text-slate-500 text-lg">Formations pratiques, encadrement de qualité, avenir assuré.</p>
            </motion.div>
            <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VITRINES.map((v, i) => (
                <motion.div key={i}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`overflow-hidden rounded-2xl shadow-md transition-shadow ${i === 0 ? 'md:row-span-2' : ''}`}
                  style={{ height: i === 0 ? '420px' : '200px' }}>
                  <img src={v.src} alt={v.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FILIÈRES ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Nos filières</h2>
              <p className="text-slate-500 text-lg">5 filières, des dizaines de métiers, une seule ambition.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FILIERES.map((f, i) => (
                <motion.div key={i} variants={springIn}
                  whileHover={{ y: -8, boxShadow: `0 20px 40px ${f.color}28` }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                  className="bg-white border-2 rounded-2xl overflow-hidden cursor-default group"
                  style={{ borderColor: f.color + '30' }}>
                  {/* Bande colorée en haut */}
                  <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}88)` }} />
                  <div className="p-6">
                    {/* Icône + code */}
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.2 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                        style={{ backgroundColor: f.bg, border: `2px solid ${f.color}33` }}>
                        {f.emoji}
                      </motion.div>
                      <div>
                        <motion.span className="inline-block text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1"
                          style={{ color: f.color, backgroundColor: f.bg }}>
                          {f.code}
                        </motion.span>
                        <div className="font-bold text-slate-900 text-sm leading-tight">{f.nom}</div>
                      </div>
                    </div>
                    {/* Description */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                    {/* Débouchés */}
                    <div className="flex flex-wrap gap-1.5">
                      {f.debouches.split(' · ').map((d, j) => (
                        <motion.span key={j}
                          initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }} transition={{ delay: 0.05 * j }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: f.color + '18', color: f.color }}>
                          {d}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Carte "et bien plus" */}
              <motion.div variants={springIn}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59,130,246,0.15)' }}
                className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white cursor-default flex flex-col justify-between min-h-[220px]">
                <div>
                  <motion.div className="text-5xl mb-4"
                    animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                    🎓
                  </motion.div>
                  <div className="font-black text-xl mb-2">Et bien plus encore</div>
                  <p className="text-blue-100 text-sm">Master, Licence Pro, formations certifiantes et programmes courts.</p>
                </div>
                <motion.div whileHover={{ scale: 1.04 }} className="mt-5">
                  <Link to="/rejoindre"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ÉQUIPE ADMINISTRATIVE (tourbillon orbital) ── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Notre équipe & Corps professoral</h2>
              <p className="text-slate-500 text-lg">Administration au centre · Professeurs en orbite externe</p>
            </motion.div>
            <motion.div variants={fade} className="flex justify-center">
              <TeamOrbit />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PARTENAIRES ── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Nos partenaires</h2>
              <p className="text-slate-500">Des partenaires de renommée mondiale pour garantir un enseignement d'excellence.</p>
            </motion.div>
            <motion.div variants={stagger} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {PARTENAIRES.map((p, i) => (
                <motion.div key={i} variants={fade}
                  whileHover={{ scale: 1.15, filter: 'grayscale(0)', opacity: 1 }}
                  className="h-12 flex items-center justify-center grayscale opacity-55 transition-all duration-300 cursor-pointer">
                  <img src={p.src} alt={p.alt} className="h-full w-auto max-w-[120px] object-contain" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── POURQUOI ÉVALUER ── */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-cyan-600 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">Pourquoi évaluer tes profs ?</h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto">Ton avis a un impact réel sur la qualité de ta formation.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVANTAGES.map((c, i) => (
                <motion.div key={i} variants={springIn}
                  whileHover={{ scale: 1.04, y: -5, backgroundColor: 'rgba(255,255,255,0.22)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm cursor-default">
                  <motion.div className="mb-4 w-fit"
                    whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    animate={{ y: [0, -4, 0] }}
                    style={{ animationDelay: `${i * 0.3}s` }}>
                    {/* Delay via inline style on the animate won't work directly — use transition delay */}
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}>
                      <IlluIcon type={c.icon} size={52} />
                    </motion.div>
                  </motion.div>
                  <h3 className="font-bold text-white text-base mb-2">{c.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={springIn}>
              <motion.img src="/isi-logo.png" alt="ISI SUPTECH"
                className="h-16 w-auto mx-auto mb-6 object-contain"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.div>
            <motion.h2 variants={fade} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Prêt à faire entendre ta voix ?
            </motion.h2>
            <motion.p variants={fade} className="text-slate-500 text-lg mb-8">
              Rejoins les étudiants ISI SUPTECH qui participent chaque année à l'amélioration de la formation.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/rejoindre"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl">
                  <GraduationCap className="w-5 h-5" /> S'inscrire maintenant
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login"
                  className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 font-semibold px-8 py-4 rounded-2xl transition-all">
                  Déjà inscrit ? Connexion
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-10 w-auto object-contain brightness-0 invert opacity-80" />
              <div>
                <div className="text-white font-bold text-sm">ISI / SUPTECH</div>
                <div className="text-xs">Sicap Liberté 3 N°1977 — Dakar, Sénégal</div>
              </div>
            </div>
            <div className="text-xs text-center space-y-1">
              <div>📧 suptech@suptech.info &nbsp;|&nbsp; 📞 +221 33 825 62 10</div>
              <div>Développé par <strong className="text-blue-400">MULTI BRAIN TECH</strong></div>
            </div>
            <div className="flex gap-5 text-xs">
              <Link to="/login"     className="hover:text-white transition-colors">Connexion</Link>
              <Link to="/rejoindre" className="hover:text-white transition-colors">S'inscrire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
