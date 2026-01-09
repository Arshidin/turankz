/**
 * VALIDATION MESSAGE FORMATTER
 *
 * Sprint 6 Task 9.7.1: Centralized validation message formatting.
 * Provides consistent messaging style across the platform:
 * "Action blocked: [Reason]. [What to do next]"
 *
 * Supports:
 * - FSM transition errors
 * - Field validation errors
 * - Permission errors
 * - Business rule violations
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface FormattedValidationMessage {
  /** Formatted message in English */
  message: string;
  /** Formatted message in Russian */
  messageRu: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Action that was blocked (optional) */
  blockedAction?: string;
  /** Reason for the block */
  reason: string;
  /** What user should do next */
  nextStep?: string;
}

// ============================================
// FSM TRANSITION ERROR FORMATTING
// ============================================

/**
 * Format FSM transition error message
 *
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @param entityType - Type of entity (batch, pool_request, matching)
 * @param errorType - Type of error (invalid_transition, no_permission, skipped_step)
 *
 * @example
 * formatTransitionError('draft', 'confirmed', 'batch', 'skipped_step')
 * // Returns: "Action blocked: Cannot skip from Draft to Confirmed. Submit as Forecast first."
 */
export function formatTransitionError(
  fromStatus: string,
  toStatus: string,
  entityType: 'batch' | 'pool_request' | 'matching' = 'batch',
  errorType: 'invalid_transition' | 'no_permission' | 'skipped_step' | 'reversion' = 'invalid_transition'
): FormattedValidationMessage {
  const fromLabel = capitalize(fromStatus.replace(/_/g, ' '));
  const toLabel = capitalize(toStatus.replace(/_/g, ' '));
  const entityLabel = getEntityLabel(entityType);
  const entityLabelRu = getEntityLabelRu(entityType);

  switch (errorType) {
    case 'skipped_step':
      return {
        message: `Action blocked: Cannot skip from ${fromLabel} to ${toLabel}. ${getSkipStepGuidance(fromStatus, toStatus, entityType)}`,
        messageRu: `Действие заблокировано: Нельзя перейти из "${fromLabel}" в "${toLabel}" напрямую. ${getSkipStepGuidanceRu(fromStatus, toStatus, entityType)}`,
        severity: 'error',
        blockedAction: `Status change to ${toLabel}`,
        reason: 'Step cannot be skipped',
        nextStep: getSkipStepGuidance(fromStatus, toStatus, entityType),
      };

    case 'reversion':
      return {
        message: `Action blocked: Cannot revert ${entityLabel} from ${fromLabel} to ${toLabel}. Status changes are irreversible.`,
        messageRu: `Действие заблокировано: Невозможно вернуть ${entityLabelRu} из "${fromLabel}" в "${toLabel}". Изменения статуса необратимы.`,
        severity: 'error',
        blockedAction: `Revert to ${toLabel}`,
        reason: 'Lifecycle is forward-only',
        nextStep: 'Create a new record if needed',
      };

    case 'no_permission':
      return {
        message: `Action blocked: You don't have permission to change ${entityLabel} from ${fromLabel} to ${toLabel}. Contact an administrator.`,
        messageRu: `Действие заблокировано: У вас нет прав для изменения ${entityLabelRu} из "${fromLabel}" в "${toLabel}". Обратитесь к администратору.`,
        severity: 'error',
        blockedAction: `Status change to ${toLabel}`,
        reason: 'Insufficient permissions',
        nextStep: 'Contact administrator for assistance',
      };

    case 'invalid_transition':
    default:
      return {
        message: `Action blocked: Invalid transition from ${fromLabel} to ${toLabel}. This status change is not allowed.`,
        messageRu: `Действие заблокировано: Некорректный переход из "${fromLabel}" в "${toLabel}". Этот переход недопустим.`,
        severity: 'error',
        blockedAction: `Status change to ${toLabel}`,
        reason: 'Transition not allowed by workflow',
        nextStep: 'Review the allowed workflow steps',
      };
  }
}

// ============================================
// FIELD VALIDATION ERROR FORMATTING
// ============================================

/**
 * Field validation error types
 */
