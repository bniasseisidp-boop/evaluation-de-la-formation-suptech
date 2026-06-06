import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, ChevronDown, ChevronUp, BookOpen, Shield, Star } from 'lucide-react';
import { evaluationAPI } from '../../services/api';

const SCORE_LABEL = { A: '50%', B: '75%', C: '100%' };
const SCORE_COLOR = { A: 'text-red-600 bg-red-50', B: 'text-yellow-600 bg-yellow-50', C: 'text-green-600 bg-green-50' };
const QUESTIONS_LABELS = [
  'Grandes lignes du programme', 'Suit le programme', 'Travail à la maison',
  'Compréhension des enseignements', 'Répond aux questions', 'Ponctualité',
  'Atteinte des objectifs', 'Utilisation du temps', 'Corrélation filière', 'Satisfaction générale',
];

export default function MesEvaluations() {
  const [enseignement, setEnseignement] = useState([]);
  const [qualite, setQualite] = useState(null);
  const [formation, setFormation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    Promise.all([
      evaluationAPI.myEnseignement(),
      evaluationAPI.myQualite(),
      evaluationAPI.myFormation(),
    ]).then(([e, q, f]) => {
      setEnseignement(e.data);
      setQualite(q.data);
      setFormation(f.data);
    }).finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-slate-800">Mes Évaluations</h1>
        <p className="text-slate-500 text-sm mt-1">Historique de toutes vos évaluations soumises (lecture seule).</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Enseignements', count: enseignement.length, color: 'blue' },
          { icon: Shield, label: 'Qualité service', count: qualite ? 1 : 0, color: 'cyan' },
          { icon: Star, label: 'Formation', count: formation.length, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
            <s.icon className={`w-6 h-6 text-${s.color}-500 mx-auto mb-2`} />
            <div className={`text-2xl font-black text-${s.color}-600`}>{s.count}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Enseignement evals */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />Évaluations des Enseignements
        </h2>
        {enseignement.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
            <p className="text-slate-400 text-sm">Aucune évaluation d'enseignement soumise.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enseignement.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <button onClick={() => toggleExpand(e.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">📘</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm">{e.cmp?.matiere?.nom}</div>
                    <div className="text-slate-400 text-xs">{e.cmp?.professeur?.prenom} {e.cmp?.professeur?.nom}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${e.score_total >= 75 ? 'text-green-700 bg-green-100' : e.score_total >= 50 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'}`}>
                      {e.score_total}%
                    </span>
                    {expanded[e.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expanded[e.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 px-4 pb-4 overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {QUESTIONS_LABELS.map((label, qi) => {
                          const qKey = `q${qi + 1}`;
                          const val = e[qKey];
                          return (
                            <div key={qi} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-xs">
                              <span className="text-slate-600 truncate mr-2">{label}</span>
                              <span className={`font-bold px-2 py-0.5 rounded ${val ? SCORE_COLOR[val] : 'text-slate-400'}`}>{val ? `${val} (${SCORE_LABEL[val]})` : '—'}</span>
                            </div>
                          );
                        })}
                      </div>
                      {e.commentaire && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3 text-xs text-slate-600">
                          <strong className="text-blue-700">💬 Commentaire :</strong> {e.commentaire}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-2">
                        Soumis le {new Date(e.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Qualite eval */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />Évaluation Qualité de Service
        </h2>
        {!qualite ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
            <p className="text-slate-400 text-sm">Non encore rempli.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-bold text-slate-800">Questionnaire soumis</span>
              <span className="ml-auto text-xs text-slate-400">{new Date(qualite.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries({
                secretariat: 'Secrétariat', direction: 'Direction', direction_etudes: 'Direction des études',
                documentation: 'Documentation', salle_pratique: 'Salle pratique', connexion: 'Connexion',
                securite: 'Sécurité', toilettes: 'Toilettes', restaurant: 'Restaurant', cadre_general: 'Cadre général',
              }).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-blue-600 capitalize">{qualite[k]?.replace(/_/g,' ') || '—'}</span>
                </div>
              ))}
            </div>
            {qualite.recommande !== null && (
              <div className="mt-3 text-sm">
                <span className="text-slate-600">Recommande ISI SUPTECH : </span>
                <span className={`font-bold ${qualite.recommande ? 'text-green-600' : 'text-red-600'}`}>{qualite.recommande ? 'OUI ✅' : 'NON ❌'}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Formation evals */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-500" />Évaluations de Formation
        </h2>
        {formation.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
            <p className="text-slate-400 text-sm">Aucune évaluation de formation soumise.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formation.map((f, i) => (
              <div key={f.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-slate-800 text-sm">Évaluation formation — {new Date(f.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Motivation', f.score_motivation],
                    ['Objectifs clairs', f.score_objectifs],
                    ['Contenu adapté', f.score_contenu],
                    ['Techniques enseignement', f.score_techniques],
                    ['Exercices pertinents', f.score_exercices],
                    ['Communication formateur', f.score_formateur_comm],
                    ['Rythme respecté', f.score_formateur_rythme],
                  ].map(([label, score]) => score && (
                    <div key={label} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-600">{label}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= score ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
