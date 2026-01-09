import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditHelperNote } from './EditHelperNote';
import { requiresReadinessConfirmation } from '@/lib/change-constraints';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { BatchLifecycleStatus } from '@/lib/batch-lifecycle';

interface ReadinessTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchNumber: string;
  currentStatus: BatchLifecycleStatus;
  onConfirm: (newStatus: BatchLifecycleStatus, reason?: string) => void;
}

// FSM v2: Simplified status order (draft is not selectable here)
const SELECTABLE_STATUSES: BatchLifecycleStatus[] = ['available', 'committed', 'completed'];

/**
 * Dialog for changing batch readiness status
 * Enforces confirmation for downgrades
 */
export function ReadinessTransitionDialog({
  open,
  onOpenChange,
  batchNumber,
  currentStatus,
  onConfirm,
}: ReadinessTransitionDialogProps) {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<BatchLifecycleStatus | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const currentIndex = SELECTABLE_STATUSES.indexOf(currentStatus);
  const isDowngrade = selectedStatus
    ? SELECTABLE_STATUSES.indexOf(selectedStatus) < currentIndex
    : false;
  const needsConfirmation = selectedStatus
    ? requiresReadinessConfirmation(currentStatus, selectedStatus)
    : false;

  const handleStatusSelect = (status: BatchLifecycleStatus) => {
    setSelectedStatus(status);
    setError('');
  };

  const handleConfirm = () => {
    if (!selectedStatus) return;

    if (needsConfirmation && !reason.trim()) {
      setError(t('statusTransition.reasonRequired', 'Please provide a reason for downgrading status.'));
      return;
    }

    onConfirm(selectedStatus, reason.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('statusTransition.title', 'Update Status')}</DialogTitle>
          <DialogDescription>
            {t('statusTransition.description', 'Change the status for {{batch}}', { batch: batchNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20">{t('statusTransition.current', 'Current')}:</span>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Status options */}
          <div className="space-y-2">
            <Label>{t('statusTransition.selectNew', 'Select new status')}:</Label>
            <div className="grid grid-cols-3 gap-2">
              {SELECTABLE_STATUSES.map((status) => {
                const index = SELECTABLE_STATUSES.indexOf(status);
                const isSelected = selectedStatus === status;
                const isCurrent = status === currentStatus;
                const isUpgrade = index > currentIndex;
                const isDowngradeOption = index < currentIndex;

                return (
                  <button
                    key={status}
                    onClick={() => !isCurrent && handleStatusSelect(status)}
                    disabled={isCurrent}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-md border p-3 transition-colors',
                      isCurrent && 'opacity-50 cursor-not-allowed',
                      isSelected && 'ring-2 ring-primary',
                      !isCurrent && !isSelected && 'hover:bg-muted/50',
                      isDowngradeOption && !isSelected && 'border-dashed'
                    )}
                  >
                    <StatusBadge status={status} size="sm" />
                    {isCurrent && (
                      <span className="text-[10px] text-muted-foreground">{t('statusTransition.currentLabel', 'Current')}</span>
                    )}
                    {isUpgrade && !isCurrent && (
                      <span className="text-[10px] text-status-confirmed">{t('statusTransition.upgrade', 'Upgrade')}</span>
                    )}
                    {isDowngradeOption && !isCurrent && (
                      <span className="text-[10px] text-signal-warning">{t('statusTransition.downgrade', 'Downgrade')}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transition indicator */}
          {selectedStatus && (
            <div className="flex items-center justify-center gap-2 py-2">
              <StatusBadge status={currentStatus} size="sm" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <StatusBadge status={selectedStatus} size="sm" />
            </div>
          )}

          {/* Downgrade warning */}
          {isDowngrade && (
            <EditHelperNote
              variant="warning"
              message={t('statusTransition.downgradeWarning', 'Downgrading from Committed status will be logged for Admin review.')}
            />
          )}

          {/* Reason input for downgrades */}
          {needsConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="downgrade-reason">
                {t('statusTransition.reasonLabel', 'Reason for downgrade')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="downgrade-reason"
                placeholder={t('statusTransition.reasonPlaceholder', 'Briefly explain why you need to downgrade this batch...')}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                className={cn(error && 'border-destructive')}
                rows={2}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus}>
            {needsConfirmation ? t('statusTransition.confirmDowngrade', 'Confirm Downgrade') : t('statusTransition.updateStatus', 'Update Status')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
