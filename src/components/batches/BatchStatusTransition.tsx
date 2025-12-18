import { ExternalLink, Lock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type BatchLifecycleStatus,
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_LABELS_RU,
  getNextAllowedStatus,
  getTransitionActionLabel,
  getTransitionActionLabelRu,
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
  batchId: string;
  showAllStatuses?: boolean;
  compact?: boolean;
}

/**
 * BatchStatusTransition - READ-ONLY status display component
 * 
 * This component displays batch status information and next recommended actions,
 * but does NOT execute status transitions directly.
 * 
 * All status transitions must go through BatchFSMPanel on the Batch Detail page.
 */
export function BatchStatusTransition({
  currentStatus,
  role,
  batchId,
  showAllStatuses = false,
  compact = false,
}: BatchStatusTransitionProps) {
  const navigate = useNavigate();
  const lang = getCurrentLanguage();
  const nextStatus = getNextAllowedStatus(currentStatus, role);
  
  const getLabel = (status: BatchLifecycleStatus) => 
    lang === 'ru' ? BATCH_STATUS_LABELS_RU[status] : BATCH_STATUS_LABELS[status];
  
  const getActionLabel = (status: BatchLifecycleStatus) =>
    lang === 'ru' ? getTransitionActionLabelRu(status) : getTransitionActionLabel(status);
  
  const getDescription = (status: BatchLifecycleStatus) =>
    lang === 'ru' ? BATCH_STATUS_DESCRIPTIONS_RU[status] : BATCH_STATUS_DESCRIPTIONS[status];

  const redirectTooltip = lang === 'ru' 
    ? 'Управление статусом доступно в Деталях партии'
    : 'Status changes are managed in the Batch Details view';

  const handleNavigateToBatchDetail = () => {
    navigate(`/farmer/batches/${batchId}`);
  };

  if (compact) {
    // Compact mode: just show current status and redirect button
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          
          {nextStatus ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNavigateToBatchDetail}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {getActionLabel(nextStatus)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{redirectTooltip}</p>
              </TooltipContent>
            </Tooltip>
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
        </div>
      </TooltipProvider>
    );
  }

  // Full mode: show all statuses in a timeline (read-only)
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

        {/* Status timeline (read-only visualization) */}
        {showAllStatuses && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {BATCH_STATUSES.map((status, index) => {
              const isCurrent = status === currentStatus;
              const isPast = index < currentIndex;
              const isNext = index === currentIndex + 1;
              
              return (
                <div key={status} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex flex-col items-center gap-1 px-3 py-2 rounded-md',
                          isCurrent && 'bg-primary/10 ring-2 ring-primary',
                          isPast && 'opacity-50',
                          !isCurrent && !isPast && 'opacity-50'
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
                        {isNext && (
                          <span className="text-[10px] text-muted-foreground">
                            {lang === 'ru' ? 'Далее' : 'Next'}
                          </span>
                        )}
                        {!isCurrent && !isPast && !isNext && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getDescription(status)}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {index < BATCH_STATUSES.length - 1 && (
                    <div className={cn(
                      'w-4 h-0.5 mx-1',
                      index < currentIndex ? 'bg-muted-foreground' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Next action redirect button */}
        {nextStatus && (
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNavigateToBatchDetail}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {getActionLabel(nextStatus)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{redirectTooltip}</p>
              </TooltipContent>
            </Tooltip>
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

        {/* Info message about status management */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-border/50">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {lang === 'ru' 
              ? 'Управление статусом партии осуществляется через панель FSM на странице деталей партии.'
              : 'Batch status management is handled through the FSM panel on the Batch Detail page.'
            }
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
