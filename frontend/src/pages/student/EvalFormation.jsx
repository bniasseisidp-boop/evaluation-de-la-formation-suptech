import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { evaluationAPI } from '../../services/api';

const SCORES = [1, 2, 3, 4, 5];

const SCORE_ITEMS = [
  { key: 'score_motivation',       label: "J'étais motivé(e) à suivre ce cours" },
  { key: 'score_objectifs',        label: "Les objectifs de la formation étaient clairs et précis" },
  { key: 'score_contenu',          label: "Le contenu de la formation correspondait à mes besoins et à mes préoccupations" },
  { key: 'score_techniques',       label: "Les techniques d'enseignement ont favorisé l'apprentissage" },
  { key: 'score_exercices',        label: "Les exercices et les activités étaient pertinents à la formation" },
  { key: 'score_formateur_comm',   label: "Le formateur communiquait d'une façon claire et dynamique" },
  { key: 'score_formateur_rythme', label: "Le formateur a respecté le rythme d'apprentissage des participants" },
  { key: 'score_connaissance',     label: "Cette formation m'a permis d'augmenter mon niveau de connaissance et d'habileté" },
  { key: 'score_application',      label: "Je compte mettre en application ces nouvelles compétences dès mon retour au travail" },
  { key: 'score_recommandation',   label: "Je recommanderais cette formation à mes collègues de travail" },
];

const OPEN_SECTIONS = [
  {
    key: 'pedagogie', title: 'I- Pédagogie', icon: '📚', color: 'blue',
    questions: [
      "Les objectifs de la formation ont-ils été clairement définis en début de session ?",
      "Comment évaluez-vous le programme en termes de savoir-faire ?",
      "Quelle unité d'enseignement du programme de formation vous a semblé la plus utile et pourquoi ?",
      "Comment évaluez-vous l'interactivité et la dynamique entre les formateurs et les étudiants ?",
    ]
  },
  {
    key: 'formateurs_avis', title: 'II- Formateurs', icon: '👨‍🏫', color: 'green',
    questions: [
      "Comment évaluez-vous le niveau de compétence et d'expertise des enseignants ?",
      "Avez-vous trouvé les enseignants disponibles et réceptifs à vos questions et besoins pendant la formation ?",
      "Quel est votre avis sur la complémentarité des différents intervenants ?",
    ]
  },
  {
    key: 'moyens_environnement', title: 'III- Moyens et Environnement', icon: '🏫', color: 'purple',
    questions: [
      "Comment évaluez-vous les locaux de l'ISI en termes de confort et de convivialité ?",
      "Avez-vous trouvé les supports de cours (documentation, matériel pédagogique) adaptés et pertinents ?",
      "Évaluez la qualité de la communication et des informations fournies avant la formation (horaires, lieux, modalités).",
    ]
  },
  {
    key: 'logistique', title: 'IV- Évaluation de la Logistique', icon: '⚙️', color: 'orange',
    questions: [
      "Évaluez la satisfaction concernant les horaires et la durée de la formation.",
      "Avez-vous rencontré des difficultés lors de votre inscription au programme de la formation ? Si oui, veuillez préciser.",
    ]
  },
];

const SECTION_COLORS = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-800',  badge: 'bg-green-100 text-green-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', badge: 'bg-purple-100 text-purple-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' },
};

