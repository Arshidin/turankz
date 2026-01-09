/**
 * DeliveryPeriodExplainer Component
 *
 * Sprint 6 Task 9.4.2: Explains delivery period categories and their impact on matching.
 * Helps users understand the difference between short_term, mid_term, and long_term delivery.
 *
 * Delivery Periods:
 * - Short Term (0-4 weeks): Immediate delivery, high urgency
 * - Mid Term (4-8 weeks): Standard delivery, moderate planning
 * - Long Term (8+ weeks): Extended delivery, long-term planning
 */

import { Info, Clock, Zap, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DELIVERY_PERIODS,
  DELIVERY_PERIOD_LABELS_RU,
  DELIVERY_PERIOD_RANGES,
  type DeliveryPeriod,
} from '@/lib/delivery-periods';

interface DeliveryPeriodExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
  /** Highlight a specific period */
  highlightPeriod?: DeliveryPeriod | null;
}

export function DeliveryPeriodExplainer({
  variant = 'inline',
  highlightPeriod = null,
}: DeliveryPeriodExplainerProps) {
  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Период доставки определяет сроки готовности к отгрузке
          </span>
          <span className="text-muted-foreground block mt-1">
            Краткосрочная (0-4 недели) — срочные поставки.
            Среднесрочная (4-8 недель) — стандартное планирование.
            Долгосрочная (8+ недель) — заблаговременное планирование.
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
          <Calendar className="h-5 w-5 text-blue-600" />
          Периоды доставки: Полное руководство
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is delivery period */}
        <div>
          <h4 className="text-sm font-medium mb-2">Что такое период доставки?</h4>
          <p className="text-sm text-muted-foreground">
            Период доставки указывает временной горизонт, в течение которого партия скота
            будет готова к отгрузке. Это помогает МПК планировать производство и
            сопоставлять заявки с подходящими партиями.
          </p>
        </div>

        {/* Period details */}
        <div>
          <h4 className="text-sm font-medium mb-3">Категории периодов:</h4>
          <div className="space-y-3">
            {/* Short Term */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                highlightPeriod === 'short_term'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-transparent bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{DELIVERY_PERIOD_LABELS_RU.short_term}</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                      {DELIVERY_PERIOD_RANGES.short_term.min}-{DELIVERY_PERIOD_RANGES.short_term.max} недели
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Скот готов к отгрузке в ближайшее время. Подходит для срочных заявок
                    и оперативного восполнения объёмов.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-emerald-500/5">Высокий приоритет</Badge>
                    <Badge variant="outline" className="text-xs bg-emerald-500/5">Быстрое сопоставление</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Term */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                highlightPeriod === 'mid_term'
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-transparent bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{DELIVERY_PERIOD_LABELS_RU.mid_term}</span>
                    <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30">
                      {DELIVERY_PERIOD_RANGES.mid_term.min}-{DELIVERY_PERIOD_RANGES.mid_term.max} недель
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Стандартный горизонт планирования. Оптимальный баланс между доступностью
                    партий и временем для подготовки.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-blue-500/5">Стандартное планирование</Badge>
                    <Badge variant="outline" className="text-xs bg-blue-500/5">Большой выбор партий</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Long Term */}
            <div
              className={`p-3 rounded-lg border-2 transition-all ${
                highlightPeriod === 'long_term'
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-transparent bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{DELIVERY_PERIOD_LABELS_RU.long_term}</span>
                    <Badge className="bg-purple-500/15 text-purple-700 border-purple-500/30">
                      {DELIVERY_PERIOD_RANGES.long_term.min}+ недель
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Заблаговременное планирование поставок. Позволяет зарезервировать
                    партии заранее и обеспечить стабильные объёмы.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs bg-purple-500/5">Долгосрочное планирование</Badge>
                    <Badge variant="outline" className="text-xs bg-purple-500/5">Фиксация цен</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact on matching */}
        <div>
          <h4 className="text-sm font-medium mb-2">Влияние на сопоставление:</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">Точное совпадение:</strong> Партия и заявка имеют одинаковый период
                доставки — получает максимальные баллы (30 из 100).
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">Смежные периоды:</strong> Краткосрочная и среднесрочная
                или среднесрочная и долгосрочная могут быть совместимы при перекрытии сроков.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-foreground">Несовпадение:</strong> Если периоды не пересекаются
                (например, краткосрочная и долгосрочная), партия не получает баллы по этому критерию.
              </p>
            </div>
          </div>
        </div>

        {/* For Farmers */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <h4 className="text-sm font-medium text-emerald-900 mb-2">Для фермеров:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
            <li>Указывайте реалистичный период доставки при создании партии</li>
            <li>Краткосрочные партии получают приоритет при срочных заявках</li>
            <li>Долгосрочные партии помогают МПК планировать производство</li>
            <li>Период можно изменить до подтверждения партии</li>
          </ul>
        </div>

        {/* For MPK */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Для МПК:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
            <li>Выбирайте период доставки исходя из производственного плана</li>
            <li>Краткосрочная доставка: срочное восполнение объёмов</li>
            <li>Среднесрочная доставка: стандартное планирование (рекомендуется)</li>
            <li>Долгосрочная доставка: обеспечение стабильных поставок</li>
          </ul>
        </div>

        {/* Important notes */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Важно помнить:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Период доставки — это обязательство, а не предпочтение</li>
                <li>Несоблюдение сроков влияет на рейтинг доставки фермера</li>
                <li>Администратор может создать сопоставление с разными периодами при необходимости</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
