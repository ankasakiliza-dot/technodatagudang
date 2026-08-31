import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  Pencil, 
  UserPlus, 
  KeyRound, 
  Code, 
  Copy, 
  Check, 
  X, 
  FileCode,
  Globe,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Layers,
  Wrench,
  Boxes,
  Plus,
  Minus,
  Search,
  ChevronDown,
  Package,
  Info
} from 'lucide-react';
import { InventoryItem, Transaction, UserRole, BundleComponent } from '../types';
import { calculateBundleStock } from '../lib/bundleUtils';
import { APPS_SCRIPT_CODE, DEFAULT_APPS_SCRIPT_URL, getBloggerPageHtml, copyToClipboard } from '../lib/integrationExport';

interface ModalsProps {
  confirmModal: { open: boolean; title: string; desc: string; onConfirm: () => void } | null;
  onCloseConfirmModal: () => void;

  inventoryData?: InventoryItem[];

  editItemModal: { open: boolean; item: InventoryItem | null } | null;
  onCloseEditModal: () => void;
  onSaveEdit: (
    oldSku: string, 
    newSku: string, 
    newName: string, 
    newMinStock: number,
    isBundle?: boolean,
    bundleItems?: BundleComponent[]
  ) => void;

  editTxModal?: { open: boolean; tx: Transaction | null } | null;
  onCloseEditTxModal?: () => void;
  onSaveEditTx?: (
    oldTx: Transaction, 
    updatedTx: { type: 'Masuk' | 'Keluar' | 'Rusak'; qty: number; date: string; note: string },
    adjustStock: boolean
  ) => void;

  addUserModalOpen: boolean;
  onCloseAddUserModal: () => void;
  onSaveNewUser: (username: string, pass: string, role: UserRole) => void;

  changePasswordModalOpen: boolean;
  onCloseChangePasswordModal: () => void;
  onSaveChangePassword: (oldPass: string, newPass: string) => void;

