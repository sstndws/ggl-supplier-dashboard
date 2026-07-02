/**
 * Entry point – Web App + REST API
 */

function doGet(e) {
  e = e || {};
  var route = e.parameter && e.parameter.route;

  if (route) {
    var result = handleApiGet_(e.parameter || {});
    if (result && result._type === 'csv') {
      return csvOutput_(result.content, result.filename);
    }
    if (result && result.error) {
      return jsonOutput_(result);
    }
    return jsonOutput_(result);
  }

  var page = (e.parameter && e.parameter.page) || 'login';

  if (page === 'app') {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('GGL Dashboard – Supplier Cangkang')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  return HtmlService.createTemplateFromFile('Login')
    .evaluate()
    .setTitle('GGL Dashboard – Sign In')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getInitialData(token) {
  var sites = getSites();
  var defaultSite = sites.length ? sites[0].id : 'EUP';
  var years = getAvailableYears(defaultSite);
  var defaultYear = years.length ? years[years.length - 1] : '2026';
  return {
    sites: sites,
    years: years,
    defaultSite: defaultSite,
    defaultYear: defaultYear,
    userEmail: '',
    userName: 'GGL Dashboard',
    certOptions: CERT_OPTIONS,
    masterFields: MASTER_FIELDS
  };
}

function apiGetDashboard(token, site, year, filters) {
  return {
    analytics: getAnalytics(site, year),
    records: getRecords(site, year, filters),
    schema: getSchema(site, year),
    years: getAvailableYears(site)
  };
}

function apiSaveRecord(token, record) {
  return saveRecord(record);
}

function apiDeleteRecord(token, id) {
  return deleteRecord(id);
}

function apiExportCsv(token, site, year, filters) {
  return exportCsv(site, year, filters);
}

function apiGeneratePdf(token, site, year, filters) {
  return generatePdfHtml(site, year, filters);
}

function apiAddSite(token, siteId, name, description) {
  return addSite(siteId, name, description);
}

function apiImportSeed(token, jsonString) {
  requireAuth_(token);
  return importSeedFromJson(jsonString);
}

function apiRunSeedImport(token) {
  requireAuth_(token);
  return runSeedImport();
}

function apiLogout(token) {
  return logout(token);
}
