/**
 * BATCH FSM VERIFICATION PANEL
 * 
 * Displays the batch lifecycle state machine with:
 * - Current status visualization
 * - Allowed next actions based on role
 * - Disabled actions with explanatory tooltips
 * - Lock icons for read-only states
 * - Confirmation dialogs for critical transitions
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
  XCircle
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_DESCRIPTIONS,
  type BatchLifecycleStatus,
  isTransitionAllowed,
  getAllowedTransitions,
  getTransitionActionLabel,
  getDisabledTransitionTooltip,
  isBatchReadOnly,
  getLockedFieldTooltip,
  validateTransitionComplete,
  getStatusIndex,
  getTransitionConfirmation,
  requiresTransitionConfirmation,
  getConfirmationDialogLabels,
} from '@/lib/batch-lifecycle';

interface BatchFSMPanelProps {
  currentStatus: BatchLifecycleStatus;
  batchId: string;
  onTransition: (toStatus: BatchLifecycleStatus) => Promise<void>;
  isTransitioning?: boolean;
}

export function BatchFSMPanel({
  currentStatus,
  batchId,
  onTransition,
  isTransitioning = false,
}: BatchFSMPanelProps) {
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

  // Get all allowed transitions for current user (array-based, no linear assumptions)
  const allowedTransitions = getAllowedTransitions(currentStatus, userRole);

  // Get current language
  const getCurrentLang = (): 'en' | 'ru' => {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('i18nextLng') || 'ru';
      return lang.startsWith('ru') ? 'ru' : 'en';
    }
    return 'ru';
  };

  /**
   * MANDATORY PRE-TRANSITION VALIDATION
   * Re-validates the transition immediately before execution to prevent:
   * - Race conditions from stale state
   * - Client-side bypasses
   * - Unauthorized transitions
   */
  const executeValidatedTransition = async (toStatus: BatchLifecycleStatus): Promise<boolean> => {
    const lang = getCurrentLang();
    
    // Re-run domain validation immediately before mutation
    const validation = validateTransitionComplete(currentStatus, toStatus, userRole);
    
    if (!validation.valid) {
      toast({
        variant: 'destructive',
        title: lang === 'ru' ? 'Переход заблокирован' : 'Transition Blocked',
        description: validation.error || (lang === 'ru' ? 'Этот переход статуса не разрешён.' : 'This status transition is not allowed.'),
      });
      return false;
    }
    
    try {
      await onTransition(toStatus);
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: lang === 'ru' ? 'Ошибка перехода' : 'Transition Failed',
        description: error instanceof Error ? error.message : (lang === 'ru' ? 'Произошла непредвиденная ошибка.' : 'An unexpected error occurred.'),
      });
      return false;
    }
  };

  // Handle transition with confirmation for critical ones
  const handleTransitionClick = async (toStatus: BatchLifecycleStatus) => {
    const lang = getCurrentLang();
    
    // Pre-validate before showing confirmation dialog
    const preValidation = validateTransitionComplete(currentStatus, toStatus, userRole);
    if (!preValidation.valid) {
      toast({
        variant: 'destructive',
        title: lang === 'ru' ? 'Действие запрещено' : 'Action Not Allowed',
        description: preValidation.error || (lang === 'ru' ? 'Этот переход не разрешён.' : 'This transition is not permitted.'),
      });
      return;
    }

    // Check if transition requires confirmation (from domain layer)
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

    // Direct transition for non-critical ones (with validation)
    await executeValidatedTransition(toStatus);
  };

  const handleConfirmTransition = async () => {
    if (confirmDialog.toStatus) {
      // Re-validate after confirmation dialog (prevents stale state)
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
      return 'bg-muted text-muted-foreground line-through opacity-60';
    }
    return 'bg-secondary text-muted-foreground';
  };

  // Get icon for status
  const getStatusIcon = (status: BatchLifecycleStatus, index: number) => {
    if (status === currentStatus) {
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
    if (index < currentIndex) {
      return <CheckCircle2 className="w-3.5 h-3.5 opacity-50" />;
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
        reason: 'This action requires Admin privileges.', 
        type: 'admin_only' 
      };
    }

    // Check for going backwards
    const toIndex = getStatusIndex(toStatus);
    if (toIndex < currentIndex) {
      return {
        allowed: false,
        reason: 'Cannot revert to a previous status. The batch lifecycle is irreversible.',
        type: 'blocked',
      };
    }

    // Transition not defined in FSM
    return {
      allowed: false,
      reason: validation.error || 'This transition is not allowed from the current status.',
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
                <Shield className="w-4 h-4 text-primary" />
                Batch Status & Rules
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                FSM Verification Panel
              </CardDescription>
            </div>
            {isReadOnly && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                <Lock className="w-3 h-3 mr-1" />
                Read-Only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Display */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Current Status
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                {BATCH_STATUS_LABELS[currentStatus]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Stage {currentIndex + 1} of {BATCH_STATUSES.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {BATCH_STATUS_DESCRIPTIONS[currentStatus]}
            </p>
          </div>

          {/* Lifecycle Progress (Read-Only Visualization) */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Lifecycle Progress
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BATCH_STATUSES.map((status, index) => {
                const isPast = index < currentIndex;
                const isCurrent = status === currentStatus;
                const isFuture = index > currentIndex;
                const isLocked = isBatchReadOnly(status);
                const isAdminOnly = status === 'matched' || status === 'closed';
                
                // Determine tooltip content based on stage state
                const getTooltipInfo = () => {
                  if (isPast) {
                    return { label: '✓ Completed', className: 'text-emerald-500' };
                  }
                  if (isCurrent) {
                    return { label: '● Current Stage', className: 'text-primary' };
                  }
                  if (isAdminOnly) {
                    return { label: '🔒 Admin Only', className: 'text-amber-500' };
                  }
                  if (isLocked) {
                    return { label: '🔒 Locked Stage', className: 'text-muted-foreground' };
                  }
                  return { label: '○ Pending', className: 'text-muted-foreground' };
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
                        <p className="text-xs text-muted-foreground">{BATCH_STATUS_DESCRIPTIONS[status]}</p>
                        <p className={`text-xs mt-1 ${tooltipInfo.className}`}>{tooltipInfo.label}</p>
                        {isFuture && !isCurrent && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Transitions are managed via the Actions panel below.
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Timeline is read-only. Use Available Actions below to transition.
            </p>
          </div>

          {/* Read-Only Lock Message */}
          {isReadOnly && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700">
                This batch is locked due to its confirmed status. All fields are read-only.
              </AlertDescription>
            </Alert>
          )}

          {/* Allowed Actions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Available Actions
            </p>
            
            {allowedTransitions.length > 0 ? (
              <div className="space-y-2">
                {allowedTransitions.map((toStatus) => (
                  <Button
                    key={toStatus}
                    className="w-full justify-between"
                    variant={toStatus === 'confirmed' ? 'default' : 'outline'}
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
                    ? 'No actions available. Batch is in read-only state.'
                    : userRole === 'farmer'
                    ? 'No further actions available at this stage.'
                    : 'No actions available for this batch status.'}
                </p>
              </div>
            )}
          </div>

          {/* Blocked Actions (Visible but Disabled) */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Restricted Actions
            </p>
            <div className="space-y-2">
              {BATCH_STATUSES.filter(s => {
                const actionStatus = getActionStatus(s);
                return s !== currentStatus && 
                       !allowedTransitions.includes(s) && 
                       (actionStatus.type === 'admin_only' || 
                        actionStatus.type === 'blocked' || 
                        actionStatus.type === 'invalid');
              }).slice(0, 4).map((status) => {
                const actionStatus = getActionStatus(status);
                return (
                  <TooltipProvider key={status}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="w-full justify-between opacity-50 cursor-not-allowed"
                          variant="ghost"
                          disabled
                        >
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {actionStatus.type === 'admin_only' ? (
                              <Shield className="w-4 h-4" />
                            ) : actionStatus.type === 'blocked' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            {getTransitionActionLabel(status)}
                          </span>
                          <Badge variant="outline" className="ml-2 text-muted-foreground">
                            {actionStatus.type === 'admin_only' ? 'Admin Only' : 
                             actionStatus.type === 'blocked' ? 'Blocked' : 'Invalid'}
                          </Badge>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[250px]">
                        <p className="font-medium text-destructive">
                          {getCurrentLang() === 'ru' ? 'Действие недоступно' : 'Action Unavailable'}
                        </p>
                        <p className="text-xs">{actionStatus.reason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Role & Permissions Info */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Your Role: <span className="font-medium text-foreground capitalize">{role}</span></span>
              <span>Batch: <span className="font-mono text-foreground">{batchId}</span></span>
            </div>
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
            <AlertDialogCancel>{getConfirmationDialogLabels(getCurrentLang()).cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransition}>
              {getConfirmationDialogLabels(getCurrentLang()).confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
