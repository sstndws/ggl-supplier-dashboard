/**
 * Data layer – Google Sheets CRUD, analytics, import
 */

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('SPREADSHEET_ID belum diset. Jalankan setupSpreadsheet() atau set di Script Properties.');
  }
  return SpreadsheetApp.openById(id);
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Supplier Cangkang Dashboard');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  getOrCreateSheet_(ss, SHEET_SITES, ['id', 'name', 'description', 'created_at']);
  getOrCreateSheet_(ss, SHEET_SCHEMA, ['site', 'year', 'field_key', 'field_label', 'field_type', 'sort_order']);
  getOrCreateSheet_(ss, SHEET_DATA, ['id', 'site', 'year', 'updated_at'].concat(MASTER_FIELDS.map(function (f) { return f.key; })));

  var sitesSheet = ss.getSheetByName(SHEET_SITES);
  if (sitesSheet.getLastRow() <= 1) {
    var sites = getDefaultSites_();
    var rows = sites.map(function (s) {
      return [s.id, s.name, s.description, new Date().toISOString()];
    });
    sitesSheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }

  seedInitialData_(ss);
  setupUsers_();
  return { spreadsheetId: ss.getId(), url: ss.getUrl() };
}

function seedInitialData_(ss) {
  var dataSheet = ss.getSheetByName(SHEET_DATA);
  if (dataSheet.getLastRow() > 1) return;

  var seed = getEmbeddedSeedData_();
  if (!seed || !seed.data) return;

  var headers = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0];
  var keyIndex = {};
  headers.forEach(function (h, i) { keyIndex[h] = i; });

  var rows = [];
  Object.keys(seed.data).forEach(function (combo) {
    var parts = combo.split('_');
    var year = parts.pop();
    var site = parts.join('_');
    seed.data[combo].forEach(function (rec, idx) {
      var row = new Array(headers.length).fill('');
      row[keyIndex['id']] = site + '_' + year + '_' + (idx + 1);
      row[keyIndex['site']] = site;
      row[keyIndex['year']] = year;
      row[keyIndex['updated_at']] = new Date().toISOString();
      Object.keys(rec).forEach(function (k) {
        if (keyIndex[k] !== undefined) row[keyIndex[k]] = rec[k];
      });
      rows.push(row);
    });
  });

  if (rows.length) {
    dataSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  var schemaSheet = ss.getSheetByName(SHEET_SCHEMA);
  if (schemaSheet.getLastRow() <= 1 && seed.schemas) {
    var schemaRows = [];
    Object.keys(seed.schemas).forEach(function (combo) {
      var parts = combo.split('_');
      var year = parts.pop();
      var site = parts.join('_');
      seed.schemas[combo].forEach(function (f, i) {
        schemaRows.push([site, year, f.key, f.label, f.type || 'text', i + 1]);
      });
    });
    if (schemaRows.length) {
      schemaSheet.getRange(2, 1, schemaRows.length, 6).setValues(schemaRows);
    }
  }
}

function getEmbeddedSeedData_() {
  // Seed data di-inject saat deploy – jalankan importSeedFromJson() untuk data lengkap
  return null;
}

function importSeedFromJson(jsonString) {
  var seed = JSON.parse(jsonString);
  var ss = getSpreadsheet_();
  var dataSheet = ss.getSheetByName(SHEET_DATA);
  var headers = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0];
  var keyIndex = {};
  headers.forEach(function (h, i) { keyIndex[h] = i; });

  var rows = [];
  Object.keys(seed.data).forEach(function (combo) {
    var parts = combo.split('_');
    var year = parts.pop();
    var site = parts.join('_');
    seed.data[combo].forEach(function (rec, idx) {
      var row = new Array(headers.length).fill('');
      row[keyIndex['id']] = Utilities.getUuid();
      row[keyIndex['site']] = site;
      row[keyIndex['year']] = year;
      row[keyIndex['updated_at']] = new Date().toISOString();
      Object.keys(rec).forEach(function (k) {
        if (k === 'site' || k === 'year' || k === 'id') return;
        if (keyIndex[k] !== undefined) row[keyIndex[k]] = rec[k];
      });
      rows.push(row);
    });
  });

  if (dataSheet.getLastRow() > 1) {
    dataSheet.getRange(2, 1, dataSheet.getLastRow() - 1, headers.length).clearContent();
  }
  if (rows.length) {
    dataSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  var schemaSheet = ss.getSheetByName(SHEET_SCHEMA);
  if (schemaSheet.getLastRow() > 1) {
    schemaSheet.getRange(2, 1, schemaSheet.getLastRow() - 1, 6).clearContent();
  }
  var schemaRows = [];
  Object.keys(seed.schemas).forEach(function (combo) {
    var parts = combo.split('_');
    var year = parts.pop();
    var site = parts.join('_');
    seed.schemas[combo].forEach(function (f, i) {
      schemaRows.push([site, year, f.key, f.label, f.type || 'text', i + 1]);
    });
  });
  if (schemaRows.length) {
    schemaSheet.getRange(2, 1, schemaRows.length, 6).setValues(schemaRows);
  }

  if (seed.sites) {
    var sitesSheet = ss.getSheetByName(SHEET_SITES);
    sitesSheet.getRange(2, 1, sitesSheet.getMaxRows() - 1, 4).clearContent();
    var siteRows = seed.sites.map(function (s) {
      return [s.id, s.name, s.description, new Date().toISOString()];
    });
    sitesSheet.getRange(2, 1, siteRows.length, 4).setValues(siteRows);
  }

  return { imported: rows.length };
}

