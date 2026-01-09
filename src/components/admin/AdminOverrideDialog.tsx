/**
 * AdminOverrideDialog Component
 *
 * Sprint 7-8: Enhanced with additional warnings and confirmation step.
 * Ensures administrators understand the implications of override actions.
 */

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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Unlock, Lock, AlertTriangle, FileText, Clock } from 'lucide-react';

interface AdminOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionType: 'unlock' | 'relock' | 'extend' | 'adjust';
  targetName: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  /** Sprint 7-8: Additional context about the override */
  additionalWarning?: string;
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
  additionalWarning,
}: AdminOverrideDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(t('adminOverrideDialog.validation.reasonRequired'));
      return;
    }
    if (reason.trim().length < 10) {
      setError(t('adminOverrideDialog.validation.reasonMinLength'));
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
      setAcknowledged(false);
    }
    onOpenChange(newOpen);
  };

  // Sprint 7-8: Get action-specific warnings
  const getActionWarnings = () => {
    switch (actionType) {
      case 'unlock':
        return {
          title: 'Разблокировка партии',
          warnings: [
            'Это действие будет записано в журнал аудита',
            'Фермер получит возможность редактировать партию',
            'Изменения могут повлиять на существующие сопоставления',
          ],
        };
      case 'relock':
        return {
          title: 'Блокировка партии',
          warnings: [
            'Фермер потеряет возможность редактировать партию',
            'Это действие необратимо без нового переопределения',
          ],
        };
      case 'extend':
        return {
          title: 'Продление окна',
          warnings: [
            'Это продлит срок подачи заявок',
            'Уже поданные заявки не будут затронуты',
          ],
        };
      case 'adjust':
        return {
          title: 'Корректировка окна',
          warnings: [
            'Это изменит параметры окна сопоставления',
            'Существующие заявки могут быть затронуты',
          ],
        };
      default:
        return { title: 'Административное действие', warnings: [] };
    }
  };

  const actionWarnings = getActionWarnings();

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
        return t('adminOverrideDialog.buttons.unlockBatch');
      case 'relock':
        return t('adminOverrideDialog.buttons.relockBatch');
      case 'extend':
        return t('adminOverrideDialog.buttons.extendWindow');
      case 'adjust':
        return t('adminOverrideDialog.buttons.adjustWindow');
      default:
        return t('adminOverrideDialog.buttons.confirmOverride');
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
          {/* Primary warning */}
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <Trans
                i18nKey="adminOverrideDialog.alerts.overrideWarning"
                values={{ targetName }}
                components={{ strong: <strong /> }}
              />
            </AlertDescription>
          </Alert>

          {/* Sprint 7-8: Action-specific warnings */}
          {actionWarnings.warnings.length > 0 && (
            <Alert variant="default" className="border-orange-500/50 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-sm font-medium text-orange-800">
                Последствия действия
              </AlertTitle>
              <AlertDescription className="text-xs mt-2">
                <ul className="list-disc list-inside space-y-1 text-orange-700">
                  {actionWarnings.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Additional custom warning */}
          {additionalWarning && (
            <Alert variant="default" className="border-red-500/50 bg-red-500/5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                {additionalWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="override-reason" className="text-sm font-medium">
              {t('adminOverrideDialog.fields.reason')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              placeholder={t('adminOverrideDialog.fields.reasonPlaceholder')}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="min-h-[100px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              {t('adminOverrideDialog.fields.reasonHelp')}
            </p>
          </div>

          {/* Sprint 7-8: Acknowledgment checkbox */}
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="acknowledge" className="text-sm cursor-pointer">
                Я понимаю последствия этого действия
              </Label>
              <p className="text-xs text-muted-foreground">
                Это действие будет записано в журнал аудита с указанием причины и исполнителя
              </p>
            </div>
          </div>

          {/* Audit info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>Действие будет записано в</span>
            <span className="font-medium text-foreground">Журнал административных действий</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t('adminOverrideDialog.buttons.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim() || !acknowledged}
            className="gap-2"
            variant={actionType === 'relock' ? 'destructive' : 'default'}
          >
            {getIcon()}
            {isLoading ? t('adminOverrideDialog.buttons.processing') : getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
