import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, X, ChevronDown, ChevronUp, BookOpen, Shield, Star } from 'lucide-react';
import { adminAPI, filiereAPI, classeAPI } from '../../services/api';
import toast from 'react-hot-toast';

function StatBadge({ count, label, color }) {
  const colors = { blue: 'bg-blue-500/20 text-blue-300', cyan: 'bg-cyan-500/20 text-cyan-300', purple: 'bg-purple-500/20 text-purple-300' };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors[color]}`}>
      <span className="font-bold text-sm">{count}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function StudentDetail({ student, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.studentDetail(student.id).then(r => setDetail(r.data)).finally(() => setLoading(false));
  }, [student.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black">
              {student.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-white font-bold">{student.name}</div>
              <div className="text-slate-400 text-xs">{student.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
        ) : detail && (
          <div className="p-6 space-y-5">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Filière</div>
                <div className="text-white font-medium">{detail.filiere?.nom || '—'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Classe</div>
                <div className="text-white font-medium">{detail.classe?.nom || '—'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Matricule</div>
                <div className="text-white font-mono">{detail.matricule || '—'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Statut</div>
                <div className={`font-medium ${detail.is_active ? 'text-green-400' : 'text-red-400'}`}>{detail.is_active ? '✅ Actif' : '❌ Inactif'}</div>
              </div>
            </div>

            {/* Eval stats */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3">📊 Statistiques d'évaluation</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BookOpen, label: 'Enseignement', count: detail.evaluations_enseignement_count || 0, color: 'blue' },
                  { icon: Shield, label: 'Qualité', count: detail.evaluations_qualite_count || 0, color: 'cyan' },
                  { icon: Star, label: 'Formation', count: detail.evaluations_formation_count || 0, color: 'purple' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                    <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color === 'blue' ? 'text-blue-400' : s.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <div className={`text-2xl font-black ${s.color === 'blue' ? 'text-blue-400' : s.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>{s.count}</div>
                    <div className="text-slate-400 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluations enseignement list */}
            {detail.evaluations_enseignement?.length > 0 && (
              <div>
                <h4 className="text-white font-bold text-sm mb-3">📘 Évaluations Enseignement</h4>
                <div className="space-y-2">
                  {detail.evaluations_enseignement.map(e => (
                    <div key={e.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{e.cmp?.matiere?.nom}</div>
                        <div className="text-slate-400 text-xs">{e.cmp?.professeur?.prenom} {e.cmp?.professeur?.nom}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${e.score_total >= 75 ? 'text-green-400 bg-green-400/10' : e.score_total >= 50 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>{e.score_total}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [selected, setSelected] = useState(null);

  const load = (params = {}) => {
    adminAPI.students(params).then(r => setStudents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([filiereAPI.list(), classeAPI.list()]).then(([f, c]) => { setFilieres(f.data); setClasses(c.data); });
    load();
  }, []);

  const handleFilter = () => {
    setLoading(true);
    load({ filiere_id: filterFiliere || undefined, classe_id: filterClasse || undefined, search: search || undefined });
  };

  useEffect(() => { handleFilter(); }, [filterFiliere, filterClasse]);

  const filteredClasses = filterFiliere ? classes.filter(c => c.filiere_id === parseInt(filterFiliere)) : classes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Étudiants</h1>
          <p className="text-slate-400 text-sm mt-1">{students.length} étudiant(s)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            placeholder="Nom ou email..."
            className="bg-slate-800 border border-white/10 text-slate-300 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-48" />
        </div>
        <select value={filterFiliere} onChange={e => { setFilterFiliere(e.target.value); setFilterClasse(''); }}
          className="bg-slate-800 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">Toutes les filières</option>
          {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)}
          className="bg-slate-800 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">Toutes les classes</option>
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <button onClick={handleFilter} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          Filtrer
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
      : students.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun étudiant trouvé.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                {['Étudiant', 'Filière / Classe', 'Éval. Ens.', 'Qualité', 'Formation', 'Statut', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs">{s.name}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[140px]">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-300 text-xs">{s.filiere?.nom || '—'}</div>
                    <div className="text-slate-500 text-xs">{s.classe?.nom || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/20 text-blue-300 font-bold text-xs px-2 py-1 rounded-lg">
                      {s.evaluation_stats?.enseignement || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-cyan-500/20 text-cyan-300 font-bold text-xs px-2 py-1 rounded-lg">
                      {s.evaluation_stats?.qualite || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-500/20 text-purple-300 font-bold text-xs px-2 py-1 rounded-lg">
                      {s.evaluation_stats?.formation || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {s.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(s)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">Détails →</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
