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
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_DESCRIPTIONS,
  type BatchLifecycleStatus,
  isTransitionAllowed,
  getAllNextStatuses,
  getTransitionActionLabel,
  getDisabledTransitionTooltip,
  isBatchReadOnly,
  getLockedFieldTooltip,
  validateTransition,
  getStatusIndex,
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

  // Get all allowed next statuses for current user
  const allowedNextStatuses = getAllNextStatuses(currentStatus, userRole);

  // Handle transition with confirmation for critical ones
  const handleTransitionClick = (toStatus: BatchLifecycleStatus) => {
    // Soft Committed → Confirmed requires confirmation
    if (currentStatus === 'soft_committed' && toStatus === 'confirmed') {
      setConfirmDialog({
        open: true,
        toStatus,
        title: 'Confirm Batch Availability',
        message: 'You are making a firm commitment. Batch data will be locked and cannot be modified after this action.',
        warning: 'This action is irreversible. Ensure all batch details are correct before confirming.',
      });
      return;
    }

    // Confirmed → Matched (Admin only)
    if (currentStatus === 'confirmed' && toStatus === 'matched') {
      setConfirmDialog({
        open: true,
        toStatus,
        title: 'Mark Batch as Matched',
        message: 'This will mark the batch as matched to a purchase pool request.',
        warning: 'Only proceed if the batch has been successfully matched in the pool system.',
      });
      return;
    }

    // Direct transition for non-critical ones
    onTransition(toStatus);
  };

  const handleConfirmTransition = async () => {
    if (confirmDialog.toStatus) {
      await onTransition(confirmDialog.toStatus);
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
    const validation = validateTransition(currentStatus, toStatus, userRole);
    
    if (validation.valid) {
      return { allowed: true, reason: '', type: 'allowed' };
    }

    // Check if it's just admin-only
    const adminValidation = validateTransition(currentStatus, toStatus, 'admin');
    if (adminValidation.valid && userRole !== 'admin') {
      return { 
        allowed: false, 
        reason: 'This action requires Admin privileges.', 
        type: 'admin_only' 
      };
    }

    // Check for skipping steps
    const toIndex = getStatusIndex(toStatus);
    if (toIndex > currentIndex + 1) {
      return {
        allowed: false,
        reason: 'Cannot skip lifecycle steps. Progress through each stage sequentially.',
        type: 'invalid',
      };
    }

    // Check for going backwards
    if (toIndex < currentIndex) {
      return {
        allowed: false,
        reason: 'Cannot revert to a previous status. The batch lifecycle is irreversible.',
        type: 'blocked',
      };
    }

    return {
      allowed: false,
      reason: validation.error || 'This transition is not allowed.',
      type: 'blocked',
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

          {/* Lifecycle Progress */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Lifecycle Progress
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BATCH_STATUSES.map((status, index) => (
                <TooltipProvider key={status}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${getStatusStyle(status, index)}`}>
                        {getStatusIcon(status, index)}
                        <span>{BATCH_STATUS_LABELS[status]}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">{BATCH_STATUS_LABELS[status]}</p>
                      <p className="text-xs text-muted-foreground">{BATCH_STATUS_DESCRIPTIONS[status]}</p>
                      {index < currentIndex && (
                        <p className="text-xs text-emerald-500 mt-1">✓ Completed</p>
                      )}
                      {status === currentStatus && (
                        <p className="text-xs text-primary mt-1">● Current</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
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
            
            {allowedNextStatuses.length > 0 ? (
              <div className="space-y-2">
                {allowedNextStatuses.map((toStatus) => (
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
                       !allowedNextStatuses.includes(s) && 
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
                        <p className="font-medium text-destructive">Action Unavailable</p>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransition}>
              Confirm Transition
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
