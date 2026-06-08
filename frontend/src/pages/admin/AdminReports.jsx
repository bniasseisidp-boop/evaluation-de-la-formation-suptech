import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, BarChart3, ChevronRight, BookOpen, ChevronDown, ChevronUp, MessageSquare, Users } from 'lucide-react';
import { adminAPI, filiereAPI, classeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const QUESTION_LABELS = [
  'Q1 — A-t-il décliné les grandes lignes du programme ?',
  'Q2 — Est-ce qu\'il suit ce programme ?',
  'Q3 — Donne-t-il suffisamment de travail à la maison ?',
  'Q4 — Comprenez-vous bien ses enseignements ?',
  'Q5 — Prend-il le temps de répondre à vos questions ?',
  'Q6 — Vient-il et quitte-t-il à l\'heure ?',
  'Q7 — A-t-il atteint ses objectifs ?',
  'Q8 — Utilise-t-il le maximum de temps pour l\'enseignement ?',
  'Q9 — Fait-il la corrélation avec la filière ?',
  'Q10 — Vous donne-t-il satisfaction ?',
];

function ScoreBadge({ value }) {
  const pct = value || 0;
  const cls = pct >= 75 ? 'text-green-700 bg-green-100' : pct >= 50 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100';
  return <span className={`text-sm font-black px-3 py-1 rounded-xl ${cls}`}>{pct.toFixed(1)}%</span>;
}

function QuestionBreakdown({ questions }) {
  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
      {QUESTION_LABELS.map((label, i) => {
        const q = questions?.[`q${i + 1}`] || { A: 0, B: 0, C: 0 };
        return (
          <div key={i} className="flex items-start gap-3">
            <span className="text-slate-400 text-xs w-40 flex-shrink-0 pt-1 leading-tight">{label}</span>
            <div className="flex-1 space-y-1">
              {[
                { key: 'A', pct: q.A, barColor: 'bg-red-400',    textColor: 'text-red-600',    label: 'A — 50%' },
                { key: 'B', pct: q.B, barColor: 'bg-yellow-400', textColor: 'text-yellow-600', label: 'B — 75%' },
                { key: 'C', pct: q.C, barColor: 'bg-green-500',  textColor: 'text-green-600',  label: 'C — 100%' },
              ].map(({ key, pct, barColor, textColor, label: lbl }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-xs font-bold w-14 flex-shrink-0 ${textColor}`}>{lbl}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right font-medium">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatiereCard({ mat, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-900 font-bold text-sm">{mat.matiere}</span>
            {mat.professeur && (
              <span className="text-slate-400 text-xs">— {mat.professeur}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Users className="w-3 h-3" />{mat.nb_reponses} réponse{mat.nb_reponses !== 1 ? 's' : ''}
            </span>
            {mat.commentaires?.length > 0 && (
              <span className="text-blue-500 text-xs flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />{mat.commentaires.length} commentaire{mat.commentaires.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <ScoreBadge value={mat.score_moyen} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5">
              {mat.nb_reponses === 0 ? (
                <p className="text-slate-400 text-sm italic py-4 text-center">Aucune évaluation reçue pour cette matière.</p>
              ) : (
                <QuestionBreakdown questions={mat.questions} />
              )}
              {mat.commentaires?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Commentaires étudiants</p>
                  {mat.commentaires.map((c, ci) => (
                    <div key={ci} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-slate-700 italic flex gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      "{c}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState('filiere');

  useEffect(() => {
    filiereAPI.list().then(r => setFilieres(r.data)).catch(() => {});
    classeAPI.list().then(r => setClasses(r.data)).catch(() => {});
  }, []);

  const loadFiliereReport = async (f) => {
    setSelectedFiliere(f); setFiliereReport(null); setLoadingFiliere(true);
    try { const r = await adminAPI.filiereReport(f.id); setFiliereReport(r.data); }
    catch { toast.error('Erreur de chargement'); } finally { setLoadingFiliere(false); }
  };

  const loadClasseReport = async (c) => {
    setSelectedClasse(c); setClasseReport(null); setLoadingClasse(true);
    try { const r = await adminAPI.classeReport(c.id); setClasseReport(r.data); }
    catch { toast.error('Erreur de chargement'); } finally { setLoadingClasse(false); }
  };

  const handleExportFiliere = async () => {
    if (!selectedFiliere) return;
    setDownloading(true);
    try { await adminAPI.exportFiliere(selectedFiliere.id); toast.success('PDF téléchargé !'); }
    catch { toast.error('Erreur lors du téléchargement PDF'); }
    finally { setDownloading(false); }
  };

  const handleExportClasse = async () => {
    if (!selectedClasse) return;
    setDownloading(true);
    try { await adminAPI.exportClasse(selectedClasse.id); toast.success('PDF téléchargé !'); }
    catch { toast.error('Erreur lors du téléchargement PDF'); }
    finally { setDownloading(false); }
  };

  const filteredClasses = selectedFiliere ? classes.filter(c => c.filiere_id === selectedFiliere.id) : classes;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Rapports & Exports</h1>
        <p className="text-slate-500 text-sm mt-1">Résultats détaillés par matière avec répartition A/B/C pour chaque question</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {[['filiere', 'Par Filière'], ['classe', 'Par Classe']].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === v ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Filière view ── */}
      {view === 'filiere' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 font-semibold">Sélectionner une filière</p>
            {filieres.map(f => (
              <motion.button key={f.id} onClick={() => loadFiliereReport(f)} whileTap={{ scale: 0.98 }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  selectedFiliere?.id === f.id
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 shadow-sm'
                }`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: f.couleur }} />
                <span className="font-medium text-sm flex-1">{f.nom}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedFiliere?.id === f.id ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
              </motion.button>
            ))}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            {!selectedFiliere ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">Sélectionnez une filière pour voir le rapport.</p>
              </div>
            ) : loadingFiliere ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : filiereReport ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div>
                    <h3 className="text-slate-900 font-bold">{filiereReport.filiere?.nom}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>{filiereReport.nb_classes} classes</span>
                      <span>{filiereReport.nb_etudiants} étudiants</span>
                    </div>
                  </div>
                  <button onClick={handleExportFiliere} disabled={downloading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
                    <Download className="w-4 h-4" />{downloading ? 'Téléchargement...' : 'PDF'}
                  </button>
                </div>

                {/* Classes */}
                {filiereReport.classes?.map((c, ci) => (
                  <div key={ci} className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-900 font-bold text-sm">{c.nom}</span>
                      <span className="text-slate-400 text-xs">({c.nb_cmps} matières · {c.nb_evaluations} évaluations · {c.nb_etudiants} étudiants)</span>
                    </div>
                    {c.matieres?.length > 0 ? (
                      c.matieres.map((mat, mi) => <MatiereCard key={mi} mat={mat} />)
                    ) : (
                      <p className="text-slate-400 text-sm italic px-4">Aucune matière évaluée dans cette classe.</p>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Classe view ── */}
      {view === 'classe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-1.5">
            {filteredClasses.map(c => (
              <motion.button key={c.id} onClick={() => loadClasseReport(c)} whileTap={{ scale: 0.98 }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  selectedClasse?.id === c.id
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 shadow-sm'
                }`}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{c.nom}</div>
                  <div className="text-xs text-slate-400">{c.filiere?.nom || ''}</div>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
              </motion.button>
            ))}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            {!selectedClasse ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">Sélectionnez une classe pour voir le rapport.</p>
              </div>
            ) : loadingClasse ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : classeReport ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div>
                    <h3 className="text-slate-900 font-bold">{classeReport.classe?.nom}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>{classeReport.nb_etudiants} étudiants</span>
                      <span>Taux de réponse : {classeReport.taux_reponse}%</span>
                    </div>
                  </div>
                  <button onClick={handleExportClasse} disabled={downloading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
                    <Download className="w-4 h-4" />{downloading ? 'Téléchargement...' : 'PDF'}
                  </button>
                </div>

                {/* Legend */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-6 text-xs flex-wrap">
                  <span className="font-semibold text-slate-600">Légende :</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />A = 50% — Insuffisant</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />B = 75% — Satisfaisant</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />C = 100% — Très satisfaisant</span>
                </div>

                {/* Matières */}
                {classeReport.matieres?.length > 0 ? (
                  classeReport.matieres.map((mat, i) => <MatiereCard key={i} mat={mat} defaultOpen={i === 0} />)
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">Aucune évaluation reçue pour cette classe.</p>
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
