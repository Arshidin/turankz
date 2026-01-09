/**
 * BATCH STATUS EXPLANATION COMPONENT
 * 
 * Provides clear, user-friendly explanations of batch lifecycle statuses
 * with visual representation and examples.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Info,
  Eye,
  Shield,
  Lock,
  FileEdit
} from 'lucide-react';
import {
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_LABELS_RU,
  BATCH_STATUS_DESCRIPTIONS,
  BATCH_STATUS_DESCRIPTIONS_RU,
  type BatchLifecycleStatus,
  getStatusIndex,
} from '@/lib/batch-lifecycle';

interface BatchStatusExplanationProps {
  currentStatus?: BatchLifecycleStatus;
  className?: string;
}

// Get current language
const getCurrentLang = (): 'en' | 'ru' => {
  if (typeof window !== 'undefined') {
    const lang = localStorage.getItem('i18nextLng') || 'ru';
    return lang.startsWith('ru') ? 'ru' : 'en';
  }
  return 'ru';
};

// Status icons mapping (FSM v2: 4 statuses)
const STATUS_ICONS: Record<BatchLifecycleStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  available: Eye,
  committed: Shield,
  completed: Lock,
};

// Status colors (FSM v2: 4 statuses)
const STATUS_COLORS: Record<BatchLifecycleStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' },
  available: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  committed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  completed: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
};

export function BatchStatusExplanation({ currentStatus, className }: BatchStatusExplanationProps) {
  const lang = getCurrentLang();
  const labels = lang === 'ru' ? BATCH_STATUS_LABELS_RU : BATCH_STATUS_LABELS;
  const descriptions = lang === 'ru' ? BATCH_STATUS_DESCRIPTIONS_RU : BATCH_STATUS_DESCRIPTIONS;
  const currentIndex = currentStatus ? getStatusIndex(currentStatus) : -1;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">
            {lang === 'ru' ? 'Жизненный цикл партии' : 'Batch Lifecycle'}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {lang === 'ru' 
            ? 'Понятное объяснение статусов партии и их значения'
            : 'Clear explanation of batch statuses and their meaning'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lifecycle Visualization */}
        <div className="space-y-3">
          {BATCH_STATUSES.map((status, index) => {
            const StatusIcon = STATUS_ICONS[status];
            const colors = STATUS_COLORS[status];
            const isPast = currentStatus && index < currentIndex;
            const isCurrent = status === currentStatus;
            const isFuture = currentStatus && index > currentIndex;

            return (
              <div key={status} className="flex items-start gap-3">
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                  {isPast ? (
                    <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                  ) : isCurrent ? (
                    <StatusIcon className={`w-5 h-5 ${colors.text}`} />
                  ) : (
                    <Circle className={`w-5 h-5 ${colors.text} opacity-50`} />
                  )}
                </div>

                {/* Status Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isCurrent ? 'default' : 'outline'} 
                      className={`${isCurrent ? colors.bg + ' ' + colors.text : ''}`}
                    >
                      {labels[status]}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        {lang === 'ru' ? 'Текущий статус' : 'Current'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {descriptions[status]}
                  </p>
                  
                  {/* Additional context for each status (FSM v2) */}
                  {status === 'draft' && (
                    <Alert className="mt-2 border-blue-500/30 bg-blue-500/5">
                      <Info className="h-3 w-3 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-700">
                        {lang === 'ru'
                          ? 'Черновик не виден в Market Overview. Опубликуйте партию, чтобы она стала видимой.'
                          : 'Draft is not visible in Market Overview. Publish the batch to make it visible.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {status === 'available' && (
                    <Alert className="mt-2 border-blue-500/30 bg-blue-500/5">
                      <Eye className="h-3 w-3 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-700">
                        {lang === 'ru'
                          ? 'Партия видна в Market Overview и доступна для сопоставления.'
                          : 'Batch is visible in Market Overview and available for matching.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {status === 'committed' && (
                    <Alert className="mt-2 border-emerald-500/30 bg-emerald-500/5">
                      <Shield className="h-3 w-3 text-emerald-600" />
                      <AlertDescription className="text-xs text-emerald-700">
                        {lang === 'ru'
                          ? 'Твёрдое обязательство. Данные партии заблокированы и готовы к сопоставлению.'
                          : 'Firm commitment. Batch data is locked and ready for matching.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {status === 'completed' && (
                    <Alert className="mt-2 border-slate-500/30 bg-slate-500/5">
                      <Lock className="h-3 w-3 text-slate-600" />
                      <AlertDescription className="text-xs text-slate-700">
                        {lang === 'ru'
                          ? 'Партия завершена (сопоставлена или закрыта).'
                          : 'Batch is completed (matched or closed).'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Arrow (except last) */}
                {index < BATCH_STATUSES.length - 1 && (
                  <div className="flex-shrink-0 pt-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {currentStatus && (
          <div className="pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {lang === 'ru' ? 'Ваш прогресс' : 'Your Progress'}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentIndex + 1) / BATCH_STATUSES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {BATCH_STATUSES.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {lang === 'ru' 
                ? `Вы на этапе "${labels[currentStatus]}". ${currentIndex < BATCH_STATUSES.length - 1 ? 'Продолжайте повышать статус для увеличения приоритета.' : 'Партия завершена.'}`
                : `You are at "${labels[currentStatus]}" stage. ${currentIndex < BATCH_STATUSES.length - 1 ? 'Continue to escalate status to increase priority.' : 'Batch is completed.'}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

