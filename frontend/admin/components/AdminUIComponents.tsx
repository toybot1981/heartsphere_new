import React from 'react';

export const AdminSidebarItem: React.FC<{ label: string; icon: string; active: boolean; onClick: () => void }> = ({ label, icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 border-r-4 border-white' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
        <span className="text-lg">{icon}</span>
        {label}
    </button>
);

export const AdminHeader: React.FC<{ title: string; onBack: () => void; onLogout: () => void }> = ({ title, onBack, onLogout }) => (
    <div className="h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-6 shrink-0">
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">Admin Mode</span>
            <button onClick={onLogout} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                退出登录
            </button>
        </div>
    </div>
);

export const InputGroup: React.FC<{ label: string; subLabel?: string; children: React.ReactNode }> = ({ label, subLabel, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
        {subLabel && <p className="text-[10px] text-slate-500 mb-2">{subLabel}</p>}
        {children}
    </div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${props.className || ''}`}
    />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea 
        {...props} 
        className={`w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none ${props.className || ''}`}
    />
);

export const ConfigSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <h4 className="text-sm font-bold text-indigo-300 border-b border-indigo-500/20 pb-2 mb-4 uppercase tracking-widest">{title}</h4>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


