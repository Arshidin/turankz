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
  min: 12,  // 12 months
  max: 48,  // 48 months
} as const;

export const WEIGHT_RANGE = {
  min: 300,  // 300 kg
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

  // Age check
  if (criteria.age_range_min !== null || criteria.age_range_max !== null) {
    if (batch.age_min !== null && batch.age_max !== null) {
      const minAge = criteria.age_range_min ?? 0;
      const maxAge = criteria.age_range_max ?? 999;
      const ageMatch = batch.age_min >= minAge && batch.age_max <= maxAge;
      checks.push(ageMatch);
      if (!ageMatch) partialMatch = true;
    }
  }

  // Weight check
  if (criteria.weight_range_min !== null || criteria.weight_range_max !== null) {
    if (batch.weight_min !== null && batch.weight_max !== null) {
      const minWeight = criteria.weight_range_min ?? 0;
      const maxWeight = criteria.weight_range_max ?? 9999;
      const weightMatch = batch.weight_min >= minWeight && batch.weight_max <= maxWeight;
      checks.push(weightMatch);
      if (!weightMatch) partialMatch = true;
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
