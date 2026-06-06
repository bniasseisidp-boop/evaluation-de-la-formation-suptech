import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, ChevronLeft, CheckCircle } from 'lucide-react';
import { evaluationAPI } from '../../services/api';

const SERVICES = [
  { key: 'secretariat',      label: 'Secrétariat', icon: '📋' },
  { key: 'direction',        label: 'Direction', icon: '🏛️' },
  { key: 'direction_etudes', label: 'Direction des études', icon: '📚', highlight: true },
  { key: 'documentation',    label: 'La Documentation', icon: '📖', highlight: true },
  { key: 'salle_pratique',   label: 'La salle pratique', icon: '💻' },
  { key: 'connexion',        label: 'La connexion internet', icon: '📶' },
  { key: 'securite',         label: 'La sécurité', icon: '🔒' },
  { key: 'toilettes',        label: 'Les toilettes', icon: '🚽' },
  { key: 'restaurant',       label: 'Le Restaurant', icon: '🍽️', highlight: true },
  { key: 'cadre_general',    label: 'Le cadre général', icon: '🏢' },
];

const NIVEAUX = [
  { value: 'tres_satisfait', label: 'Très satisfait', emoji: '😄', color: 'text-green-600 bg-green-50 border-green-300' },
  { value: 'satisfait',      label: 'Satisfait',      emoji: '😊', color: 'text-cyan-600 bg-cyan-50 border-cyan-300' },
  { value: 'peu_satisfait',  label: 'Peu satisfait',  emoji: '😐', color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
  { value: 'pas_satisfait',  label: 'Pas satisfait',  emoji: '😟', color: 'text-orange-600 bg-orange-50 border-orange-300' },
  { value: 'pas_du_tout',    label: 'Pas du tout',    emoji: '😞', color: 'text-red-600 bg-red-50 border-red-300' },
];

export default function EvalQualite() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const values = watch();

  useEffect(() => {
    evaluationAPI.myQualite().then(r => { if (r.data) setAlreadyDone(true); });
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await evaluationAPI.submitQualite(data);
      setSubmitted(true);
      toast.success('Questionnaire soumis ! Merci 🙏');
      setTimeout(() => navigate('/portail'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de soumission');
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="text-center py-20">
      <div className="text-8xl mb-6">🏆</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Merci pour votre retour !</h2>
      <p className="text-slate-500">Vos commentaires nous aident à améliorer ISI SUPTECH.</p>
    </motion.div>
  );

  if (alreadyDone) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-lg mx-auto text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Déjà soumis</h2>
      <p className="text-slate-500 text-sm mb-6">Vous avez déjà rempli ce questionnaire pour cette année scolaire.</p>
      <button onClick={() => navigate('/portail')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
        Retour au tableau de bord
      </button>
    </motion.div>
  );

  const answered = SERVICES.filter(s => values[s.key]).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/portail')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />Retour
        </button>
        <div className="bg-gradient-to-r from-blue-900 to-cyan-800 rounded-2xl p-6 text-white">
          <div className="text-blue-200 text-xs uppercase tracking-wider mb-1">ISI / SUPTECH</div>
          <h1 className="text-2xl font-black">Questionnaire Qualité de Service</h1>
          <p className="text-blue-200 text-sm mt-2">Évaluez chaque service selon votre niveau de satisfaction.</p>
          <div className="mt-3 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">{answered}/{SERVICES.length} répondus</span>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {SERVICES.map((service, i) => (
          <motion.div key={service.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`bg-white rounded-xl border p-5 transition-all ${values[service.key] ? 'border-green-200' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{service.icon}</span>
              <span className={`font-bold text-sm ${service.highlight ? 'text-blue-700' : 'text-slate-800'}`}>{service.label}</span>
              {values[service.key] && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {NIVEAUX.map(n => (
                <label key={n.value}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-center ${values[service.key] === n.value ? n.color + ' border-2' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" {...register(service.key)} value={n.value} className="sr-only" />
                  <span className="text-xl">{n.emoji}</span>
                  <span className="text-xs font-medium leading-tight">{n.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Recommandation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="font-bold text-slate-800 mb-4">Je suis satisfait(e) et je recommanderais SUPTECH :</p>
          <div className="flex gap-4">
            {[{v: '1', l: '✅ OUI', c: 'text-green-700 bg-green-50 border-green-300'},{v: '0', l: '❌ NON', c: 'text-red-700 bg-red-50 border-red-300'}].map(opt => (
              <label key={opt.v} className={`flex-1 flex items-center justify-center py-4 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${values.recommande === opt.v ? opt.c : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" {...register('recommande')} value={opt.v} className="sr-only" />
                {opt.l}
              </label>
            ))}
          </div>
        </motion.div>

        {/* Commentaire */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <label className="text-slate-700 font-semibold text-sm mb-2 block">💬 Commentaire (optionnel)</label>
          <textarea {...register('commentaire')} rows={3}
            placeholder="Suggestions ou remarques sur les services..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors" />
        </motion.div>

        <motion.button type="submit" disabled={submitting}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2">
          {submitting ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi...</> : <><Send className="w-5 h-5" />Soumettre le questionnaire</>}
        </motion.button>
      </form>
    </div>
  );
}
