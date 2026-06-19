import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, Clock, CheckCircle, AlertTriangle, RefreshCw, Mail, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';
const labelCls = 'block text-slate-700 text-sm font-semibold mb-1.5';

export default function AdminEmailsRapports() {
  const [config, setConfig]         = useState({ scheduled_at: '', last_sent_at: null });
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [sending, setSending]       = useState(false);
  const [tab, setTab]               = useState('planning'); // 'planning' | 'historique'
  const [showConfirm, setShowConfirm] = useState(false);
  const [forceResend, setForceResend] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cfgRes, logsRes] = await Promise.all([
        api.get('/admin/emails/config'),
        api.get('/admin/emails/historique'),
      ]);
      setConfig(cfgRes.data);
      setLogs(logsRes.data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const savePlanning = async () => {
    setSaving(true);
    try {
      await api.post('/admin/emails/config', { scheduled_at: config.scheduled_at || null });
      toast.success('Planning sauvegardé !');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const envoyerMaintenant = async (force = false) => {
    setSending(true);
    setShowConfirm(false);
    try {
      const r = await api.post('/admin/emails/envoyer', { force });
      toast.success(r.data.message);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally { setSending(false); }
  };

  const profs = [...new Map(logs.map(l => [l.professeur_id, l])).values()];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-600" /> Envoi des rapports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Planifiez ou déclenchez l'envoi des rapports d'évaluation aux professeurs
          </p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-blue-600">{logs.length}</div>
          <div className="text-slate-500 text-sm">Emails envoyés (total)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-black text-green-600">{profs.length}</div>
          <div className="text-slate-500 text-sm">Professeurs notifiés</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-slate-700">
            {config.last_sent_at
              ? new Date(config.last_sent_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
              : '—'}
          </div>
          <div className="text-slate-500 text-sm">Dernier envoi</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'planning',    label: 'Planning & Envoi', icon: Calendar },
          { id: 'historique',  label: 'Historique des emails', icon: CheckCircle },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {tab === 'planning' ? (
            <motion.div key="planning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Planification automatique */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Envoi automatique planifié</h2>
                    <p className="text-slate-400 text-xs">Le système vérifie chaque jour à 07h00</p>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Date et heure d'envoi automatique</label>
                  <input type="datetime-local" value={config.scheduled_at?.slice(0, 16) || ''}
                    onChange={e => setConfig(c => ({ ...c, scheduled_at: e.target.value }))}
                    className={inputCls} />
                  <p className="text-slate-400 text-xs mt-2">
                    À cette date, les rapports seront automatiquement envoyés à tous les professeurs ayant au moins 1 évaluation (même si tous les étudiants n'ont pas évalué).
                  </p>
                </div>

                {config.scheduled_at && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                    new Date(config.scheduled_at) > new Date()
                      ? 'bg-blue-50 border border-blue-100 text-blue-700'
                      : 'bg-orange-50 border border-orange-100 text-orange-700'
                  }`}>
                    <Clock className="w-4 h-4 shrink-0" />
                    {new Date(config.scheduled_at) > new Date()
                      ? `Planifié pour le ${new Date(config.scheduled_at).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}`
                      : 'Date passée — les emails ont dû être envoyés'}
                  </div>
                )}

                <button onClick={savePlanning} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><Calendar className="w-4 h-4" />Sauvegarder le planning</>}
                </button>
              </div>

              {/* Envoi manuel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Envoi immédiat</h2>
                    <p className="text-slate-400 text-xs">Déclenche l'envoi maintenant sans attendre la date</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-sm">
                    Seuls les professeurs dont le rapport n'a <strong>pas encore été envoyé</strong> cette année recevront un email. Utilisez l'option "Forcer le renvoi" pour renvoyer à tous.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={forceResend} onChange={e => setForceResend(e.target.checked)}
                    className="w-4 h-4 accent-red-600" />
                  <span className="text-slate-700 text-sm">Forcer le renvoi (même aux profs déjà notifiés)</span>
                </label>

                <button onClick={() => setShowConfirm(true)} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm">
                  {sending
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi en cours...</>
                    : <><Send className="w-4 h-4" />Envoyer maintenant</>}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="historique" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {logs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">Aucun email envoyé pour le moment</p>
                  <p className="text-slate-400 text-sm mt-1">Les emails apparaîtront ici après l'envoi</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Professeur</th>
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Matière</th>
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Classe</th>
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Score</th>
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Nb évals</th>
                          <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">Envoyé le</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                            className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800">
                                {log.professeur?.prenom} {log.professeur?.nom}
                              </div>
                              <div className="text-slate-400 text-xs">{log.professeur?.email}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{log.cmp?.matiere?.nom || '—'}</td>
                            <td className="px-4 py-3 text-slate-700">{log.cmp?.classe?.nom || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${
                                log.score_moyen >= 70 ? 'text-green-600' : log.score_moyen >= 50 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {log.score_moyen ? `${log.score_moyen}%` : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{log.nb_evaluations}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {new Date(log.sent_at).toLocaleDateString('fr-FR', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Confirmer l'envoi</h3>
                <button onClick={() => setShowConfirm(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <p className="text-slate-600 text-sm mb-5">
                {forceResend
                  ? 'Voulez-vous envoyer les rapports à TOUS les professeurs avec des évaluations, même ceux déjà notifiés ?'
                  : 'Voulez-vous envoyer maintenant les rapports aux professeurs qui n\'ont pas encore été notifiés cette année ?'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                  Annuler
                </button>
                <button onClick={() => envoyerMaintenant(forceResend)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                  <Send className="w-4 h-4" />Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
