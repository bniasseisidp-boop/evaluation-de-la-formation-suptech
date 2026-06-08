import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { cmpAPI, matiereAPI, evaluationAPI } from '../../services/api';

const QUESTIONS = [
  { q: 'q1',  label: 'A-t-il décliné les grandes lignes du programme (UE, EC, COMPÉTENCE, OBJECTIFS, CONTENUS) en début de module ?' },
  { q: 'q2',  label: "Est-ce qu'il suit ce programme ?" },
  { q: 'q3',  label: "Donne-t-il suffisamment de travail à faire à la maison (exercices, recherches…) ?" },
  { q: 'q4',  label: "Comprenez-vous bien ses enseignements ?" },
  { q: 'q5',  label: "Prend-il le temps de répondre à vos questions ?" },
  { q: 'q6',  label: "Vient-il et quitte-il à l'heure ?" },
  { q: 'q7',  label: "A-t-il atteint ses objectifs ?" },
  { q: 'q8',  label: "Utilise-t-il le maximum de temps pour son enseignement ?" },
  { q: 'q9',  label: "Fait-il la corrélation avec la filière ?" },
  { q: 'q10', label: "Vous donne-t-il satisfaction ?" },
];

const OPTIONS = [
  { value: 'A', label: 'A', score: '50%', color: 'text-red-600',    bg: 'bg-red-50 border-red-300' },
  { value: 'B', label: 'B', score: '75%', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-300' },
  { value: 'C', label: 'C', score: '100%', color: 'text-green-600', bg: 'bg-green-50 border-green-300' },
];

export default function EvalEnseignement() {
  const { cmpId } = useParams();
  const navigate  = useNavigate();
  const isVirtual = String(cmpId).startsWith('mat_');
  const matiereId = isVirtual ? parseInt(cmpId.replace('mat_', '')) : null;

  const [cmp,        setCmp]        = useState(null);
  const [matiere,    setMatiere]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const { register, handleSubmit, watch } = useForm();
  const values   = watch();
  const answered = QUESTIONS.filter(({ q }) => values[q]).length;
  const progress = (answered / QUESTIONS.length) * 100;

  useEffect(() => {
    if (isVirtual) {
      // Mode matière directe (sans CMP ni professeur)
      matiereAPI.list()
        .then(r => {
          const found = r.data.find(m => m.id === matiereId);
          setMatiere(found || { id: matiereId, nom: 'Matière inconnue' });
        })
        .catch(() => toast.error('Matière introuvable'))
        .finally(() => setLoading(false));
    } else {
      // Mode CMP classique (avec professeur)
      cmpAPI.list()
        .then(r => {
          const found = r.data.find(c => c.id === parseInt(cmpId));
          if (found) setCmp(found);
          else toast.error('Cours introuvable');
        })
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [cmpId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = isVirtual
        ? { ...data, matiere_id: matiereId }
        : { ...data, cmp_id: parseInt(cmpId) };
      await evaluationAPI.submitEnseignement(payload);
      setSubmitted(true);
      toast.success('Évaluation soumise avec succès ! 🎉');
      setTimeout(() => navigate('/portail'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally { setSubmitting(false); }
  };

  const displayName = isVirtual ? matiere?.nom : cmp?.matiere?.nom;
  const profName    = isVirtual ? null : `${cmp?.professeur?.prenom || ''} ${cmp?.professeur?.nom || ''}`.trim();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (submitted) return (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="text-center py-20">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Évaluation soumise !</h2>
      <p className="text-slate-500 text-lg">Merci pour votre contribution.</p>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/portail')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm mb-4">
          <ChevronLeft className="w-4 h-4" />Retour au tableau de bord
        </button>

        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
          <div className="text-blue-200 text-xs uppercase tracking-wider mb-1">Évaluation de l'enseignement</div>
          <h1 className="text-2xl font-black">{displayName || '...'}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {profName && <span className="bg-white/20 px-3 py-1 rounded-full text-xs">👨‍🏫 {profName}</span>}
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">📊 {answered}/10 répondus</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span>Progression</span><span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-white to-blue-200 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grille de notation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
        <div className="font-semibold text-blue-800 mb-2">Grille de notation :</div>
        <div className="flex gap-4 flex-wrap">
          <span className="text-red-600">A = 50% <span className="text-slate-500">(insuffisant)</span></span>
          <span className="text-yellow-600">B = 75% <span className="text-slate-500">(satisfaisant)</span></span>
          <span className="text-green-600">C = 100% <span className="text-slate-500">(très satisfaisant)</span></span>
        </div>
      </motion.div>

      {/* Questions */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {QUESTIONS.map(({ q, label }, i) => (
          <motion.div key={q}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i + 0.2 }}
            className={`bg-white rounded-xl border p-5 transition-all duration-200 ${values[q] ? 'border-green-200 shadow-sm' : 'border-slate-100'}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${values[q] ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                {values[q] ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">{label}</p>
            </div>
            <div className="flex gap-3">
              {OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${values[q] === opt.value ? opt.bg : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <input type="radio" {...register(q, { required: true })} value={opt.value} className="sr-only" />
                  <span className={`text-xl font-black ${values[q] === opt.value ? opt.color : 'text-slate-400'}`}>{opt.label}</span>
                  <span className={`text-xs font-semibold ${values[q] === opt.value ? opt.color : 'text-slate-400'}`}>{opt.score}</span>
                </label>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Commentaire */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <label className="text-slate-700 font-semibold text-sm mb-2 block">💬 Commentaire (optionnel)</label>
          <textarea {...register('commentaire')} rows={4}
            placeholder="Partagez vos remarques, suggestions ou commentaires..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-blue-500 transition-colors" />
        </motion.div>

        <motion.button type="submit" disabled={submitting || answered < 10}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2">
          {submitting
            ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi...</>
            : <><Send className="w-5 h-5" />Soumettre l'évaluation {answered < 10 && `(${10 - answered} restante${10 - answered > 1 ? 's' : ''})`}</>}
        </motion.button>
      </form>
    </div>
  );
}
