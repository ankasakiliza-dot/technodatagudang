import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Repeat 
} from 'lucide-react';
import { InventoryItem, CartItem, AppUser, ViewType } from '../types';

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
  const [searchItem, setSearchItem] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [keterangan, setKeterangan] = useState('');
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

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) {
      showToast('Silakan pilih barang dari daftar pencarian!', 'error');
      return;
    }

    const item = inventoryData.find(i => i.sku === selectedSku);
    if (!item) {
      showToast('Barang tidak valid!', 'error');
      return;
    }

    const numQty = typeof qty === 'number' ? qty : parseInt(qty);
    if (!numQty || numQty <= 0) {
      showToast('Masukkan jumlah kuantitas yang valid!', 'error');
      return;
    }

    // Check stock for Keluar / Rusak
    if (txType === 'Keluar' || txType === 'Rusak') {
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
        return;
      }
    }

    const newCartItem: CartItem = {
      id: Date.now() + Math.random(),
      sku: item.sku,
      name: item.name,
      type: txType,
      qty: numQty,
      note: keterangan.trim() || '-'
    };

    setCart(prev => [...prev, newCartItem]);
    setSearchItem('');
    setSelectedSku('');
    setQty('');
    setKeterangan('');
    showToast(`${item.name} dimasukkan ke daftar`, 'success');
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

  return (
    <section className="view-enter">
      <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Repeat size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-white">Catat Transaksi</h2>
            <button 
              onClick={() => onSwitchView('riwayat')} 
              className="text-[10px] font-bold bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all border border-white/10 active:scale-95"
            >
              Lihat Riwayat
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-6">Tambahkan beberapa barang sekaligus ke daftar sebelum disimpan.</p>

          <form onSubmit={handleAddToCart} className="space-y-4">
            {/* Radio Type Switcher */}
            <div className="bg-black/30 p-1.5 rounded-2xl flex gap-1 border border-white/5">
              <label className="flex-1 cursor-pointer relative">
                <input 
                  type="radio" 
                  name="tipe" 
                  value="Masuk" 
                  checked={txType === 'Masuk'}
                  onChange={() => setTxType('Masuk')}
                  className="peer sr-only"
                />
                <div className="relative z-10 py-3 text-center text-[11px] sm:text-xs font-semibold text-slate-400 peer-checked:text-white transition-colors flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                  <ArrowUpRight size={16} className={txType === 'Masuk' ? 'text-emerald-400' : 'text-slate-500'} />
                  B. Masuk
                </div>
                <div className={`absolute inset-0 bg-white/10 rounded-xl transition-all ${txType === 'Masuk' ? 'opacity-100 shadow-sm' : 'opacity-0'}`} />
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
                <div className="relative z-10 py-3 text-center text-[11px] sm:text-xs font-semibold text-slate-400 peer-checked:text-white transition-colors flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                  <ArrowDownRight size={16} className={txType === 'Keluar' ? 'text-rose-400' : 'text-slate-500'} />
                  B. Keluar
                </div>
                <div className={`absolute inset-0 bg-white/10 rounded-xl transition-all ${txType === 'Keluar' ? 'opacity-100 shadow-sm' : 'opacity-0'}`} />
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
                <div className="relative z-10 py-3 text-center text-[11px] sm:text-xs font-semibold text-slate-400 peer-checked:text-white transition-colors flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                  <AlertTriangle size={16} className={txType === 'Rusak' ? 'text-amber-400' : 'text-slate-500'} />
                  B. Rusak
                </div>
                <div className={`absolute inset-0 bg-white/10 rounded-xl transition-all ${txType === 'Rusak' ? 'opacity-100 shadow-sm' : 'opacity-0'}`} />
              </label>
            </div>

            {/* Item Search & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-1">
                  Pencarian Barang
                </label>
                <button 
                  type="button" 
                  onClick={() => onSwitchView('tambah')} 
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                >
                  + Item Baru
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
                  className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-3.5 outline-none transition-all placeholder-slate-500" 
                  placeholder="Ketik SKU atau Nama..." 
                  required
                />
              </div>

              {dropdownOpen && (
                <ul className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar">
                  {filteredDropdownItems.length === 0 ? (
                    <li className="p-4 text-sm text-slate-500 text-center">Barang tidak ditemukan</li>
                  ) : (
                    filteredDropdownItems.map(item => (
                      <li 
                        key={item.sku}
                        onClick={() => {
                          setSearchItem(item.name);
                          setSelectedSku(item.sku);
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-white/10 cursor-pointer flex justify-between items-center transition-colors border-b border-white/5 last:border-0"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.sku}</div>
                        </div>
                        <div className={`text-xs font-bold ${item.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Stok: {item.stock}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Qty & Note */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Qty
                </label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={qty}
                  onChange={e => setQty(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-3.5 outline-none transition-all placeholder-slate-600" 
                  placeholder="1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Keterangan <span className="text-slate-500 normal-case font-normal">(Opsional)</span>
                </label>
                <input 
                  type="text" 
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block p-3.5 outline-none transition-all placeholder-slate-600" 
                  placeholder="Cth: Restock / Retur..."
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full mt-1 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all active:scale-[0.98] flex justify-center items-center gap-2 border ${
                txType === 'Masuk'
                  ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10'
                  : txType === 'Rusak'
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 focus:ring-4 focus:ring-amber-500/10'
                  : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 focus:ring-4 focus:ring-rose-500/10'
              }`}
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah Data {txType}
            </button>
          </form>

          {/* Cart Section */}
          {cart.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">Daftar Transaksi ({cart.length})</h3>
                <button 
                  type="button" 
                  onClick={handleClearCart} 
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold uppercase tracking-wider"
                >
                  Kosongkan
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 mb-4">
                {cart.map((item, index) => {
                  let textClass = 'text-emerald-400';
                  let sign = '+';
                  if (item.type === 'Keluar') { textClass = 'text-rose-400'; sign = '-'; }
                  if (item.type === 'Rusak') { textClass = 'text-amber-400'; sign = '-'; }

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl">
                      <div className="flex-1 overflow-hidden pr-2">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                          <span className={`${textClass} font-semibold`}>{item.type} ({sign}{item.qty})</span>
                          {item.note !== '-' && (
                            <span className="truncate italic text-slate-500">"{item.note}"</span>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFromCart(item.id)} 
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button 
                type="button" 
                onClick={handleSubmitCart} 
                className="w-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:ring-4 focus:ring-blue-500/30 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2"
              >
                <CheckCircle size={18} strokeWidth={2.5} />
                Simpan Semua ke Database (Firebase)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
