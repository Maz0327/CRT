// client/src/components/ui/sonner.tsx
export const toast = (o: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
  console.log(`[toast:${o.variant || 'default'}] ${o.title || ''} ${o.description || ''}`);
};
export const Toaster = () => null;
export { Toaster as Sonner };