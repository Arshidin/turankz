/**
 * UNIFIED BATCH TRANSITION GUARD
 * 
 * Combines FSM validation and time-based validation into a single guard.
 * This guard MUST be called immediately before any batch state mutation.
 */

import { type MatchingWindow } from './matching-window';
import {
  type BatchLifecycleStatus,
  validateTransitionComplete,
  isBatchReadOnly,
  canEditBatchData,
} from './batch-lifecycle';
import {
  getBatchLockStatus,
  isPastLockDate,
  isWindowLocked,
} from './batch-time-lock';

export type ValidationErrorType = 
  | 'fsm_rule' 
  | 'permission' 
  | 'time_lock' 
  | 'status_lock' 
  | 'invalid';

export interface TransitionValidationResult {
  allowed: boolean;
  errorType?: ValidationErrorType;
  errorMessage: string;
  errorMessageRu: string;
  blockedBy: 'none' | 'lifecycle' | 'time_constraint' | 'both';
}

export interface EditValidationResult {
  allowed: boolean;
  errorType?: ValidationErrorType;
  errorMessage: string;
  errorMessageRu: string;
  blockedBy: 'none' | 'status' | 'time_constraint' | 'both';
}

/**
 * UNIFIED TRANSITION GUARD
 * 
 * Validates a batch status transition against BOTH:
 * 1. FSM rules (status + role permissions)
 * 2. Matching Window time constraints
 * 
 * This guard MUST be called:
 * - After confirmation dialogs
 * - Immediately before any state mutation
 * 
 * @returns TransitionValidationResult with detailed error information
 */
export function validateBatchTransition(
  fromStatus: BatchLifecycleStatus,
  toStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk',
  matchingWindow: MatchingWindow | null | undefined,
  lang: 'en' | 'ru' = 'en'
): TransitionValidationResult {
  // Step 1: Check time-based constraints first (can be overridden by admin)
  const timeLock = getBatchLockStatus(fromStatus, matchingWindow, role);
  
  if (timeLock.isLocked) {
    return {
      allowed: false,
      errorType: 'time_lock',
      errorMessage: 'Action blocked due to Matching Window deadline.',
      errorMessageRu: 'Действие заблокировано из-за дедлайна Окна сопоставления.',
      blockedBy: 'time_constraint',
    };
  }

  // Step 2: Validate FSM rules (status + role permissions)
  const fsmValidation = validateTransitionComplete(fromStatus, toStatus, role);
  
  if (!fsmValidation.valid) {
    const errorType = fsmValidation.errorType || 'fsm_rule';
    
    // Map FSM errors to user-friendly messages
    let errorMessage = 'Action blocked by batch lifecycle rules.';
    let errorMessageRu = 'Действие заблокировано правилами жизненного цикла партии.';
    
    if (fsmValidation.error) {
      errorMessage = fsmValidation.error;
      // Provide Russian translation based on error type
      if (fsmValidation.error.includes('Admin')) {
        errorMessageRu = 'Это действие требует прав Администратора.';
      } else if (fsmValidation.error.includes('revert')) {
        errorMessageRu = 'Невозможно вернуться к предыдущему статусу. Жизненный цикл партии необратим.';
      } else if (fsmValidation.error.includes('Soft Commit')) {
        errorMessageRu = 'Необходимо сначала выполнить предварительное подтверждение.';
      } else if (fsmValidation.error.includes('Confirmed')) {
        errorMessageRu = 'Партия должна быть сначала подтверждена.';
      }
    }
    
    return {
      allowed: false,
      errorType: errorType as ValidationErrorType,
      errorMessage,
      errorMessageRu,
      blockedBy: 'lifecycle',
    };
  }

  // All validations passed
  return {
    allowed: true,
    errorMessage: '',
    errorMessageRu: '',
    blockedBy: 'none',
  };
}

/**
 * UNIFIED EDIT GUARD
 * 
 * Validates a batch edit against BOTH:
 * 1. Status-based edit rules
 * 2. Matching Window time constraints
 * 
 * @returns EditValidationResult with detailed error information
 */
export function validateBatchEdit(
  batchStatus: BatchLifecycleStatus,
  role: 'farmer' | 'admin' | 'mpk',
  matchingWindow: MatchingWindow | null | undefined,
  lang: 'en' | 'ru' = 'en'
): EditValidationResult {
  let statusBlocked = false;
  let timeBlocked = false;

  // Step 1: Check status-based edit rules
  if (isBatchReadOnly(batchStatus)) {
    statusBlocked = true;
  }

  // Step 2: Check time-based constraints
  const timeLock = getBatchLockStatus(batchStatus, matchingWindow, role);
  if (timeLock.isLocked) {
    timeBlocked = true;
  }

  // Determine blocked by
  if (statusBlocked && timeBlocked) {
    return {
      allowed: false,
      errorType: 'status_lock',
      errorMessage: 'Batch is locked by both status and Matching Window deadline.',
      errorMessageRu: 'Партия заблокирована по статусу и из-за дедлайна Окна сопоставления.',
      blockedBy: 'both',
    };
  }

  if (statusBlocked) {
    return {
      allowed: false,
      errorType: 'status_lock',
      errorMessage: 'Batch is confirmed and cannot be edited.',
      errorMessageRu: 'Партия подтверждена и не может быть отредактирована.',
      blockedBy: 'status',
    };
  }

  if (timeBlocked) {
    return {
      allowed: false,
      errorType: 'time_lock',
      errorMessage: 'Edits blocked due to Matching Window deadline.',
      errorMessageRu: 'Редактирование заблокировано из-за дедлайна Окна сопоставления.',
      blockedBy: 'time_constraint',
    };
  }

  return {
    allowed: true,
    errorMessage: '',
    errorMessageRu: '',
    blockedBy: 'none',
  };
}

/**
 * Get a human-readable summary of why an action is blocked
 */
export function getBlockedActionSummary(
  result: TransitionValidationResult | EditValidationResult,
  lang: 'en' | 'ru' = 'en'
): string {
  if (result.allowed) return '';
  
  return lang === 'ru' ? result.errorMessageRu : result.errorMessage;
}

/**
 * Check if transition is blocked specifically by time constraints
 */
export function isBlockedByTimeConstraint(
  result: TransitionValidationResult | EditValidationResult
): boolean {
  return result.blockedBy === 'time_constraint' || result.blockedBy === 'both';
}

/**
 * Check if transition is blocked specifically by lifecycle rules
 */
export function isBlockedByLifecycle(
  result: TransitionValidationResult
): boolean {
  return result.blockedBy === 'lifecycle' || result.blockedBy === 'both';
}

/**
 * Format validation error for toast notification
 */
export function formatValidationError(
  result: TransitionValidationResult | EditValidationResult,
  lang: 'en' | 'ru' = 'en'
): {
  title: string;
  description: string;
} {
  if (result.allowed) {
    return { title: '', description: '' };
  }

  const isTimeLock = isBlockedByTimeConstraint(result);
  
  if (lang === 'ru') {
    return {
      title: isTimeLock ? 'Заблокировано по времени' : 'Действие запрещено',
      description: result.errorMessageRu,
    };
  }

  return {
    title: isTimeLock ? 'Time-Locked' : 'Action Blocked',
    description: result.errorMessage,
  };
}
