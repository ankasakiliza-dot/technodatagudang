import React, { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  testConnection 
} from './lib/firebase';
import { InventoryItem, Transaction, AppUser, CartItem, ViewType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { RiwayatView } from './components/RiwayatView';
import { TransaksiView } from './components/TransaksiView';
import { TambahView } from './components/TambahView';
import { OpnameView } from './components/OpnameView';
import { AkunView } from './components/AkunView';
import { Modals } from './components/Modals';
import { ImportModal } from './components/ImportModal';
import { ToastContainer, ToastItem } from './components/ToastContainer';

const INITIAL_DEMO_USERS: AppUser[] = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'staf', password: 'password', role: 'staf' }
];

const INITIAL_DEMO_INVENTORY: InventoryItem[] = [
  { sku: 'ITM-001', name: 'Laptop ASUS ROG Strix', stock: 12, minStock: 5 },
  { sku: 'ITM-002', name: 'Mouse Logitech G502', stock: 4, minStock: 5 },
  { sku: 'ITM-003', name: 'Keyboard Mechanical Keychron', stock: 0, minStock: 3 },
  { sku: 'ITM-004', name: 'Monitor LG UltraGear 27"', stock: 8, minStock: 5 },
  { sku: 'ITM-005', name: 'Headset HyperX Cloud II', stock: 25, minStock: 10 }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('app-theme') || 'default';
  });

  useEffect(() => {
    document.body.className = theme === 'default' ? '' : theme;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usersData, setUsersData] = useState<AppUser[]>([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Terhubung ke Firestore');

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; desc: string; onConfirm: () => void } | null>(null);
  const [editItemModal, setEditItemModal] = useState<{ open: boolean; item: InventoryItem | null } | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  
  // Bulk Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInitialTab, setImportInitialTab] = useState<'inventory' | 'transactions'>('inventory');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Bootstrapping and real-time synchronization
  useEffect(() => {
    let unsubscribeInventory: (() => void) | null = null;
    let unsubscribeTransactions: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    async function initFirebaseData() {
      await testConnection();

      try {
        // 1. Initialize Users
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        if (userSnapshot.empty) {
          // Seed initial demo users
          for (const user of INITIAL_DEMO_USERS) {
            await setDoc(doc(db, 'users', user.username), user);
          }
        }

        // 2. Initialize Inventory
        const inventoryCol = collection(db, 'inventory');
        const invSnapshot = await getDocs(inventoryCol);
        if (invSnapshot.empty) {
          for (const item of INITIAL_DEMO_INVENTORY) {
            await setDoc(doc(db, 'inventory', item.sku), item);
          }
        }

        // 3. Realtime Listeners
        unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          const list: AppUser[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as AppUser));
          setUsersData(list);
        });

        unsubscribeInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
          const list: InventoryItem[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as InventoryItem));
          setInventoryData(list);
          setIsDataLoaded(true);
        });

        const txQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        unsubscribeTransactions = onSnapshot(txQuery, (snapshot) => {
          const list: Transaction[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({ ...data, id: docSnap.id } as Transaction);
          });
          setTransactions(list);
        });

        setConnectionStatus('Firestore Live Connected');
      } catch (err) {
        console.error("Firebase init error:", err);
        setConnectionStatus('Sync Offline Mode');
        setIsDataLoaded(true);
      }
    }

    initFirebaseData();

    return () => {
      if (unsubscribeInventory) unsubscribeInventory();
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const invSnap = await getDocs(collection(db, 'inventory'));
      const invList: InventoryItem[] = [];
      invSnap.forEach(d => invList.push(d.data() as InventoryItem));
      setInventoryData(invList);

      const userSnap = await getDocs(collection(db, 'users'));
      const userList: AppUser[] = [];
      userSnap.forEach(d => userList.push(d.data() as AppUser));
      setUsersData(userList);

      showToast('Data berhasil ditarik & diperbarui dari Firestore', 'success');
    } catch (err) {
      showToast('Gagal menarik data dari server', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Actions
  const handleSaveBulkTransactions = async (cartItems: CartItem[]) => {
    if (!currentUser) return;
    try {
      for (const item of cartItems) {
        const invIndex = inventoryData.findIndex(i => i.sku === item.sku);
        if (invIndex !== -1) {
          const currentItem = inventoryData[invIndex];
          const newStock = item.type === 'Masuk' 
            ? currentItem.stock + item.qty 
            : Math.max(0, currentItem.stock - item.qty);

          // Update inventory item in Firestore
          await setDoc(doc(db, 'inventory', item.sku), {
            ...currentItem,
            stock: newStock
          });

          // Record Transaction in Firestore
          const newTxData = {
            date: item.date || new Date().toISOString(),
            type: item.type,
            sku: item.sku,
            name: item.name,
            qty: item.qty,
            note: item.note,
            user: currentUser.username
          };

          await addDoc(collection(db, 'transactions'), newTxData);
        }
      }

      showToast(`${cartItems.length} transaksi berhasil disimpan ke Firebase!`, 'success');
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi ke Firebase', 'error');
    }
  };

  const handleSaveNewItem = async (newItem: InventoryItem, initialStock: number) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'inventory', newItem.sku), newItem);

      if (initialStock > 0) {
        await addDoc(collection(db, 'transactions'), {
          date: new Date().toISOString(),
          type: 'Masuk',
          sku: newItem.sku,
          name: newItem.name,
          qty: initialStock,
          note: 'Stok awal (Item Baru)',
          user: currentUser.username
        });
      }

      showToast(`Berhasil menambahkan ${newItem.name} (${newItem.sku})`, 'success');
      // Removed: setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan item baru ke Firebase', 'error');
    }
  };

  const handleOpenImportModal = (tab: 'inventory' | 'transactions' = 'inventory') => {
    setImportInitialTab(tab);
    setImportModalOpen(true);
  };

  const handleBulkImportInventory = async (items: InventoryItem[], updateExisting: boolean) => {
    if (!currentUser) throw new Error('Pengguna belum login');
    let created = 0;
    let updated = 0;

    for (const item of items) {
      const existing = inventoryData.find(i => i.sku === item.sku);
      if (existing) {
        if (updateExisting) {
          await setDoc(doc(db, 'inventory', item.sku), {
            ...existing,
            name: item.name || existing.name,
            stock: item.stock !== undefined ? item.stock : existing.stock,
            minStock: item.minStock !== undefined ? item.minStock : existing.minStock
          });
          updated++;
        }
      } else {
        await setDoc(doc(db, 'inventory', item.sku), item);
        created++;
        if (item.stock > 0) {
          await addDoc(collection(db, 'transactions'), {
            date: new Date().toISOString(),
            type: 'Masuk',
            sku: item.sku,
            name: item.name,
            qty: item.stock,
            note: 'Stok Awal (Import Excel)',
            user: currentUser.username
          });
        }
      }
    }

    return { created, updated };
  };

  const handleBulkImportTransactions = async (txList: Transaction[], syncStock: boolean) => {
    if (!currentUser) throw new Error('Pengguna belum login');
    let savedCount = 0;

    const stockDeltas: { [sku: string]: { name: string; delta: number } } = {};

    for (const tx of txList) {
      const txData = {
        date: tx.date || new Date().toISOString(),
        type: tx.type,
        sku: tx.sku,
        name: tx.name,
        qty: tx.qty,
        note: tx.note || 'Import Excel Transaksi',
        user: tx.user || currentUser.username
      };

      await addDoc(collection(db, 'transactions'), txData);
      savedCount++;

      if (syncStock && tx.sku) {
        if (!stockDeltas[tx.sku]) {
          stockDeltas[tx.sku] = { name: tx.name, delta: 0 };
        }
        if (tx.type === 'Masuk') {
          stockDeltas[tx.sku].delta += tx.qty;
        } else {
          stockDeltas[tx.sku].delta -= tx.qty;
        }
      }
    }

    if (syncStock) {
      for (const [sku, info] of Object.entries(stockDeltas)) {
        const invItem = inventoryData.find(i => i.sku === sku);
        if (invItem) {
          const newStock = Math.max(0, invItem.stock + info.delta);
          await setDoc(doc(db, 'inventory', sku), {
            ...invItem,
            stock: newStock
          });
        }
      }
    }

    return { savedCount };
  };

  const handlePromptEdit = (sku: string) => {
    const item = inventoryData.find(i => i.sku === sku);
    if (item) {
      setEditItemModal({ open: true, item });
    }
  };

  const handleSaveEdit = async (oldSku: string, newSku: string, newName: string, newMinStock: number) => {
    try {
      const existingItem = inventoryData.find(i => i.sku === oldSku);
      if (!existingItem) return;

      if (oldSku !== newSku) {
        await deleteDoc(doc(db, 'inventory', oldSku));
      }

      const updatedItem: InventoryItem = {
        ...existingItem,
        sku: newSku,
        name: newName,
        minStock: newMinStock
      };

      await setDoc(doc(db, 'inventory', newSku), updatedItem);

      showToast(`Data ${newSku} berhasil diubah di Firebase`, 'success');
      setEditItemModal(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah data barang', 'error');
    }
  };

  const handlePromptDelete = (sku: string) => {
    setConfirmModal({
      open: true,
      title: 'Hapus Barang?',
      desc: `Tindakan ini akan menghapus data dengan SKU ${sku} dari database.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'inventory', sku));
          showToast(`Barang dengan SKU ${sku} berhasil dihapus`, 'success');
        } catch (err) {
          showToast('Gagal menghapus item dari Firebase', 'error');
        }
      }
    });
  };

  const handleSaveOpname = async (physicalStocks: { [sku: string]: number }) => {
    if (!currentUser) return;
    let count = 0;

    try {
      for (const item of inventoryData) {
        const physical = physicalStocks[item.sku];
        if (physical !== undefined && physical !== item.stock) {
          const diff = physical - item.stock;
          const type = diff > 0 ? 'Masuk' : 'Keluar';

          await setDoc(doc(db, 'inventory', item.sku), {
            ...item,
            stock: physical
          });

          await addDoc(collection(db, 'transactions'), {
            date: new Date().toISOString(),
            type: type,
            sku: item.sku,
            name: item.name,
            qty: Math.abs(diff),
            note: `Selisih Opname: ${diff > 0 ? '+' : ''}${diff} (Sistem: ${item.stock})`,
            user: currentUser.username
          });

          count++;
        }
      }

      if (count > 0) {
        showToast(`Opname selesai! ${count} penyesuaian barang disimpan ke Firebase.`, 'success');
      } else {
        showToast('Opname selesai. Tidak ada selisih stok.', 'success');
      }
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan opname', 'error');
    }
  };

  const handleSaveNewUser = async (username: string, pass: string, role: 'admin' | 'staf') => {
    if (usersData.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast('Username sudah terdaftar!', 'error');
      return;
    }

    try {
      const newUser: AppUser = { username, password: pass, role };
      await setDoc(doc(db, 'users', username), newUser);
      showToast(`Anggota baru (${username}) berhasil ditambahkan`, 'success');
      setAddUserModalOpen(false);
    } catch (err) {
      showToast('Gagal menambahkan pengguna', 'error');
    }
  };

  const handlePromptDeleteUser = (username: string) => {
    if (currentUser?.username === username) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }

    setConfirmModal({
      open: true,
      title: 'Hapus Akses Anggota?',
      desc: `Tindakan ini akan mencabut akses login untuk anggota "${username}".`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'users', username));
          showToast(`Anggota ${username} berhasil dihapus`, 'success');
        } catch (err) {
          showToast('Gagal menghapus pengguna', 'error');
        }
      }
    });
  };

  const handleSaveChangePassword = async (oldPass: string, newPass: string) => {
    if (!currentUser) return;
    const found = usersData.find(u => u.username === currentUser.username);

    if (!found || found.password !== oldPass) {
      showToast('Password lama Anda salah!', 'error');
      return;
    }

    try {
      await setDoc(doc(db, 'users', currentUser.username), {
        ...found,
        password: newPass
      });
      showToast('Password berhasil diperbarui', 'success');
      setChangePasswordModalOpen(false);
    } catch (err) {
      showToast('Gagal memperbarui password', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    showToast('Anda telah keluar sesi', 'success');
  };

  return (
    <div className="text-slate-100 min-h-screen overflow-x-hidden">
      <ToastContainer toasts={toasts} />

      {!currentUser ? (
        <LoginScreen 
          usersData={usersData} 
          isDataLoaded={isDataLoaded} 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Selamat datang, ${user.username}!`, 'success');
          }}
          showToast={showToast}
        />
      ) : (
        <div className="pb-24">
          <Header 
            connectionStatus={connectionStatus}
            isRefreshing={isRefreshing}
            onRefresh={handleRefreshData}
            onOpenIntegrationModal={() => setIntegrationModalOpen(true)}
            onOpenImportModal={() => handleOpenImportModal('inventory')}
            currentTheme={theme}
            onSelectTheme={setTheme}
          />

          <main className="max-w-3xl mx-auto px-5 py-6 relative">
            {currentView === 'dashboard' && (
              <DashboardView 
                inventoryData={inventoryData}
                transactions={transactions}
                currentUser={currentUser}
                onSwitchView={setCurrentView}
                onPromptEdit={handlePromptEdit}
                onPromptDelete={handlePromptDelete}
                onOpenImportModal={handleOpenImportModal}
                showToast={showToast}
              />
            )}

            {currentView === 'riwayat' && (
              <RiwayatView 
                transactions={transactions}
                usersData={usersData}
                onSwitchView={setCurrentView}
                onOpenImportModal={handleOpenImportModal}
                showToast={showToast}
              />
            )}

            {currentView === 'transaksi' && (
              <TransaksiView 
                inventoryData={inventoryData}
                currentUser={currentUser}
                onSwitchView={setCurrentView}
                onSaveBulkTransactions={handleSaveBulkTransactions}
                showToast={showToast}
              />
            )}

            {currentView === 'tambah' && (
              <TambahView 
                inventoryData={inventoryData}
                currentUser={currentUser}
                onSaveNewItem={handleSaveNewItem}
                onOpenImportModal={handleOpenImportModal}
                showToast={showToast}
              />
            )}

            {currentView === 'opname' && (
              <OpnameView 
                inventoryData={inventoryData}
                onSaveOpname={handleSaveOpname}
                showToast={showToast}
              />
            )}

            {currentView === 'akun' && (
              <AkunView 
                currentUser={currentUser}
                usersData={usersData}
                onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
                onOpenAddUserModal={() => setAddUserModalOpen(true)}
                onPromptDeleteUser={handlePromptDeleteUser}
                onLogout={handleLogout}
                currentTheme={theme}
                onSelectTheme={setTheme}
              />
            )}
          </main>

          <Navigation 
            currentView={currentView}
            onSwitchView={setCurrentView}
            currentUser={currentUser}
          />

          <Modals 
            confirmModal={confirmModal}
            onCloseConfirmModal={() => setConfirmModal(null)}
            editItemModal={editItemModal}
            onCloseEditModal={() => setEditItemModal(null)}
            onSaveEdit={handleSaveEdit}
            addUserModalOpen={addUserModalOpen}
            onCloseAddUserModal={() => setAddUserModalOpen(false)}
            onSaveNewUser={handleSaveNewUser}
            changePasswordModalOpen={changePasswordModalOpen}
            onCloseChangePasswordModal={() => setChangePasswordModalOpen(false)}
            onSaveChangePassword={handleSaveChangePassword}
            integrationModalOpen={integrationModalOpen}
            onCloseIntegrationModal={() => setIntegrationModalOpen(false)}
            showToast={showToast}
          />

          <ImportModal 
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            initialTab={importInitialTab}
            existingInventory={inventoryData}
            currentUser={currentUser}
            onImportInventory={handleBulkImportInventory}
            onImportTransactions={handleBulkImportTransactions}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  );
}
