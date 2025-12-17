import { AGE_RANGE, WEIGHT_RANGE, LIVESTOCK_BREEDS } from './livestock-criteria';

export type StandardStatus = 'non_standard' | 'standard' | 'high_standard';

// Meat breeds that qualify for Tier 1 (no adjustment)
const TIER1_BREEDS = ['Kazakh Whiteheaded', 'Hereford', 'Angus', 'Limousin', 'Charolais', 'Auliekol'];
const TIER2_BREEDS = ['Mixed/Crossbred', 'Santa Gertrudis'];
const TIER3_BREEDS = ['Simmental']; // Dairy/dual purpose

interface BatchCharacteristics {
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
}

interface StandardStatusResult {
  status: StandardStatus;
  reasons: string[];
  adjustments: { category: string; value: number; reason: string }[];
  isHomogeneous: boolean;
  hasNegativeAdjustments: boolean;
}

// Calculate price adjustments based on the Price Grid criteria
function calculateAdjustments(batch: BatchCharacteristics): { category: string; value: number; reason: string }[] {
  const adjustments: { category: string; value: number; reason: string }[] = [];
  
  // Breed adjustment
  if (batch.breed) {
    if (TIER2_BREEDS.includes(batch.breed)) {
      adjustments.push({ category: 'Breed', value: -50, reason: `${batch.breed} (Tier 2)` });
    } else if (TIER3_BREEDS.includes(batch.breed)) {
      adjustments.push({ category: 'Breed', value: -100, reason: `${batch.breed} (Tier 3)` });
    }
    // Tier 1 breeds have 0 adjustment
  }
  
  // Determine product category (A: Young Bull, B: Feeder Bull)
  const avgAge = batch.age_min && batch.age_max 
    ? (batch.age_min + batch.age_max) / 2 
    : batch.age_min || batch.age_max;
  const avgWeight = batch.weight_min && batch.weight_max 
    ? (batch.weight_min + batch.weight_max) / 2 
    : batch.weight_min || batch.weight_max;
  
  // Product A: Young Bull (up to 12 months, 180-260 kg)
  // Product B: Feeder Bull (12-18 months, 260-380 kg)
  const isProductA = avgAge && avgAge <= 12;
  const isProductB = avgAge && avgAge > 12 && avgAge <= 18;
  
  // Age adjustments
  if (avgAge) {
    if (isProductA) {
      // Product A age adjustments
      if (avgAge < 6) {
        adjustments.push({ category: 'Age', value: -100, reason: `< 6 months` });
      } else if (avgAge >= 6 && avgAge < 8) {
        adjustments.push({ category: 'Age', value: -50, reason: `6-8 months` });
      }
      // 8-12 months: 0 adjustment
    } else if (isProductB) {
      // Product B age adjustments
      if (avgAge > 18) {
        adjustments.push({ category: 'Age', value: -100, reason: `> 18 months` });
      }
      // 12-18 months: 0 adjustment
    } else if (avgAge > 18) {
      adjustments.push({ category: 'Age', value: -100, reason: `> 18 months (outside standard range)` });
    }
  }
  
  // Weight adjustments
  if (avgWeight) {
    if (isProductA) {
      // Product A weight adjustments (target: 180-260 kg)
      if (avgWeight < 160) {
        adjustments.push({ category: 'Weight', value: -100, reason: `< 160 kg` });
      } else if (avgWeight >= 160 && avgWeight < 180) {
        adjustments.push({ category: 'Weight', value: -50, reason: `160-180 kg` });
      } else if (avgWeight > 260) {
        adjustments.push({ category: 'Weight', value: -50, reason: `> 260 kg` });
      }
      // 180-260 kg: 0 adjustment
    } else if (isProductB) {
      // Product B weight adjustments (target: 260-380 kg)
      if (avgWeight < 240) {
        adjustments.push({ category: 'Weight', value: -100, reason: `< 240 kg` });
      } else if (avgWeight >= 240 && avgWeight < 260) {
        adjustments.push({ category: 'Weight', value: -50, reason: `240-260 kg` });
      } else if (avgWeight > 380) {
        adjustments.push({ category: 'Weight', value: -50, reason: `> 380 kg` });
      }
      // 260-380 kg: 0 adjustment
    }
  }
  
  return adjustments;
}

