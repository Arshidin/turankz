/**
 * HerdStructureExplainer Component
 *
 * Sprint 11-12 Phase 11.1: Explains the Herd Structure reporting system.
 * Helps farmers understand the purpose of livestock capacity snapshots
 * and how to report their herd composition.
 *
 * Key points:
 * - Herd structure is for national capacity planning
 * - Does NOT create batches or commitments
 * - Supports annual and quarterly reporting
 * - Categories: breeding cows, replacement heifers, bulls, calves
 * - Verification workflow: self_declared → reviewed → verified
 */

import {
  Info,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Shield,
  Users,
  TrendingUp,
  FileText,
  Clock,
  PieChart,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HerdStructureExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
}

// Livestock categories configuration
const LIVESTOCK_CATEGORIES = [
  {
    key: 'breeding_cows',
    labelRu: 'Маточное поголовье',
    descriptionRu: 'Взрослые коровы, используемые для воспроизводства',
    icon: '🐄',
    color: 'emerald',
  },
  {
    key: 'replacement_heifers',
    labelRu: 'Ремонтные тёлки',
    descriptionRu: 'Молодые самки для замены маточного стада',
    icon: '🐂',
    color: 'blue',
  },
  {
    key: 'bulls',
    labelRu: 'Быки-производители',
    descriptionRu: 'Племенные быки для воспроизводства',
    icon: '🐃',
    color: 'purple',
  },
  {
    key: 'calves',
    labelRu: 'Телята',
    descriptionRu: 'Молодняк до 12 месяцев',
    icon: '🐮',
    color: 'amber',
  },
];

// Reporting periods configuration
const REPORTING_PERIODS = [
  {
    key: 'annual',
    labelRu: 'Годовой',
    descriptionRu: 'Один отчёт за весь год',
    recommended: true,
  },
  {
    key: 'quarterly',
    labelRu: 'Квартальный',
    descriptionRu: 'Четыре отчёта за год (Q1-Q4)',
    recommended: false,
  },
];

// Verification levels
const VERIFICATION_LEVELS = [
  {
    key: 'self_declared',
    labelRu: 'Заявлено фермером',
    descriptionRu: 'Данные введены фермером, ожидают проверки',
    color: 'slate',
  },
  {
    key: 'reviewed',
    labelRu: 'Проверено',
    descriptionRu: 'Администратор просмотрел данные',
    color: 'blue',
  },
  {
    key: 'verified',
    labelRu: 'Верифицировано',
    descriptionRu: 'Данные подтверждены независимой проверкой',
    color: 'emerald',
  },
];

