import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Mail, BarChart3, CheckCircle, TrendingUp, X, RefreshCw, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#1e3a8a','#0ea5e9','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

export default function AdminDashboard() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [commentModal, setCommentModal] = useState(null);
  const [showReset, setShowReset]     = useState(false);
  const [resetting, setResetting]     = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    setResetting(true);
    try {
      await adminAPI.resetEvals();
      toast.success('Évaluations réinitialisées pour la nouvelle année.');
      setShowReset(false);
      fetchData();
    } catch {
      toast.error('Erreur lors de la réinitialisation.');
    } finally { setResetting(false); }
  };

  const fetchData = (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    adminAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const {
    filieres=0, classes=0, etudiants=0, invitations=0,
    eval_enseignement=0, eval_qualite=0, eval_formation=0,
    recent_evals=[], filieres_stats=[],
  } = data || {};

  const statsCards = [
    { icon: BookOpen,     label: 'Filières',           value: filieres,          color: 'blue',    sub: 'filières actives',           to: '/admin/filieres' },
    { icon: GraduationCap,label: 'Classes',             value: classes,           color: 'cyan',    sub: 'classes configurées',        to: '/admin/classes' },
    { icon: Users,        label: 'Étudiants',           value: etudiants,         color: 'violet',  sub: 'invités sur la plateforme',  to: '/admin/students' },
    { icon: Mail,         label: 'Invitations',         value: invitations,       color: 'amber',   sub: 'invitations envoyées',       to: '/admin/invitations' },
    { icon: BarChart3,    label: 'Éval. Enseignement',  value: eval_enseignement, color: 'green',   sub: 'réponses reçues',            to: '/admin/reports' },
    { icon: CheckCircle,  label: 'Éval. Qualité',       value: eval_qualite,      color: 'emerald', sub: 'questionnaires qualité',     to: '/admin/reports' },
    { icon: TrendingUp,   label: 'Éval. Formation',     value: eval_formation,    color: 'purple',  sub: 'évaluations formation',      to: '/admin/reports' },
  ];

  const colorMap = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    val: 'text-blue-700',    ring: 'hover:ring-blue-200' },
    cyan:    { bg: 'bg-cyan-50',    icon: 'text-cyan-600',    val: 'text-cyan-700',    ring: 'hover:ring-cyan-200' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  val: 'text-violet-700',  ring: 'hover:ring-violet-200' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   val: 'text-amber-700',   ring: 'hover:ring-amber-200' },
    green:   { bg: 'bg-green-50',   icon: 'text-green-600',   val: 'text-green-700',   ring: 'hover:ring-green-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700', ring: 'hover:ring-emerald-200' },
    purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  val: 'text-purple-700',  ring: 'hover:ring-purple-200' },
  };

  const chartData = filieres_stats.map((f, i) => ({
    name: f.code, total: f.total_evals, etudiants: f.nb_etudiants, fill: COLORS[i % COLORS.length],
  }));
  const pieData = filieres_stats.filter(f => f.nb_etudiants > 0).map((f, i) => ({
    name: f.filiere, value: f.nb_etudiants, fill: COLORS[i % COLORS.length],
  }));

  const evalsWithComments = recent_evals.filter(e => e.commentaire);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">Vue globale de la plateforme ISI SUPTECH</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </motion.div>

      {/* Stats grid — cliquables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => {
          const c = colorMap[s.color];
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => navigate(s.to)}
              className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer hover:ring-2 ${c.ring} transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${c.icon}`} />
              </div>
              <div className={`text-2xl font-black ${c.val}`}>{s.value.toLocaleString()}</div>
              <div className="text-slate-800 text-xs font-semibold mt-0.5">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
              <div className="text-xs text-slate-300 mt-2">→ Voir détails</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      {filieres_stats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm mb-4">📊 Évaluations par Filière</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: 12 }} />
                <Bar dataKey="total" name="Évaluations" radius={[4,4,0,0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm mb-4">👨‍🎓 Étudiants par Filière</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Filières table */}
      {filieres_stats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-slate-800 font-bold text-sm">📈 Résumé par Filière</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Filière','Classes','Étudiants','Éval. Ens.','Éval. Qualité','Éval. Form.','Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filieres_stats.map((f, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/reports')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.couleur }} />
                        <span className="text-slate-900 font-medium text-xs">{f.filiere}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.nb_classes}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.nb_etudiants}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.eval_enseignement}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.eval_qualite}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{f.eval_formation}</td>
                    <td className="px-4 py-3"><span className="text-blue-600 font-bold text-xs">{f.total_evals}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recent evals + commentaires */}
      {recent_evals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-slate-800 font-bold text-sm">⏱️ Dernières évaluations</h3>
            {evalsWithComments.length > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {evalsWithComments.length} commentaire(s)
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {recent_evals.map((e, i) => (
              <div key={i}
                onClick={() => e.commentaire && setCommentModal(e)}
                className={`px-5 py-3 flex items-start gap-4 transition-colors ${e.commentaire ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-slate-50'}`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0 mt-0.5">
                  {e.etudiant?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 text-xs font-medium truncate">{e.etudiant?.name}</div>
                  <div className="text-slate-500 text-xs truncate">
                    {e.matiere?.nom || e.cmp?.matiere?.nom || <span className="italic text-slate-300">—</span>}
                    {(e.cmp?.professeur) && ` • ${e.cmp.professeur.prenom} ${e.cmp.professeur.nom}`}
                  </div>
                  {e.commentaire && (
                    <div className="flex items-start gap-1 mt-1">
                      <MessageSquare className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-500 text-xs italic line-clamp-2">"{e.commentaire}"</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.score_total >= 75 ? 'text-green-700 bg-green-100' : e.score_total >= 50 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'}`}>
                    {e.score_total}%
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">{new Date(e.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reset annuel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="bg-white border border-red-100 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-slate-900 font-bold text-sm">Réinitialisation annuelle</span>
          </div>
          <p className="text-slate-400 text-xs">Supprime toutes les évaluations pour commencer une nouvelle année scolaire. Les comptes étudiants sont conservés.</p>
        </div>
        <button onClick={() => setShowReset(true)}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />Réinitialiser
        </button>
      </motion.div>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showReset && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReset(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-center text-lg mb-2">Confirmer la réinitialisation</h3>
              <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
                Toutes les évaluations (enseignement, qualité, formation) seront <strong>définitivement supprimées</strong>.
                Les comptes étudiants et la structure (filières, classes, matières) sont conservés.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowReset(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleReset} disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {resetting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Suppression...</> : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Commentaires modal */}
      <AnimatePresence>
        {commentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCommentModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 font-bold">Commentaire étudiant</h3>
                <button onClick={() => setCommentModal(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {commentModal.etudiant?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-slate-900 text-sm font-semibold">{commentModal.etudiant?.name}</div>
                  <div className="text-slate-500 text-xs">
                    {commentModal.matiere?.nom || commentModal.cmp?.matiere?.nom || '—'}
                    {commentModal.cmp?.professeur && ` • ${commentModal.cmp.professeur.prenom} ${commentModal.cmp.professeur.nom}`}
                  </div>
                </div>
                <div className={`ml-auto text-sm font-black px-3 py-1 rounded-xl ${commentModal.score_total >= 75 ? 'text-green-700 bg-green-100' : commentModal.score_total >= 50 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'}`}>
                  {commentModal.score_total}%
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-700 text-sm leading-relaxed italic">"{commentModal.commentaire}"</p>
              </div>
              <div className="text-slate-400 text-xs mt-3 text-right">
                {new Date(commentModal.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
