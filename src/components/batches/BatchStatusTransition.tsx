import { useState } from 'react';
import { ArrowRight, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  type BatchLifecycleStatus,
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_LABELS_RU,
  getNextAllowedStatus,
  isTransitionAllowed,
  getTransitionActionLabel,
  getTransitionActionLabelRu,
  getDisabledTransitionTooltip,
  getDisabledTransitionTooltipRu,
  BATCH_STATUS_DESCRIPTIONS,
  BATCH_STATUS_DESCRIPTIONS_RU,
} from '@/lib/batch-lifecycle';
import { cn } from '@/lib/utils';

// Get current language from localStorage
const getCurrentLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'ru';
  }
  return 'ru';
};

interface BatchStatusTransitionProps {
  currentStatus: BatchLifecycleStatus;
  role: 'farmer' | 'admin' | 'mpk';
  onTransition: (newStatus: BatchLifecycleStatus) => Promise<void>;
  isLoading?: boolean;
  showAllStatuses?: boolean;
  compact?: boolean;
}

export function BatchStatusTransition({
  currentStatus,
  role,
  onTransition,
  isLoading = false,
  showAllStatuses = false,
  compact = false,
}: BatchStatusTransitionProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    targetStatus: BatchLifecycleStatus | null;
  }>({ open: false, targetStatus: null });
  
  const lang = getCurrentLanguage();
  const nextStatus = getNextAllowedStatus(currentStatus, role);
  
  const getLabel = (status: BatchLifecycleStatus) => 
    lang === 'ru' ? BATCH_STATUS_LABELS_RU[status] : BATCH_STATUS_LABELS[status];
  
  const getActionLabel = (status: BatchLifecycleStatus) =>
    lang === 'ru' ? getTransitionActionLabelRu(status) : getTransitionActionLabel(status);
  
  const getTooltip = (from: BatchLifecycleStatus, to: BatchLifecycleStatus) =>
    lang === 'ru' 
      ? getDisabledTransitionTooltipRu(from, to, role)
      : getDisabledTransitionTooltip(from, to, role);
  
  const getDescription = (status: BatchLifecycleStatus) =>
    lang === 'ru' ? BATCH_STATUS_DESCRIPTIONS_RU[status] : BATCH_STATUS_DESCRIPTIONS[status];

  const handleTransitionClick = (targetStatus: BatchLifecycleStatus) => {
    setConfirmDialog({ open: true, targetStatus });
  };

  const handleConfirm = async () => {
    if (confirmDialog.targetStatus) {
      await onTransition(confirmDialog.targetStatus);
    }
    setConfirmDialog({ open: false, targetStatus: null });
  };

  if (compact) {
    // Compact mode: just show current status and next action button
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          
          {nextStatus ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTransitionClick(nextStatus)}
              disabled={isLoading}
              className="text-xs"
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              {getActionLabel(nextStatus)}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 mr-1" />
                  {lang === 'ru' ? 'Финальный статус' : 'Final status'}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getDescription(currentStatus)}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Confirmation Dialog */}
          <AlertDialog 
            open={confirmDialog.open} 
            onOpenChange={(open) => setConfirmDialog({ open, targetStatus: confirmDialog.targetStatus })}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {lang === 'ru' ? 'Подтвердить изменение статуса' : 'Confirm Status Change'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmDialog.targetStatus && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 justify-center py-2">
                        <StatusBadge status={currentStatus} />
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <StatusBadge status={confirmDialog.targetStatus} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getDescription(confirmDialog.targetStatus)}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {lang === 'ru' 
                          ? 'Это действие необратимо. Вы не сможете вернуться к предыдущему статусу.'
                          : 'This action is irreversible. You cannot revert to a previous status.'}
                      </p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {lang === 'ru' ? 'Отмена' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                  {lang === 'ru' ? 'Подтвердить' : 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    );
  }

  // Full mode: show all statuses in a timeline
  const currentIndex = BATCH_STATUSES.indexOf(currentStatus);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Current status header */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lang === 'ru' ? 'Текущий статус:' : 'Current status:'}
          </span>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Status timeline */}
        {showAllStatuses && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {BATCH_STATUSES.map((status, index) => {
              const isCurrent = status === currentStatus;
              const isPast = index < currentIndex;
              const isNext = index === currentIndex + 1;
              const canTransition = isTransitionAllowed(currentStatus, status, role);
              
              return (
                <div key={status} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => canTransition && handleTransitionClick(status)}
                        disabled={!canTransition || isLoading}
                        className={cn(
                          'flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors',
                          isCurrent && 'bg-primary/10 ring-2 ring-primary',
                          isPast && 'opacity-50',
                          canTransition && !isCurrent && 'hover:bg-muted cursor-pointer',
                          !canTransition && !isCurrent && !isPast && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <StatusBadge status={status} size="sm" />
                        {isCurrent && (
                          <span className="text-[10px] text-primary font-medium">
                            {lang === 'ru' ? 'Сейчас' : 'Current'}
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] text-muted-foreground">
                            {lang === 'ru' ? 'Пройден' : 'Done'}
                          </span>
                        )}
                        {isNext && canTransition && (
                          <span className="text-[10px] text-primary">
                            {lang === 'ru' ? 'Далее' : 'Next'}
                          </span>
                        )}
                        {!canTransition && !isCurrent && !isPast && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {canTransition ? (
                        <p>{getDescription(status)}</p>
                      ) : (
                        <p>{getTooltip(currentStatus, status)}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  
                  {index < BATCH_STATUSES.length - 1 && (
                    <ArrowRight className={cn(
                      'w-4 h-4 mx-1',
                      index < currentIndex ? 'text-muted-foreground' : 'text-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Next action button */}
        {nextStatus && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleTransitionClick(nextStatus)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              {getActionLabel(nextStatus)}
            </Button>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getDescription(nextStatus)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* No next action available */}
        {!nextStatus && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            {currentStatus === 'closed' || currentStatus === 'matched' ? (
              <span>{lang === 'ru' ? 'Жизненный цикл партии завершён.' : 'Batch lifecycle is complete.'}</span>
            ) : (
              <span>{lang === 'ru' ? 'Дальнейшие действия требуют прав Администратора.' : 'Further actions require Admin privileges.'}</span>
            )}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog 
          open={confirmDialog.open} 
          onOpenChange={(open) => setConfirmDialog({ open, targetStatus: confirmDialog.targetStatus })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {lang === 'ru' ? 'Подтвердить изменение статуса' : 'Confirm Status Change'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.targetStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center py-2">
                      <StatusBadge status={currentStatus} />
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <StatusBadge status={confirmDialog.targetStatus} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getDescription(confirmDialog.targetStatus)}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {lang === 'ru' 
                        ? 'Это действие необратимо. Вы не сможете вернуться к предыдущему статусу.'
                        : 'This action is irreversible. You cannot revert to a previous status.'}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                {lang === 'ru' ? 'Подтвердить' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
