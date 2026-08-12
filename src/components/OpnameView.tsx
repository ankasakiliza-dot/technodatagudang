import React, { useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOpname(physicalStocks);
  };

  return (
    <section className="view-enter">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl shadow-black/10">
        <div className="px-5 py-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/40 to-slate-900/40">
          <h2 className="text-2xl font-bold text-white mb-1">Stok Opname</h2>
          <p className="text-sm text-slate-400 mb-4">Sesuaikan stok fisik dengan stok tercatat pada sistem.</p>

          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari SKU / Nama Barang..." 
              className="w-full bg-slate-900/80 border border-white/10 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-10 pr-4 py-3 placeholder-slate-400 text-white transition-all outline-none"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300 relative">
              <thead className="bg-slate-800/80 backdrop-blur-md text-[10px] uppercase tracking-widest text-slate-400 border-b border-white/5 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold w-1/4 whitespace-nowrap">SKU</th>
                  <th scope="col" className="px-5 py-4 font-semibold w-2/5 min-w-[150px]">Item</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-center w-1/5 whitespace-nowrap">Stok Sistem</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-center w-1/5 whitespace-nowrap">Stok Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => {
                  const currentPhysical = physicalStocks[item.sku] !== undefined 
                    ? physicalStocks[item.sku] 
                    : item.stock;

                  return (
                    <tr key={item.sku} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{item.sku}</td>
                      <td className="px-5 py-4 font-semibold text-white text-xs">{item.name}</td>
                      <td className="px-5 py-4 font-bold text-center text-slate-300">{item.stock}</td>
                      <td className="px-5 py-4">
                        <input 
                          type="number" 
                          min="0" 
                          required 
                          value={currentPhysical}
                          onChange={e => handlePhysicalChange(item.sku, e.target.value, item.stock)}
                          className="w-full bg-slate-900 border border-white/20 text-white text-center text-sm rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-2 outline-none transition-all"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-black/20 border-t border-white/10">
            <button 
              type="submit" 
              className="w-full text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 focus:ring-4 focus:ring-indigo-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2"
            >
              <CheckCircle size={18} strokeWidth={2.5} />
              Simpan & Sesuaikan Opname
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
