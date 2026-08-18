import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Boxes, 
  Layers, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { InventoryItem, AppUser, BundleComponent } from '../types';
import { calculateBundleStock } from '../lib/bundleUtils';

interface TambahViewProps {
  inventoryData: InventoryItem[];
  currentUser: AppUser | null;
  onSaveNewItem: (newItem: InventoryItem, initialStock: number) => void;
  onOpenImportModal?: (tab?: 'inventory' | 'transactions') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TambahView: React.FC<TambahViewProps> = ({
  inventoryData,
  currentUser,
  onSaveNewItem,
  onOpenImportModal,
  showToast
}) => {
  // Mode switcher: 'standard' | 'bundle'
  const [itemType, setItemType] = useState<'standard' | 'bundle'>('standard');

  // Standard item form
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(5);

  // Bundle package form
  const [bundleSku, setBundleSku] = useState('');
  const [bundleName, setBundleName] = useState('');
  const [bundleMinStock, setBundleMinStock] = useState<number | ''>(5);
  const [bundleComponents, setBundleComponents] = useState<BundleComponent[]>([]);
  
  // Component selector state
  const [selectedCompSku, setSelectedCompSku] = useState('');
  const [selectedCompQty, setSelectedCompQty] = useState<number | ''>(1);

  const [sessionItems, setSessionItems] = useState<InventoryItem[]>([]);

  // List of items eligible to be added as bundle components (non-bundles)
  const eligibleComponents = inventoryData.filter(i => !i.isBundle);

  // Calculate live capacity for currently configured bundle
  const mockBundle: InventoryItem = {
    sku: bundleSku || 'TEMP',
    name: bundleName || 'TEMP',
    stock: 0,
    minStock: typeof bundleMinStock === 'number' ? bundleMinStock : 5,
    isBundle: true,
    bundleItems: bundleComponents
  };
  const liveCapacity = bundleComponents.length > 0 
    ? calculateBundleStock(mockBundle, inventoryData) 
    : 0;

  const handleAddComponent = () => {
    if (!selectedCompSku) {
      showToast('Pilih barang komponen terlebih dahulu!', 'error');
      return;
    }

    const compQtyNum = typeof selectedCompQty === 'number' ? selectedCompQty : parseInt(selectedCompQty) || 1;
    if (compQtyNum <= 0) {
      showToast('Jumlah komponen per paket minimal 1!', 'error');
      return;
    }

    const item = inventoryData.find(i => i.sku === selectedCompSku);
    if (!item) return;

    // Check if already in component list
    const existingIndex = bundleComponents.findIndex(c => c.sku === selectedCompSku);
    if (existingIndex !== -1) {
      setBundleComponents(prev => prev.map((c, idx) => 
        idx === existingIndex ? { ...c, qty: c.qty + compQtyNum } : c
      ));
      showToast(`Jumlah ${item.name} dalam paket diperbarui`, 'success');
    } else {
      setBundleComponents(prev => [
        ...prev, 
        { sku: item.sku, name: item.name, qty: compQtyNum }
      ]);
      showToast(`${item.name} (${compQtyNum} unit) ditambahkan ke paket`, 'success');
    }

    setSelectedCompSku('');
    setSelectedCompQty(1);
  };

  const handleRemoveComponent = (skuToRemove: string) => {
    setBundleComponents(prev => prev.filter(c => c.sku !== skuToRemove));
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
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
      minStock: minStockNum,
      isBundle: false
    };

    onSaveNewItem(newItem, initialStockNum);
    setSessionItems(prev => [newItem, ...prev]);
    setSku('');
    setName('');
    setStock(0);
    setMinStock(5);
  };

  const handleBundleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalSku = bundleSku.trim().toUpperCase();
    const finalName = bundleName.trim();
    const minStockNum = typeof bundleMinStock === 'number' ? bundleMinStock : parseInt(bundleMinStock) || 5;

    if (!finalName) {
      showToast('Nama paket kombinasi tidak boleh kosong!', 'error');
      return;
    }

    if (bundleComponents.length === 0) {
      showToast('Tambahkan minimal 1 barang komponen ke dalam paket!', 'error');
      return;
    }

    if (!finalSku) {
      finalSku = 'PKT-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (inventoryData.some(i => i.sku === finalSku)) {
      showToast(`SKU ${finalSku} sudah terdaftar!`, 'error');
      return;
    }

    if (inventoryData.some(i => i.name.toLowerCase() === finalName.toLowerCase())) {
      showToast(`Nama paket "${finalName}" sudah terdaftar!`, 'error');
      return;
    }

    const newBundleItem: InventoryItem = {
      sku: finalSku,
      name: finalName,
      stock: liveCapacity,
      minStock: minStockNum,
      isBundle: true,
      bundleItems: bundleComponents
    };

