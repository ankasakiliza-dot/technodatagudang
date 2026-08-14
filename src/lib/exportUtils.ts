import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { InventoryItem, Transaction } from '../types';

export function downloadInventoryCSV(dataToExport: InventoryItem[]) {
  if (dataToExport.length === 0) return false;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "SKU,Nama Barang,Stok,Batas Alert,Status\n";
  
  dataToExport.forEach(item => {
    const min = item.minStock !== undefined ? item.minStock : 5;
    let status = 'Aman';
    if (item.stock === 0) status = 'Habis'; 
    else if (item.stock <= min) status = 'Tipis';
    
    const sku = `"${item.sku.replace(/"/g, '""')}"`;
    const name = `"${item.name.replace(/"/g, '""')}"`;
    csvContent += `${sku},${name},${item.stock},${min},"${status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Stok_TechnoSync_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export function downloadInventoryPDF(dataToExport: InventoryItem[]) {
  if (dataToExport.length === 0) return false;
  
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Laporan Ketersediaan Data Stok - TechnoSync", 14, 22);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);
  
  const tableData = dataToExport.map(item => {
    const min = item.minStock !== undefined ? item.minStock : 5;
    let status = 'Aman';
    if (item.stock === 0) status = 'Habis'; 
    else if (item.stock <= min) status = 'Tipis';
    return [item.sku, item.name, item.stock.toString(), min.toString(), status];
  });
  
  autoTable(doc, {
    startY: 35,
    head: [['SKU', 'Nama Barang', 'Stok', 'Batas Alert', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [56, 189, 248] }
  });
  
  doc.save(`Laporan_Stok_Barang_${Date.now()}.pdf`);
  return true;
}

export function downloadTransactionsCSV(dataToExport: Transaction[]) {
  if (dataToExport.length === 0) return false;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Tanggal,Waktu,Tipe,SKU,Nama Barang,Kuantitas,Petugas,Keterangan\n";
  
  dataToExport.forEach(tx => {
    const d = new Date(tx.date);
    const tanggal = d.toLocaleDateString('id-ID');
    const waktu = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const isOpname = tx.note && (tx.note.includes('Opname') || tx.note.includes('Selisih'));
    const tipe = isOpname ? 'Opname' : tx.type;
    const sku = `"${tx.sku.replace(/"/g, '""')}"`;
    const name = `"${tx.name.replace(/"/g, '""')}"`;
    const user = `"${tx.user.replace(/"/g, '""')}"`;
    const note = `"${(tx.note || '-').replace(/"/g, '""')}"`;
    csvContent += `"${tanggal}","${waktu}","${tipe}",${sku},${name},${tx.qty},${user},${note}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Transaksi_TechnoSync_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export function downloadTransactionsPDF(dataToExport: Transaction[]) {
  if (dataToExport.length === 0) return false;
  
  const doc = new jsPDF('landscape');
  doc.setFontSize(16);
  doc.text("Laporan Riwayat Transaksi - TechnoSync", 14, 22);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);
  
  const tableData = dataToExport.map(tx => {
    const d = new Date(tx.date);
    const tanggal = d.toLocaleDateString('id-ID');
    const waktu = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const isOpname = tx.note && (tx.note.includes('Opname') || tx.note.includes('Selisih'));
    const tipe = isOpname ? 'Opname' : tx.type;
    return [tanggal, waktu, tipe, tx.sku, tx.name, tx.qty.toString(), tx.user, tx.note || '-'];
  });
  
  autoTable(doc, {
    startY: 35,
    head: [['Tanggal', 'Waktu', 'Tipe', 'SKU', 'Nama Barang', 'Kuantitas', 'Petugas', 'Keterangan']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [56, 189, 248] }
  });
  
  doc.save(`Laporan_Transaksi_${Date.now()}.pdf`);
  return true;
}

// Download Excel Template for Master Inventory
export function downloadInventoryExcelTemplate(type: 'xlsx' | 'csv' = 'xlsx') {
  const sampleData = [
    { 'SKU': 'ITM-101', 'Nama Barang': 'Kabel HDMI 4K 2 Meter', 'Stok': 50, 'Batas Alert': 10 },
    { 'SKU': 'ITM-102', 'Nama Barang': 'Mouse Wireless Silent', 'Stok': 25, 'Batas Alert': 5 },
    { 'SKU': 'ITM-103', 'Nama Barang': 'Power Bank 20000mAh Fast Charge', 'Stok': 15, 'Batas Alert': 5 },
    { 'SKU': '', 'Nama Barang': 'Flashdisk USB 64GB 3.0', 'Stok': 30, 'Batas Alert': 5 }
  ];

  if (type === 'csv') {
    let csv = 'SKU,Nama Barang,Stok,Batas Alert\n';
    sampleData.forEach(row => {
      csv += `"${row['SKU']}","${row['Nama Barang']}",${row['Stok']},${row['Batas Alert']}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Import_Barang.csv';
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Barang');
  XLSX.writeFile(workbook, 'Template_Import_Barang.xlsx');
}

