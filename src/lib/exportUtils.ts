import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
