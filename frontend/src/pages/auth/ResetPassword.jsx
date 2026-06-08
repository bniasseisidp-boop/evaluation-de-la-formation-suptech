import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, email, password: data.password, password_confirmation: data.password_confirmation });
      setDone(true);
      toast.success('Mot de passe réinitialisé !');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-500 font-semibold mb-4">Lien invalide.</p>
        <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">Demander un nouveau lien</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Mot de passe modifié !</h2>
            <p className="text-slate-500 text-sm">Redirection vers la connexion...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Nouveau mot de passe</h2>
              <p className="text-slate-500 text-sm">Pour le compte : <strong>{email}</strong></p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    {...register('password', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    className={`w-full border-2 ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition-colors`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">Confirmer le mot de passe</label>
                <input
                  {...register('password_confirmation', {
                    required: 'Requis',
                    validate: v => v === watch('password') || 'Les mots de passe ne correspondent pas'
                  })}
                  type="password" placeholder="••••••••"
                  className={`w-full border-2 ${errors.password_confirmation ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors`}
                />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Enregistrement...</> : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
