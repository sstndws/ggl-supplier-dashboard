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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSiteId('');
    setSiteName('');
    setError('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(siteId.trim().toUpperCase(), siteName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save site.');
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
      aria-label="Add new site"
    >
      <div className="add-site-modal">
        <div className="add-site-modal__head">
          <div>
            <h2>Add Site</h2>
            <p>Create a new supplier site for the registry dashboard.</p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form className="add-site-modal__form" onSubmit={handleSubmit}>
          <div className="add-site-field">
            <label htmlFor="add-site-id">Site ID</label>
            <input
              id="add-site-id"
              className="sp-input"
              placeholder="e.g. EUP"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="add-site-field">
            <label htmlFor="add-site-name">Site Name</label>
            <input
              id="add-site-name"
              className="sp-input"
              placeholder="e.g. EUP - Cangkang"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{ color: '#b42318', fontSize: 13, margin: '4px 0 0' }}
            >
              {error}
            </p>
          )}

          <div className="add-site-modal__actions">
            <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="sp-btn sp-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
