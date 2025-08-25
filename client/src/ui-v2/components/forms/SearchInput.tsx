import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className,
  debounceMs = 300 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-ink/50 pointer-events-none icon-center">
        <Search className="w-4 h-4 stroke-1" />
      </div>
      
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-2.5 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm leading-relaxed shadow-sm focus:shadow-md"
      />
      
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink/80 transition-colors icon-container-sm flex-shrink-0"
        >
          <X className="w-4 h-4 stroke-1" />
        </button>
      )}
    </div>
  );
}