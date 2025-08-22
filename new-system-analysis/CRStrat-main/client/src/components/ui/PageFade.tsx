import React from "react";

interface PageFadeProps {
  children: React.ReactNode;
}

export function PageFade({ children }: PageFadeProps) {
  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}