export function getSiteUrl() {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
}