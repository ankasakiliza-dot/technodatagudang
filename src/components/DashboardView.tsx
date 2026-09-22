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
  AlertTriangle,
  Boxes,
  Eye,
  Layers,
  X
} from 'lucide-react';
import { InventoryItem, Transaction, AppUser, ViewType } from '../types';
import { downloadInventoryCSV, downloadInventoryPDF } from '../lib/exportUtils';
import { calculateBundleStock, getBundleComponentBreakdown } from '../lib/bundleUtils';

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
  const [activeFilter, setActiveFilter] = useState<'semua' | 'paket' | 'satuan' | 'aman' | 'tipis' | 'habis'>('semua');
  const [selectedBundleBreakdown, setSelectedBundleBreakdown] = useState<InventoryItem | null>(null);

  const totalItems = inventoryData.length;
  const countPaket = inventoryData.filter(item => item.isBundle).length;
  const totalUnits = inventoryData
    .filter(item => !item.isBundle)
    .reduce((sum, item) => sum + (item.stock || 0), 0);

  // Health Stats calculation
  let countAman = 0;
  let countTipis = 0;
  let countHabis = 0;

  inventoryData.forEach(item => {
    const effectiveStock = item.isBundle ? calculateBundleStock(item, inventoryData) : item.stock;
    const min = item.minStock !== undefined ? item.minStock : 5;
    if (effectiveStock === 0) countHabis++;
    else if (effectiveStock <= min) countTipis++;
    else countAman++;
  });

  const totalForPct = totalItems || 1;
  const pctAman = (countAman / totalForPct) * 100;
  const pctTipis = (countTipis / totalForPct) * 100;
  const pctHabis = (countHabis / totalForPct) * 100;

  // Filter Inventory
  const filteredInventory = inventoryData.filter(item => {
    const effectiveStock = item.isBundle ? calculateBundleStock(item, inventoryData) : item.stock;
    const min = item.minStock !== undefined ? item.minStock : 5;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchSearch) return false;

    if (activeFilter === 'paket') return !!item.isBundle;
    if (activeFilter === 'satuan') return !item.isBundle;
    if (activeFilter === 'aman') return effectiveStock > min;
    if (activeFilter === 'tipis') return effectiveStock > 0 && effectiveStock <= min;
    if (activeFilter === 'habis') return effectiveStock === 0;

    return true;
  });

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleFilterChange = (filter: 'semua' | 'paket' | 'satuan' | 'aman' | 'tipis' | 'habis') => {
    setActiveFilter(filter);
  };

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
      {/* Top Stat Cards - 4 Columns on Laptop/PC */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Master Barang */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Columns size={12} />
            Total Master Barang
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">{totalItems}</span>
            {countPaket > 0 && (
              <span className="text-xs font-semibold text-purple-300">({countPaket} paket)</span>
            )}
          </div>
        </div>

        {/* Card 2: Unit Fisik */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-5 shadow-lg shadow-blue-500/25 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-20 text-white">
            <Package size={60} />
          </div>
          <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 relative z-10">
            <Package size={12} />
            Total Unit Fisik
          </span>
          <span className="text-3xl sm:text-4xl font-black text-white relative z-10">{totalUnits}</span>
        </div>

        {/* Card 3: Barang Paket (Bundle) */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group border border-purple-500/25 bg-gradient-to-br from-purple-950/20 to-slate-900/90">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all"></div>
          <span className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Boxes size={12} />
            Paket Bundling
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">{countPaket}</span>
            <span className="text-xs text-purple-400 font-medium">varian aktif</span>
          </div>
        </div>

        {/* Card 4: Status Kritis / Perhatian */}
        <div className={`glass-panel rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group border ${
          countHabis > 0 
            ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 to-slate-900/90' 
            : countTipis > 0 
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/90' 
              : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-slate-900/90'
        }`}>
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-rose-500/10 rounded-full blur-xl"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle size={12} className={countHabis > 0 ? 'text-rose-400' : countTipis > 0 ? 'text-amber-400' : 'text-emerald-400'} />
            Perlu Perhatian
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black ${countHabis > 0 ? 'text-rose-400' : countTipis > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {countHabis + countTipis}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({countHabis} habis, {countTipis} tipis)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Kesehatan Stok Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl shadow-black/10">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              Kesehatan Stok Gudang & Paket
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
              Ketersediaan Data Barang
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Cari SKU / Nama Barang..." 
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
            {(['semua', 'paket', 'satuan', 'aman', 'tipis', 'habis'] as const).map((filter) => {
              const labels = {
                semua: 'Semua Data',
                paket: `📦 Barang Paket (${countPaket})`,
                satuan: 'Item Satuan',
                aman: 'Stok Aman',
                tipis: 'Stok Tipis (Alert)',
                habis: 'Stok Habis (0)'
              };
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>

          {/* Scrollable Table View with Crisp, Legible Typography */}
          <div className="p-2 sm:p-4">
            <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar rounded-2xl border border-white/10 bg-slate-950/40">
              <table className="w-full text-left text-xs text-slate-300 relative border-collapse">
                <thead className="bg-slate-900/95 backdrop-blur-md text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 sticky top-0 z-10 font-bold">
                  <tr>
                    <th scope="col" className="px-3 sm:px-4 py-3 whitespace-nowrap w-24 sm:w-28">SKU</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 min-w-[200px]">ITEM</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">STOK / KAPASITAS</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-center whitespace-nowrap hidden lg:table-cell">MIN STOK</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">STATUS</th>
                    <th scope="col" className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInventory.map(item => {
                    const effectiveStock = item.isBundle 
                      ? calculateBundleStock(item, inventoryData) 
                      : item.stock;
                    const min = item.minStock !== undefined ? item.minStock : 5;
                    let statusClass = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
                    let rowBgClass = 'hover:bg-white/[0.03]';
                    let statusText = 'Aman';
                    let stockTextColor = 'text-emerald-400';

                    if (item.isBundle) {
                      statusClass = 'text-purple-300 bg-purple-500/20 border-purple-500/40';
                      rowBgClass = 'hover:bg-purple-500/[0.04]';
                      statusText = 'Paket';
                      stockTextColor = 'text-purple-300';
                    } else if (effectiveStock === 0) {
                      statusClass = 'text-rose-300 bg-rose-500/20 border-rose-500/40';
                      rowBgClass = 'hover:bg-rose-500/[0.04]';
                      statusText = 'Habis';
                      stockTextColor = 'text-rose-400';
                    } else if (effectiveStock <= min) {
                      statusClass = 'text-amber-300 bg-amber-500/20 border-amber-500/40';
                      rowBgClass = 'hover:bg-amber-500/[0.04]';
                      statusText = 'Tipis';
                      stockTextColor = 'text-amber-400';
                    }

                    return (
                      <tr key={item.sku} className={`transition-colors ${rowBgClass}`}>
                        {/* SKU */}
                        <td className="px-3 sm:px-4 py-3 font-mono text-[11px] sm:text-xs font-bold text-slate-300 whitespace-nowrap align-top sm:align-middle">
                          <span className="bg-black/40 px-2 py-1 rounded border border-white/5 inline-block">
                            {item.sku}
                          </span>
                        </td>

                        {/* ITEM NAME */}
                        <td className="px-3 sm:px-4 py-3 align-top sm:align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-[13px] font-semibold text-white leading-snug break-words">
                              {item.name}
                            </span>
                            {item.isBundle && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBundleBreakdown(item)}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40 hover:bg-purple-500/35 transition-all inline-flex items-center gap-1 cursor-pointer w-fit"
                                  title="Klik untuk melihat rincian barang paket"
                                >
                                  <Boxes size={11} />
                                  <span>Paket ({item.bundleItems?.length || 0})</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* STOK / KAPASITAS */}
                        <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap align-top sm:align-middle">
                          <span className={`text-sm sm:text-base font-black ${stockTextColor}`}>
                            {effectiveStock}
                          </span>
                          <span className="text-[11px] font-normal text-slate-400 ml-1">
                            {item.isBundle ? 'pkt' : 'unit'}
                          </span>
                        </td>

                        {/* MIN STOK (DESKTOP) */}
                        <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap align-top sm:align-middle hidden lg:table-cell font-mono text-slate-400 font-semibold">
                          {item.isBundle ? '-' : min}
                        </td>

                        {/* STATUS */}
                        <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap align-top sm:align-middle">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-block ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* AKSI */}
                        <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap align-top sm:align-middle">
                          <div className="flex items-center justify-center gap-1">
                            {item.isBundle && (
                              <button 
                                onClick={() => setSelectedBundleBreakdown(item)} 
                                className="p-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-lg transition-colors border border-purple-500/30" 
                                title="Lihat Rincian Komponen Paket"
                              >
                                <Eye size={13} strokeWidth={2.2} />
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => onPromptEdit(item.sku)} 
                                  className="p-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-lg transition-colors border border-blue-500/30" 
                                  title="Edit Barang"
                                >
                                  <Pencil size={13} strokeWidth={2.2} />
                                </button>
                                <button 
                                  onClick={() => onPromptDelete(item.sku)} 
                                  className="p-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-lg transition-colors border border-rose-500/30" 
                                  title="Hapus Barang"
                                >
                                  <Trash2 size={13} strokeWidth={2.2} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredInventory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Package size={48} className="mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Tidak ada data ditemukan</p>
            </div>
          )}

          {/* Simple Clean Summary Footer */}
          {filteredInventory.length > 0 && (
            <div className="px-5 py-3 bg-black/30 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>
                Total Data: <strong className="text-white font-semibold">{filteredInventory.length}</strong> barang
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Scroll di dalam tabel untuk melihat semua data barang
              </span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentTransactions.map(tx => {
              const isMasuk = tx.type === 'Masuk';
              const isRusak = tx.type === 'Rusak';
              const isOpname = tx.note && (tx.note.includes('Opname') || tx.note.includes('Selisih'));

              let cardBorder = 'border-2 border-rose-500/40 hover:border-rose-400 bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-900/90';
              let iconColor = 'text-rose-400 bg-rose-500/20 border border-rose-500/40';
              let badgeColor = 'text-rose-300 bg-rose-500/20 border border-rose-500/40';
              let textColor = 'text-rose-400';
              let IconComponent = ArrowDownRight;
              let typeLabel = 'Keluar';

              if (isOpname) {
                cardBorder = 'border-2 border-indigo-500/40 hover:border-indigo-400 bg-gradient-to-r from-indigo-950/20 via-slate-900/80 to-slate-900/90';
                iconColor = 'text-indigo-400 bg-indigo-500/20 border border-indigo-500/40';
                badgeColor = 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/40';
                textColor = 'text-indigo-400';
                IconComponent = FileText;
                typeLabel = 'Opname';
              } else if (isRusak) {
                cardBorder = 'border-2 border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900/90';
                iconColor = 'text-amber-400 bg-amber-500/20 border border-amber-500/40';
                badgeColor = 'text-amber-300 bg-amber-500/20 border border-amber-500/40';
                textColor = 'text-amber-400';
                IconComponent = AlertTriangle;
                typeLabel = 'Rusak';
              } else if (isMasuk) {
                cardBorder = 'border-2 border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-r from-emerald-950/20 via-slate-900/80 to-slate-900/90';
                iconColor = 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/40';
                badgeColor = 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40';
                textColor = 'text-emerald-400';
                IconComponent = ArrowUpRight;
                typeLabel = 'Masuk';
              }

              const dateObj = new Date(tx.date);
              const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

              return (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all shadow-md ${cardBorder}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${iconColor}`}>
                      <IconComponent size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-semibold text-white leading-snug break-words max-w-[200px] sm:max-w-md">{tx.name}</h4>
                      <div className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded ${badgeColor}`}>
                          {typeLabel}
                        </span>
                        <span className="font-mono text-slate-400">{timeStr}</span>
                        {tx.note && tx.note !== '-' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 truncate max-w-[150px]">
                            {tx.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-black leading-none ${textColor}`}>
                      {isMasuk ? '+' : '-'}{tx.qty}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 capitalize font-medium">
                      oleh <span className="text-slate-300 font-semibold">{tx.user}</span>
                    </div>
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

      {/* BUNDLE BREAKDOWN MODAL */}
      {selectedBundleBreakdown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl modal-content-enter space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Boxes size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBundleBreakdown.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">SKU: {selectedBundleBreakdown.sku}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBundleBreakdown(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Capacity Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Kapasitas Maksimal Paket</div>
                <div className="text-xs text-slate-300">Berdasarkan stok komponen terendah di gudang</div>
              </div>
              <div className="text-2xl font-black text-white">
                {calculateBundleStock(selectedBundleBreakdown, inventoryData)} <span className="text-xs text-purple-300 font-semibold">Paket</span>
              </div>
            </div>

            {/* Components list */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers size={14} className="text-purple-400" />
                Komponen Pembentuk Paket
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {getBundleComponentBreakdown(selectedBundleBreakdown, inventoryData).map(comp => (
                  <div 
                    key={comp.sku}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      comp.isLimiting 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{comp.name}</span>
                        {comp.isLimiting && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Komponen Pembatas
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {comp.sku} • Butuh <span className="text-purple-300 font-bold">{comp.requiredQty} unit</span> per paket
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold ${comp.currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Stok: {comp.currentStock}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cukup untuk: {comp.maxSets} paket
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedBundleBreakdown(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all active:scale-95"
              >
                Tutup
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const bundleToEdit = selectedBundleBreakdown;
                    setSelectedBundleBreakdown(null);
                    onPromptEdit(bundleToEdit.sku);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Pencil size={15} />
                  <span>Edit Isi Paket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

