export function getAuthRedirectUrl(): string {
  const siteUrl = (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, "");
  // If app uses HashRouter, routes live after "/#/"
  // Detect at runtime to be safe across Replit/localhost
  const usesHash = window.location.href.includes("/#/");
  return usesHash ? `${siteUrl}/#/auth/callback` : `${siteUrl}/auth/callback`;
}