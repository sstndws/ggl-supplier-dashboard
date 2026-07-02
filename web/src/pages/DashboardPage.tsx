import SiteControls from '@/components/dashboard/SiteControls';
import ExportModal from '@/components/dashboard/ExportModal';
import AddSiteModal from '@/components/dashboard/AddSiteModal';
import { resolveSupplierSchema } from '@/lib/defaultSchema';
import StatCards from '@/components/dashboard/StatCards';
import SupplierModal from '@/components/dashboard/SupplierModal';
import SupplierProfileModal from '@/components/dashboard/SupplierProfileModal';
import SupplierTable from '@/components/dashboard/SupplierTable';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { api } from '@/lib/api';
import type {
  Analytics,
  FieldSchema,
  Site,
  SupplierRecord,
  TableFilters,
} from '@/types';
import { DEFAULT_VISIBLE_KEYS } from '@/types';
import {
  Columns3,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [years, setYears] = useState<string[]>([]);
  const [schema, setSchema] = useState<FieldSchema[]>([]);
  const [records, setRecords] = useState<SupplierRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSuppliers: 0,
    stockpiles: 0,
    uncertified: 0,
    newSuppliers: 0,
  });
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    certFilter: '',
    supplierFilter: '',
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(
    () => new Set(DEFAULT_VISIBLE_KEYS),
  );
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [profileRecord, setProfileRecord] = useState<SupplierRecord | null>(null);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'pdf' | 'csv'>('pdf');

  const loadDashboard = useCallback(async () => {
    if (!currentSite || !currentYear) return;
    setLoading(true);
    try {
      const data = await api.getDashboard(currentSite, currentYear, filters);
      setSchema(data.schema);
      setRecords(data.records);
      setAnalytics(data.analytics);
      setYears(data.years);
    } finally {
      setLoading(false);
    }
  }, [currentSite, currentYear, filters]);

  useEffect(() => {
    api.getInitial().then((data) => {
      setSites(data.sites);
      setCurrentSite(data.defaultSite);
      setCurrentYear(data.defaultYear);
    });
  }, []);

  useEffect(() => {
    if (currentSite && currentYear) loadDashboard();
  }, [currentSite, currentYear, loadDashboard]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (currentSite && currentYear) loadDashboard();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const siteName = sites.find((s) => s.id === currentSite)?.name || currentSite;
  const activeSchema = resolveSupplierSchema(schema);

  async function handleAddSave(data: Record<string, string>) {
    await api.saveRecord({
      id: '',
      site: currentSite,
      year: currentYear,
      ...data,
    } as SupplierRecord);
    setAddModalOpen(false);
    loadDashboard();
  }

  async function handleProfileSave(data: Record<string, string>) {
    if (!profileRecord) return;
    await api.saveRecord({
      id: profileRecord.id,
      site: currentSite,
      year: currentYear,
      ...data,
    } as SupplierRecord);
    setProfileRecord(null);
    loadDashboard();
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus supplier ini?')) return;
    await api.deleteRecord(id);
    setProfileRecord(null);
    loadDashboard();
  }

  return (
    <div className="min-h-screen" style={{ background: '#f7f1f1' }}>
      <TopBar />

      <div className="flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-8">
          <div className="page-header-row">
            <div className="page-header-main">
              <div className="mb-1 text-xs font-medium" style={{ color: '#9c8a8a' }}>
                Dashboard / <span style={{ color: '#7a5f5f' }}>{siteName}</span>
              </div>
              <h1 className="page-title">{siteName} – {currentYear}</h1>
              <p className="text-sm" style={{ color: '#7a5f5f' }}>
                Kelola dan pantau daftar supplier cangkang per site dan tahun
              </p>
            </div>

            <SiteControls
              sites={sites}
              currentSite={currentSite}
              years={years}
              currentYear={currentYear}
              onSiteChange={setCurrentSite}
              onYearChange={setCurrentYear}
              onAddSite={() => setSiteModalOpen(true)}
            />
          </div>

          <div className="mb-5 mt-5">
            <StatCards data={analytics} />
          </div>

          {/* Mill Registry style table card — sustain-dashboard */}
          <div className="registry-table-card">
            <div className="registry-table-header">
              <h3>Supplier Registry</h3>
              <button
                type="button"
                className="registry-btn registry-btn--primary"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus size={15} />
                Add Supplier
              </button>
            </div>

            <div className="registry-search-bar">
              <Search size={16} className="registry-search-icon" />
              <input
                type="text"
                placeholder="Search company, mill, stockpile, address…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>

            <div className="registry-toolbar">
              <button type="button" className="registry-btn">
                <SlidersHorizontal size={14} />
                Filter registry
              </button>

              <select
                value={filters.certFilter}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    certFilter: e.target.value as TableFilters['certFilter'],
                  }))
                }
              >
                <option value="">All Certificates</option>
                <option value="certified">Certified only</option>
                <option value="uncertified">Uncertified only</option>
              </select>

              <select
                value={filters.supplierFilter}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    supplierFilter: e.target.value as TableFilters['supplierFilter'],
                  }))
                }
              >
                <option value="">All Supplier Types</option>
                <option value="baru">Supplier Baru</option>
                <option value="lama">Supplier Lama</option>
              </select>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="registry-btn"
                  onClick={() => setColMenuOpen((v) => !v)}
                >
                  <Columns3 size={14} />
                  Columns
                </button>
                {colMenuOpen && (
                  <div className="registry-col-menu">
                    {activeSchema
                      .filter((f) => !['id', 'site', 'year', 'updated_at'].includes(f.key))
                      .map((f) => (
                        <label key={f.key}>
                          <input
                            type="checkbox"
                            checked={visibleKeys.has(f.key)}
                            onChange={(e) => {
                              setVisibleKeys((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(f.key);
                                else next.delete(f.key);
                                return next;
                              });
                            }}
                          />
                          {f.label}
                        </label>
                      ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="registry-btn registry-btn--export"
                onClick={() => {
                  setExportMode('csv');
                  setExportOpen(true);
                }}
              >
                <Download size={14} />
                Export CSV
              </button>

              <button
                type="button"
                className="registry-btn registry-btn--export"
                onClick={() => {
                  setExportMode('pdf');
                  setExportOpen(true);
                }}
              >
                <FileText size={14} />
                Export PDF
              </button>

              <span className="registry-scope-label">
                {records.length} rows · pilih kolom saat export
              </span>
            </div>

            {loading ? (
              <div className="registry-empty">
                <Loader2
                  size={20}
                  className="mx-auto mb-2 animate-spin"
                  style={{ color: '#9c8a8a' }}
                />
                Loading suppliers…
              </div>
            ) : (
              <SupplierTable
                records={records}
                schema={activeSchema}
                visibleKeys={visibleKeys}
                onRowClick={setProfileRecord}
              />
            )}
          </div>
        </main>
      </div>

      <SupplierModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        schema={activeSchema}
        record={null}
        onSave={handleAddSave}
      />

      <SupplierProfileModal
        open={!!profileRecord}
        record={profileRecord}
        schema={activeSchema}
        onClose={() => setProfileRecord(null)}
        onSave={handleProfileSave}
        onDelete={handleDelete}
      />

      <AddSiteModal
        open={siteModalOpen}
        onClose={() => setSiteModalOpen(false)}
        onSave={async (siteId, siteName) => {
          const site = await api.addSite(siteId, siteName);
          setSites((prev) => [...prev, site]);
          setCurrentSite(site.id);
          loadDashboard();
        }}
      />

      <ExportModal
        open={exportOpen}
        mode={exportMode}
        onClose={() => setExportOpen(false)}
        schema={activeSchema}
        records={records}
        siteName={siteName}
        siteId={currentSite}
        year={currentYear}
        filters={filters}
        initialKeys={visibleKeys}
      />
    </div>
  );
}