export default function EvalFormation() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const { register, handleSubmit, watch } = useForm({ defaultValues: { type: 'detaillee' } });
  const values = watch();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      // Combiner les réponses de chaque section en un seul texte
      const combineSection = (key, questions) =>
        questions.map((q, i) => {
          const ans = formData[`${key}_q${i + 1}`];
          return ans ? `Q${i + 1}. ${q}\nRéponse : ${ans}` : '';
        }).filter(Boolean).join('\n\n');

      const pedagogie          = combineSection('pedagogie',          OPEN_SECTIONS[0].questions);
      const formateurs_avis    = combineSection('formateurs_avis',    OPEN_SECTIONS[1].questions);
      const moyens_environnement = combineSection('moyens_environnement', OPEN_SECTIONS[2].questions);
      const logistique         = combineSection('logistique',         OPEN_SECTIONS[3].questions);

      const benefices = [
        formData.ben_q1 ? `La formation a répondu à vos attentes ?\nRéponse : ${formData.ben_q1}` : '',
        formData.competences_pratique ? `Mise en pratique des compétences :\n${formData.competences_pratique}` : '',
        formData.ben_q3 ? `Objectifs professionnels atteints ?\nRéponse : ${formData.ben_q3}` : '',
      ].filter(Boolean).join('\n\n');

      const objectifs = ['a','b','c','d'].map(letter => ({
        label: letter,
        text:  formData[`obj_${letter}`] || '',
        oui:   formData[`obj_${letter}_oui`] === 'true',
      })).filter(o => o.text);

      const payload = {
        type:                       'detaillee',
        pedagogie:                  pedagogie || null,
        formateurs_avis:            formateurs_avis || null,
        moyens_environnement:       moyens_environnement || null,
        logistique:                 logistique || null,
        benefices:                  benefices || null,
        formation_repondu_attentes: formData.formation_repondu_attentes === 'true',
        competences_pratique:       formData.competences_pratique || null,
        commentaires_suggestions:   formData.commentaires_suggestions || null,
        emploi_trouve:              formData.emploi_trouve === '1',
        nature_emploi:              formData.nature_emploi || null,
        objectifs_session:          objectifs.length ? objectifs : null,
        ...SCORE_ITEMS.reduce((acc, item) => ({
          ...acc,
          [item.key]: parseInt(formData[item.key]) || null,
        }), {}),
      };

      await evaluationAPI.submitFormation(payload);
      setSubmitted(true);
      toast.success('Évaluation soumise ! Merci 🎉');
      setTimeout(() => navigate('/portail'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="text-center py-20">
      <div className="text-8xl mb-6">🌟</div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Merci pour votre participation !</h2>
      <p className="text-slate-500">Vos retours sont précieux pour ISI SUPTECH.</p>
    </motion.div>
  );

  const ScoreRow = ({ fieldKey, label, index }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * index }}
      className={`bg-white rounded-xl border p-4 transition-all ${values[fieldKey] ? 'border-blue-200' : 'border-slate-100'}`}>
      <p className="text-slate-700 text-sm font-medium leading-relaxed mb-3">{label}</p>
      <div className="flex gap-2">
        {SCORES.map(s => (
          <label key={s}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all ${parseInt(values[fieldKey]) === s ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
            <input type="radio" {...register(fieldKey)} value={s} className="sr-only" />
            <span className={`text-base font-black ${parseInt(values[fieldKey]) === s ? 'text-blue-700' : 'text-slate-400'}`}>{s}</span>
          </label>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/portail')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />Retour
        </button>
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-6 text-white">
          <div className="text-purple-200 text-xs uppercase tracking-wider mb-1">ISI / SUPTECH</div>
          <h1 className="text-2xl font-black">Évaluation de la Formation</h1>
          <p className="text-purple-200 text-sm mt-2">
            Répondez aux questions et attribuez une note de 1 à 5 aux énoncés ci-dessous.
          </p>
          <div className="mt-3 text-xs text-purple-300">
            1 = Tout à fait en désaccord &nbsp;•&nbsp; 5 = Tout à fait en accord
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Section : Objectifs de la session */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">📋 Objectifs de la session</h3>
          <p className="text-slate-500 text-xs mb-4">Les objectifs de la session sont-ils atteints ? (Optionnel)</p>
          {['a','b','c','d'].map(letter => (
            <div key={letter} className="flex items-center gap-3 mb-3">
              <span className="text-slate-600 font-bold text-sm uppercase w-5">{letter})</span>
              <input type="text" {...register(`obj_${letter}`)} placeholder={`Objectif ${letter.toUpperCase()}...`}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <div className="flex gap-1">
                {['OUI','NON'].map(v => (
                  <label key={v}
                    className={`px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs font-bold transition-colors ${
                      values[`obj_${letter}_oui`] === (v === 'OUI' ? 'true' : 'false')
                        ? (v === 'OUI' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700')
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}>
                    <input type="radio" {...register(`obj_${letter}_oui`)} value={v === 'OUI' ? 'true' : 'false'} className="sr-only" />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Sections ouvertes (Pédagogie, Formateurs, Moyens, Logistique) */}
        {OPEN_SECTIONS.map((section, si) => {
          const c = SECTION_COLORS[section.color];
          return (
            <motion.div key={section.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * si + 0.2 }}
              className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${c.title}`}>
                <span>{section.icon}</span>{section.title}
              </h3>
              <div className="space-y-4">
                {section.questions.map((q, qi) => (
                  <div key={qi}>
                    <label className="text-slate-700 text-sm font-medium mb-1.5 block leading-relaxed">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mr-2 ${c.badge}`}>{qi + 1}</span>
                      {q}
                    </label>
                    <textarea
                      {...register(`${section.key}_q${qi + 1}`)}
                      rows={2}
                      placeholder="Votre réponse..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* V- Bénéfices de la Formation */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 className="font-bold text-teal-800 text-base mb-4">🎯 V- Bénéfices de la Formation</h3>
          <div className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm font-medium mb-1.5 block">
                La formation a-t-elle répondu à vos attentes ?
              </label>
              <div className="flex gap-3 mb-2">
                {[{v:'true', l:'✅ OUI'},{v:'false', l:'❌ NON'}].map(opt => (
                  <label key={opt.v}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${
                      values.formation_repondu_attentes === opt.v
                        ? (opt.v === 'true' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700')
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                    <input type="radio" {...register('formation_repondu_attentes')} value={opt.v} className="sr-only" />{opt.l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-slate-700 text-sm font-medium mb-1.5 block">
                Avez-vous pu mettre en pratique les compétences acquises lors de la formation (stage, travail) ?
              </label>
              <textarea {...register('competences_pratique')} rows={2} placeholder="Votre réponse..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="text-slate-700 text-sm font-medium mb-1.5 block">
                La formation vous a-t-elle aidé à atteindre vos objectifs professionnels ? Si oui, expliquez en quoi.
              </label>
              <textarea {...register('ben_q3')} rows={2} placeholder="Votre réponse..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500" />
            </div>
          </div>
        </motion.div>

        {/* Scores 1-5 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <p className="text-white font-bold text-sm">Indiquez votre degré d'accord (1 à 5) :</p>
            <p className="text-slate-400 text-xs mt-1">
              1 = Tout à fait en désaccord &nbsp;|&nbsp; 2 = En désaccord &nbsp;|&nbsp; 3 = Plus ou moins &nbsp;|&nbsp; 4 = En accord &nbsp;|&nbsp; 5 = Tout à fait en accord
            </p>
          </div>
          <div className="space-y-3">
            {SCORE_ITEMS.map((item, i) => (
              <ScoreRow key={item.key} fieldKey={item.key} label={item.label} index={i} />
            ))}
          </div>
        </motion.div>

        {/* VI- Commentaires */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3">💬 VI- Commentaires et Suggestions</h3>
          <label className="text-slate-600 text-sm mb-2 block">
            Avez-vous des suggestions ou des commentaires supplémentaires pour nous aider à améliorer nos programmes de formation ?
          </label>
          <textarea {...register('commentaires_suggestions')} rows={4}
            placeholder="Vos suggestions pour améliorer la formation..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500" />
        </motion.div>

        {/* Suivi Post-Formation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 mb-3">🚀 Suivi Post-Formation</h3>
          <p className="text-slate-600 text-sm mb-3">
            Avez-vous réussi à trouver un emploi ou à améliorer votre situation professionnelle suite à la formation ?
          </p>
          <div className="flex gap-3 mb-4">
            {[{v:'1',l:'✅ Oui'},{v:'0',l:'❌ Non'}].map(opt => (
              <label key={opt.v}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer text-sm font-bold transition-all ${
                  values.emploi_trouve === opt.v
                    ? (opt.v === '1' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-slate-50 border-slate-400 text-slate-600')
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                <input type="radio" {...register('emploi_trouve')} value={opt.v} className="sr-only" />{opt.l}
              </label>
            ))}
          </div>
          {values.emploi_trouve === '1' && (
            <textarea {...register('nature_emploi')} rows={2}
              placeholder="Précisez la nature de l'emploi ou de l'amélioration professionnelle obtenue..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500" />
          )}
        </motion.div>

        <motion.button type="submit" disabled={submitting}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2">
          {submitting
            ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi...</>
            : <><Send className="w-5 h-5" />Soumettre l'évaluation</>}
        </motion.button>
      </form>
    </div>
  );
}
