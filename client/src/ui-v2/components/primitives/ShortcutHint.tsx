import { cn } from '../../../lib/utils';

interface ShortcutHintProps {
  keys: string[];
  className?: string;
}

export function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded border border-white/20">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-xs text-ink/50">+</span>}
        </span>
      ))}
    </div>
  );
}