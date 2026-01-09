/**
 * BATCH STATUS PANEL
 * 
 * Simplified panel for managing batch status transitions.
 * Provides clear, user-friendly explanations without technical jargon.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Shield,
  Circle,
  Info,
  XCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_DESCRIPTIONS,
  type BatchLifecycleStatus,
  getAllowedTransitions,
  getTransitionActionLabel,
  isBatchReadOnly,
  getStatusIndex,
  getTransitionConfirmation,
  requiresTransitionConfirmation,
  getConfirmationDialogLabels,
  validateTransitionComplete,
} from '@/lib/batch-lifecycle';
import {
  validateBatchTransition,
  formatValidationError,
} from '@/lib/batch-transition-guard';
import { type MatchingWindow } from '@/lib/matching-window';

interface BatchFSMPanelProps {
  currentStatus: BatchLifecycleStatus;
  batchId: string;
  onTransition: (toStatus: BatchLifecycleStatus) => Promise<void>;
  isTransitioning?: boolean;
  isTimeLocked?: boolean;
  timeLockTooltip?: string;
  matchingWindow?: MatchingWindow | null;
}

// Simple status descriptions for farmers (simplified FSM v2)
const getSimpleStatusDescription = (status: BatchLifecycleStatus, lang: 'ru' | 'en'): string => {
  if (lang === 'ru') {
    switch (status) {
      case 'draft':
        return 'Черновик — партия создана, но ещё не опубликована';
      case 'available':
        return 'Доступно — партия опубликована и видна покупателям';
      case 'committed':
        return 'Подтверждено — твёрдое обязательство, готово к сопоставлению';
      case 'completed':
        return 'Завершено — партия доставлена и оплачена';
      default:
        return BATCH_STATUS_DESCRIPTIONS[status];
    }
  } else {
    switch (status) {
      case 'draft':
        return 'Draft — batch created but not yet published';
      case 'available':
        return 'Available — batch is published and visible to buyers';
      case 'committed':
        return 'Committed — firm commitment, ready for matching';
      case 'completed':
        return 'Completed — batch delivered and paid';
      default:
        return BATCH_STATUS_DESCRIPTIONS[status];
    }
  }
};

export function BatchFSMPanel({
  currentStatus,
  batchId,
  onTransition,
  isTransitioning = false,
  isTimeLocked = false,
  timeLockTooltip = 'Edits are locked due to the Matching Window deadline.',
  matchingWindow,
}: BatchFSMPanelProps) {
  const { t } = useTranslation();
  const { role } = useRole();
  const { toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    toStatus: BatchLifecycleStatus | null;
    title: string;
    message: string;
    warning?: string;
  }>({
    open: false,
    toStatus: null,
    title: '',
    message: '',
  });

  const isReadOnly = isBatchReadOnly(currentStatus);
  const currentIndex = getStatusIndex(currentStatus);
  const userRole = role as 'farmer' | 'admin' | 'mpk';

  // Get all allowed transitions for current user
  const allowedTransitions = getAllowedTransitions(currentStatus, userRole);

  /**
   * Execute transition with validation
   */
  const executeValidatedTransition = async (toStatus: BatchLifecycleStatus): Promise<boolean> => {
    // Get current language for validation
    const lang = localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en';
    
    // Validate transition
    const validation = validateBatchTransition(
      currentStatus,
      toStatus,
      userRole,
      matchingWindow,
      lang
    );
    
    if (!validation.allowed) {
      const errorInfo = formatValidationError(validation, lang);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      return false;
    }
    
    try {
      await onTransition(toStatus);
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('common.unexpectedError', 'An unexpected error occurred.'),
      });
      return false;
    }
  };

  // Handle transition with confirmation for critical ones
  const handleTransitionClick = async (toStatus: BatchLifecycleStatus) => {
    // Get current language for validation
    const lang = localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en';
    
    // Pre-validate before showing confirmation dialog
    const preValidation = validateBatchTransition(
      currentStatus,
      toStatus,
      userRole,
      matchingWindow,
      lang
    );
    
    if (!preValidation.allowed) {
      const errorInfo = formatValidationError(preValidation, lang);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      return;
    }

    // Check if transition requires confirmation
    const confirmation = getTransitionConfirmation(currentStatus, toStatus, lang);
    
    if (requiresTransitionConfirmation(currentStatus, toStatus)) {
      setConfirmDialog({
        open: true,
        toStatus,
        title: confirmation.title,
        message: confirmation.message,
        warning: confirmation.warning,
      });
      return;
    }

    // Direct transition for non-critical ones
    await executeValidatedTransition(toStatus);
  };

  const handleConfirmTransition = async () => {
    if (confirmDialog.toStatus) {
      await executeValidatedTransition(confirmDialog.toStatus);
    }
    setConfirmDialog({ open: false, toStatus: null, title: '', message: '' });
  };

  // Get status style based on position relative to current
  const getStatusStyle = (status: BatchLifecycleStatus, index: number) => {
    if (status === currentStatus) {
      return 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2';
    }
    if (index < currentIndex) {
      return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
    }
    return 'bg-secondary text-muted-foreground';
  };

  // Get icon for status
  const getStatusIcon = (status: BatchLifecycleStatus, index: number) => {
    if (status === currentStatus) {
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
    if (index < currentIndex) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (isBatchReadOnly(status)) {
      return <Lock className="w-3.5 h-3.5" />;
    }
    return <Circle className="w-3.5 h-3.5" />;
  };

  // Check if action would be blocked and why
  const getActionStatus = (toStatus: BatchLifecycleStatus): {
    allowed: boolean;
    reason: string;
    type: 'allowed' | 'admin_only' | 'blocked' | 'invalid';
  } => {
    const validation = validateTransitionComplete(currentStatus, toStatus, userRole);
    
    if (validation.valid) {
      return { allowed: true, reason: '', type: 'allowed' };
    }

    // Check if it's just admin-only
    const adminValidation = validateTransitionComplete(currentStatus, toStatus, 'admin');
    if (adminValidation.valid && userRole !== 'admin') {
      return { 
        allowed: false, 
        reason: t('batchLifecycle.adminOnly', 'This action requires Admin privileges.'), 
        type: 'admin_only' 
      };
    }

    // Check for going backwards
    const toIndex = getStatusIndex(toStatus);
    if (toIndex < currentIndex) {
      return {
        allowed: false,
        reason: t('batchLifecycle.cannotRevert', 'Cannot revert to a previous status. The batch lifecycle is irreversible.'),
        type: 'blocked',
      };
    }

    // Transition not defined
    return {
      allowed: false,
      reason: validation.error || t('batchLifecycle.cannotSkip', 'This transition is not allowed from the current status.'),
      type: 'invalid',
    };
  };

  return (
    <>
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('batchStatusPanel.title')}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {t('batchStatusPanel.description')}
              </CardDescription>
            </div>
            {isReadOnly && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                <Lock className="w-3 h-3 mr-1" />
                {t('batchStatusPanel.readOnly')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Display */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {t('batchStatusPanel.currentStatus')}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                {BATCH_STATUS_LABELS[currentStatus]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t('batchStatusPanel.stage')} {currentIndex + 1} {t('common.of', 'of')} {BATCH_STATUSES.length}
              </span>
            </div>
            <p className="text-sm text-foreground mt-2">
              {getSimpleStatusDescription(currentStatus, localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en')}
            </p>
          </div>

          {/* Lifecycle Progress */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {t('batchStatusPanel.lifecycle')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BATCH_STATUSES.map((status, index) => {
                const isPast = index < currentIndex;
                const isCurrent = status === currentStatus;
                const isFuture = index > currentIndex;
                const isLocked = isBatchReadOnly(status);
                const isAdminOnly = status === 'completed';
                const lang = localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en';
                
                // Determine tooltip content
                const getTooltipInfo = () => {
                  if (isPast) {
                    return { 
                      label: t('batchStatusPanel.statusLabels.completed'), 
                      className: 'text-emerald-500' 
                    };
                  }
                  if (isCurrent) {
                    return { 
                      label: t('batchStatusPanel.statusLabels.current'), 
                      className: 'text-primary' 
                    };
                  }
                  if (isAdminOnly) {
                    return { 
                      label: t('batchStatusPanel.statusLabels.adminOnly'), 
                      className: 'text-amber-500' 
                    };
                  }
                  if (isLocked) {
                    return { 
                      label: t('batchStatusPanel.statusLabels.locked'), 
                      className: 'text-muted-foreground' 
                    };
                  }
                  return { 
                    label: t('batchStatusPanel.statusLabels.pending'), 
                    className: 'text-muted-foreground' 
                  };
                };
                
                const tooltipInfo = getTooltipInfo();
                
                return (
                  <TooltipProvider key={status}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-default select-none ${getStatusStyle(status, index)}`}
                          aria-label={`${BATCH_STATUS_LABELS[status]} - ${tooltipInfo.label}`}
                        >
                          {getStatusIcon(status, index)}
                          <span>{BATCH_STATUS_LABELS[status]}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="font-medium">{BATCH_STATUS_LABELS[status]}</p>
                        <p className="text-xs text-muted-foreground">
                          {getSimpleStatusDescription(status, lang)}
                        </p>
                        <p className={`text-xs mt-1 ${tooltipInfo.className}`}>
                          {tooltipInfo.label}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              {t('batchStatusPanel.useButtons')}
            </p>
          </div>

          {/* Time-Locked Message */}
          {isTimeLocked && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700">
                {timeLockTooltip || t('batchStatusPanel.timeLocked')}
              </AlertDescription>
            </Alert>
          )}

          {/* Read-Only Lock Message */}
          {isReadOnly && !isTimeLocked && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700">
                {t('batchStatusPanel.readOnlyMessage')}
              </AlertDescription>
            </Alert>
          )}

          {/* Available Actions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {t('batchStatusPanel.availableActions')}
            </p>
            
            {isTimeLocked ? (
              <div className="text-center py-4 text-muted-foreground">
                <Lock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {t('batchStatusPanel.timeLocked')}
                </p>
              </div>
            ) : allowedTransitions.length > 0 ? (
              <div className="space-y-2">
                {allowedTransitions.map((toStatus) => (
                  <Button
                    key={toStatus}
                    className="w-full justify-between"
                    variant={toStatus === 'committed' ? 'default' : 'outline'}
                    onClick={() => handleTransitionClick(toStatus)}
                    disabled={isTransitioning}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      {getTransitionActionLabel(toStatus)}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      → {BATCH_STATUS_LABELS[toStatus]}
                    </Badge>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Info className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isReadOnly 
                    ? t('batchStatusPanel.noActionsReadOnly')
                    : userRole === 'farmer'
                    ? t('batchStatusPanel.noActionsFarmer')
                    : t('batchStatusPanel.noActionsOther')}
                </p>
              </div>
            )}
          </div>

          {/* Helpful Info */}
          <div className="pt-3 border-t">
            <Alert className="border-blue-500/30 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-muted-foreground">
                {t('batchStatusPanel.helpText')}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) setConfirmDialog({ open: false, toStatus: null, title: '', message: '' });
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{confirmDialog.message}</p>
              {confirmDialog.warning && (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-700">
                    {confirmDialog.warning}
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {getConfirmationDialogLabels(localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en').cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransition}>
              {getConfirmationDialogLabels(localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en').confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
