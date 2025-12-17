import { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  type SensitiveChangeType,
  SENSITIVE_CHANGE_LABELS,
  SENSITIVE_CHANGE_WARNINGS,
} from '@/lib/change-constraints';

interface ChangeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeType: SensitiveChangeType;
  entityName: string;
  previousValue: string;
  newValue: string;
  requiresReason?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel?: () => void;
}

/**
 * Dialog for confirming sensitive data changes
 * Adds friction to prevent casual modifications
 */
export function ChangeConfirmationDialog({
  open,
  onOpenChange,
  changeType,
  entityName,
  previousValue,
  newValue,
  requiresReason = false,
  onConfirm,
  onCancel,
}: ChangeConfirmationDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setError('Please provide a reason for this change.');
      return;
    }
    onConfirm(reason.trim() || undefined);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel?.();
    onOpenChange(false);
  };

  const isDowngrade = changeType === 'readiness_downgrade';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={cn(
              'h-5 w-5',
              isDowngrade ? 'text-signal-warning' : 'text-muted-foreground'
            )} />
            Confirm {SENSITIVE_CHANGE_LABELS[changeType]}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{SENSITIVE_CHANGE_WARNINGS[changeType]}</p>
              
              {/* Change summary */}
              <div className="rounded-md border bg-muted/50 p-3 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Entity:</span>{' '}
                  <span className="font-medium text-foreground">{entityName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Current:</span>{' '}
                  <span className="font-medium text-foreground">{previousValue}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">New:</span>{' '}
                  <span className="font-medium text-foreground">{newValue}</span>
                </div>
              </div>

              {/* Logging notice */}
              {isDowngrade && (
                <div className="flex items-start gap-2 rounded-md border border-signal-warning/30 bg-signal-warning-bg p-3">
                  <Info className="h-4 w-4 text-signal-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-signal-warning">
                    This change will be logged for Admin review.
                  </p>
                </div>
              )}

              {/* Reason input */}
              {requiresReason && (
                <div className="space-y-2">
                  <Label htmlFor="change-reason" className="text-foreground">
                    Reason for change <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="change-reason"
                    placeholder="Briefly explain why this change is needed..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (error) setError('');
                    }}
                    className={cn(error && 'border-destructive')}
                    rows={2}
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
