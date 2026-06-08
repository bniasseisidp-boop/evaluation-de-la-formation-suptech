import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Plus, Trash2, RefreshCw, Send, X, CheckCircle, Clock,
  AlertCircle, Upload, Eye, Copy, FileSpreadsheet, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { invitationAPI, filiereAPI, classeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

/* ── helpers ── */
function StatusBadge({ inv }) {
  if (inv.used_at)
    return <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Utilisée</span>;
  if (new Date(inv.expires_at) < new Date())
    return <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" />Expirée</span>;
  return <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />En attente</span>;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copié !'));
}

/* ── Modale mot de passe généré ── */
function CredentialsModal({ creds, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">Invitation créée !</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          L'invitation a été créée. Si l'email n'arrive pas, transmettez ces identifiants à l'étudiant manuellement.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-500 text-xs font-semibold uppercase">Email</div>
              <div className="text-slate-900 font-mono text-sm font-bold">{creds.email}</div>
            </div>
            <button onClick={() => copyText(creds.email)} className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="border-t border-blue-100" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-500 text-xs font-semibold uppercase">Mot de passe temporaire</div>
              <div className="text-slate-900 font-mono text-lg font-black tracking-widest">{creds.temp_password}</div>
            </div>
            <button onClick={() => copyText(creds.temp_password)} className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-3">⚠️ Ce mot de passe est temporaire et ne sera plus affiché.</p>
        <button onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

/* ── Composant principal ── */
export default function AdminInvitations() {
  const [invitations, setInvitations]     = useState([]);
  const [filieres, setFilieres]           = useState([]);
  const [classes, setClasses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [resending, setResending]         = useState(null);
  const [creds, setCreds]                 = useState(null);

  /* import Excel */
  const [xlsxRows, setXlsxRows]     = useState([]);
  const [xlsxPreview, setXlsxPreview] = useState(false);
  const [importing, setImporting]   = useState(false);
  const fileRef = useRef();

  const form1 = useForm();
  const form2 = useForm();
  const watchedFiliere = form1.watch('filiere_id');
  const bulkFiliere    = form2.watch('filiere_id');
  const bulkClasse     = form2.watch('classe_id');

  const load = () => {
    invitationAPI.list()
      .then(r => setInvitations(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    filiereAPI.list().then(r => setFilieres(r.data)).catch(() => {});
    classeAPI.list().then(r => setClasses(r.data)).catch(() => {});
    load();
  }, []);

  const classesForFiliere = (fid) => classes.filter(c => c.filiere_id === parseInt(fid));

  /* ── Invitation individuelle ── */
  const onSend = async (data) => {
    try {
      const r = await invitationAPI.send(data);
      setShowModal(false);
      form1.reset({});
      load();
      if (r.data?.temp_password) {
        setCreds({ email: data.email, temp_password: r.data.temp_password });
      } else {
        toast.success('Invitation envoyée !');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  /* ── Bulk par textarea ── */
  const onBulk = async (data) => {
    const emails = data.emails.split('\n').map(e => e.trim()).filter(Boolean);
    try {
      const r = await invitationAPI.bulk({ emails, filiere_id: data.filiere_id, classe_id: data.classe_id });
      toast.success(`${r.data.sent} invitation(s) envoyée(s) !`);
      setShowBulkModal(false);
      form2.reset({});
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  /* ── Import Excel ── */
  const handleExcelFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb   = XLSX.read(ev.target.result, { type: 'binary' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const rows = raw.map(row => {
        const keys = Object.keys(row).map(k => k.toLowerCase().trim());
        const get  = (variants) => {
          const k = Object.keys(row).find(k => variants.includes(k.toLowerCase().trim()));
          return k ? String(row[k]).trim() : '';
        };
        return {
          email:  get(['email', 'e-mail', 'mail', 'courriel']),
          prenom: get(['prenom', 'prénom', 'first name', 'firstname', 'prénom(s)']),
          nom:    get(['nom', 'name', 'last name', 'lastname', 'nom de famille']),
        };
      }).filter(r => r.email);

      setXlsxRows(rows);
      setXlsxPreview(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!bulkFiliere || !bulkClasse) { toast.error('Sélectionne filière et classe d\'abord'); return; }
    const validRows = xlsxRows.filter(r => r.email && r.email.includes('@'));
    if (validRows.length === 0) { toast.error('Aucune ligne valide'); return; }
    setImporting(true);
    let sent = 0;
    for (const row of validRows) {
      try {
        await invitationAPI.send({
          email:      row.email,
          nom:        `${row.prenom} ${row.nom}`.trim() || row.email.split('@')[0],
          filiere_id: bulkFiliere,
          classe_id:  bulkClasse,
        });
        sent++;
      } catch {}
    }
    toast.success(`${sent}/${validRows.length} invitation(s) envoyée(s) !`);
    setXlsxPreview(false);
    setXlsxRows([]);
    setShowBulkModal(false);
    form2.reset({});
    load();
    setImporting(false);
  };

  /* ── Actions ── */
  const handleResend = async (id) => {
    setResending(id);
    try {
      const r = await invitationAPI.resend(id);
      if (r.data?.temp_password) {
        const inv = invitations.find(i => i.id === id);
        setCreds({ email: inv?.email || '', temp_password: r.data.temp_password });
      } else {
        toast.success('Email renvoyé !');
      }
    } catch { toast.error('Erreur lors du renvoi'); }
    finally { setResending(null); }
  };

  const handleDelete = async (inv) => {
    if (!confirm(`Supprimer l'invitation pour ${inv.email} ?`)) return;
    try { await invitationAPI.delete(inv.id); toast.success('Supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  const stats = {
    total:   invitations.length,
    used:    invitations.filter(i => i.used_at).length,
    pending: invitations.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length,
    expired: invitations.filter(i => !i.used_at && new Date(i.expires_at) < new Date()).length,
  };

  /* ── Rendu ── */
  const inputCls = 'w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm';
  const labelCls = 'text-slate-600 text-sm mb-1.5 block font-medium';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Invitations</h1>
          <p className="text-slate-500 text-sm mt-1">Gérer les accès étudiants à la plateforme</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { form2.reset({}); setXlsxRows([]); setXlsxPreview(false); setShowBulkModal(true); }}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 bg-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Users className="w-4 h-4" />Bulk
          </button>
          <button onClick={() => { form1.reset({}); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />Inviter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: stats.total,   bg: 'bg-blue-50',  text: 'text-blue-700' },
          { label: 'Utilisées',  value: stats.used,    bg: 'bg-green-50', text: 'text-green-700' },
          { label: 'En attente', value: stats.pending, bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Expirées',   value: stats.expired, bg: 'bg-red-50',   text: 'text-red-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className={`text-2xl font-black ${s.text}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <Mail className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Aucune invitation envoyée pour l'instant.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Email','Nom','Filière / Classe','Statut','Envoyé le','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-semibold uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv, i) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 text-xs font-medium">{inv.email}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{inv.nom || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700 text-xs font-medium">{inv.filiere?.nom || '—'}</div>
                    <div className="text-slate-400 text-xs">{inv.classe?.nom || '—'}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge inv={inv} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(inv.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!inv.used_at && (
                        <button onClick={() => handleResend(inv.id)} disabled={resending === inv.id}
                          title="Renvoyer / Voir mot de passe"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50">
                          <RefreshCw className={`w-3.5 h-3.5 ${resending === inv.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(inv)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
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

      {/* ── Modales ── */}
      <AnimatePresence>

        {/* Invitation individuelle */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-900 font-bold">Inviter un étudiant</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={form1.handleSubmit(onSend)} className="space-y-4">
                <div>
                  <label className={labelCls}>Email *</label>
                  <input {...form1.register('email', { required: 'Requis', pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' } })}
                    type="email" placeholder="etudiant@isi.sn" className={inputCls} />
                  {form1.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Prénom</label>
                    <input {...form1.register('prenom')} placeholder="Mamadou" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Nom</label>
                    <input {...form1.register('nom_famille')} placeholder="DIALLO" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Matricule</label>
                  <input {...form1.register('matricule')} placeholder="ISI-XXXX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Filière *</label>
                  <select {...form1.register('filiere_id', { required: 'Requis' })} className={inputCls}>
                    <option value="">Sélectionner...</option>
                    {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                  {form1.formState.errors.filiere_id && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.filiere_id.message}</p>}
                </div>
                {watchedFiliere && (
                  <div>
                    <label className={labelCls}>Classe *</label>
                    <select {...form1.register('classe_id', { required: 'Requis' })} className={inputCls}>
                      <option value="">Sélectionner...</option>
                      {classesForFiliere(watchedFiliere).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 text-sm transition-colors">Annuler</button>
                  <button type="submit" disabled={form1.formState.isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                    {form1.formState.isSubmitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer l'invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Bulk / Import Excel */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-900 font-bold">Invitation en masse</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>

              {/* Filière + Classe (commun aux deux méthodes) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className={labelCls}>Filière *</label>
                  <select {...form2.register('filiere_id', { required: true })} className={inputCls}>
                    <option value="">Sélectionner...</option>
                    {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                {bulkFiliere && (
                  <div>
                    <label className={labelCls}>Classe *</label>
                    <select {...form2.register('classe_id', { required: true })} className={inputCls}>
                      <option value="">Sélectionner...</option>
                      {classesForFiliere(bulkFiliere).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Import Excel */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-800 font-semibold text-sm">Importer depuis Excel</span>
                  <span className="text-xs text-slate-400 ml-auto">Colonnes : email, prenom, nom</span>
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelFile} />

                {xlsxRows.length === 0 ? (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium">
                    <Upload className="w-4 h-4" />Choisir un fichier Excel / CSV
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 text-xs font-medium">{xlsxRows.length} ligne(s) détectée(s)</span>
                      <button onClick={() => { setXlsxRows([]); setXlsxPreview(false); }} className="text-red-400 hover:text-red-600 text-xs">Effacer</button>
                    </div>
                    {xlsxPreview && (
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              {['Email','Prénom','Nom','Valide'].map(h => (
                                <th key={h} className="px-3 py-2 text-left text-slate-500 font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {xlsxRows.map((r, i) => {
                              const valid = r.email && r.email.includes('@');
                              return (
                                <tr key={i} className={`border-t border-slate-50 ${!valid ? 'bg-red-50' : ''}`}>
                                  <td className="px-3 py-1.5 text-slate-700 font-mono">{r.email || <span className="text-red-400 italic">manquant</span>}</td>
                                  <td className="px-3 py-1.5 text-slate-600">{r.prenom || '—'}</td>
                                  <td className="px-3 py-1.5 text-slate-600">{r.nom || '—'}</td>
                                  <td className="px-3 py-1.5">
                                    {valid
                                      ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                      : <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!xlsxPreview && (
                      <button onClick={() => setXlsxPreview(true)} className="text-blue-600 text-xs underline">Voir la prévisualisation</button>
                    )}
                    <button onClick={handleImport} disabled={importing || !bulkFiliere || !bulkClasse}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                      {importing
                        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Import en cours…</>
                        : <><Upload className="w-4 h-4" />Importer {xlsxRows.filter(r => r.email?.includes('@')).length} étudiant(s)</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Séparateur */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-slate-400 text-xs font-medium">OU saisie manuelle</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Textarea bulk */}
              <form onSubmit={form2.handleSubmit(onBulk)} className="space-y-3">
                <div>
                  <label className={labelCls}>Emails (un par ligne)</label>
                  <textarea {...form2.register('emails', { required: 'Requis' })} rows={5}
                    placeholder={'etudiant1@isi.sn\netudiant2@gmail.com\netudiant3@isi.sn'}
                    className={`${inputCls} resize-none font-mono`} />
                </div>
                <p className="text-slate-400 text-xs">Les emails déjà invités seront ignorés.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowBulkModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm transition-colors">Annuler</button>
                  <button type="submit" disabled={form2.formState.isSubmitting || !bulkFiliere || !bulkClasse}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                    {form2.formState.isSubmitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer tout
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credentials modal */}
      <AnimatePresence>
        {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
      </AnimatePresence>
    </div>
  );
}
