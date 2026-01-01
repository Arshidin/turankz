/**
 * Hostname Detection Utility
 * 
 * Detects if the current request is for the docs subdomain
 * and provides routing logic for subdomain-based routing
 */

export function isDocsSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  // Check if hostname is docs subdomain
  if (window.location.hostname === 'docs.turanstandard.kz') {
    return true;
  }
  // For local development, check if path starts with /docs
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.pathname.startsWith('/docs');
  }
  return false;
}

export function getDocsBasePath(): string {
  if (typeof window === 'undefined') return '/docs';
  // For production subdomain, base path is root
  if (window.location.hostname === 'docs.turanstandard.kz') {
    return '';
  }
  // For local development or main domain, use /docs prefix
  // This allows testing docs on main domain with /docs path
  return '/docs';
}

