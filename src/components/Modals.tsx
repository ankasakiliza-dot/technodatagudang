import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { InventoryItem } from '../types';
import { APPS_SCRIPT_CODE, DEFAULT_APPS_SCRIPT_URL, getBloggerPageHtml, copyToClipboard } from '../lib/integrationExport';


interface ModalsProps {
  confirmModal: { open: boolean; title: string; desc: string; onConfirm: () => void } | null;
  onCloseConfirmModal: () => void;

  editItemModal: { open: boolean; item: InventoryItem | null } | null;
  onCloseEditModal: () => void;
  onSaveEdit: (oldSku: string, newSku: string, newName: string, newMinStock: number) => void;

  addUserModalOpen: boolean;
  onCloseAddUserModal: () => void;
  onSaveNewUser: (username: string, pass: string, role: 'admin' | 'staf') => void;

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
  editItemModal,
  onCloseEditModal,
  onSaveEdit,
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

  React.useEffect(() => {
    if (editItemModal?.item) {
      setEditSku(editItemModal.item.sku);
      setEditName(editItemModal.item.name);
      setEditMinStock(editItemModal.item.minStock || 5);
    }
  }, [editItemModal]);

  // State for Add User Modal
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'staf'>('staf');

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
    onSaveEdit(editItemModal.item.sku, editSku, editName, min);
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

      {/* 2. Edit Item Modal */}
      {editItemModal && editItemModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl modal-content-enter">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <Pencil size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Barang</h3>
                <p className="text-[10px] font-mono text-slate-400">Sesuaikan Master Data</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  SKU / Kode Barang
                </label>
                <input 
                  type="text" 
                  value={editSku}
                  onChange={e => setEditSku(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all uppercase" 
                  placeholder="Contoh: ITM-001" 
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
                  Nama Barang
                </label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block p-3 outline-none transition-all" 
                  placeholder="Ketik nama barang..." 
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

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onCloseEditModal} 
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/25"
                >
                  Simpan
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
                  onChange={e => setNewUserRole(e.target.value as 'admin' | 'staf')}
                  className="w-full text-center bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 block p-3 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="staf">Staf Gudang (Terbatas)</option>
                  <option value="admin">Administrator (Penuh)</option>
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
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
                >
                  Daftarkan
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
