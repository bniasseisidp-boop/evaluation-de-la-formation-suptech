import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Plus, Trash2, RefreshCw, Send, X, Save, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { invitationAPI, filiereAPI, classeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function StatusBadge({ inv }) {
  if (inv.used_at) return <span className="flex items-center gap-1 text-xs text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Utilisée</span>;
  if (new Date(inv.expires_at) < new Date()) return <span className="flex items-center gap-1 text-xs text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" />Expirée</span>;
  return <span className="flex items-center gap-1 text-xs text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />En attente</span>;
}

export default function AdminInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [resending, setResending] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const { register: regBulk, handleSubmit: submitBulk, reset: resetBulk, watch: watchBulk, formState: { isSubmitting: isBulkSubmitting } } = useForm();

  const watchedFiliere = watch('filiere_id');
  const bulkFiliere = watchBulk('filiere_id');

  const load = () => invitationAPI.list().then(r => setInvitations(r.data)).finally(() => setLoading(false));
  useEffect(() => {
    Promise.all([filiereAPI.list(), classeAPI.list()]).then(([f, c]) => { setFilieres(f.data); setClasses(c.data); });
    load();
  }, []);

  const classesForFiliere = (fid) => classes.filter(c => c.filiere_id === parseInt(fid));

  const onSend = async (data) => {
    try {
      await invitationAPI.send(data);
      toast.success('Invitation envoyée !');
      setShowModal(false); reset({}); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const onBulk = async (data) => {
    const emails = data.emails.split('\n').map(e => e.trim()).filter(Boolean);
    try {
      const r = await invitationAPI.bulk({ emails, filiere_id: data.filiere_id, classe_id: data.classe_id });
      toast.success(`${r.data.sent} invitation(s) envoyée(s) !`);
      setShowBulkModal(false); resetBulk({}); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleResend = async (id) => {
    setResending(id);
    try { await invitationAPI.resend(id); toast.success('Email renvoyé !'); }
    catch { toast.error('Erreur lors du renvoi'); }
    finally { setResending(null); }
  };

  const handleDelete = async (inv) => {
    if (!confirm(`Supprimer l'invitation pour ${inv.email} ?`)) return;
    try { await invitationAPI.delete(inv.id); toast.success('Supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  const stats = {
    total: invitations.length,
    used: invitations.filter(i => i.used_at).length,
    pending: invitations.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length,
    expired: invitations.filter(i => !i.used_at && new Date(i.expires_at) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Invitations</h1>
          <p className="text-slate-400 text-sm mt-1">Gérer les accès étudiants à la plateforme</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { resetBulk({}); setShowBulkModal(true); }}
            className="flex items-center gap-2 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Send className="w-4 h-4" />Bulk
          </button>
          <button onClick={() => { reset({}); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Inviter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Utilisées', value: stats.used, color: 'green' },
          { label: 'En attente', value: stats.pending, color: 'yellow' },
          { label: 'Expirées', value: stats.expired, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color === 'blue' ? 'text-blue-400' : s.color === 'green' ? 'text-green-400' : s.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
      : invitations.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
          <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune invitation envoyée pour l'instant.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                {['Email', 'Nom', 'Filière / Classe', 'Statut', 'Envoyé le', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv, i) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white text-xs">{inv.email}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{inv.nom || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-300 text-xs">{inv.filiere?.nom || '—'}</div>
                    <div className="text-slate-500 text-xs">{inv.classe?.nom || '—'}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge inv={inv} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(inv.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!inv.used_at && (
                        <button onClick={() => handleResend(inv.id)} disabled={resending === inv.id}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                          <RefreshCw className={`w-3.5 h-3.5 ${resending === inv.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(inv)} className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
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

      {/* Single invite modal */}
      <AnimatePresence>
        {showModal && (
          <Modal title="Inviter un étudiant" onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSend)} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Email *</label>
                <input {...register('email', { required: 'Requis', pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' } })}
                  type="email" placeholder="etudiant@isi.sn"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Nom complet</label>
                <input {...register('nom')} placeholder="Prénom Nom"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Matricule</label>
                <input {...register('matricule')} placeholder="ISI-XXXX"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Filière *</label>
                <select {...register('filiere_id', { required: 'Requis' })}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="" className="bg-slate-800">Sélectionner...</option>
                  {filieres.map(f => <option key={f.id} value={f.id} className="bg-slate-800">{f.nom}</option>)}
                </select>
                {errors.filiere_id && <p className="text-red-400 text-xs mt-1">{errors.filiere_id.message}</p>}
              </div>
              {watchedFiliere && (
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Classe *</label>
                  <select {...register('classe_id', { required: 'Requis' })}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-slate-800">Sélectionner...</option>
                    {classesForFiliere(watchedFiliere).map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.nom}</option>)}
                  </select>
                  {errors.classe_id && <p className="text-red-400 text-xs mt-1">{errors.classe_id.message}</p>}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm">Annuler</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Bulk modal */}
        {showBulkModal && (
          <Modal title="Invitation en masse" onClose={() => setShowBulkModal(false)}>
            <form onSubmit={submitBulk(onBulk)} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Emails (un par ligne) *</label>
                <textarea {...regBulk('emails', { required: 'Requis' })} rows={6}
                  placeholder="etudiant1@isi.sn&#10;etudiant2@isi.sn&#10;etudiant3@isi.sn"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none font-mono" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Filière *</label>
                <select {...regBulk('filiere_id', { required: 'Requis' })}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="" className="bg-slate-800">Sélectionner...</option>
                  {filieres.map(f => <option key={f.id} value={f.id} className="bg-slate-800">{f.nom}</option>)}
                </select>
              </div>
              {bulkFiliere && (
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Classe *</label>
                  <select {...regBulk('classe_id', { required: 'Requis' })}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-slate-800">Sélectionner...</option>
                    {classesForFiliere(bulkFiliere).map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.nom}</option>)}
                  </select>
                </div>
              )}
              <p className="text-slate-500 text-xs">Les emails déjà invités seront ignorés. Un mot de passe temporaire sera envoyé à chaque adresse.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm">Annuler</button>
                <button type="submit" disabled={isBulkSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">
                  {isBulkSubmitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer tout
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
