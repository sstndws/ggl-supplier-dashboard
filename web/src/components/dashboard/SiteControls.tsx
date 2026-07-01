import type { Site } from '@/types';
import { Calendar, ChevronDown, MapPin, Plus } from 'lucide-react';

export default function SiteControls({
  sites,
  currentSite,
  years,
  currentYear,
  onSiteChange,
  onYearChange,
  onAddSite,
}: {
  sites: Site[];
  currentSite: string;
  years: string[];
  currentYear: string;
  onSiteChange: (id: string) => void;
  onYearChange: (year: string) => void;
  onAddSite: () => void;
}) {
  const yearOptions = years.length ? years : ['2024', '2025', '2026'];

  return (
    <div className="dashboard-selects">
      <div className="dashboard-select-field">
        <label className="dashboard-select-label" htmlFor="site-select">
          Site
        </label>
        <div className="dashboard-select-wrap">
          <MapPin className="dashboard-select-icon" size={15} aria-hidden />
          <select
            id="site-select"
            className="dashboard-select"
            value={currentSite}
            onChange={(e) => onSiteChange(e.target.value)}
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <ChevronDown className="dashboard-select-chevron" size={15} aria-hidden />
        </div>
      </div>

      <div className="dashboard-select-field">
        <label className="dashboard-select-label" htmlFor="year-select">
          Year
        </label>
        <div className="dashboard-select-wrap">
          <Calendar className="dashboard-select-icon" size={15} aria-hidden />
          <select
            id="year-select"
            className="dashboard-select"
            value={currentYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="dashboard-select-chevron" size={15} aria-hidden />
        </div>
      </div>

      <button type="button" className="dashboard-add-site" onClick={onAddSite}>
        <Plus size={14} strokeWidth={2.2} />
        Add site
      </button>
    </div>
  );
}
