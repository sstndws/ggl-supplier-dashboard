import { ArrowLeft, PanelLeftClose, PanelLeftOpen, Table2 } from 'lucide-react';
import { useState } from 'react';

const PORTAL_HUB_URL = 'https://sustainability-hub-portal-eight.vercel.app/';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className={`app-sidebar${expanded ? ' is-expanded' : ''}`}>
      <button
        type="button"
        className="app-sidebar__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      <div className="app-sidebar__section">Registry</div>

      <nav className="app-sidebar__nav" aria-label="Navigasi utama">
        <button
          type="button"
          className="app-sidebar__item is-active"
          data-tip="Supplier Registry"
          title="Supplier Registry"
        >
          <span className="app-sidebar__icon">
            <Table2 size={16} strokeWidth={1.8} />
          </span>
          <span className="app-sidebar__label">Supplier Registry</span>
        </button>
      </nav>

      <div className="app-sidebar__spacer" />

      <div className="app-sidebar__footer">
        <a
          href={PORTAL_HUB_URL}
          className="app-sidebar__item app-sidebar__item--portal"
          data-tip="Back to Portal Hub"
          title="Back to Portal Hub"
        >
          <span className="app-sidebar__icon">
            <ArrowLeft size={16} strokeWidth={1.8} />
          </span>
          <span className="app-sidebar__label">Back to Portal Hub</span>
        </a>
      </div>
    </aside>
  );
}
