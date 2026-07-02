/**
 * REST API – mirror local/server.py untuk React (Vercel) atau fetch eksternal.
 *
 * GET  ?route=/api/initial&token=...
 * GET  ?route=/api/export-csv&site=EUP&year=2026&token=...
 * POST body JSON: { "route": "/api/login", ... }
 */

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function mergeParams_(query, body) {
  var out = {};
  if (query) {
    Object.keys(query).forEach(function (k) {
      out[k] = query[k];
    });
  }
  if (body) {
    Object.keys(body).forEach(function (k) {
      if (body[k] !== undefined && body[k] !== null) out[k] = body[k];
    });
  }
  return out;
}

function jsonOutput_(data, status) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function csvOutput_(csv, filename) {
  return ContentService.createTextOutput(csv)
    .setMimeType(ContentService.MimeType.CSV)
    .downloadAsFile_(filename || 'supplier_export.csv');
}

function apiError_(message, status) {
  return { error: message, status: status || 400 };
}

function handleApiGet_(params) {
  params = params || {};
  var route = String(params.route || '');

  if (route === '/api/initial' || route === 'initial') {
    try {
      return getInitialData();
    } catch (err) {
      return apiError_(err.message || 'Request failed', 400);
    }
  }

  if (route === '/api/export-csv' || route === 'export-csv') {
    try {
      var site = params.site || 'EUP';
      var year = String(params.year || '2026');
      var filters = {
        search: params.search || '',
        certFilter: params.certFilter || '',
        supplierFilter: params.supplierFilter || '',
      };
      return {
        _type: 'csv',
        filename: 'supplier_' + site + '_' + year + '.csv',
        content: exportCsv(site, year, filters),
      };
    } catch (err) {
      return apiError_(err.message || 'Export gagal', 401);
    }
  }

  return apiError_('Route tidak dikenal: ' + route, 404);
}

function handleApiPost_(body, query) {
  var params = mergeParams_(query, body);
  var route = String(params.route || '');

  if (route === '/api/login' || route === 'login') {
    try {
      return login(params.email, params.password);
    } catch (err) {
      return apiError_(err.message || 'Login gagal', 401);
    }
  }

  if (route === '/api/initial' || route === 'initial') {
    try {
      return getInitialData();
    } catch (err) {
      return apiError_(err.message || 'Initial gagal', 400);
    }
  }

  if (route === '/api/dashboard' || route === 'dashboard') {
    try {
      return apiGetDashboard(
        params.token,
        params.site,
        String(params.year),
        params.filters || {}
      );
    } catch (err) {
      return apiError_(err.message || 'Dashboard gagal', 401);
    }
  }

  if (route === '/api/save' || route === 'save') {
    try {
      var record = params.record || params;
      delete record.route;
      delete record.token;
      return apiSaveRecord(params.token, record);
    } catch (err) {
      return apiError_(err.message || 'Simpan gagal', 400);
    }
  }

  if (route === '/api/delete' || route === 'delete') {
    try {
      return apiDeleteRecord(params.token, params.id);
    } catch (err) {
      return apiError_(err.message || 'Hapus gagal', 400);
    }
  }

  if (route === '/api/add-site' || route === 'add-site') {
    try {
      return apiAddSite(
        params.token,
        params.id,
        params.name,
        params.description || ''
      );
    } catch (err) {
      return apiError_(err.message || 'Tambah site gagal', 400);
    }
  }

  return apiError_('Route tidak dikenal: ' + route, 404);
}

function doPost(e) {
  e = e || {};
  var body = parseJsonBody_(e);
  var result = handleApiPost_(body, e.parameter || {});

  if (result && result._type === 'csv') {
    return csvOutput_(result.content, result.filename);
  }
  return jsonOutput_(result);
}
