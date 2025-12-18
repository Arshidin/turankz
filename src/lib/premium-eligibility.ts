import { PremiumSetting } from '@/hooks/usePremiums';

export interface PremiumEligibility {
  type: 'standard' | 'predictability' | 'volume_consistency' | 'reliability';
  levelKey: string;
  levelName: string;
  value: number;
  eligible: boolean;
  reason: string;
}

export interface PremiumBreakdown {
  basePricePerKg: number;
  premiums: PremiumEligibility[];
  totalPremium: number;
  totalPricePerKg: number;
}

export interface BatchPremiumContext {
  // Batch info
  batchId: string;
  standardStatus: string; // 'non_standard' | 'standard' | 'high_standard'
  confirmedAt: string | null;
  hasPostConfirmationEdits: boolean;
  
  // Farmer info
  farmerId: string;
  farmerGrading: string; // 'observer' | 'declared_supplier' | 'standard_supplier'
  farmerReliability: string; // 'high' | 'medium' | 'low'
  totalFulfilledBatches: number;
  deliveryRate: number; // 0-100
  monthsActive: number;
  
  // Matching window info
  matchingWindowLockDate: string | null;
}

// Check if batch qualifies for standard compliance premium
export function evaluateStandardCompliance(
  premiums: PremiumSetting[],
  standardStatus: string
): PremiumEligibility {
  const matchedPremium = premiums.find(p => p.level_key === standardStatus && p.is_active);
  
  if (matchedPremium && matchedPremium.premium_value > 0) {
    return {
      type: 'standard',
      levelKey: matchedPremium.level_key,
      levelName: matchedPremium.level_name,
      value: matchedPremium.premium_value,
      eligible: true,
      reason: `Batch meets ${matchedPremium.level_name} criteria`,
    };
  }
  
  return {
    type: 'standard',
    levelKey: standardStatus,
    levelName: 'Non-Standard',
    value: 0,
    eligible: false,
    reason: 'Batch does not meet standard compliance criteria',
  };
}

// Check if batch qualifies for predictability premium
export function evaluatePredictability(
  premiums: PremiumSetting[],
  confirmedAt: string | null,
  lockDate: string | null,
  hasEdits: boolean
): PremiumEligibility {
  if (!confirmedAt) {
    return {
      type: 'predictability',
      levelKey: 'late_confirmation',
      levelName: 'Not Confirmed',
      value: 0,
      eligible: false,
      reason: 'Batch not yet confirmed',
    };
  }

  const confirmedDate = new Date(confirmedAt);
  const lockDateTime = lockDate ? new Date(lockDate) : null;
  
  // Early confirmation: confirmed before lock date AND no edits
  if (lockDateTime && confirmedDate < lockDateTime && !hasEdits) {
    const earlyPremium = premiums.find(p => p.level_key === 'early_confirmation' && p.is_active);
    if (earlyPremium) {
      return {
        type: 'predictability',
        levelKey: 'early_confirmation',
        levelName: earlyPremium.level_name,
        value: earlyPremium.premium_value,
        eligible: true,
        reason: 'Confirmed before lock date with no edits',
      };
    }
  }
  
  // Standard confirmation: confirmed during window, minor edits allowed
  if (lockDateTime && confirmedDate <= lockDateTime) {
    const standardPremium = premiums.find(p => p.level_key === 'standard_confirmation' && p.is_active);
    if (standardPremium) {
      return {
        type: 'predictability',
        levelKey: 'standard_confirmation',
        levelName: standardPremium.level_name,
        value: standardPremium.premium_value,
        eligible: true,
        reason: hasEdits ? 'Confirmed during window with minor edits' : 'Confirmed during matching window',
      };
    }
  }
  
  // Late confirmation
  const latePremium = premiums.find(p => p.level_key === 'late_confirmation' && p.is_active);
  return {
    type: 'predictability',
    levelKey: 'late_confirmation',
    levelName: latePremium?.level_name || 'Late Confirmation',
    value: latePremium?.premium_value || 0,
    eligible: false,
    reason: 'Late confirmation or multiple post-confirmation edits',
  };
}

