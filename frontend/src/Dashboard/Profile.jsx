import { useEffect, useState } from 'react';
import api, { getError } from '../lib/api';
import { saveSession, getUser } from '../lib/auth';
import { Spinner, Toast } from '../components/UI';
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
  faFloppyDisk
} from '@fortawesome/free-solid-svg-icons';

// Mapping all skill elements to clean solid icons to ensure Vite bundles correctly
const AVAILABLE_SKILLS = [
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

export default function Profile() {
  const cachedUser = getUser();
  
  const [formData, setFormData] = useState({
    name: cachedUser?.name || '',
    skills: cachedUser?.skills || []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch verified structural attributes from backend configuration
  useEffect(() => {
    api.get('/auth/profile')
      .then(({ data }) => setFormData({
        name: data.name || '',
        skills: data.skills || []
      }))
      .catch((error) => setToastMessage(getError(error)))
      .finally(() => setIsLoading(false));
  }, []);

  // Multi-select array configuration toggler helper
  const handleToggleSkill = (skillName) => {
    setFormData((prev) => {
      const isSelected = prev.skills.includes(skillName);
      return {
        ...prev,
        skills: isSelected 
          ? prev.skills.filter((item) => item !== skillName) 
          : [...prev.skills, skillName]
      };
    });
  };

  // Dispatch persistent updates out to core microservices
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      const updatedUser = data.user;
      
      saveSession({
        ...cachedUser,
        ...updatedUser,
        token: localStorage.getItem('dailygram_token'),
        userid: cachedUser?.userid
      });
      setToastMessage('Profile updated successfully.');
    } catch (error) {
      setToastMessage(getError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const firstInitial = (formData.name || 'U')[0].toUpperCase();
  const isSuccessNotification = toastMessage.includes('successfully');

  return (
    <div className="space-y-8">
      {/* Structural Page Header Template */}
      <header>
        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1">
          ACCOUNT
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your profile</h1>
        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Keep your name and skills up to date.
        </p>
      </header>

      {/* Main Workflow Render Area */}
      {isLoading ? (
        <div className="flex items-center gap-3 justify-center text-slate-500 py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Spinner /> 
          <span className="text-sm font-medium">Loading profile…</span>
        </div>
      ) : (
        <form 
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-xl space-y-5 shadow-sm" 
          onSubmit={handleSaveProfile}
        >
          {/* Visual User Cover Identity Segment */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div 
              className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-lg font-black flex items-center justify-center shadow-3xs"
              aria-hidden="true"
            >
              {firstInitial}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
                {formData.name || 'Your name'}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                {cachedUser?.role}
              </span>
            </div>
          </div>

          {/* Full Name Input Box Component */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Full name
            </label>
            <input 
              id="fullName"
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-white text-slate-900"
            />
          </div>

          {/* Locked System Email Input Box Component */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="emailAddress" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Email address
            </label>
            <input 
              id="emailAddress" 
              value={cachedUser?.email || ''} 
              disabled 
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50 cursor-not-allowed outline-none select-none"
            />
          </div>

          {/* Skills Array Verification List Selector */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSkillSelected = formData.skills.includes(skill.name);
                return (
                  <button 
                    type="button" 
                    key={skill.name} 
                    onClick={() => handleToggleSkill(skill.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSkillSelected 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-semibold shadow-3xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`} 
                  >
                    <FontAwesomeIcon icon={skill.icon} className={isSkillSelected ? 'text-indigo-500' : 'text-slate-400'} />
                    <span>{skill.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Mutation Action Pipeline Submit Control */}
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 h-10 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Spinner /> <span>Saving changes…</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFloppyDisk} />
                <span>Save changes</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Global Framework Event Banner Notifications */}
      <Toast 
        message={toastMessage} 
        type={isSuccessNotification ? 'success' : 'error'} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
}
