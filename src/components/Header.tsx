import React, { useState } from 'react';
import { Package, RefreshCw, Code, Moon, Palette, Check, Upload } from 'lucide-react';

interface HeaderProps {
  connectionStatus: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenIntegrationModal: () => void;
  onOpenImportModal?: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
}

const THEMES = [
  { id: 'default', name: 'Cyber Slate', bg: 'bg-[#0b0f19]', color: 'border-cyan-500' },
  { id: 'theme-oled', name: 'OLED Pure Black', bg: 'bg-black', color: 'border-white' },
  { id: 'theme-emerald', name: 'Emerald Dark', bg: 'bg-[#021a14]', color: 'border-emerald-500' },
  { id: 'theme-violet', name: 'Violet Night', bg: 'bg-[#0d0b1e]', color: 'border-purple-500' }
];

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

  return (
    <header className="sticky top-0 z-40 glass-nav border-b-0 shadow-lg shadow-black/20">
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
              <span className="hidden sm:inline">Upload File</span>
            </button>
          )}

          {/* Theme Dropdown Toggle */}
          <div className="relative">
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95 border border-white/5 flex items-center gap-1.5 text-xs"
              title="Ganti Variant Tema Gelap"
            >
              <Palette size={16} />
              <span className="hidden sm:inline font-semibold">Tema</span>
            </button>

            {themeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 modal-content-enter space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Tema Gelap
                  </div>
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        currentTheme === t.id 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${t.bg} border ${t.color}`}></span>
                        <span>{t.name}</span>
                      </div>
                      {currentTheme === t.id && <Check size={14} className="text-cyan-400" />}
                    </button>
                  ))}
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
            <span className="hidden sm:inline">AppsScript / Blogger</span>
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


