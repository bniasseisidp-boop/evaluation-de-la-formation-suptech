import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  GraduationCap, ArrowRight,
  Shield, BarChart3, Zap, CheckCircle, Star, Heart,
  Mail, Phone, MapPin, Award, Users,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ════ VARIANTS ════ */
const fadeUp   = { hidden:{opacity:0,y:26},   show:{opacity:1,y:0,  transition:{duration:.5,ease:[.22,1,.36,1]}} };
const fadeLeft = { hidden:{opacity:0,x:-26},  show:{opacity:1,x:0,  transition:{duration:.5,ease:[.22,1,.36,1]}} };
const fadeRight= { hidden:{opacity:0,x:26},   show:{opacity:1,x:0,  transition:{duration:.5,ease:[.22,1,.36,1]}} };
const springIn = { hidden:{opacity:0,scale:.82},show:{opacity:1,scale:1,transition:{type:'spring',stiffness:220,damping:16}} };
const stagger  = { hidden:{}, show:{transition:{staggerChildren:.09}} };
const staggerFast = { hidden:{}, show:{transition:{staggerChildren:.06}} };

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
function Carousel({images,className='',interval=5000}) {
  const [idx,setIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%images.length),interval);return()=>clearInterval(t);},[images.length,interval]);
  return(
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx].src} alt={images[idx].alt||''}
          initial={{opacity:0,scale:1.06}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.97}} transition={{duration:.9}}
          className="w-full h-full object-cover"/>
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_,i)=>(<button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i===idx?'bg-white w-5':'bg-white/50 w-1.5'}`}/>))}
      </div>
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
  {to:'57',suffix:'',  label:'Professeurs',    color:'#2563eb',icon:'👨‍🏫',desc:'Enseignants qualifiés'},
  {to:'18',suffix:'',  label:'Classes actives', color:'#16a34a',icon:'🏫',desc:'Promotions encadrées'},
  {to:'5', suffix:'',  label:'Filières',        color:'#9333ea',icon:'📚',desc:'Spécialités reconnues'},
  {to:'100',suffix:'%',label:'Anonymat garanti',color:'#0891b2',icon:'🔒',desc:'Protection totale'},
];
const STEPS=[
  {num:'1',icon:'🔗',title:'Accède au lien de ta classe',       desc:"L'administration t'envoie un lien unique. Crée ton compte en 30 secondes.",color:'#2563eb'},
  {num:'2',icon:'⭐',title:'Évalue tes professeurs',            desc:'10 questions courtes par matière, 100% anonymes. Ton avis compte vraiment.', color:'#f59e0b'},
  {num:'3',icon:'📊',title:'Les profs reçoivent leurs résultats',desc:'Rapport PDF personnalisé envoyé automatiquement à chaque enseignant.',       color:'#16a34a'},
];
const FILIERES=[
  {code:'FC',  nom:'Comptabilité Finance',  color:'#f97316',emoji:'💼',desc:'Maîtrisez la comptabilité, la finance et la gestion d\'entreprise moderne.',debouches:'Comptable · Contrôleur financier · Auditeur'},
  {code:'IAGE',nom:'Informatique & Gestion',color:'#2563eb',emoji:'💻',desc:'Allier les outils informatiques à la gestion d\'entreprise contemporaine.',debouches:'Chef de projet · Analyste · Développeur'},
  {code:'RI',  nom:'Réseaux Informatiques', color:'#0891b2',emoji:'🌐',desc:'Concevez et administrez des réseaux et infrastructures systèmes solides.',debouches:'Admin réseau · Ingénieur systèmes · Cybersécurité'},
  {code:'GL',  nom:'Génie Logiciel',        color:'#16a34a',emoji:'⚙️',desc:'Concevez des logiciels robustes avec les meilleures pratiques du code.',debouches:'Développeur · Architecte logiciel · DevOps'},
  {code:'BT',  nom:'Brevet Technicien',     color:'#9333ea',emoji:'🔧',desc:'Formation technique et pratique pour intégrer rapidement le marché.',debouches:'Technicien · Support · Maintenance IT'},
];
const AVANTAGES=[
  {icon:Heart,      col:'#ef4444',title:'Tu améliores ta formation',  desc:"Tes retours permettent d'identifier ce qui fonctionne et ce qui doit changer."},
  {icon:Shield,     col:'#2563eb',title:"C'est 100% anonyme",         desc:"Ton identité n'est jamais révélée. Exprime-toi librement sans retenue."},
  {icon:BarChart3,  col:'#16a34a',title:"Les profs s'améliorent",     desc:'Chaque professeur reçoit un rapport détaillé pour progresser chaque année.'},
  {icon:Zap,        col:'#f59e0b',title:'Rapide et simple',            desc:'10 questions par matière, moins de 5 minutes par prof. Aucune complexité.'},
  {icon:CheckCircle,col:'#0891b2',title:'Suivi en temps réel',         desc:'Vois quelles matières tu as déjà évaluées depuis ton tableau de bord.'},
  {icon:Star,       col:'#9333ea',title:'Qualité ISI SUPTECH',         desc:"ISI s'engage à agir sur tes retours pour maintenir l'excellence permanente."},
];
const FOOTER_LINKS=[
  {title:'Navigation', items:[{l:'Accueil',href:'/'},{l:'Nos Filières',href:'#filieres'},{l:'L\'Équipe',href:'#equipe'},{l:'Partenaires',href:'#partenaires'}]},
  {title:'Étudiants',  items:[{l:'S\'inscrire',href:'/rejoindre'},{l:'Rejoindre une classe',href:'/rejoindre'},{l:'Évaluer mes profs',href:'/portail'},{l:'Mes évaluations',href:'/portail/mes-evaluations'}]},
  {title:'Filières',   items:[{l:'Comptabilité Finance',href:'#filieres'},{l:'Informatique & Gestion',href:'#filieres'},{l:'Réseaux Informatiques',href:'#filieres'},{l:'Génie Logiciel',href:'#filieres'}]},
];

/* ════ TEAM ORBIT ════ */
function TeamOrbit(){
  const [selected,setSelected]=useState(null);
  const paused=!!selected;
  const N=TEAM_ADMIN.length,NP=TEAM_PROFS.length,R=165,RP=270,SIZE=620,SPEED=10,SPEEDP=14;
  const open=(m)=>setSelected(m),close=()=>setSelected(null);
  return(
    <div className="flex flex-col items-center gap-6">
      <style>{`
        @keyframes orb-cw  {from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
        @keyframes orb-ccw {from{transform:rotate(0deg)} to{transform:rotate(-360deg)}}
        @keyframes isi-pulse{0%,100%{box-shadow:0 0 0 6px #dbeafe,0 8px 32px rgba(59,130,246,.18)} 50%{box-shadow:0 0 0 14px #bfdbfe,0 14px 44px rgba(59,130,246,.28)}}
        .orb-admin{animation:orb-cw  ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .orb-profs{animation:orb-ccw ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .orb-dec1 {animation:orb-ccw ${SPEED*3}s linear infinite;animation-play-state:var(--op);}
        .orb-dec2 {animation:orb-cw  ${SPEED*2}s linear infinite;animation-play-state:var(--op);}
        .cnt-admin{animation:orb-ccw ${SPEED}s  linear infinite;animation-play-state:var(--op);}
        .cnt-profs{animation:orb-cw  ${SPEEDP}s linear infinite;animation-play-state:var(--op);}
        .isi-pulse{animation:isi-pulse 3s ease-in-out infinite;}
      `}</style>
      <div style={{position:'relative',width:SIZE,height:SIZE,'--op':paused?'paused':'running'}}>
        <div className="orb-dec1" style={{position:'absolute',inset:4,borderRadius:'50%',border:'2px dashed rgba(59,130,246,.3)'}}/>
        <div className="orb-dec2" style={{position:'absolute',inset:60,borderRadius:'50%',border:'1.5px solid rgba(99,102,241,.2)'}}/>
        <div className="orb-dec1" style={{position:'absolute',inset:120,borderRadius:'50%',border:'1px solid rgba(59,130,246,.15)'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:30}}>
          <AnimatePresence mode="wait">
            {!selected?(
              <motion.div key="logo" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.6}} transition={{duration:.3}}
                className="isi-pulse" style={{width:106,height:106,background:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #e2e8f0'}}>
                <img src="/isi-logo.png" alt="ISI" style={{width:80,height:80,objectFit:'contain',padding:4}}/>
              </motion.div>
            ):(
              <motion.div key={selected.nom} initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.5}}
                transition={{type:'spring',stiffness:300,damping:22}} style={{width:170,textAlign:'center'}}>
                <div style={{width:104,height:104,borderRadius:'50%',overflow:'hidden',margin:'0 auto 8px',border:`4px solid ${selected.color}`,boxShadow:`0 0 0 4px white,0 8px 32px ${selected.color}44`}}>
                  <img src={selected.src} alt={selected.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                <div style={{fontWeight:900,color:'#0f172a',fontSize:13,marginBottom:5}}>{selected.nom}</div>
                <div style={{display:'inline-block',backgroundColor:selected.color,color:'white',fontSize:10,fontWeight:800,padding:'3px 12px',borderRadius:20,marginBottom:10}}>{selected.titre}</div>
                <div><button onClick={close} style={{background:'#f1f5f9',border:'none',cursor:'pointer',borderRadius:20,fontSize:11,fontWeight:700,color:'#64748b',padding:'5px 14px',boxShadow:'0 2px 8px rgba(0,0,0,.08)'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>✕ Fermer</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {[{data:TEAM_ADMIN,cls:'orb-admin',ccls:'cnt-admin',R,N},{data:TEAM_PROFS,cls:'orb-profs',ccls:'cnt-profs',R:RP,N:NP}].map(({data,cls,ccls,R:radius,N:count},ri)=>(
          <div key={ri} className={cls} style={{position:'absolute',inset:0}}>
            {data.map((m,i)=>{
              const a=(i/count)*360,isActive=selected?.nom===m.nom;
              return(
                <div key={i} style={{position:'absolute',top:'50%',left:'50%',transform:`rotate(${a}deg) translate(${radius}px) rotate(-${a}deg) translate(-50%,-50%)`,zIndex:20}}>
                  <div className={ccls} style={{cursor:'pointer'}} onClick={()=>open(m)}>
                    <div style={{position:'relative',display:'inline-block'}}>
                      <div style={{position:'absolute',bottom:'100%',left:'50%',transform:'translateX(-50%) translateY(-5px)',backgroundColor:m.color,color:'white',fontSize:10,fontWeight:900,padding:'3px 10px',borderRadius:20,whiteSpace:'nowrap',boxShadow:`0 3px 10px ${m.color}44`,zIndex:40}}>{m.titre}</div>
                      <div style={{width:68,height:68,borderRadius:'50%',overflow:'hidden',border:isActive?`4px solid ${m.color}`:`3px solid ${m.color}`,boxShadow:isActive?`0 0 0 3px white,0 0 20px 6px ${m.color}55`:`0 0 0 3px white,0 4px 16px ${m.color}30`,transition:'all .25s',transform:isActive?'scale(1.14)':'scale(1)'}}
                        onMouseEnter={e=>{if(!isActive)e.currentTarget.style.transform='scale(1.12)';}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.transform='scale(1)';}}>
                        <img src={m.src} alt={m.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%) translateY(7px)',background:'white',color:'#1e293b',fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(0,0,0,.1)',border:'1px solid #e2e8f0'}}>{m.nom}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/>Administration</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"/>Corps professoral</span>
      </div>
      <p className="text-slate-400 text-sm -mt-3">{paused?'▶ Cliquez sur "Fermer" pour reprendre':'Cliquez sur un membre pour en savoir plus'}</p>
    </div>
  );
}

/* ════ PAGE ════ */
export default function LandingPage(){
  const {isAuthenticated,user}=useAuthStore();
  const navigate=useNavigate();
  useEffect(()=>{if(isAuthenticated)navigate(user?.role==='admin'?'/admin':'/portail',{replace:true});},[isAuthenticated]);

  return(
    <div className="min-h-screen font-sans bg-white" style={{scrollBehavior:'smooth'}}>

      {/* ─── NAVBAR ─── */}
      <motion.header
        initial={{y:-70,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.5,ease:[.22,1,.36,1]}}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <motion.div whileHover={{scale:1.04}} whileTap={{scale:.97}} transition={{type:'spring',stiffness:400,damping:20}}>
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <img src="/isi-logo.png" alt="ISI" className="w-6 h-6 object-contain"/>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm leading-tight">ISI <span className="text-blue-600">SUPTECH</span></div>
                <div className="text-[9px] text-slate-400 font-semibold tracking-[.15em] uppercase">Dakar · Sénégal</div>
              </div>
            </Link>
          </motion.div>

          <motion.nav initial="hidden" animate="show" variants={staggerFast} className="hidden md:flex items-center gap-0.5">
            {[
              {label:'Accueil',    href:'#accueil'},
              {label:'Filières',   href:'#filieres'},
              {label:'Équipe',     href:'#equipe'},
              {label:'Partenaires',href:'#partenaires'},
            ].map(({label,href})=>(
              <motion.a key={label} href={href} variants={fadeUp}
                whileHover={{y:-2,color:'#2563eb'}} whileTap={{scale:.97}}
                className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                {label}
              </motion.a>
            ))}
          </motion.nav>

          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:.4,delay:.3}}
            whileHover={{scale:1.05}} whileTap={{scale:.96}}>
            <Link to="/rejoindre"
              className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
              S'inscrire <ArrowRight className="w-4 h-4"/>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* ─── HERO ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Texte */}
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp}>
                <motion.span
                  animate={{scale:[1,1.03,1]}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"/>
                  Plateforme officielle ISI / SUPTECH
                </motion.span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-5 tracking-tight">
                Évalue tes profs.<br/>
                <motion.span
                  animate={{color:['#2563eb','#1d4ed8','#2563eb']}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  className="inline-block">Améliore</motion.span><br/>
                ta formation.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                Plateforme d'évaluation <strong className="text-slate-700">100% anonyme</strong> des professeurs ISI SUPTECH. Ton avis change vraiment les choses.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <motion.div whileHover={{scale:1.04,y:-2}} whileTap={{scale:.97}}>
                  <Link to="/rejoindre"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-100">
                    <GraduationCap className="w-5 h-5"/> Commencer maintenant
                  </Link>
                </motion.div>
                <motion.a href="#accueil" whileHover={{scale:1.03,y:-2}} whileTap={{scale:.97}}
                  className="flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 hover:border-blue-200 transition-all bg-white">
                  En savoir plus <ArrowRight className="w-4 h-4"/>
                </motion.a>
              </motion.div>
              {/* Mini stats */}
              <motion.div variants={fadeUp} className="flex gap-8 mt-10 pt-8 border-t border-slate-100">
                {[
                  {n:'57',l:'Professeurs',c:'#2563eb'},
                  {n:'18',l:'Classes',c:'#16a34a'},
                  {n:'100%',l:'Anonymat',c:'#9333ea'},
                ].map(({n,l,c},i)=>(
                  <motion.div key={i} whileHover={{y:-3}} transition={{type:'spring',stiffness:300}}>
                    <motion.div className="text-2xl font-black leading-none mb-1" style={{color:c}}
                      animate={{scale:[1,1.08,1]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:i*.5}}>
                      {n}
                    </motion.div>
                    <div className="text-slate-400 text-xs font-medium">{l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Photo + badges */}
            <motion.div variants={fadeRight} initial="hidden" animate="show" className="relative">
              <motion.div
                whileHover={{scale:1.02}} transition={{type:'spring',stiffness:200,damping:20}}
                className="rounded-2xl overflow-hidden shadow-xl shadow-slate-200/80 aspect-[4/3] border border-slate-100">
                <Carousel images={VITRINES} className="w-full h-full" interval={5000}/>
              </motion.div>
              {/* Badge bas-gauche */}
              <motion.div
                initial={{opacity:0,x:-20,y:20}} animate={{opacity:1,x:0,y:0}} transition={{delay:.6,type:'spring',stiffness:200}}
                animate={{y:[0,-6,0]}} transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                <motion.div whileHover={{rotate:10,scale:1.15}} transition={{type:'spring',stiffness:300}}
                  className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-green-600"/>
                </motion.div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">100% Anonyme</div>
                  <div className="text-slate-400 text-xs">Protégé · Sécurisé</div>
                </div>
              </motion.div>
              {/* Badge haut-droit */}
              <motion.div
                initial={{opacity:0,x:20,y:-20}} animate={{opacity:1,x:0,y:0}} transition={{delay:.8,type:'spring',stiffness:200}}
                animate={{y:[0,6,0]}} transition={{duration:3.5,repeat:Infinity,ease:'easeInOut',delay:.6}}
                className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                <motion.div whileHover={{rotate:-10,scale:1.15}} transition={{type:'spring',stiffness:300}}
                  className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-blue-600"/>
                </motion.div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">5 Filières</div>
                  <div className="text-slate-400 text-xs">Reconnues · Certifiées</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="accueil" className="py-16 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((s,i)=>(
              <motion.div key={i} variants={springIn}
                whileHover={{y:-6,scale:1.03,boxShadow:'0 12px 32px rgba(0,0,0,.08)',transition:{duration:.2}}}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-7 border border-slate-100 shadow-sm transition-shadow text-center cursor-default">
                <motion.span className="text-4xl"
                  animate={{y:[0,-8,0],rotate:[0,5,-5,0]}}
                  transition={{duration:2.8,repeat:Infinity,ease:'easeInOut',delay:i*.4}}>
                  {s.icon}
                </motion.span>
                <div className="text-3xl font-black mt-1" style={{color:s.color}}>
                  <CountUp to={s.to} suffix={s.suffix}/>
                </div>
                <div className="text-slate-800 font-semibold text-sm">{s.label}</div>
                <div className="text-slate-400 text-xs">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <motion.span
                whileInView={{scale:[.9,1.05,1]}} transition={{duration:.5}} viewport={{once:true}}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <motion.span animate={{rotate:[0,15,-15,0]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}>
                  <Zap className="w-3.5 h-3.5"/>
                </motion.span> Comment ça marche
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">3 étapes, c'est tout.</h2>
              <p className="text-slate-500 text-lg">Simple, rapide, 100% anonyme.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s,i)=>(
                <motion.div key={i} variants={fadeUp} transition={{delay:i*.12}}
                  whileHover={{y:-6,scale:1.02,transition:{duration:.2}}}
                  className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden cursor-default">
                  <div className="h-1.5 w-full" style={{background:s.color}}/>
                  <div className="p-7 text-center">
                    <motion.div
                      whileHover={{scale:1.2,rotate:8}} transition={{type:'spring',stiffness:300}}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white font-black text-sm mb-5"
                      style={{background:s.color,boxShadow:`0 4px 14px ${s.color}45`}}>
                      {s.num}
                    </motion.div>
                    <motion.div className="text-4xl mb-4"
                      animate={{y:[0,-7,0]}} transition={{duration:2.4,repeat:Infinity,ease:'easeInOut',delay:i*.5}}>
                      {s.icon}
                    </motion.div>
                    <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FILIÈRES ─── */}
      <section id="filieres" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <motion.span
                whileInView={{scale:[.9,1.05,1]}} transition={{duration:.5}} viewport={{once:true}}
                className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <motion.span animate={{rotate:[0,360]}} transition={{duration:4,repeat:Infinity,ease:'linear'}}>
                  <Award className="w-3.5 h-3.5"/>
                </motion.span> Nos filières
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">5 filières, un seul objectif</h2>
              <p className="text-slate-500 text-lg">Des dizaines de métiers, une excellence reconnue.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FILIERES.map((f,i)=>(
                <motion.div key={i} variants={fadeUp} transition={{delay:i*.07}}
                  whileHover={{y:-6,scale:1.02,transition:{duration:.2}}}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-shadow cursor-default">
                  <motion.div className="h-1.5" style={{background:f.color}}
                    whileHover={{scaleX:1.05}} transition={{duration:.3}}/>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        animate={{y:[0,-5,0],rotate:[0,3,-3,0]}}
                        transition={{duration:2.8,repeat:Infinity,ease:'easeInOut',delay:i*.35}}
                        whileHover={{scale:1.2,rotate:10}}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{background:`${f.color}12`,border:`1px solid ${f.color}22`}}>
                        {f.emoji}
                      </motion.div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{color:f.color,background:`${f.color}12`}}>{f.code}</span>
                        <div className="font-bold text-slate-900 text-sm mt-1 leading-tight">{f.nom}</div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.debouches.split(' · ').map((d,j)=>(
                        <motion.span key={j} whileHover={{scale:1.07}} transition={{type:'spring',stiffness:300}}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-default"
                          style={{background:`${f.color}10`,color:f.color}}>{d}</motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Et bien plus */}
              <motion.div variants={fadeUp} transition={{delay:.42}}
                whileHover={{y:-6,scale:1.02,transition:{duration:.2}}}
                className="bg-blue-600 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:bg-blue-700 transition-colors">
                <div>
                  <motion.div className="text-4xl mb-4"
                    animate={{y:[0,-6,0],rotate:[0,5,-5,0]}} transition={{duration:3.2,repeat:Infinity,ease:'easeInOut'}}>
                    🎓
                  </motion.div>
                  <div className="font-black text-white text-xl mb-2">Et bien plus encore</div>
                  <p className="text-blue-100 text-sm leading-relaxed">Master, Licence Pro, formations certifiantes et programmes courts disponibles.</p>
                </div>
                <motion.div whileHover={{x:4}} transition={{type:'spring',stiffness:300}}>
                  <Link to="/rejoindre"
                    className="mt-5 inline-flex items-center gap-2 bg-white/25 hover:bg-white/35 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    En savoir plus <ArrowRight className="w-4 h-4"/>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ÉQUIPE ORBIT ─── */}
      <section id="equipe" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <motion.span
                whileInView={{scale:[.9,1.05,1]}} transition={{duration:.5}} viewport={{once:true}}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <Users className="w-3.5 h-3.5"/> L'équipe
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Notre équipe & Corps professoral</h2>
              <p className="text-slate-500 text-lg">Administration au centre · Professeurs en orbite externe</p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex justify-center overflow-x-auto pb-4">
              <TeamOrbit/>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── PARTENAIRES ─── */}
      <section id="partenaires" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true}} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Partenaires & Accréditations</p>
              <h2 className="text-2xl font-black text-slate-900">Reconnus par les meilleures institutions</h2>
            </motion.div>
            {/* Carrousel horizontal infini */}
            <motion.div variants={fadeUp} className="relative overflow-hidden">
              <style>{`
                @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
                .marquee-track { animation: marquee 22s linear infinite; display:flex; width:max-content; }
                .marquee-track:hover { animation-play-state: paused; }
              `}</style>
              <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{background:'linear-gradient(to right,white,transparent)'}}/>
              <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{background:'linear-gradient(to left,white,transparent)'}}/>
              <div className="marquee-track">
                {[...PARTENAIRES,...PARTENAIRES].map((p,i)=>(
                  <div key={i} className="shrink-0 flex items-center justify-center w-44 h-20 rounded-xl border border-slate-100 bg-white px-5 shadow-sm mx-2.5 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer">
                    <img src={p.src} alt={p.alt} className="max-h-10 w-auto max-w-[110px] object-contain"/>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── POURQUOI ÉVALUER ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{once:true,margin:'-60px'}} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <motion.span
                whileInView={{scale:[.9,1.05,1]}} transition={{duration:.5}} viewport={{once:true}}
                className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <motion.span animate={{rotate:[0,20,-20,0]}} transition={{duration:1.8,repeat:Infinity,ease:'easeInOut'}}>
                  <Star className="w-3.5 h-3.5"/>
                </motion.span> Pourquoi évaluer
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Ton avis change tout</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Un impact réel sur la qualité de ta formation chaque année.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVANTAGES.map((c,i)=>(
                <motion.div key={i} variants={fadeUp} transition={{delay:i*.07}}
                  whileHover={{y:-6,scale:1.02,transition:{duration:.2}}}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <motion.div
                    whileHover={{scale:1.18,rotate:8}} transition={{type:'spring',stiffness:300,damping:14}}
                    animate={{y:[0,-4,0]}} transition={{duration:2.6,repeat:Infinity,ease:'easeInOut',delay:i*.3}}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{background:`${c.col}12`,border:`1px solid ${c.col}22`}}>
                    <c.icon className="w-6 h-6" style={{color:c.col}}/>
                  </motion.div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{c.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <motion.footer initial="hidden" whileInView="show" viewport={{once:true,margin:'-40px'}} variants={stagger}
        className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <motion.div whileHover={{scale:1.03}} className="flex items-center gap-3 mb-5 w-fit">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <img src="/isi-logo.png" alt="ISI" className="w-7 h-7 object-contain"/>
                </div>
                <div>
                  <div className="font-black text-white">ISI / SUPTECH</div>
                  <div className="text-slate-400 text-xs tracking-widest">Excellence · Innovation</div>
                </div>
              </motion.div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
                L'Institut Supérieur d'Informatique forme les talents technologiques du Sénégal depuis des décennies.
              </p>
              <div className="space-y-2.5">
                {[
                  {icon:MapPin, col:'text-blue-400',  text:'Sicap Liberté 3, N°1977 — Dakar, Sénégal'},
                  {icon:Phone,  col:'text-green-400', text:'+221 33 825 62 10'},
                  {icon:Mail,   col:'text-purple-400',text:'suptech@suptech.info'},
                ].map(({icon:Icon,col,text},i)=>(
                  <motion.div key={i} whileHover={{x:4}} transition={{type:'spring',stiffness:300}}
                    className="flex items-start gap-2.5 text-slate-400 text-xs cursor-default">
                    <Icon className={`w-3.5 h-3.5 ${col} mt-0.5 shrink-0`}/>
                    {text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {FOOTER_LINKS.map((col,i)=>(
              <motion.div key={i} variants={fadeUp} transition={{delay:i*.08}}>
                <div className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.items.map((item,j)=>(
                    <motion.li key={j} whileHover={{x:5}} transition={{type:'spring',stiffness:300}}>
                      <Link to={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">{item.l}</Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp}
            className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} ISI / SUPTECH — Tous droits réservés</span>
            <div className="flex items-center gap-4">
              {['3FPT','AWS Academy','Cisco','Huawei','CAMES','ANAQ'].map(n=>(
                <motion.span key={n} whileHover={{color:'#94a3b8'}} className="text-slate-600 cursor-default">{n}</motion.span>
              ))}
            </div>
            <span>Développé par <strong className="text-blue-400">MULTI BRAIN TECH</strong></span>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
