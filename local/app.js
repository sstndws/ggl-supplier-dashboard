const SESSION_KEY = 'ggl_session_token';

const DEFAULT_VISIBLE = new Set([
  'no', 'company_name', 'pks_mill_internal_name', 'stockpile',
  'supplier_lama_baru', 'supplier_lama_supplier_baru', 'jenis_supplier',
  'status', 'ann_est_production_palm_shell_in_mt',
  'qty_terkirim_kg', 'qty_pengiriman_kg', 'qty_kirim_kg',
  'sustainability_certificate', 'type_of_processing', 'address'
]);

const state = {
  sites: [], schema: [], records: [],
  currentSite: '', currentYear: '',
  searchTimer: null,
  visibleCols: new Set(DEFAULT_VISIBLE),
};

const ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>',
};

if (!localStorage.getItem(SESSION_KEY)) location.href = '/login.html';

const user = JSON.parse(localStorage.getItem('ggl_session_user') || '{}');
document.getElementById('userEmail').textContent = user.email || '';
document.getElementById('userAvatar').textContent = (user.name || 'G').charAt(0).toUpperCase();

document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  const res = await fetch('/api/initial');
  const data = await res.json();
  state.sites = data.sites;
  state.currentSite = data.defaultSite;
  state.currentYear = data.defaultYear;
  renderSiteTabs();
  await loadDashboard();
  showLoading(false);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.col-toggle-wrap')) {
    document.getElementById('colMenu')?.classList.remove('open');
  }
});

function handleLogout() {
  localStorage.clear();
  location.href = '/login.html';
}

function showLoading(s) { document.getElementById('loading').classList.toggle('show', s); }

function renderSiteTabs() {
  document.getElementById('siteTabs').innerHTML = state.sites.map(s =>
    `<button class="tab${s.id === state.currentSite ? ' active' : ''}" onclick="switchSite('${s.id}')">${esc(s.name)}</button>`
  ).join('');
}

function switchSite(id) { state.currentSite = id; renderSiteTabs(); loadDashboard(); }

function getFilters() {
  return {
    search: document.getElementById('searchInput').value.trim(),
    certFilter: document.getElementById('filterCert').value,
    supplierFilter: document.getElementById('filterSupplier').value,
  };
}

async function loadDashboard() {
  showLoading(true);
  const site = state.sites.find(s => s.id === state.currentSite);
  document.getElementById('pageTitle').textContent = `${site?.name || state.currentSite} – ${state.currentYear}`;
  document.getElementById('breadcrumbSite').textContent = site?.name || state.currentSite;

  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site: state.currentSite, year: state.currentYear, filters: getFilters() })
  });
  const data = await res.json();
  state.schema = data.schema;
  state.records = data.records;

  const sel = document.getElementById('yearSelect');
  sel.innerHTML = (data.years.length ? data.years : ['2024','2025','2026']).map(y =>
    `<option value="${y}"${y === state.currentYear ? ' selected' : ''}>${y}</option>`
  ).join('');
  sel.onchange = () => { state.currentYear = sel.value; loadDashboard(); };

  document.getElementById('statTotal').textContent = data.analytics.totalSuppliers;
  document.getElementById('statStockpiles').textContent = data.analytics.stockpiles;
  document.getElementById('statUncertified').textContent = data.analytics.uncertified;
  document.getElementById('statNew').textContent = data.analytics.newSuppliers;
  document.getElementById('rowCount').textContent = `${data.records.length} rows · table view matches export`;

  renderColMenu(data.schema);
  renderTable(data.records, getVisibleFields(data.schema));
  showLoading(false);
}

function getVisibleFields(schema) {
  return schema.filter(f => {
    if (['id','site','year','updated_at'].includes(f.key)) return false;
    return state.visibleCols.has(f.key);
  });
}

function renderColMenu(schema) {
  const fields = schema.filter(f => !['id','site','year','updated_at'].includes(f.key));
  document.getElementById('colMenu').innerHTML = fields.map(f => `
    <label>
      <input type="checkbox" ${state.visibleCols.has(f.key) ? 'checked' : ''}
        onchange="toggleCol('${f.key}', this.checked)">
      ${esc(f.label)}
    </label>
  `).join('');
}

function toggleCol(key, visible) {
  if (visible) state.visibleCols.add(key);
  else state.visibleCols.delete(key);
  renderTable(state.records, getVisibleFields(state.schema));
}

