import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({ 
  tags, 
  onChange, 
  placeholder = 'Add tags...', 
  suggestions = [],
  className 
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="glass rounded-lg p-2 md:p-3 min-h-[40px] md:min-h-[44px] flex flex-wrap items-center gap-1 md:gap-2 overflow-hidden glass-shadow focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-200">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs md:text-sm flex-shrink-0 font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-blue-500/30 rounded p-0.5 transition-all duration-200 touch-target flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(input.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent outline-none text-xs md:text-sm min-w-[60px] md:min-w-[100px] leading-relaxed"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 glass rounded-lg p-2 z-50 depth-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-2 py-1 rounded hover:frost-subtle text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}