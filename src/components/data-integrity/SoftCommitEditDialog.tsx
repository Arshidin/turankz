/**
 * COMMITTED BATCH EDIT DIALOG
 *
 * Sprint 3: Renamed from SoftCommitEditDialog for FSM v2.
 * Confirmation dialog shown when editing a committed batch.
 * Warns user that changes may affect matching priority.
 */

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
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SoftCommitEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown when editing a committed batch
 * Warns user that changes may affect matching priority
 *
 * @deprecated Consider using InlineConfirmation for less critical actions
 */
export function SoftCommitEditDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: SoftCommitEditDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-warning-bg">
              <AlertTriangle className="h-5 w-5 text-signal-warning" />
            </div>
            <AlertDialogTitle>
              {t('committedEditDialog.title', 'Confirm Edit')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {t('committedEditDialog.description', 'Changing batch details after commitment may affect matching priority.')}
            <br /><br />
            {t('committedEditDialog.warning', 'Your batch has already been signaled to buyers. Frequent changes can reduce trust and lower your priority in the matching pool.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t('common.cancel', 'Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('committedEditDialog.proceed', 'Proceed with Edit')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Re-export with new name for gradual migration
export { SoftCommitEditDialog as CommittedBatchEditDialog };
