import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { GraduationCap, ArrowRight, ChevronLeft, ChevronRight,
         Shield, BarChart3, Zap, CheckCircle, Star, Heart } from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ════════════════════════════════════════════
   VARIANTS
════════════════════════════════════════════ */
const fade     = { hidden: { opacity:0, y:28 }, show: { opacity:1, y:0 } };
const fade3d   = { hidden: { opacity:0, y:40, rotateX:20, scale:.94 }, show: { opacity:1, y:0, rotateX:0, scale:1 } };
const stagger  = { hidden:{}, show:{ transition:{ staggerChildren:.12 } } };
const springIn = { hidden:{ opacity:0, scale:.72 }, show:{ opacity:1, scale:1, transition:{ type:'spring', stiffness:220, damping:14 } } };

/* ════════════════════════════════════════════
   CANVAS VORTEX
════════════════════════════════════════════ */
function VortexCanvas({ opacity = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let raf, frame = 0;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLS = ['#60a5fa','#38bdf8','#818cf8','#c084fc','#34d399','#f472b6','#fbbf24','#a78bfa'];
    const mkP = (l) => ({
      a: Math.random() * Math.PI * 2,
      r0: 40 + l * 60 + Math.random() * 50,
      rw: 8 + Math.random() * 22,
      ws: 0.012 + Math.random() * 0.028,
      wo: Math.random() * Math.PI * 2,
      spd: (0.005 + Math.random() * 0.02) * (l % 2 === 0 ? 1 : -1),
      sz: 0.8 + Math.random() * (l < 2 ? 3.4 : 2),
      col: COLS[Math.floor(Math.random() * COLS.length)],
      op: 0.25 + Math.random() * 0.5,
      tr: [], tl: Math.floor(7 + Math.random() * 26),
    });
    const ps = [];
    [48, 38, 30, 22].forEach((n, l) => { for (let i = 0; i < n; i++) ps.push(mkP(l)); });

    const draw = () => {
      frame++;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, c.width, c.height);
      const cx = c.width / 2, cy = c.height / 2;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 240 + Math.sin(frame * .015) * 55);
      gr.addColorStop(0, 'rgba(37,99,235,0.18)');
      gr.addColorStop(.5, 'rgba(99,102,241,0.07)');
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
          ctx.lineWidth = p.sz * t * .88;
          ctx.globalAlpha = p.op * t * .42;
          ctx.stroke();
        }
        ctx.shadowBlur = 16; ctx.shadowColor = p.col;
        ctx.beginPath(); ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.globalAlpha = p.op * .9;
        ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} />;
}

/* ════════════════════════════════════════════
   CARD 3D — tilt sur survol + reveal au scroll
════════════════════════════════════════════ */
function Card3D({ children, className = '', style = {} }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 14}deg) scale(1.04) translateZ(10px)`;
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)`;
  };
  return (
    <div ref={ref} className={className} style={{ transition:'transform .35s cubic-bezier(.23,1,.32,1)', ...style }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   CAROUSEL PHOTOS
════════════════════════════════════════════ */
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
          initial={{ opacity:0, scale:1.07 }} animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:.95 }} transition={{ duration:.9 }}
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

/* ════════════════════════════════════════════
   ICÔNES ILLUSTRÉES PRO (SVG + Lucide)
════════════════════════════════════════════ */
const AVANTAGE_ICONS = [
  { Icon: Heart,       col:'#ef4444', bg:'#fee2e2' },
  { Icon: Shield,      col:'#2563eb', bg:'#dbeafe' },
  { Icon: BarChart3,   col:'#16a34a', bg:'#dcfce7' },
  { Icon: Zap,         col:'#ca8a04', bg:'#fef9c3' },
  { Icon: CheckCircle, col:'#0284c7', bg:'#e0f2fe' },
  { Icon: Star,        col:'#d97706', bg:'#fef3c7' },
];

