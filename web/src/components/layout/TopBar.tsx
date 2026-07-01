export default function TopBar({ onLogout }: { onLogout: () => void }) {
  const user = JSON.parse(localStorage.getItem('ggl_session_user') || '{}');

  return (
    <header
      className="sticky top-0 z-40 flex h-[52px] items-center justify-between px-5"
      style={{ background: '#8B1A1A', boxShadow: '0 1px 0 rgba(0,0,0,0.12)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.6" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.6" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.4" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-white">GGL Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-white/85 sm:block">{user.email}</span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
        >
          Sign out
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.25)' }}
        >
          {(user.name || user.email || 'G').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
