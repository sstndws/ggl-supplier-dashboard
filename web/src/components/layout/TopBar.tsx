export default function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex h-[52px] items-center px-5"
      style={{ background: '#8B1A1A', boxShadow: '0 1px 0 rgba(0,0,0,0.12)' }}
    >
      <div className="flex items-center gap-3">
        <img
          src="/favicon.svg"
          alt=""
          width={28}
          height={28}
          className="rounded-md"
          aria-hidden
        />
        <span className="text-[15px] font-semibold text-white">GGL Dashboard</span>
      </div>
    </header>
  );
}
