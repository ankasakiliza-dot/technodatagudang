import React, { useState } from 'react';
import { RefreshCw, Code, Moon, Sun, Palette, Check, Upload, LayoutGrid, Repeat, PlusSquare, FileCheck, User } from 'lucide-react';
import { THEME_OPTIONS, isThemeLight } from '../lib/themeConfig';
import { AppLogo } from './AppLogo';
import { ViewType, AppUser } from '../types';

interface HeaderProps {
  connectionStatus: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenIntegrationModal: () => void;
  onOpenImportModal?: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  currentView?: ViewType;
  onSwitchView?: (view: ViewType) => void;
  currentUser?: AppUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  isRefreshing,
  onRefresh,
  onOpenIntegrationModal,
  onOpenImportModal,
  currentTheme,
  onSelectTheme,
  currentView,
  onSwitchView,
  currentUser
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const isLight = isThemeLight(currentTheme);

  const handleQuickToggle = () => {
    if (isLight) {
      onSelectTheme('default');
    } else {
      onSelectTheme('theme-light-eyecare');
    }
  };

  const lightThemes = THEME_OPTIONS.filter(t => t.category === 'light');
  const darkThemes = THEME_OPTIONS.filter(t => t.category === 'dark');

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-white/10 shadow-lg shadow-black/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          onClick={() => onSwitchView?.('dashboard')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
        >
          <AppLogo size="sm" showGlow />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
              <span>TECHNO</span>
              <span className="text-red-400 font-bold text-[11px] sm:text-xs px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 tracking-wider">
                OTOPARTS
              </span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider" id="connection-status">
                {connectionStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Visible on Laptop / PC) */}
        {onSwitchView && currentView && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
            <button
              onClick={() => onSwitchView('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'dashboard'
                  ? 'bg-red-500/25 text-white border border-red-500/50 shadow-md shadow-red-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutGrid size={15} />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => onSwitchView('transaksi')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'transaksi'
                  ? 'bg-red-500/25 text-white border border-red-500/50 shadow-md shadow-red-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Repeat size={15} />
              <span>Transaksi</span>
            </button>

            <button
              onClick={() => onSwitchView('tambah')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'tambah'
                  ? 'bg-red-500/25 text-white border border-red-500/50 shadow-md shadow-red-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <PlusSquare size={15} />
              <span>Tambah</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSwitchView('opname')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  currentView === 'opname'
                    ? 'bg-red-500/25 text-white border border-red-500/50 shadow-md shadow-red-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <FileCheck size={15} />
                <span>Opname</span>
              </button>
            )}

            <button
              onClick={() => onSwitchView('akun')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentView === 'akun'
                  ? 'bg-red-500/25 text-white border border-red-500/50 shadow-md shadow-red-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <User size={15} />
              <span>Akun</span>
            </button>
          </nav>
        )}

        <div className="flex items-center gap-2 relative shrink-0">
          {/* Upload Button */}
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all active:scale-95 border border-cyan-500/20 flex items-center gap-1.5 text-xs font-semibold"
              title="Upload / Import File Excel & CSV"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}

          {/* Quick Light / Dark Mode Toggle Button */}
          <button
            onClick={handleQuickToggle}
            className={`p-2.5 rounded-xl transition-all active:scale-95 border flex items-center gap-1.5 text-xs font-bold ${
              isLight
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
            }`}
            title={isLight ? 'Beralih ke Mode Gelap (Dark Mode)' : 'Beralih ke Mode Terang (Light Mode)'}
          >
            {isLight ? (
              <>
                <Sun size={16} className="text-amber-500 fill-amber-500/30" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-400 fill-indigo-400/30" />
                <span className="hidden sm:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Theme Palette Dropdown Toggle */}
          <div className="relative">
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95 border border-white/5 flex items-center gap-1 text-xs"
              title="Pilih Variant Tema (Terang & Gelap)"
            >
              <Palette size={16} />
            </button>

            {themeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl p-3 z-50 modal-content-enter space-y-2.5 text-left backdrop-blur-2xl">
                  {/* Mode Terang Section */}
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Sun size={12} /> Mode Terang (Light)</span>
                      <span className="text-[9px] text-slate-400 font-normal">Modern Palette</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {lightThemes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTheme(t.id);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            currentTheme === t.id 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient || 'from-white to-slate-200'} border ${t.border} shadow-sm shrink-0`}></span>
                            <div className="truncate text-left">
                              <div className="text-xs truncate font-medium">{t.name}</div>
                            </div>
                          </div>
                          {currentTheme === t.id && <Check size={14} className="text-amber-400 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10"></div>

                  {/* Mode Gelap Section */}
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Moon size={12} /> Mode Gelap (Dark)</span>
                      <span className="text-[9px] text-slate-400 font-normal">Cyber Palette</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {darkThemes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTheme(t.id);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            currentTheme === t.id 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient || 'from-[#0b0f19] to-slate-800'} border ${t.border} shadow-sm shrink-0`}></span>
                            <div className="truncate text-left">
                              <div className="text-xs truncate font-medium">{t.name}</div>
                            </div>
                          </div>
                          {currentTheme === t.id && <Check size={14} className="text-cyan-400 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={onOpenIntegrationModal} 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-all active:scale-95 border border-white/5 flex items-center gap-1.5 text-xs font-semibold"
            title="Integrasi Blogger & AppsScript"
          >
            <Code size={16} />
            <span className="hidden sm:inline">AppsScript</span>
          </button>

          <button 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95 border border-white/5" 
            title="Refresh Data (Sync Firebase)"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};


