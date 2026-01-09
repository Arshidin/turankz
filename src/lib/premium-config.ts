/**
 * Premium Configuration
 *
 * Sprint 9-10: Centralized configuration for all premium thresholds.
 * Moving hardcoded values from premium-eligibility.ts to configurable constants.
 *
 * This allows easier modification of thresholds without code changes.
 * In the future, these can be loaded from database via premium_settings table.
 */

// ============================================================================
// VOLUME CONSISTENCY TIER THRESHOLDS
// ============================================================================

export interface VolumeConsistencyThreshold {
  tierKey: string;
  tierName: string;
  tierNameRu: string;
  minBatches: number;
  minDeliveryRate: number; // percentage 0-100
  minMonthsActive: number;
  description: string;
  descriptionRu: string;
}

export const VOLUME_CONSISTENCY_TIERS: VolumeConsistencyThreshold[] = [
  {
    tierKey: 'platinum',
    tierName: 'Platinum Supplier',
    tierNameRu: 'Платиновый поставщик',
    minBatches: 10,
    minDeliveryRate: 95,
    minMonthsActive: 12,
    description: '10+ batches, 95%+ delivery rate, 12+ months active',
    descriptionRu: '10+ партий, 95%+ выполнение, 12+ месяцев активности',
  },
  {
    tierKey: 'gold',
    tierName: 'Gold Supplier',
    tierNameRu: 'Золотой поставщик',
    minBatches: 5,
    minDeliveryRate: 90,
    minMonthsActive: 6,
    description: '5+ batches, 90%+ delivery rate, 6+ months active',
    descriptionRu: '5+ партий, 90%+ выполнение, 6+ месяцев активности',
  },
  {
    tierKey: 'silver',
    tierName: 'Silver Supplier',
    tierNameRu: 'Серебряный поставщик',
    minBatches: 3,
    minDeliveryRate: 85,
    minMonthsActive: 3,
    description: '3+ batches, 85%+ delivery rate, 3+ months active',
    descriptionRu: '3+ партий, 85%+ выполнение, 3+ месяцев активности',
  },
  {
    tierKey: 'standard',
    tierName: 'Standard Supplier',
    tierNameRu: 'Стандартный поставщик',
    minBatches: 0,
    minDeliveryRate: 0,
    minMonthsActive: 0,
    description: 'Starting tier for new suppliers',
    descriptionRu: 'Начальный уровень для новых поставщиков',
  },
];

// ============================================================================
// RELIABILITY TIER DEFINITIONS
// ============================================================================

export interface ReliabilityTier {
  tierKey: string;
  tierName: string;
  tierNameRu: string;
  description: string;
  descriptionRu: string;
}

export const RELIABILITY_TIERS: ReliabilityTier[] = [
  {
    tierKey: 'standard_supplier',
    tierName: 'Standard Supplier',
    tierNameRu: 'Стандартный поставщик',
    description: 'Excellent reliability and track record',
    descriptionRu: 'Отличная надёжность и история поставок',
  },
  {
    tierKey: 'declared_supplier',
    tierName: 'Declared Supplier',
    tierNameRu: 'Заявленный поставщик',
    description: 'Consistent behavior, building trust',
    descriptionRu: 'Стабильное поведение, формирование доверия',
  },
  {
    tierKey: 'observer',
    tierName: 'Observer',
    tierNameRu: 'Наблюдатель',
    description: 'New or unverified supplier',
    descriptionRu: 'Новый или непроверенный поставщик',
  },
];

// ============================================================================
// STANDARD COMPLIANCE DEFINITIONS
// ============================================================================

export interface StandardComplianceLevel {
  levelKey: string;
  levelName: string;
  levelNameRu: string;
  requirements: string[];
  requirementsRu: string[];
}