    onSaveNewItem(newBundleItem, 0);
    setSessionItems(prev => [newBundleItem, ...prev]);
    setBundleSku('');
    setBundleName('');
    setBundleMinStock(5);
    setBundleComponents([]);
    showToast(`Paket kombinasi "${finalName}" berhasil dibuat!`, 'success');
  };

  return (
    <section className="view-enter space-y-6">
      {/* Bulk Upload Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-cyan-500/20 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Upload size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Punya Banyak Data Barang?</h3>
            <p className="text-xs text-slate-400">Upload file Excel (.xlsx) atau CSV untuk memasukkan puluhan barang sekaligus.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenImportModal?.('inventory')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <FileSpreadsheet size={15} />
          Upload Excel / CSV
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Boxes size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {itemType === 'standard' ? 'Tambah Item Satuan' : 'Buat Barang Paket / Kombinasi'}
              </h2>
              <p className="text-sm text-slate-400">
                {itemType === 'standard' 
                  ? 'Tambahkan master data barang individu/satuan ke database.' 
                  : 'Gabungkan beberapa barang dalam 1 paket. Saat paket keluar, stok barang komponen otomatis berkurang.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="bg-black/40 p-1 rounded-2xl flex border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setItemType('standard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  itemType === 'standard'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Package size={14} />
                Item Satuan
              </button>
              <button
                type="button"
                onClick={() => setItemType('bundle')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  itemType === 'bundle'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Boxes size={14} />
                Barang Paket (Bundle)
              </button>
            </div>
          </div>

          {/* STANDARD ITEM FORM */}
          {itemType === 'standard' && (
            <form onSubmit={handleStandardSubmit} className="space-y-5">
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
                Simpan Item Satuan
              </button>
            </form>
          )}

          {/* BUNDLE / PACKAGE FORM */}
          {itemType === 'bundle' && (
            <form onSubmit={handleBundleSubmit} className="space-y-5">
              {/* Bundle Header Information */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Info size={14} />
                  Informasi Paket Kombinasi
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5 ml-1">
                      SKU Paket <span className="text-slate-500 capitalize normal-case font-normal">(Auto jika kosong)</span>
                    </label>
                    <input 
                      type="text" 
                      value={bundleSku}
                      onChange={e => setBundleSku(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 outline-none transition-all placeholder-slate-600 uppercase" 
                      placeholder="Cth: PKT-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5 ml-1">
                      Batas Alert Minimum
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={bundleMinStock}
                      onChange={e => setBundleMinStock(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full bg-slate-900/80 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 block p-3.5 outline-none transition-all placeholder-slate-600" 
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5 ml-1">
                    Nama Paket Kombinasi
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={bundleName}
                    onChange={e => setBundleName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 outline-none transition-all placeholder-slate-600" 
                    placeholder="Cth: Paket Komputer Kantor Lengkap (PC + Monitor + Aksesoris)"
                  />
                </div>
              </div>

              {/* Component Selector Section */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                    <Layers size={15} className="text-purple-400" />
                    Pilih Barang Komponen Paket
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {bundleComponents.length} barang dipilih
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                      Pilih Barang
                    </label>
                    <select
                      value={selectedCompSku}
                      onChange={e => setSelectedCompSku(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 block p-3.5 outline-none transition-all"
                    >
                      <option value="">-- Pilih Barang dari Gudang --</option>
                      {eligibleComponents.map(item => (
                        <option key={item.sku} value={item.sku}>
                          {item.name} ({item.sku}) — Sisa Stok: {item.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                      Qty per Paket
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="1"
                        value={selectedCompQty}
                        onChange={e => setSelectedCompQty(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 block p-3.5 outline-none transition-all text-center" 
                        placeholder="1"
                      />
                      <button
                        type="button"
                        onClick={handleAddComponent}
                        className="px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/25"
                        title="Tambahkan ke Paket"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of Added Components */}
                {bundleComponents.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {bundleComponents.map((comp) => {
                      const invItem = inventoryData.find(i => i.sku === comp.sku);
                      const currentStock = invItem ? invItem.stock : 0;
                      const maxPossible = Math.floor(currentStock / comp.qty);

                      return (
                        <div 
                          key={comp.sku} 
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.07] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                              {comp.qty}x
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{comp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {comp.sku} • Stok Gudang: <span className={currentStock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{currentStock}</span> (Cukup untuk {maxPossible} paket)
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(comp.sku)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus komponen dari paket"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-xl">
                    Belum ada barang komponen ditambahkan. Pilih barang di atas dan klik tombol tambah (+).
                  </div>
                )}
              </div>

              {/* Live Capacity Card */}
              {bundleComponents.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                      <Boxes size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Estimasi Kapasitas Stok Paket</div>
                      <div className="text-[11px] text-slate-300">
                        Berdasarkan stok komponen di gudang saat ini
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-purple-300">
                      {liveCapacity} <span className="text-xs font-bold text-purple-200">Paket</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Siap Dibuat / Dikirim</div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-2 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 focus:ring-4 focus:ring-purple-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 flex justify-center items-center gap-2"
              >
                <Boxes size={18} strokeWidth={2.5} />
                Simpan & Daftarkan Barang Paket
              </button>
            </form>
          )}
        </div>
      </div>

      {sessionItems.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" />
            Daftar Item Baru Ditambahkan Sesi Ini
          </h3>
          <div className="space-y-3">
            {sessionItems.map((item) => (
              <div key={item.sku} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {item.name}
                    {item.isBundle && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        📦 Paket ({item.bundleItems?.length || 0} barang)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{item.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">
                    {item.isBundle ? `${calculateBundleStock(item, inventoryData)} Paket` : `${item.stock} Unit`}
                  </div>
                  <div className="text-[10px] text-slate-500">Min. Alert: {item.minStock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};


