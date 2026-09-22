import React from 'react';
import { KeyRound, Users, UserPlus, LogOut, Trash2, ShieldCheck, User, Palette, Check, Wrench, Sun, Moon } from 'lucide-react';
import { AppUser } from '../types';
import { THEME_OPTIONS, isThemeLight } from '../lib/themeConfig';

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
  const isTeknisi = currentUser.role === 'teknisi';
  const initial = currentUser.username.charAt(0).toUpperCase();

  const lightThemes = THEME_OPTIONS.filter(t => t.category === 'light');
  const darkThemes = THEME_OPTIONS.filter(t => t.category === 'dark');

  return (
    <section className="view-enter space-y-6">
      <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        {/* Avatar */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
          isTeknisi 
            ? 'from-purple-600 to-indigo-400 shadow-purple-500/30' 
            : isAdmin 
              ? 'from-blue-600 to-cyan-400 shadow-blue-500/30' 
              : 'from-slate-600 to-slate-400 shadow-slate-500/30'
        } flex items-center justify-center text-4xl font-black text-white shadow-lg mb-4 relative z-10`}>
          {initial}
        </div>

        <h3 className="text-2xl font-bold text-white capitalize mb-1 relative z-10">
          {currentUser.username}
        </h3>
        <div className="mb-6 relative z-10 flex items-center gap-1.5">
          {isTeknisi && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
              <Wrench size={12} /> Teknisi (Akses Manajemen & Koreksi)
            </span>
          )}
          {isAdmin && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} /> Administrator
            </span>
          )}
          {!isAdmin && !isTeknisi && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-bold uppercase tracking-wider flex items-center gap-1">
              <User size={12} /> Staf Gudang
            </span>
          )}
        </div>

        {/* Theme Selector Section */}
        {onSelectTheme && (
          <div className="w-full max-w-3xl mb-6 relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <Palette size={15} className="text-cyan-400" />
                Tampilan Tema Aplikasi
              </h4>
              <span className="text-[10px] text-slate-400">
                Mode: {isThemeLight(currentTheme) ? 'Terang' : 'Gelap'}
              </span>
            </div>

            {/* Mode Terang Section */}
            <div>
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <Sun size={13} /> Mode Terang (Light Mode)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {lightThemes.map(t => {
                  const isActive = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectTheme(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                        isActive 
                          ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50' 
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient || 'from-white to-slate-200'} border ${t.border} shadow-sm`}></span>
                        {isActive && <Check size={14} className="text-amber-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.name}</div>
                        <div className="text-[9px] text-slate-400 line-clamp-1">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Gelap Section */}
            <div>
              <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <Moon size={13} /> Mode Gelap (Dark Mode)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {darkThemes.map(t => {
                  const isActive = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectTheme(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                        isActive 
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/50' 
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient || 'from-[#0b0f19] to-slate-800'} border ${t.border} shadow-sm`}></span>
                        {isActive && <Check size={14} className="text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.name}</div>
                        <div className="text-[9px] text-slate-400 line-clamp-1">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Teknisi Only - User Management */}
        {isTeknisi && (
          <div className="w-full max-w-3xl mb-6 relative z-10">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                Manajemen Anggota
              </h4>
              <button 
                onClick={onOpenAddUserModal} 
                className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 transition-all border border-purple-500/20 active:scale-95 flex items-center gap-1"
              >
                <UserPlus size={12} /> Tambah Anggota
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {usersData.map(u => {
                const userIsAdmin = u.role === 'admin';
                const userIsTeknisi = u.role === 'teknisi';
                const isMe = u.username === currentUser.username;

                return (
                  <div key={u.username} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        userIsTeknisi 
                          ? 'text-purple-400 bg-purple-500/20' 
                          : userIsAdmin 
                            ? 'text-amber-400 bg-amber-500/20' 
                            : 'text-slate-400 bg-slate-700/50'
                      }`}>
                        {userIsTeknisi ? <Wrench size={14} /> : userIsAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {u.username} {isMe && <span className="text-[9px] text-purple-400 font-semibold">(Anda)</span>}
                        </div>
                        <div className="mt-0.5">
                          {userIsTeknisi ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/20 font-bold uppercase tracking-wider">Teknisi</span>
                          ) : userIsAdmin ? (
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md relative z-10">
          <button 
            onClick={onOpenChangePasswordModal} 
            className="w-full text-white bg-white/5 hover:bg-white/10 border border-white/10 focus:ring-4 focus:ring-white/5 font-semibold rounded-xl text-sm px-5 py-3.5 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
          >
            <KeyRound size={16} strokeWidth={2.5} />
            Ubah Password
          </button>
          <button 
            onClick={onLogout} 
            className="w-full text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 focus:ring-4 focus:ring-rose-500/30 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Keluar Aplikasi
          </button>
        </div>
      </div>
    </section>
  );
};

