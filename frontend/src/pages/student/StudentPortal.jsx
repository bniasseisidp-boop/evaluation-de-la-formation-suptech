import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, ChevronRight, BookOpen, Shield, Star, RefreshCw } from 'lucide-react';
import { studentAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function StudentPortal() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    studentAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full" />
      <p className="text-slate-400 text-sm">Chargement de votre tableau de bord...</p>
    </div>
  );

  const { stats, matieres_a_evaluer = [], matieres_evaluees = [] } = data || {};
  const totalEv = (stats?.total_matieres || 0);
  const doneEv  = (stats?.matieres_evaluees || 0);
  const pct     = totalEv > 0 ? Math.round(doneEv / totalEv * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Welcome banner */}
      <motion.div variants={item}
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-800 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full bg-cyan-300 translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <motion.span animate={{ rotate: [0, 15, -10, 15, 0] }} transition={{ duration: 1, delay: 0.5 }}
                className="text-3xl inline-block">👋</motion.span>
              <span className="text-blue-200 text-sm">Bienvenue de retour</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {user?.filiere && (
                <span className="bg-white/20 border border-white/20 rounded-full px-3 py-1 text-xs font-medium">
                  📚 {user.filiere.nom}
                </span>
              )}
              {user?.classe && (
                <span className="bg-white/20 border border-white/20 rounded-full px-3 py-1 text-xs font-medium">
                  🏫 {user.classe.nom}
                </span>
              )}
            </div>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed">
              Votre participation améliore la qualité des enseignements. Merci de remplir vos évaluations !
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl flex-shrink-0">🎓</div>
            <button onClick={fetchData} title="Actualiser"
              className="text-blue-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,     label: 'À évaluer',       value: totalEv - doneEv, color: 'blue' },
          { icon: CheckCircle,  label: 'Évaluations faites', value: doneEv,         color: 'green' },
          { icon: Shield,       label: 'Qualité service',  value: stats?.eval_qualite_done ? '✓' : '○', color: stats?.eval_qualite_done ? 'green' : 'slate' },
          { icon: Star,         label: 'Éval. formation',  value: stats?.eval_formation_count || 0, color: 'purple' },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 300 }}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm cursor-default">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div className={`text-2xl font-black text-${s.color}-600`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress bar */}
      {totalEv > 0 && (
        <motion.div variants={item}
          className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-700 font-semibold text-sm">Progression des évaluations</span>
            <span className="text-blue-600 font-bold text-sm">{doneEv}/{totalEv} matières</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full relative">
              {pct > 10 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">{pct}%</span>
              )}
            </motion.div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{pct}% complété</p>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/portail/qualite')}
          className={`bg-white rounded-xl border p-5 text-left transition-all group shadow-sm ${stats?.eval_qualite_done ? 'border-green-200 bg-green-50' : 'border-slate-100 hover:border-blue-300'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stats?.eval_qualite_done ? 'bg-green-100' : 'bg-blue-50'}`}>
              {stats?.eval_qualite_done ? '✅' : '🏫'}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-sm">Qualité de service</div>
              <div className={`text-xs mt-0.5 ${stats?.eval_qualite_done ? 'text-green-600' : 'text-slate-400'}`}>
                {stats?.eval_qualite_done ? 'Complété — Cliquez pour modifier ✓' : 'Non rempli — Évaluez les services ISI'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </motion.button>

        <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/portail/formation')}
          className="bg-white rounded-xl border border-slate-100 hover:border-purple-300 p-5 text-left shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📋</div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-sm">Évaluation formation</div>
              <div className="text-slate-400 text-xs mt-0.5">
                {stats?.eval_formation_count > 0 ? `${stats.eval_formation_count} évaluation(s) soumise(s)` : 'Évaluez la formation globale'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
        </motion.button>
      </motion.div>

      {/* Matières à évaluer */}
      <AnimatePresence>
        {matieres_a_evaluer.length > 0 && (
          <motion.div variants={item}>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Matières à évaluer
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1">{matieres_a_evaluer.length}</span>
            </h2>
            <div className="space-y-3">
              {matieres_a_evaluer.map((cmp, i) => (
                <motion.button key={cmp.id || i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/portail/evaluer/${cmp.id}`)}
                  className="w-full bg-white rounded-xl border border-slate-100 hover:border-blue-400 hover:shadow-md p-4 text-left transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-xl flex-shrink-0">📘</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{cmp.matiere?.nom}</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {cmp.professeur
                          ? `Prof : ${cmp.professeur.prenom} ${cmp.professeur.nom}`
                          : <span className="text-orange-500">Sans professeur assigné</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full font-medium">À évaluer</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matières évaluées */}
      <AnimatePresence>
        {matieres_evaluees.length > 0 && (
          <motion.div variants={item}>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Matières évaluées
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full ml-1">{matieres_evaluees.length}</span>
            </h2>
            <div className="space-y-2">
              {matieres_evaluees.map((cmp, i) => (
                <motion.div key={cmp.id || i}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-600 text-sm truncate">{cmp.matiere?.nom}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {cmp.professeur ? `${cmp.professeur.prenom} ${cmp.professeur.nom}` : 'Matière évaluée'}
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full border border-green-200">Soumis ✓</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* État vide */}
      {matieres_a_evaluer.length === 0 && matieres_evaluees.length === 0 && (
        <motion.div variants={item} className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-slate-700 font-bold mb-2">Aucune matière trouvée</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Aucune matière n'a encore été créée dans le système. Contactez l'administration.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
