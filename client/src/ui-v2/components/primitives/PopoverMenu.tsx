import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopoverMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
}

export function PopoverMenu({ trigger, children }: PopoverMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute top-full left-0 mt-2 min-w-[200px] z-20 frost-card rounded-lg shadow-lg border border-white/10"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="py-2">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PopoverMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  destructive?: boolean;
}

export function PopoverMenuItem({ children, onClick, icon, destructive }: PopoverMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center gap-2 ${
        destructive ? 'text-red-400 hover:text-red-300' : 'text-ink'
      }`}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span>{children}</span>
    </button>
  );
}