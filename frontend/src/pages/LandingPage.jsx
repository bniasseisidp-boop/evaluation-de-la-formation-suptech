import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Star, CheckCircle, ArrowRight,
  BarChart3, Shield, Users, BookOpen, Zap, Heart,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const fade   = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const STATS = [
  { value: '57',  label: 'Professeurs',     icon: '👨‍🏫' },
  { value: '18',  label: 'Classes actives', icon: '🏫' },
  { value: '5',   label: 'Filières',        icon: '📚' },
  { value: '100%',label: 'Anonyme',         icon: '🔒' },
];

const STEPS = [
  {
    num: '1',
    icon: '🔗',
    title: 'Accède au lien de ta classe',
    desc: "L'administration t'envoie un lien unique pour ta classe. Clique dessus et crée ton compte en 30 secondes.",
  },
  {
    num: '2',
    icon: '⭐',
    title: 'Évalue tes professeurs',
    desc: 'Pour chaque matière, réponds à 10 questions courtes sur l\'enseignement. C\'est rapide, anonyme et utile.',
  },
  {
    num: '3',
    icon: '📊',
    title: 'Les profs reçoivent leurs résultats',
    desc: 'L\'administration analyse les résultats et envoie un rapport détaillé à chaque professeur pour améliorer la qualité.',
  },
];

const FILIERES = [
  { code: 'FC',   nom: 'Comptabilité Finance',            color: '#f97316', emoji: '💼' },
  { code: 'IAGE', nom: 'Informatique Appliquée & Gestion',color: '#3b82f6', emoji: '💻' },
  { code: 'RI',   nom: 'Réseaux Informatiques',           color: '#06b6d4', emoji: '🌐' },
  { code: 'GL',   nom: 'Génie Logiciel',                  color: '#22c55e', emoji: '⚙️' },
  { code: 'BT',   nom: 'Brevet Technicien',               color: '#a855f7', emoji: '🔧' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/portail', { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-slate-900 text-sm leading-tight">ISI SUPTECH</div>
              <div className="text-blue-600 text-[10px] font-semibold uppercase tracking-widest">Évaluation</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/rejoindre"
              className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block">
              Je suis étudiant
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              Connexion <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
            <motion.div variants={fade}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Plateforme officielle ISI / SUPTECH — Dakar
            </motion.div>

            <motion.h1 variants={fade} className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Ton avis améliore<br />
              <span className="text-yellow-300">la qualité</span><br />
              de ta formation
            </motion.h1>

            <motion.p variants={fade} className="text-blue-100 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Évalue tes professeurs de manière <strong className="text-white">anonyme</strong> et aide ISI SUPTECH
              à offrir le meilleur enseignement possible.
            </motion.p>

            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4">
              <Link to="/rejoindre"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                <GraduationCap className="w-5 h-5" /> Je suis étudiant — S'inscrire
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 bg-blue-500/40 hover:bg-blue-500/60 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all">
                Espace Administrateur
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Vague de séparation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
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
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                Comment ça marche ?
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                En 3 étapes simples, contribue à améliorer la qualité des cours.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <motion.div key={i} variants={fade}
                  className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                      {s.num}
                    </div>
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

      {/* ── FILIÈRES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                Nos filières
              </h2>
              <p className="text-slate-500 text-lg">
                5 filières, des dizaines de métiers, une seule ambition : l'excellence.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FILIERES.map((f, i) => (
                <motion.div key={i} variants={fade}
                  className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition-all">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                    style={{ backgroundColor: f.color + '22', border: `2px solid ${f.color}33` }}>
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

      {/* ── POURQUOI ÉVALUER ── */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                Pourquoi évaluer tes profs ?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto">
                Ton avis a un impact réel sur la qualité de ta formation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <Heart className="w-6 h-6" />, title: 'Tu améliores ta formation', desc: "Tes retours permettent à l'école d'identifier ce qui fonctionne et ce qui doit changer." },
                { icon: <Shield className="w-6 h-6" />, title: 'C\'est 100% anonyme', desc: 'Ton identité n\'est jamais révélée. Tu peux t\'exprimer librement et honnêtement.' },
                { icon: <BarChart3 className="w-6 h-6" />, title: 'Les profs s\'améliorent', desc: 'Chaque professeur reçoit un rapport détaillé et peut ajuster son enseignement.' },
                { icon: <Zap className="w-6 h-6" />, title: 'Rapide et simple', desc: '10 questions par matière. Moins de 5 minutes par prof. C\'est tout.' },
                { icon: <CheckCircle className="w-6 h-6" />, title: 'Suivi en temps réel', desc: "Vois quelles matières tu as déjà évaluées depuis ton tableau de bord étudiant." },
                { icon: <Star className="w-6 h-6" />, title: 'Qualité ISI SUPTECH', desc: "ISI s'engage à agir sur tes retours pour maintenir un enseignement de qualité." },
              ].map((c, i) => (
                <motion.div key={i} variants={fade}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">
                    {c.icon}
                  </div>
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
            <motion.div variants={fade} className="text-6xl mb-6">🎓</motion.div>
            <motion.h2 variants={fade} className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Prêt à faire entendre ta voix ?
            </motion.h2>
            <motion.p variants={fade} className="text-slate-500 text-lg mb-8">
              Rejoins des centaines d'étudiants ISI SUPTECH qui participent chaque année à l'amélioration de la formation.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/rejoindre"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                <GraduationCap className="w-5 h-5" /> S'inscrire maintenant
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 font-semibold px-8 py-4 rounded-2xl text-base transition-all">
                Déjà inscrit ? Connexion
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">ISI / SUPTECH</div>
                <div className="text-xs">Adresse Sicap Liberté 3 N°1977 — Dakar</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 text-xs">
              <span>📧 suptech@suptech.info &nbsp;|&nbsp; 📞 00221 33 825 62 10</span>
              <span>Développé par <strong className="text-blue-400">MULTI BRAIN TECH</strong></span>
            </div>
            <div className="flex gap-4 text-xs">
              <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
              <Link to="/rejoindre" className="hover:text-white transition-colors">S'inscrire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
