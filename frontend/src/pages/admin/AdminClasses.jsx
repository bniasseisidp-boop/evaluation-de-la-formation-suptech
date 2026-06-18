import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Link, Unlink, GraduationCap, ChevronDown, ChevronUp, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { classeAPI, filiereAPI, cmpAPI, professeurAPI, matiereAPI, registrationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const getJoinLink = (token) => {
  const base = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
  return `${base}/rejoindre/${token}`;
};

const NIVEAUX = ['BT1','BT2','BT3','L1','L2','L3','M1','M2','FC_L1','FC_L2','FC_L3'];
const SEMESTRES = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];

const inputCls = 'w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm';
const labelCls = 'text-slate-600 text-sm mb-1.5 block font-medium';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-900 font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkClasse, setLinkClasse] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [cmps, setCmps] = useState([]);
  const [filterFiliere, setFilterFiliere] = useState('');
  const [showNewMatiere, setShowNewMatiere] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regCmp, handleSubmit: submitCmp, reset: resetCmp, setValue: setCmpValue } = useForm();
  const formNewMat = useForm();

  const load = () => {
    Promise.all([classeAPI.list(), filiereAPI.list(), professeurAPI.list(), matiereAPI.list()])
      .then(([c, f, p, m]) => { setClasses(c.data); setFilieres(f.data); setProfesseurs(p.data); setMatieres(m.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); reset({ ...c, filiere_id: c.filiere_id }); setShowModal(true); };

  const openCmp = async (classe) => {
    setSelectedClasse(classe);
    const r = await cmpAPI.list(classe.id);
    setCmps(r.data); resetCmp({});
    setShowNewMatiere(false);
    setShowCmpModal(true);
  };

  const onCreateMatiere = async (data) => {
    try {
      const r = await matiereAPI.create(data);
      toast.success(`Matière "${r.data.nom}" créée !`);
      // Recharger la liste des matières et auto-sélectionner la nouvelle
      const updated = await matiereAPI.list();
      setMatieres(updated.data);
      setCmpValue('matiere_id', String(r.data.id));
      formNewMat.reset({});
      setShowNewMatiere(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
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

  const openLinkModal = (c) => { setLinkClasse(c); setShowLinkModal(true); };

  const copyLink = (token) => {
    navigator.clipboard.writeText(getJoinLink(token))
      .then(() => toast.success('Lien copié !'))
      .catch(() => toast.error('Impossible de copier'));
  };

  const regenerateToken = async () => {
    if (!linkClasse) return;
    setRegenerating(true);
    try {
      const r = await registrationAPI.regenerateToken(linkClasse.id);
      const updated = { ...linkClasse, registration_token: r.data.token };
      setLinkClasse(updated);
      setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success('Lien régénéré !');
    } catch { toast.error('Erreur lors de la régénération'); }
    finally { setRegenerating(false); }
  };

  const filtered = filterFiliere ? classes.filter(c => c.filiere_id === parseInt(filterFiliere)) : classes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Classes</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} classe(s)</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm">
            <option value="">Toutes les filières</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />Ajouter
          </button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Aucune classe trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * i }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-slate-900 font-bold">{c.nom}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{c.niveau}</span>
                    {c.filiere && <span className="text-xs text-slate-500">{c.filiere.nom}</span>}
                  </div>
                </div>
                <GraduationCap className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-slate-500 text-xs mb-4">
                👥 {c.etudiants_count || 0} étudiants • 📅 {c.annee_scolaire}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openCmp(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium">
                  <Link className="w-3.5 h-3.5" />Matières
                </button>
                <button onClick={() => openLinkModal(c)} title="Lien d'inscription"
                  className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => openEdit(c)}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c)}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? 'Modifier la classe' : 'Nouvelle classe'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={labelCls}>Filière *</label>
                <select {...register('filiere_id', { required: 'Requis' })} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                {errors.filiere_id && <p className="text-red-500 text-xs mt-1">{errors.filiere_id.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Nom de la classe *</label>
                <input {...register('nom', { required: 'Requis' })} placeholder="Ex: GL L3" className={inputCls} />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Niveau *</label>
                <select {...register('niveau', { required: 'Requis' })} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.niveau && <p className="text-red-500 text-xs mt-1">{errors.niveau.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Effectif</label>
                <input {...register('effectif')} type="number" placeholder="30" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 text-sm transition-colors">Annuler</button>
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
                  <Save className="w-4 h-4" />{editing ? 'Sauvegarder' : 'Créer'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showCmpModal && selectedClasse && (
          <Modal title={`Matières — ${selectedClasse.nom}`} onClose={() => setShowCmpModal(false)}>
            <div className="space-y-4">

              {/* Liste des matières associées */}
              {cmps.length > 0 ? (
                <div className="space-y-2">
                  {cmps.map(cmp => (
                    <div key={cmp.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 text-sm font-semibold truncate">{cmp.matiere?.nom}</div>
                        <div className="text-slate-500 text-xs">{cmp.matiere?.code && <span className="font-mono mr-2">{cmp.matiere.code}</span>}{cmp.professeur?.prenom} {cmp.professeur?.nom}</div>
                      </div>
                      <button onClick={() => removeCmp(cmp.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-sm">Aucune matière associée à cette classe.</p>
                </div>
              )}

              {/* Formulaire d'association */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-700 text-sm font-semibold mb-3">Associer une matière :</p>
                <form onSubmit={submitCmp(onAddCmp)} className="space-y-3">
                  <div className="flex gap-2">
                    <select {...regCmp('matiere_id', { required: true })} className={`flex-1 ${inputCls}`}>
                      <option value="">Choisir une matière...</option>
                      {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} {m.code ? `(${m.code})` : ''}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowNewMatiere(v => !v)}
                      title="Créer une nouvelle matière"
                      className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors flex items-center gap-1 ${showNewMatiere ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                      <Plus className="w-4 h-4" />
                      {showNewMatiere ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Formulaire inline "Nouvelle matière" */}
                  <AnimatePresence>
                    {showNewMatiere && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                          <p className="text-blue-700 text-xs font-bold uppercase tracking-wide">Nouvelle matière</p>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={labelCls}>Nom *</label>
                                <input {...formNewMat.register('nom', { required: true })} placeholder="Ex: Algorithmique"
                                  className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Code *</label>
                                <input {...formNewMat.register('code', { required: true })} placeholder="Ex: ALGO"
                                  className={inputCls} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={labelCls}>Semestre</label>
                                <select {...formNewMat.register('semestre')} className={inputCls}>
                                  <option value="">—</option>
                                  {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelCls}>Crédits</label>
                                <input {...formNewMat.register('credits')} type="number" placeholder="Ex: 3" className={inputCls} />
                              </div>
                            </div>
                            <button type="button" disabled={formNewMat.formState.isSubmitting}
                              onClick={() => formNewMat.handleSubmit(onCreateMatiere)()}
                              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                              {formNewMat.formState.isSubmitting
                                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                : <><Save className="w-4 h-4" />Créer et sélectionner</>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <select {...regCmp('professeur_id', { required: true })} className={inputCls}>
                    <option value="">Choisir un professeur...</option>
                    {professeurs.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                  </select>
                  <button type="submit"
                    className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Link className="w-4 h-4" />Associer à la classe
                  </button>
                </form>
              </div>
            </div>
          </Modal>
        )}
        {showLinkModal && linkClasse && (
          <Modal title={`Lien d'inscription — ${linkClasse.nom}`} onClose={() => setShowLinkModal(false)}>
            <div className="space-y-5">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-purple-700 text-xs font-semibold mb-1 uppercase tracking-wide">
                  Partage ce lien avec les étudiants de cette classe
                </p>
                <p className="text-slate-500 text-xs">
                  Les étudiants pourront créer leur compte directement en cliquant sur ce lien.
                </p>
              </div>

              {linkClasse.registration_token ? (
                <>
                  <div>
                    <label className={labelCls}>Lien d'inscription</label>
                    <div className="flex gap-2">
                      <input readOnly value={getJoinLink(linkClasse.registration_token)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono truncate focus:outline-none" />
                      <button onClick={() => copyLink(linkClasse.registration_token)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shrink-0"
                        title="Copier">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button onClick={() => copyLink(linkClasse.registration_token)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
                    <Copy className="w-4 h-4" />Copier le lien
                  </button>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-slate-500 text-xs mb-3">
                      Régénérer le lien rendra l'ancien lien invalide. À utiliser uniquement si le lien a été partagé par erreur.
                    </p>
                    <button onClick={regenerateToken} disabled={regenerating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl text-sm transition-colors disabled:opacity-50">
                      {regenerating
                        ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        : <RefreshCw className="w-4 h-4" />}
                      Régénérer le lien
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  Aucun lien généré. Cliquez sur "Régénérer" pour en créer un.
                  <button onClick={regenerateToken} disabled={regenerating}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
                    <RefreshCw className="w-4 h-4" />Générer le lien
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
