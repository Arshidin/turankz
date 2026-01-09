/**
 * Premium Evaluator
 *
 * Sprint 9-10: Generic premium evaluation system.
 * Consolidates the 4 evaluation functions into a unified evaluator pattern.
 *
 * Benefits:
 * - Consistent evaluation logic
 * - Configurable thresholds from premium-config.ts
 * - Better testability
 * - Support for tier progress tracking
 */

import { PremiumSetting } from '@/hooks/usePremiums';
import {
  VOLUME_CONSISTENCY_TIERS,
  getVolumeConsistencyTier,
  getNextVolumeConsistencyTier,
  calculateTierProgress,
  PREMIUM_TYPE_LABELS,
  PREMIUM_TYPE_DESCRIPTIONS,
  type VolumeConsistencyThreshold,
} from './premium-config';

// ============================================================================
// TYPES
// ============================================================================

export type PremiumType = 'standard' | 'predictability' | 'volume_consistency' | 'reliability';

export interface PremiumEvaluation {
  type: PremiumType;
  levelKey: string;
  levelName: string;
  levelNameRu: string;
  value: number;
  eligible: boolean;
  reason: string;
  reasonRu: string;
  improvementTip?: string;
  improvementTipRu?: string;
}

export interface PremiumBreakdown {
  basePricePerKg: number;
  premiums: PremiumEvaluation[];
  totalPremium: number;
  totalPricePerKg: number;
  potentialMaxPremium: number;
  missedPremium: number;
}

export interface BatchPremiumContext {
  batchId: string;
  standardStatus: string;
  confirmedAt: string | null;
  hasPostConfirmationEdits: boolean;
  editCount: number;
  farmerId: string;
  farmerGrading: string;
  totalFulfilledBatches: number;
  deliveryRate: number;
  monthsActive: number;
  matchingWindowLockDate: string | null;
}

export interface TierProgressInfo {
  currentTier: VolumeConsistencyThreshold;
  nextTier: VolumeConsistencyThreshold | null;
  progress: {
    batchProgress: number;
    deliveryProgress: number;
    monthsProgress: number;
    overallProgress: number;
  };
  requirements: {
    batchesNeeded: number;
    deliveryRateNeeded: number;
    monthsNeeded: number;
  } | null;
}

// ============================================================================
// GENERIC EVALUATOR CLASS
// ============================================================================

export class PremiumEvaluator {
  private premiumSettings: PremiumSetting[];

  constructor(premiumSettings: PremiumSetting[]) {
    this.premiumSettings = premiumSettings;
  }

  /**
   * Get premium settings by type
   */
  private getSettingsByType(type: PremiumType): PremiumSetting[] {
    return this.premiumSettings.filter(p => p.premium_type === type);
  }

  /**
   * Find specific premium setting
   */
  private findSetting(type: PremiumType, levelKey: string): PremiumSetting | undefined {
    return this.premiumSettings.find(
      p => p.premium_type === type && p.level_key === levelKey && p.is_active
    );
  }

  /**
   * Evaluate Standard Compliance Premium
   */
  evaluateStandard(standardStatus: string): PremiumEvaluation {
    const setting = this.findSetting('standard', standardStatus);

    if (setting && setting.premium_value > 0) {
      return {
        type: 'standard',
        levelKey: setting.level_key,
        levelName: setting.level_name,
        levelNameRu: this.getStatusLabelRu('standard', setting.level_key),
        value: setting.premium_value,
        eligible: true,
        reason: `Batch meets ${setting.level_name} criteria`,
        reasonRu: `Партия соответствует критериям "${this.getStatusLabelRu('standard', setting.level_key)}"`,
      };
    }

    return {
      type: 'standard',
      levelKey: standardStatus,
      levelName: 'Non-Standard',
      levelNameRu: 'Нестандарт',
      value: 0,
      eligible: false,
      reason: 'Batch does not meet standard compliance criteria',
      reasonRu: 'Партия не соответствует стандартным критериям',
      improvementTip: 'Ensure your batch meets all grid criteria for age, weight, and breed.',
      improvementTipRu: 'Убедитесь, что партия соответствует всем критериям по возрасту, весу и породе.',
    };
  }

