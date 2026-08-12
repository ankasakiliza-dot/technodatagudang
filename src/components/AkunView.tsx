import React from 'react';
import { KeyRound, Users, UserPlus, LogOut, Trash2, ShieldCheck, User, Palette, Check } from 'lucide-react';
import { AppUser } from '../types';

interface AkunViewProps {
  currentUser: AppUser | null;
  usersData: AppUser[];
  onOpenChangePasswordModal: () => void;
  onOpenAddUserModal: () => void;
  onPromptDeleteUser: (username: string) => void;
  onLogout: () => void;
  currentTheme?: string;
  onSelectTheme?: (theme: string) => void;
}

const THEMES = [
  { id: 'default', name: 'Cyber Slate', bg: 'bg-[#0b0f19]', desc: 'Klasik Gelap Moderat' },
  { id: 'theme-oled', name: 'OLED Pure Black', bg: 'bg-black', desc: 'Hitam Pekat Hemat Daya' },
  { id: 'theme-emerald', name: 'Emerald Dark', bg: 'bg-[#021a14]', desc: 'Nuansa Hijau Gelap' },
  { id: 'theme-violet', name: 'Violet Night', bg: 'bg-[#0d0b1e]', desc: 'Ungu Malam Cyber' }
];

export const AkunView: React.FC<AkunViewProps> = ({
  currentUser,
  usersData,
  onOpenChangePasswordModal,
  onOpenAddUserModal,
  onPromptDeleteUser,
  onLogout,
  currentTheme = 'default',
  onSelectTheme
}) => {
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const initial = currentUser.username.charAt(0).toUpperCase();

  return (
    <section className="view-enter space-y-6">
      <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-blue-500/30 mb-4 relative z-10">
          {initial}
        </div>

        <h3 className="text-2xl font-bold text-white capitalize mb-1 relative z-10">
          {currentUser.username}
        </h3>
        <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-semibold relative z-10">
          {isAdmin ? 'Administrator' : 'Staf Gudang'}
        </p>

        {/* Theme Selector Section */}
        {onSelectTheme && (
          <div className="w-full max-w-sm mb-6 relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-3 uppercase tracking-wider">
              <Palette size={14} className="text-cyan-400" />
              Pilihan Tema Gelap (Dark Mode)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => {
                const isActive = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                      isActive 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10' 
                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`w-3 h-3 rounded-full ${t.bg} border border-white/20`}></span>
                      {isActive && <Check size={14} className="text-cyan-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{t.name}</div>
                      <div className="text-[9px] text-slate-400 line-clamp-1">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Change Password Button */}
        <button 
          onClick={onOpenChangePasswordModal} 
          className="relative z-10 w-full max-w-xs mb-4 text-white bg-white/5 hover:bg-white/10 border border-white/10 focus:ring-4 focus:ring-white/5 font-semibold rounded-xl text-sm px-5 py-3.5 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <KeyRound size={16} strokeWidth={2.5} />
          Ubah Password
        </button>

        {/* Admin User Management */}
        {isAdmin && (
          <div className="w-full max-w-sm mb-6 relative z-10">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Manajemen Anggota
              </h4>
              <button 
                onClick={onOpenAddUserModal} 
                className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/20 active:scale-95 flex items-center gap-1"
              >
                <UserPlus size={12} /> Tambah
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {usersData.map(u => {
                const userIsAdmin = u.role === 'admin';
                const isMe = u.username === currentUser.username;

                return (
                  <div key={u.username} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${userIsAdmin ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 bg-slate-700/50'}`}>
                        {userIsAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {u.username} {isMe && <span className="text-[9px] text-blue-400">(Anda)</span>}
                        </div>
                        <div className="mt-0.5">
                          {userIsAdmin ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">Admin</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase tracking-wider">Staf</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isMe ? (
                      <button 
                        onClick={() => onPromptDeleteUser(u.username)} 
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/10" 
                        title="Hapus Anggota"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    ) : (
                      <div className="w-8"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          className="relative z-10 w-full max-w-xs text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 focus:ring-4 focus:ring-rose-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Keluar Aplikasi
        </button>
      </div>
    </section>
  );
};

