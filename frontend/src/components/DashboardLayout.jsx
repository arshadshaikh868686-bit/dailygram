import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from '../lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMagnifyingGlass, faCalendarCheck, faComments, faRobot, faUser, faBars, faXmark, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export default function DashboardLayout() {
  const user = getUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: faHouse, end: true },
    { to: '/dashboard/mentors', label: 'Search Mentor', icon: faMagnifyingGlass },
    { to: '/dashboard/appointments', label: 'Appointments', icon: faCalendarCheck },
    { to: '/dashboard/messages', label: 'Messages', icon: faComments },
    { to: '/dashboard/ai', label: 'AI Assistant', icon: faRobot },
    { to: '/dashboard/profile', label: 'Profile', icon: faUser }
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer" 
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="font-extrabold text-lg text-slate-900">
          Daily<span className="text-indigo-600">gram</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={closeMobileSidebar} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Daily<span className="text-indigo-600">gram</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Learn • Connect • Grow
            </p>
          </div>
          <button 
            onClick={closeMobileSidebar} 
            className="md:hidden w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer" 
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 capitalize truncate">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobileSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
