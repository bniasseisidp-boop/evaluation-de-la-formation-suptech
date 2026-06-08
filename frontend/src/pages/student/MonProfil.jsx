import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, User } from 'lucide-react';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function MonProfil() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success('Mot de passe modifié avec succès !');
      setDone(true);
      reset();
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">

      {/* Info card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-slate-900 font-bold text-lg">{user?.name}</div>
            <div className="text-slate-500 text-sm">{user?.email}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {user?.filiere && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{user.filiere.nom}</span>}
              {user?.classe && <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">{user.classe.nom}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-base">Changer le mot de passe</h2>
            <p className="text-slate-500 text-xs">Choisissez un mot de passe sécurisé</p>
          </div>
        </div>

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700 text-sm font-medium">Mot de passe modifié avec succès !</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-slate-700 text-sm font-semibold mb-1.5 block">Mot de passe actuel</label>
            <div className="relative">
              <input
                {...register('current_password', { required: 'Requis' })}
                type={showCur ? 'text' : 'password'} placeholder="••••••••"
                className={`w-full border ${errors.current_password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-colors`}
              />
              <button type="button" onClick={() => setShowCur(!showCur)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>}
          </div>

          <div>
            <label className="text-slate-700 text-sm font-semibold mb-1.5 block">Nouveau mot de passe</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                type={showNew ? 'text' : 'password'} placeholder="••••••••"
                className={`w-full border ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-colors`}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-slate-700 text-sm font-semibold mb-1.5 block">Confirmer le nouveau mot de passe</label>
            <input
              {...register('password_confirmation', {
                required: 'Requis',
                validate: v => v === watch('password') || 'Les mots de passe ne correspondent pas'
              })}
              type="password" placeholder="••••••••"
              className={`w-full border ${errors.password_confirmation ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors`}
            />
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Enregistrement...</>
              : 'Enregistrer le nouveau mot de passe'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
