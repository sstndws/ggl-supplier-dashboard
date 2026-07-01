import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-3 transition-colors',
        'focus:outline-none focus:border-maroon-500/40 focus:ring-4 focus:ring-maroon-600/8',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
export default Input;