  /**
   * Evaluate Predictability Premium
   */
  evaluatePredictability(
    confirmedAt: string | null,
    lockDate: string | null,
    hasEdits: boolean,
    editCount: number = 0
  ): PremiumEvaluation {
    if (!confirmedAt) {
      return {
        type: 'predictability',
        levelKey: 'late_confirmation',
        levelName: 'Not Confirmed',
        levelNameRu: 'Не подтверждено',
        value: 0,
        eligible: false,
        reason: 'Batch not yet confirmed',
        reasonRu: 'Партия ещё не подтверждена',
        improvementTip: 'Confirm your batch before the matching window lock date.',
        improvementTipRu: 'Подтвердите партию до даты блокировки окна сопоставления.',
      };
    }

    const confirmedDate = new Date(confirmedAt);
    const lockDateTime = lockDate ? new Date(lockDate) : null;

    // Early confirmation: before lock date AND no edits
    if (lockDateTime && confirmedDate < lockDateTime && !hasEdits) {
      const setting = this.findSetting('predictability', 'early_confirmation');
      if (setting) {
        return {
          type: 'predictability',
          levelKey: 'early_confirmation',
          levelName: setting.level_name,
          levelNameRu: 'Раннее подтверждение',
          value: setting.premium_value,
          eligible: true,
          reason: 'Confirmed before lock date with no edits',
          reasonRu: 'Подтверждено до даты блокировки без изменений',
        };
      }
    }

    // Standard confirmation: during window, minor edits
    if (lockDateTime && confirmedDate <= lockDateTime) {
      const setting = this.findSetting('predictability', 'standard_confirmation');
      if (setting) {
        return {
          type: 'predictability',
          levelKey: 'standard_confirmation',
          levelName: setting.level_name,
          levelNameRu: 'Стандартное подтверждение',
          value: setting.premium_value,
          eligible: true,
          reason: hasEdits ? 'Confirmed during window with minor edits' : 'Confirmed during matching window',
          reasonRu: hasEdits ? 'Подтверждено во время окна с незначительными изменениями' : 'Подтверждено во время окна сопоставления',
          improvementTip: hasEdits ? 'Avoid post-confirmation edits to get early confirmation premium.' : undefined,
          improvementTipRu: hasEdits ? 'Избегайте изменений после подтверждения для получения премии за раннее подтверждение.' : undefined,
        };
      }
    }

    // Late confirmation
    const lateSetting = this.findSetting('predictability', 'late_confirmation');
    return {
      type: 'predictability',
      levelKey: 'late_confirmation',
      levelName: lateSetting?.level_name || 'Late Confirmation',
      levelNameRu: 'Позднее подтверждение',
      value: lateSetting?.premium_value || 0,
      eligible: false,
      reason: editCount > 1 ? `Multiple post-confirmation edits (${editCount})` : 'Late confirmation or post-confirmation edits',
      reasonRu: editCount > 1 ? `Множественные изменения после подтверждения (${editCount})` : 'Позднее подтверждение или изменения после подтверждения',
      improvementTip: 'Confirm before lock date and avoid making changes after confirmation.',
      improvementTipRu: 'Подтвердите до даты блокировки и избегайте изменений после подтверждения.',
    };
  }

  /**
   * Evaluate Volume Consistency Premium
   */
  evaluateVolumeConsistency(
    fulfilledBatches: number,
    deliveryRate: number,
    monthsActive: number
  ): PremiumEvaluation {
    const tier = getVolumeConsistencyTier(fulfilledBatches, deliveryRate, monthsActive);
    const setting = this.findSetting('volume_consistency', tier.tierKey);

    if (setting && setting.premium_value > 0) {
      return {
        type: 'volume_consistency',
        levelKey: tier.tierKey,
        levelName: setting.level_name,
        levelNameRu: tier.tierNameRu,
        value: setting.premium_value,
        eligible: true,
        reason: `${fulfilledBatches} batches, ${Math.round(deliveryRate)}% delivery, ${monthsActive} months`,
        reasonRu: `${fulfilledBatches} партий, ${Math.round(deliveryRate)}% выполнение, ${monthsActive} мес.`,
      };
    }

    // Not eligible - provide improvement tip
    const { nextTier, requirements } = getNextVolumeConsistencyTier(
      fulfilledBatches,
      deliveryRate,
      monthsActive
    );

    let tip = 'Fulfill more batches consistently to increase your supplier tier.';
    let tipRu = 'Выполняйте больше партий стабильно для повышения уровня.';

    if (nextTier && requirements) {
      const parts: string[] = [];
      const partsRu: string[] = [];

      if (requirements.batchesNeeded > 0) {
        parts.push(`${requirements.batchesNeeded} more batches`);
        partsRu.push(`ещё ${requirements.batchesNeeded} партий`);
      }
      if (requirements.deliveryRateNeeded > 0) {
        parts.push(`+${requirements.deliveryRateNeeded.toFixed(0)}% delivery rate`);
        partsRu.push(`+${requirements.deliveryRateNeeded.toFixed(0)}% выполнения`);
      }
      if (requirements.monthsNeeded > 0) {
        parts.push(`${requirements.monthsNeeded} more months`);
        partsRu.push(`ещё ${requirements.monthsNeeded} мес.`);
      }

      if (parts.length > 0) {
        tip = `To reach ${nextTier.tierName}: ${parts.join(', ')}`;
        tipRu = `До ${nextTier.tierNameRu}: ${partsRu.join(', ')}`;
      }
    }

    return {
      type: 'volume_consistency',
      levelKey: 'standard',
      levelName: 'Standard Supplier',
      levelNameRu: 'Стандартный поставщик',
      value: 0,
      eligible: false,
      reason: 'Does not meet volume consistency thresholds',
      reasonRu: 'Не соответствует порогам стабильности объёмов',
      improvementTip: tip,
      improvementTipRu: tipRu,
    };
  }

