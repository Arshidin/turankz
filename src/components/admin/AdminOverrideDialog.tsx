import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Unlock, Lock } from 'lucide-react';

interface AdminOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionType: 'unlock' | 'relock' | 'extend' | 'adjust';
  targetName: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function AdminOverrideDialog({
  open,
  onOpenChange,
  title,
  description,
  actionType,
  targetName,
  onConfirm,
  isLoading = false,
}: AdminOverrideDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A reason is required for all admin overrides.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters).');
      return;
    }
    setError('');
    onConfirm(reason.trim());
    setReason('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  const getIcon = () => {
    switch (actionType) {
      case 'unlock':
        return <Unlock className="h-5 w-5 text-amber-500" />;
      case 'relock':
        return <Lock className="h-5 w-5 text-red-500" />;
      default:
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    }
  };

  const getButtonText = () => {
    switch (actionType) {
      case 'unlock':
        return 'Unlock Batch';
      case 'relock':
        return 'Re-Lock Batch';
      case 'extend':
        return 'Extend Window';
      case 'adjust':
        return 'Adjust Window';
      default:
        return 'Confirm Override';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              This is an <strong>Admin Override</strong> for{' '}
              <strong>{targetName}</strong>. All overrides are logged for audit
              purposes.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="override-reason" className="text-sm font-medium">
              Reason for Override <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              placeholder="Explain why this override is necessary..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="min-h-[100px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              This reason will be recorded in the audit log and visible to other
              admins.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="gap-2"
            variant={actionType === 'relock' ? 'destructive' : 'default'}
          >
            {getIcon()}
            {isLoading ? 'Processing...' : getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
