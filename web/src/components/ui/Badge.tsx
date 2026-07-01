import { cn } from '@/lib/utils';

type Tone = 'green' | 'red' | 'amber' | 'gray' | 'blue';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  gray: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
  blue: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
};

export default function Badge({
  children,
  tone = 'gray',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function certBadge(cert?: string) {
  const value = (cert || '').trim();
  const lower = value.toLowerCase();
  if (!value || lower.includes('none') || lower === 'no data' || lower === '-')
    return <Badge tone="red">No Cert</Badge>;
  if (lower.includes('rspo') || lower.includes('ispo') || lower.includes('mspo'))
    return <Badge tone="green">{value}</Badge>;
  return <Badge tone="amber">{value}</Badge>;
}

export function supplierBadge(type?: string) {
  if (!type) return <Badge tone="gray">—</Badge>;
  return (
    <Badge tone={type.toLowerCase().includes('baru') ? 'amber' : 'green'}>
      {type}
    </Badge>
  );
}
