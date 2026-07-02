export default function TopBar() {
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
    </header>
  );
}
