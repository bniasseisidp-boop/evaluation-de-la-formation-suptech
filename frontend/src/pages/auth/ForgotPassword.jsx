import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setSent(true);
    } catch {
      setSent(true); // toujours montrer succès pour ne pas révéler si l'email existe
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

        <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Retour à la connexion
        </Link>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Email envoyé !</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <Link to="/login" className="mt-6 inline-block text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Retour à la connexion →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Mot de passe oublié ?</h2>
              <p className="text-slate-500 text-sm">
                Entrez votre adresse email. Si elle est enregistrée, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">Adresse email</label>
                <input
                  {...register('email', { required: 'Email requis', pattern: { value: /^\S+@\S+$/, message: 'Email invalide' } })}
                  type="email" placeholder="votre@email.com"
                  className={`w-full border-2 ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'} rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi...</> : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
