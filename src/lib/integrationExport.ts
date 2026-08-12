export const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-rG4yXGKtBtH1BoHghWBsA3HbPyDUKCN2UB_WU_oUxBDOfLlVNImRfhMJIV5fD0S0/exec";

export const APPS_SCRIPT_CODE = `/**
 * TechnoSync - Google Apps Script Backend Template
 * URL Web App Terpasang:
 * ${DEFAULT_APPS_SCRIPT_URL}
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "TechnoSync Google Apps Script API Ready",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "getAllData") {
      return getAllDataResponse(ss);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllDataResponse(ss) {
  var invSheet = ss.getSheetByName("Inventory") || ss.insertSheet("Inventory");
  var txSheet = ss.getSheetByName("Transactions") || ss.insertSheet("Transactions");
  var userSheet = ss.getSheetByName("Users") || ss.insertSheet("Users");
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    inventory: getRowsAsObjects(invSheet),
    transactions: getRowsAsObjects(txSheet),
    users: getRowsAsObjects(userSheet)
  })).setMimeType(ContentService.MimeType.JSON);
}

function getRowsAsObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  return result;
}
`;

export function getBloggerPageHtml(appUrl: string = "https://ais-dev-3nrnqiyvvu6y56xy4r2f6p-569568008378.asia-southeast1.run.app"): string {
  return `<!-- ============================================================ -->
<!-- TechnoSync Inventory - Embed untuk Halaman / Post Blogger    -->
<!-- Salin seluruh kode ini & tempel di Mode HTML Editor Blogger   -->
<!-- ============================================================ -->

<div style="max-width: 100%; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Container Aplikasi -->
  <div style="position: relative; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); background-color: #0b0f19; border: 1px solid rgba(255,255,255,0.1);">
    
    <!-- Top Bar Status -->
    <div style="padding: 12px 20px; background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; color: #f8fafc; font-size: 13px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 700;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background-color: #10b981; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
        <span>TechnoSync Gudang</span>
      </div>
      <div>
        <a href="${appUrl}" target="_blank" style="color: #38bdf8; text-decoration: none; font-size: 11px; font-weight: 600; background: rgba(56,189,248,0.15); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.3);">
          Buka Layar Penuh ↗
        </a>
      </div>
    </div>

    <!-- Frame iFrame Aplikasi -->
    <iframe 
      src="${appUrl}" 
      style="width: 100%; height: 780px; border: none; display: block; background: #0b0f19;" 
      allow="camera; microphone; geolocation"
      allowfullscreen
      loading="lazy"
      title="TechnoSync Inventory System">
    </iframe>
  </div>

  <!-- Catatan Bantuan -->
  <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 10px;">
    Sistem Inventaris Realtime terhubung ke Firebase Firestore &amp; Apps Script.
  </p>
</div>`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}

