import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, BookOpen } from 'lucide-react';
import { filiereAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const COLORS = ['#1e3a8a','#0ea5e9','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#be185d'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function AdminFilieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const load = () => filiereAPI.list().then(r => setFilieres(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ couleur: '#1e3a8a' }); setShowModal(true); };
  const openEdit = (f) => { setEditing(f); reset(f); setShowModal(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) { await filiereAPI.update(editing.id, data); toast.success('Filière modifiée'); }
      else { await filiereAPI.create(data); toast.success('Filière créée !'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (f) => {
    if (!confirm(`Supprimer "${f.nom}" ? Toutes les classes associées seront supprimées.`)) return;
    try { await filiereAPI.delete(f.id); toast.success('Filière supprimée'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Filières</h1>
          <p className="text-slate-500 text-sm mt-1">{filieres.length} filière(s) configurée(s)</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" />Ajouter une filière
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filieres.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Aucune filière. Commencez par en ajouter une.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filieres.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-2" style={{ background: f.couleur }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-slate-900 font-bold">{f.nom}</div>
                    <div className="text-slate-500 text-xs mt-0.5 font-mono">{f.code}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: f.couleur + '22', border: `2px solid ${f.couleur}` }} />
                </div>
                {f.description && <p className="text-slate-500 text-xs mb-4 leading-relaxed">{f.description}</p>}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span>📚 {f.classes_count || 0} classes</span>
                  <span>👥 {f.etudiants_count || 0} étudiants</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(f)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium">
                    <Edit2 className="w-3.5 h-3.5" />Modifier
                  </button>
                  <button onClick={() => handleDelete(f)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? 'Modifier la filière' : 'Nouvelle filière'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { label: 'Nom de la filière *', key: 'nom', placeholder: 'Ex: Génie Logiciel' },
                { label: 'Code *', key: 'code', placeholder: 'Ex: GL' },
                { label: 'Description', key: 'description', placeholder: 'Description courte...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-slate-300 text-sm mb-1.5 block">{f.label}</label>
                  <input {...register(f.key, f.key !== 'description' ? { required: 'Requis' } : {})}
                    placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key].message}</p>}
                </div>
              ))}
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setValue('couleur', c)}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: c, borderColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Annuler</button>
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
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
