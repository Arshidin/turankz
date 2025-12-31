// Standardized livestock acceptance criteria for MPK requirements and farmer declarations

export const LIVESTOCK_BREEDS = [
  'Kazakh Whiteheaded',
  'Hereford',
  'Angus',
  'Simmental',
  'Charolais',
  'Limousin',
  'Auliekol',
  'Santa Gertrudis',
  'Mixed/Crossbred',
] as const;

export const LIVESTOCK_GENDERS = [
  'Male',
  'Female',
  'Mixed',
] as const;

export const AGE_RANGE = {
  min: 6,  // 6 months
  max: 48,  // 48 months
} as const;

export const WEIGHT_RANGE = {
  min: 150,  // 150 kg
  max: 700,  // 700 kg
} as const;

export type LivestockBreed = typeof LIVESTOCK_BREEDS[number];
export type LivestockGender = typeof LIVESTOCK_GENDERS[number];

export interface BatchCriteria {
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
}

export interface AcceptanceCriteria {
  accepted_breeds: string[];
  accepted_genders: string[];
  age_range_min: number | null;
  age_range_max: number | null;
  weight_range_min: number | null;
  weight_range_max: number | null;
}

// Check if a batch matches the acceptance criteria
export type MatchLevel = 'full' | 'partial' | 'none';

export function checkBatchMatch(batch: BatchCriteria, criteria: AcceptanceCriteria): MatchLevel {
  const checks: boolean[] = [];
  let partialMatch = false;

  // Breed check
  if (criteria.accepted_breeds.length > 0 && batch.breed) {
    const breedMatch = criteria.accepted_breeds.includes(batch.breed);
    checks.push(breedMatch);
    if (!breedMatch) partialMatch = true;
  }

  // Gender check
  if (criteria.accepted_genders.length > 0 && batch.gender) {
    const genderMatch = criteria.accepted_genders.includes(batch.gender) || 
                        criteria.accepted_genders.includes('Mixed');
    checks.push(genderMatch);
    if (!genderMatch) partialMatch = true;
  }

  // Age check - use overlap logic (not strict containment)
  // Batch is compatible if ranges overlap, not if batch is fully contained
  if (criteria.age_range_min !== null || criteria.age_range_max !== null) {
    if (batch.age_min !== null || batch.age_max !== null) {
      const batchMin = batch.age_min ?? 0;
      const batchMax = batch.age_max ?? Infinity;
      const criteriaMin = criteria.age_range_min ?? 0;
      const criteriaMax = criteria.age_range_max ?? Infinity;
      
      // Check for overlap: ranges overlap if batchMin <= criteriaMax && batchMax >= criteriaMin
      const ageOverlap = batchMin <= criteriaMax && batchMax >= criteriaMin;
      
      // Full match: batch is fully contained within criteria
      const ageFullMatch = batch.age_min !== null && batch.age_max !== null &&
        batch.age_min >= criteriaMin && batch.age_max <= criteriaMax;
      
      if (ageFullMatch) {
        checks.push(true);
      } else if (ageOverlap) {
        checks.push(true);
        partialMatch = true; // Overlap but not full containment = partial match
      } else {
        checks.push(false);
        partialMatch = true;
      }
    }
  }

  // Weight check - use overlap logic (not strict containment)
  // Batch is compatible if ranges overlap, not if batch is fully contained
  if (criteria.weight_range_min !== null || criteria.weight_range_max !== null) {
    if (batch.weight_min !== null || batch.weight_max !== null) {
      const batchMin = batch.weight_min ?? 0;
      const batchMax = batch.weight_max ?? Infinity;
      const criteriaMin = criteria.weight_range_min ?? 0;
      const criteriaMax = criteria.weight_range_max ?? Infinity;
      
      // Check for overlap: ranges overlap if batchMin <= criteriaMax && batchMax >= criteriaMin
      const weightOverlap = batchMin <= criteriaMax && batchMax >= criteriaMin;
      
      // Full match: batch is fully contained within criteria
      const weightFullMatch = batch.weight_min !== null && batch.weight_max !== null &&
        batch.weight_min >= criteriaMin && batch.weight_max <= criteriaMax;
      
      if (weightFullMatch) {
        checks.push(true);
      } else if (weightOverlap) {
        checks.push(true);
        partialMatch = true; // Overlap but not full containment = partial match
      } else {
        checks.push(false);
        partialMatch = true;
      }
    }
  }

  // If no criteria specified or no checks performed
  if (checks.length === 0) return 'full';
  
  // All checks passed
  if (checks.every(c => c)) return 'full';
  
  // Some checks passed
  if (checks.some(c => c)) return 'partial';
  
  // No checks passed
  return 'none';
}

// Format criteria for display
export function formatCriteriaDisplay(criteria: AcceptanceCriteria): string[] {
  const parts: string[] = [];
  
  if (criteria.accepted_breeds.length > 0) {
    parts.push(`Breeds: ${criteria.accepted_breeds.join(', ')}`);
  }
  
  if (criteria.accepted_genders.length > 0) {
    parts.push(`Gender: ${criteria.accepted_genders.join(', ')}`);
  }
  
  if (criteria.age_range_min !== null || criteria.age_range_max !== null) {
    const min = criteria.age_range_min ?? AGE_RANGE.min;
    const max = criteria.age_range_max ?? AGE_RANGE.max;
    parts.push(`Age: ${min}–${max} months`);
  }
  
  if (criteria.weight_range_min !== null || criteria.weight_range_max !== null) {
    const min = criteria.weight_range_min ?? WEIGHT_RANGE.min;
    const max = criteria.weight_range_max ?? WEIGHT_RANGE.max;
    parts.push(`Weight: ${min}–${max} kg`);
  }
  
  return parts;
}

// Format batch criteria for display
export function formatBatchCriteria(batch: BatchCriteria): string[] {
  const parts: string[] = [];
  
  if (batch.breed) {
    parts.push(`Breed: ${batch.breed}`);
  }
  
  if (batch.gender) {
    parts.push(`Gender: ${batch.gender}`);
  }
  
  if (batch.age_min !== null || batch.age_max !== null) {
    const min = batch.age_min ?? '–';
    const max = batch.age_max ?? '–';
    parts.push(`Age: ${min}–${max} mo`);
  }
  
  if (batch.weight_min !== null || batch.weight_max !== null) {
    const min = batch.weight_min ?? '–';
    const max = batch.weight_max ?? '–';
    parts.push(`Weight: ${min}–${max} kg`);
  }
  
  return parts;
}
