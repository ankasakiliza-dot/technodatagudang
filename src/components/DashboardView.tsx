import React, { useState } from 'react';
import { 
  Columns, 
  Package, 
  Activity, 
  FileSpreadsheet, 
  Search, 
  Download, 
  Upload,
  FileText, 
  Pencil, 
  Trash2, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle 
} from 'lucide-react';
import { InventoryItem, Transaction, AppUser, ViewType } from '../types';
import { downloadInventoryCSV, downloadInventoryPDF } from '../lib/exportUtils';

interface DashboardViewProps {
  inventoryData: InventoryItem[];
  transactions: Transaction[];
  currentUser: AppUser | null;
  onSwitchView: (view: ViewType) => void;
  onPromptEdit: (sku: string) => void;
  onPromptDelete: (sku: string) => void;
  onOpenImportModal?: (tab?: 'inventory' | 'transactions') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventoryData,
  transactions,
  currentUser,
  onSwitchView,
  onPromptEdit,
  onPromptDelete,
  onOpenImportModal,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'semua' | 'aman' | 'tipis' | 'habis'>('semua');

  const totalItems = inventoryData.length;
  const totalUnits = inventoryData.reduce((sum, item) => sum + (item.stock || 0), 0);

  // Health Stats
  let countAman = 0;
  let countTipis = 0;
  let countHabis = 0;

  inventoryData.forEach(item => {
    const min = item.minStock !== undefined ? item.minStock : 5;
    if (item.stock === 0) countHabis++;
    else if (item.stock <= min) countTipis++;
    else countAman++;
  });

  const totalForPct = totalItems || 1;
  const pctAman = (countAman / totalForPct) * 100;
  const pctTipis = (countTipis / totalForPct) * 100;
  const pctHabis = (countHabis / totalForPct) * 100;

  // Filter Inventory
  const filteredInventory = inventoryData.filter(item => {
    const min = item.minStock !== undefined ? item.minStock : 5;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchFilter = true;
    if (activeFilter === 'aman') matchFilter = item.stock > min;
    if (activeFilter === 'tipis') matchFilter = item.stock > 0 && item.stock <= min;
    if (activeFilter === 'habis') matchFilter = item.stock === 0;

    return matchSearch && matchFilter;
  });

  const handleExportCSV = () => {
    const ok = downloadInventoryCSV(filteredInventory);
    if (ok) showToast('Laporan Stok Excel (CSV) berhasil diunduh', 'success');
    else showToast('Tidak ada data stok untuk diunduh', 'error');
  };

  const handleExportPDF = () => {
    const ok = downloadInventoryPDF(filteredInventory);
    if (ok) showToast('Laporan Stok PDF berhasil diunduh', 'success');
    else showToast('Tidak ada data stok untuk laporan PDF', 'error');
  };