export const STANDARD_COMPLIANCE_LEVELS: StandardComplianceLevel[] = [
  {
    levelKey: 'high_standard',
    levelName: 'High Standard',
    levelNameRu: 'Высокий стандарт',
    requirements: [
      'No negative price adjustments',
      'Homogeneous batch (single breed)',
      'Age spread ≤2 months',
      'Weight spread ≤60 kg',
    ],
    requirementsRu: [
      'Без отрицательных корректировок цены',
      'Однородная партия (одна порода)',
      'Разброс возраста ≤2 месяцев',
      'Разброс веса ≤60 кг',
    ],
  },
  {
    levelKey: 'standard',
    levelName: 'Standard',
    levelNameRu: 'Стандарт',
    requirements: [
      'No negative price adjustments',
      'Meets age requirements',
      'Meets weight requirements',
    ],
    requirementsRu: [
      'Без отрицательных корректировок цены',
      'Соответствует требованиям по возрасту',
      'Соответствует требованиям по весу',
    ],
  },
  {
    levelKey: 'non_standard',
    levelName: 'Non-Standard',
    levelNameRu: 'Нестандарт',
    requirements: [
      'Has one or more negative adjustments',
      'May not meet all criteria',
    ],
    requirementsRu: [
      'Имеет одну или более отрицательных корректировок',
      'Может не соответствовать всем критериям',
    ],
  },
];

// ============================================================================
// PREDICTABILITY TIER DEFINITIONS
// ============================================================================

export interface PredictabilityLevel {
  levelKey: string;
  levelName: string;
  levelNameRu: string;
  requirements: string[];
  requirementsRu: string[];
}

export const PREDICTABILITY_LEVELS: PredictabilityLevel[] = [
  {
    levelKey: 'early_confirmation',
    levelName: 'Early Confirmation',
    levelNameRu: 'Раннее подтверждение',
    requirements: [
      'Confirmed before matching window lock date',
      'No post-confirmation edits',
    ],
    requirementsRu: [
      'Подтверждено до даты блокировки окна',
      'Без изменений после подтверждения',
    ],
  },
  {
    levelKey: 'standard_confirmation',
    levelName: 'Standard Confirmation',
    levelNameRu: 'Стандартное подтверждение',
    requirements: [
      'Confirmed during matching window',
      'Minor edits allowed',
    ],
    requirementsRu: [
      'Подтверждено во время окна сопоставления',
      'Допускаются незначительные изменения',
    ],
  },
  {
    levelKey: 'late_confirmation',
    levelName: 'Late Confirmation',
    levelNameRu: 'Позднее подтверждение',
    requirements: [
      'Confirmed after lock date',
      'Or multiple post-confirmation edits',
    ],
    requirementsRu: [
      'Подтверждено после даты блокировки',
      'Или множественные изменения после подтверждения',
    ],
  },
];

// ============================================================================
// HOMOGENEITY CRITERIA (for high_standard)
// ============================================================================

export interface HomogeneityCriteria {
  maxAgeSpreadMonths: number;
  maxWeightSpreadKg: number;
  requireSingleBreed: boolean;
}

export const HOMOGENEITY_CRITERIA: HomogeneityCriteria = {
  maxAgeSpreadMonths: 2, // ±1 month = 2 month total spread
  maxWeightSpreadKg: 60, // ±30 kg = 60 kg total spread
  requireSingleBreed: true,
};

// ============================================================================
// DEFAULT PREMIUM VALUES (₸/kg)
// Can be overridden by database values from premium_settings table
// ============================================================================

export interface DefaultPremiumValues {
  standard: {
    high_standard: number;
    standard: number;
    non_standard: number;
  };
  reliability: {
    standard_supplier: number;
    declared_supplier: number;
    observer: number;
  };
  predictability: {
    early_confirmation: number;
    standard_confirmation: number;
    late_confirmation: number;
  };
  volume_consistency: {
    platinum: number;
    gold: number;
    silver: number;
    standard: number;
  };
}