export function HerdStructureExplainer({
  variant = 'inline',
}: HerdStructureExplainerProps) {
  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Структура стада — периодический отчёт о вашем поголовье для национального планирования
          </span>
          <span className="text-muted-foreground block mt-1">
            Укажите количество голов по категориям (маточное поголовье, тёлки, быки, телята).
            Это помогает TURAN прогнозировать национальные мощности, но <strong>не создаёт обязательств</strong>.
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
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Структура стада: Полное руководство
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What is Herd Structure */}
        <div>
          <h4 className="text-sm font-medium mb-2">Что такое отчёт о структуре стада?</h4>
          <p className="text-sm text-muted-foreground">
            Структура стада — это периодический "снимок" вашего поголовья,
            который помогает TURAN и государственным органам планировать национальные
            мощности по производству говядины. Отчёт показывает текущий состав
            вашего стада по категориям.
          </p>
        </div>

        {/* Key disclaimer */}
        <Alert className="border-emerald-500/50 bg-emerald-500/10">
          <Shield className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-sm font-medium text-emerald-800">
            Это НЕ партия на продажу
          </AlertTitle>
          <AlertDescription className="text-xs text-emerald-700 mt-1">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Отчёт о структуре стада не создаёт партии для продажи</li>
              <li>Это информация для статистики и планирования</li>
              <li>Никаких обязательств по продаже этого скота</li>
              <li>Данные можно удалить в течение 24 часов после создания</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Livestock categories */}
        <div>
          <h4 className="text-sm font-medium mb-3">Категории поголовья:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {LIVESTOCK_CATEGORIES.map((category) => {
              const colorClasses = {
                emerald: 'bg-emerald-500/10 border-emerald-500/30',
                blue: 'bg-blue-500/10 border-blue-500/30',
                purple: 'bg-purple-500/10 border-purple-500/30',
                amber: 'bg-amber-500/10 border-amber-500/30',
              };
              const colorClass = colorClasses[category.color as keyof typeof colorClasses];

              return (
                <div
                  key={category.key}
                  className={`p-3 rounded-lg border ${colorClass}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.labelRu}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.descriptionRu}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reporting periods */}
        <div>
          <h4 className="text-sm font-medium mb-3">Периоды отчётности:</h4>
          <div className="space-y-2">
            {REPORTING_PERIODS.map((period) => (
              <div
                key={period.key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{period.labelRu}</span>
                    {period.recommended && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs">
                        Рекомендуется
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {period.descriptionRu}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Для большинства хозяйств достаточно годового отчёта. Квартальная отчётность
            полезна для крупных хозяйств с существенными сезонными изменениями.
          </p>
        </div>

        {/* Verification workflow */}
        <div>
          <h4 className="text-sm font-medium mb-3">Статусы верификации:</h4>
          <div className="space-y-2">
            {VERIFICATION_LEVELS.map((level, index) => {
              const colorClasses = {
                slate: 'bg-slate-500/10 text-slate-700 border-slate-500/30',
                blue: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
                emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
              };
              const colorClass = colorClasses[level.color as keyof typeof colorClasses];

              return (
                <div
                  key={level.key}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={`text-xs ${colorClass}`}>
                      {index + 1}
                    </Badge>
                    {index < VERIFICATION_LEVELS.length - 1 && (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{level.labelRu}</p>
                    <p className="text-xs text-muted-foreground">
                      {level.descriptionRu}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why report */}
        <div>
          <h4 className="text-sm font-medium mb-2">Зачем подавать отчёт?</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <PieChart className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Национальное планирование:</strong> Данные
                помогают государству и TURAN прогнозировать производственные мощности
                страны.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Прогноз предложения:</strong> На основе
                структуры стада система рассчитывает примерное количество телят,
                которые будут доступны к продаже в будущем.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Агрегированная статистика:</strong> МПК
                видят региональную статистику без идентификации отдельных фермеров.
              </p>
            </div>
          </div>
        </div>

        {/* Seasonal considerations */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Сезонные особенности:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>
                  <strong>Весна (Q1-Q2):</strong> Пик отёлов, увеличение телят
                </li>
                <li>
                  <strong>Лето-осень (Q2-Q3):</strong> Выращивание, стабильная структура
                </li>
                <li>
                  <strong>Осень-зима (Q4):</strong> Продажа откормленного молодняка
                </li>
                <li>
                  <strong>Годовой отчёт:</strong> Лучше подавать в начале года (Q1)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Indicative outlook */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-blue-900 mb-1">Индикативный прогноз:</p>
              <p className="text-muted-foreground">
                На основе вашего маточного поголовья и средних показателей отёла,
                система автоматически рассчитывает примерное количество телят,
                которые появятся в следующем году. Это помогает планировать
                будущие поставки.
              </p>
            </div>
          </div>
        </div>

        {/* How to fill */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Как заполнить отчёт:</h4>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-2">
            <li>Выберите период отчётности (годовой или квартальный)</li>
            <li>Укажите год (и квартал, если квартальный отчёт)</li>
            <li>Выберите породу скота</li>
            <li>Введите количество голов по каждой категории</li>
            <li>Добавьте примечания при необходимости</li>
            <li>Отправьте отчёт — администратор проверит данные</li>
          </ol>
        </div>

        {/* Important notes */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Важно помнить:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Нельзя создать отчёт за будущий период</li>
                <li>Отчёт можно удалить в течение 24 часов после создания</li>
                <li>Один отчёт на период на породу</li>
                <li>Данные видны только администратору (именные) и МПК (агрегированные)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">Готовы подать отчёт?</p>
          <p>
            Перейдите в раздел "Структура стада" и создайте новый снимок.
            Мастер поможет вам пошагово заполнить данные по всем категориям поголовья.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