/* ════════════════════════════════════════════
   DATA
════════════════════════════════════════════ */
const VITRINES = [
  { src:'/images/vitrines/caroursel_isi_suptech_soutenace.jpg', alt:'Soutenance ISI SUPTECH' },
  { src:'/images/vitrines/etudant_farda.jpeg',                  alt:'Étudiant ISI SUPTECH' },
  { src:'/images/vitrines/Etudiant_gestion.jpeg',               alt:'Cours ISI SUPTECH' },
];

const PARTENAIRES = [
  { src:'/images/partenaires/3FPT.png',       alt:'3FPT' },
  { src:'/images/partenaires/aws-academy.png', alt:'AWS Academy' },
  { src:'/images/partenaires/cames_logo.png',  alt:'CAMES' },
  { src:'/images/partenaires/cisco.png',       alt:'Cisco' },
  { src:'/images/partenaires/demdik.jpeg',     alt:'Demdik' },
  { src:'/images/partenaires/huawei.png',      alt:'Huawei' },
  { src:'/images/partenaires/logo_anaq.png',   alt:'ANAQ' },
  { src:'/images/partenaires/onfp.png',        alt:'ONFP' },
];

const TEAM_ADMIN = [
  { src:'/images/admin/kara_directeur.jpg', nom:'Directeur Général',  titre:'Direction',    color:'#3b82f6' },
  { src:'/images/admin/mbene-tall.jpg',     nom:'Resp. Académique',   titre:'Académique',   color:'#22c55e' },
  { src:'/images/admin/oumoukhairy.jpg',    nom:'Coordinatrice',      titre:'Coordination', color:'#f59e0b' },
  { src:'/images/admin/samba.jpg',          nom:'Resp. Pédagogique',  titre:'Pédagogie',    color:'#a855f7' },
];

const TEAM_PROFS = [
  { src:'/images/membres/cisse.jpeg',     nom:'M. CISSE',   titre:'Marketing',         color:'#ef4444' },
  { src:'/images/membres/junior.jpeg',    nom:'M. JUNIOR',  titre:'Développement Web', color:'#06b6d4' },
  { src:'/images/membres/mr_robert.jpeg', nom:'M. ROBERT',  titre:'PHP & SGF',         color:'#8b5cf6' },
];

const STATS = [
  { value:'57',   label:'Professeurs',     color:'#3b82f6', icon:'👨‍🏫' },
  { value:'18',   label:'Classes actives', color:'#8b5cf6', icon:'🏫' },
  { value:'5',    label:'Filières',        color:'#06b6d4', icon:'📚' },
  { value:'100%', label:'Anonyme',         color:'#22c55e', icon:'🔒' },
];

const STEPS = [
  { num:'1', icon:'🔗', title:'Accède au lien de ta classe',        desc:"L'administration t'envoie un lien unique. Crée ton compte en 30 secondes.", color:'#3b82f6' },
  { num:'2', icon:'⭐', title:'Évalue tes professeurs',             desc:'10 questions courtes par matière, anonymes, en moins de 3 minutes.',        color:'#f59e0b' },
  { num:'3', icon:'📊', title:'Les profs reçoivent leurs résultats',desc:'Rapport PDF personnalisé envoyé directement à chaque enseignant.',           color:'#22c55e' },
];

const FILIERES = [
  { code:'FC',   nom:'Comptabilité Finance',   color:'#f97316', bg:'#fff7ed', emoji:'💼', desc:'Maîtrisez la comptabilité, la finance et la gestion d\'entreprise.',    debouches:'Comptable · Contrôleur financier · Auditeur' },
  { code:'IAGE', nom:'Informatique & Gestion', color:'#3b82f6', bg:'#eff6ff', emoji:'💻', desc:'Allier les outils informatiques à la gestion d\'entreprise moderne.',   debouches:'Chef de projet · Analyste · Développeur' },
  { code:'RI',   nom:'Réseaux Informatiques',  color:'#06b6d4', bg:'#ecfeff', emoji:'🌐', desc:'Concevez et administrez des réseaux et infrastructures systèmes.',      debouches:'Admin réseau · Ingénieur systèmes · Cybersécurité' },
  { code:'GL',   nom:'Génie Logiciel',         color:'#22c55e', bg:'#f0fdf4', emoji:'⚙️', desc:'Concevez des logiciels robustes avec les meilleures pratiques du code.', debouches:'Développeur · Architecte logiciel · DevOps' },
  { code:'BT',   nom:'Brevet Technicien',      color:'#a855f7', bg:'#faf5ff', emoji:'🔧', desc:'Formation technique et pratique pour intégrer rapidement le marché.',  debouches:'Technicien · Support · Maintenance IT' },
];

