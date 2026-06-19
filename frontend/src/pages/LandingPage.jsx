import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Star, CheckCircle, ArrowRight,
  BarChart3, Shield, Users, Zap, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const fade    = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };

/* ── Carousel ── */
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
        <motion.img key={idx}
          src={images[idx].src} alt={images[idx].alt || ''}
          initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.7 }}
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
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
  { src: '/images/admin/kara_directeur.jpg', nom: 'Directeur Général', titre: 'Direction ISI SUPTECH' },
  { src: '/images/admin/mbene-tall.jpg',     nom: 'Responsable Académique', titre: 'Scolarité & Programmes' },
  { src: '/images/admin/oumoukhairy.jpg',    nom: 'Coordinatrice', titre: 'Relations Étudiantes' },
  { src: '/images/admin/samba.jpg',          nom: 'Responsable Pédagogique', titre: 'Qualité & Évaluation' },
];

const MEMBRES_PROFS = [
  { src: '/images/membres/cisse.jpeg',    nom: 'M. CISSE',    specialite: 'Marketing' },
  { src: '/images/membres/junior.jpeg',   nom: 'M. JUNIOR',   specialite: 'Développement Web' },
  { src: '/images/membres/mr_robert.jpg', nom: 'M. ROBERT',   specialite: 'PHP & Analyse SGF' },
];

const STATS = [
  { value: '57',   label: 'Professeurs',     icon: '👨‍🏫' },
  { value: '18',   label: 'Classes actives', icon: '🏫' },
  { value: '5',    label: 'Filières',        icon: '📚' },
  { value: '100%', label: 'Anonyme',         icon: '🔒' },
];

const STEPS = [
  { num: '1', icon: '🔗', title: 'Accède au lien de ta classe', desc: "L'administration t'envoie un lien unique. Crée ton compte en 30 secondes." },
  { num: '2', icon: '⭐', title: 'Évalue tes professeurs', desc: '10 questions courtes par matière, anonymes, en moins de 3 minutes.' },
  { num: '3', icon: '📊', title: 'Les profs reçoivent leurs résultats', desc: 'Rapport PDF personnalisé envoyé directement à chaque enseignant.' },
];