function getSites() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_SITES);
  var data = sheet.getDataRange().getValues();
  var sites = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    sites.push({ id: String(data[i][0]), name: String(data[i][1]), description: String(data[i][2] || '') });
  }
  return sites;
}

function addSite(siteId, name, description) {
  siteId = String(siteId || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  if (!siteId) throw new Error('Site ID wajib diisi (huruf/angka).');
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_SITES);
  var existing = getSites();
  if (existing.some(function (s) { return s.id === siteId; })) {
    throw new Error('Site "' + siteId + '" sudah ada.');
  }
  sheet.appendRow([siteId, name || siteId, description || '', new Date().toISOString()]);
  return { id: siteId, name: name || siteId, description: description || '' };
}

function getSchema(site, year) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_SCHEMA);
  var data = sheet.getDataRange().getValues();
  var fields = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === site && String(data[i][1]) === String(year)) {
      var meta = getFieldMeta_(String(data[i][2]));
      fields.push({
        key: String(data[i][2]),
        label: String(data[i][3]),
        type: String(data[i][4]) || meta.type,
        sortOrder: Number(data[i][5]),
        options: meta.options || null,
        width: meta.width || 140
      });
    }
  }
  fields.sort(function (a, b) { return a.sortOrder - b.sortOrder; });

  if (!fields.length) {
    return MASTER_FIELDS.filter(function (f) {
      return ['no', 'company_name', 'address', 'stockpile', 'sustainability_certificate'].indexOf(f.key) >= 0;
    }).map(function (f, i) {
      return { key: f.key, label: f.label, type: f.type, sortOrder: i + 1, options: f.options || null, width: f.width };
    });
  }
  return fields;
}

function getAvailableYears(site) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DATA);
  var data = sheet.getDataRange().getValues();
  var years = {};
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === site && data[i][2]) {
      years[String(data[i][2])] = true;
    }
  }
  var schemaSheet = ss.getSheetByName(SHEET_SCHEMA);
  var schemaData = schemaSheet.getDataRange().getValues();
  for (var j = 1; j < schemaData.length; j++) {
    if (String(schemaData[j][0]) === site) years[String(schemaData[j][1])] = true;
  }
  return Object.keys(years).sort();
}

function getRecords(site, year, filters) {
  filters = filters || {};
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DATA);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var records = [];
  for (var i = 1; i < data.length; i++) {
    if (site && String(data[i][1]) !== site) continue;
    if (year && String(data[i][2]) !== String(year)) continue;

    var rec = {};
    for (var c = 0; c < headers.length; c++) {
      rec[headers[c]] = data[i][c] !== undefined && data[i][c] !== null ? String(data[i][c]) : '';
    }

    if (filters.search) {
      var q = filters.search.toLowerCase();
      var haystack = Object.keys(rec).map(function (k) { return rec[k].toLowerCase(); }).join(' ');
      if (haystack.indexOf(q) === -1) continue;
    }

    if (filters.certFilter === 'certified') {
      var cert = (rec.sustainability_certificate || '').toLowerCase();
      if (!cert || cert.indexOf('none') >= 0 || cert === 'no data' || cert === '-') continue;
    }
    if (filters.certFilter === 'uncertified') {
      var cert2 = (rec.sustainability_certificate || '').toLowerCase();
      if (cert2 && cert2.indexOf('none') === -1 && cert2 !== 'no data' && cert2 !== '-') continue;
    }
    if (filters.supplierFilter === 'baru') {
      var st = (rec.supplier_lama_baru || rec.supplier_lama_supplier_baru || rec.jenis_supplier || '').toLowerCase();
      if (st.indexOf('baru') === -1) continue;
    }
    if (filters.supplierFilter === 'lama') {
      var st2 = (rec.supplier_lama_baru || rec.supplier_lama_supplier_baru || rec.jenis_supplier || '').toLowerCase();
      if (st2.indexOf('lama') === -1 || st2.indexOf('baru') >= 0) continue;
    }

    records.push(rec);
  }
  return records;
}

