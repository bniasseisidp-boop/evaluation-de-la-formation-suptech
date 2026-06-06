import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, UserCheck } from 'lucide-react';
import { professeurAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const GRADES = ['Assistant','Chargé de cours','Maître de conférences','Professeur','Vacataire','Professionnel','Formateur'];

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

export default function AdminProfesseurs() {
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => professeurAPI.list().then(r => setProfs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); reset(p); setShowModal(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) { await professeurAPI.update(editing.id, data); toast.success('Professeur modifié'); }
      else { await professeurAPI.create(data); toast.success('Professeur ajouté !'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer le professeur "${p.prenom} ${p.nom}" ?`)) return;
    try { await professeurAPI.delete(p.id); toast.success('Professeur supprimé'); load(); }
    catch { toast.error('Erreur lors de la suppression'); }
  };

  const filtered = profs.filter(p => {
    const q = search.toLowerCase();
    return !q || `${p.prenom} ${p.nom} ${p.specialite || ''}`.toLowerCase().includes(q);
  });

  const getInitials = (p) => `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Professeurs</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} professeur(s)</p>
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
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun professeur trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * i }}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-5 card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {getInitials(p)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm">{p.prenom} {p.nom}</div>
                  {p.specialite && <div className="text-slate-400 text-xs mt-0.5 truncate">{p.specialite}</div>}
                  {p.grade && <div className="mt-1"><span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{p.grade}</span></div>}
                </div>
              </div>
              {p.email && <div className="text-slate-500 text-xs mb-4 truncate">✉️ {p.email}</div>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors text-xs font-medium">
                  <Edit2 className="w-3.5 h-3.5" />Modifier
                </button>
                <button onClick={() => handleDelete(p)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? 'Modifier le professeur' : 'Nouveau professeur'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Prénom *</label>
                  <input {...register('prenom', { required: 'Requis' })} placeholder="Ex: Moussa"
                    className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  {errors.prenom && <p className="text-red-400 text-xs mt-1">{errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-1.5 block">Nom *</label>
                  <input {...register('nom', { required: 'Requis' })} placeholder="Ex: DIALLO"
                    className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                  {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Email</label>
                <input {...register('email')} type="email" placeholder="professeur@isi.sn"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Spécialité</label>
                <input {...register('specialite')} placeholder="Ex: Réseaux & Sécurité"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Grade</label>
                <select {...register('grade')}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="" className="bg-slate-800">Sélectionner...</option>
                  {GRADES.map(g => <option key={g} value={g} className="bg-slate-800">{g}</option>)}
                </select>
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