// Download Excel Template for Transactions
export function downloadTransactionsExcelTemplate(type: 'xlsx' | 'csv' = 'xlsx') {
  const today = new Date().toISOString().split('T')[0];
  const sampleData = [
    { 'Tanggal': today, 'Tipe': 'Masuk', 'SKU': 'ITM-001', 'Nama Barang': 'Laptop ASUS ROG Strix', 'Kuantitas': 5, 'Petugas': 'admin', 'Keterangan': 'Restock supplier utama' },
    { 'Tanggal': today, 'Tipe': 'Keluar', 'SKU': 'ITM-002', 'Nama Barang': 'Mouse Logitech G502', 'Kuantitas': 2, 'Petugas': 'staf', 'Keterangan': 'Penjualan toko' },
    { 'Tanggal': today, 'Tipe': 'Rusak', 'SKU': 'ITM-004', 'Nama Barang': 'Monitor LG UltraGear 27"', 'Kuantitas': 1, 'Petugas': 'admin', 'Keterangan': 'Panel pecah saat unboxing' }
  ];

  if (type === 'csv') {
    let csv = 'Tanggal,Tipe,SKU,Nama Barang,Kuantitas,Petugas,Keterangan\n';
    sampleData.forEach(row => {
      csv += `"${row['Tanggal']}","${row['Tipe']}","${row['SKU']}","${row['Nama Barang']}",${row['Kuantitas']},"${row['Petugas']}","${row['Keterangan']}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Import_Transaksi.csv';
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Transaksi');
  XLSX.writeFile(workbook, 'Template_Import_Transaksi.xlsx');
}

// Parse uploaded file to InventoryItem list
export async function parseInventoryFile(file: File): Promise<{
  validItems: InventoryItem[];
  errors: string[];
}> {
  const errors: string[] = [];
  const validItems: InventoryItem[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push('File Excel tidak memiliki lembar kerja (sheet).');
      return { validItems, errors };
    }

    const rawRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], { defval: '' });

    if (rawRows.length === 0) {
      errors.push('File kosong atau tidak memiliki baris data.');
      return { validItems, errors };
    }

    rawRows.forEach((row, index) => {
      const rowNumber = index + 2; // header is row 1
      
      // Find flexible keys
      const nameKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('nama') || k.toLowerCase().includes('item') || k.toLowerCase().includes('barang') || k.toLowerCase().includes('name')
      );
      const skuKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('sku') || k.toLowerCase().includes('kode') || k.toLowerCase().includes('code')
      );
      const stockKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('stok') || k.toLowerCase().includes('stock') || k.toLowerCase().includes('qty') || k.toLowerCase().includes('jumlah')
      );
      const minStockKey = Object.keys(row).find(k => 
        k.toLowerCase().includes('alert') || k.toLowerCase().includes('min') || k.toLowerCase().includes('batas')
      );

      const nameVal = nameKey ? String(row[nameKey]).trim() : '';
      let skuVal = skuKey ? String(row[skuKey]).trim().toUpperCase() : '';
      const stockVal = stockKey ? Number(row[stockKey]) : 0;
      const minStockVal = minStockKey ? Number(row[minStockKey]) : 5;

      if (!nameVal) {
        errors.push(`Baris ${rowNumber}: Nama barang kosong, dilewati.`);
        return;
      }

      if (!skuVal) {
        skuVal = 'ITM-' + Math.floor(10000 + Math.random() * 90000);
      }

      validItems.push({
        sku: skuVal,
        name: nameVal,
        stock: isNaN(stockVal) ? 0 : Math.max(0, Math.floor(stockVal)),
        minStock: isNaN(minStockVal) ? 5 : Math.max(0, Math.floor(minStockVal))
      });
    });

    return { validItems, errors };
  } catch (err: any) {
    errors.push(`Gagal membaca file: ${err?.message || 'Format tidak didukung'}`);
    return { validItems, errors };
  }
}

// Parse uploaded file to Transaction list
export async function parseTransactionFile(file: File, fallbackUser: string = 'admin'): Promise<{
  validTransactions: Transaction[];
  errors: string[];
}> {
  const errors: string[] = [];
  const validTransactions: Transaction[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push('File Excel tidak memiliki lembar kerja (sheet).');
      return { validTransactions, errors };
    }

    const rawRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], { defval: '' });

    if (rawRows.length === 0) {
      errors.push('File kosong atau tidak memiliki baris data.');
      return { validTransactions, errors };
    }

    rawRows.forEach((row, index) => {
      const rowNumber = index + 2;

      const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('tanggal') || k.toLowerCase().includes('date') || k.toLowerCase().includes('tgl'));
      const typeKey = Object.keys(row).find(k => k.toLowerCase().includes('tipe') || k.toLowerCase().includes('type') || k.toLowerCase().includes('status') || k.toLowerCase().includes('jenis'));
      const skuKey = Object.keys(row).find(k => k.toLowerCase().includes('sku') || k.toLowerCase().includes('kode') || k.toLowerCase().includes('code'));
      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('nama') || k.toLowerCase().includes('barang') || k.toLowerCase().includes('item') || k.toLowerCase().includes('name'));
      const qtyKey = Object.keys(row).find(k => k.toLowerCase().includes('kuantitas') || k.toLowerCase().includes('qty') || k.toLowerCase().includes('jumlah') || k.toLowerCase().includes('total'));
      const userKey = Object.keys(row).find(k => k.toLowerCase().includes('petugas') || k.toLowerCase().includes('user') || k.toLowerCase().includes('admin') || k.toLowerCase().includes('oleh'));
      const noteKey = Object.keys(row).find(k => k.toLowerCase().includes('keterangan') || k.toLowerCase().includes('note') || k.toLowerCase().includes('catatan') || k.toLowerCase().includes('alasan'));

      const nameVal = nameKey ? String(row[nameKey]).trim() : '';
      const skuVal = skuKey ? String(row[skuKey]).trim().toUpperCase() : '';
      let typeValRaw = typeKey ? String(row[typeKey]).trim().toLowerCase() : 'masuk';
      let typeVal: 'Masuk' | 'Keluar' | 'Rusak' = 'Masuk';

      if (typeValRaw.includes('keluar') || typeValRaw.includes('out') || typeValRaw.includes('sale') || typeValRaw.includes('jual')) {
        typeVal = 'Keluar';
      } else if (typeValRaw.includes('rusak') || typeValRaw.includes('damage') || typeValRaw.includes('broken')) {
        typeVal = 'Rusak';
      } else {
        typeVal = 'Masuk';
      }

      const qtyVal = qtyKey ? Number(row[qtyKey]) : 1;
      const userVal = userKey ? String(row[userKey]).trim() || fallbackUser : fallbackUser;
      const noteVal = noteKey ? String(row[noteKey]).trim() || 'Import File' : 'Import File';

      let dateVal = new Date().toISOString();
      if (dateKey && row[dateKey]) {
        const rawDate = row[dateKey];
        if (typeof rawDate === 'number') {
          // Excel serial date format
          const dateObj = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) dateVal = dateObj.toISOString();
        } else {
          const parsed = new Date(String(rawDate));
          if (!isNaN(parsed.getTime())) dateVal = parsed.toISOString();
        }
      }

      if (!nameVal && !skuVal) {
        errors.push(`Baris ${rowNumber}: Kolom SKU & Nama Barang kosong, baris dilewati.`);
        return;
      }

      validTransactions.push({
        date: dateVal,
        type: typeVal,
        sku: skuVal || 'ITM-AUTO',
        name: nameVal || skuVal,
        qty: isNaN(qtyVal) || qtyVal <= 0 ? 1 : Math.floor(qtyVal),
        user: userVal,
        note: noteVal
      });
    });

    return { validTransactions, errors };
  } catch (err: any) {
    errors.push(`Gagal membaca file transaksi: ${err?.message || 'Format tidak didukung'}`);
    return { validTransactions, errors };
  }
}

