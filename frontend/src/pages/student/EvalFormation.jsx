import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { evaluationAPI } from '../../services/api';

const SCORES = [
  { v: 1, emoji: '😞', label: 'Pas du tout d\'accord' },
  { v: 2, emoji: '😕', label: 'En désaccord' },
  { v: 3, emoji: '😐', label: 'Plus ou moins' },
  { v: 4, emoji: '🙂', label: 'D\'accord' },
  { v: 5, emoji: '😄', label: 'Tout à fait d\'accord' },
];

const ITEMS = [
  { key: 'score_motivation',       label: 'J\'étais motivé(e) à suivre ce cours' },
  { key: 'score_objectifs',        label: 'Les objectifs de la formation étaient clairs et précis' },
  { key: 'score_contenu',          label: 'Le contenu de la formation correspondait à mes besoins et préoccupations' },
  { key: 'score_techniques',       label: 'Les techniques d\'enseignement ont favorisé l\'apprentissage' },
  { key: 'score_exercices',        label: 'Les exercices et activités étaient pertinents à la formation' },
  { key: 'score_formateur_comm',   label: 'Le formateur communiquait d\'une façon claire et dynamique' },
  { key: 'score_formateur_rythme', label: 'Le formateur a respecté le rythme d\'apprentissage des participants' },
  { key: 'score_connaissance',     label: 'Cette formation m\'a permis d\'augmenter mon niveau de connaissance et d\'habileté' },
  { key: 'score_application',      label: 'Je compte mettre en application ces nouvelles compétences dès mon retour au travail' },
  { key: 'score_recommandation',   label: 'Je recommanderais cette formation à mes collègues de travail' },
];

export default function EvalFormation() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { type: 'simple' } });
  const values = watch();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const objectifs = [data.obj_a, data.obj_b, data.obj_c, data.obj_d].filter(Boolean).map((text, i) => ({
        label: ['a','b','c','d'][i], text, oui: data[`obj_${['a','b','c','d'][i]}_oui`] === 'true',
      }));
      const payload = { ...data, type: 'simple', objectifs_session: objectifs };
      delete payload.obj_a; delete payload.obj_b; delete payload.obj_c; delete payload.obj_d;
      await evaluationAPI.submitFormation(payload);
      setSubmitted(true);
      toast.success('Évaluation soumise ! Merci 🎉');
      setTimeout(() => navigate('/portail'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
      <div className="text-8xl mb-6">🌟</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Merci pour votre participation !</h2>
      <p className="text-slate-500">Vos retours sont précieux pour ISI SUPTECH.</p>
    </motion.div>
  );

  const ScoreSelector = ({ fieldKey }) => (
    <div className="flex gap-1.5 sm:gap-2 mt-3 flex-wrap">
      {SCORES.map(s => (
        <label key={s.v}
          className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border-2 cursor-pointer transition-all min-w-[52px] ${parseInt(values[fieldKey]) === s.v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
          <input type="radio" {...register(fieldKey)} value={s.v} className="sr-only" />
          <span className="text-xl">{s.emoji}</span>
          <span className={`text-lg font-black ${parseInt(values[fieldKey]) === s.v ? 'text-blue-700' : 'text-slate-400'}`}>{s.v}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/portail')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />Retour
        </button>
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-6 text-white">
          <div className="text-purple-200 text-xs uppercase tracking-wider mb-1">INFORMATIQUE</div>
          <h1 className="text-2xl font-black">Évaluation de la Formation</h1>
          <p className="text-purple-200 text-sm mt-2">
            1 = Pas du tout d'accord &nbsp;•&nbsp; 5 = Tout à fait d'accord
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Programme */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-4">📋 Objectifs de la session</h3>
          <p className="text-slate-500 text-sm mb-4">Les objectifs de la session sont-ils atteints ?</p>
          {['a','b','c','d'].map(letter => (
            <div key={letter} className="flex items-center gap-3 mb-3">
              <span className="text-slate-600 font-bold text-sm uppercase">{letter})</span>
              <input type="text" {...register(`obj_${letter}`)} placeholder={`Objectif ${letter.toUpperCase()}...`}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <div className="flex gap-2">
                {['OUI','NON'].map(v => (
                  <label key={v} className={`px-2.5 py-1 rounded-lg border cursor-pointer text-xs font-semibold transition-colors ${values[`obj_${letter}_oui`] === (v === 'OUI' ? 'true' : 'false') ? (v === 'OUI' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700') : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    <input type="radio" {...register(`obj_${letter}_oui`)} value={v === 'OUI' ? 'true' : 'false'} className="sr-only" />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Score items */}
        {ITEMS.map((item, i) => (
          <motion.div key={item.key} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i + 0.2 }}
            className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="font-medium text-slate-700 text-sm leading-relaxed">{item.label}</p>
            <ScoreSelector fieldKey={item.key} />
          </motion.div>
        ))}

        {/* Commentaires */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">💬 Commentaires et recommandations</h3>
          <textarea {...register('commentaires_suggestions')} rows={4} placeholder="Vos suggestions pour améliorer la formation..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500" />
        </motion.div>

        {/* Emploi */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-4">🎯 Suivi Post-Formation</h3>
          <p className="text-slate-600 text-sm mb-3">Avez-vous réussi à trouver un emploi ou améliorer votre situation professionnelle suite à la formation ?</p>
          <div className="flex gap-3 mb-4">
            {[{v:'1',l:'✅ Oui'},{v:'0',l:'❌ Non'}].map(opt => (
              <label key={opt.v} className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${values.emploi_trouve === opt.v ? (opt.v === '1' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-slate-50 border-slate-400 text-slate-600') : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" {...register('emploi_trouve')} value={opt.v} className="sr-only" />{opt.l}
              </label>
            ))}
          </div>
          {values.emploi_trouve === '1' && (
            <textarea {...register('nature_emploi')} rows={2} placeholder="Précisez la nature de l'emploi ou de l'amélioration..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500" />
          )}
        </motion.div>

        <motion.button type="submit" disabled={submitting}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2">
          {submitting ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi...</> : <><Send className="w-5 h-5" />Soumettre l'évaluation</>}
        </motion.button>
      </form>
    </div>
  );
}