const AVANTAGES = [
  { title:"Tu améliores ta formation",   desc:"Tes retours permettent d'identifier ce qui fonctionne et ce qui doit changer." },
  { title:"C'est 100% anonyme",          desc:"Ton identité n'est jamais révélée. Exprime-toi librement et sans retenue." },
  { title:"Les profs s'améliorent",      desc:"Chaque professeur reçoit un rapport détaillé pour progresser chaque année." },
  { title:"Rapide et simple",            desc:"10 questions par matière, moins de 5 minutes par prof. Aucune complexité." },
  { title:"Suivi en temps réel",         desc:"Vois quelles matières tu as déjà évaluées depuis ton tableau de bord." },
  { title:"Qualité ISI SUPTECH",         desc:"ISI s'engage à agir sur tes retours pour maintenir l'excellence permanente." },
];

/* ════════════════════════════════════════════
   TEAM ORBIT
════════════════════════════════════════════ */
function TeamOrbit() {
  const [selected, setSelected] = useState(null);
  const paused  = !!selected;
  const N = TEAM_ADMIN.length, NP = TEAM_PROFS.length;
  const R = 165, RP = 270, SIZE = 620, SPEED = 10, SPEEDP = 14;
  const open  = (m) => setSelected(m);
  const close = ()  => setSelected(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <style>{`
        @keyframes orb-cw  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
        @keyframes orb-ccw { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes isi-pulse{0%,100%{box-shadow:0 0 0 6px #dbeafe,0 8px 32px rgba(59,130,246,.22)} 50%{box-shadow:0 0 0 14px #bfdbfe,0 14px 44px rgba(59,130,246,.38)}}
        .orb-admin{animation:orb-cw  ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .orb-profs{animation:orb-ccw ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .orb-dec1 {animation:orb-ccw ${SPEED*3}s linear infinite;animation-play-state:var(--op);}
        .orb-dec2 {animation:orb-cw  ${SPEED*2}s linear infinite;animation-play-state:var(--op);}
        .cnt-admin{animation:orb-ccw ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .cnt-profs{animation:orb-cw  ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .isi-pulse{animation:isi-pulse 3s ease-in-out infinite;}
      `}</style>
      <div style={{ position:'relative', width:SIZE, height:SIZE, '--op':paused?'paused':'running' }}>
        {/* Anneaux déco */}
        <div className="orb-dec1" style={{ position:'absolute', inset:4,   borderRadius:'50%', border:'2px dashed rgba(59,130,246,.18)' }}/>
        <div className="orb-dec2" style={{ position:'absolute', inset:60,  borderRadius:'50%', border:'1.5px solid rgba(99,102,241,.12)' }}/>
        <div className="orb-dec1" style={{ position:'absolute', inset:120, borderRadius:'50%', border:'1px solid rgba(59,130,246,.09)' }}/>
        {/* Centre */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:30 }}>
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="logo" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.6}} transition={{duration:.3}}
                className="isi-pulse" style={{ width:106, height:106, background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src="/isi-logo.png" alt="ISI" style={{ width:80, height:80, objectFit:'contain', padding:4 }}/>
              </motion.div>
            ):(
              <motion.div key={selected.nom} initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.5}}
                transition={{type:'spring',stiffness:300,damping:22}} style={{ width:170, textAlign:'center' }}>
                <div style={{ width:104, height:104, borderRadius:'50%', overflow:'hidden', margin:'0 auto 8px',
                              border:`4px solid ${selected.color}`, boxShadow:`0 0 0 4px white,0 8px 32px ${selected.color}66` }}>
                  <img src={selected.src} alt={selected.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
                <div style={{ fontWeight:900, color:'#0f172a', fontSize:13, marginBottom:5 }}>{selected.nom}</div>
                <div style={{ display:'inline-block', backgroundColor:selected.color, color:'white', fontSize:10, fontWeight:800,
                              padding:'3px 12px', borderRadius:20, boxShadow:`0 3px 10px ${selected.color}55`, marginBottom:10 }}>
                  {selected.titre}
                </div>
                <div>
                  <button onClick={close} style={{ background:'#f1f5f9', border:'none', cursor:'pointer', borderRadius:20,
                    fontSize:11, fontWeight:700, color:'#64748b', padding:'5px 14px', boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>✕ Fermer</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Anneau ADMIN */}
        <div className="orb-admin" style={{ position:'absolute', inset:0 }}>
          {TEAM_ADMIN.map((m, i) => {
            const a = (i / N) * 360;
            const isActive = selected?.nom === m.nom;
            return (
              <div key={i} style={{ position:'absolute', top:'50%', left:'50%',
                transform:`rotate(${a}deg) translate(${R}px) rotate(-${a}deg) translate(-50%,-50%)`, zIndex:20 }}>
                <div className="cnt-admin" style={{ cursor:'pointer' }} onClick={() => open(m)}>
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <div style={{ position:'absolute', bottom:'100%', left:'50%',
                      transform:'translateX(-50%) translateY(-5px)', backgroundColor:m.color, color:'white',
                      fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:20,
                      whiteSpace:'nowrap', boxShadow:`0 3px 10px ${m.color}55`, zIndex:40 }}>{m.titre}</div>
                    <div style={{ width:68, height:68, borderRadius:'50%', overflow:'hidden',
                      border:isActive?`4px solid ${m.color}`:`3px solid ${m.color}`,
                      boxShadow:isActive?`0 0 0 3px white,0 0 20px 6px ${m.color}88`:`0 0 0 3px white,0 4px 16px ${m.color}44`,
                      transition:'all .25s', transform:isActive?'scale(1.14)':'scale(1)' }}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1.12)'; }}
                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1)'; }}>
                      <img src={m.src} alt={m.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    </div>
                    <div style={{ position:'absolute', top:'100%', left:'50%',
                      transform:'translateX(-50%) translateY(7px)', background:'white', color:'#1e293b',
                      fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20,
                      whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(0,0,0,.12)' }}>{m.nom}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Anneau PROFS */}
        <div className="orb-profs" style={{ position:'absolute', inset:0 }}>
          {TEAM_PROFS.map((m, i) => {
            const a = (i / NP) * 360;
            const isActive = selected?.nom === m.nom;
            return (
              <div key={i} style={{ position:'absolute', top:'50%', left:'50%',
                transform:`rotate(${a}deg) translate(${RP}px) rotate(-${a}deg) translate(-50%,-50%)`, zIndex:20 }}>
                <div className="cnt-profs" style={{ cursor:'pointer' }} onClick={() => open(m)}>
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <div style={{ position:'absolute', bottom:'100%', left:'50%',
                      transform:'translateX(-50%) translateY(-5px)', backgroundColor:m.color, color:'white',
                      fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:20,
                      whiteSpace:'nowrap', boxShadow:`0 3px 10px ${m.color}55`, zIndex:40 }}>{m.titre}</div>
                    <div style={{ width:68, height:68, borderRadius:'50%', overflow:'hidden',
                      border:isActive?`4px solid ${m.color}`:`3px solid ${m.color}`,
                      boxShadow:isActive?`0 0 0 3px white,0 0 20px 6px ${m.color}88`:`0 0 0 3px white,0 4px 16px ${m.color}44`,
                      transition:'all .25s', transform:isActive?'scale(1.14)':'scale(1)' }}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1.12)'; }}
                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.transform='scale(1)'; }}>
                      <img src={m.src} alt={m.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    </div>
                    <div style={{ position:'absolute', top:'100%', left:'50%',
                      transform:'translateX(-50%) translateY(7px)', background:'white', color:'#1e293b',
                      fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20,
                      whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(0,0,0,.12)' }}>{m.nom}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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

/* ════════════════════════════════════════════
   SECTION HERO — parallax scroll
════════════════════════════════════════════ */
function HeroSection() {
  const ref    = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] });
  const titleY  = useSpring(useTransform(scrollYProgress, [0,1], [0,-110]),  { stiffness:80, damping:24 });
  const badgeY  = useSpring(useTransform(scrollYProgress, [0,1], [0,-60]),   { stiffness:80, damping:24 });
  const bgScale = useSpring(useTransform(scrollYProgress, [0,1], [1, 1.12]), { stiffness:40, damping:20 });
  const vortexO = useTransform(scrollYProgress, [0, .5], [.42, .08]);
  const navigate = useNavigate();

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[88vh] flex items-center">
      {/* Photo carousel — parallax scale */}
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <Carousel images={VITRINES} className="w-full h-full" interval={5000} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/92 via-blue-800/78 to-blue-900/65" />
      </motion.div>

      {/* Vortex canvas — s'estompe au scroll */}
      <motion.div className="absolute inset-0" style={{ opacity: vortexO }}>
        <VortexCanvas opacity={1} />
      </motion.div>

      {/* Orbes flottantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y:[0,-30,0], scale:[1,1.15,1] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -top-20 -right-20 w-[450px] h-[450px] rounded-full opacity-30"
          style={{ background:'radial-gradient(circle,rgba(6,182,212,0.5),transparent)' }}/>
        <motion.div animate={{ y:[0,25,0], scale:[1,1.2,1] }} transition={{ duration:11, repeat:Infinity, delay:3 }}
          className="absolute bottom-0 -left-16 w-[380px] h-[380px] rounded-full opacity-25"
          style={{ background:'radial-gradient(circle,rgba(168,85,247,0.5),transparent)' }}/>
        <motion.div animate={{ x:[0,20,0], scale:[1,1.1,1] }} transition={{ duration:7, repeat:Infinity, delay:1.5 }}
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-20"
          style={{ background:'radial-gradient(circle,rgba(250,204,21,0.6),transparent)' }}/>
      </div>

      {/* Contenu — parallax Y */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 w-full">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
          <motion.div style={{ y: badgeY }}>
            <motion.div variants={fade}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6 text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              Plateforme officielle ISI / SUPTECH — Dakar, Sénégal
            </motion.div>
          </motion.div>

          <motion.div style={{ y: titleY }}>
            <motion.h1 variants={fade} className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white">
              Ton avis améliore<br/>
              <motion.span className="text-yellow-300 inline-block"
                animate={{ scale:[1,1.04,1] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}>
                la qualité
              </motion.span><br/>
              de ta formation
            </motion.h1>
            <motion.p variants={fade} className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
              Évalue tes professeurs de manière <strong className="text-white">anonyme</strong> et aide ISI SUPTECH
              à maintenir un enseignement d'excellence.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:.97 }}>
                <Link to="/rejoindre"
                  className="group flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-2xl shadow-blue-900/40 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
                  <GraduationCap className="w-5 h-5"/> Je suis étudiant
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   LANDING PAGE PRINCIPALE
════════════════════════════════════════════ */
export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : '/portail', { replace:true });
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ perspective:'1px', perspectiveOrigin:'top center' }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.img src="/isi-logo.png" alt="ISI SUPTECH"
              className="h-10 w-auto object-contain"
              whileHover={{ scale:1.05 }} transition={{ type:'spring', stiffness:300 }}/>
          </Link>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:.97 }}>
              <Link to="/rejoindre"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                S'inscrire <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── HERO — scroll parallax ── */}
      <HeroSection />

      {/* ── STATS — cartes 3D scroll ── */}
      <section className="py-14 bg-white relative overflow-hidden">
        {/* Gradient déco */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(219,234,254,.5),transparent)' }}/>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, margin:'-80px' }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fade3d} transition={{ delay:i*.1, type:'spring', stiffness:180, damping:18 }}
                style={{ perspective:800 }}>
                <Card3D className="text-center bg-white border border-slate-100 rounded-2xl p-6 shadow-sm cursor-default h-full"
                  style={{ boxShadow:`0 4px 24px ${s.color}12` }}>
                  <motion.div className="text-4xl mb-3"
                    animate={{ y:[0,-6,0] }} transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:i*.4 }}>
                    {s.icon}
                  </motion.div>
                  <motion.div className="text-3xl font-black mb-1" style={{ color:s.color }}
                    initial={{ opacity:0, scale:.5 }} whileInView={{ opacity:1, scale:1 }}
                    viewport={{ once:true }} transition={{ delay:.2+i*.1, type:'spring', stiffness:200 }}>
                    {s.value}
                  </motion.div>
                  <div className="text-slate-500 text-sm font-medium">{s.label}</div>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE — 3D scroll reveal ── */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ rotate:360 }} transition={{ duration:40, repeat:Infinity, ease:'linear' }}
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border-2 border-blue-100 opacity-60"/>
          <motion.div animate={{ rotate:-360 }} transition={{ duration:55, repeat:Infinity, ease:'linear' }}
            className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full border border-purple-100 opacity-50"/>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, margin:'-60px' }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Comment ça marche ?</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">3 étapes simples pour améliorer ta formation.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <motion.div key={i} variants={fade3d} transition={{ delay:i*.15, type:'spring', stiffness:160, damping:20 }}
                  style={{ perspective:900 }}>
                  <Card3D className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm cursor-default h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                        style={{ background:s.color }}>
                        {s.num}
                      </div>
                      <motion.span className="text-4xl"
                        animate={{ y:[0,-7,0] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut', delay:i*.6 }}>
                        {s.icon}
                      </motion.span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </Card3D>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VIE ISI SUPTECH ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">La vie à ISI SUPTECH</h2>
              <p className="text-slate-500 text-lg">Formations pratiques, encadrement de qualité, avenir assuré.</p>
            </motion.div>
            <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VITRINES.map((v, i) => (
                <motion.div key={i} style={{ perspective:1000 }}>
                  <Card3D
                    className={`overflow-hidden rounded-2xl shadow-md cursor-pointer ${i === 0 ? 'md:row-span-2' : ''}`}
                    style={{ height: i === 0 ? '420px' : '200px' }}>
                    <img src={v.src} alt={v.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                  </Card3D>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FILIÈRES — 3D cards reveal ── */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(219,234,254,.4),transparent)' }}/>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, margin:'-60px' }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Nos filières</h2>
              <p className="text-slate-500 text-lg">5 filières, des dizaines de métiers, une seule ambition.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FILIERES.map((f, i) => (
                <motion.div key={i} variants={fade3d} transition={{ delay:i*.1, type:'spring', stiffness:160, damping:20 }}
                  style={{ perspective:1000 }}>
                  <Card3D className="bg-white border-2 rounded-2xl overflow-hidden cursor-default h-full"
                    style={{ borderColor:f.color+'30' }}>
                    <div className="h-2 w-full" style={{ background:`linear-gradient(90deg,${f.color},${f.color}88)` }}/>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div animate={{ y:[0,-5,0] }} transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:i*.4 }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                          style={{ backgroundColor:f.bg, border:`2px solid ${f.color}33` }}>
                          {f.emoji}
                        </motion.div>
                        <div>
                          <span className="inline-block text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1"
                            style={{ color:f.color, backgroundColor:f.bg }}>{f.code}</span>
                          <div className="font-bold text-slate-900 text-sm leading-tight">{f.nom}</div>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.debouches.split(' · ').map((d, j) => (
                          <span key={j} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor:f.color+'18', color:f.color }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              ))}
              {/* Carte "et bien plus" */}
              <motion.div variants={fade3d} transition={{ delay:.5, type:'spring', stiffness:160, damping:20 }} style={{ perspective:1000 }}>
                <Card3D className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white cursor-default flex flex-col justify-between min-h-[220px]">
                  <div>
                    <motion.div className="text-5xl mb-4"
                      animate={{ y:[0,-6,0], rotate:[0,5,-5,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}>
                      🎓
                    </motion.div>
                    <div className="font-black text-xl mb-2">Et bien plus encore</div>
                    <p className="text-blue-100 text-sm">Master, Licence Pro, formations certifiantes et programmes courts.</p>
                  </div>
                  <motion.div whileHover={{ scale:1.04 }} className="mt-5">
                    <Link to="/rejoindre"
                      className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      En savoir plus <ArrowRight className="w-4 h-4"/>
                    </Link>
                  </motion.div>
                </Card3D>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ÉQUIPE ORBITE ── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
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
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Nos partenaires</h2>
              <p className="text-slate-500">Des partenaires de renommée mondiale pour garantir un enseignement d'excellence.</p>
            </motion.div>
            <motion.div variants={stagger} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {PARTENAIRES.map((p, i) => (
                <motion.div key={i} variants={fade}
                  whileHover={{ scale:1.18, filter:'grayscale(0)', opacity:1, y:-4 }}
                  className="h-12 flex items-center justify-center grayscale opacity-55 transition-all duration-300 cursor-pointer">
                  <img src={p.src} alt={p.alt} className="h-full w-auto max-w-[120px] object-contain"/>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── POURQUOI ÉVALUER — vortex BG + cartes 3D ── */}
      <section className="py-20 relative overflow-hidden text-white">
        {/* Fond vortex sombre */}
        <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 40%,#0e7490 100%)' }}/>
        <VortexCanvas opacity={0.55} />
        {/* Orbes additionnelles */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale:[1,1.4,1], opacity:[.3,.6,.3] }} transition={{ duration:10, repeat:Infinity }}
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(6,182,212,0.4),transparent)' }}/>
          <motion.div animate={{ scale:[1,1.3,1], opacity:[.2,.45,.2] }} transition={{ duration:13, repeat:Infinity, delay:3 }}
            className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(168,85,247,0.35),transparent)' }}/>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, margin:'-60px' }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">Pourquoi évaluer tes profs ?</h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto">Ton avis a un impact réel sur la qualité de ta formation.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVANTAGES.map((c, i) => {
                const { Icon, col, bg } = AVANTAGE_ICONS[i];
                return (
                  <motion.div key={i} variants={fade3d} transition={{ delay:i*.1, type:'spring', stiffness:160, damping:20 }}
                    style={{ perspective:900 }}>
                    <Card3D className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm cursor-default h-full">
                      <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shrink-0"
                        style={{ background:bg+'44', border:`1.5px solid ${col}55`, boxShadow:`0 0 20px ${col}30` }}
                        whileHover={{ rotate:[0,-10,10,-5,0], scale:1.15 }}
                        animate={{ y:[0,-5,0] }} transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut', delay:i*.35 }}>
                        <Icon className="w-7 h-7" style={{ color:col }}/>
                      </motion.div>
                      <h3 className="font-bold text-white text-base mb-2">{c.title}</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">{c.desc}</p>
                    </Card3D>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(219,234,254,.45),transparent)' }}/>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }} variants={stagger}>
            <motion.div variants={springIn}>
              <motion.img src="/isi-logo.png" alt="ISI SUPTECH"
                className="h-16 w-auto mx-auto mb-6 object-contain"
                animate={{ y:[0,-6,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}/>
            </motion.div>
            <motion.h2 variants={fade3d} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Prêt à faire entendre ta voix ?
            </motion.h2>
            <motion.p variants={fade} className="text-slate-500 text-lg mb-8">
              Rejoins les étudiants ISI SUPTECH qui participent chaque année à l'amélioration de la formation.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:.97 }}>
                <Link to="/rejoindre"
                  className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/25 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"/>
                  <GraduationCap className="w-5 h-5"/> S'inscrire maintenant
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}>
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
              <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-10 w-auto object-contain brightness-0 invert opacity-80"/>
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
              <Link to="/rejoindre" className="hover:text-white transition-colors">S'inscrire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
