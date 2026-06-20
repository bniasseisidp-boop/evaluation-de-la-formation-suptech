import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion, AnimatePresence, useScroll, useTransform, useSpring, useInView,
} from 'framer-motion';
import {
  GraduationCap, ArrowRight, ChevronLeft, ChevronRight,
  Shield, BarChart3, Zap, CheckCircle, Star, Heart,
  Mail, Phone, MapPin, Award, Users,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ════ VARIANTS ════ */
const fade    = { hidden:{opacity:0,y:28},   show:{opacity:1,y:0} };
const fade3d  = { hidden:{opacity:0,y:40,rotateX:18,scale:.93}, show:{opacity:1,y:0,rotateX:0,scale:1} };
const stagger = { hidden:{}, show:{transition:{staggerChildren:.11}} };
const springIn= { hidden:{opacity:0,scale:.72}, show:{opacity:1,scale:1,transition:{type:'spring',stiffness:220,damping:14}} };

/* ════ CANVAS VORTEX ════ */
function VortexCanvas({ opacity=1 }) {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); let raf,frame=0;
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    resize(); window.addEventListener('resize',resize);
    const COLS=['#60a5fa','#38bdf8','#818cf8','#c084fc','#34d399','#f472b6','#fbbf24','#a78bfa'];
    const mkP=(l)=>({
      a:Math.random()*Math.PI*2, r0:38+l*56+Math.random()*44,
      rw:8+Math.random()*20, ws:.012+Math.random()*.028, wo:Math.random()*Math.PI*2,
      spd:(.005+Math.random()*.02)*(l%2===0?1:-1),
      sz:.8+Math.random()*(l<2?3.2:2),
      col:COLS[Math.floor(Math.random()*COLS.length)],
      op:.22+Math.random()*.5, tr:[], tl:Math.floor(7+Math.random()*26),
    });
    const ps=[]; [48,38,30,22].forEach((n,l)=>{for(let i=0;i<n;i++)ps.push(mkP(l));});
    const draw=()=>{
      frame++;
      ctx.fillStyle='rgba(0,0,0,.13)'; ctx.fillRect(0,0,c.width,c.height);
      const cx=c.width/2,cy=c.height/2;
      const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,230+Math.sin(frame*.015)*55);
      gr.addColorStop(0,'rgba(37,99,235,.16)'); gr.addColorStop(.5,'rgba(99,102,241,.06)'); gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr; ctx.fillRect(0,0,c.width,c.height);
      ps.forEach(p=>{
        p.a+=p.spd;
        const r=p.r0+Math.sin(frame*p.ws+p.wo)*p.rw;
        const x=cx+Math.cos(p.a)*r, y=cy+Math.sin(p.a)*r;
        p.tr.push({x,y}); if(p.tr.length>p.tl) p.tr.shift();
        for(let i=1;i<p.tr.length;i++){
          const t=i/p.tr.length;
          ctx.beginPath(); ctx.moveTo(p.tr[i-1].x,p.tr[i-1].y); ctx.lineTo(p.tr[i].x,p.tr[i].y);
          ctx.strokeStyle=p.col; ctx.lineWidth=p.sz*t*.88; ctx.globalAlpha=p.op*t*.42; ctx.stroke();
        }
        ctx.shadowBlur=16; ctx.shadowColor=p.col;
        ctx.beginPath(); ctx.arc(x,y,p.sz,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=p.op*.9; ctx.fill();
        ctx.shadowBlur=0; ctx.globalAlpha=1;
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity}}/>;
}

/* ════ CARD 3D TILT ════ */
function Card3D({children,className='',style={}}) {
  const ref=useRef(null);
  const mv=(e)=>{
    const el=ref.current; if(!el) return;
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    el.style.transform=`perspective(900px) rotateX(${-y*11}deg) rotateY(${x*13}deg) scale(1.04) translateZ(10px)`;
  };
  const ml=()=>{const el=ref.current;if(el)el.style.transform='perspective(900px) rotateX(0) rotateY(0) scale(1) translateZ(0)';};
  return <div ref={ref} className={className} style={{transition:'transform .35s cubic-bezier(.23,1,.32,1)',...style}} onMouseMove={mv} onMouseLeave={ml}>{children}</div>;
}

/* ════ COUNT-UP ════ */
function CountUp({to,suffix='',duration=1800}) {
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:'-80px'});
  const [val,setVal]=useState(0);
  useEffect(()=>{
    if(!inView) return;
    const n=parseInt(to); let st;
    const step=(ts)=>{if(!st)st=ts;const p=Math.min((ts-st)/duration,1);const e=1-Math.pow(1-p,3);setVal(Math.floor(e*n));if(p<1)requestAnimationFrame(step);else setVal(n);};
    requestAnimationFrame(step);
  },[inView,to,duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ════ CAROUSEL ════ */
function Carousel({images,className='',interval=4000}) {
  const [idx,setIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%images.length),interval);return()=>clearInterval(t);},[images.length,interval]);
  const prev=()=>setIdx(i=>(i-1+images.length)%images.length);
  const next=()=>setIdx(i=>(i+1)%images.length);
  return(
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx].src} alt={images[idx].alt||''}
          initial={{opacity:0,scale:1.07}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}} transition={{duration:.9}}
          className="w-full h-full object-cover"/>
      </AnimatePresence>
      {images.length>1&&(<>
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"><ChevronLeft className="w-5 h-5"/></button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"><ChevronRight className="w-5 h-5"/></button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_,i)=>(<button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i===idx?'bg-white w-5':'bg-white/50 w-1.5'}`}/>))}
        </div>
      </>)}
    </div>
  );
}

/* ════ FLOATING ORBS ════ */
function FloatOrbs({orbs}) {
  return(
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((o,i)=>(
        <motion.div key={i} className="absolute rounded-full"
          style={{width:o.size,height:o.size,left:o.x,top:o.y,background:`radial-gradient(circle,${o.col},transparent)`}}
          animate={o.anim} transition={{...o.tr,repeat:Infinity,ease:'easeInOut'}}/>
      ))}
    </div>
  );
}

/* ════ DATA ════ */
const VITRINES=[
  {src:'/images/vitrines/caroursel_isi_suptech_soutenace.jpg',alt:'Soutenance ISI SUPTECH'},
  {src:'/images/vitrines/etudant_farda.jpeg',alt:'Étudiant ISI SUPTECH'},
  {src:'/images/vitrines/Etudiant_gestion.jpeg',alt:'Cours ISI SUPTECH'},
];
const PARTENAIRES=[
  {src:'/images/partenaires/3FPT.png',alt:'3FPT'},
  {src:'/images/partenaires/aws-academy.png',alt:'AWS Academy'},
  {src:'/images/partenaires/cames_logo.png',alt:'CAMES'},
  {src:'/images/partenaires/cisco.png',alt:'Cisco'},
  {src:'/images/partenaires/demdik.jpeg',alt:'Demdik'},
  {src:'/images/partenaires/huawei.png',alt:'Huawei'},
  {src:'/images/partenaires/logo_anaq.png',alt:'ANAQ'},
  {src:'/images/partenaires/onfp.png',alt:'ONFP'},
];
const TEAM_ADMIN=[
  {src:'/images/admin/kara_directeur.jpg',nom:'Directeur Général',titre:'Direction',color:'#3b82f6'},
  {src:'/images/admin/mbene-tall.jpg',nom:'Resp. Académique',titre:'Académique',color:'#22c55e'},
  {src:'/images/admin/oumoukhairy.jpg',nom:'Coordinatrice',titre:'Coordination',color:'#f59e0b'},
  {src:'/images/admin/samba.jpg',nom:'Resp. Pédagogique',titre:'Pédagogie',color:'#a855f7'},
];
const TEAM_PROFS=[
  {src:'/images/membres/cisse.jpeg',nom:'M. CISSE',titre:'Marketing',color:'#ef4444'},
  {src:'/images/membres/junior.jpeg',nom:'M. JUNIOR',titre:'Développement Web',color:'#06b6d4'},
  {src:'/images/membres/mr_robert.jpeg',nom:'M. ROBERT',titre:'PHP & SGF',color:'#8b5cf6'},
];
const STATS=[
  {to:'57', suffix:'',  label:'Professeurs',     color:'#60a5fa',icon:'👨‍🏫',desc:'Enseignants qualifiés'},
  {to:'18', suffix:'',  label:'Classes actives',  color:'#a78bfa',icon:'🏫',desc:'Promotions encadrées'},
  {to:'5',  suffix:'',  label:'Filières',         color:'#38bdf8',icon:'📚',desc:'Spécialités reconnues'},
  {to:'100',suffix:'%', label:'Anonymat garanti', color:'#34d399',icon:'🔒',desc:'Protection totale'},
];
const STEPS=[
  {num:'1',icon:'🔗',title:'Accède au lien de ta classe',      desc:"L'administration t'envoie un lien unique. Crée ton compte étudiant en 30 secondes chrono.", color:'#3b82f6'},
  {num:'2',icon:'⭐',title:'Évalue tes professeurs',           desc:'10 questions courtes par matière, 100% anonymes, en moins de 3 minutes. Ton avis compte.',  color:'#f59e0b'},
  {num:'3',icon:'📊',title:'Les profs reçoivent leurs résultats',desc:'Rapport PDF personnalisé envoyé automatiquement à chaque enseignant pour progresser.',      color:'#22c55e'},
];
const FILIERES=[
  {code:'FC',  nom:'Comptabilité Finance',   color:'#f97316',emoji:'💼',desc:'Maîtrisez la comptabilité, la finance et la gestion d\'entreprise moderne.',debouches:'Comptable · Contrôleur financier · Auditeur'},
  {code:'IAGE',nom:'Informatique & Gestion', color:'#3b82f6',emoji:'💻',desc:'Allier les outils informatiques à la gestion d\'entreprise contemporaine.',debouches:'Chef de projet · Analyste · Développeur'},
  {code:'RI',  nom:'Réseaux Informatiques',  color:'#06b6d4',emoji:'🌐',desc:'Concevez et administrez des réseaux et infrastructures systèmes solides.',debouches:'Admin réseau · Ingénieur systèmes · Cybersécurité'},
  {code:'GL',  nom:'Génie Logiciel',         color:'#22c55e',emoji:'⚙️',desc:'Concevez des logiciels robustes avec les meilleures pratiques du code.',debouches:'Développeur · Architecte logiciel · DevOps'},
  {code:'BT',  nom:'Brevet Technicien',      color:'#a855f7',emoji:'🔧',desc:'Formation technique et pratique pour intégrer rapidement le marché.',debouches:'Technicien · Support · Maintenance IT'},
];
const AVANTAGES=[
  {icon:Heart,       col:'#ef4444',title:'Tu améliores ta formation',   desc:"Tes retours permettent d'identifier ce qui fonctionne et ce qui doit changer."},
  {icon:Shield,      col:'#2563eb',title:"C'est 100% anonyme",          desc:"Ton identité n'est jamais révélée. Exprime-toi librement sans retenue."},
  {icon:BarChart3,   col:'#16a34a',title:"Les profs s'améliorent",      desc:'Chaque professeur reçoit un rapport détaillé pour progresser chaque année.'},
  {icon:Zap,         col:'#ca8a04',title:'Rapide et simple',             desc:'10 questions par matière, moins de 5 minutes par prof. Aucune complexité.'},
  {icon:CheckCircle, col:'#0284c7',title:'Suivi en temps réel',          desc:'Vois quelles matières tu as déjà évaluées depuis ton tableau de bord.'},
  {icon:Star,        col:'#d97706',title:'Qualité ISI SUPTECH',          desc:"ISI s'engage à agir sur tes retours pour maintenir l'excellence permanente."},
];
const FOOTER_LINKS=[
  {title:'Navigation', items:[{l:'Accueil',href:'/'},{l:'Nos Filières',href:'/'},{l:'L\'Équipe',href:'/'},{l:'Partenaires',href:'/'}]},
  {title:'Étudiants',  items:[{l:'S\'inscrire',href:'/rejoindre'},{l:'Rejoindre une classe',href:'/rejoindre'},{l:'Évaluer mes profs',href:'/portail'},{l:'Mes évaluations',href:'/portail/mes-evaluations'}]},
  {title:'Filières',   items:[{l:'Comptabilité Finance',href:'/'},{l:'Informatique & Gestion',href:'/'},{l:'Réseaux Informatiques',href:'/'},{l:'Génie Logiciel',href:'/'}]},
];

/* ─── couleur commune pour les sections ─── */
const DARK_BG = 'linear-gradient(135deg,#020817 0%,#0d1533 55%,#10083a 100%)';

/* ════ TEAM ORBIT ════ */
function TeamOrbit(){
  const [selected,setSelected]=useState(null);
  const paused=!!selected;
  const N=TEAM_ADMIN.length,NP=TEAM_PROFS.length,R=165,RP=270,SIZE=620,SPEED=10,SPEEDP=14;
  const open=(m)=>setSelected(m),close=()=>setSelected(null);
  return(
    <div className="flex flex-col items-center gap-6">
      <style>{`
        @keyframes orb-cw  {from{transform:rotate(0deg)}   to{transform:rotate(360deg)}}
        @keyframes orb-ccw {from{transform:rotate(0deg)}   to{transform:rotate(-360deg)}}
        @keyframes isi-pulse{0%,100%{box-shadow:0 0 0 6px #dbeafe,0 8px 32px rgba(59,130,246,.22)} 50%{box-shadow:0 0 0 14px #bfdbfe,0 14px 44px rgba(59,130,246,.38)}}
        .orb-admin{animation:orb-cw  ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .orb-profs{animation:orb-ccw ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .orb-dec1 {animation:orb-ccw ${SPEED*3}s linear infinite;animation-play-state:var(--op);}
        .orb-dec2 {animation:orb-cw  ${SPEED*2}s linear infinite;animation-play-state:var(--op);}
        .cnt-admin{animation:orb-ccw ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .cnt-profs{animation:orb-cw  ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .isi-pulse{animation:isi-pulse 3s ease-in-out infinite;}
      `}</style>
      <div style={{position:'relative',width:SIZE,height:SIZE,'--op':paused?'paused':'running'}}>
        <div className="orb-dec1" style={{position:'absolute',inset:4,  borderRadius:'50%',border:'2px dashed rgba(59,130,246,.18)'}}/>
        <div className="orb-dec2" style={{position:'absolute',inset:60, borderRadius:'50%',border:'1.5px solid rgba(99,102,241,.12)'}}/>
        <div className="orb-dec1" style={{position:'absolute',inset:120,borderRadius:'50%',border:'1px solid rgba(59,130,246,.09)'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:30}}>
          <AnimatePresence mode="wait">
            {!selected?(
              <motion.div key="logo" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.6}} transition={{duration:.3}}
                className="isi-pulse" style={{width:106,height:106,background:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/isi-logo.png" alt="ISI" style={{width:80,height:80,objectFit:'contain',padding:4}}/>
              </motion.div>
            ):(
              <motion.div key={selected.nom} initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.5}}
                transition={{type:'spring',stiffness:300,damping:22}} style={{width:170,textAlign:'center'}}>
                <div style={{width:104,height:104,borderRadius:'50%',overflow:'hidden',margin:'0 auto 8px',border:`4px solid ${selected.color}`,boxShadow:`0 0 0 4px white,0 8px 32px ${selected.color}66`}}>
                  <img src={selected.src} alt={selected.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                <div style={{fontWeight:900,color:'#0f172a',fontSize:13,marginBottom:5}}>{selected.nom}</div>
                <div style={{display:'inline-block',backgroundColor:selected.color,color:'white',fontSize:10,fontWeight:800,padding:'3px 12px',borderRadius:20,boxShadow:`0 3px 10px ${selected.color}55`,marginBottom:10}}>{selected.titre}</div>
                <div><button onClick={close} style={{background:'#f1f5f9',border:'none',cursor:'pointer',borderRadius:20,fontSize:11,fontWeight:700,color:'#64748b',padding:'5px 14px',boxShadow:'0 2px 8px rgba(0,0,0,.1)'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>✕ Fermer</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {[{data:TEAM_ADMIN,cls:'orb-admin',ccls:'cnt-admin',R,N},{data:TEAM_PROFS,cls:'orb-profs',ccls:'cnt-profs',R:RP,N:NP}].map(({data,cls,ccls,R:radius,N:count},ri)=>(
          <div key={ri} className={cls} style={{position:'absolute',inset:0}}>
            {data.map((m,i)=>{
              const a=(i/count)*360, isActive=selected?.nom===m.nom;
              return(
                <div key={i} style={{position:'absolute',top:'50%',left:'50%',transform:`rotate(${a}deg) translate(${radius}px) rotate(-${a}deg) translate(-50%,-50%)`,zIndex:20}}>
                  <div className={ccls} style={{cursor:'pointer'}} onClick={()=>open(m)}>
                    <div style={{position:'relative',display:'inline-block'}}>
                      <div style={{position:'absolute',bottom:'100%',left:'50%',transform:'translateX(-50%) translateY(-5px)',backgroundColor:m.color,color:'white',fontSize:10,fontWeight:900,padding:'3px 10px',borderRadius:20,whiteSpace:'nowrap',boxShadow:`0 3px 10px ${m.color}55`,zIndex:40}}>{m.titre}</div>
                      <div style={{width:68,height:68,borderRadius:'50%',overflow:'hidden',border:isActive?`4px solid ${m.color}`:`3px solid ${m.color}`,boxShadow:isActive?`0 0 0 3px white,0 0 20px 6px ${m.color}88`:`0 0 0 3px white,0 4px 16px ${m.color}44`,transition:'all .25s',transform:isActive?'scale(1.14)':'scale(1)'}}
                        onMouseEnter={e=>{if(!isActive)e.currentTarget.style.transform='scale(1.12)';}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.transform='scale(1)';}}>
                        <img src={m.src} alt={m.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%) translateY(7px)',background:'white',color:'#1e293b',fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(0,0,0,.12)'}}>{m.nom}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>Administration</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"/>Corps professoral</span>
      </div>
      <p className="text-slate-400 text-sm -mt-3">{paused?'▶ Cliquez sur "Fermer" pour reprendre':'Cliquez sur un membre pour en savoir plus'}</p>
    </div>
  );
}

/* ════ HERO + PARALLAX ════ */
function HeroSection(){
  const ref=useRef(null);
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});
  const titleY=useSpring(useTransform(scrollYProgress,[0,1],[0,-110]),{stiffness:80,damping:24});
  const bgScale=useSpring(useTransform(scrollYProgress,[0,1],[1,1.12]),{stiffness:40,damping:20});
  const vortexO=useTransform(scrollYProgress,[0,.5],[.42,.06]);
  return(
    <section ref={ref} className="relative overflow-hidden min-h-[88vh] flex items-center">
      <motion.div className="absolute inset-0" style={{scale:bgScale}}>
        <Carousel images={VITRINES} className="w-full h-full" interval={5000}/>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/92 via-blue-800/78 to-blue-900/65"/>
      </motion.div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 w-full">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
          <motion.div variants={fade}>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6 text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              Plateforme officielle ISI / SUPTECH — Dakar, Sénégal
            </div>
          </motion.div>
          <motion.div style={{y:titleY}}>
            <motion.h1 variants={fade} className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white">
              Ton avis améliore<br/>
              <motion.span className="text-yellow-300 inline-block" animate={{scale:[1,1.04,1]}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}>la qualité</motion.span><br/>
              de ta formation
            </motion.h1>
            <motion.p variants={fade} className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
              Évalue tes professeurs de manière <strong className="text-white">anonyme</strong> et aide ISI SUPTECH à maintenir un enseignement d'excellence.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{scale:1.05,y:-3}} whileTap={{scale:.97}}>
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

/* ════ PAGE ════ */
export default function LandingPage(){
  const {isAuthenticated,user}=useAuthStore();
  const navigate=useNavigate();
  useEffect(()=>{if(isAuthenticated)navigate(user?.role==='admin'?'/admin':'/portail',{replace:true});},[isAuthenticated]);

  return(
    <div className="min-h-screen font-sans" style={{background:'#020817',scrollBehavior:'smooth'}}>

      {/* ─── NAVBAR BLANC ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.div whileHover={{scale:1.05,rotate:-2}} transition={{type:'spring',stiffness:300}}>
              <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                <img src="/isi-logo.png" alt="ISI" className="w-7 h-7 object-contain"/>
              </div>
            </motion.div>
            <div>
              <div className="font-black text-slate-900 text-sm leading-tight">ISI <span className="text-blue-600">SUPTECH</span></div>
              <div className="text-[9px] text-blue-500 font-bold tracking-[.2em] uppercase">Excellence · Innovation</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              {label:'Accueil',   href:'#accueil'},
              {label:'Filières',  href:'#filieres'},
              {label:'Équipe',    href:'#equipe'},
              {label:'Partenaires',href:'#partenaires'},
            ].map(({label,href})=>(
              <motion.a key={label} href={href} whileHover={{y:-1}}
                className="text-slate-600 hover:text-blue-600 text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-all font-medium cursor-pointer">
                {label}
              </motion.a>
            ))}
          </nav>
          <motion.div whileHover={{scale:1.05}} whileTap={{scale:.97}}>
            <Link to="/rejoindre"
              className="group relative overflow-hidden flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm text-white"
              style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)',boxShadow:'0 4px 20px rgba(37,99,235,.35)'}}>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"/>
              S'inscrire <ArrowRight className="w-4 h-4"/>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <HeroSection/>

      {/* ─── STATS ─── */}
      <section id="accueil" className="py-16 relative overflow-hidden" style={{background:DARK_BG}}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((s,i)=>(
              <motion.div key={i} variants={fade3d} transition={{delay:i*.12,type:'spring',stiffness:180,damping:18}}>
                <Card3D className="text-center rounded-2xl p-6 cursor-default border"
                  style={{background:'rgba(255,255,255,.05)',borderColor:'rgba(255,255,255,.1)'}}>
                  <motion.div className="text-4xl mb-3" animate={{y:[0,-7,0]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut',delay:i*.4}}>{s.icon}</motion.div>
                  <div className="text-3xl font-black mb-0.5" style={{color:s.color}}><CountUp to={s.to} suffix={s.suffix}/></div>
                  <div className="text-white font-semibold text-sm mb-1">{s.label}</div>
                  <div className="text-slate-500 text-[11px]">{s.desc}</div>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="py-20 relative overflow-hidden" style={{background:'linear-gradient(160deg,#0a1628 0%,#0d2044 100%)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5"/> Comment ça marche
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">3 étapes, c'est tout.</h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">Simple, rapide, 100% anonyme.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s,i)=>(
                <motion.div key={i} variants={fade3d} transition={{delay:i*.15,type:'spring',stiffness:160,damping:20}}>
                  <Card3D className="rounded-2xl p-7 cursor-default h-full relative overflow-hidden border"
                    style={{background:'rgba(255,255,255,.06)',borderColor:'rgba(255,255,255,.1)',backdropFilter:'blur(10px)'}}>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{background:s.color}}/>
                    <div className="flex items-center gap-3 mb-5">
                      <motion.div whileHover={{rotate:-8,scale:1.15}}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg"
                        style={{background:s.color,boxShadow:`0 4px 16px ${s.color}55`}}>{s.num}</motion.div>
                      <motion.span className="text-4xl" animate={{y:[0,-7,0]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:i*.6}}>{s.icon}</motion.span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                  </Card3D>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FILIÈRES ─── */}
      <section id="filieres" className="py-20 relative overflow-hidden" style={{background:'linear-gradient(160deg,#0c0a1e 0%,#160d35 100%)'}}>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Award className="w-3.5 h-3.5"/> Nos filières
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">5 filières, un seul objectif</h2>
              <p className="text-slate-400 text-lg">Des dizaines de métiers, une excellence reconnue.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FILIERES.map((f,i)=>(
                <motion.div key={i} variants={fade3d} transition={{delay:i*.1,type:'spring',stiffness:160,damping:20}}>
                  <Card3D className="rounded-2xl overflow-hidden cursor-default h-full border-2"
                    style={{background:'rgba(255,255,255,.05)',borderColor:f.color+'50',backdropFilter:'blur(10px)'}}>
                    <div className="h-1.5 w-full" style={{background:`linear-gradient(90deg,${f.color},${f.color}66)`}}/>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div animate={{y:[0,-5,0]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut',delay:i*.4}}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                          style={{background:`${f.color}20`,border:`2px solid ${f.color}45`}}>
                          {f.emoji}
                        </motion.div>
                        <div>
                          <span className="inline-block text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1"
                            style={{color:f.color,background:`${f.color}22`}}>{f.code}</span>
                          <div className="font-bold text-white text-sm leading-tight">{f.nom}</div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.debouches.split(' · ').map((d,j)=>(
                          <span key={j} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{background:`${f.color}22`,color:f.color}}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </Card3D>
                </motion.div>
              ))}
              {/* Et bien plus */}
              <motion.div variants={fade3d} transition={{delay:.55,type:'spring',stiffness:160,damping:20}}>
                <Card3D className="rounded-2xl p-6 text-white cursor-default flex flex-col justify-between min-h-[220px]"
                  style={{background:'linear-gradient(135deg,#2563eb,#0891b2)',boxShadow:'0 8px 32px rgba(37,99,235,.3)'}}>
                  <div>
                    <motion.div className="text-5xl mb-4" animate={{y:[0,-6,0],rotate:[0,5,-5,0]}} transition={{duration:3.5,repeat:Infinity,ease:'easeInOut'}}>🎓</motion.div>
                    <div className="font-black text-xl mb-2">Et bien plus encore</div>
                    <p className="text-blue-100 text-sm">Master, Licence Pro, formations certifiantes et programmes courts disponibles.</p>
                  </div>
                  <Link to="/rejoindre"
                    className="mt-5 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    En savoir plus <ArrowRight className="w-4 h-4"/>
                  </Link>
                </Card3D>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ÉQUIPE ORBIT ─── */}
      <section id="equipe" className="py-20 overflow-hidden relative" style={{background:'linear-gradient(160deg,#0a1628 0%,#0d2044 100%)'}}>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Users className="w-3.5 h-3.5"/> L'équipe
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Notre équipe & Corps professoral</h2>
              <p className="text-slate-400 text-lg">Administration au centre · Professeurs en orbite externe</p>
            </motion.div>
            <motion.div variants={fade} className="flex justify-center">
              <TeamOrbit/>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── PARTENAIRES — dark simple, VRAIS LOGOS en couleur ─── */}
      <section id="partenaires" className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg,#020817 0%,#0d1b3e 100%)'}}>
        {/* Pas de vortex ici — focus sur les logos */}
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 60% 70% at 50% 50%,rgba(37,99,235,.08),transparent)'}}/>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Award className="w-3.5 h-3.5 text-yellow-400"/> Nos partenaires
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Partenaires de renommée mondiale</h2>
              <p className="text-slate-400">Certifiés et accrédités par les plus grandes organisations internationales.</p>
            </motion.div>
            {/* Logos en grille — couleurs réelles */}
            <motion.div variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {PARTENAIRES.map((p,i)=>(
                <motion.div key={i} variants={fade}
                  whileHover={{scale:1.1,y:-4}}
                  className="flex items-center justify-center bg-white/8 border border-white/10 rounded-2xl p-5 h-24 cursor-pointer transition-all"
                  style={{backdropFilter:'blur(8px)'}}>
                  <img src={p.src} alt={p.alt} className="max-h-12 w-auto max-w-[110px] object-contain"/>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── POURQUOI ÉVALUER ─── */}
      <section className="py-20 relative overflow-hidden text-white" style={{background:'linear-gradient(160deg,#0c0a1e 0%,#160d35 100%)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 text-yellow-400"/> Pourquoi évaluer
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3">Ton avis change tout</h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto">Un impact réel sur la qualité de ta formation chaque année.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVANTAGES.map((c,i)=>(
                <motion.div key={i} variants={fade3d} transition={{delay:i*.1,type:'spring',stiffness:160,damping:20}}>
                  <Card3D className="border rounded-2xl p-6 backdrop-blur-sm cursor-default h-full"
                    style={{background:'rgba(255,255,255,.08)',borderColor:'rgba(255,255,255,.15)'}}>
                    <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{background:`${c.col}25`,border:`1.5px solid ${c.col}55`,boxShadow:`0 0 22px ${c.col}35`}}
                      animate={{y:[0,-5,0]}} transition={{duration:2.8,repeat:Infinity,ease:'easeInOut',delay:i*.35}}>
                      <c.icon className="w-7 h-7" style={{color:c.col}}/>
                    </motion.div>
                    <h3 className="font-bold text-white text-base mb-2">{c.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{c.desc}</p>
                  </Card3D>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 relative overflow-hidden" style={{background:DARK_BG}}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
            <motion.div variants={springIn}>
              <motion.img src="/isi-logo.png" alt="ISI SUPTECH"
                className="h-16 w-auto mx-auto mb-6 object-contain"
                animate={{y:[0,-6,0]}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}/>
            </motion.div>
            <motion.h2 variants={fade3d} className="text-3xl md:text-4xl font-black text-white mb-4">
              Prêt à faire entendre ta voix ?
            </motion.h2>
            <motion.p variants={fade} className="text-slate-400 text-lg mb-8">
              Rejoins les étudiants ISI SUPTECH qui participent chaque année à l'amélioration de la formation.
            </motion.p>
            <motion.div variants={fade}>
              <motion.div whileHover={{scale:1.05,y:-3}} whileTap={{scale:.97}} className="inline-block">
                <Link to="/rejoindre"
                  className="group flex items-center justify-center gap-2 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl relative overflow-hidden"
                  style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)',boxShadow:'0 8px 32px rgba(37,99,235,.35)'}}>
                  <span className="absolute inset-0 bg-white/25 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"/>
                  <GraduationCap className="w-5 h-5"/> S'inscrire maintenant
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER RICHE ─── */}
      <footer className="relative overflow-hidden border-t border-white/[0.06]" style={{background:'linear-gradient(160deg,#020817 0%,#0d1b3e 60%,#10083a 100%)'}}>
        <div>
          <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <img src="/isi-logo.png" alt="ISI" className="w-9 h-9 object-contain"/>
                  </div>
                  <div>
                    <div className="font-black text-white text-lg">ISI / SUPTECH</div>
                    <div className="text-blue-400 text-xs font-bold tracking-widest">Excellence · Innovation</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                  L'Institut Supérieur d'Informatique forme les talents technologiques du Sénégal. Qualité, rigueur, excellence depuis des décennies.
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0"/>
                    <span>Sicap Liberté 3, N°1977 — Dakar, Sénégal</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <Phone className="w-3.5 h-3.5 text-green-400 shrink-0"/>
                    <span>+221 33 825 62 10</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0"/>
                    <span>suptech@suptech.info</span>
                  </div>
                </div>
              </div>
              {FOOTER_LINKS.map((col,i)=>(
                <div key={i}>
                  <div className="text-white font-black text-sm mb-4 uppercase tracking-widest">{col.title}</div>
                  <ul className="space-y-2.5">
                    {col.items.map((item,j)=>(
                      <li key={j}>
                        <Link to={item.href} className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1">{item.l}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-8">
                {[['57','Professeurs'],['18','Classes'],['5','Filières'],['100%','Anonymat']].map(([v,l],i)=>(
                  <div key={i} className="text-center">
                    <div className="text-blue-400 font-black text-lg">{v}</div>
                    <div className="text-slate-600 text-[10px] font-medium">{l}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['3FPT','AWS Academy','Cisco','Huawei','CAMES','ANAQ'].map(n=>(
                  <div key={n} className="text-slate-600 text-[10px] font-bold px-2 py-1 border border-white/10 rounded-lg">{n}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <span>© {new Date().getFullYear()} ISI / SUPTECH — Tous droits réservés</span>
              <span>Plateforme développée par <strong className="text-blue-500">MULTI BRAIN TECH</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
