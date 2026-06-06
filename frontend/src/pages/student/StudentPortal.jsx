import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChevronRight, Star, BookOpen, Shield, Award, User } from 'lucide-react';
import { studentAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const SCORE_COLOR = (s) => {
  if (s >= 75) return 'text-green-600 bg-green-50 border-green-200';
  if (s >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export default function StudentPortal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    studentAPI.dashboard().then(r => setData(r.data)).catch(() => toast.error('Erreur de chargement')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Chargement...</p>
      </div>
    </div>
  );

  const { stats, matieres_a_evaluer = [], matieres_evaluees = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-800 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl animate-wave">👋</span>
              <span className="text-blue-200 text-sm">Bienvenue de retour</span>
            </div>
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {user?.filiere && <span className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs font-medium">📚 {user.filiere.nom}</span>}
              {user?.classe && <span className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs font-medium">🏫 {user.classe.nom}</span>}
            </div>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed">
              Votre participation améliore la qualité des enseignements. Merci de remplir vos évaluations !
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            🎓
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Matières à évaluer', value: stats?.total_matieres - stats?.matieres_evaluees, color: 'blue', suffix: '' },
          { icon: CheckCircle, label: 'Évaluations faites', value: stats?.matieres_evaluees, color: 'green', suffix: '' },
          { icon: Shield, label: 'Qualité service', value: stats?.eval_qualite_done ? '✓' : '○', color: stats?.eval_qualite_done ? 'green' : 'slate', suffix: '' },
          { icon: Star, label: 'Éval. formation', value: stats?.eval_formation_count, color: 'purple', suffix: '' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm card-hover">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div className={`text-2xl font-black text-${s.color}-600`}>{s.value}{s.suffix}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress bar */}
      {stats?.total_matieres > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-700 font-semibold text-sm">Progression des évaluations</span>
            <span className="text-blue-600 font-bold text-sm">{stats.matieres_evaluees}/{stats.total_matieres} matières</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.matieres_evaluees / stats.total_matieres) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {Math.round((stats.matieres_evaluees / stats.total_matieres) * 100)}% complété
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/portail/qualite')}
          className={`bg-white rounded-xl border p-5 text-left card-hover transition-all group ${stats?.eval_qualite_done ? 'border-green-200 bg-green-50' : 'border-slate-100 hover:border-blue-300'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stats?.eval_qualite_done ? 'bg-green-100' : 'bg-blue-50'}`}>
              {stats?.eval_qualite_done ? '✅' : '🏫'}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-sm">Qualité de service</div>
              <div className={`text-xs mt-0.5 ${stats?.eval_qualite_done ? 'text-green-600' : 'text-slate-400'}`}>
                {stats?.eval_qualite_done ? 'Complété ✓' : 'Non rempli — Évaluez les services ISI'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </button>

        <button onClick={() => navigate('/portail/formation')}
          className="bg-white rounded-xl border border-slate-100 p-5 text-left card-hover hover:border-purple-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">📋</div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-sm">Évaluation formation</div>
              <div className="text-slate-400 text-xs mt-0.5">{stats?.eval_formation_count > 0 ? `${stats.eval_formation_count} évaluation(s) soumise(s)` : 'Évaluez la formation globale'}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
        </button>
      </motion.div>

      {/* Matieres to evaluate */}
      {matieres_a_evaluer.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Matières à évaluer <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1">{matieres_a_evaluer.length}</span>
          </h2>
          <div className="space-y-3">
            {matieres_a_evaluer.map((cmp, i) => (
              <motion.button key={cmp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => navigate(`/portail/evaluer/${cmp.id}`)}
                className="w-full bg-white rounded-xl border border-slate-100 hover:border-blue-400 hover:shadow-md p-4 text-left transition-all group card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-xl flex-shrink-0">📘</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{cmp.matiere?.nom}</div>
                    <div className="text-slate-400 text-xs mt-0.5">Prof : {cmp.professeur?.prenom} {cmp.professeur?.nom}</div>
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

      {/* Already evaluated */}
      {matieres_evaluees.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Matières évaluées <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full ml-1">{matieres_evaluees.length}</span>
          </h2>
          <div className="space-y-2">
            {matieres_evaluees.map((cmp, i) => (
              <motion.div key={cmp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="w-full bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">✅</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-600 text-sm truncate">{cmp.matiere?.nom}</div>
                  <div className="text-slate-400 text-xs mt-0.5">Prof : {cmp.professeur?.prenom} {cmp.professeur?.nom}</div>
                </div>
                <span className="text-xs text-green-600 font-semibold">Soumis ✓</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {matieres_a_evaluer.length === 0 && matieres_evaluees.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-slate-600 font-semibold mb-2">Aucune matière trouvée</h3>
          <p className="text-slate-400 text-sm">L'administration n'a pas encore configuré les matières pour votre classe.</p>
        </motion.div>
      )}
    </div>
  );
}
