import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const DEMO_USERS = [
  { role: 'Admin', email: 'admin@nexusflow.dev', password: 'Admin1234!' },
  { role: 'Manager', email: 'jean.manager@nexusflow.dev', password: 'Test1234!' },
];

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Identifiants incorrects.';
      setError(message);
      toast.error(message);
    }
  };

  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setError('');
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'L’email est requis',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Format d’email invalide',
              },
            })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Le mot de passe est requis' })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm sm:text-base"
        >
          {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
        </button>
      </form>

      {/* Identifiants de démo */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center mb-3">
          Identifiants de démonstration
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.role}
              type="button"
              onClick={() => fillDemo(demo.email, demo.password)}
              className="flex flex-col items-center px-3 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <span className="text-xs font-semibold text-gray-700">{demo.role}</span>
              <span className="text-[11px] sm:text-xs text-gray-500 break-all">{demo.email}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}