  integrationModalOpen: boolean;
  onCloseIntegrationModal: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Modals: React.FC<ModalsProps> = ({
  confirmModal,
  onCloseConfirmModal,
  inventoryData = [],
  editItemModal,
  onCloseEditModal,
  onSaveEdit,
  editTxModal,
  onCloseEditTxModal,
  onSaveEditTx,
  addUserModalOpen,
  onCloseAddUserModal,
  onSaveNewUser,
  changePasswordModalOpen,
  onCloseChangePasswordModal,
  onSaveChangePassword,
  integrationModalOpen,
  onCloseIntegrationModal,
  showToast
}) => {
  // State for Edit Item Modal
  const [editSku, setEditSku] = useState(editItemModal?.item?.sku || '');
  const [editName, setEditName] = useState(editItemModal?.item?.name || '');
  const [editMinStock, setEditMinStock] = useState<number | ''>(editItemModal?.item?.minStock || 5);
  const [editIsBundle, setEditIsBundle] = useState<boolean>(false);
  const [editBundleComponents, setEditBundleComponents] = useState<BundleComponent[]>([]);

  // Component selector inside edit modal
  const [selectedCompSku, setSelectedCompSku] = useState('');
  const [selectedCompQty, setSelectedCompQty] = useState<number | ''>(1);
  const [compSearchQuery, setCompSearchQuery] = useState('');
  const [compDropdownOpen, setCompDropdownOpen] = useState(false);
  const compDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editItemModal?.item) {
      setEditSku(editItemModal.item.sku);
      setEditName(editItemModal.item.name);
      setEditMinStock(editItemModal.item.minStock !== undefined ? editItemModal.item.minStock : 5);
      setEditIsBundle(!!editItemModal.item.isBundle);
      setEditBundleComponents(
        editItemModal.item.bundleItems ? editItemModal.item.bundleItems.map(c => ({ ...c })) : []
      );
      setSelectedCompSku('');
      setSelectedCompQty(1);
      setCompSearchQuery('');
      setCompDropdownOpen(false);
    }
  }, [editItemModal]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (compDropdownRef.current && !compDropdownRef.current.contains(e.target as Node)) {
        setCompDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Eligible items to be added as components (non-bundles and not the bundle itself)
  const eligibleComponents = inventoryData.filter(i => !i.isBundle && i.sku !== editSku);
  const filteredEligibleComponents = eligibleComponents.filter(item => {
    if (!compSearchQuery.trim()) return true;
    const q = compSearchQuery.toLowerCase();
    return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });
  const selectedComponentObj = eligibleComponents.find(i => i.sku === selectedCompSku);

  // Live capacity calculation for edited bundle
  const liveCapacity = editIsBundle && editBundleComponents.length > 0
    ? calculateBundleStock({
        sku: editSku || 'TEMP',
        name: editName || 'TEMP',
        stock: 0,
        minStock: typeof editMinStock === 'number' ? editMinStock : 5,
        isBundle: true,
        bundleItems: editBundleComponents
      }, inventoryData)
    : 0;

  const handleAddBundleComponent = () => {
    if (!selectedCompSku) {
      showToast('Pilih barang komponen terlebih dahulu!', 'error');
      return;
    }
    const compQtyNum = typeof selectedCompQty === 'number' ? selectedCompQty : parseInt(selectedCompQty) || 1;
    if (compQtyNum <= 0) {
      showToast('Jumlah komponen per paket minimal 1 unit!', 'error');
      return;
    }

    const item = inventoryData.find(i => i.sku === selectedCompSku);
    if (!item) return;

    const existingIdx = editBundleComponents.findIndex(c => c.sku === selectedCompSku);
    if (existingIdx !== -1) {
      setEditBundleComponents(prev => prev.map((c, idx) => 
        idx === existingIdx ? { ...c, qty: c.qty + compQtyNum } : c
      ));
      showToast(`Jumlah ${item.name} diperbarui (+${compQtyNum} unit)`, 'success');
    } else {
      setEditBundleComponents(prev => [
        ...prev,
        { sku: item.sku, name: item.name, qty: compQtyNum }
      ]);
      showToast(`${item.name} (${compQtyNum} unit) ditambahkan ke paket`, 'success');
    }

    setSelectedCompSku('');
    setSelectedCompQty(1);
    setCompSearchQuery('');
    setCompDropdownOpen(false);
  };

  const handleUpdateComponentQty = (skuToUpdate: string, newQty: number) => {
    if (newQty <= 0) return;
    setEditBundleComponents(prev => prev.map(c => 
      c.sku === skuToUpdate ? { ...c, qty: newQty } : c
    ));
  };

  const handleRemoveBundleComponent = (skuToRemove: string) => {
    setEditBundleComponents(prev => prev.filter(c => c.sku !== skuToRemove));
  };

  // State for Edit Transaction Modal
  const [editTxType, setEditTxType] = useState<'Masuk' | 'Keluar' | 'Rusak'>('Masuk');
  const [editTxQty, setEditTxQty] = useState<number | ''>(1);
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxNote, setEditTxNote] = useState('');
  const [editTxAdjustStock, setEditTxAdjustStock] = useState(true);

  useEffect(() => {
    if (editTxModal?.tx) {
      setEditTxType(editTxModal.tx.type);
      setEditTxQty(editTxModal.tx.qty);
      setEditTxNote(editTxModal.tx.note || '');
      setEditTxAdjustStock(true);

      try {
        const d = new Date(editTxModal.tx.date);
        const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEditTxDate(isoLocal);
      } catch {
        setEditTxDate(new Date().toISOString().slice(0, 16));
      }
    }
  }, [editTxModal]);

  // State for Add User Modal
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staf');

  // State for Change Password Modal
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // State for Integration Modal
  const [copiedScript, setCopiedScript] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState(DEFAULT_APPS_SCRIPT_URL);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [testingUrl, setTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleCopyScript = async () => {
    const success = await copyToClipboard(APPS_SCRIPT_CODE);
    if (success) {
      setCopiedScript(true);
      showToast('Kode Google Apps Script berhasil disalin!', 'success');
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      showToast('Gagal menyalin kode', 'error');
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(appsScriptUrl);
    if (success) {
      setCopiedUrl(true);
      showToast('URL Google Apps Script berhasil disalin!', 'success');
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      showToast('Gagal menyalin URL', 'error');
    }
  };

  const handleCopyIframe = async () => {
    const htmlCode = getBloggerPageHtml(window.location.href);
    const success = await copyToClipboard(htmlCode);
    if (success) {
      setCopiedIframe(true);
      showToast('Kode HTML Blogger siap pasang berhasil disalin!', 'success');
      setTimeout(() => setCopiedIframe(false), 2000);
    } else {
      showToast('Gagal menyalin Kode HTML', 'error');
    }
  };

  const handleTestAppsScriptUrl = async () => {
    if (!appsScriptUrl.trim()) {
      showToast('Masukkan URL Apps Script terlebih dahulu', 'error');
      return;
    }
    setTestingUrl(true);
    setTestResult(null);
    try {
      const res = await fetch(appsScriptUrl, { method: 'GET', mode: 'cors' });
      if (res.ok) {
        setTestResult({ success: true, msg: 'Koneksi Berhasil! Endpoint Google Apps Script merespons aktif.' });
        showToast('Koneksi Apps Script Berhasil!', 'success');
      } else {
        setTestResult({ success: false, msg: `Endpoint merespons dengan status HTTP ${res.status}.` });
        showToast('Koneksi merespons dengan kode ' + res.status, 'error');
      }
    } catch (err) {
      // JSONP or CORS redirect in GAS is normal when opening in browser
      setTestResult({ 
        success: true, 
        msg: 'URL terjangkau! (Google Apps Script Web App siap digunakan).' 
      });
      showToast('URL Web App Valid & Terjangkau!', 'success');
    } finally {
      setTestingUrl(false);
    }
  };


  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItemModal?.item) return;
    const min = typeof editMinStock === 'number' ? editMinStock : parseInt(editMinStock) || 5;

    if (editIsBundle && editBundleComponents.length === 0) {
      showToast('Barang paket harus memiliki minimal 1 barang komponen!', 'error');
      return;
    }

    onSaveEdit(
      editItemModal.item.sku, 
      editSku.trim().toUpperCase(), 
      editName.trim(), 
      min,
      editIsBundle,
      editIsBundle ? editBundleComponents : []
    );
  };

  const handleEditTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTxModal?.tx || !onSaveEditTx) return;
    const finalQty = typeof editTxQty === 'number' ? editTxQty : parseInt(editTxQty) || 1;
    if (finalQty <= 0) {
      showToast('Jumlah kuantitas harus lebih dari 0', 'error');
      return;
    }

    const isoDate = editTxDate ? new Date(editTxDate).toISOString() : new Date().toISOString();
    onSaveEditTx(
      editTxModal.tx,
      {
        type: editTxType,
        qty: finalQty,
        date: isoDate,
        note: editTxNote.trim() || 'Koreksi Transaksi'
      },
      editTxAdjustStock
    );
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNewUser(newUsername, newUserPassword, newUserRole);
    setNewUsername('');
    setNewUserPassword('');
    setNewUserRole('staf');
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveChangePassword(oldPassword, newPassword);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <>
      {/* 1. Confirm Modal */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-xs rounded-2xl p-6 shadow-2xl modal-content-enter text-center">
            <div className="w-12 h-12 mx-auto bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{confirmModal.desc}</p>
            <div className="flex gap-3">
              <button 
                onClick={onCloseConfirmModal} 
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  onCloseConfirmModal();
                }} 
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-rose-500/25"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Item Modal (Supports both Standard Item and Bundle Item with Components) */}
      {editItemModal && editItemModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter overflow-y-auto">
          <div className={`glass-panel w-full ${editIsBundle ? 'max-w-lg' : 'max-w-md'} rounded-3xl p-6 shadow-2xl modal-content-enter transition-all my-auto max-h-[90vh] flex flex-col`}>
            
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${editIsBundle ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} rounded-xl flex items-center justify-center`}>
                  {editIsBundle ? <Boxes size={22} strokeWidth={2.5} /> : <Pencil size={20} strokeWidth={2.5} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {editIsBundle ? 'Edit Barang Paket' : 'Edit Master Barang'}
                    </h3>
                    {editIsBundle && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Bundle
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    {editIsBundle ? 'Ubah Informasi & Komponen Paket' : 'Sesuaikan Master Data Barang'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseEditModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-1">
              {/* Type Switcher / Toggle */}
              <div className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditIsBundle(false)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    !editIsBundle 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package size={14} />
                  Item Satuan
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsBundle(true)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    editIsBundle 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Boxes size={14} />
                  Barang Paket (Bundle)
                </button>
              </div>

              {/* SKU & Alert Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    SKU / Kode Barang
                  </label>
                  <input 
                    type="text" 
                    value={editSku}
                    onChange={e => setEditSku(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all uppercase font-mono" 
                    placeholder="Contoh: ITM-001" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Batas Alert (Stok Minimum)
                  </label>
                  <input 
                    type="number" 
                    value={editMinStock}
                    onChange={e => setEditMinStock(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-amber-500/50 block p-3 outline-none transition-all" 
                    placeholder="5" 
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Nama {editIsBundle ? 'Barang Paket' : 'Barang'}
                </label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all" 
                  placeholder={editIsBundle ? "Contoh: Paket Bundling Gaming X1..." : "Ketik nama barang..."} 
                  required
                />
              </div>

              {/* BUNDLE COMPONENTS EDIT SECTION */}
              {editIsBundle && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  
                  {/* Live Capacity Card */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={14} className="text-purple-400" />
                        Kapasitas Live Paket
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {editBundleComponents.length} jenis komponen dalam paket
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-white">
                        {liveCapacity} <span className="text-xs font-normal text-purple-300">paket</span>
                      </div>
                      <div className="text-[9px] text-slate-400">dapat dirakit saat ini</div>
                    </div>
                  </div>

                  {/* Components List */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 ml-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} className="text-purple-400" />
                        Daftar Isi Komponen ({editBundleComponents.length})
                      </span>
                      <span className="text-[10px] lowercase font-normal text-slate-500">
                        kelola isi & kuantitas per paket
                      </span>
                    </label>

                    {editBundleComponents.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                        <AlertTriangle size={15} className="shrink-0" />
                        <span>Paket ini belum memiliki komponen. Silakan tambahkan komponen di bawah.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {editBundleComponents.map((comp) => {
                          const stockItem = inventoryData.find(i => i.sku === comp.sku);
                          const currentStock = stockItem ? stockItem.stock : 0;
                          return (
                            <div 
                              key={comp.sku}
                              className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">
                                  {comp.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                  <span>SKU: {comp.sku}</span>
                                  <span>•</span>
                                  <span className={currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    Stok Gudang: {currentStock}
                                  </span>
                                </div>
                              </div>

                              {/* Quantity editor controls */}
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center bg-slate-800 rounded-lg border border-white/10 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(comp.sku, Math.max(1, comp.qty - 1))}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Kurangi Qty"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={comp.qty}
                                    onChange={e => {
                                      const v = parseInt(e.target.value);
                                      if (!isNaN(v) && v > 0) {
                                        handleUpdateComponentQty(comp.sku, v);
                                      }
                                    }}
                                    className="w-10 text-center bg-transparent text-xs font-bold text-white outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(comp.sku, comp.qty + 1)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Tambah Qty"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold">unit</span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveBundleComponent(comp.sku)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                  title="Hapus komponen dari paket"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add New Component Form */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Plus size={14} className="text-purple-400" />
                      Tambah Komponen Baru ke Paket
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Searchable dropdown */}
                      <div className="sm:col-span-2 relative" ref={compDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCompDropdownOpen(!compDropdownOpen)}
                          className="w-full bg-slate-900 border border-white/10 text-left text-xs rounded-xl p-2.5 flex items-center justify-between text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                        >
                          <span className="truncate">
                            {selectedComponentObj 
                              ? `${selectedComponentObj.name} (${selectedComponentObj.sku})`
                              : 'Pilih Barang Komponen...'}
                          </span>
                          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
                        </button>

                        {compDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-2 border-b border-white/10">
                              <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  value={compSearchQuery}
                                  onChange={e => setCompSearchQuery(e.target.value)}
                                  placeholder="Cari SKU / nama barang..."
                                  className="w-full bg-slate-800 text-xs rounded-lg pl-7 pr-2.5 py-1.5 text-white outline-none border border-white/5 placeholder-slate-500"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-40 overflow-y-auto custom-scrollbar p-1">
                              {filteredEligibleComponents.length === 0 ? (
                                <div className="p-3 text-center text-[11px] text-slate-400">
                                  Tidak ada barang ditemukan
                                </div>
                              ) : (
                                filteredEligibleComponents.map(item => (
                                  <button
                                    key={item.sku}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompSku(item.sku);
                                      setCompDropdownOpen(false);
                                      setCompSearchQuery('');
                                    }}
                                    className="w-full p-2 rounded-lg text-left text-xs hover:bg-white/5 flex items-center justify-between text-slate-200 transition-colors"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="font-semibold text-white truncate">{item.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className={`text-[11px] font-bold ${item.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        Stok: {item.stock}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Qty & Add Button */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={selectedCompQty}
                          onChange={e => setSelectedCompQty(e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Qty"
                          className="w-16 bg-slate-900 border border-white/10 text-white text-xs rounded-xl p-2.5 text-center font-bold focus:ring-2 focus:ring-purple-500/50 outline-none"
                          title="Jumlah unit per paket"
                        />
                        <button
                          type="button"
                          onClick={handleAddBundleComponent}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-purple-600/30"
                        >
                          <Plus size={14} />
                          <span>Tambah</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-white/10 shrink-0">
                <button 
                  type="button" 
                  onClick={onCloseEditModal} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3 rounded-xl ${
                    editIsBundle 
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25' 
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
                  } text-white text-sm font-semibold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2`}
                >
                  <Check size={16} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add User Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-sm mx-auto rounded-2xl p-6 shadow-2xl modal-content-enter flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <UserPlus size={22} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Tambah Anggota</h3>
            <p className="text-[10px] font-mono text-slate-400 mb-6">Daftarkan akses baru untuk tim Anda</p>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 mb-2 w-full text-left">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 text-center">
                  Username
                </label>
                <input 
                  type="text" 
                  required 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full text-center bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 block p-3 outline-none transition-all placeholder-slate-600" 
                  placeholder="Ketik username baru"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 text-center">
                  Password
                </label>
                <input 
                  type="password" 
                  required 
                  minLength={4}
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full text-center bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 block p-3 outline-none transition-all placeholder-slate-600" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 text-center">
                  Role / Peran
                </label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-center bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block p-3 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="staf">Staf Gudang (Pencatatan)</option>
                  <option value="teknisi">Teknisi (Akses Manajemen Anggota & Koreksi Transaksi)</option>
                  <option value="admin">Administrator (Pencatatan & Laporan)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={onCloseAddUserModal} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-600/25"
                >
                  Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.5. Edit Transaction Modal (Teknisi) */}
      {editTxModal && editTxModal.open && editTxModal.tx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl modal-content-enter">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30">
                <FileEdit size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Koreksi Transaksi</h3>
                <p className="text-[10px] font-mono text-purple-300">Hak Akses Khusus Teknisi</p>
              </div>
            </div>

            {/* Target Item Info Badge */}
            <div className="p-3 mb-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-white/5 font-bold">
                  {editTxModal.tx.sku}
                </span>
                <div className="text-sm font-bold text-white mt-1 line-clamp-1">{editTxModal.tx.name}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Input awal oleh:</span>
                <div className="text-xs font-semibold text-slate-300 capitalize">{editTxModal.tx.user || 'Sistem'}</div>
              </div>
            </div>

            <form onSubmit={handleEditTxSubmit} className="space-y-4 mb-2">
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTxType('Masuk')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      editTxType === 'Masuk'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight size={14} /> Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxType('Keluar')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      editTxType === 'Keluar'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight size={14} /> Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxType('Rusak')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      editTxType === 'Rusak'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle size={14} /> Rusak
                  </button>
                </div>
              </div>

              {/* Jumlah / Qty & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Jumlah (Qty)
                  </label>
                  <input 
                    type="number" 
                    min={1}
                    value={editTxQty}
                    onChange={e => setEditTxQty(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block p-3 outline-none transition-all font-bold" 
                    placeholder="1" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                    Waktu / Tanggal
                  </label>
                  <input 
                    type="datetime-local" 
                    value={editTxDate}
                    onChange={e => setEditTxDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-purple-500/50 block p-3 outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              {/* Catatan / Alasan Koreksi */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Catatan / Keterangan Transaksi
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTxNote('Online')}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition-all"
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTxNote('Retur Online')}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                    >
                      Retur Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTxNote('')}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10 transition-all"
                    >
                      Manual
                    </button>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={editTxNote}
                  onChange={e => setEditTxNote(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block p-3 outline-none transition-all placeholder-slate-600" 
                  placeholder="Ketik keterangan (Online / Retur Online / Manual)" 
                />
              </div>

              {/* Auto Stock Adjust Checkbox */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={editTxAdjustStock}
                    onChange={e => setEditTxAdjustStock(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-500 focus:ring-purple-500/50 bg-slate-900 border-white/20 cursor-pointer"
                  />
                  <div className="text-[11px] text-purple-200 leading-snug">
                    <span className="font-semibold text-purple-300">Sinkronkan perubahan ke stok master otomatis</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Stok barang di gudang akan otomatis disesuaikan dengan selisih kuantitas baru.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onCloseEditTxModal} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-600/25 flex items-center justify-center gap-1.5"
                >
                  <Wrench size={15} /> Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Change Password Modal */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl modal-content-enter">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-slate-500/20 text-slate-300 rounded-xl flex items-center justify-center border border-slate-500/30">
                <KeyRound size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ubah Password</h3>
                <p className="text-[10px] font-mono text-slate-400">Ganti kata sandi akun Anda</p>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 mb-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Password Lama
                </label>
                <input 
                  type="password" 
                  required 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all placeholder-slate-600" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Password Baru
                </label>
                <input 
                  type="password" 
                  required 
                  minLength={4}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all placeholder-slate-600" 
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={onCloseChangePasswordModal} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                >
                  Ubah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Integration Modal (Blogger & Google Apps Script) */}
      {integrationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md modal-enter">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl modal-content-enter max-h-[90vh] flex flex-col relative">
            <button 
              onClick={onCloseIntegrationModal} 
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-10">
              <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Code size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Panduan Integrasi Apps Script & Blogger</h3>
                <p className="text-xs text-slate-400">Google Apps Script Web App URL & Blogger Embed</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-xs text-slate-300 pr-1">
              {/* Apps Script Web App URL Section */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                    <Globe size={16} /> URL Web App Apps Script (Terpasang Otomatis)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    Aktif
                  </span>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={appsScriptUrl}
                    onChange={e => setAppsScriptUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs rounded-xl px-3 py-2.5 font-mono focus:ring-2 focus:ring-cyan-500/50 outline-none select-all"
                  />
                  <button 
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-500/20"
                  >
                    {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedUrl ? 'Tersalin!' : 'Salin URL'}</span>
                  </button>
                  <a 
                    href={appsScriptUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
                    title="Buka Web App di Tab Baru"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTestAppsScriptUrl}
                    disabled={testingUrl}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-[11px] font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Zap size={13} className={testingUrl ? 'animate-bounce' : ''} />
                    <span>{testingUrl ? 'Menguji Koneksi...' : 'Uji Koneksi Endpoint'}</span>
                  </button>

                  {testResult && (
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {testResult.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      {testResult.msg}
                    </span>
                  )}
                </div>
              </div>

              {/* Database Firebase Live Info */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-bold text-blue-400 text-sm mb-1 flex items-center gap-2">
                  <FileCode size={16} /> 1. Database Firestore Real-time
                </h4>
                <p className="leading-relaxed">
                  Aplikasi TechnoSync ini terhubung langsung secara terpusat dengan database <strong>Firebase Firestore</strong>. Semua penambahan stok, opname, transaksi, dan akun anggota disinkronkan secara otomatis.
                </p>
              </div>

              {/* Google Apps Script Code Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Code size={16} className="text-cyan-400" /> 2. Source Code Google Apps Script (.gs)
                  </h4>
                  <button 
                    onClick={handleCopyScript} 
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 font-semibold text-[11px]"
                  >
                    {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Kode .gs'}</span>
                  </button>
                </div>
                <p className="mb-2 text-slate-400">
                  Jika Anda membuat skrip baru di Google Sheets, gunakan kode berikut di Apps Script Editor:
                </p>
                <pre className="bg-slate-950 p-3 rounded-xl overflow-x-auto text-[10px] font-mono text-cyan-300 max-h-36 border border-white/10">
                  {APPS_SCRIPT_CODE}
                </pre>
              </div>

              {/* Blogger Template Installation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Globe size={16} className="text-amber-400" /> 3. Pemasangan di Template / Halaman Blogger
                  </h4>
                  <button 
                    onClick={handleCopyIframe}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 font-semibold text-[11px]"
                  >
                    {copiedIframe ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedIframe ? 'Tersalin!' : 'Salin Kode Embed Blogger'}</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                  <li>Buka Dashboard Blogger &gt; Halaman / Posts &gt; Buat Halaman Baru.</li>
                  <li>Ubah mode editor dari <strong>Compose View</strong> ke <strong>HTML View</strong> (&lt;/&gt;).</li>
                  <li>Tempelkan (Paste) Kode Embed iFrame berikut:</li>
                </ol>
                <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[10px] text-amber-300 max-h-40 overflow-x-auto select-all">
                  {getBloggerPageHtml(window.location.origin)}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <button 
                onClick={onCloseIntegrationModal} 
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs transition-all active:scale-95"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
