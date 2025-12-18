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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Edit } from 'lucide-react';
import { type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { usePoolRequestAdminOverride } from '@/hooks/usePoolRequestAudit';
import { POOL_REQUEST_STATUSES, type PoolRequestLifecycleStatus } from '@/lib/pool-request-lifecycle';

interface PoolRequestOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PoolRequest;
  mode: 'edit' | 'status';
}

export function PoolRequestOverrideDialog({
  open,
  onOpenChange,
  request,
  mode,
}: PoolRequestOverrideDialogProps) {
  const { adminModifyRequest, adminChangeStatus } = usePoolRequestAdminOverride();
  
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  
  // Status change mode
  const [newStatus, setNewStatus] = useState<PoolRequestLifecycleStatus>(request.status);
  
  // Edit mode fields
  const [requiredVolume, setRequiredVolume] = useState(request.required_volume);
  const [regions, setRegions] = useState(request.regions.join(', '));
  const [weightMin, setWeightMin] = useState(request.weight_range_min?.toString() || '');
  const [weightMax, setWeightMax] = useState(request.weight_range_max?.toString() || '');
  const [ageMin, setAgeMin] = useState(request.age_range_min?.toString() || '');
  const [ageMax, setAgeMax] = useState(request.age_range_max?.toString() || '');

  const isLoading = adminModifyRequest.isPending || adminChangeStatus.isPending;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('A reason is required for all admin overrides.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters).');
      return;
    }
    setError('');

    try {
      if (mode === 'status') {
        await adminChangeStatus.mutateAsync({
          request,
          newStatus,
          reason: reason.trim(),
        });
      } else {
        const updates: Partial<PoolRequest> = {
          required_volume: requiredVolume,
          regions: regions.split(',').map(r => r.trim()).filter(Boolean),
          weight_range_min: weightMin ? parseInt(weightMin) : null,
          weight_range_max: weightMax ? parseInt(weightMax) : null,
          age_range_min: ageMin ? parseInt(ageMin) : null,
          age_range_max: ageMax ? parseInt(ageMax) : null,
        };
        
        await adminModifyRequest.mutateAsync({
          request,
          updates,
          reason: reason.trim(),
        });
      }
      
      handleClose();
    } catch (err) {
      // Error handling done in the hook
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    setNewStatus(request.status);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Admin Override: {mode === 'status' ? 'Change Status' : 'Modify Request'}
          </DialogTitle>
          <DialogDescription>
            Modifying Pool Request {request.request_number}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              This is an <strong>Admin Override</strong>. All changes are logged for audit purposes
              and will be visible to other admins.
            </AlertDescription>
          </Alert>

          {mode === 'status' ? (
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PoolRequestLifecycleStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POOL_REQUEST_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current status: <strong>{request.status}</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Volume (heads)</Label>
                  <Input
                    type="number"
                    value={requiredVolume}
                    onChange={(e) => setRequiredVolume(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Regions (comma-separated)</Label>
                  <Input
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                    placeholder="e.g., Almaty, Astana"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight Range (kg)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={weightMin}
                      onChange={(e) => setWeightMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={weightMax}
                      onChange={(e) => setWeightMax(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Age Range (months)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
              This reason will be recorded in the audit log.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Apply Override'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
