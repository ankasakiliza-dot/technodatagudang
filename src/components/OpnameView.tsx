import React, { useState } from 'react';
import { Search, CheckCircle, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InventoryItem } from '../types';

interface OpnameViewProps {
  inventoryData: InventoryItem[];
  onSaveOpname: (adjustments: { [sku: string]: number }) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const OpnameView: React.FC<OpnameViewProps> = ({
  inventoryData,
  onSaveOpname,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [physicalStocks, setPhysicalStocks] = useState<{ [sku: string]: number }>({});

  const handlePhysicalChange = (sku: string, val: string, defaultStock: number) => {
    const num = val === '' ? defaultStock : parseInt(val);
    setPhysicalStocks(prev => ({ ...prev, [sku]: isNaN(num) ? 0 : num }));
  };

  const filteredItems = inventoryData.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });

  const changedCount = Object.keys(physicalStocks).filter(sku => {
    const item = inventoryData.find(i => i.sku === sku);
    return item && physicalStocks[sku] !== item.stock;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOpname(physicalStocks);
  };

  return (
    <section className="view-enter">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-slate-900/90 to-slate-900/95">
        <div className="px-5 sm:px-7 py-6 border-b-2 border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                <h2 className="text-2xl font-black text-white tracking-tight">Stok Opname</h2>
              </div>
              <p className="text-sm text-slate-300">Sesuaikan stok fisik nyata dengan stok tercatat pada sistem gudang.</p>
            </div>
            {changedCount > 0 && (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
                <AlertCircle size={15} />
                <span>{changedCount} item disesuaikan</span>
              </div>
            )}
          </div>

          <div className="relative w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari SKU atau Nama Barang..." 
              className="w-full bg-slate-900/90 border-2 border-white/15 hover:border-indigo-500/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 text-sm rounded-xl block pl-10 pr-4 py-3 placeholder-slate-500 text-white transition-all outline-none font-semibold shadow-inner"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto max-h-[520px] custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300 relative">
              <thead className="bg-slate-950/90 backdrop-blur-md text-[11px] uppercase tracking-wider text-slate-400 border-b-2 border-white/10 sticky top-0 z-10 font-bold">
                <tr>
                  <th scope="col" className="px-5 py-4 w-1/4 whitespace-nowrap">SKU & Jenis</th>
                  <th scope="col" className="px-5 py-4 w-2/5 min-w-[160px]">Nama Barang</th>
                  <th scope="col" className="px-5 py-4 text-center w-1/5 whitespace-nowrap">Stok Sistem</th>
                  <th scope="col" className="px-5 py-4 text-center w-1/5 whitespace-nowrap">Stok Fisik Nyata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => {
                  const currentPhysical = physicalStocks[item.sku] !== undefined 
                    ? physicalStocks[item.sku] 
                    : item.stock;
                  
                  const diff = currentPhysical - item.stock;

                  return (
                    <tr key={item.sku} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-cyan-400 font-bold">{item.sku}</div>
                        {item.isBundle ? (
                          <span className="text-[10px] text-purple-300 font-bold">Paket Kombinasi</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Satuan</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">{item.name}</div>
                        <div className="text-[10px] text-slate-400">Min. Alert: {item.minStock}</div>
                      </td>
                      <td className="px-5 py-4 font-black text-center text-slate-200 text-base">
                        {item.stock}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            required 
                            value={currentPhysical}
                            onChange={e => handlePhysicalChange(item.sku, e.target.value, item.stock)}
                            className={`w-24 bg-slate-900 border-2 text-white text-center text-sm font-black rounded-xl p-2.5 outline-none transition-all ${
                              diff === 0 
                                ? 'border-white/15 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30' 
                                : diff > 0 
                                  ? 'border-emerald-500/60 bg-emerald-950/20 focus:border-emerald-400 text-emerald-300' 
                                  : 'border-rose-500/60 bg-rose-950/20 focus:border-rose-400 text-rose-300'
                            }`}
                          />
                          {diff !== 0 && (
                            <span className={`text-[11px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 whitespace-nowrap ${
                              diff > 0 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {diff > 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 sm:p-6 bg-slate-950/80 border-t-2 border-indigo-500/20">
            <button 
              type="submit" 
              className="w-full text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 focus:ring-4 focus:ring-indigo-500/30 font-black rounded-2xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/25 flex justify-center items-center gap-2 border-2 border-indigo-400/40"
            >
              <CheckCircle size={20} strokeWidth={2.5} />
              <span>Simpan & Terapkan Hasil Stok Opname</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