export type FieldErrorType =
  | 'required'
  | 'min_value'
  | 'max_value'
  | 'range'
  | 'format'
  | 'duplicate'
  | 'locked'
  | 'invalid';

/**
 * Format field validation error message
 *
 * @param field - Field name
 * @param errorType - Type of validation error
 * @param details - Additional error details
 *
 * @example
 * formatFieldError('weight_min', 'min_value', { min: 100, actual: 50 })
 * // Returns: "Action blocked: Minimum Weight must be at least 100. Current value: 50."
 */
export function formatFieldError(
  field: string,
  errorType: FieldErrorType,
  details?: {
    min?: number;
    max?: number;
    actual?: number | string;
    format?: string;
    existingValue?: string;
  }
): FormattedValidationMessage {
  const fieldLabel = getFieldLabel(field);
  const fieldLabelRu = getFieldLabelRu(field);

  switch (errorType) {
    case 'required':
      return {
        message: `Action blocked: ${fieldLabel} is required. Please provide a value.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" обязательно для заполнения. Укажите значение.`,
        severity: 'error',
        reason: 'Required field is empty',
        nextStep: `Enter a value for ${fieldLabel}`,
      };

    case 'min_value':
      return {
        message: `Action blocked: ${fieldLabel} must be at least ${details?.min}. Current value: ${details?.actual}.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" должно быть не менее ${details?.min}. Текущее значение: ${details?.actual}.`,
        severity: 'error',
        reason: `Value below minimum (${details?.min})`,
        nextStep: `Increase the value to at least ${details?.min}`,
      };

    case 'max_value':
      return {
        message: `Action blocked: ${fieldLabel} cannot exceed ${details?.max}. Current value: ${details?.actual}.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" не может превышать ${details?.max}. Текущее значение: ${details?.actual}.`,
        severity: 'error',
        reason: `Value above maximum (${details?.max})`,
        nextStep: `Reduce the value to at most ${details?.max}`,
      };

    case 'range':
      return {
        message: `Action blocked: ${fieldLabel} must be between ${details?.min} and ${details?.max}. Current value: ${details?.actual}.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" должно быть от ${details?.min} до ${details?.max}. Текущее значение: ${details?.actual}.`,
        severity: 'error',
        reason: `Value out of valid range (${details?.min}-${details?.max})`,
        nextStep: `Adjust the value to be within the valid range`,
      };

    case 'format':
      return {
        message: `Action blocked: ${fieldLabel} has invalid format. Expected: ${details?.format}.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" имеет неверный формат. Ожидается: ${details?.format}.`,
        severity: 'error',
        reason: 'Invalid format',
        nextStep: `Correct the format to match: ${details?.format}`,
      };

    case 'duplicate':
      return {
        message: `Action blocked: ${fieldLabel} already exists with value "${details?.existingValue}". Choose a different value.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" уже существует со значением "${details?.existingValue}". Выберите другое значение.`,
        severity: 'error',
        reason: 'Duplicate value',
        nextStep: 'Use a unique value',
      };

    case 'locked':
      return {
        message: `Action blocked: ${fieldLabel} is locked and cannot be modified. The record status prevents changes.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" заблокировано и не может быть изменено. Статус записи не позволяет вносить изменения.`,
        severity: 'error',
        reason: 'Field is locked',
        nextStep: 'Contact administrator if changes are required',
      };

    case 'invalid':
    default:
      return {
        message: `Action blocked: ${fieldLabel} contains an invalid value. Please check and correct it.`,
        messageRu: `Действие заблокировано: "${fieldLabelRu}" содержит недопустимое значение. Проверьте и исправьте.`,
        severity: 'error',
        reason: 'Invalid value',
        nextStep: 'Review and correct the field value',
      };
  }
}

// ============================================
// BUSINESS RULE VALIDATION FORMATTING
// ============================================

/**
 * Business rule violation types
 */
export type BusinessRuleViolation =
  | 'matching_window_closed'
  | 'matching_window_not_started'
  | 'volume_exceeded'
  | 'delivery_period_mismatch'
  | 'region_mismatch'
  | 'grade_mismatch'
  | 'already_matched'
  | 'insufficient_volume';

