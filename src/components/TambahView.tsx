import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { InventoryItem, AppUser } from '../types';

interface TambahViewProps {
  inventoryData: InventoryItem[];
  currentUser: AppUser | null;
  onSaveNewItem: (newItem: InventoryItem, initialStock: number) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TambahView: React.FC<TambahViewProps> = ({
  inventoryData,
  currentUser,
  onSaveNewItem,
  showToast
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalSku = sku.trim().toUpperCase();
    const finalName = name.trim();
    const initialStockNum = typeof stock === 'number' ? stock : parseInt(stock) || 0;
    const minStockNum = typeof minStock === 'number' ? minStock : parseInt(minStock) || 5;

    if (!finalName) {
      showToast('Nama barang tidak boleh kosong!', 'error');
      return;
    }

    if (!finalSku) {
      finalSku = 'ITM-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (inventoryData.some(i => i.sku === finalSku)) {
      showToast(`SKU ${finalSku} sudah terdaftar!`, 'error');
      return;
    }

    if (inventoryData.some(i => i.name.toLowerCase() === finalName.toLowerCase())) {
      showToast(`Nama barang "${finalName}" sudah terdaftar!`, 'error');
      return;
    }

    const newItem: InventoryItem = {
      sku: finalSku,
      name: finalName,
      stock: initialStockNum,
      minStock: minStockNum
    };

    onSaveNewItem(newItem, initialStockNum);
    setSku('');
    setName('');
    setStock(0);
    setMinStock(5);
  };

  return (
    <section className="view-enter">
      <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Package size={120} />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-1">Daftar Item Baru</h2>
          <p className="text-sm text-slate-400 mb-6">Tambahkan Master Data barang baru ke database.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                Kode / SKU <span className="text-slate-500 capitalize normal-case font-normal">(Kosongkan untuk otomatis)</span>
              </label>
              <input 
                type="text" 
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-4 outline-none transition-all placeholder-slate-600 uppercase" 
                placeholder="Cth: ITM-001"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                Nama Barang
              </label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-4 outline-none transition-all placeholder-slate-600" 
                placeholder="Masukkan nama barang"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Stok Awal
                </label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={stock}
                  onChange={e => setStock(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-4 outline-none transition-all placeholder-slate-600" 
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Batas Alert (Min.)
                </label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={minStock}
                  onChange={e => setMinStock(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block p-4 outline-none transition-all placeholder-slate-600" 
                  placeholder="5"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:ring-4 focus:ring-blue-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2"
            >
              <Plus size={18} strokeWidth={2.5} />
              Simpan Item Baru
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