export const DEFAULT_PREMIUM_VALUES: DefaultPremiumValues = {
  standard: {
    high_standard: 100,
    standard: 50,
    non_standard: 0,
  },
  reliability: {
    standard_supplier: 70,
    declared_supplier: 30,
    observer: 0,
  },
  predictability: {
    early_confirmation: 15,
    standard_confirmation: 5,
    late_confirmation: 0,
  },
  volume_consistency: {
    platinum: 25,
    gold: 15,
    silver: 8,
    standard: 0,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the volume consistency tier for given metrics
 */
export function getVolumeConsistencyTier(
  fulfilledBatches: number,
  deliveryRate: number,
  monthsActive: number
): VolumeConsistencyThreshold {
  // Check tiers in order (highest first)
  for (const tier of VOLUME_CONSISTENCY_TIERS) {
    if (
      fulfilledBatches >= tier.minBatches &&
      deliveryRate >= tier.minDeliveryRate &&
      monthsActive >= tier.minMonthsActive
    ) {
      return tier;
    }
  }
  // Fallback to standard (always matches)
  return VOLUME_CONSISTENCY_TIERS[VOLUME_CONSISTENCY_TIERS.length - 1];
}

/**
 * Get the next tier and requirements to reach it
 */
export function getNextVolumeConsistencyTier(
  fulfilledBatches: number,
  deliveryRate: number,
  monthsActive: number
): {
  currentTier: VolumeConsistencyThreshold;
  nextTier: VolumeConsistencyThreshold | null;
  requirements: {
    batchesNeeded: number;
    deliveryRateNeeded: number;
    monthsNeeded: number;
  } | null;
} {
  const currentTier = getVolumeConsistencyTier(fulfilledBatches, deliveryRate, monthsActive);
  const currentIndex = VOLUME_CONSISTENCY_TIERS.findIndex(t => t.tierKey === currentTier.tierKey);

  // Already at highest tier
  if (currentIndex === 0) {
    return { currentTier, nextTier: null, requirements: null };
  }

  const nextTier = VOLUME_CONSISTENCY_TIERS[currentIndex - 1];

  return {
    currentTier,
    nextTier,
    requirements: {
      batchesNeeded: Math.max(0, nextTier.minBatches - fulfilledBatches),
      deliveryRateNeeded: Math.max(0, nextTier.minDeliveryRate - deliveryRate),
      monthsNeeded: Math.max(0, nextTier.minMonthsActive - monthsActive),
    },
  };
}

/**
 * Calculate progress percentage towards next tier
 */
export function calculateTierProgress(
  fulfilledBatches: number,
  deliveryRate: number,
  monthsActive: number
): {
  batchProgress: number;
  deliveryProgress: number;
  monthsProgress: number;
  overallProgress: number;
} {
  const { currentTier, nextTier } = getNextVolumeConsistencyTier(
    fulfilledBatches,
    deliveryRate,
    monthsActive
  );

  if (!nextTier) {
    return {
      batchProgress: 100,
      deliveryProgress: 100,
      monthsProgress: 100,
      overallProgress: 100,
    };
  }

  const batchProgress = Math.min(100, (fulfilledBatches / nextTier.minBatches) * 100);
  const deliveryProgress = Math.min(100, (deliveryRate / nextTier.minDeliveryRate) * 100);
  const monthsProgress = Math.min(100, (monthsActive / nextTier.minMonthsActive) * 100);

  // Overall is the minimum of all three (all criteria must be met)
  const overallProgress = Math.min(batchProgress, deliveryProgress, monthsProgress);

  return {
    batchProgress: Math.round(batchProgress),
    deliveryProgress: Math.round(deliveryProgress),
    monthsProgress: Math.round(monthsProgress),
    overallProgress: Math.round(overallProgress),
  };
}

/**
 * Get tier by key
 */
export function getReliabilityTier(tierKey: string): ReliabilityTier | undefined {
  return RELIABILITY_TIERS.find(t => t.tierKey === tierKey);
}

export function getStandardComplianceLevel(levelKey: string): StandardComplianceLevel | undefined {
  return STANDARD_COMPLIANCE_LEVELS.find(l => l.levelKey === levelKey);
}

export function getPredictabilityLevel(levelKey: string): PredictabilityLevel | undefined {
  return PREDICTABILITY_LEVELS.find(l => l.levelKey === levelKey);
}

// ============================================================================
// PREMIUM TYPE LABELS
// ============================================================================

export const PREMIUM_TYPE_LABELS: Record<string, { en: string; ru: string }> = {
  standard: { en: 'Standard Compliance', ru: 'Соответствие стандарту' },
  reliability: { en: 'Reliability', ru: 'Надёжность' },
  predictability: { en: 'Predictability', ru: 'Предсказуемость' },
  volume_consistency: { en: 'Volume Consistency', ru: 'Стабильность объёмов' },
};

export const PREMIUM_TYPE_DESCRIPTIONS: Record<string, { en: string; ru: string }> = {
  standard: {
    en: 'Premium for batches meeting quality standards',
    ru: 'Премия за партии, соответствующие стандартам качества',
  },
  reliability: {
    en: 'Premium based on farmer reliability grading',
    ru: 'Премия на основе рейтинга надёжности фермера',
  },
  predictability: {
    en: 'Premium for timely confirmation without edits',
    ru: 'Премия за своевременное подтверждение без изменений',
  },
  volume_consistency: {
    en: 'Premium for consistent delivery performance',
    ru: 'Премия за стабильное выполнение поставок',
  },
};

// ============================================================================
// MVP PREMIUM SIMPLIFICATION (Sprint 2)
// ============================================================================
// For MVP, we focus on just 2 premium types:
// 1. Standard Premium - base quality compliance
// 2. Reliability Premium - based on supplier history
//
// Predictability and Volume Consistency are deferred to future phases.

/**
 * Premium types enabled for MVP
 * Other types exist in the system but are not displayed/calculated for farmers
 */
export const MVP_ENABLED_PREMIUM_TYPES = ['standard', 'reliability'] as const;
export type MvpPremiumType = typeof MVP_ENABLED_PREMIUM_TYPES[number];

/**
 * Check if a premium type is enabled for MVP
 */
export function isPremiumTypeEnabledForMvp(type: string): boolean {
  return MVP_ENABLED_PREMIUM_TYPES.includes(type as MvpPremiumType);
}

/**
 * Get MVP-focused premium type labels
 */
export const MVP_PREMIUM_TYPE_LABELS: Record<MvpPremiumType, { en: string; ru: string }> = {
  standard: {
    en: 'Standard Premium',
    ru: 'Стандартная премия'
  },
  reliability: {
    en: 'Reliability Premium',
    ru: 'Премия за надёжность'
  },
};

export const MVP_PREMIUM_TYPE_DESCRIPTIONS: Record<MvpPremiumType, { en: string; ru: string }> = {
  standard: {
    en: 'Premium awarded for batches meeting TURAN quality standards (breed homogeneity, weight/age consistency)',
    ru: 'Премия за партии, соответствующие стандартам качества TURAN (однородность породы, стабильность веса/возраста)',
  },
  reliability: {
    en: 'Premium based on your track record: successful deliveries, on-time performance, and consistent quality',
    ru: 'Премия на основе вашей истории: успешные поставки, своевременность и стабильное качество',
  },
};

/**
 * Simplified MVP premium summary for farmers
 */
export interface MvpPremiumSummary {
  standardPremium: number;
  reliabilityPremium: number;
  totalPremium: number;
  standardLevel: 'high_standard' | 'standard' | 'non_standard';
  reliabilityGrade: 'standard_supplier' | 'declared_supplier' | 'observer';
}

/**
 * Calculate MVP-focused premium summary
 */
export function calculateMvpPremiumSummary(
  standardLevel: 'high_standard' | 'standard' | 'non_standard',
  reliabilityGrade: 'standard_supplier' | 'declared_supplier' | 'observer'
): MvpPremiumSummary {
  const standardPremium = DEFAULT_PREMIUM_VALUES.standard[standardLevel];
  const reliabilityPremium = DEFAULT_PREMIUM_VALUES.reliability[reliabilityGrade];

  return {
    standardPremium,
    reliabilityPremium,
    totalPremium: standardPremium + reliabilityPremium,
    standardLevel,
    reliabilityGrade,
  };
}
