import { MatchLevel } from '@/lib/livestock-criteria';
import { MatchConfidence } from '@/lib/matching-validation';

export interface SupplyBlock {
  id: string;
  batchRef: string;
  region: string;
  readiness: 'confirmed' | 'soft_committed' | 'forecast';
  grade: string;
  heads: number;
  available_heads: number; // Available volume after existing matchings
  matched_heads: number; // Already matched volume
  target_week: string; // Target week for delivery
  delivery_period: 'short_term' | 'mid_term' | 'long_term' | null; // Delivery period
  // Livestock criteria
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  // Standard status
  standard_status: string | null;
  // Computed match level (legacy)
  matchLevel?: MatchLevel;
  // Match confidence score (new - Sprint 6)
  matchConfidence?: MatchConfidence | null;
}
