/**
 * Entry point – Web App
 */

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'login';

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
  var session = requireAuth_(token);
  var sites = getSites();
  var defaultSite = sites.length ? sites[0].id : 'EUP';
  var years = getAvailableYears(defaultSite);
  var defaultYear = years.length ? years[years.length - 1] : '2026';
  return {
    sites: sites,
    years: years,
    defaultSite: defaultSite,
    defaultYear: defaultYear,
    userEmail: session.email,
    userName: session.name,
    certOptions: CERT_OPTIONS,
    masterFields: MASTER_FIELDS
  };
}

function apiGetDashboard(token, site, year, filters) {
  requireAuth_(token);
  return {
    analytics: getAnalytics(site, year),
    records: getRecords(site, year, filters),
    schema: getSchema(site, year),
    years: getAvailableYears(site)
  };
}

function apiSaveRecord(token, record) {
  requireAuth_(token);
  return saveRecord(record);
}

function apiDeleteRecord(token, id) {
  requireAuth_(token);
  return deleteRecord(id);
}

function apiExportCsv(token, site, year, filters) {
  requireAuth_(token);
  return exportCsv(site, year, filters);
}

function apiGeneratePdf(token, site, year, filters) {
  requireAuth_(token);
  return generatePdfHtml(site, year, filters);
}

function apiAddSite(token, siteId, name, description) {
  requireAuth_(token);
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
