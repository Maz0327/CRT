// @ts-nocheck
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

// Hover Scale Button
export const HoverScaleButton = ({ 
  children, 
  className,
  onClick,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <motion.button
      className={cn("relative overflow-hidden", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.button>
  );
};

// Magnetic Button
export const MagneticButton = ({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Ripple Click Effect
export const RippleButton = ({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);

    props.onClick?.(e);
  };

  return (
    <button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0 }}
          animate={{ 
            width: 300, 
            height: 300, 
            x: -150, 
            y: -150,
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      {children}
    </button>
  );
};

// Shake Animation
export const ShakeOnError = ({ 
  children, 
  trigger,
  className 
}: { 
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 },
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
};

// Success Check Animation
export const SuccessCheck = ({ show }: { show: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-6 h-6"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <motion.path
          d="M5 12l5 5L20 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={show ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </svg>
    </motion.div>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
        className
      )}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Tooltip with Animation
export const AnimatedTooltip = ({ 
  children, 
  content,
  className 
}: { 
  children: React.ReactNode;
  content: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded pointer-events-none z-50",
          className
        )}
        initial={{ opacity: 0, y: 5 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
        transition={{ duration: 0.2 }}
      >
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
      </motion.div>
    </div>
  );
};

// Glow Effect on Hover
export const GlowCard = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover="hover"
    >
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-300"
        variants={{
          hover: { opacity: 0.6 },
        }}
      />
      <div className="relative bg-card rounded-lg p-4">
        {children}
      </div>
    </motion.div>
  );
};

// Number Counter Animation
export const AnimatedCounter = ({ 
  value, 
  duration = 1 
}: { 
  value: number;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const currentValue = Math.floor(progress * value);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    updateCounter();
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// Confetti Burst
export const ConfettiBurst = ({ trigger }: { trigger: boolean }) => {
  const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
  
  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: Math.random() * 0.1,
          }}
        />
      ))}
    </div>
  );
};