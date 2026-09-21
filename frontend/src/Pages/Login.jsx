import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getError } from '../lib/api';
import { saveSession } from '../lib/auth';
import { Toast } from '../components/UI';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in and continue your learning journey.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Email address
          </label>
          <input 
            id="email"
            type="email" 
            required 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            placeholder="you@example.com"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Password
          </label>
          <input 
            id="password"
            type="password" 
            required 
            minLength="6" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            placeholder="••••••••"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Signing in…' : 'Log in →'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          New to Dailygram?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </form>

      <Toast message={error} onClose={() => setError('')} />
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-6 antialiased">
    

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block uppercase">
            DAILYGRAM.IN
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-2">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>

        <div className="pt-2">{children}</div>
      </div>

      <div className="text-center text-xs font-semibold text-slate-400 mt-6 tracking-wide">
        Learn with people. Grow with purpose.
      </div>
    </div>
  );
}