const FILIERES = [
  { code: 'FC',   nom: 'Comptabilité Finance',             color: '#f97316', emoji: '💼' },
  { code: 'IAGE', nom: 'Informatique Appliquée & Gestion', color: '#3b82f6', emoji: '💻' },
  { code: 'RI',   nom: 'Réseaux Informatiques',            color: '#06b6d4', emoji: '🌐' },
  { code: 'GL',   nom: 'Génie Logiciel',                   color: '#22c55e', emoji: '⚙️' },
  { code: 'BT',   nom: 'Brevet Technicien',                color: '#a855f7', emoji: '🔧' },
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
            <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/rejoindre" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block">
              Je suis étudiant
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              Connexion <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO avec carousel en fond ── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        {/* Background carousel */}
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
              <span className="text-yellow-300">la qualité</span><br />
              de ta formation
            </motion.h1>

            <motion.p variants={fade} className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
              Évalue tes professeurs de manière <strong className="text-white">anonyme</strong> et aide ISI SUPTECH
              à maintenir un enseignement d'excellence.
            </motion.p>

            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4">
              <Link to="/rejoindre"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl hover:-translate-y-0.5">
                <GraduationCap className="w-5 h-5" /> Je suis étudiant
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all backdrop-blur-sm">
                Espace Administrateur
              </Link>
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
              <motion.div key={i} variants={fade}
                className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-blue-600 mb-1">{s.value}</div>
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
                  className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">{s.num}</div>
                    <span className="text-3xl">{s.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VIE À ISI SUPTECH (carousel photos) ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">La vie à ISI SUPTECH</h2>
              <p className="text-slate-500 text-lg">Formations pratiques, encadrement de qualité, avenir assuré.</p>
            </motion.div>
            <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VITRINES.map((v, i) => (
                <div key={i} className={`overflow-hidden rounded-2xl shadow-md ${i === 0 ? 'md:row-span-2' : ''}`}
                  style={{ height: i === 0 ? '420px' : '200px' }}>
                  <img src={v.src} alt={v.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FILIÈRES ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Nos filières</h2>
              <p className="text-slate-500 text-lg">5 filières, des dizaines de métiers, une seule ambition.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FILIERES.map((f, i) => (
                <motion.div key={i} variants={fade}
                  className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                    style={{ backgroundColor: f.color + '22', border: `2px solid ${f.color}44` }}>
                    {f.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{f.code}</div>
                    <div className="text-slate-500 text-sm">{f.nom}</div>
                  </div>
                </motion.div>
              ))}
              <motion.div variants={fade}
                className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl shrink-0">🎓</div>
                <div>
                  <div className="font-bold text-blue-800">Et bien plus</div>
                  <div className="text-blue-600 text-sm">Master, Licence, BT</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ÉQUIPE ADMINISTRATIVE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Notre équipe</h2>
              <p className="text-slate-500 text-lg">Des professionnels dédiés à votre réussite.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {TEAM_ADMIN.map((m, i) => (
                <motion.div key={i} variants={fade}
                  className="text-center group">
                  <div className="w-28 h-28 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md border-2 border-slate-100 group-hover:border-blue-300 transition-all group-hover:shadow-lg">
                    <img src={m.src} alt={m.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">{m.nom}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{m.titre}</div>
                </motion.div>
              ))}
            </div>
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
            <motion.div variants={fade}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {PARTENAIRES.map((p, i) => (
                <div key={i}
                  className="h-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                  <img src={p.src} alt={p.alt} className="h-full w-auto max-w-[120px] object-contain" />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── POURQUOI ÉVALUER ── */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">Pourquoi évaluer tes profs ?</h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto">Ton avis a un impact réel sur la qualité de ta formation.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <Heart className="w-6 h-6" />,      title: "Tu améliores ta formation",     desc: "Tes retours permettent d'identifier ce qui fonctionne et ce qui doit changer." },
                { icon: <Shield className="w-6 h-6" />,     title: "C'est 100% anonyme",            desc: "Ton identité n'est jamais révélée. Exprime-toi librement." },
                { icon: <BarChart3 className="w-6 h-6" />,  title: "Les profs s'améliorent",        desc: "Chaque professeur reçoit un rapport détaillé pour progresser." },
                { icon: <Zap className="w-6 h-6" />,        title: "Rapide et simple",              desc: "10 questions par matière, moins de 5 minutes par prof." },
                { icon: <CheckCircle className="w-6 h-6" />,title: "Suivi en temps réel",           desc: "Vois quelles matières tu as déjà évaluées depuis ton tableau de bord." },
                { icon: <Star className="w-6 h-6" />,       title: "Qualité ISI SUPTECH",           desc: "ISI s'engage à agir sur tes retours pour maintenir l'excellence." },
              ].map((c, i) => (
                <motion.div key={i} variants={fade}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">{c.icon}</div>
                  <h3 className="font-bold text-white mb-2">{c.title}</h3>
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
            <motion.div variants={fade}>
              <img src="/isi-logo.png" alt="ISI SUPTECH" className="h-16 w-auto mx-auto mb-6 object-contain" />
            </motion.div>
            <motion.h2 variants={fade} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Prêt à faire entendre ta voix ?
            </motion.h2>
            <motion.p variants={fade} className="text-slate-500 text-lg mb-8">
              Rejoins les étudiants ISI SUPTECH qui participent chaque année à l'amélioration de la formation.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/rejoindre"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl hover:-translate-y-0.5">
                <GraduationCap className="w-5 h-5" /> S'inscrire maintenant
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 font-semibold px-8 py-4 rounded-2xl transition-all">
                Déjà inscrit ? Connexion
              </Link>
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
              <Link to="/login"    className="hover:text-white transition-colors">Connexion</Link>
              <Link to="/rejoindre" className="hover:text-white transition-colors">S'inscrire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
