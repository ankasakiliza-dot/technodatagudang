import React, { useState } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { AppUser } from '../types';

interface LoginScreenProps {
  usersData: AppUser[];
  isDataLoaded: boolean;
  onLoginSuccess: (user: AppUser) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  usersData,
  isDataLoaded,
  onLoginSuccess,
  showToast
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDataLoaded) {
      showToast('Harap tunggu, persiapan data...', 'error');
      return;
    }

    const foundUser = usersData.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      showToast('Username atau password salah!', 'error');
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-5 relative z-50 transition-opacity duration-500">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 mb-8 relative z-10 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <Package size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Techno<span className="text-cyan-400">Sync</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Inventory System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
              Username
            </label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-4 outline-none transition-all placeholder-slate-600" 
              placeholder="Masukkan username (cth: admin)"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
              Password
            </label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-4 outline-none transition-all placeholder-slate-600" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={!isDataLoaded}
            className={`w-full mt-4 text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:ring-4 focus:ring-blue-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2 ${!isDataLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {!isDataLoaded ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 text-white" />
                <span>Menghubungkan ke Server...</span>
              </>
            ) : (
              <span>Masuk Aplikasi</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-slate-400">
          <p>Default Login Demo:</p>
          <div className="flex justify-center gap-3 mt-1 font-mono text-[10px] text-slate-300">
            <span>Admin: admin / admin</span>
            <span>•</span>
            <span>Staf: staf / password</span>
          </div>
        </div>
      </div>
    </section>
  );
};
