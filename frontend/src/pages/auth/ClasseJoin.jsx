import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { registrationAPI } from '../../services/api';

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';
const labelCls = 'block text-slate-700 text-sm font-semibold mb-1.5';

export default function ClasseJoin() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [mode, setMode]               = useState(token ? 'token' : 'public');
  const [classeInfo, setClasseInfo]   = useState(null);
  const [filieres, setFilieres]       = useState([]);
  const [classes, setClasses]         = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [showPwd2, setShowPwd2]       = useState(false);
  const [form, setForm]               = useState({
    nom: '', prenom: '', email: '', password: '', password_confirmation: '', filiere_id: '', classe_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'token') {
      registrationAPI.classeInfo(token)
        .then(r => setClasseInfo(r.data))
        .catch(() => toast.error('Lien invalide ou expiré.'))
        .finally(() => setLoading(false));
    } else {
      registrationAPI.publicFilieres()
        .then(r => setFilieres(r.data))
        .finally(() => setLoading(false));
    }
  }, [mode, token]);

  useEffect(() => {
    if (selectedFiliere) {
      registrationAPI.publicClasses(selectedFiliere)
        .then(r => setClasses(r.data))
        .catch(() => setClasses([]));
    } else {
      setClasses([]);
      setForm(f => ({ ...f, classe_id: '' }));
    }
  }, [selectedFiliere]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.prenom.trim()) errs.prenom = 'Prénom requis';
    if (!form.nom.trim())    errs.nom    = 'Nom requis';
    if (!form.email.trim())  errs.email  = 'Email requis';
    if (form.password.length < 8) errs.password = '8 caractères minimum';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Les mots de passe ne correspondent pas';
    if (mode === 'public') {
      if (!form.filiere_id) errs.filiere_id = 'Filière requise';
      if (!form.classe_id)  errs.classe_id  = 'Classe requise';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      if (mode === 'token') {
        await registrationAPI.registerByToken(token, {
          nom: form.nom, prenom: form.prenom, email: form.email,
          password: form.password, password_confirmation: form.password_confirmation,
        });
      } else {
        await registrationAPI.registerPublic({
          nom: form.nom, prenom: form.prenom, email: form.email,
          password: form.password, password_confirmation: form.password_confirmation,
          filiere_id: form.filiere_id, classe_id: form.classe_id,
        });
      }
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        toast.error(data?.message || 'Erreur lors de l\'inscription.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Inscription réussie !</h2>
          <p className="text-slate-500 mb-8">Votre compte a été créé. Connectez-vous pour accéder au portail d'évaluation.</p>
          <button onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md">
            Se connecter <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">ISI SUPTECH</h1>
          <p className="text-slate-500 text-sm mt-1">Portail d'évaluation de la formation</p>
        </div>

        {/* Classe badge (mode token) */}
        {mode === 'token' && !loading && classeInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-blue-900 font-bold text-sm">{classeInfo.nom}</div>
              <div className="text-blue-600 text-xs">{classeInfo.filiere?.nom} • {classeInfo.niveau}</div>
            </div>
          </div>
        )}

        {mode === 'token' && loading && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {mode === 'token' ? 'Créer mon compte étudiant' : 'Inscription étudiant'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Filière + Classe (mode public seulement) */}
          {mode === 'public' && (
            <>
              <div>
                <label className={labelCls}>Filière *</label>
                <select value={form.filiere_id}
                  onChange={e => { set('filiere_id', e.target.value); setSelectedFiliere(e.target.value); }}
                  className={inputCls}>
                  <option value="">Sélectionner votre filière...</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                {errors.filiere_id && <p className="text-red-500 text-xs mt-1">{errors.filiere_id}</p>}
              </div>
              <div>
                <label className={labelCls}>Classe *</label>
                <select value={form.classe_id} onChange={e => set('classe_id', e.target.value)}
                  className={inputCls} disabled={!selectedFiliere}>
                  <option value="">{selectedFiliere ? 'Sélectionner votre classe...' : 'Choisir une filière d\'abord'}</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>)}
                </select>
                {errors.classe_id && <p className="text-red-500 text-xs mt-1">{errors.classe_id}</p>}
              </div>
            </>
          )}

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prénom *</label>
              <input value={form.prenom} onChange={e => set('prenom', e.target.value)}
                placeholder="Ex: Fatou" className={inputCls} />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>
            <div>
              <label className={labelCls}>Nom *</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)}
                placeholder="Ex: DIALLO" className={inputCls} />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Adresse email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="votreemail@example.com" className={inputCls} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className={labelCls}>Mot de passe *</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="8 caractères minimum" className={inputCls + ' pr-11'} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirmation */}
          <div>
            <label className={labelCls}>Confirmer le mot de passe *</label>
            <div className="relative">
              <input type={showPwd2 ? 'text' : 'password'} value={form.password_confirmation}
                onChange={e => set('password_confirmation', e.target.value)}
                placeholder="Répéter le mot de passe" className={inputCls + ' pr-11'} />
              <button type="button" onClick={() => setShowPwd2(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
          </div>

          <button type="submit" disabled={submitting || (mode === 'token' && loading && !classeInfo)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md mt-2">
            {submitting
              ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><GraduationCap className="w-5 h-5" />S'inscrire</>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  );
}
