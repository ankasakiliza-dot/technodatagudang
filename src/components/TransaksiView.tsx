import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Repeat,
  Boxes,
  Info,
  CheckCircle2,
  Globe,
  RotateCcw,
  PenLine,
  ShoppingCart,
  Layers
} from 'lucide-react';
import { InventoryItem, CartItem, AppUser, ViewType } from '../types';
import { calculateBundleStock, checkBundleFulfillable, getBundleComponentBreakdown } from '../lib/bundleUtils';

type KeteranganType = 'Online' | 'Retur Online' | 'Lainnya';

interface TransaksiViewProps {
  inventoryData: InventoryItem[];
  currentUser: AppUser | null;
  onSwitchView: (view: ViewType) => void;
  onSaveBulkTransactions: (cartItems: CartItem[]) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  inventoryData,
  currentUser,
  onSwitchView,
  onSaveBulkTransactions,
  showToast
}) => {
  const [txType, setTxType] = useState<'Masuk' | 'Keluar' | 'Rusak'>('Masuk');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchItem, setSearchItem] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [keteranganPreset, setKeteranganPreset] = useState<KeteranganType>('Online');
  const [customKeterangan, setCustomKeterangan] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDropdownItems = inventoryData.filter(item => {
    if (!searchItem) return true;
    const q = searchItem.toLowerCase();
    return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });

  const selectedItemObj = inventoryData.find(i => i.sku === selectedSku);
  const isSelectedBundle = !!selectedItemObj?.isBundle;
  const bundleAvailableStock = selectedItemObj ? calculateBundleStock(selectedItemObj, inventoryData) : 0;
  const bundleBreakdown = selectedItemObj && isSelectedBundle ? getBundleComponentBreakdown(selectedItemObj, inventoryData) : [];

  const validateAndCreateItem = (): CartItem | null => {
    if (!selectedSku) {
      showToast('Silakan pilih barang dari daftar pencarian!', 'error');
      return null;
    }

    const item = inventoryData.find(i => i.sku === selectedSku);
    if (!item) {
      showToast('Barang tidak valid!', 'error');
      return null;
    }

    const numQty = typeof qty === 'number' ? qty : parseInt(qty);
    if (!numQty || numQty <= 0) {
      showToast('Masukkan jumlah kuantitas yang valid!', 'error');
      return null;
    }

    // Check stock for Keluar / Rusak
    if (txType === 'Keluar' || txType === 'Rusak') {
      if (item.isBundle && item.bundleItems && item.bundleItems.length > 0) {
        // Calculate reserved quantities for all components in cart
        const componentDemands: { [sku: string]: number } = {};
        cart.forEach(c => {
          if (c.type === 'Keluar' || c.type === 'Rusak') {
            const cartItemObj = inventoryData.find(i => i.sku === c.sku);
            if (cartItemObj?.isBundle && cartItemObj.bundleItems) {
              cartItemObj.bundleItems.forEach(b => {
                componentDemands[b.sku] = (componentDemands[b.sku] || 0) + (b.qty * c.qty);
              });
            } else {
              componentDemands[c.sku] = (componentDemands[c.sku] || 0) + c.qty;
            }
          }
        });

        // Check if current components have enough capacity
        for (const comp of item.bundleItems) {
          const invComp = inventoryData.find(i => i.sku === comp.sku);
          const currentCompStock = invComp ? invComp.stock : 0;
          const reservedComp = componentDemands[comp.sku] || 0;
          const remainingAvailable = currentCompStock - reservedComp;
          const needed = comp.qty * numQty;

          if (needed > remainingAvailable) {
            const maxPossible = Math.max(0, Math.floor(remainingAvailable / comp.qty));
            showToast(
              `Stok komponen "${comp.name}" tidak mencukupi! Butuh ${needed} unit, tersisa ${remainingAvailable} unit (Maks ${maxPossible} paket).`,
              'error'
            );
            return null;
          }
        }
      } else {
        // Standard item check
        let reservedStock = 0;
        cart.forEach(c => {
          if (c.sku === selectedSku) {
            if (c.type === 'Keluar' || c.type === 'Rusak') reservedStock += c.qty;
            if (c.type === 'Masuk') reservedStock -= c.qty;
          }
        });
        const availableStock = item.stock - reservedStock;
        if (numQty > availableStock) {
          showToast(`Stok tidak mencukupi! (Sisa tersedia: ${availableStock})`, 'error');
          return null;
        }
      }
    }

    // Prepare ISO date with time (current time but selected date)
    const now = new Date();
    const [year, month, day] = txDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    // Calculate final transaction note based on chosen preset
    let finalNote = '';
    if (keteranganPreset === 'Online') {
      finalNote = customKeterangan.trim() ? `Online - ${customKeterangan.trim()}` : 'Online';
    } else if (keteranganPreset === 'Retur Online') {
      finalNote = customKeterangan.trim() ? `Retur Online - ${customKeterangan.trim()}` : 'Retur Online';
    } else {
      finalNote = customKeterangan.trim() || (item.isBundle ? 'Transaksi Barang Paket' : 'Lainnya');
    }

    return {
      id: Date.now() + Math.random(),
      sku: item.sku,
      name: item.name,
      type: txType,
      qty: numQty,
      note: finalNote,
      date: selectedDate.toISOString()
    };
  };

  const handleAddToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newItem = validateAndCreateItem();
    if (!newItem) return;

    setCart(prev => [...prev, newItem]);
    setSearchItem('');
    setSelectedSku('');
    setQty('');
    setCustomKeterangan('');
    showToast(`${newItem.name} dimasukkan ke antrean transaksi`, 'success');
  };

  const handleDirectSave = () => {
    const newItem = validateAndCreateItem();
    if (!newItem) return;

    onSaveBulkTransactions([newItem]);
    setSearchItem('');
    setSelectedSku('');
    setQty('');
    setCustomKeterangan('');
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSubmitCart = () => {
    if (cart.length === 0) return;
    onSaveBulkTransactions(cart);
    setCart([]);
    setTxType('Masuk');
  };

  // Dynamic theme colors based on active transaction type
  const themeColors = {
    Masuk: {
      border: 'border-2 border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      btnDirect: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/30',
      iconColor: 'text-emerald-400',
      accentGlow: 'from-emerald-950/20 via-slate-900/90 to-slate-900/95'
    },
    Keluar: {
      border: 'border-2 border-rose-500/50 hover:border-rose-400 shadow-rose-500/10',
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      btnDirect: 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white border-2 border-rose-400/50 shadow-lg shadow-rose-500/30',
      iconColor: 'text-rose-400',
      accentGlow: 'from-rose-950/20 via-slate-900/90 to-slate-900/95'
    },
    Rusak: {
      border: 'border-2 border-amber-500/50 hover:border-amber-400 shadow-amber-500/10',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      btnDirect: 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white border-2 border-amber-400/50 shadow-lg shadow-amber-500/30',
      iconColor: 'text-amber-400',
      accentGlow: 'from-amber-950/20 via-slate-900/90 to-slate-900/95'
    }
  }[txType];

  return (
    <section className="view-enter">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className={`glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all bg-gradient-to-br ${themeColors.accentGlow} ${themeColors.border}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Repeat size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full animate-pulse ${txType === 'Masuk' ? 'bg-emerald-400' : txType === 'Keluar' ? 'bg-rose-400' : 'bg-amber-400'}`} />
              <h2 className="text-2xl font-black text-white tracking-tight">Catat Transaksi</h2>
            </div>
            <button 
              onClick={() => onSwitchView('riwayat')} 
              className="text-xs font-bold bg-white/10 text-white px-3.5 py-1.5 rounded-xl hover:bg-white/20 transition-all border-2 border-white/15 active:scale-95 shadow-sm"
            >
              Lihat Riwayat
            </button>
          </div>
          <p className="text-sm text-slate-300 mb-6">Kelola dan simpan pergerakan barang masuk, keluar, atau rusak ke database.</p>

          <form onSubmit={handleAddToCart} className="space-y-4">
            {/* Date and Type Switcher Container */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Tanggal
                </label>
                <input 
                  type="date" 
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="w-full bg-slate-900/90 border-2 border-white/15 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-xs rounded-xl block p-3 outline-none transition-all font-semibold [color-scheme:dark]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Tipe Transaksi
                </label>
                <div className="bg-slate-950/80 p-1.5 rounded-2xl flex gap-1.5 border-2 border-white/15 h-[50px] shadow-inner">
                  <label className="flex-1 cursor-pointer relative">
                    <input 
                      type="radio" 
                      name="tipe" 
                      value="Masuk" 
                      checked={txType === 'Masuk'}
                      onChange={() => setTxType('Masuk')}
                      className="peer sr-only"
                    />
                    <div className={`relative z-10 h-full rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                      txType === 'Masuk' 
                        ? 'bg-emerald-500/30 text-emerald-300 border-2 border-emerald-500/60 shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                    }`}>
                      <ArrowUpRight size={16} className={txType === 'Masuk' ? 'text-emerald-400 stroke-[2.5]' : 'text-slate-500'} />
                      <span>Barang Masuk</span>
                    </div>
                  </label>

                  <label className="flex-1 cursor-pointer relative">
                    <input 
                      type="radio" 
                      name="tipe" 
                      value="Keluar" 
                      checked={txType === 'Keluar'}
                      onChange={() => setTxType('Keluar')}
                      className="peer sr-only"
                    />
                    <div className={`relative z-10 h-full rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                      txType === 'Keluar' 
                        ? 'bg-rose-500/30 text-rose-300 border-2 border-rose-500/60 shadow-md shadow-rose-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                    }`}>
                      <ArrowDownRight size={16} className={txType === 'Keluar' ? 'text-rose-400 stroke-[2.5]' : 'text-slate-500'} />
                      <span>Barang Keluar</span>
                    </div>
                  </label>

                  <label className="flex-1 cursor-pointer relative">
                    <input 
                      type="radio" 
                      name="tipe" 
                      value="Rusak" 
                      checked={txType === 'Rusak'}
                      onChange={() => setTxType('Rusak')}
                      className="peer sr-only"
                    />
                    <div className={`relative z-10 h-full rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                      txType === 'Rusak' 
                        ? 'bg-amber-500/30 text-amber-300 border-2 border-amber-500/60 shadow-md shadow-amber-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                    }`}>
                      <AlertTriangle size={15} className={txType === 'Rusak' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-500'} />
                      <span>Barang Rusak</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Item Search & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-1">
                  Pencarian Barang
                </label>
                <button 
                  type="button" 
                  onClick={() => onSwitchView('tambah')} 
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus size={14} /> Tambah Item Baru
                </button>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={searchItem}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={e => {
                    setSearchItem(e.target.value);
                    setDropdownOpen(true);
                  }}
                  className="w-full bg-slate-900/90 border-2 border-white/15 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-sm rounded-xl block p-3.5 outline-none transition-all placeholder-slate-500 font-semibold shadow-inner" 
                  placeholder="Ketik SKU atau Nama Barang..." 
                  required
                />
              </div>

              {dropdownOpen && (
                <ul className="absolute z-50 w-full mt-2 bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {filteredDropdownItems.length === 0 ? (
                    <li className="p-4 text-sm text-slate-400 text-center">Barang tidak ditemukan</li>
                  ) : (
                    filteredDropdownItems.map(item => {
                      const displayStock = item.isBundle 
                        ? calculateBundleStock(item, inventoryData) 
                        : item.stock;

                      return (
                        <li 
                          key={item.sku}
                          onClick={() => {
                            setSearchItem(item.name);
                            setSelectedSku(item.sku);
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-cyan-500/10 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              {item.name}
                              {item.isBundle && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40">
                                  📦 Paket ({item.bundleItems?.length || 0})
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-cyan-400 font-semibold">{item.sku}</div>
                          </div>
                          <div className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            displayStock > 0 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {item.isBundle ? `Kapasitas: ${displayStock} Pkt` : `Stok: ${displayStock}`}
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>

            {/* BUNDLE INFO & COMPONENT STATUS CARD */}
            {selectedItemObj && isSelectedBundle && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-2 border-purple-500/40 space-y-3 shadow-md shadow-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide">
                    <Boxes size={16} />
                    Barang Paket Kombinasi Terpilih
                  </div>
                  <div className="text-xs font-bold text-purple-200 bg-purple-500/25 px-2.5 py-1 rounded-lg border border-purple-500/40">
                    Kapasitas: {bundleAvailableStock} Paket
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  {txType === 'Keluar' || txType === 'Rusak' 
                    ? '⚠️ Saat transaksi KELUAR/RUSAK diproses, sistem akan secara otomatis memotong stok barang-barang komponen berikut:' 
                    : 'ℹ️ Komponen yang terdaftar dalam paket ini:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bundleBreakdown.map(comp => (
                    <div 
                      key={comp.sku} 
                      className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-purple-300 mr-1.5">{comp.requiredQty}x</span>
                        <span className="text-white font-semibold">{comp.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono text-xs font-bold ${comp.currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Stok: {comp.currentStock}
                        </span>
                        {comp.isLimiting && (
                          <span className="block text-[9px] text-amber-400 font-semibold">
                            (Maks {comp.maxSets} pkt)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qty & Keterangan Transaksi */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                    Kuantitas {isSelectedBundle && <span className="text-purple-400 font-normal lowercase">(paket)</span>}
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={qty}
                    onChange={e => setQty(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-slate-900/90 border-2 border-white/15 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-base rounded-xl block p-3.5 outline-none transition-all placeholder-slate-600 font-black shadow-inner" 
                    placeholder="0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                    Pilihan Keterangan Transaksi
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border-2 border-white/15 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setKeteranganPreset('Online')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        keteranganPreset === 'Online'
                          ? 'bg-blue-600/30 text-blue-300 border-2 border-blue-500/60 shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                      }`}
                    >
                      <Globe size={14} className="shrink-0" />
                      <span className="truncate">Online</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setKeteranganPreset('Retur Online')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        keteranganPreset === 'Retur Online'
                          ? 'bg-amber-600/30 text-amber-300 border-2 border-amber-500/60 shadow-md shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                      }`}
                    >
                      <RotateCcw size={14} className="shrink-0" />
                      <span className="truncate">Retur Online</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setKeteranganPreset('Lainnya')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        keteranganPreset === 'Lainnya'
                          ? 'bg-purple-600/30 text-purple-300 border-2 border-purple-500/60 shadow-md shadow-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border-2 border-transparent'
                      }`}
                    >
                      <PenLine size={14} className="shrink-0" />
                      <span className="truncate">Lainnya</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail / Catatan Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1 flex items-center justify-between">
                  <span>
                    {keteranganPreset === 'Online' && 'Keterangan / Order ID Online (Opsional)'}
                    {keteranganPreset === 'Retur Online' && 'Catatan Retur Online (Opsional)'}
                    {keteranganPreset === 'Lainnya' && 'Keterangan Manual'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 lowercase">
                    {keteranganPreset === 'Lainnya' ? 'diisi manual' : 'cth: no. resi / marketplace / buyer'}
                  </span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customKeterangan}
                    onChange={e => setCustomKeterangan(e.target.value)}
                    className="w-full bg-slate-900/90 border-2 border-white/15 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white text-sm rounded-xl block p-3.5 outline-none transition-all placeholder-slate-500 font-semibold shadow-inner" 
                    placeholder={
                      keteranganPreset === 'Online'
                        ? 'Cth: Shopee #240831ABC / Tokopedia INV/1234...'
                        : keteranganPreset === 'Retur Online'
                        ? 'Cth: Salah ukuran / Barang cacat pabrik / No. Resi Retur...'
                        : 'Cth: Restock / Barang rusak / Penjualan Langsung Toko...'
                    }
                  />
                  {keteranganPreset !== 'Lainnya' && !customKeterangan && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-[11px] text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-bold">
                        Default: {keteranganPreset}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Choice 1 (Queue) or Choice 2 (Direct Save) */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={handleAddToCart}
                className="w-full font-bold rounded-2xl text-xs sm:text-sm px-4 py-4 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2 border-2 border-cyan-500/40 text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 shadow-md shadow-cyan-500/10"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Pilihan 1: Masukkan Antrean</span>
              </button>

              <button 
                type="button" 
                onClick={handleDirectSave}
                className={`w-full font-black rounded-2xl text-xs sm:text-sm px-4 py-4 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${themeColors.btnDirect}`}
              >
                <CheckCircle size={18} strokeWidth={2.5} />
                <span>Pilihan 2: Langsung Simpan Database</span>
              </button>
            </div>
          </form>

            </div>
          </div>
        </div>

        {/* Right Column: Antrean Transaksi (Sticky on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-white/10 relative overflow-hidden bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-cyan-400" />
                <h3 className="text-sm font-black text-white tracking-wide">Antrean Transaksi</h3>
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                    {cart.length} item
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button 
                  type="button" 
                  onClick={handleClearCart} 
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/40">
                <Layers className="mx-auto text-slate-500 mb-2" size={28} />
                <p className="text-xs font-bold text-slate-300">Antrean Masih Kosong</p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Gunakan <span className="text-cyan-300 font-semibold">Pilihan 1</span> untuk menampung beberapa transaksi sekaligus, lalu simpan bersamaan ke database.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {cart.map((item) => {
                    let borderClass = 'border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-slate-900/90 text-emerald-400';
                    let sign = '+';
                    if (item.type === 'Keluar') { 
                      borderClass = 'border-2 border-rose-500/40 bg-gradient-to-r from-rose-950/30 to-slate-900/90 text-rose-400'; 
                      sign = '-'; 
                    }
                    if (item.type === 'Rusak') { 
                      borderClass = 'border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/90 text-amber-400'; 
                      sign = '-'; 
                    }

                    const isCartBundle = inventoryData.some(i => i.sku === item.sku && i.isBundle);

                    return (
                      <div key={item.id} className={`flex items-center justify-between p-3.5 rounded-2xl shadow-sm ${borderClass}`}>
                        <div className="flex-1 overflow-hidden pr-2">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            {item.name}
                            {isCartBundle && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                                📦 Paket
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-1">
                            <span className="font-bold">{item.type} ({sign}{item.qty} {isCartBundle ? 'pkt' : 'unit'})</span>
                            {item.note && item.note !== '-' && (
                              <span className="truncate italic text-slate-400 font-medium">"{item.note}"</span>
                            )}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFromCart(item.id)} 
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all border border-white/10"
                        >
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button 
                  type="button" 
                  onClick={handleSubmitCart} 
                  className="w-full text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 focus:ring-4 focus:ring-cyan-500/30 font-black rounded-2xl text-xs sm:text-sm px-4 py-3.5 text-center transition-all active:scale-[0.98] shadow-xl shadow-cyan-500/25 flex justify-center items-center gap-2 border-2 border-cyan-400/40 cursor-pointer"
                >
                  <CheckCircle size={18} strokeWidth={2.5} />
                  <span>Simpan Semua ({cart.length}) ke Database</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