function toggleColMenu(e) {
  e.stopPropagation();
  document.getElementById('colMenu').classList.toggle('open');
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function supplierType(r) {
  return r.supplier_lama_baru || r.supplier_lama_supplier_baru || r.jenis_supplier || '';
}

function certPill(v) {
  const l = (v || '').toLowerCase();
  if (!l || l.includes('none') || l === 'no data' || l === '-') return '<span class="pill pill-red">NO CERT</span>';
  if (l.includes('rspo') || l.includes('ispo') || l.includes('mspo')) return `<span class="pill pill-green">${esc(v)}</span>`;
  return `<span class="pill pill-amber">${esc(v)}</span>`;
}

function supplierPill(v) {
  if (!v) return '<span class="pill pill-grey">—</span>';
  const cls = v.toLowerCase().includes('baru') ? 'pill-amber' : 'pill-green';
  return `<span class="pill ${cls}">${esc(v)}</span>`;
}

function renderCell(f, r) {
  const v = r[f.key] || '';
  if (f.key === 'company_name') {
    return `<div class="cell-company">${esc(v)}</div>${r.no ? `<div class="cell-sub">#${esc(r.no)}</div>` : ''}`;
  }
  if (f.key === 'pks_mill_internal_name') {
    return `<div class="cell-mill">${esc(v)}</div>`;
  }
  if (f.key === 'address') {
    return v ? `<div class="cell-truncate">${esc(v)}</div>` : '<span class="pill pill-grey">—</span>';
  }
  if (f.key === 'sustainability_certificate') return certPill(v);
  if (f.key.includes('supplier') || f.key === 'jenis_supplier') return supplierPill(supplierType(r));
  if (f.key.includes('qty') || f.key.includes('ghg') || f.key.includes('transport')) {
    return v ? `<span class="cell-num">${esc(v)}</span>` : '<span class="pill pill-grey">—</span>';
  }
  if (f.key === 'status') {
    return v ? `<span class="pill pill-grey">${esc(v)}</span>` : '<span class="pill pill-grey">—</span>';
  }
  return v ? esc(v) : '<span style="color:var(--text-tertiary)">—</span>';
}

function renderTable(records, fields) {
  const thead = document.getElementById('tableHead');
  const tbody = document.getElementById('tableBody');

  if (!fields.length) {
    thead.innerHTML = '';
    tbody.innerHTML = `<tr><td><div class="empty-state"><p>Select columns to display</p></div></td></tr>`;
    return;
  }

  thead.innerHTML = `<tr>
    <th class="th-actions">Actions</th>
    ${fields.map((f, i) => `<th class="${i === 0 ? 'th-pinned' : ''}">${esc(f.label)}</th>`).join('')}
  </tr>`;

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="${fields.length + 1}">
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <p>No suppliers found. Try adjusting filters or add a new supplier.</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const actions = `<td class="td-actions"><div class="actions-group">
      <button class="btn-icon" title="Edit" onclick="editRecord('${r.id}')">${ICONS.edit}</button>
      <button class="btn-icon danger" title="Delete" onclick="deleteRecord('${r.id}')">${ICONS.trash}</button>
    </div></td>`;
    const cells = fields.map((f, i) =>
      `<td class="${i === 0 ? 'td-pinned' : ''}">${renderCell(f, r)}</td>`
    ).join('');
    return `<tr>${actions}${cells}</tr>`;
  }).join('');
}

function debounceSearch() {
  clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(loadDashboard, 280);
}

function openRecordModal(record) {
  document.getElementById('modalTitle').textContent = record ? 'Edit Supplier' : 'Add Supplier';
  document.getElementById('recordId').value = record?.id || '';
  const fields = state.schema.filter(f => !['id','site','year','updated_at'].includes(f.key));
  document.getElementById('formFields').innerHTML = fields.map(f => {
    const val = record?.[f.key] || '';
    const full = ['address','person_in_charge','location'].includes(f.key) ? ' full' : '';
    if (f.type === 'select') {
      return `<div class="form-group${full}"><label>${esc(f.label)}</label>
        <select id="field_${f.key}"><option value="">—</option></select></div>`;
    }
    if (['address','person_in_charge'].includes(f.key)) {
      return `<div class="form-group full"><label>${esc(f.label)}</label>
        <textarea id="field_${f.key}" rows="2">${esc(val)}</textarea></div>`;
    }
    return `<div class="form-group${full}"><label>${esc(f.label)}</label>
      <input type="text" id="field_${f.key}" value="${esc(val)}"></div>`;
  }).join('');
  document.getElementById('recordModal').classList.add('open');
}

function closeRecordModal() { document.getElementById('recordModal').classList.remove('open'); }
function editRecord(id) { const r = state.records.find(x => x.id === id); if (r) openRecordModal(r); }

async function saveRecord(e) {
  e.preventDefault();
  showLoading(true);
  const record = { id: document.getElementById('recordId').value, site: state.currentSite, year: state.currentYear };
  state.schema.forEach(f => {
    const el = document.getElementById('field_' + f.key);
    if (el) record[f.key] = el.value;
  });
  await fetch('/api/save', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({record}) });
  closeRecordModal();
  loadDashboard();
}

async function deleteRecord(id) {
  if (!confirm('Hapus supplier ini?')) return;
  showLoading(true);
  await fetch('/api/delete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id}) });
  loadDashboard();
}

function openSiteModal() { document.getElementById('siteModal').classList.add('open'); }
function closeSiteModal() { document.getElementById('siteModal').classList.remove('open'); }

async function addSite(e) {
  e.preventDefault();
  const body = { id: document.getElementById('newSiteId').value, name: document.getElementById('newSiteName').value };
  const res = await fetch('/api/add-site', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const site = await res.json();
  if (res.ok) { state.sites.push(site); state.currentSite = site.id; closeSiteModal(); renderSiteTabs(); loadDashboard(); }
  else alert(site.error);
}

function exportCsv() {
  const f = getFilters();
  window.open('/api/export-csv?' + new URLSearchParams({ site: state.currentSite, year: state.currentYear, ...f }));
}

function exportPdf() {
  const fields = getVisibleFields(state.schema);
  const rows = state.records;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Supplier Registry</title>
    <style>body{font-family:Arial,sans-serif;font-size:10px;margin:24px;color:#141414}
    h1{font-size:16px;color:#6B1A1A;margin-bottom:4px}p{color:#666;font-size:11px;margin-bottom:16px}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:5px 7px;text-align:left}
    th{background:#faf8f6;font-size:9px;text-transform:uppercase;letter-spacing:.05em}</style></head><body>
    <h1>Supplier Registry – ${state.currentSite} ${state.currentYear}</h1>
    <p>${rows.length} records · Generated ${new Date().toLocaleString('id-ID')}</p>
    <table><thead><tr>${fields.map(f=>'<th>'+f.label+'</th>').join('')}</tr></thead>
    <tbody>${rows.map(r=>'<tr>'+fields.map(f=>'<td>'+(r[f.key]||'')+'</td>').join('')+'</tr>').join('')}</tbody>
    </table></body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}
