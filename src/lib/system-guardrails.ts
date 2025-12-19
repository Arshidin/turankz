/**
 * SYSTEM GUARDRAILS - Batch FSM Protection
 * 
 * This file documents the architectural guardrails that prevent confusion
 * between informational data and market operations.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CARDINAL RULES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. HERD STRUCTURE NEVER AUTO-GENERATES BATCHES
 *    - Herd structure is structural/capacity data only
 *    - It represents what a farmer COULD potentially sell, not market intent
 *    - Used for national planning and forecasting, not matching
 * 
 * 2. MARKET INTENT NEVER AUTO-GENERATES BATCHES
 *    - Market intents are non-binding signals only
 *    - They help with demand/supply planning visibility
 *    - They do NOT create commitments or participate in matching
 * 
 * 3. BATCH CREATION REQUIRES EXPLICIT FARMER ACTION
 *    - A farmer must explicitly create a batch via the Batches page
 *    - No system process can auto-create batches from other data
 *    - This ensures intentionality and accountability
 * 
 * 4. BATCH FSM IS THE ONLY GATEWAY TO MATCHING
 *    - Only batches in appropriate FSM states can be matched
 *    - The batch lifecycle (Draft → Forecast → Soft Committed → Confirmed → Matched)
 *      is the exclusive path to pool matching
 *    - No shortcuts exist to bypass this progression
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * UI SEPARATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The farmer navigation is divided into two distinct sections:
 * 
 * DATA & OUTLOOK (Informational)
 *   - Herd Structure: Structural capacity snapshots
 *   - Market Intent: Non-binding availability signals
 *   → These NEVER create market commitments
 *   → These NEVER participate in matching
 * 
 * MARKET OPERATIONS (Binding)
 *   - Livestock Batches: Official supply declarations
 *   - Sales Calendar: Delivery timeline management
 *   → These ARE the path to market participation
 *   → These follow the Batch FSM lifecycle
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPLEMENTATION NOTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - All forecasts derived from herd data are marked "indicative/non-binding"
 * - Market intent pages display clear disclaimers about non-binding nature
 * - Batch creation dialogs emphasize the commitment being made
 * - The matching system only queries the batches table, never herd/intent data
 */

export const GUARDRAIL_MESSAGES = {
  herdStructure: {
    title: 'Structural Data Only',
    message: 'Structural livestock data does not imply market availability. Only confirmed batches are eligible for matching.',
  },
  marketIntent: {
    title: 'Non-Binding Intent',
    message: 'Market intents are voluntary signals only. They do not create batches, commitments, or participate in matching. Only confirmed batches are eligible for pool matching.',
  },
  forecast: {
    title: 'Indicative / Non-binding Forecast',
    message: 'This forecast is based on structural data and reference coefficients. It does not create any market commitments and is not linked to pricing or matching.',
  },
  batchCreation: {
    title: 'Creating a Market Commitment',
    message: 'By creating a batch, you are declaring market availability. Confirmed batches become eligible for pool matching.',
  },
} as const;

export type GuardrailType = keyof typeof GUARDRAIL_MESSAGES;

/**
 * Validates that a batch is being created through proper channels.
 * This is a runtime check to ensure no batch creation bypasses the farmer action.
 */
export function validateBatchCreationSource(source: string): boolean {
  const validSources = [
    'farmer-batches-page',
    'new-batch-dialog',
    'batch-wizard',
  ];
  return validSources.includes(source);
}