  const recentTransactions = transactions.slice(0, 5);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <section className="space-y-6 view-enter">
      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Columns size={12} />
            Total Item
          </span>
          <span className="text-4xl font-black text-white">{totalItems}</span>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-5 shadow-lg shadow-blue-500/25 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-20 text-white">
            <Package size={60} />
          </div>
          <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 relative z-10">
            <Package size={12} />
            Total Unit
          </span>
          <span className="text-4xl font-black text-white relative z-10">{totalUnits}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Kesehatan Stok Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl shadow-black/10">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              Kesehatan Stok
            </h3>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${pctAman}%` }} title={`Aman: ${countAman}`} />
            <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${pctTipis}%` }} title={`Tipis: ${countTipis}`} />
            <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${pctHabis}%` }} title={`Habis: ${countHabis}`} />
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-semibold text-slate-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Aman ({countAman})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Tipis ({countTipis})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Habis ({countHabis})</div>
          </div>
        </div>

        {/* Ketersediaan Data Table Card */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl shadow-black/10">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-blue-400" />
              Ketersediaan Data
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari SKU / Barang..." 
                  className="w-full bg-slate-900/50 border border-white/10 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block pl-10 pr-4 py-2.5 placeholder-slate-500 text-white transition-all outline-none"
                />
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button 
                  onClick={() => onOpenImportModal?.('inventory')}
                  className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/20 flex items-center gap-1.5 text-xs font-semibold" 
                  title="Upload / Import Database Excel & CSV"
                >
                  <Upload size={16} />
                  <span className="hidden md:inline">Upload Excel</span>
                </button>
                <button 
                  onClick={handleExportCSV} 
                  className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/20" 
                  title="Unduh Stok Excel (CSV)"
                >
                  <Download size={16} />
                </button>
                <button 
                  onClick={handleExportPDF} 
                  className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors border border-rose-500/20" 
                  title="Unduh Stok Laporan PDF"
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-5 py-3 border-b border-white/10 bg-black/20 flex gap-2 overflow-x-auto custom-scrollbar">
            {(['semua', 'aman', 'tipis', 'habis'] as const).map((filter) => {
              const labels = {
                semua: 'Semua Data',
                aman: 'Stok Aman',
                tipis: 'Stok Tipis (Alert)',
                habis: 'Stok Habis (0)'
              };
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
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

          {/* Table */}
          <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300 relative">
              <thead className="bg-slate-800/80 backdrop-blur-md text-[10px] uppercase tracking-widest text-slate-400 border-b border-white/5 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold w-1/4 whitespace-nowrap">SKU</th>
                  <th scope="col" className="px-5 py-4 font-semibold w-1/2 min-w-[150px]">Item</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-right w-1/4">Stok</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-center whitespace-nowrap">Status</th>
                  {isAdmin && <th scope="col" className="px-5 py-4 font-semibold text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInventory.map(item => {
                  const min = item.minStock !== undefined ? item.minStock : 5;
                  let statusClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  let statusText = 'Aman';

                  if (item.stock === 0) {
                    statusClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                    statusText = 'Habis';
                  } else if (item.stock <= min) {
                    statusClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                    statusText = 'Tipis';
                  }

                  return (
                    <tr key={item.sku} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.sku}</td>
                      <td className="px-5 py-4 font-semibold text-white">{item.name}</td>
                      <td className="px-5 py-4 font-bold text-right text-lg">{item.stock}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => onPromptEdit(item.sku)} 
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20" 
                              title="Edit Barang"
                            >
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => onPromptDelete(item.sku)} 
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20" 
                              title="Hapus Barang"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Package size={48} className="mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Tidak ada data ditemukan</p>
            </div>
          )}
        </div>

        {/* Riwayat Transaksi Terakhir Card */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Riwayat Transaksi Terakhir
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => onSwitchView('transaksi')} 
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus size={12} /> Catat
              </button>
              <button 
                onClick={() => onSwitchView('riwayat')} 
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg"
              >
                Lihat Semua
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentTransactions.map(tx => {
              const isMasuk = tx.type === 'Masuk';
              const isRusak = tx.type === 'Rusak';
              let iconColor = 'text-rose-400 bg-rose-500/20';
              let textColor = 'text-rose-400';
              let IconComponent = ArrowDownRight;

              if (isRusak) {
                iconColor = 'text-amber-400 bg-amber-500/20';
                textColor = 'text-amber-400';
                IconComponent = AlertTriangle;
              } else if (isMasuk) {
                iconColor = 'text-emerald-400 bg-emerald-500/20';
                textColor = 'text-emerald-400';
                IconComponent = ArrowUpRight;
              }

              const dateObj = new Date(tx.date);
              const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                      <IconComponent size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight truncate max-w-[140px] sm:max-w-xs">{tx.name}</h4>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{tx.type}</span> • <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${textColor}`}>{isMasuk ? '+' : '-'}{tx.qty}</div>
                    <div className="text-[10px] text-slate-500">{tx.user}</div>
                  </div>
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 opacity-50">
                <p className="text-xs font-medium text-slate-400">Belum ada transaksi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
