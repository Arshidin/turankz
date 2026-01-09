/**
 * MarketIntentExplainer Component
 *
 * Sprint 11-12 Phase 11.1: Explains the Market Intent (Market Signals) system.
 * Helps farmers understand how to signal future livestock availability
 * and the non-binding nature of these signals.
 *
 * Key points:
 * - Market Intent is voluntary and non-binding
 * - Signals help TURAN forecast supply
 * - Does NOT create batches or commitments
 * - Three time horizons: 3m, 6m, 12m
 * - Confidence levels: low, medium, high
 */

import {
  Info,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Shield,
  Lightbulb,
  CalendarDays,
  Target,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MarketIntentExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
}

// Horizon configuration
const HORIZONS = [
  {
    key: '3m',
    labelEn: '3 Months',
    labelRu: '3 месяца',
    descriptionRu: 'Краткосрочный индикативный прогноз поставок',
    color: 'emerald',
    icon: Clock,
  },
  {
    key: '6m',
    labelEn: '6 Months',
    labelRu: '6 месяцев',
    descriptionRu: 'Среднесрочный индикативный прогноз поставок',
    color: 'blue',
    icon: CalendarDays,
  },
  {
    key: '12m',
    labelEn: '12 Months',
    labelRu: '12 месяцев',
    descriptionRu: 'Долгосрочный индикативный прогноз поставок',
    color: 'purple',
    icon: TrendingUp,
  },
];

// Confidence levels configuration
const CONFIDENCE_LEVELS = [
  {
    key: 'low',
    labelRu: 'Низкая',
    descriptionRu: 'Предварительная оценка, может значительно измениться',
    color: 'amber',
  },
  {
    key: 'medium',
    labelRu: 'Средняя',
    descriptionRu: 'Индикативная оценка, основанная на текущих планах',
    color: 'blue',
  },
  {
    key: 'high',
    labelRu: 'Высокая',
    descriptionRu: 'Вероятная оценка, основанная на подтверждённых данных',
    color: 'emerald',
  },
];

export function MarketIntentExplainer({
  variant = 'inline',
}: MarketIntentExplainerProps) {
  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Рыночные намерения — добровольный и необязывающий прогноз ваших поставок
          </span>
          <span className="text-muted-foreground block mt-1">
            Укажите примерное количество голов скота, которое планируете продать в ближайшие 3, 6 или 12 месяцев.
            Это помогает TURAN прогнозировать поставки, но <strong>не создаёт обязательств</strong>.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Full explanation
  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Рыночные намерения: Полное руководство
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is Market Intent */}
        <div>
          <h4 className="text-sm font-medium mb-2">Что такое рыночные намерения?</h4>
          <p className="text-sm text-muted-foreground">
            Рыночные намерения — это <strong>добровольный и необязывающий</strong> способ
            сообщить TURAN о ваших планах по продаже скота в будущем.
            Это помогает платформе прогнозировать предложение и лучше планировать
            сопоставление с заявками МПК.
          </p>
        </div>

        {/* Key disclaimer */}
        <Alert className="border-emerald-500/50 bg-emerald-500/10">
          <Shield className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-sm font-medium text-emerald-800">
            Важно: Это НЕ обязательство
          </AlertTitle>
          <AlertDescription className="text-xs text-emerald-700 mt-1">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Рыночные намерения не создают партии скота</li>
              <li>Вы можете изменить или удалить намерение в любое время</li>
              <li>Никаких финансовых или юридических обязательств</li>
              <li>Это просто индикативный прогноз для планирования</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Time horizons */}
        <div>
          <h4 className="text-sm font-medium mb-3">Горизонты планирования:</h4>
          <div className="space-y-2">
            {HORIZONS.map((horizon) => {
              const Icon = horizon.icon;
              const colorClasses = {
                emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700',
                blue: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
                purple: 'bg-purple-500/10 border-purple-500/30 text-purple-700',
              };
              const colorClass = colorClasses[horizon.color as keyof typeof colorClasses];

              return (
                <div
                  key={horizon.key}
                  className={`p-3 rounded-lg border ${colorClass}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{horizon.labelRu}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {horizon.descriptionRu}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence levels */}
        <div>
          <h4 className="text-sm font-medium mb-3">Уровни уверенности:</h4>
          <div className="space-y-2">
            {CONFIDENCE_LEVELS.map((level) => {
              const colorClasses = {
                amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
                blue: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
                emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
              };
              const colorClass = colorClasses[level.color as keyof typeof colorClasses];

              return (
                <div
                  key={level.key}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${colorClass}`}
                  >
                    {level.labelRu}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {level.descriptionRu}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it helps */}
        <div>
          <h4 className="text-sm font-medium mb-2">Зачем указывать намерения?</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Лучшее сопоставление:</strong> TURAN
                может заранее видеть потенциальное предложение и эффективнее
                планировать сопоставление с заявками МПК.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Видимость для МПК:</strong> Мясоперерабатывающие
                комбинаты видят агрегированные данные (без вашего имени) и могут
                планировать закупки.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Ваши преимущества:</strong> Когда вы
                создадите реальную партию, система уже будет знать о вашем предложении
                и сможет быстрее найти покупателя.
              </p>
            </div>
          </div>
        </div>

        {/* Example workflow */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Пример использования:</h4>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-2">
            <li>Вы указываете: "Через 6 месяцев планирую продать ~50 голов казахской белоголовой"</li>
            <li>TURAN агрегирует намерения всех фермеров для прогноза предложения</li>
            <li>МПК видит: "В регионе X через 6 месяцев ожидается ~500 голов" (без имён)</li>
            <li>Когда скот готов к продаже, вы создаёте реальную партию</li>
            <li>Намерение автоматически НЕ превращается в партию — вы создаёте её сами</li>
          </ol>
        </div>

        {/* Comparison with batch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-amber-500/5 border border-amber-500/30 rounded-lg">
            <h5 className="text-sm font-medium text-amber-800 mb-2">
              ❌ Рыночное намерение — это НЕ:
            </h5>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
              <li>Партия скота</li>
              <li>Обязательство продать</li>
              <li>Гарантия цены</li>
              <li>Резервирование</li>
            </ul>
          </div>

          <div className="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
            <h5 className="text-sm font-medium text-emerald-800 mb-2">
              ✓ Рыночное намерение — это:
            </h5>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
              <li>Индикативный прогноз</li>
              <li>Добровольная информация</li>
              <li>Помощь в планировании</li>
              <li>Без обязательств</li>
            </ul>
          </div>
        </div>

        {/* Important notes */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Важно помнить:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Обновляйте намерения регулярно для точности прогноза</li>
                <li>Удаляйте намерения, если планы изменились</li>
                <li>Администратор может верифицировать ваши данные</li>
                <li>МПК не видит ваше имя — только агрегированные данные</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">Готовы добавить намерение?</p>
          <p>
            Перейдите в раздел "Рыночные намерения" и укажите примерное количество
            голов, которое планируете продать. Вы можете создать несколько намерений
            для разных пород и горизонтов.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
