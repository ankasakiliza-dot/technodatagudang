export interface BundleComponent {
  sku: string;
  name: string;
  qty: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  updatedAt?: string;
  isBundle?: boolean;
  bundleItems?: BundleComponent[];
}

export type UserRole = 'admin' | 'teknisi' | 'staf';

export interface AppUser {
  username: string;
  password?: string;
  role: UserRole;
}

export interface Transaction {
  id?: string | number;
  date: string;
  type: 'Masuk' | 'Keluar' | 'Rusak';
  sku: string;
  name: string;
  qty: number;
  note: string;
  user: string;
  editedAt?: string;
  editedBy?: string;
}

export interface CartItem {
  id: number;
  sku: string;
  name: string;
  type: 'Masuk' | 'Keluar' | 'Rusak';
  qty: number;
  note: string;
  date: string;
}

export type ViewType = 'dashboard' | 'riwayat' | 'transaksi' | 'tambah' | 'opname' | 'akun';
