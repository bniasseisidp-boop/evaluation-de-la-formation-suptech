import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { adminUserAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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

function PasswordInput({ register: reg, name, label, required = false, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-slate-300 text-sm mb-1.5 block">{label}</label>
      <div className="relative">
        <input {...reg(name, required ? { required: 'Requis', minLength: { value: 8, message: 'Min 8 caractères' } } : {})}
          type={show ? 'text' : 'password'} placeholder={placeholder || '••••••••'}
          className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-500" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user: me } = useAuthStore();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => adminUserAPI.list().then(r => setAdmins(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); reset({ name: a.name, email: a.email }); setShowModal(true); };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        if (!data.password) { delete data.password; delete data.password_confirmation; }
        await adminUserAPI.update(editing.id, data);
        toast.success('Admin modifié');
      } else {
        await adminUserAPI.create(data);
        toast.success('Nouvel admin créé !');
      }
      setShowModal(false); load();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Erreur';
      toast.error(msg);
    }
  };

  const handleDelete = async (a) => {
    if (a.id === me?.id) { toast.error('Vous ne pouvez pas supprimer votre propre compte.'); return; }
    if (!confirm(`Supprimer l'admin "${a.name}" (${a.email}) ?`)) return;
    try { await adminUserAPI.delete(a.id); toast.success('Admin supprimé'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Administrateurs</h1>
          <p className="text-slate-500 text-sm mt-1">{admins.length} admin(s) configuré(s)</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" />Ajouter un admin
        </button>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-sm">
          Les administrateurs ont un accès complet à la plateforme. Partagez les identifiants uniquement avec des personnes de confiance.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {getInitials(a.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold text-sm truncate">{a.name}</span>
                    {a.id === me?.id && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">Vous</span>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5 truncate">{a.email}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-blue-600 text-xs font-semibold">Administrateur</span>
                  </div>
                </div>
              </div>
              <div className="text-slate-400 text-xs mb-4">
                Créé le {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium">
                  <Edit2 className="w-3.5 h-3.5" />Modifier
                </button>
                {a.id !== me?.id && (
                  <button onClick={() => handleDelete(a)}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? "Modifier l'admin" : 'Nouvel administrateur'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Nom complet *</label>
                <input {...register('name', { required: 'Requis' })} placeholder="Ex: Moussa DIALLO"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Email *</label>
                <input {...register('email', { required: 'Requis', pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' } })}
                  type="email" placeholder="admin@isi.sn"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <PasswordInput register={register} name="password"
                label={editing ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}
                required={!editing} />
              {errors.password && <p className="text-red-400 text-xs -mt-2">{errors.password.message}</p>}
              <PasswordInput register={register} name="password_confirmation"
                label="Confirmer le mot de passe" placeholder="Confirmer..." />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">Annuler</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? 'Sauvegarder' : "Créer l'admin"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
