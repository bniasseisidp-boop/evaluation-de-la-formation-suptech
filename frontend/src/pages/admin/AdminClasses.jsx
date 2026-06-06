import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Link, Unlink, GraduationCap } from 'lucide-react';
import { classeAPI, filiereAPI, cmpAPI, professeurAPI, matiereAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const NIVEAUX = ['BT1','BT2','BT3','L1','L2','L3','M1','M2','FC_L1','FC_L2','FC_L3'];

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

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCmpModal, setShowCmpModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [cmps, setCmps] = useState([]);
  const [filterFiliere, setFilterFiliere] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regCmp, handleSubmit: submitCmp, reset: resetCmp } = useForm();

  const load = () => {
    Promise.all([classeAPI.list(), filiereAPI.list(), professeurAPI.list(), matiereAPI.list()])
      .then(([c, f, p, m]) => { setClasses(c.data); setFilieres(f.data); setProfesseurs(p.data); setMatieres(m.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); reset({ ...c, filiere_id: c.filiere_id }); setShowModal(true); };

  const openCmp = async (classe) => {
    setSelectedClasse(classe);
    const r = await cmpAPI.list(classe.id);
    setCmps(r.data);
    resetCmp({});
    setShowCmpModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) { await classeAPI.update(editing.id, data); toast.success('Classe modifiée'); }
      else { await classeAPI.create(data); toast.success('Classe créée !'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const onAddCmp = async (data) => {
    try {
      await cmpAPI.create({ ...data, classe_id: selectedClasse.id });
      toast.success('Association ajoutée !');
      const r = await cmpAPI.list(selectedClasse.id);
      setCmps(r.data); resetCmp({});
    } catch (err) { toast.error(err.response?.data?.message || 'Déjà associé ou erreur'); }
  };

  const removeCmp = async (id) => {
    await cmpAPI.delete(id);
    toast.success('Association supprimée');
    const r = await cmpAPI.list(selectedClasse.id);
    setCmps(r.data);
  };

  const handleDelete = async (c) => {
    if (!confirm(`Supprimer la classe "${c.nom}" ?`)) return;
    try { await classeAPI.delete(c.id); toast.success('Classe supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  const filtered = filterFiliere ? classes.filter(c => c.filiere_id === parseInt(filterFiliere)) : classes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Classes</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} classe(s)</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}
            className="bg-slate-800 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">Toutes les filières</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Ajouter
          </button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>
      : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-white/10">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune classe trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * i }}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold">{c.nom}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{c.niveau}</span>
                    {c.filiere && <span className="text-xs text-slate-400">{c.filiere.nom}</span>}
                  </div>
                </div>
                <GraduationCap className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-slate-400 text-xs mb-4">
                👥 {c.etudiants_count || 0} étudiants • 📅 {c.annee_scolaire}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openCmp(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors text-xs font-medium">
                  <Link className="w-3.5 h-3.5" />Matières
                </button>
                <button onClick={() => openEdit(c)} className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? 'Modifier la classe' : 'Nouvelle classe'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Filière *</label>
                <select {...register('filiere_id', { required: 'Requis' })}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {filieres.map(f => <option key={f.id} value={f.id} className="bg-slate-800">{f.nom}</option>)}
                </select>
                {errors.filiere_id && <p className="text-red-400 text-xs mt-1">{errors.filiere_id.message}</p>}
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Nom de la classe *</label>
                <input {...register('nom', { required: 'Requis' })} placeholder="Ex: GL L3"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Niveau *</label>
                <select {...register('niveau', { required: 'Requis' })}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {NIVEAUX.map(n => <option key={n} value={n} className="bg-slate-800">{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1.5 block">Effectif</label>
                <input {...register('effectif')} type="number" placeholder="30"
                  className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
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

        {/* CMP Modal */}
        {showCmpModal && selectedClasse && (
          <Modal title={`Matières — ${selectedClasse.nom}`} onClose={() => setShowCmpModal(false)}>
            <div className="space-y-4">
              {/* Current CMPs */}
              {cmps.length > 0 && (
                <div className="space-y-2">
                  {cmps.map(cmp => (
                    <div key={cmp.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{cmp.matiere?.nom}</div>
                        <div className="text-slate-400 text-xs">{cmp.professeur?.prenom} {cmp.professeur?.nom}</div>
                      </div>
                      <button onClick={() => removeCmp(cmp.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <p className="text-slate-400 text-sm mb-3">Ajouter une matière :</p>
                <form onSubmit={submitCmp(onAddCmp)} className="space-y-3">
                  <select {...regCmp('matiere_id', { required: true })}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-slate-800">Choisir une matière...</option>
                    {matieres.map(m => <option key={m.id} value={m.id} className="bg-slate-800">{m.nom}</option>)}
                  </select>
                  <select {...regCmp('professeur_id', { required: true })}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-slate-800">Choisir un professeur...</option>
                    {professeurs.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.prenom} {p.nom}</option>)}
                  </select>
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />Associer
                  </button>
                </form>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
