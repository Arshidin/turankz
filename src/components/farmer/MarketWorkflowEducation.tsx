/**
 * MARKET WORKFLOW EDUCATION
 * 
 * Visual educational component for Observers showing:
 * - Supplier grading levels and progression
 * - Batch lifecycle stages
 * - Requirements for Standard Supplier status
 * 
 * Read-only, no actions, no forms.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  Award,
  ArrowRight,
  ArrowDown,
  Clock,
  TrendingUp,
  Handshake,
  Package,
  Info
} from 'lucide-react';

export function MarketWorkflowEducation() {
  const gradingLevels = [
    {
      level: 'Observer',
      labelRu: 'Наблюдатель',
      icon: Eye,
      color: 'amber',
      description: 'Режим просмотра. Изучение правил, ценовых ориентиров и агрегированного спроса.',
      capabilities: [
        'Просмотр референсных цен',
        'Агрегированные сигналы рынка',
        'Изучение структуры поголовья',
      ],
      restrictions: [
        'Нет создания партий',
        'Нет участия в пулах',
      ],
    },
    {
      level: 'Declared',
      labelRu: 'Заявленный поставщик',
      icon: FileText,
      color: 'blue',
      description: 'Профиль активирован. Можно создавать партии и участвовать в matching.',
      capabilities: [
        'Создание партий скота',
        'Участие в закупочных пулах',
        'Получение предложений',
      ],
      restrictions: [
        'Премии за дисциплину ограничены',
      ],
    },
    {
      level: 'Standard',
      labelRu: 'Стандартный поставщик',
      icon: Award,
      color: 'emerald',
      description: 'Подтверждённый статус. Максимальные премии за дисциплину и предсказуемость.',
      capabilities: [
        'Полные премии за дисциплину',
        'Премии за предсказуемость',
        'Приоритет в matching',
      ],
      restrictions: [],
    },
  ];

  const batchLifecycle = [
    {
      stage: 'Draft',
      labelRu: 'Черновик',
      icon: FileText,
      color: 'slate',
      description: 'Партия создана, но не отправлена. Можно редактировать все параметры.',
    },
    {
      stage: 'Forecast',
      labelRu: 'Прогноз',
      icon: Clock,
      color: 'amber',
      description: 'Индикативная заявка. Объём и сроки могут измениться.',
    },
    {
      stage: 'Soft Committed',
      labelRu: 'Мягкое обязательство',
      icon: TrendingUp,
      color: 'blue',
      description: 'Намерение подтверждено. Изменения ограничены.',
    },
    {
      stage: 'Confirmed',
      labelRu: 'Подтверждено',
      icon: CheckCircle2,
      color: 'emerald',
      description: 'Партия готова к matching. Изменения невозможны без согласования.',
    },
    {
      stage: 'Matched',
      labelRu: 'В сделке',
      icon: Handshake,
      color: 'primary',
      description: 'Партия сопоставлена с заявкой МПК. Ожидается поставка.',
    },
    {
      stage: 'Delivered',
      labelRu: 'Поставлено',
      icon: Package,
      color: 'violet',
      description: 'Поставка завершена. Расчёты выполнены.',
    },
  ];

  const standardRequirements = [
    {
      requirement: 'Минимум 3 успешных поставки',
      description: 'Подтверждённые поставки с положительной оценкой',
    },
    {
      requirement: 'Соблюдение сроков ≥90%',
      description: 'Доля поставок, выполненных в заявленный период',
    },
    {
      requirement: 'Соответствие объёмов ≥85%',
      description: 'Отклонение фактического объёма от заявленного',
    },
    {
      requirement: 'Отсутствие отклонений по качеству',
      description: 'Нет критических замечаний по качеству поголовья',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/30' },
      primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30' },
    };
    return colorMap[color] || colorMap.slate;
  };

  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Данный раздел носит информационный характер. Условия и правила могут обновляться. 
              Актуальные требования уточняйте у администратора.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Grading Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Уровни поставщика</CardTitle>
          <CardDescription>
            Три уровня участия в Turan Standard Pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {gradingLevels.map((level, index) => {
              const colors = getColorClasses(level.color);
              return (
                <div key={level.level} className="relative">
                  <Card className={`h-full ${colors.border} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <level.icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                          <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0`}>
                            {level.level}
                          </Badge>
                          <p className="text-sm font-medium mt-0.5">{level.labelRu}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                      <div className="space-y-2">
                        {level.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{cap}</span>
                          </div>
                        ))}
                        {level.restrictions.map((res, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-4 h-4 flex items-center justify-center shrink-0">–</span>
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {index < gradingLevels.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Batch Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle>Жизненный цикл партии</CardTitle>
          <CardDescription>
            Этапы, через которые проходит каждая партия скота
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batchLifecycle.map((stage, index) => {
              const colors = getColorClasses(stage.color);
              return (
                <div key={stage.stage} className="relative">
                  <div className={`flex items-start gap-4 p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                    <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0`}>
                      <stage.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`${colors.text} border-current/30`}>
                          {stage.stage}
                        </Badge>
                        <span className="text-sm font-medium">{stage.labelRu}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                  {index < batchLifecycle.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Standard Supplier Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Требования для статуса "Стандартный поставщик"</CardTitle>
          <CardDescription>
            Критерии для получения максимальных премий и приоритета
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {standardRequirements.map((req, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-secondary/20"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{req.requirement}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
