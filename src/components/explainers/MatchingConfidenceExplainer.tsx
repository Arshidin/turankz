/**
 * MatchingConfidenceExplainer Component
 *
 * Provides clear explanations of the matching confidence scoring system.
 * Helps users understand how match confidence is calculated and what different levels mean.
 *
 * Created: Sprint 6 - Task 9.4.1
 */

import { Info, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchingConfidenceExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
  /** Translation function for i18n support */
  t?: (key: string) => string;
}

export function MatchingConfidenceExplainer({
  variant = 'inline',
  t = (key) => key,
}: MatchingConfidenceExplainerProps) {
  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Уровень совпадения показывает насколько партия соответствует критериям заявки
          </span>
          <span className="text-muted-foreground block mt-1">
            Оценка от 0 до 100 баллов учитывает период доставки, регион, грейд, вес и возраст скота.
            Чем выше балл, тем лучше совпадение.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Full explanation with scoring breakdown
  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Как рассчитывается уровень совпадения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scoring system */}
        <div>
          <h4 className="text-sm font-medium mb-2">Система оценки (100 баллов макс.)</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">🚚 Период доставки</span>
              <Badge variant="outline" className="text-xs font-mono">30 баллов</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">📍 Регион</span>
              <Badge variant="outline" className="text-xs font-mono">25 баллов</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">⭐ Грейд (категория)</span>
              <Badge variant="outline" className="text-xs font-mono">25 баллов</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">⚖️ Диапазон веса</span>
              <Badge variant="outline" className="text-xs font-mono">10 баллов</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">📅 Диапазон возраста</span>
              <Badge variant="outline" className="text-xs font-mono">10 баллов</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Важные критерии (доставка, регион, грейд) имеют больший вес в итоговой оценке.
          </p>
        </div>

        {/* Confidence levels */}
        <div>
          <h4 className="text-sm font-medium mb-2">Уровни совпадения:</h4>
          <div className="space-y-3">
            {/* Perfect match */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-700">Отличное совпадение</p>
                    <Badge className="bg-emerald-600 text-white text-xs">90-100 баллов</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Партия полностью соответствует всем ключевым критериям заявки.
                    Рекомендуется к включению в pool.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                <span>Высокая вероятность успешной поставки</span>
              </div>
            </div>

            {/* Good match */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-700">Хорошее совпадение</p>
                    <Badge className="bg-blue-600 text-white text-xs">70-89 баллов</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Партия соответствует большинству критериев с небольшими отклонениями.
                    Можно использовать для заполнения pool.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-700">
                <TrendingUp className="h-3 w-3" />
                <span>Подходит для стандартных заявок</span>
              </div>
            </div>

            {/* Acceptable match */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-amber-700">Приемлемое совпадение</p>
                    <Badge className="bg-amber-600 text-white text-xs">50-69 баллов</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Партия соответствует минимальным требованиям, но имеет заметные отклонения.
                    Требует внимательной проверки перед включением.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                <AlertCircle className="h-3 w-3" />
                <span>Проверьте детали перед подтверждением</span>
              </div>
            </div>

            {/* Poor match */}
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-red-700">Слабое совпадение</p>
                    <Badge className="bg-red-600 text-white text-xs">0-49 баллов</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Партия значительно отличается от критериев заявки.
                    Не рекомендуется для автоматического matching.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-red-700">
                <TrendingDown className="h-3 w-3" />
                <span>Высокий риск несоответствия ожиданиям</span>
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div>
          <h4 className="text-sm font-medium mb-2">Примеры расчета:</h4>
          <div className="space-y-2">
            {/* Example 1: Perfect */}
            <div className="p-3 bg-muted/50 rounded-lg text-xs">
              <p className="font-medium mb-2">Пример 1: Отличное совпадение (95 баллов)</p>
              <div className="space-y-1 text-muted-foreground">
                <p>✓ Период доставки: Краткосрочная = Краткосрочная (+30)</p>
                <p>✓ Регион: Северо-Казахстанская = Северо-Казахстанская (+25)</p>
                <p>✓ Грейд: A = A (+25)</p>
                <p>✓ Вес: 400 кг попадает в 350-450 кг (+10)</p>
                <p>~ Возраст: 26 месяцев попадает в 24-30 месяцев (+5 из 10)</p>
              </div>
            </div>

            {/* Example 2: Good */}
            <div className="p-3 bg-muted/50 rounded-lg text-xs">
              <p className="font-medium mb-2">Пример 2: Хорошее совпадение (75 баллов)</p>
              <div className="space-y-1 text-muted-foreground">
                <p>✓ Период доставки: Краткосрочная = Краткосрочная (+30)</p>
                <p>✓ Регион: Северо-Казахстанская = Северо-Казахстанская (+25)</p>
                <p>~ Грейд: B вместо A (+10 из 25)</p>
                <p>✓ Вес: 380 кг попадает в 350-450 кг (+10)</p>
                <p>✗ Возраст: 40 месяцев не попадает в 24-30 месяцев (+0)</p>
              </div>
            </div>

            {/* Example 3: Poor */}
            <div className="p-3 bg-muted/50 rounded-lg text-xs">
              <p className="font-medium mb-2">Пример 3: Слабое совпадение (35 баллов)</p>
              <div className="space-y-1 text-muted-foreground">
                <p>✗ Период доставки: Долгосрочная вместо Краткосрочная (+0)</p>
                <p>✓ Регион: Северо-Казахстанская = Северо-Казахстанская (+25)</p>
                <p>✗ Грейд: C вместо A (+0)</p>
                <p>✓ Вес: 400 кг попадает в 350-450 кг (+10)</p>
                <p>✗ Возраст: 60 месяцев не попадает в 24-30 месяцев (+0)</p>
              </div>
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
                <li>Уровень совпадения - это рекомендация, не жесткое правило</li>
                <li>Администратор может создать matching даже при низком балле</li>
                <li>Период доставки и регион - самые важные критерии (55 баллов)</li>
                <li>Учитываются только заполненные критерии в заявке МПК</li>
                <li>Система обновляет оценку при изменении критериев</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Admin override note */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">Для администраторов:</p>
          <p>
            Уровень совпадения помогает приоритизировать партии для matching.
            Сначала рассматривайте партии с отличным и хорошим совпадением.
            Партии с приемлемым и слабым совпадением требуют дополнительной проверки
            и согласования с МПК перед включением в pool.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MatchingConfidenceBreakdown Component
 *
 * Shows a detailed breakdown of how confidence score was calculated
 */

interface MatchingConfidenceBreakdownProps {
  deliveryPeriodScore: number;
  regionScore: number;
  gradeScore: number;
  weightScore: number;
  ageScore: number;
  totalScore: number;
}

export function MatchingConfidenceBreakdown({
  deliveryPeriodScore,
  regionScore,
  gradeScore,
  weightScore,
  ageScore,
  totalScore,
}: MatchingConfidenceBreakdownProps) {
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const scoreItems = [
    { label: 'Период доставки', score: deliveryPeriodScore, max: 30 },
    { label: 'Регион', score: regionScore, max: 25 },
    { label: 'Грейд', score: gradeScore, max: 25 },
    { label: 'Вес', score: weightScore, max: 10 },
    { label: 'Возраст', score: ageScore, max: 10 },
  ];

  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <p className="text-xs font-medium mb-3">Детали расчета уровня совпадения:</p>
      <div className="space-y-2">
        {scoreItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.score === item.max
                      ? 'bg-emerald-600'
                      : item.score >= item.max * 0.7
                      ? 'bg-blue-600'
                      : item.score >= item.max * 0.5
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${getScoreColor(item.score, item.max)}`}>
                {item.score}/{item.max}
              </span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm font-medium">Итого:</span>
          <span
            className={`text-sm font-mono font-bold ${
              totalScore >= 90
                ? 'text-emerald-600'
                : totalScore >= 70
                ? 'text-blue-600'
                : totalScore >= 50
                ? 'text-amber-600'
                : 'text-red-600'
            }`}
          >
            {totalScore}/100
          </span>
        </div>
      </div>
    </div>
  );
}
