import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, X, BookOpen, Shield, Star, Mail, GraduationCap, Hash, Calendar, MessageSquare, CheckCircle, Trash2, FileDown } from 'lucide-react';
import { adminAPI, filiereAPI, classeAPI } from '../../services/api';
import toast from 'react-hot-toast';

function StudentDetail({ student, onClose, onDelete }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement l'étudiant "${student.name}" et toutes ses évaluations ?`)) return;
    setDeleting(true);
    try {
      await adminAPI.studentDelete(student.id);
      toast.success('Étudiant supprimé');
      onClose();
      onDelete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  useEffect(() => {
    adminAPI.studentDetail(student.id)
      .then(r => setDetail(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [student.id]);

  const s = detail?.student || student;
  const evalEns  = detail?.evaluations_enseignement  || [];
  const evalForm = detail?.evaluations_formation      || [];
  const evalQual = detail?.evaluation_qualite;

  const initials = s?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 font-bold text-lg truncate">{s?.name}</div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s?.email}</span>
            </div>
            <div className="mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s?.is_active ? '✓ Compte actif' : '✗ Compte inactif'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => { toast.promise(adminAPI.exportStudent(s.id, s.name), { loading: 'Génération PDF...', success: 'PDF téléchargé !', error: 'Erreur PDF' }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
              <FileDown className="w-3.5 h-3.5" />PDF
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />Supprimer
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5">
          {[['info','Informations'],['evals','Évaluations']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {label}
              {key === 'evals' && evalEns.length > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">{evalEns.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'info' && (
                <div className="p-5 space-y-5">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />Filière
                      </div>
                      <div className="text-slate-900 font-semibold text-sm">{s?.filiere?.nom || '—'}</div>
                      {s?.filiere?.code && <div className="text-slate-400 text-xs mt-0.5">{s.filiere.code}</div>}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />Classe
                      </div>
                      <div className="text-slate-900 font-semibold text-sm">{s?.classe?.nom || '—'}</div>
                      {s?.classe?.niveau && <div className="text-slate-400 text-xs mt-0.5">{s.classe.niveau}</div>}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
                        <Hash className="w-3.5 h-3.5" />Matricule
                      </div>
                      <div className="text-slate-900 font-semibold text-sm font-mono">{s?.matricule || '—'}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
                        <Calendar className="w-3.5 h-3.5" />Inscrit le
                      </div>
                      <div className="text-slate-900 font-semibold text-sm">
                        {s?.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Eval stats */}
                  <div>
                    <h4 className="text-slate-700 font-bold text-sm mb-3">Statistiques d'évaluation</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: BookOpen,  label: 'Enseignement', count: evalEns.length,     bg: 'bg-blue-50',   icon_c: 'text-blue-600',   val_c: 'text-blue-700' },
                        { icon: Shield,    label: 'Qualité',       count: evalQual ? 1 : 0,  bg: 'bg-cyan-50',   icon_c: 'text-cyan-600',   val_c: 'text-cyan-700' },
                        { icon: Star,      label: 'Formation',     count: evalForm.length,    bg: 'bg-purple-50', icon_c: 'text-purple-600', val_c: 'text-purple-700' },
                      ].map((st, i) => (
                        <div key={i} className={`${st.bg} rounded-xl p-4 text-center border border-white`}>
                          <st.icon className={`w-5 h-5 mx-auto mb-1.5 ${st.icon_c}`} />
                          <div className={`text-2xl font-black ${st.val_c}`}>{st.count}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{st.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score moyen si évals dispo */}
                  {evalEns.length > 0 && (() => {
                    const scores = evalEns.map(e => e.score_total).filter(Boolean);
                    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
                    return avg ? (
                      <div className={`rounded-xl p-4 text-center border ${parseFloat(avg) >= 75 ? 'bg-green-50 border-green-100' : parseFloat(avg) >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`text-3xl font-black ${parseFloat(avg) >= 75 ? 'text-green-700' : parseFloat(avg) >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{avg}%</div>
                        <div className="text-slate-500 text-xs mt-1">Score moyen sur {scores.length} évaluation(s)</div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {tab === 'evals' && (
                <div className="p-5 space-y-4">
                  {evalEns.length === 0 && evalForm.length === 0 && !evalQual ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Aucune évaluation soumise pour l'instant.</p>
                    </div>
                  ) : (
                    <>
                      {/* Évaluations enseignement */}
                      {evalEns.length > 0 && (
                        <div>
                          <h4 className="text-slate-700 font-bold text-sm mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />Évaluations Enseignement ({evalEns.length})
                          </h4>
                          <div className="space-y-2">
                            {evalEns.map((e, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <span className="text-slate-900 text-xs font-semibold">{e.matiere?.nom || e.cmp?.matiere?.nom || '—'}</span>
                                    <span className="text-slate-400 text-xs ml-2">{e.cmp?.professeur ? `• ${e.cmp.professeur.prenom} ${e.cmp.professeur.nom}` : ''}</span>
                                  </div>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${e.score_total >= 75 ? 'text-green-700 bg-green-100' : e.score_total >= 50 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'}`}>
                                    {e.score_total}%
                                  </span>
                                </div>
                                {e.commentaire && (
                                  <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200">
                                    <MessageSquare className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-600 text-xs italic">"{e.commentaire}"</p>
                                  </div>
                                )}
                                <div className="text-slate-400 text-xs mt-1">
                                  {new Date(e.created_at).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Évaluation qualité */}
                      {evalQual && (
                        <div>
                          <h4 className="text-slate-700 font-bold text-sm mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-cyan-600" />Évaluation Qualité de Service
                          </h4>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-xs">Recommande l'école :</span>
                              <span className={`text-xs font-semibold ${evalQual.recommande ? 'text-green-600' : 'text-slate-500'}`}>
                                {evalQual.recommande ? '✓ Oui' : '✗ Non'}
                              </span>
                            </div>
                            {evalQual.commentaire && (
                              <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200">
                                <MessageSquare className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <p className="text-slate-600 text-xs italic">"{evalQual.commentaire}"</p>
                              </div>
                            )}
                            <div className="text-slate-400 text-xs mt-1">
                              {new Date(evalQual.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Évaluations formation */}
                      {evalForm.length > 0 && (
                        <div>
                          <h4 className="text-slate-700 font-bold text-sm mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-purple-600" />Évaluations Formation ({evalForm.length})
                          </h4>
                          <div className="space-y-2">
                            {evalForm.map((e, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-slate-700 text-xs font-semibold capitalize">{e.type || 'Formation'}</span>
                                  {e.score_moyen && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${e.score_moyen >= 3.5 ? 'text-green-700 bg-green-100' : e.score_moyen >= 2.5 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'}`}>
                                      {e.score_moyen}/5
                                    </span>
                                  )}
                                </div>
                                {e.commentaires_suggestions && (
                                  <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200">
                                    <MessageSquare className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-600 text-xs italic">"{e.commentaires_suggestions}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterClasse,  setFilterClasse]  = useState('');
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteRow = async (s, e) => {
    e.stopPropagation();
    if (!confirm(`Supprimer "${s.name}" et toutes ses évaluations ?`)) return;
    setDeletingId(s.id);
    try {
      await adminAPI.studentDelete(s.id);
      toast.success('Étudiant supprimé');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setDeletingId(null); }
  };

  const load = (params = {}) => {
    adminAPI.students(params).then(r => setStudents(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    filiereAPI.list().then(r => setFilieres(r.data)).catch(() => {});
    classeAPI.list().then(r => setClasses(r.data)).catch(() => {});
    load();
  }, []);

  const handleFilter = () => { setLoading(true); load({ filiere_id: filterFiliere || undefined, classe_id: filterClasse || undefined, search: search || undefined }); };
  useEffect(() => { handleFilter(); }, [filterFiliere, filterClasse]);

  const filteredClasses = filterFiliere ? classes.filter(c => c.filiere_id === parseInt(filterFiliere)) : classes;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Étudiants</h1>
        <p className="text-slate-500 text-sm mt-1">{students.length} étudiant(s)</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            placeholder="Nom ou email..."
            className="bg-white border border-slate-200 text-slate-700 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-48 shadow-sm" />
        </div>
        <select value={filterFiliere} onChange={e => { setFilterFiliere(e.target.value); setFilterClasse(''); }}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm">
          <option value="">Toutes les filières</option>
          {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm">
          <option value="">Toutes les classes</option>
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <button onClick={handleFilter}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
          Filtrer
        </button>
      </div>

      {loading
        ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        : students.length === 0
        ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Aucun étudiant trouvé.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Étudiant','Filière / Classe','Éval. Ens.','Qualité','Formation','Statut',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-semibold uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(s)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {s.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-slate-900 font-medium text-xs">{s.name}</div>
                          <div className="text-slate-400 text-xs truncate max-w-[140px]">{s.email}</div>
                          {s.matricule && <div className="text-slate-300 text-xs font-mono">{s.matricule}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 text-xs font-medium">{s.filiere?.nom || '—'}</div>
                      <div className="text-slate-400 text-xs">{s.classe?.nom || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2 py-1 rounded-lg">{s.evaluation_stats?.enseignement || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-cyan-50 text-cyan-700 font-bold text-xs px-2 py-1 rounded-lg">{s.evaluation_stats?.qualite || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-50 text-purple-700 font-bold text-xs px-2 py-1 rounded-lg">{s.evaluation_stats?.formation || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer" onClick={() => setSelected(s)}>Détails →</span>
                        <button onClick={(e) => handleDeleteRow(s, e)} disabled={deletingId === s.id}
                          className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <AnimatePresence>
        {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} onDelete={() => { setSelected(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
