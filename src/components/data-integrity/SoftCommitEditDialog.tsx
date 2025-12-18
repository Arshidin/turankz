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

interface SoftCommitEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown when editing a soft-committed batch
 * Warns user that changes may affect matching priority
 */
export function SoftCommitEditDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: SoftCommitEditDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-warning-bg">
              <AlertTriangle className="h-5 w-5 text-signal-warning" />
            </div>
            <AlertDialogTitle>Confirm Edit</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Changing batch details after Soft Commitment may affect matching priority.
            <br /><br />
            Your batch has already been signaled to buyers. Frequent changes can reduce trust and lower your priority in the matching pool.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Proceed with Edit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
