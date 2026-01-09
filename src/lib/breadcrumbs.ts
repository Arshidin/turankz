/**
 * Breadcrumb Generation Utilities
 *
 * Provides functions to generate consistent breadcrumbs across the platform.
 * Breadcrumbs follow the pattern: Home > Section > Subsection > Current Page
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Generate breadcrumbs for farmer pages
 */
export function getFarmerBreadcrumbs(currentPage: string, customLabel?: string): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [
    { label: 'Home', href: '/farmer' },
  ];

  const pages: Record<string, BreadcrumbItem> = {
    profile: { label: customLabel || 'Profile' },
    batches: { label: customLabel || 'Livestock Batches', href: '/farmer/batches' },
    'batch-detail': { label: customLabel || 'Batch Details' },
    'sales-calendar': { label: customLabel || 'Sales Calendar' },
    'market-intent': { label: customLabel || 'Market Intent' },
    'herd-structure': { label: customLabel || 'Herd Structure' },
    deliveries: { label: customLabel || 'Deliveries' },
    'market-signals': { label: customLabel || 'Market Signals' },
  };

  // Special cases with parent pages
  if (currentPage === 'batch-detail') {
    base.push({ label: 'Livestock Batches', href: '/farmer/batches' });
  }

  if (pages[currentPage]) {
    base.push(pages[currentPage]);
  }

  return base;
}

/**
 * Generate breadcrumbs for MPK pages
 */
export function getMpkBreadcrumbs(currentPage: string, customLabel?: string): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [
    { label: 'Home', href: '/mpk' },
  ];

  const pages: Record<string, BreadcrumbItem> = {
    profile: { label: customLabel || 'Profile' },
    'market-overview': { label: customLabel || 'Market Overview' },
    requests: { label: customLabel || 'Purchase Pool Requests', href: '/mpk/requests' },
    'request-detail': { label: customLabel || 'Request Details' },
    deliveries: { label: customLabel || 'Deliveries' },
    watchlist: { label: customLabel || 'Watchlist' },
  };

  // Special cases with parent pages
  if (currentPage === 'request-detail') {
    base.push({ label: 'Purchase Pool Requests', href: '/mpk/requests' });
  }

  if (pages[currentPage]) {
    base.push(pages[currentPage]);
  }

  return base;
}

/**
 * Generate breadcrumbs for admin pages
 */
export function getAdminBreadcrumbs(currentPage: string, customLabel?: string): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin' },
  ];

  const pages: Record<string, BreadcrumbItem> = {
    // User Management
    farmers: { label: customLabel || 'Farmers Management', href: '/admin/farmers' },
    mpks: { label: customLabel || 'MPK Management', href: '/admin/mpks' },

    // Pool & Matching
    'pool-matching': { label: customLabel || 'Pool Matching' },
    'matching-windows': { label: customLabel || 'Matching Windows' },

    // Operations
    executions: { label: customLabel || 'Execution Management' },
    settlements: { label: customLabel || 'Settlement Management' },
    'offtake-registry': { label: customLabel || 'Offtake Registry' },

    // Configuration
    'price-grid': { label: customLabel || 'Price Grid Management' },
    'grading-status': { label: customLabel || 'Grading Status' },

    // Monitoring
    'activity-log': { label: customLabel || 'Activity Audit Log' },
    'market-intent': { label: customLabel || 'Market Intent Overview' },
    'herd-overview': { label: customLabel || 'National Herd Overview' },
  };

  if (pages[currentPage]) {
    base.push(pages[currentPage]);
  }

  return base;
}

/**
 * Generate breadcrumbs for auth pages
 */
export function getAuthBreadcrumbs(currentPage: string): BreadcrumbItem[] {
  const pages: Record<string, BreadcrumbItem> = {
    login: { label: 'Login' },
    'role-selection': { label: 'Role Selection' },
    'farmer-registration': { label: 'Farmer Registration' },
    'mpk-registration': { label: 'MPK Registration' },
    'pending-activation': { label: 'Pending Activation' },
  };

  return pages[currentPage] ? [pages[currentPage]] : [];
}

/**
 * Helper to generate breadcrumbs based on role and page
 */
export function generateBreadcrumbs(
  role: 'farmer' | 'mpk' | 'admin' | 'auth',
  currentPage: string,
  customLabel?: string
): BreadcrumbItem[] {
  switch (role) {
    case 'farmer':
      return getFarmerBreadcrumbs(currentPage, customLabel);
    case 'mpk':
      return getMpkBreadcrumbs(currentPage, customLabel);
    case 'admin':
      return getAdminBreadcrumbs(currentPage, customLabel);
    case 'auth':
      return getAuthBreadcrumbs(currentPage);
    default:
      return [];
  }
}
