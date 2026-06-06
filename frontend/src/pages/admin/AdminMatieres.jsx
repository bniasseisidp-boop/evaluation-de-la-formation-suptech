import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, BookMarked } from 'lucide-react';
import { matiereAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const SEMESTRES = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];

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

export default function AdminMatieres() {
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => matiereAPI.list().then(r => setMatieres(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); reset(m); setShowModal(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) { await matiereAPI.update(editing.id, data); toast.success('Matière modifiée'); }
      else { await matiereAPI.create(data); toast.success('Matière créée !'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (m) => {
    if (!confirm(`Supprimer la matière "${m.nom}" ?`)) return;
    try { await matiereAPI.delete(m.id); toast.success('Matière supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  const filtered = matieres.filter(m => {
    const q = search.toLowerCase();
    return !q || `${m.nom} ${m.code || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Matières</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} matière(s)</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="bg-slate-800 border border-white/10 text-slate-300 placeholder-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-44" />
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Ajouter
          </button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
      : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
          <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune matière trouvée.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Matière', 'Code', 'Semestre', 'Crédits', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">{m.nom}</div>
                    {m.description && <div className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{m.description}</div>}
                  </td>
                  <td className="px-4 py-3"><span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">{m.code}</span></td>
                  <td className="px-4 py-3"><span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{m.semestre || '—'}</span></td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{m.credits || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? 'Modifier la matière' : 'Nouvelle matière'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Nom de la matière *</label>
                <input {...register('nom', { required: 'Requis' })} placeholder="Ex: Algorithmique et Programmation"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Code *</label>
                <input {...register('code', { required: 'Requis' })} placeholder="Ex: ALGO"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Semestre</label>
                  <select {...register('semestre')}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-slate-800">—</option>
                    {SEMESTRES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Crédits</label>
                  <input {...register('credits')} type="number" placeholder="Ex: 3"
                    className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Description</label>
                <textarea {...register('description')} rows={3} placeholder="Description courte de la matière..."
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm">Annuler</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                  <Save className="w-4 h-4" />{editing ? 'Sauvegarder' : 'Créer'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
