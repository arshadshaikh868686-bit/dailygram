import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getError } from '../lib/api';
import { saveSession } from '../lib/auth';
import { Toast, Spinner } from '../components/UI';
import { AuthShell } from './Login';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faServer, 
  faTerminal, 
  faCubes, 
  faDatabase, 
  faLayerGroup, 
  faBoxOpen, 
  faCodeBranch,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

const SKILL_OPTIONS = [
  { name: 'React.js', icon: faCode },
  { name: 'Node.js', icon: faServer },
  { name: 'Java', icon: faCubes },
  { name: 'JavaScript', icon: faTerminal },
  { name: 'TypeScript', icon: faTerminal },
  { name: 'Python', icon: faTerminal },
  { name: 'Next.js', icon: faLayerGroup },
  { name: 'Express.js', icon: faServer },
  { name: 'SQL', icon: faDatabase },
  { name: 'MongoDB', icon: faDatabase },
  { name: 'Docker', icon: faBoxOpen },
  { name: 'Git', icon: faCodeBranch }
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner', skills: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleToggleSkill = (skillName) => {
    setForm((prevForm) => {
      const isSelected = prevForm.skills.includes(skillName);
      return {
        ...prevForm,
        skills: isSelected
          ? prevForm.skills.filter((item) => item !== skillName)
          : [...prevForm.skills, skillName]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Dailygram as a learner or mentor.">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Full name
          </label>
          <input 
            id="fullName"
            type="text"
            required 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            placeholder="Your name"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
          />
        </div>

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
            placeholder="At least 6 characters"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accountRole" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Account type
          </label>
          <select 
            id="accountRole"
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://w3.org' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="learner">Learner</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Skills</span>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => {
              const isSelected = form.skills.includes(skill.name);
              return (
                <button 
                  type="button" 
                  key={skill.name} 
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-semibold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`} 
                  onClick={() => handleToggleSkill(skill.name)}
                >
                  <FontAwesomeIcon icon={skill.icon} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 h-10 cursor-pointer"
        >
          {loading ? (
            <>
              <Spinner />
              <span>Creating…</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Create account</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </form>

      <Toast message={error} onClose={() => setError('')} />
    </AuthShell>
  );
}
