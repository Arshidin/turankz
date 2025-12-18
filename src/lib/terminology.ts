/**
 * Platform Terminology
 * Turan Standard Pool v1.2
 * 
 * Consistent terminology ensures users understand concepts
 * across all roles and pages without confusion.
 * 
 * IMPORTANT: All pricing terminology uses reference-based, market-driven language
 * to avoid any interpretation of price fixing or mandatory pricing.
 * 
 * RULE: Avoid synonyms that may confuse users.
 */

// ============================================================================
// PRICING TERMINOLOGY - Reference-based, Market-driven
// ============================================================================

export const PRICING_TERMS = {
  // Core terminology renames
  PRICE_GRID: 'Reference Price Grid',
  BASE_PRICE: 'Reference Price',
  FINAL_PRICE: 'Indicative Settlement Price',
  PRICING_ENGINE: 'Reference Pricing & Premiums Engine',
  PRICE_CALCULATION: 'Indicative Price Calculation',
  PRICE_PER_KG: 'Indicative price per kg (market-based)',
  
  // Admin actions
  EDIT_PRICE: 'Update Reference Benchmark',
  ACTIVATE_GRID: 'Activate Reference Grid (Indicative)',
  
  // Short forms for UI
  REF_PRICE: 'Ref. Price',
  IND_PRICE: 'Ind. Price',
} as const;

export const PRICING_DESCRIPTIONS = {
  REFERENCE_GRID: 'Indicative market benchmarks for live cattle pricing',
  REFERENCE_PRICE: 'Market-oriented benchmark price (indicative only)',
  INDICATIVE_SETTLEMENT: 'Estimated price based on current reference grid and premiums',
  PREMIUM_NATURE: 'Incentive-based premiums earned for compliance with standards, predictability, and discipline',
} as const;

/**
 * Standard disclaimer to display wherever pricing appears.
 * Required for legal and antitrust compliance.
 */
export const PRICING_DISCLAIMER = {
  FULL: 'Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery based on market conditions. TURAN does not set, enforce, or guarantee transaction prices. Participation is voluntary.',
  COMPACT: 'Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery.',
  PREMIUM: 'Incentive-based premiums earned for compliance with standards, predictability, and discipline.',
} as const;

// ============================================================================
// STATUS LABELS - Use these exact labels everywhere
// ============================================================================

export const STATUS_LABELS = {
  FORECAST: 'Forecast',
  SOFT_COMMITTED: 'Soft Committed',
  CONFIRMED: 'Confirmed',
} as const;

export const STATUS_DESCRIPTIONS = {
  FORECAST: 'Planned availability',
  SOFT_COMMITTED: 'Likely available, pending final confirmation',
  CONFIRMED: 'Ready for matching',
} as const;

// ============================================================================
// POOL & MATCHING TERMINOLOGY
// ============================================================================

export const POOL_TERMS = {
  MATCHING_WINDOW: 'Matching Window',
  POOL_REQUEST: 'Pool Request',
  PURCHASE_POOL: 'Purchase Pool',
  READINESS: 'Readiness',
  FILL_RATE: 'Fill Rate',
  TARGET_WEEK: 'Target Week',
} as const;

export const POOL_DESCRIPTIONS = {
  MATCHING_WINDOW: 'The period during which supply and demand are matched into pools',
  POOL_REQUEST: 'A formal request for livestock supply submitted by an MPK',
  READINESS: 'The commitment level of a batch (Forecast → Soft Committed → Confirmed)',
  FILL_RATE: 'Percentage of requested volume that has been matched',
  TARGET_WEEK: 'The week when livestock delivery is expected',
} as const;

// ============================================================================
// ENTITY TERMINOLOGY
// ============================================================================

export const ENTITY_TERMS = {
  FARMER: 'Farmer',
  MPK: 'MPK', // Meat Processing Plant
  MPK_FULL: 'Meat Processing Plant',
  ADMIN: 'Admin',
  BATCH: 'Batch',
  SUPPLY: 'Supply',
  DEMAND: 'Demand',
} as const;

// ============================================================================
// ACTION TERMINOLOGY
// ============================================================================

export const ACTION_TERMS = {
  DECLARE: 'Declare',
  ESCALATE: 'Escalate',
  CONFIRM: 'Confirm',
  DECLINE: 'Decline',
  EXPRESS_INTEREST: 'Express Interest',
  ADD_TO_WATCHLIST: 'Add to Watchlist',
  CREATE_REQUEST: 'Create Request',
  PROPOSE_MATCH: 'Propose Match',
  MARK_FULFILLED: 'Mark Fulfilled',
} as const;

// ============================================================================
// PAGE TITLES - Consistent across roles
// ============================================================================

export const PAGE_TITLES = {
  // Farmer pages
  FARMER_OVERVIEW: 'Overview',
  LIVESTOCK_BATCHES: 'Livestock Batches',
  SALES_CALENDAR: 'Sales Calendar',
  FARMER_PROFILE: 'Profile',
  
  // MPK pages
  MARKET_OVERVIEW: 'Market Overview',
  WATCHLIST: 'Watchlist',
  PURCHASE_POOL_REQUESTS: 'Purchase Pool Requests',
  MPK_PROFILE: 'Profile',
  
  // Admin pages
  PLATFORM_OVERVIEW: 'Platform Overview',
  POOL_MATCHING: 'Pool Matching',
  FARMER_MANAGEMENT: 'Farmer Management',
  MPK_MANAGEMENT: 'MPK Management',
  REFERENCE_PRICE_GRID: 'Reference Price Grid',
} as const;

export const PAGE_DESCRIPTIONS = {
  // Farmer pages
  FARMER_OVERVIEW: 'Your supply summary and pending actions',
  LIVESTOCK_BATCHES: 'Declare supply availability and signal readiness for pool matching',
  SALES_CALENDAR: 'Plan your supply timeline and track readiness progression',
  FARMER_PROFILE: 'Your account information and grading status',
  
  // MPK pages
  MARKET_OVERVIEW: 'Review available supply by readiness status and region',
  WATCHLIST: 'Monitor regions and supply for potential pool requests',
  PURCHASE_POOL_REQUESTS: 'Monitor procurement progress and manage request parameters',
  MPK_PROFILE: 'Your account information and demand status',
  
  // Admin pages
  PLATFORM_OVERVIEW: 'System health, supply vs demand, and items requiring attention',
  POOL_MATCHING: 'Coordinate supply and demand to form matched pools',
  FARMER_MANAGEMENT: 'Manage farmer base, control access, and enforce discipline through grading',
  MPK_MANAGEMENT: 'Control onboarding, visibility, and demand discipline of processing plants',
  REFERENCE_PRICE_GRID: 'Manage indicative reference prices for market benchmarking',
} as const;

// ============================================================================
// GRADING TERMINOLOGY
// ============================================================================

export const GRADING_LABELS = {
  OBSERVER: 'Observer',
  DECLARED_SUPPLIER: 'Declared Supplier',
  STANDARD_SUPPLIER: 'Standard Supplier',
} as const;

export const GRADING_DESCRIPTIONS = {
  OBSERVER: 'Can view platform, cannot participate in pools',
  DECLARED_SUPPLIER: 'Can declare batches, limited pool participation',
  STANDARD_SUPPLIER: 'Full pool participation with priority matching',
} as const;

// ============================================================================
// RELIABILITY TERMINOLOGY
// ============================================================================

export const RELIABILITY_LABELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;
