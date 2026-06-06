import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, BarChart3, ChevronRight, BookOpen } from 'lucide-react';
import { adminAPI, filiereAPI, classeAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#1e3a8a','#0ea5e9','#7c3aed','#059669','#dc2626','#d97706'];

const QUESTION_LABELS = [
  'Q1 - Grandes lignes du programme',
  'Q2 - Suit le programme',
  'Q3 - Travail à la maison',
  'Q4 - Compréhension des enseignements',
  'Q5 - Répond aux questions',
  'Q6 - Ponctualité',
  'Q7 - Atteinte des objectifs',
  'Q8 - Utilisation du temps',
  'Q9 - Corrélation filière',
  'Q10 - Satisfaction générale',
];

function ScoreBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/10 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444' }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{value?.toFixed(0) ?? '—'}%</span>
    </div>
  );
}

export default function AdminReports() {
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [filiereReport, setFiliereReport] = useState(null);
  const [classeReport, setClasseReport] = useState(null);
  const [loadingFiliere, setLoadingFiliere] = useState(false);
  const [loadingClasse, setLoadingClasse] = useState(false);
  const [view, setView] = useState('filiere'); // 'filiere' | 'classe'

  useEffect(() => {
    Promise.all([filiereAPI.list(), classeAPI.list()]).then(([f, c]) => {
      setFilieres(f.data); setClasses(c.data);
    });
  }, []);

  const loadFiliereReport = async (f) => {
    setSelectedFiliere(f); setFiliereReport(null);
    setLoadingFiliere(true);
    try { const r = await adminAPI.filiereReport(f.id); setFiliereReport(r.data); }
    catch { }
    finally { setLoadingFiliere(false); }
  };

  const loadClasseReport = async (c) => {
    setSelectedClasse(c); setClasseReport(null);
    setLoadingClasse(true);
    try { const r = await adminAPI.classeReport(c.id); setClasseReport(r.data); }
    catch { }
    finally { setLoadingClasse(false); }
  };

  const filteredClasses = selectedFiliere ? classes.filter(c => c.filiere_id === selectedFiliere.id) : classes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Rapports & Exports</h1>
          <p className="text-slate-400 text-sm mt-1">Synthèse des évaluations par filière ou par classe</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-slate-800/50 border border-white/10 rounded-xl p-1 w-fit">
        {[['filiere','Par Filière'],['classe','Par Classe']].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === v ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Filière view */}
      {view === 'filiere' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filière list */}
          <div className="space-y-2">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Sélectionner une filière</p>
            {filieres.map(f => (
              <motion.button key={f.id} onClick={() => loadFiliereReport(f)} whileTap={{ scale: 0.98 }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedFiliere?.id === f.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800/50 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'}`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: f.couleur }} />
                <span className="font-medium text-sm">{f.nom}</span>
                <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${selectedFiliere?.id === f.id ? 'rotate-90' : ''}`} />
              </motion.button>
            ))}
          </div>

          {/* Filière report */}
          <div className="lg:col-span-2">
            {!selectedFiliere ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/10">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Sélectionnez une filière pour voir le rapport.</p>
              </div>
            ) : loadingFiliere ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
            ) : filiereReport ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-800/50 border border-white/10 rounded-xl p-5">
                  <div>
                    <h3 className="text-white font-bold">{filiereReport.filiere?.nom}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                      <span>📚 {filiereReport.nb_classes} classes</span>
                      <span>👥 {filiereReport.nb_etudiants} étudiants</span>
                      <span>📊 {filiereReport.total_evaluations} évaluations</span>
                    </div>
                  </div>
                  <button onClick={() => adminAPI.exportFiliere(selectedFiliere.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <Download className="w-4 h-4" />PDF
                  </button>
                </div>

                {/* Classes summary */}
                {filiereReport.classes?.map((c, ci) => (
                  <div key={ci} className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold text-sm">{c.nom}</span>
                        <span className="text-slate-400 text-xs">({c.nb_cmps} matières, {c.nb_evaluations} évaluations)</span>
                      </div>
                    </div>
                    {c.cmps?.length > 0 && (
                      <div className="p-4 space-y-3">
                        {c.cmps.map((cmp, ci2) => (
                          <div key={ci2} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-white text-xs font-medium">{cmp.matiere}</span>
                                <span className="text-slate-400 text-xs ml-2">• {cmp.professeur}</span>
                              </div>
                              <span className="text-slate-400 text-xs">{cmp.nb_reponses} réponses</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {QUESTION_LABELS.map((ql, qi) => (
                                <div key={qi} className="flex items-center justify-between gap-2">
                                  <span className="text-slate-500 text-xs truncate">{ql}</span>
                                  <ScoreBar value={cmp.scores?.[`q${qi+1}`] || 0} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>
      )}

      {/* Classe view */}
      {view === 'classe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class list */}
          <div className="space-y-2">
            <div className="flex flex-col gap-1.5">
              {filteredClasses.map(c => (
                <motion.button key={c.id} onClick={() => loadClasseReport(c)} whileTap={{ scale: 0.98 }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedClasse?.id === c.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800/50 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{c.nom}</div>
                    <div className="text-xs text-slate-500">{c.filiere?.nom || ''}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Classe report */}
          <div className="lg:col-span-2">
            {!selectedClasse ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/10">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Sélectionnez une classe pour voir le rapport.</p>
              </div>
            ) : loadingClasse ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
            ) : classeReport ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-800/50 border border-white/10 rounded-xl p-5">
                  <div>
                    <h3 className="text-white font-bold">{classeReport.classe?.nom}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                      <span>👥 {classeReport.nb_etudiants} étudiants</span>
                      <span>📊 {classeReport.nb_evaluations} évaluations</span>
                    </div>
                  </div>
                  <button onClick={() => adminAPI.exportClasse(selectedClasse.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <Download className="w-4 h-4" />PDF
                  </button>
                </div>

                {/* Chart */}
                {classeReport.cmps?.length > 0 && (
                  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-bold text-sm mb-4">Score moyen par matière</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={classeReport.cmps.map(c => ({ name: c.matiere?.substring(0, 12), score: c.score_moyen || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis domain={[0,100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={v => [`${v?.toFixed(1)}%`, 'Score']} />
                        <Bar dataKey="score" name="Score moyen" radius={[4,4,0,0]}>
                          {classeReport.cmps.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* CMP details */}
                {classeReport.cmps?.map((cmp, i) => (
                  <div key={i} className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-medium text-sm">{cmp.matiere}</span>
                        <span className="text-slate-400 text-xs ml-2">— {cmp.professeur}</span>
                      </div>
                      <div className={`text-sm font-black px-3 py-1 rounded-xl ${(cmp.score_moyen || 0) >= 75 ? 'text-green-400 bg-green-400/10' : (cmp.score_moyen || 0) >= 50 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {cmp.score_moyen?.toFixed(1) || '0'}%
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {QUESTION_LABELS.map((ql, qi) => (
                        <div key={qi} className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs w-36 truncate flex-shrink-0">{ql}</span>
                          <ScoreBar value={cmp.scores?.[`q${qi+1}`] || 0} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
