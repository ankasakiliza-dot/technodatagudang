import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Download, 
  FileText, 
  Search, 
  Calendar, 
  User as UserIcon, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  FileCheck,
  Plus
} from 'lucide-react';
import { Transaction, AppUser, ViewType } from '../types';
import { downloadTransactionsCSV, downloadTransactionsPDF } from '../lib/exportUtils';

interface RiwayatViewProps {
  transactions: Transaction[];
  usersData: AppUser[];
  onSwitchView: (view: ViewType) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  transactions,
  usersData,
  onSwitchView,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<'semua' | 'masuk' | 'keluar' | 'rusak' | 'opname'>('semua');

  const filteredTransactions = transactions.filter(tx => {
    const isOpname = tx.note && (tx.note.includes('Opname') || tx.note.includes('Selisih'));
    let matchFilter = true;
    if (activeHistoryFilter === 'masuk') matchFilter = tx.type === 'Masuk' && !isOpname;
    if (activeHistoryFilter === 'keluar') matchFilter = tx.type === 'Keluar' && !isOpname;
    if (activeHistoryFilter === 'rusak') matchFilter = tx.type === 'Rusak';
    if (activeHistoryFilter === 'opname') matchFilter = Boolean(isOpname);

    let matchSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchSearch = tx.name.toLowerCase().includes(q) || 
                    tx.sku.toLowerCase().includes(q) || 
                    (tx.note && tx.note.toLowerCase().includes(q));
    }

    let matchDate = true;
    if (startDate || endDate) {
      const txDate = new Date(tx.date);
      txDate.setHours(0, 0, 0, 0);
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (txDate < s) matchDate = false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(0, 0, 0, 0);
        if (txDate > e) matchDate = false;
      }
    }

    let matchUser = true;
    if (selectedUser !== 'all') {
      matchUser = tx.user === selectedUser;
    }

    return matchFilter && matchSearch && matchDate && matchUser;
  });

  const handleExportCSV = () => {
    const ok = downloadTransactionsCSV(filteredTransactions);
    if (ok) showToast('Laporan Excel (CSV) berhasil diunduh', 'success');
    else showToast('Tidak ada data transaksi untuk diunduh', 'error');
  };

  const handleExportPDF = () => {
    const ok = downloadTransactionsPDF(filteredTransactions);
    if (ok) showToast('Laporan PDF berhasil diunduh', 'success');
    else showToast('Tidak ada data untuk laporan PDF', 'error');
  };

  return (
    <section className="view-enter">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl shadow-black/10 flex flex-col h-[75vh]">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSwitchView('dashboard')} 
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <h2 className="text-lg font-bold text-white">Riwayat & Filter</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onSwitchView('transaksi')} 
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-1"
            >
              <Plus size={12} /> Transaksi Baru
            </button>
            <button 
              onClick={handleExportCSV} 
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/20" 
              title="Unduh Excel (CSV)"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={handleExportPDF} 
              className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors border border-rose-500/20" 
              title="Unduh Laporan PDF"
            >
              <FileText size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pencatatan..." 
                className="w-full bg-slate-900/50 border border-white/10 text-xs rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block pl-9 pr-4 py-2.5 placeholder-slate-400 text-white transition-all outline-none"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0 items-center bg-slate-900/50 rounded-xl p-1.5 border border-white/10">
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] sm:text-xs text-slate-300 w-full outline-none px-2 [color-scheme:dark]" 
                title="Tanggal Mulai"
              />
              <span className="text-slate-500 font-bold">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] sm:text-xs text-slate-300 w-full outline-none px-2 [color-scheme:dark]" 
                title="Tanggal Akhir"
              />
            </div>

            <div className="relative w-full sm:w-auto shrink-0">
              <select 
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="bg-slate-900/50 text-xs text-slate-300 w-full sm:w-32 outline-none px-3 py-2.5 rounded-xl border border-white/10 appearance-none pr-8 cursor-pointer"
              >
                <option value="all">Semua Akun</option>
                {usersData.map(u => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* History Type Filter Pills */}
        <div className="px-5 py-3 border-b border-white/10 bg-black/20 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {(['semua', 'masuk', 'keluar', 'rusak', 'opname'] as const).map(filter => {
            const labels = {
              semua: 'Semua',
              masuk: 'Barang Masuk',
              keluar: 'Barang Keluar',
              rusak: 'Barang Rusak',
              opname: 'Opname (Selisih)'
            };
            const isSelected = activeHistoryFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveHistoryFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          <div className="space-y-3">
            {filteredTransactions.map(tx => {
              const isMasuk = tx.type === 'Masuk';
              const isRusak = tx.type === 'Rusak';
              const isOpname = tx.note && (tx.note.includes('Opname') || tx.note.includes('Selisih'));

              let iconColor = 'text-rose-400 bg-rose-500/20';
              let typeLabel = 'Keluar';
              let textColor = 'text-rose-400';
              let IconComponent = ArrowDownRight;

              if (isOpname) {
                iconColor = 'text-indigo-400 bg-indigo-500/20';
                typeLabel = 'Opname';
                textColor = tx.qty > 0 ? (isMasuk ? 'text-emerald-400' : 'text-rose-400') : 'text-indigo-400';
                IconComponent = FileCheck;
              } else if (isRusak) {
                iconColor = 'text-amber-400 bg-amber-500/20';
                typeLabel = 'Rusak';
                textColor = 'text-amber-400';
                IconComponent = AlertTriangle;
              } else if (isMasuk) {
                iconColor = 'text-emerald-400 bg-emerald-500/20';
                typeLabel = 'Masuk';
                textColor = 'text-emerald-400';
                IconComponent = ArrowUpRight;
              }

              const dateObj = new Date(tx.date);
              const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

              return (
                <div key={tx.id} className="flex flex-col p-4 rounded-2xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                        <IconComponent size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{tx.name}</h4>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{tx.sku}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-lg font-black ${textColor}`}>
                        {isMasuk && !isOpname ? '+' : (isOpname && tx.type === 'Masuk' ? '+' : '-')}{tx.qty}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{typeLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <UserIcon size={12} />
                      {tx.user}
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      {dateStr} • {timeStr}
                      <Clock size={12} />
                    </div>
                  </div>

                  {tx.note && tx.note !== '-' && (
                    <div className="mt-2 text-[11px] text-slate-300 bg-black/20 p-2 rounded-lg italic">
                      "{tx.note}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Calendar size={48} className="mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Tidak ada riwayat ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
