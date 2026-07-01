import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

export default function AddSiteModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (siteId: string, siteName: string) => Promise<void>;
}) {
  const [siteId, setSiteId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSiteId('');
    setSiteName('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(siteId.trim().toUpperCase(), siteName.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="supplier-profile-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Tambah site baru"
    >
      <div className="add-site-modal">
        <div className="add-site-modal__head">
          <div>
            <h2>Tambah Site</h2>
            <p>Buat site supplier baru untuk registry dashboard.</p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        <form className="add-site-modal__form" onSubmit={handleSubmit}>
          <div className="add-site-field">
            <label htmlFor="add-site-id">Site ID</label>
            <input
              id="add-site-id"
              className="sp-input"
              placeholder="Contoh: EUP"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="add-site-field">
            <label htmlFor="add-site-name">Nama Site</label>
            <input
              id="add-site-name"
              className="sp-input"
              placeholder="Contoh: EUP - Cangkang"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />
          </div>

          <div className="add-site-modal__actions">
            <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sp-btn sp-btn-primary" disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
