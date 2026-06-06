import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i, size: Math.random() * 6 + 3,
  left: Math.random() * 100, delay: Math.random() * 8,
  dur: Math.random() * 8 + 8,
}));

const FEATURES = [
  { icon: '📊', title: 'Évaluation complète', desc: 'Évaluez vos enseignants, la qualité des services et la formation globale via des questionnaires interactifs.' },
  { icon: '🤖', title: 'IA Assistant', desc: 'Notre IA SUPTECH vous guide vocalement et par écrit à chaque étape de votre évaluation.' },
  { icon: '📈', title: 'Tableaux de bord', desc: 'Visualisez les résultats en temps réel avec des graphiques et statistiques détaillés par filière.' },
  { icon: '📄', title: 'Export PDF', desc: 'Générez des rapports professionnels en PDF pour chaque classe ou filière en un clic.' },
  { icon: '🔒', title: 'Sécurisé', desc: 'Accès uniquement via invitation par email avec mot de passe personnel. Données protégées.' },
  { icon: '📱', title: 'Mobile First', desc: 'Interface optimisée pour mobile avec une expérience fluide sur tous les appareils.' },
];

const STATS = [
  { number: '500+', label: 'Étudiants évalués', icon: '👨‍🎓' },
  { number: '50+', label: 'Professeurs notés', icon: '👩‍🏫' },
  { number: '12', label: 'Filières couvertes', icon: '🎓' },
  { number: '98%', label: 'Taux de satisfaction', icon: '⭐' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [activeFeature, setActiveFeature] = useState(0);
  const [typed, setTyped] = useState('');
  const fullText = 'Bienvenue sur la plateforme d\'évaluation ISI / SUPTECH';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleAccess = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/portail');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map(p => (
          <div key={p.id} className="absolute rounded-full bg-blue-400/20"
            style={{
              width: p.size, height: p.size, left: `${p.left}%`,
              animation: `particle-float ${p.dur}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 glass-dark border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ISI SUPTECH" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-bold text-white text-sm leading-tight">ISI / SUPTECH</div>
              <div className="text-blue-300 text-xs">Évaluation des Formations</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-400">Codé par</span>
            <span className="hidden sm:block text-xs font-bold text-blue-400 border border-blue-400/30 px-2 py-1 rounded-full">MULTI BRAIN TECH</span>
            <button onClick={handleAccess}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25">
              {isAuthenticated ? 'Mon espace' : 'Se connecter'}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ y, opacity }} className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-spin-slow" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}
            className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <img src="/logo.png" alt="ISI" className="relative h-28 w-auto object-contain animate-float drop-shadow-2xl" />
            </div>
          </motion.div>

          <div className="h-20 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              <span className="gradient-text">{typed}</span>
              <span className="animate-pulse text-blue-400">|</span>
            </h1>
          </div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            Une plateforme intelligente pour évaluer la qualité des enseignements, des services et des formations
            à <strong className="text-white">ISI / SUPTECH</strong> — École d'excellence en informatique à Dakar, Sénégal.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={handleAccess}
              className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden">
              <span className="relative z-10">
                {isAuthenticated ? '🚀 Accéder à mon espace' : '🎓 Commencer l\'évaluation'}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all duration-200">
              📖 En savoir plus
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 + i * 0.15 }}
                className="glass rounded-2xl p-5 text-center card-hover">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black gradient-text">{s.number}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
            className="mt-12 animate-bounce cursor-pointer" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="w-8 h-12 mx-auto border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Fonctionnalités</span>
            </h2>
            <p className="text-slate-400 text-xl">Tout ce dont vous avez besoin pour une évaluation efficace</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setActiveFeature(i)}
                className={`glass rounded-2xl p-6 card-hover cursor-default border transition-all duration-300 ${activeFeature === i ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10'}`}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About ISI */}
      <section className="py-24 bg-gradient-to-br from-blue-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-300 text-sm font-semibold">École d'excellence</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                ISI / SUPTECH<br />
                <span className="gradient-text">Dakar, Sénégal</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                <strong className="text-white">ISI / SUPTECH</strong> est une école d'informatique de référence à Dakar,
                formant les meilleurs ingénieurs, développeurs et experts en technologies numériques de demain.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Avec des filières allant du BT Informatique au Master en Génie Logiciel, IA et Réseaux,
                notre mission est de former des profils compétitifs sur le marché africain et international.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Génie Logiciel','IA & Data','Réseaux','BT Informatique','Formation Continue'].map(tag => (
                  <span key={tag} className="glass border border-white/20 text-white text-sm px-4 py-2 rounded-full">{tag}</span>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-3xl blur-2xl scale-110" />
                <div className="relative glass border border-white/20 rounded-3xl p-10 text-center">
                  <img src="/logo.png" alt="ISI" className="h-40 w-auto object-contain mx-auto mb-6 drop-shadow-2xl" />
                  <div className="text-2xl font-black text-white">ISI / SUPTECH</div>
                  <div className="text-blue-300 text-sm mt-1">Institut Supérieur d'Informatique</div>
                  <div className="mt-6 text-slate-400 text-sm">🌍 Dakar, Sénégal</div>
                  <div className="mt-2 text-slate-400 text-sm">💻 Formation en Informatique</div>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="text-xs text-slate-500">Développé par</div>
                    <div className="text-blue-400 font-bold">MULTI BRAIN TECH</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-950 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Prêt à commencer<br />
              <span className="gradient-text">votre évaluation ?</span>
            </h2>
            <p className="text-slate-400 text-xl mb-10">Connectez-vous avec vos identifiants envoyés par email.</p>
            <button onClick={handleAccess}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
              🚀 {isAuthenticated ? 'Accéder à mon espace' : 'Se connecter maintenant'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ISI" className="h-10 w-auto object-contain" />
            <div>
              <div className="text-white font-bold text-sm">ISI / SUPTECH</div>
              <div className="text-slate-400 text-xs">© {new Date().getFullYear()} — Dakar, Sénégal</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs">Plateforme d'évaluation des formations</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Développé par</div>
            <div className="text-blue-400 font-bold text-sm">MULTI BRAIN TECH</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
