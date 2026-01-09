/**
 * INLINE CONFIRMATION COMPONENT
 *
 * Sprint 3: Simplified confirmation UI that replaces modal dialogs
 * for less critical actions. Uses a 3-second countdown timer.
 *
 * Features:
 * - No modal interruption
 * - Visual countdown feedback
 * - Can be cancelled before completion
 * - Supports warning banners for context
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

interface InlineConfirmationProps {
  /** Button label before confirmation */
  label: string;
  /** Action to execute after confirmation */
  onConfirm: () => void | Promise<void>;
  /** Countdown duration in seconds (default: 3) */
  countdownSeconds?: number;
  /** Optional warning message shown during countdown */
  warningMessage?: string;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional button classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to show */
  icon?: React.ReactNode;
}

type ConfirmationState = 'idle' | 'countdown' | 'executing';

export function InlineConfirmation({
  label,
  onConfirm,
  countdownSeconds = 3,
  warningMessage,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  icon,
}: InlineConfirmationProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfirmationState>('idle');
  const [countdown, setCountdown] = useState(countdownSeconds);

  // Reset when props change
  useEffect(() => {
    setCountdown(countdownSeconds);
  }, [countdownSeconds]);

  // Countdown logic
  useEffect(() => {
    if (state !== 'countdown') return;

    if (countdown <= 0) {
      handleExecute();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, countdown]);

  const handleClick = useCallback(() => {
    if (state === 'idle') {
      setState('countdown');
      setCountdown(countdownSeconds);
    }
  }, [state, countdownSeconds]);

  const handleCancel = useCallback(() => {
    setState('idle');
    setCountdown(countdownSeconds);
  }, [countdownSeconds]);

  const handleExecute = useCallback(async () => {
    setState('executing');
    try {
      await onConfirm();
    } finally {
      setState('idle');
      setCountdown(countdownSeconds);
    }
  }, [onConfirm, countdownSeconds]);

  // Render countdown button
  if (state === 'countdown') {
    return (
      <div className="inline-flex flex-col gap-1">
        {warningMessage && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}
        <div className="inline-flex items-center gap-1">
          <Button
            variant="destructive"
            size={size}
            className={cn('min-w-[100px] relative overflow-hidden', className)}
            disabled
          >
            {/* Progress bar */}
            <div
              className="absolute inset-0 bg-destructive/50 transition-all duration-1000"
              style={{ width: `${(countdown / countdownSeconds) * 100}%` }}
            />
            <span className="relative z-10">
              {t('inlineConfirmation.confirm', 'Confirm')} ({countdown})
            </span>
          </Button>
          <Button
            variant="outline"
            size={size === 'icon' ? 'icon' : 'sm'}
            onClick={handleCancel}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Render executing state
  if (state === 'executing') {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {t('common.loading', 'Loading...')}
      </Button>
    );
  }

  // Render idle state
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Button>
  );
}

/**
 * Inline confirmation with warning banner displayed above
 * For more visible confirmations without full modal
 */
interface InlineConfirmationBannerProps {
  /** Is the banner visible */
  show: boolean;
  /** Banner title */
  title: string;
  /** Banner message */
  message: string;
  /** Confirm button label */
  confirmLabel: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm action */
  onConfirm: () => void | Promise<void>;
  /** Cancel/dismiss action */
  onCancel: () => void;
  /** Is action in progress */
  isLoading?: boolean;
  /** Variant for styling */
  variant?: 'warning' | 'danger' | 'info';
}

export function InlineConfirmationBanner({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'warning',
}: InlineConfirmationBannerProps) {
  const { t } = useTranslation();

  if (!show) return null;

  const variantStyles = {
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-800',
      message: 'text-amber-700',
    },
    danger: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'rounded-lg border p-4 mb-4 animate-in slide-in-from-top-2',
      styles.bg
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', styles.icon)} />
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-medium text-sm', styles.title)}>{title}</h4>
          <p className={cn('text-sm mt-1', styles.message)}>{message}</p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant={variant === 'danger' ? 'destructive' : 'default'}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  {t('common.loading', 'Loading...')}
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1.5" />
                  {confirmLabel}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel || t('common.cancel', 'Cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