// Check if batch is homogeneous (High Standard criteria)
function checkHomogeneity(batch: BatchCharacteristics): { isHomogeneous: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isHomogeneous = true;
  
  // Must have a single breed (not mixed)
  if (!batch.breed || batch.breed === 'Mixed/Crossbred') {
    isHomogeneous = false;
    reasons.push('Mixed or unspecified breed');
  }
  
  // Age range must be ±1 month (2 month spread max)
  if (batch.age_min !== null && batch.age_max !== null) {
    const ageSpread = batch.age_max - batch.age_min;
    if (ageSpread > 2) {
      isHomogeneous = false;
      reasons.push(`Age spread ${ageSpread} months (max 2 months for High Standard)`);
    }
  } else if (batch.age_min === null || batch.age_max === null) {
    isHomogeneous = false;
    reasons.push('Age range not fully specified');
  }
  
  // Weight range must be ±30 kg (60 kg spread max)
  if (batch.weight_min !== null && batch.weight_max !== null) {
    const weightSpread = batch.weight_max - batch.weight_min;
    if (weightSpread > 60) {
      isHomogeneous = false;
      reasons.push(`Weight spread ${weightSpread} kg (max 60 kg for High Standard)`);
    }
  } else if (batch.weight_min === null || batch.weight_max === null) {
    isHomogeneous = false;
    reasons.push('Weight range not fully specified');
  }
  
  return { isHomogeneous, reasons };
}

// Main function to calculate standard status
export function calculateStandardStatus(batch: BatchCharacteristics): StandardStatusResult {
  const adjustments = calculateAdjustments(batch);
  const hasNegativeAdjustments = adjustments.some(a => a.value < 0);
  const { isHomogeneous, reasons: homogeneityReasons } = checkHomogeneity(batch);
  
  const reasons: string[] = [];
  let status: StandardStatus = 'non_standard';
  
  // Check for minimum required fields
  const hasRequiredFields = batch.breed && batch.gender && 
    batch.age_min !== null && batch.age_max !== null &&
    batch.weight_min !== null && batch.weight_max !== null;
  
  if (!hasRequiredFields) {
    reasons.push('Missing required batch characteristics');
    return { status: 'non_standard', reasons, adjustments, isHomogeneous: false, hasNegativeAdjustments };
  }
  
  // Only male cattle covered by the grid
  if (batch.gender !== 'Male') {
    reasons.push('Only male cattle qualify for standard premiums');
    return { status: 'non_standard', reasons, adjustments, isHomogeneous, hasNegativeAdjustments };
  }
  
  if (hasNegativeAdjustments) {
    // Non-Standard: has negative adjustments
    status = 'non_standard';
    reasons.push('Has negative price adjustments');
    adjustments.forEach(a => {
      if (a.value < 0) reasons.push(`${a.category}: ${a.value} ₸/kg (${a.reason})`);
    });
  } else if (!isHomogeneous) {
    // Standard: no negative adjustments but not homogeneous
    status = 'standard';
    reasons.push('Meets standard criteria (no negative adjustments)');
    reasons.push('Not eligible for High Standard:');
    homogeneityReasons.forEach(r => reasons.push(`  - ${r}`));
  } else {
    // High Standard: no negative adjustments AND homogeneous
    status = 'high_standard';
    reasons.push('Meets High Standard criteria');
    reasons.push('No negative price adjustments');
    reasons.push('Homogeneous batch (single breed, tight age/weight range)');
  }
  
  return { status, reasons, adjustments, isHomogeneous, hasNegativeAdjustments };
}

// Simplified version that just returns the status
export function getAutoStandardStatus(batch: BatchCharacteristics): StandardStatus {
  return calculateStandardStatus(batch).status;
}

// Get display info for standard status
export function getStandardStatusDisplay(status: StandardStatus): { 
  label: string; 
  premium: number;
  description: string;
} {
  switch (status) {
    case 'high_standard':
      return {
        label: 'High Standard',
        premium: 100,
        description: 'Homogeneous batch with no negative adjustments'
      };
    case 'standard':
      return {
        label: 'Standard',
        premium: 50,
        description: 'Meets acceptance criteria with no negative adjustments'
      };
    default:
      return {
        label: 'Non-Standard',
        premium: 0,
        description: 'Has negative adjustments or missing criteria'
      };
  }
}
