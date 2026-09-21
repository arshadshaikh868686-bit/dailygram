import { Link } from 'react-router-dom';
import { getUser } from '../lib/auth';
import { Stat } from '../components/UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faUser, 
  faBriefcase,       
  faPuzzlePiece,     
  faRobot,           
  faChalkboardUser,  
  faRocket,          
  faArrowRight,       
  faChevronRight,
  faWandMagicSparkles 
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const user = getUser();
  const isMentor = user?.role === 'mentor';
  
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const userRole = user?.role || 'learner';
  const totalSkills = user?.skills?.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/60 pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-indigo-600 uppercase block mb-1.5">
            Overview Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}.
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isMentor 
              ? 'Manage incoming sessions and monitor your student workspace logs.' 
              : 'Access tools, schedule skill alignments, and consult active mentors.'}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full self-start md:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800">System Link Active</span>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5" aria-label="Core Account Status">
        <Stat 
          icon={<div className="p-2.5 bg-indigo-50 border border-indigo-100/50 rounded-xl text-indigo-600"><FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" /></div>} 
          label="Account Tier Profile" 
          value={<span className="capitalize font-semibold text-slate-800">{userRole}</span>} 
        />
        <Stat 
          icon={<div className="p-2.5 bg-sky-50 border border-sky-100/50 rounded-xl text-sky-600"><FontAwesomeIcon icon={faPuzzlePiece} className="w-4 h-4" /></div>} 
          label="Verified Skill Alignments" 
          value={<span className="font-semibold text-slate-800">{totalSkills} Specialties</span>} 
        />
        <Stat 
          icon={<div className="p-2.5 bg-purple-50 border border-purple-100/50 rounded-xl text-purple-600"><FontAwesomeIcon icon={faWandMagicSparkles} className="w-4 h-4" /></div>} 
          label="Safi AI Assistant Engine" 
          value={<span className="font-semibold text-purple-700">Operational</span>} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <article className="lg:col-span-2 relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-xs group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl -z-10 group-hover:bg-indigo-100/40 transition-colors duration-300" />
          
          <div className="space-y-4 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold tracking-wider text-slate-600 border border-slate-200 uppercase">
              {isMentor ? 'Instructor Workspace' : 'Student Hub Portal'}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isMentor ? 'Expand your knowledge ecosystem.' : 'Accelerate your career objectives.'}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isMentor
                ? 'Review upcoming booking schedules, access pending lesson parameters, and adjust availability tracking metrics.'
                : 'Connect directly with field practitioners, request sandbox review calls, and build curated milestones.'}
            </p>
            <Link 
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer border border-slate-950 mt-1" 
              to={isMentor ? '/dashboard/appointments' : '/dashboard/mentors'}
            >
              <span>{isMentor ? 'Launch requests table' : 'Initialize directory lookup'}</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="hidden sm:flex p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all duration-300 shadow-3xs" aria-hidden="true">
            <FontAwesomeIcon icon={isMentor ? faChalkboardUser : faRocket} className="text-4xl transition-transform duration-300 group-hover:scale-105" />
          </div>
        </article>

        <nav className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between" aria-label="System Shortcuts">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">System Shortcuts</h3>
            <ul className="space-y-3">
              {[
                { to: '/dashboard/mentors', label: 'Consult Directory', icon: faMagnifyingGlass, desc: 'Query active specialists' },
                { to: '/dashboard/ai', label: 'AI Curriculum Planner', icon: faRobot, desc: 'Generate system roadmaps' },
                { to: '/dashboard/profile', label: 'Identity Configuration', icon: faUser, desc: 'Sync system credentials' }
              ].map((action, idx) => (
                <li key={idx}>
                  <Link 
                    to={action.to} 
                    className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl hover:border-indigo-500/50 hover:bg-slate-50/50 transition-all group/item"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-slate-50 border border-slate-200/40 rounded-lg text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50/50 group-hover/item:border-indigo-100/30 transition-colors flex-shrink-0">
                        <FontAwesomeIcon icon={action.icon} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 group-hover/item:text-indigo-600 transition-colors truncate">
                          {action.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">
                          {action.desc}
                        </span>
                      </div>
                    </div>
                    <FontAwesomeIcon 
                      icon={faChevronRight} 
                      className="text-[10px] text-slate-300 group-hover/item:text-indigo-500 group-hover/item:translate-x-0.5 transition-all flex-shrink-0 pl-2" 
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-center">
            <span className="text-[10px] font-medium text-slate-400 select-none">Dailygram Ecosystem Production Build v1.2</span>
          </div>
        </nav>

      </div>
    </div>
  );
}
