import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Mail, BarChart3, CheckCircle, TrendingUp } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1e3a8a','#0ea5e9','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const { filieres=0, classes=0, etudiants=0, invitations=0, eval_enseignement=0, eval_qualite=0, eval_formation=0, recent_evals=[], filieres_stats=[] } = data || {};

  const statsCards = [
    { icon: BookOpen, label: 'Filières', value: filieres, color: 'blue', sub: 'filières actives' },
    { icon: GraduationCap, label: 'Classes', value: classes, color: 'cyan', sub: 'classes configurées' },
    { icon: Users, label: 'Étudiants', value: etudiants, color: 'violet', sub: 'invités sur la plateforme' },
    { icon: Mail, label: 'Invitations', value: invitations, color: 'amber', sub: 'invitations envoyées' },
    { icon: BarChart3, label: 'Éval. Enseignement', value: eval_enseignement, color: 'green', sub: 'réponses reçues' },
    { icon: CheckCircle, label: 'Éval. Qualité', value: eval_qualite, color: 'emerald', sub: 'questionnaires qualité' },
    { icon: TrendingUp, label: 'Éval. Formation', value: eval_formation, color: 'purple', sub: 'évaluations formation' },
  ];

  const chartData = filieres_stats.map(f => ({
    name: f.code, total: f.total_evals, etudiants: f.nb_etudiants, fill: COLORS[filieres_stats.indexOf(f) % COLORS.length],
  }));

  const pieData = filieres_stats.filter(f => f.nb_etudiants > 0).map((f, i) => ({
    name: f.filiere, value: f.nb_etudiants, fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
        <p className="text-slate-400 text-sm mt-1">Vue globale de la plateforme ISI SUPTECH</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            className="bg-slate-800/50 border border-white/10 rounded-xl p-4 card-hover">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/20 flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 text-${s.color}-400`} />
            </div>
            <div className="text-2xl font-black text-white">{s.value.toLocaleString()}</div>
            <div className="text-slate-300 text-xs font-medium mt-0.5">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {filieres_stats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">📊 Évaluations par Filière</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Bar dataKey="total" name="Évaluations" radius={[4,4,0,0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">👨‍🎓 Étudiants par Filière</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Filières table */}
      {filieres_stats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-bold text-sm">📈 Résumé par Filière</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Filière','Classes','Étudiants','Éval. Ens.','Éval. Qualité','Éval. Form.','Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filieres_stats.map((f, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.couleur }} />
                        <span className="text-white font-medium text-xs">{f.filiere}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{f.nb_classes}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{f.nb_etudiants}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{f.eval_enseignement}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{f.eval_qualite}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{f.eval_formation}</td>
                    <td className="px-4 py-3"><span className="text-blue-400 font-bold text-xs">{f.total_evals}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recent evals */}
      {recent_evals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-bold text-sm">⏱️ Dernières évaluations</h3>
          </div>
          <div className="divide-y divide-white/5">
            {recent_evals.map((e, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
                  {e.etudiant?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{e.etudiant?.name}</div>
                  <div className="text-slate-400 text-xs truncate">{e.cmp?.matiere?.nom} • {e.cmp?.professeur?.prenom} {e.cmp?.professeur?.nom}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.score_total >= 75 ? 'text-green-400 bg-green-400/10' : e.score_total >= 50 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>{e.score_total}%</div>
                  <div className="text-slate-500 text-xs mt-0.5">{new Date(e.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
