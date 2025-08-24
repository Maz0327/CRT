declare module 'pdf-parse';
declare module '@mozilla/readability';
declare module 'node-cron';
declare module '@google-cloud/vision';
declare module "node-cron" { export interface ScheduledTask { destroy(): void; } }
// --- central ambient module declarations ---
declare module 'pdf-parse';
declare module '@mozilla/readability';
// (kept for completeness; we added earlier but append harmlessly)
declare module '@google-cloud/vision';