function getAnalytics(site, year) {
  var records = getRecords(site, year, {});
  var stockpiles = {};
  var uncertified = 0;
  var newSuppliers = 0;
  var withQty = 0;

  records.forEach(function (r) {
    if (r.stockpile) stockpiles[r.stockpile] = true;
    var cert = (r.sustainability_certificate || '').toLowerCase();
    if (!cert || cert.indexOf('none') >= 0 || cert === 'no data' || cert === '-') uncertified++;
    var st = (r.supplier_lama_baru || r.supplier_lama_supplier_baru || r.jenis_supplier || '').toLowerCase();
    if (st.indexOf('baru') >= 0) newSuppliers++;
    var qty = r.qty_terkirim_kg || r.qty_pengiriman_kg || r.qty_kirim_kg || '';
    if (qty && qty !== '0') withQty++;
  });

  return {
    totalSuppliers: records.length,
    stockpiles: Object.keys(stockpiles).length,
    uncertified: uncertified,
    newSuppliers: newSuppliers,
    withDelivery: withQty
  };
}

function saveRecord(record) {
  if (!record.site || !record.year) throw new Error('Site dan tahun wajib diisi.');
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DATA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyIndex = {};
  headers.forEach(function (h, i) { keyIndex[h] = i; });

  record.updated_at = new Date().toISOString();
  if (!record.id) record.id = Utilities.getUuid();

  var rowArr = new Array(headers.length).fill('');
  Object.keys(record).forEach(function (k) {
    if (keyIndex[k] !== undefined) rowArr[keyIndex[k]] = record[k];
  });

  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(record.id)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, headers.length).setValues([rowArr]);
  } else {
    sheet.appendRow(rowArr);
  }
  return record;
}

function deleteRecord(id) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DATA);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { deleted: true };
    }
  }
  throw new Error('Record tidak ditemukan.');
}

function exportCsv(site, year, filters) {
  var records = getRecords(site, year, filters || {});
  var schema = getSchema(site, year);
  var headers = schema.map(function (f) { return f.label; });
  var keys = schema.map(function (f) { return f.key; });

  var lines = [headers.join(',')];
  records.forEach(function (r) {
    var row = keys.map(function (k) {
      var v = (r[k] || '').replace(/"/g, '""');
      return '"' + v + '"';
    });
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function generatePdfHtml(site, year, filters) {
  var records = getRecords(site, year, filters || {});
  var schema = getSchema(site, year);
  var analytics = getAnalytics(site, year);
  var siteName = site;
  try {
    getSites().forEach(function (s) { if (s.id === site) siteName = s.name; });
  } catch (e) {}

  var headCells = schema.map(function (f) {
    return '<th>' + escapeHtml_(f.label) + '</th>';
  }).join('');

  var bodyRows = records.map(function (r) {
    var cells = schema.map(function (f) {
      return '<td>' + escapeHtml_(r[f.key] || '') + '</td>';
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Supplier Registry ' + site + ' ' + year + '</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:10px;margin:24px}h1{color:#7B1E1E;font-size:18px}' +
    '.meta{color:#666;margin-bottom:16px}.cards{display:flex;gap:12px;margin-bottom:20px}' +
    '.card{border:1px solid #ddd;border-radius:8px;padding:10px 16px;min-width:100px}' +
    '.card strong{display:block;font-size:16px;color:#7B1E1E}table{width:100%;border-collapse:collapse}' +
    'th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#f5f0f0}</style></head><body>' +
    '<h1>Supplier Registry – ' + escapeHtml_(siteName) + ' (' + year + ')</h1>' +
    '<div class="meta">Generated ' + new Date().toLocaleString('id-ID') + ' · ' + records.length + ' rows</div>' +
    '<div class="cards">' +
    '<div class="card"><strong>' + analytics.totalSuppliers + '</strong>Total Suppliers</div>' +
    '<div class="card"><strong>' + analytics.stockpiles + '</strong>Stockpiles</div>' +
    '<div class="card"><strong>' + analytics.uncertified + '</strong>Uncertified</div>' +
    '<div class="card"><strong>' + analytics.newSuppliers + '</strong>New Suppliers</div></div>' +
    '<table><thead><tr>' + headCells + '</tr></thead><tbody>' + bodyRows + '</tbody></table></body></html>';
}

function escapeHtml_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getUserEmail() {
  try {
    return Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'user@gmail.com';
  } catch (e) {
    return 'user@gmail.com';
  }
}
