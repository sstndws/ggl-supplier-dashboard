/**
 * Setup & menu spreadsheet – jalankan sekali saat pertama kali deploy.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('GGL Dashboard')
    .addItem('① Install lengkap (setup + import 627 baris)', 'installDashboard')
    .addSeparator()
    .addItem('Setup spreadsheet (sheet + user admin)', 'setupSpreadsheet')
    .addItem('Import seed data saja', 'runSeedImport')
    .addSeparator()
    .addItem('Tampilkan URL Web App', 'showWebAppUrl')
    .addItem('Tampilkan Spreadsheet ID', 'showSpreadsheetId')
    .addToUi();
}

/** Satu klik: buat sheet, user admin, dan import semua data EUP/RSB. */
function installDashboard() {
  var setup = setupSpreadsheet();
  var imported = runSeedImport();
  var msg =
    'GGL Dashboard siap dipakai!\n\n' +
    'Spreadsheet: ' + setup.url + '\n' +
    'ID: ' + setup.spreadsheetId + '\n' +
    'Data diimport: ' + imported.imported + ' baris\n\n' +
    'Login default:\n' +
    '  Email: admin@ggl.com\n' +
    '  Password: Ggl@2026\n\n' +
    'Langkah berikutnya: Deploy → New deployment → Web app → Anyone → Deploy';
  SpreadsheetApp.getUi().alert('Install selesai', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return { setup: setup, imported: imported };
}

function showWebAppUrl() {
  var url = '';
  try {
    url = ScriptApp.getService().getUrl();
  } catch (e) {}
  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Web App belum di-deploy',
      'Buka Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  SpreadsheetApp.getUi().alert('URL Web App', url, SpreadsheetApp.getUi().ButtonSet.OK);
}

function showSpreadsheetId() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '(belum diset – jalankan setupSpreadsheet)';
  SpreadsheetApp.getUi().alert('SPREADSHEET_ID', id, SpreadsheetApp.getUi().ButtonSet.OK);
}
