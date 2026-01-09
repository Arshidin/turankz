import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(t('poolRequestOverrideDialog.validation.reasonRequired'));
      return;
    }
    if (reason.trim().length < 10) {
      setError(t('poolRequestOverrideDialog.validation.reasonMinLength'));
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
            {t(mode === 'status' ? 'poolRequestOverrideDialog.title.status' : 'poolRequestOverrideDialog.title.edit')}
          </DialogTitle>
          <DialogDescription>
            {t('poolRequestOverrideDialog.description', { requestNumber: request.request_number })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <Trans
                i18nKey="poolRequestOverrideDialog.alerts.overrideWarning"
                components={{ strong: <strong /> }}
              />
            </AlertDescription>
          </Alert>

          {mode === 'status' ? (
            <div className="space-y-2">
              <Label>{t('poolRequestOverrideDialog.fields.newStatus')}</Label>
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
                <Trans
                  i18nKey="poolRequestOverrideDialog.fields.currentStatus"
                  values={{ status: request.status }}
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('poolRequestOverrideDialog.fields.requiredVolume')}</Label>
                  <Input
                    type="number"
                    value={requiredVolume}
                    onChange={(e) => setRequiredVolume(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('poolRequestOverrideDialog.fields.regions')}</Label>
                  <Input
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                    placeholder="e.g., Almaty, Astana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('poolRequestOverrideDialog.fields.weightRange')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('poolRequestOverrideDialog.fields.minLabel')}
                      value={weightMin}
                      onChange={(e) => setWeightMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder={t('poolRequestOverrideDialog.fields.maxLabel')}
                      value={weightMax}
                      onChange={(e) => setWeightMax(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('poolRequestOverrideDialog.fields.ageRange')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('poolRequestOverrideDialog.fields.minLabel')}
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder={t('poolRequestOverrideDialog.fields.maxLabel')}
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
              {t('poolRequestOverrideDialog.fields.reason')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              placeholder={t('poolRequestOverrideDialog.fields.reasonPlaceholder')}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="min-h-[100px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              {t('poolRequestOverrideDialog.fields.reasonHelp')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('poolRequestOverrideDialog.buttons.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {isLoading ? t('poolRequestOverrideDialog.buttons.processing') : t('poolRequestOverrideDialog.buttons.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
