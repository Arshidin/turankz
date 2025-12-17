import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main message explaining the empty state */
  message: string;
  /** Helper text providing context for the next action */
  helperText?: string;
  /** Primary action button text */
  actionLabel?: string;
  /** Callback for primary action */
  onAction?: () => void;
  /** Optional secondary action */
  secondaryActionLabel?: string;
  /** Callback for secondary action */
  onSecondaryAction?: () => void;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState - Guides users toward the right first action
 * 
 * Design principles:
 * - Short, neutral, operational messages
 * - One clear explanation + one clear next action
 * - No tutorials, walkthroughs, or instructional language
 */
export function EmptyState({
  icon: Icon,
  message,
  helperText,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'w-8 h-8',
      iconWrapper: 'w-12 h-12',
      message: 'text-sm',
      helper: 'text-xs',
    },
    md: {
      container: 'py-10',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      message: 'text-base',
      helper: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      message: 'text-lg',
      helper: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizes.container,
      className
    )}>
      <div className={cn(
        'rounded-full bg-muted/50 flex items-center justify-center mb-4',
        sizes.iconWrapper
      )}>
        <Icon className={cn('text-muted-foreground/60', sizes.icon)} />
      </div>
      
      <p className={cn('font-medium text-foreground mb-1', sizes.message)}>
        {message}
      </p>
      
      {helperText && (
        <p className={cn('text-muted-foreground max-w-sm mb-4', sizes.helper)}>
          {helperText}
        </p>
      )}
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-2 mt-2">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline" 
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * InlineEmptyState - Compact empty state for tables and lists
 */
export function InlineEmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-center">
      <span className="text-sm text-muted-foreground">{message}</span>
      {actionLabel && onAction && (
        <Button variant="link" size="sm" onClick={onAction} className="h-auto p-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * FilterEmptyState - For when filters return no results
 */
export function FilterEmptyState({
  entityName,
  onClearFilters,
}: {
  entityName: string;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        No {entityName} found for selected criteria.
      </p>
      {onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
