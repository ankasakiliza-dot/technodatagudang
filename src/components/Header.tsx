import React, { useState } from 'react';
import { Package, RefreshCw, Code, Moon, Sun, Palette, Check, Upload } from 'lucide-react';
import { THEME_OPTIONS, isThemeLight } from '../lib/themeConfig';

interface HeaderProps {
  connectionStatus: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenIntegrationModal: () => void;
  onOpenImportModal?: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  isRefreshing,
  onRefresh,
  onOpenIntegrationModal,
  onOpenImportModal,
  currentTheme,
  onSelectTheme
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
    <header className="sticky top-0 z-40 glass-nav border-b-0 shadow-lg shadow-black/10">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <Package size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              Techno<span className="text-cyan-400">Sync</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider" id="connection-status">
                {connectionStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
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