  /**
   * Evaluate Reliability Premium
   */
  evaluateReliability(farmerGrading: string): PremiumEvaluation {
    const setting = this.findSetting('reliability', farmerGrading);

    const gradingLabels: Record<string, { en: string; ru: string }> = {
      observer: { en: 'Observer', ru: 'Наблюдатель' },
      declared_supplier: { en: 'Declared Supplier', ru: 'Заявленный поставщик' },
      standard_supplier: { en: 'Standard Supplier', ru: 'Стандартный поставщик' },
    };

    const label = gradingLabels[farmerGrading] || { en: farmerGrading, ru: farmerGrading };

    if (setting && setting.premium_value > 0) {
      return {
        type: 'reliability',
        levelKey: setting.level_key,
        levelName: setting.level_name,
        levelNameRu: label.ru,
        value: setting.premium_value,
        eligible: true,
        reason: `Farmer grading: ${setting.level_name}`,
        reasonRu: `Рейтинг фермера: ${label.ru}`,
      };
    }

    return {
      type: 'reliability',
      levelKey: farmerGrading,
      levelName: label.en,
      levelNameRu: label.ru,
      value: setting?.premium_value || 0,
      eligible: false,
      reason: 'No reliability premium at current grading level',
      reasonRu: 'Нет премии за надёжность на текущем уровне',
      improvementTip: 'Maintain a high confirmation rate and fulfill deliveries to improve your grading.',
      improvementTipRu: 'Поддерживайте высокий уровень подтверждений и выполнения поставок для повышения рейтинга.',
    };
  }

  /**
   * Calculate full premium breakdown
   */
  calculateBreakdown(
    context: BatchPremiumContext,
    basePricePerKg: number
  ): PremiumBreakdown {
    const premiums: PremiumEvaluation[] = [
      this.evaluateStandard(context.standardStatus),
      this.evaluatePredictability(
        context.confirmedAt,
        context.matchingWindowLockDate,
        context.hasPostConfirmationEdits,
        context.editCount
      ),
      this.evaluateVolumeConsistency(
        context.totalFulfilledBatches,
        context.deliveryRate,
        context.monthsActive
      ),
      this.evaluateReliability(context.farmerGrading),
    ];

    const totalPremium = premiums.reduce((sum, p) => sum + (p.eligible ? p.value : 0), 0);

    // Calculate potential max premium (if all criteria met at highest level)
    const potentialMaxPremium = this.calculateMaxPotentialPremium();
    const missedPremium = potentialMaxPremium - totalPremium;

    return {
      basePricePerKg,
      premiums,
      totalPremium,
      totalPricePerKg: basePricePerKg + totalPremium,
      potentialMaxPremium,
      missedPremium,
    };
  }

  /**
   * Calculate the maximum possible premium
   */
  private calculateMaxPotentialPremium(): number {
    const types: PremiumType[] = ['standard', 'predictability', 'volume_consistency', 'reliability'];
    let max = 0;

    for (const type of types) {
      const settings = this.getSettingsByType(type).filter(s => s.is_active);
      const maxForType = Math.max(...settings.map(s => s.premium_value), 0);
      max += maxForType;
    }

    return max;
  }

  /**
   * Get Russian label for status
   */
  private getStatusLabelRu(type: string, levelKey: string): string {
    const labels: Record<string, Record<string, string>> = {
      standard: {
        high_standard: 'Высокий стандарт',
        standard: 'Стандарт',
        non_standard: 'Нестандарт',
      },
      predictability: {
        early_confirmation: 'Раннее подтверждение',
        standard_confirmation: 'Стандартное подтверждение',
        late_confirmation: 'Позднее подтверждение',
      },
      volume_consistency: {
        platinum: 'Платиновый',
        gold: 'Золотой',
        silver: 'Серебряный',
        standard: 'Стандартный',
      },
      reliability: {
        standard_supplier: 'Стандартный поставщик',
        declared_supplier: 'Заявленный поставщик',
        observer: 'Наблюдатель',
      },
    };

    return labels[type]?.[levelKey] || levelKey;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create evaluator and calculate breakdown
 */
export function evaluatePremiums(
  context: BatchPremiumContext,
  basePricePerKg: number,
  premiumSettings: PremiumSetting[]
): PremiumBreakdown {
  const evaluator = new PremiumEvaluator(premiumSettings);
  return evaluator.calculateBreakdown(context, basePricePerKg);
}

/**
 * Get tier progress for farmer dashboard
 */
export function getFarmerTierProgress(
  fulfilledBatches: number,
  deliveryRate: number,
  monthsActive: number
): TierProgressInfo {
  const { currentTier, nextTier, requirements } = getNextVolumeConsistencyTier(
    fulfilledBatches,
    deliveryRate,
    monthsActive
  );

  const progress = calculateTierProgress(fulfilledBatches, deliveryRate, monthsActive);

  return {
    currentTier,
    nextTier,
    progress,
    requirements,
  };
}
