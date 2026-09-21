import React from 'react';

export function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin inline-block align-middle" />
  );
}

export function Empty({ icon = '✨', title = 'Nothing here yet', text = '' }) {
  return (
    <div className="text-center p-10 bg-white border border-dashed border-slate-200 rounded-2xl max-w-sm mx-auto shadow-sm">
      <div className="text-3xl mb-2" aria-hidden="true">{icon}</div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      {text && <p className="text-xs text-slate-500 leading-relaxed">{text}</p>}
    </div>
  );
}

export function Stat({ icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm w-full">
      {icon && <span className="text-xl" aria-hidden="true">{icon}</span>}
      <div className="flex flex-col min-w-0">
        <small className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">{label}</small>
        <strong className="text-lg font-extrabold text-slate-900 capitalize mt-0.5 truncate">{value}</strong>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'error', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div 
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-white shadow-lg text-xs font-semibold tracking-wide cursor-pointer z-50 transition-all active:scale-95 animate-fade-in-up ${
        isSuccess ? 'bg-emerald-600' : 'bg-red-500'
      }`} 
      onClick={onClose}
    >
      {message}
    </div>
  );
}
