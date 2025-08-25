import { ReactNode, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 300,
  direction = "up" 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up": return "translateY(20px)";
        case "down": return "translateY(-20px)";
        case "left": return "translateX(20px)";
        case "right": return "translateX(-20px)";
        default: return "none";
      }
    }
    return "none";
  };

  return (
    <div
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredFadeInProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemDelay?: number;
}

export function StaggeredFadeIn({ 
  children, 
  className, 
  staggerDelay = 100,
  itemDelay = 0 
}: StaggeredFadeInProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn 
          key={index} 
          delay={itemDelay + (index * staggerDelay)}
          direction="up"
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
}