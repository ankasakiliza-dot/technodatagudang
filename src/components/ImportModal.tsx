import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  RotateCcw,
  Layers,
  FileCheck,
  Info
} from 'lucide-react';
import { InventoryItem, Transaction, AppUser } from '../types';
import { 
  downloadInventoryExcelTemplate, 
  downloadTransactionsExcelTemplate,
  parseInventoryFile,
  parseTransactionFile
} from '../lib/exportUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'inventory' | 'transactions';
  existingInventory: InventoryItem[];
  currentUser: AppUser | null;
  onImportInventory: (items: InventoryItem[], updateExisting: boolean) => Promise<{ created: number; updated: number }>;
  onImportTransactions: (transactions: Transaction[], syncStock: boolean) => Promise<{ savedCount: number }>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'inventory',
  existingInventory,
  currentUser,
  onImportInventory,
  onImportTransactions,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions'>(initialTab);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Parsed results
  const [parsedInventory, setParsedInventory] = useState<InventoryItem[]>([]);
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Options
  const [updateExistingStock, setUpdateExistingStock] = useState(true);
  const [syncStockFromTransactions, setSyncStockFromTransactions] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParsedInventory([]);
    setParsedTransactions([]);
    setParseErrors([]);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTabChange = (tab: 'inventory' | 'transactions') => {
    setActiveTab(tab);
    handleReset();
  };

  const handleFileChange = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      showToast('Harap pilih file format Excel (.xlsx, .xls) atau .csv', 'error');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setParseErrors([]);

    try {
      if (activeTab === 'inventory') {
        const { validItems, errors } = await parseInventoryFile(file);
        setParsedInventory(validItems);
        setParseErrors(errors);
        if (validItems.length > 0) {
          showToast(`Berhasil membaca ${validItems.length} data barang`, 'success');
        } else {
          showToast('Tidak ada data barang yang valid ditemukan dalam file', 'error');
        }
      } else {
        const { validTransactions, errors } = await parseTransactionFile(file, currentUser?.username || 'admin');
        setParsedTransactions(validTransactions);
        setParseErrors(errors);
        if (validTransactions.length > 0) {
          showToast(`Berhasil membaca ${validTransactions.length} baris transaksi`, 'success');
        } else {
          showToast('Tidak ada data transaksi yang valid ditemukan dalam file', 'error');
        }
      }
    } catch (err: any) {
      showToast('Gagal memproses file: ' + (err?.message || 'Error parsing'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteUpload = async () => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (activeTab === 'inventory') {
        if (parsedInventory.length === 0) {
          showToast('Tidak ada data barang untuk diupload', 'error');
          setIsUploading(false);
          return;
        }

        const { created, updated } = await onImportInventory(parsedInventory, updateExistingStock);
        setUploadProgress(100);
        showToast(`Selesai! ${created} item baru dibuat, ${updated} item diperbarui di Firebase`, 'success');
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1200);
      } else {
        if (parsedTransactions.length === 0) {
          showToast('Tidak ada data transaksi untuk diupload', 'error');
          setIsUploading(false);
          return;
        }

        const { savedCount } = await onImportTransactions(parsedTransactions, syncStockFromTransactions);
        setUploadProgress(100);
        showToast(`Selesai! ${savedCount} transaksi berhasil disimpan ke Firebase`, 'success');
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyimpan ke database: ' + (err?.message || 'Error Firestore'), 'error');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload Database Cepat (Excel / CSV)</h2>
              <p className="text-xs text-slate-400">Import ratusan data barang atau riwayat transaksi sekaligus ke Firestore</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="pt-4 pb-2 shrink-0">
          <div className="bg-black/30 p-1 rounded-2xl flex gap-1 border border-white/5">
            <button
              onClick={() => handleTabChange('inventory')}
              disabled={isUploading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package size={16} />
              1. Upload Master Barang (Stok)
            </button>
            <button
              onClick={() => handleTabChange('transactions')}
              disabled={isUploading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={16} />
              2. Upload Riwayat Transaksi
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 py-3 space-y-4">
          {/* Template Download Banner */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <FileSpreadsheet size={18} className="text-cyan-400 shrink-0" />
              <span>
                Belum punya format tabel? Unduh contoh template resmi untuk <strong>{activeTab === 'inventory' ? 'Data Barang' : 'Data Transaksi'}</strong>:
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => activeTab === 'inventory' ? downloadInventoryExcelTemplate('xlsx') : downloadTransactionsExcelTemplate('xlsx')}
                className="flex-1 sm:flex-initial text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                Template .XLSX
              </button>
              <button
                type="button"
                onClick={() => activeTab === 'inventory' ? downloadInventoryExcelTemplate('csv') : downloadTransactionsExcelTemplate('csv')}
                className="flex-1 sm:flex-initial text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                Template .CSV
              </button>
            </div>
          </div>

          {/* File Upload Drop Zone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
                  : 'border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Klik untuk pilih file atau seret file ke sini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{selectedFile.name}</div>
                    <div className="text-[11px] text-cyan-300/80 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {activeTab === 'inventory' ? `${parsedInventory.length} item terbaca` : `${parsedTransactions.length} transaksi terbaca`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Ganti File"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Warnings / Skipped errors if any */}
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Catatan Import ({parseErrors.length} baris):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto text-[11px] text-amber-200/80">
                    {parseErrors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li>...dan {parseErrors.length - 5} baris lainnya dilewati.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Options */}
              {activeTab === 'inventory' ? (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={updateExistingStock}
                      onChange={e => setUpdateExistingStock(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 bg-slate-900 border-white/20 focus:ring-blue-500"
                    />
                    <span>
                      <strong>Perbarui Stok &amp; Nama</strong> jika SKU sudah terdaftar di database (Jika dimatikan, SKU yang sama akan dilewati).
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={syncStockFromTransactions}
                      onChange={e => setSyncStockFromTransactions(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Otomatis Sesuaikan Stok Master Barang</strong> sesuai transaksi (Barang Masuk menambah stok, Keluar/Rusak mengurangi stok).
                    </span>
                  </label>
                </div>
              )}

              {/* Data Preview Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Pratinjau Data yang akan Di-upload ({activeTab === 'inventory' ? parsedInventory.length : parsedTransactions.length} baris)</span>
                  <span className="text-[10px] text-cyan-400">Menampilkan hingga 50 baris pertama</span>
                </div>
                <div className="overflow-x-auto max-h-56 custom-scrollbar text-xs">
                  {activeTab === 'inventory' ? (
                    <table className="w-full text-left text-slate-300">
                      <thead className="bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0">
                        <tr>
                          <th className="px-3.5 py-2 font-semibold">SKU</th>
                          <th className="px-3.5 py-2 font-semibold">Nama Barang</th>
                          <th className="px-3.5 py-2 font-semibold text-right">Stok Awal</th>
                          <th className="px-3.5 py-2 font-semibold text-right">Min Alert</th>
                          <th className="px-3.5 py-2 font-semibold text-center">Status di DB</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {parsedInventory.slice(0, 50).map((item, idx) => {
                          const isExists = existingInventory.some(i => i.sku === item.sku);
                          return (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="px-3.5 py-2 text-cyan-300 font-bold">{item.sku}</td>
                              <td className="px-3.5 py-2 font-sans font-medium text-white">{item.name}</td>
                              <td className="px-3.5 py-2 text-right font-bold text-emerald-400">{item.stock}</td>
                              <td className="px-3.5 py-2 text-right text-slate-400">{item.minStock}</td>
                              <td className="px-3.5 py-2 text-center font-sans">
                                {isExists ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Update SKU
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Item Baru
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left text-slate-300">
                      <thead className="bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Tgl</th>
                          <th className="px-3 py-2 font-semibold">Tipe</th>
                          <th className="px-3 py-2 font-semibold">SKU</th>
                          <th className="px-3 py-2 font-semibold">Nama Barang</th>
                          <th className="px-3 py-2 font-semibold text-right">Qty</th>
                          <th className="px-3 py-2 font-semibold">Petugas</th>
                          <th className="px-3 py-2 font-semibold">Ket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {parsedTransactions.slice(0, 50).map((tx, idx) => {
                          const d = new Date(tx.date);
                          const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('id-ID') : tx.date;
                          return (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                              <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{dateStr}</td>
                              <td className="px-3 py-2 font-sans font-bold">
                                {tx.type === 'Masuk' && <span className="text-emerald-400">Masuk</span>}
                                {tx.type === 'Keluar' && <span className="text-rose-400">Keluar</span>}
                                {tx.type === 'Rusak' && <span className="text-amber-400">Rusak</span>}
                              </td>
                              <td className="px-3 py-2 text-cyan-300">{tx.sku}</td>
                              <td className="px-3 py-2 font-sans text-white max-w-[140px] truncate">{tx.name}</td>
                              <td className="px-3 py-2 text-right font-bold text-white">{tx.qty}</td>
                              <td className="px-3 py-2 text-slate-400">{tx.user}</td>
                              <td className="px-3 py-2 font-sans text-slate-500 max-w-[120px] truncate">{tx.note}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator during upload */}
        {isUploading && (
          <div className="pt-3 pb-1 space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Menyimpan data ke Firebase Firestore...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          {selectedFile && (
            <button
              type="button"
              disabled={isUploading || isProcessing || (activeTab === 'inventory' ? parsedInventory.length === 0 : parsedTransactions.length === 0)}
              onClick={handleExecuteUpload}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploading 
                ? 'Sedang Mengunggah...' 
                : activeTab === 'inventory'
                  ? `Simpan ${parsedInventory.length} Barang ke Database`
                  : `Simpan ${parsedTransactions.length} Transaksi ke Database`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