/**
 * Format business rule validation error
 *
 * @param violation - Type of business rule violation
 * @param details - Additional context
 */
export function formatBusinessRuleError(
  violation: BusinessRuleViolation,
  details?: Record<string, string | number>
): FormattedValidationMessage {
  switch (violation) {
    case 'matching_window_closed':
      return {
        message: `Action blocked: Matching window is closed. Submissions are no longer accepted.`,
        messageRu: `Действие заблокировано: Окно сопоставления закрыто. Новые заявки больше не принимаются.`,
        severity: 'error',
        reason: 'Matching window deadline has passed',
        nextStep: 'Wait for the next matching window to open',
      };

    case 'matching_window_not_started':
      return {
        message: `Action blocked: Matching window has not started yet. Please wait for it to open.`,
        messageRu: `Действие заблокировано: Окно сопоставления ещё не началось. Дождитесь открытия.`,
        severity: 'error',
        reason: 'Matching window is not active',
        nextStep: 'Wait for the window to start',
      };

    case 'volume_exceeded':
      return {
        message: `Action blocked: Selected volume (${details?.selected}) exceeds remaining need (${details?.remaining}). Reduce selection.`,
        messageRu: `Действие заблокировано: Выбранный объём (${details?.selected}) превышает оставшуюся потребность (${details?.remaining}). Уменьшите выбор.`,
        severity: 'error',
        reason: 'Volume exceeds demand',
        nextStep: `Reduce selection to at most ${details?.remaining}`,
      };

    case 'delivery_period_mismatch':
      return {
        message: `Action blocked: Delivery period mismatch. Batch: ${details?.batchPeriod}, Request: ${details?.requestPeriod}.`,
        messageRu: `Действие заблокировано: Несоответствие периода доставки. Партия: ${details?.batchPeriod}, Заявка: ${details?.requestPeriod}.`,
        severity: 'warning',
        reason: 'Delivery periods do not match',
        nextStep: 'Select a batch with matching delivery period or request admin override',
      };

    case 'region_mismatch':
      return {
        message: `Action blocked: Region mismatch. Batch from ${details?.batchRegion}, Request accepts ${details?.requestRegions}.`,
        messageRu: `Действие заблокировано: Несоответствие региона. Партия из ${details?.batchRegion}, Заявка принимает ${details?.requestRegions}.`,
        severity: 'warning',
        reason: 'Region not in accepted list',
        nextStep: 'Select a batch from an accepted region',
      };

    case 'grade_mismatch':
      return {
        message: `Action blocked: Grade mismatch. Batch: ${details?.batchGrade}, Request requires: ${details?.requestGrade}.`,
        messageRu: `Действие заблокировано: Несоответствие грейда. Партия: ${details?.batchGrade}, Заявка требует: ${details?.requestGrade}.`,
        severity: 'warning',
        reason: 'Grade does not match requirements',
        nextStep: 'Select a batch with the required grade',
      };

    case 'already_matched':
      return {
        message: `Action blocked: This batch is already matched to another request. Cannot match twice.`,
        messageRu: `Действие заблокировано: Эта партия уже сопоставлена с другой заявкой. Повторное сопоставление невозможно.`,
        severity: 'error',
        reason: 'Batch already in use',
        nextStep: 'Select a different batch that is not yet matched',
      };

    case 'insufficient_volume':
      return {
        message: `Action blocked: Batch volume (${details?.available}) is less than minimum required (${details?.minimum}).`,
        messageRu: `Действие заблокировано: Объём партии (${details?.available}) меньше минимально необходимого (${details?.minimum}).`,
        severity: 'error',
        reason: 'Insufficient batch volume',
        nextStep: 'Select a larger batch or combine multiple batches',
      };

    default:
      return {
        message: `Action blocked: Business rule violation. Please review your action.`,
        messageRu: `Действие заблокировано: Нарушение бизнес-правила. Проверьте ваше действие.`,
        severity: 'error',
        reason: 'Business rule not satisfied',
        nextStep: 'Review the requirements and try again',
      };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getEntityLabel(entityType: 'batch' | 'pool_request' | 'matching'): string {
  switch (entityType) {
    case 'batch':
      return 'batch';
    case 'pool_request':
      return 'pool request';
    case 'matching':
      return 'matching';
    default:
      return 'record';
  }
}

function getEntityLabelRu(entityType: 'batch' | 'pool_request' | 'matching'): string {
  switch (entityType) {
    case 'batch':
      return 'партию';
    case 'pool_request':
      return 'заявку';
    case 'matching':
      return 'сопоставление';
    default:
      return 'запись';
  }
}

function getSkipStepGuidance(fromStatus: string, toStatus: string, entityType: string): string {
  // Provide guidance based on common skip patterns
  if (entityType === 'batch') {
    if (fromStatus === 'draft' && toStatus === 'confirmed') {
      return 'Submit as Forecast first, then confirm.';
    }
    if (fromStatus === 'forecast' && toStatus === 'matched') {
      return 'Get soft commitment and confirmation before matching.';
    }
  }
  if (entityType === 'pool_request') {
    if (fromStatus === 'draft' && toStatus === 'matching') {
      return 'Submit the request first, then start matching.';
    }
    if (fromStatus === 'submitted' && toStatus === 'fulfilled') {
      return 'Start matching process and partial fulfillment first.';
    }
  }
  return 'Follow the required workflow steps in order.';
}

function getSkipStepGuidanceRu(fromStatus: string, toStatus: string, entityType: string): string {
  if (entityType === 'batch') {
    if (fromStatus === 'draft' && toStatus === 'confirmed') {
      return 'Сначала подайте как Прогноз, затем подтвердите.';
    }
    if (fromStatus === 'forecast' && toStatus === 'matched') {
      return 'Сначала получите soft commitment и подтверждение.';
    }
  }
  if (entityType === 'pool_request') {
    if (fromStatus === 'draft' && toStatus === 'matching') {
      return 'Сначала подайте заявку, затем начните сопоставление.';
    }
    if (fromStatus === 'submitted' && toStatus === 'fulfilled') {
      return 'Сначала начните процесс сопоставления.';
    }
  }
  return 'Следуйте шагам рабочего процесса по порядку.';
}

/**
 * Field name to label mapping
 */
const FIELD_LABELS: Record<string, string> = {
  weight_min: 'Minimum Weight',
  weight_max: 'Maximum Weight',
  age_min: 'Minimum Age',
  age_max: 'Maximum Age',
  head_count: 'Head Count',
  required_volume: 'Required Volume',
  target_week: 'Target Week',
  regions: 'Target Regions',
  delivery_period: 'Delivery Period',
  grade: 'Quality Grade',
  region: 'Region',
};

const FIELD_LABELS_RU: Record<string, string> = {
  weight_min: 'Минимальный вес',
  weight_max: 'Максимальный вес',
  age_min: 'Минимальный возраст',
  age_max: 'Максимальный возраст',
  head_count: 'Количество голов',
  required_volume: 'Требуемый объём',
  target_week: 'Целевая неделя',
  regions: 'Целевые регионы',
  delivery_period: 'Период доставки',
  grade: 'Грейд качества',
  region: 'Регион',
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || capitalize(field.replace(/_/g, ' '));
}

function getFieldLabelRu(field: string): string {
  return FIELD_LABELS_RU[field] || field;
}

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Format any validation error to a simple string
 */
export function formatValidationMessageSimple(
  message: FormattedValidationMessage,
  lang: 'en' | 'ru' = 'en'
): string {
  return lang === 'ru' ? message.messageRu : message.message;
}

/**
 * Create a toast-friendly message
 */
export function formatForToast(
  message: FormattedValidationMessage,
  lang: 'en' | 'ru' = 'en'
): { title: string; description: string } {
  if (lang === 'ru') {
    return {
      title: message.severity === 'error' ? 'Ошибка' : message.severity === 'warning' ? 'Предупреждение' : 'Информация',
      description: message.messageRu,
    };
  }
  return {
    title: message.severity === 'error' ? 'Error' : message.severity === 'warning' ? 'Warning' : 'Info',
    description: message.message,
  };
}