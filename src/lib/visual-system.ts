/**
 * TURAN STANDARD POOL - VISUAL SYSTEM
 * 
 * This file documents the visual language and design principles
 * for the platform. Reference this when building new components.
 * 
 * Core Principles:
 * - Discipline, predictability, and control
 * - Institutional, not startup/marketplace aesthetic
 * - Calm, restrained, enterprise-grade
 */

/* ===========================================
   READINESS STATUS SYSTEM
   
   Global status labels used everywhere:
   - Forecast → neutral gray (not urgent)
   - Soft Committed → amber (pending action)
   - Confirmed → green (stable/complete)
   - Delivered → teal (final state)
   
   IMPORTANT: Never use red for normal states.
   Red is reserved for Admin risk flags only.
   =========================================== */

export const READINESS_LABELS = {
  forecast: 'Forecast',
  soft_committed: 'Soft Committed',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
} as const;

export const READINESS_DESCRIPTIONS = {
  forecast: 'Initial supply declaration, not yet actionable',
  soft_committed: 'Pending confirmation, eligible for matching',
  confirmed: 'Ready for pool matching and delivery',
  delivered: 'Completed and delivered',
} as const;

/* ===========================================
   FARMER GRADING SYSTEM
   
   Observer → Declared Supplier → Standard Supplier
   
   Visually secondary to readiness status.
   Use compact badges, muted colors.
   =========================================== */

export const GRADING_LABELS = {
  observer: 'Observer',
  declared_supplier: 'Declared Supplier',
  standard_supplier: 'Standard Supplier',
} as const;

export const GRADING_DESCRIPTIONS = {
  observer: 'Monitoring platform, not eligible for matching',
  declared_supplier: 'Eligible for pool invitations',
  standard_supplier: 'Priority matching and full platform access',
} as const;

/* ===========================================
   MPK STATUS SYSTEM
   
   Active / Restricted / Inactive
   
   Muted colors, not alerting.
   Clear on profile and admin screens.
   =========================================== */

export const MPK_STATUS_LABELS = {
  active: 'Active',
  restricted: 'Restricted',
  inactive: 'Inactive',
} as const;

export const MPK_STATUS_DESCRIPTIONS = {
  active: 'Full platform access and request capabilities',
  restricted: 'Limited request capabilities due to demand patterns',
  inactive: 'Account paused or suspended',
} as const;

/* ===========================================
   POOL REQUEST STATUS
   
   Pending → Partial → Fulfilled / Cancelled
   =========================================== */

export const POOL_STATUS_LABELS = {
  pending: 'Pending',
  partial: 'Partial',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
} as const;

/* ===========================================
   ADMIN SIGNALS
   
   Risk flags - these are the ONLY places
   where red should appear in the UI.
   
   - Risk: Red (admin alerts only)
   - Warning: Amber (attention needed)
   - Positive: Green (on track)
   =========================================== */

export const SIGNAL_LABELS = {
  risk: 'At Risk',
  warning: 'Attention',
  positive: 'On Track',
} as const;

/* ===========================================
   BUTTON ACTION CATEGORIES
   
   Primary Actions (prominent):
   - Confirm
   - Express Interest
   - Create Pool Request
   
   Secondary Actions (outline/ghost):
   - Edit
   - Update
   - Add to Watchlist
   
   Destructive/Restrictive (Admin only):
   - Downgrade
   - Restrict
   - Remove
   =========================================== */

export const ACTION_CATEGORIES = {
  primary: ['confirm', 'express_interest', 'create_request', 'propose_match'],
  secondary: ['edit', 'update', 'add_to_watchlist', 'view_details', 'adjust'],
  destructive: ['downgrade', 'restrict', 'remove', 'cancel'],
} as const;

/* ===========================================
   MICROCOPY GUIDELINES
   
   - Short, factual phrases
   - Avoid motivational or advisory language
   - No exclamation marks
   - No emojis
   =========================================== */

export const MICROCOPY_EXAMPLES = {
  // Eligibility
  eligible: 'Eligible for pool invitations',
  not_eligible: 'Not eligible for matching',
  
  // Actions needed
  requires_confirmation: 'Requires confirmation before matching window',
  action_required: 'Action required',
  
  // Pool status
  included_in_pool: 'Included in active pool request',
  pending_review: 'Pending admin review',
  
  // Matching
  on_track: 'Matching on track',
  at_risk: 'Below target fill rate',
  
  // Time-based
  days_remaining: (days: number) => `${days} days remaining`,
  window_approaching: 'Matching window approaching',
} as const;

/* ===========================================
   LAYOUT GUIDELINES
   
   Tables vs Cards:
   - Tables: Operational data (batches, requests, matches)
   - Cards: Summaries and signals (stats, alerts, status)
   
   Alignment:
   - Numbers: Right-aligned, tabular-nums
   - Dates: Right-aligned, muted color
   - Status: Center-aligned
   - Text: Left-aligned
   
   Avoid:
   - Decorative elements
   - Illustrations
   - Complex charts (simple bars/counts only)
   =========================================== */

export const LAYOUT_RULES = {
  useTableFor: ['batches', 'requests', 'matches', 'farmers', 'mpks'],
  useCardsFor: ['summaries', 'statistics', 'alerts', 'quick-actions'],
  avoidElements: ['illustrations', 'decorative-icons', 'complex-charts', 'animations'],
} as const;
