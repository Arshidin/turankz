/**
 * PoolRequestLifecycleExplainer Component
 *
 * Sprint 6 Task 9.4.3: Explains the pool request lifecycle flow.
 * Provides clear explanations for MPKs and admins on how pool requests
 * move through the system from draft to closed.
 *
 * Lifecycle Flow:
 * Draft → Submitted → Matching → Partial/Fulfilled → Closed
 *
 * Who does what:
 * - MPK: Creates draft, submits, can cancel before matching
 * - Admin: Manages matching, updates status, closes request
 */

import {
  Info,
  FileText,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowRightCircle,
  Circle,
  CircleDot,
  Lock,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  POOL_REQUEST_STATUS_LABELS_RU,
  POOL_REQUEST_STATUS_DESCRIPTIONS,
  type PoolRequestLifecycleStatus,
} from '@/lib/pool-request-lifecycle';

interface PoolRequestLifecycleExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
  /** Current status to highlight in the timeline */
  currentStatus?: PoolRequestLifecycleStatus | null;
}

// Status configuration for timeline display
const LIFECYCLE_STAGES: Array<{
  status: PoolRequestLifecycleStatus;
  icon: typeof FileText;
  color: string;
  whoActs: 'mpk' | 'admin' | 'both';
  actionRu: string;
  descriptionRu: string;
}> = [
  {
    status: 'draft',
    icon: FileText,
    color: 'slate',
    whoActs: 'mpk',
    actionRu: 'Создание заявки',
    descriptionRu: 'МПК создаёт и редактирует заявку. Заявка не видна администратору до подачи.',
  },
  {
    status: 'submitted',
    icon: Send,
    color: 'blue',
    whoActs: 'mpk',
    actionRu: 'Подача заявки',
    descriptionRu: 'МПК подаёт заявку на рассмотрение. Редактирование заблокировано.',
  },
  {
    status: 'matching',
    icon: Users,
    color: 'violet',
    whoActs: 'admin',
    actionRu: 'Сопоставление',
    descriptionRu: 'Администратор находит подходящие партии и создаёт matching.',
  },
  {
    status: 'partial',
    icon: CircleDot,
    color: 'amber',
    whoActs: 'admin',
    actionRu: 'Частичное выполнение',
    descriptionRu: 'Часть объёма сопоставлена. Администратор ищет оставшийся объём.',
  },
  {
    status: 'fulfilled',
    icon: CheckCircle2,
    color: 'emerald',
    whoActs: 'admin',
    actionRu: 'Полное выполнение',
    descriptionRu: 'Весь требуемый объём сопоставлен. Ожидание доставки.',
  },
  {
    status: 'closed',
    icon: Lock,
    color: 'slate',
    whoActs: 'admin',
    actionRu: 'Закрытие',
    descriptionRu: 'Заявка завершена. Все поставки выполнены или отменены.',
  },
];

// Color classes mapping
const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  slate: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600',
    border: 'border-slate-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/30',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    border: 'border-violet-500/30',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/30',
  },
};

export function PoolRequestLifecycleExplainer({
  variant = 'inline',
  currentStatus = null,
}: PoolRequestLifecycleExplainerProps) {
  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Жизненный цикл заявки: Черновик → Подана → Сопоставление → Выполнена → Закрыта
          </span>
          <span className="text-muted-foreground block mt-1">
            МПК создаёт и подаёт заявку. Администратор сопоставляет партии и закрывает заявку.
            После подачи заявка блокируется для редактирования.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Full explanation with timeline
  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRightCircle className="h-5 w-5 text-blue-600" />
          Жизненный цикл заявки на закупку
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Introduction */}
        <div>
          <h4 className="text-sm font-medium mb-2">Как работает процесс?</h4>
          <p className="text-sm text-muted-foreground">
            Заявка на закупку (Pool Request) проходит несколько этапов от создания до закрытия.
            Каждый этап имеет определённые действия и ответственных лиц.
          </p>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-medium mb-3">Этапы жизненного цикла:</h4>
          <div className="space-y-0">
            {LIFECYCLE_STAGES.map((stage, index) => {
              const isCurrentStage = currentStatus === stage.status;
              const isPastStage = currentStatus
                ? LIFECYCLE_STAGES.findIndex((s) => s.status === currentStatus) > index
                : false;
              const colorClass = COLOR_CLASSES[stage.color] || COLOR_CLASSES.slate;
              const Icon = stage.icon;

              return (
                <div key={stage.status} className="relative">
                  {/* Connector line */}
                  {index < LIFECYCLE_STAGES.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-8 ${
                        isPastStage ? 'bg-emerald-500' : 'bg-muted'
                      }`}
                    />
                  )}

                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      isCurrentStage
                        ? `border-2 ${colorClass.border} ${colorClass.bg}`
                        : isPastStage
                        ? 'border border-emerald-500/20 bg-emerald-500/5'
                        : 'border border-transparent'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                        isCurrentStage
                          ? colorClass.bg
                          : isPastStage
                          ? 'bg-emerald-500/10'
                          : 'bg-muted/50'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isCurrentStage
                            ? colorClass.text
                            : isPastStage
                            ? 'text-emerald-600'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {POOL_REQUEST_STATUS_LABELS_RU[stage.status]}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            stage.whoActs === 'mpk'
                              ? 'bg-blue-500/10 text-blue-700 border-blue-500/30'
                              : stage.whoActs === 'admin'
                              ? 'bg-purple-500/10 text-purple-700 border-purple-500/30'
                              : 'bg-slate-500/10 text-slate-700 border-slate-500/30'
                          }`}
                        >
                          {stage.whoActs === 'mpk' ? 'МПК' : stage.whoActs === 'admin' ? 'Админ' : 'Оба'}
                        </Badge>
                        {isCurrentStage && (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs">
                            Текущий этап
                          </Badge>
                        )}
                        {isPastStage && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stage.descriptionRu}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special status: Cancelled */}
        <div className="p-3 bg-red-500/5 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{POOL_REQUEST_STATUS_LABELS_RU.cancelled}</span>
                <Badge variant="outline" className="text-xs bg-slate-500/10 text-slate-700 border-slate-500/30">
                  МПК / Админ
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Заявка может быть отменена на любом этапе до закрытия.
                МПК может отменить до начала сопоставления. Администратор может отменить на любом этапе.
              </p>
            </div>
          </div>
        </div>

        {/* Who does what */}
        <div>
          <h4 className="text-sm font-medium mb-3">Кто что делает:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* MPK actions */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/30 rounded-lg">
              <h5 className="text-sm font-medium text-blue-700 mb-2">МПК (Мясоперерабатывающий комбинат)</h5>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Создаёт черновик заявки с требованиями</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Редактирует заявку до подачи</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Подаёт заявку в окно сопоставления</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Может отменить до начала сопоставления</span>
                </li>
              </ul>
            </div>

            {/* Admin actions */}
            <div className="p-3 bg-purple-500/5 border border-purple-500/30 rounded-lg">
              <h5 className="text-sm font-medium text-purple-700 mb-2">Администратор</h5>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Просматривает поданные заявки</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Находит и сопоставляет подходящие партии</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Обновляет статус (partial → fulfilled)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Закрывает заявку после завершения</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important notes */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Важно помнить:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>После подачи заявка блокируется для редактирования МПК</li>
                <li>Подача возможна только в активное окно сопоставления</li>
                <li>Жизненный цикл необратим — нельзя вернуться на предыдущий этап</li>
                <li>Заявка закрывается только после полного выполнения или отмены</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
