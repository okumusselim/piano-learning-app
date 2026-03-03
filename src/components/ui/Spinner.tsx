interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`
          ${sizeClasses[size]}
          border-4 border-amber-200 border-t-amber-500
          rounded-full animate-spin
        `}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <p className="text-brown-600 text-sm font-medium">{label}</p>}
    </div>
  );
}
