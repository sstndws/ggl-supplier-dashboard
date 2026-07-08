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
import { computeAnalytics, filterSupplierRecords } from '@/lib/filterSuppliers';
import type {
  FieldSchema,
  Site,
  SupplierRecord,
  TableFilters,
} from '@/types';
import { DEFAULT_VISIBLE_KEYS } from '@/types';
import {
  Columns3,
  Eraser,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_FILTERS: TableFilters = {
  search: '',
  certFilter: '',
  supplierFilter: '',
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [initDone, setInitDone] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [years, setYears] = useState<string[]>([]);
  const [schema, setSchema] = useState<FieldSchema[]>([]);
  const [records, setRecords] = useState<SupplierRecord[]>([]);
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
  const [exportMode, setExportMode] = useState<'pdf' | 'excel'>('pdf');
  const colMenuRef = useRef<HTMLDivElement>(null);

  const loadDashboard = useCallback(async () => {
    if (!currentSite || !currentYear) return;
    setLoading(true);
    try {
      const data = await api.getDashboard(currentSite, currentYear, EMPTY_FILTERS);
      setSchema(data.schema);
      setRecords(data.records);
      setYears(data.years);
      setInitError('');
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [currentSite, currentYear]);

  useEffect(() => {
    api
      .getInitial()
      .then((data) => {
        setSites(data.sites);
        setCurrentSite(data.defaultSite || data.sites[0]?.id || 'EUP');
        setCurrentYear(data.defaultYear || data.years[data.years.length - 1] || '2026');
        setYears(data.years);
        setInitDone(true);
      })
      .catch((err) => {
        setInitError(err instanceof Error ? err.message : 'Failed to load data');
        setInitDone(true);
      });
  }, []);

  useEffect(() => {
    if (!initDone || initError || !currentSite || !currentYear) return;
    loadDashboard();
  }, [initDone, initError, currentSite, currentYear, loadDashboard]);

  const filteredRecords = useMemo(
    () => filterSupplierRecords(records, filters),
    [records, filters],
  );
  const analytics = useMemo(
    () => computeAnalytics(filteredRecords),
    [filteredRecords],
  );

  useEffect(() => {
    if (!colMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!colMenuRef.current) return;
      if (!colMenuRef.current.contains(event.target as Node)) {
        setColMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [colMenuOpen]);

  const siteName = sites.find((s) => s.id === currentSite)?.name || currentSite;
  const activeSchema = resolveSupplierSchema(schema);
  const hasActiveFilters = Boolean(filters.search || filters.certFilter || filters.supplierFilter);

  async function handleAddSave(data: Record<string, string>) {
    try {
      const payload = {
        id: '',
        site: currentSite,
        year: currentYear,
        ...data,
      } as SupplierRecord;
      const saved = await api.saveRecord(payload);
      const newRecord = { ...payload, ...saved } as SupplierRecord;
      setRecords((prev) => [...prev, newRecord]);
      setAddModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save supplier.');
    }
  }

  async function handleProfileSave(data: Record<string, string>) {
    if (!profileRecord) return;
    try {
      const payload = {
        id: profileRecord.id,
        site: currentSite,
        year: currentYear,
        ...data,
      } as SupplierRecord;
      const saved = await api.saveRecord(payload);
      const updated = { ...profileRecord, ...payload, ...saved } as SupplierRecord;
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setProfileRecord(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this supplier?')) return;
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setProfileRecord(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete supplier.');
    }
  }

  return (
    <div className="min-h-screen dashboard-shell">
      <TopBar />

      <div className="flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-8">
          {initError && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {initError}
            </div>
          )}
          <div className="page-header-row">
            <div className="page-header-main">
              <div className="dashboard-breadcrumb">
                Dashboard / <span>{siteName}</span>
              </div>
              <h1 className="page-title">{siteName} – {currentYear}</h1>
              <p className="dashboard-subtitle">
                Manage and monitor the palm shell supplier registry by site and year
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
                className="registry-select"
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
                className="registry-select"
                value={filters.supplierFilter}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    supplierFilter: e.target.value as TableFilters['supplierFilter'],
                  }))
                }
              >
                <option value="">All Supplier Types</option>
                <option value="baru">New Supplier</option>
                <option value="lama">Existing Supplier</option>
              </select>

              <div className="registry-col-wrap" ref={colMenuRef}>
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

              {hasActiveFilters && (
                <button
                  type="button"
                  className="registry-btn"
                  onClick={() =>
                    setFilters({
                      search: '',
                      certFilter: '',
                      supplierFilter: '',
                    })
                  }
                >
                  <Eraser size={14} />
                  Reset
                </button>
              )}

              <button
                type="button"
                className="registry-btn registry-btn--export"
                onClick={() => {
                  setExportMode('excel');
                  setExportOpen(true);
                }}
              >
                <FileSpreadsheet size={14} />
                Export Excel
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
                {filteredRecords.length} rows · choose columns on export
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
                records={filteredRecords}
                schema={activeSchema}
                visibleKeys={visibleKeys}
                onRowClick={setProfileRecord}
                isFiltered={hasActiveFilters}
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
        records={filteredRecords}
        siteName={siteName}
        siteId={currentSite}
        year={currentYear}
        filters={filters}
        initialKeys={visibleKeys}
      />
    </div>
  );
}