// Check if farmer qualifies for volume consistency premium
export function evaluateVolumeConsistency(
  premiums: PremiumSetting[],
  fulfilledBatches: number,
  deliveryRate: number,
  monthsActive: number
): PremiumEligibility {
  // Platinum: 10+ batches, 95%+ delivery, 12+ months
  if (fulfilledBatches >= 10 && deliveryRate >= 95 && monthsActive >= 12) {
    const platinumPremium = premiums.find(p => p.level_key === 'platinum' && p.is_active);
    if (platinumPremium) {
      return {
        type: 'volume_consistency',
        levelKey: 'platinum',
        levelName: platinumPremium.level_name,
        value: platinumPremium.premium_value,
        eligible: true,
        reason: `${fulfilledBatches} fulfilled batches, ${deliveryRate}% delivery rate, ${monthsActive} months active`,
      };
    }
  }
  
  // Gold: 5+ batches, 90%+ delivery, 6+ months
  if (fulfilledBatches >= 5 && deliveryRate >= 90 && monthsActive >= 6) {
    const goldPremium = premiums.find(p => p.level_key === 'gold' && p.is_active);
    if (goldPremium) {
      return {
        type: 'volume_consistency',
        levelKey: 'gold',
        levelName: goldPremium.level_name,
        value: goldPremium.premium_value,
        eligible: true,
        reason: `${fulfilledBatches} fulfilled batches, ${deliveryRate}% delivery rate, ${monthsActive} months active`,
      };
    }
  }
  
  // Silver: 3+ batches, 85%+ delivery, 3+ months
  if (fulfilledBatches >= 3 && deliveryRate >= 85 && monthsActive >= 3) {
    const silverPremium = premiums.find(p => p.level_key === 'silver' && p.is_active);
    if (silverPremium) {
      return {
        type: 'volume_consistency',
        levelKey: 'silver',
        levelName: silverPremium.level_name,
        value: silverPremium.premium_value,
        eligible: true,
        reason: `${fulfilledBatches} fulfilled batches, ${deliveryRate}% delivery rate, ${monthsActive} months active`,
      };
    }
  }
  
  // Standard (no premium)
  const standardPremium = premiums.find(p => p.level_key === 'standard' && p.premium_type === 'volume_consistency');
  return {
    type: 'volume_consistency',
    levelKey: 'standard',
    levelName: standardPremium?.level_name || 'Standard Supplier',
    value: 0,
    eligible: false,
    reason: 'Does not meet volume consistency thresholds',
  };
}

// Check if farmer qualifies for reliability premium
export function evaluateReliability(
  premiums: PremiumSetting[],
  farmerGrading: string
): PremiumEligibility {
  const matchedPremium = premiums.find(p => p.level_key === farmerGrading && p.is_active);
  
  if (matchedPremium && matchedPremium.premium_value > 0) {
    return {
      type: 'reliability',
      levelKey: matchedPremium.level_key,
      levelName: matchedPremium.level_name,
      value: matchedPremium.premium_value,
      eligible: true,
      reason: `Farmer grading: ${matchedPremium.level_name}`,
    };
  }
  
  return {
    type: 'reliability',
    levelKey: farmerGrading,
    levelName: farmerGrading === 'observer' ? 'Observer' : farmerGrading === 'declared_supplier' ? 'Declared Supplier' : 'Standard Supplier',
    value: matchedPremium?.premium_value || 0,
    eligible: false,
    reason: 'No reliability premium at current grading level',
  };
}

// Calculate full premium breakdown for a batch
export function calculatePremiumBreakdown(
  context: BatchPremiumContext,
  basePricePerKg: number,
  allPremiums: PremiumSetting[]
): PremiumBreakdown {
  const standardPremiums = allPremiums.filter(p => p.premium_type === 'standard');
  const predictabilityPremiums = allPremiums.filter(p => p.premium_type === 'predictability');
  const volumeConsistencyPremiums = allPremiums.filter(p => p.premium_type === 'volume_consistency');
  const reliabilityPremiums = allPremiums.filter(p => p.premium_type === 'reliability');

  const premiums: PremiumEligibility[] = [
    evaluateStandardCompliance(standardPremiums, context.standardStatus),
    evaluatePredictability(
      predictabilityPremiums,
      context.confirmedAt,
      context.matchingWindowLockDate,
      context.hasPostConfirmationEdits
    ),
    evaluateVolumeConsistency(
      volumeConsistencyPremiums,
      context.totalFulfilledBatches,
      context.deliveryRate,
      context.monthsActive
    ),
    evaluateReliability(reliabilityPremiums, context.farmerGrading),
  ];

  const totalPremium = premiums.reduce((sum, p) => sum + (p.eligible ? p.value : 0), 0);
  const totalPricePerKg = basePricePerKg + totalPremium;

  return {
    basePricePerKg,
    premiums,
    totalPremium,
    totalPricePerKg,
  };
}