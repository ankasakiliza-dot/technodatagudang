import React from 'react';
import { LayoutGrid, Repeat, PlusSquare, FileCheck, User } from 'lucide-react';
import { ViewType, AppUser } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onSwitchView: (view: ViewType) => void;
  currentUser: AppUser | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSwitchView,
  currentUser
}) => {
  return (
    <nav className="fixed bottom-0 w-full glass-nav border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-40 pb-safe">
      <div className="max-w-3xl mx-auto px-2 py-2 flex justify-around items-center">
        <button 
          onClick={() => onSwitchView('dashboard')} 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''} flex-1 py-3 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors`}
        >
          <LayoutGrid size={22} />
          <span className="text-[10px] font-medium">Beranda</span>
          <div className="nav-indicator"></div>
        </button>

        <button 
          onClick={() => onSwitchView('transaksi')} 
          className={`nav-btn ${currentView === 'transaksi' ? 'active' : ''} flex-1 py-3 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors`}
        >
          <Repeat size={22} />
          <span className="text-[10px] font-medium">Transaksi</span>
          <div className="nav-indicator"></div>
        </button>

        <button 
          onClick={() => onSwitchView('tambah')} 
          className={`nav-btn ${currentView === 'tambah' ? 'active' : ''} flex-1 py-3 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors`}
        >
          <PlusSquare size={22} />
          <span className="text-[10px] font-medium">Tambah</span>
          <div className="nav-indicator"></div>
        </button>

        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => onSwitchView('opname')} 
            className={`nav-btn ${currentView === 'opname' ? 'active' : ''} flex-1 py-3 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors`}
          >
            <FileCheck size={22} />
            <span className="text-[10px] font-medium">Opname</span>
            <div className="nav-indicator"></div>
          </button>
        )}

        <button 
          onClick={() => onSwitchView('akun')} 
          className={`nav-btn ${currentView === 'akun' ? 'active' : ''} flex-1 py-3 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors`}
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Akun</span>
          <div className="nav-indicator"></div>
        </button>
      </div>
    </nav>
  );
};
