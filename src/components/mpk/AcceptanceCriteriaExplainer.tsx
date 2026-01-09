/**
 * AcceptanceCriteriaExplainer Component
 *
 * Provides clear explanations and examples for MPK acceptance criteria.
 * Helps MPKs understand how to specify livestock requirements effectively.
 */

import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AcceptanceCriteriaExplainerProps {
  /** Show as compact inline help or full explanation */
  variant?: 'inline' | 'full';
  /** Translation function for i18n support */
  t?: (key: string) => string;
}

export function AcceptanceCriteriaExplainer({
  variant = 'inline',
  t = (key) => key
}: AcceptanceCriteriaExplainerProps) {

  if (variant === 'inline') {
    return (
      <Alert className="border-blue-500/30 bg-blue-500/5 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">
            Критерии приемки определяют какой скот вы готовы принять
          </span>
          <span className="text-muted-foreground block mt-1">
            Укажите хотя бы один критерий (породы, пол, возраст или вес).
            Чем шире критерии, тем больше шансов найти подходящие партии.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Full explanation with examples
  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Как работают критерии приемки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* How it works */}
        <div>
          <h4 className="text-sm font-medium mb-2">Что это такое?</h4>
          <p className="text-sm text-muted-foreground">
            Критерии приемки определяют характеристики скота, которые вы можете принять на переработку.
            Система будет сопоставлять вашу заявку только с партиями, которые соответствуют вашим критериям.
          </p>
        </div>

        {/* Examples */}
        <div>
          <h4 className="text-sm font-medium mb-2">Примеры использования:</h4>
          <div className="space-y-3">
            {/* Example 1: Narrow criteria */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Узкие критерии (специализированное производство)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Для производства говядины премиум-класса
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Только Beef Cattle</Badge>
                <Badge variant="outline" className="text-xs">Возраст: 24-36 месяцев</Badge>
                <Badge variant="outline" className="text-xs">Вес: 400-500 кг</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Высокое качество продукции<br/>
                ✗ Меньше доступных партий
              </p>
            </div>

            {/* Example 2: Medium criteria */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Средние критерии (стандартное производство)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Для стандартного мясопроизводства
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Beef Cattle ИЛИ Dairy Cattle</Badge>
                <Badge variant="outline" className="text-xs">Вес: 300-550 кг</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Баланс качества и объёма<br/>
                ✓ Больше доступных партий
              </p>
            </div>

            {/* Example 3: Wide criteria */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Широкие критерии (максимальный объём)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Для переработки любого скота
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Любые породы</Badge>
                <Badge variant="outline" className="text-xs">Любой возраст и вес</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Максимум доступных партий<br/>
                ✓ Быстрое заполнение заявки<br/>
                ✗ Разное качество продукции
              </p>
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
                <li>Необходимо указать хотя бы один критерий (породы, пол, возраст или вес)</li>
                <li>Чем строже критерии, тем меньше доступных партий для сопоставления</li>
                <li>Пустые поля означают "любое значение" для этого критерия</li>
                <li>Критерии можно изменить до начала matching window</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How matching works */}
        <div>
          <h4 className="text-sm font-medium mb-2">Как работает сопоставление?</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. <strong>Полное совпадение:</strong> Партия полностью соответствует всем критериям</p>
            <p>2. <strong>Частичное совпадение:</strong> Партия соответствует большинству критериев</p>
            <p>3. <strong>Плохое совпадение:</strong> Партия соответствует минимальным требованиям</p>
            <p className="mt-2 pt-2 border-t">
              Администратор видит уровень совпадения и может принять решение о создании match вручную,
              даже если автоматическое совпадение неидеально.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AcceptanceCriteriaPreview Component
 *
 * Shows a preview of what the MPK will receive based on selected criteria
 */

interface CriteriaPreviewProps {
  selectedBreeds: string[];
  selectedGenders: string[];
  ageMin?: number | null;
  ageMax?: number | null;
  weightMin?: number | null;
  weightMax?: number | null;
}

export function AcceptanceCriteriaPreview({
  selectedBreeds,
  selectedGenders,
  ageMin,
  ageMax,
  weightMin,
  weightMax,
}: CriteriaPreviewProps) {
  const hasAnyBreed = selectedBreeds.length === 0;
  const hasAnyGender = selectedGenders.length === 0;
  const hasAnyAge = !ageMin && !ageMax;
  const hasAnyWeight = !weightMin && !weightMax;

  const allAny = hasAnyBreed && hasAnyGender && hasAnyAge && hasAnyWeight;

  if (allAny) {
    return (
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs">
          <span className="font-medium text-amber-700">Очень широкие критерии</span>
          <span className="text-muted-foreground block mt-1">
            Вы получите скот любой породы, пола, возраста и веса.
            Рекомендуем указать хотя бы один критерий для контроля качества.
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <p className="text-xs font-medium mb-2">Предпросмотр: Вы получите скот с характеристиками:</p>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          • <strong>Породы:</strong>{' '}
          {hasAnyBreed ? 'любые' : selectedBreeds.join(', ')}
        </p>
        <p>
          • <strong>Пол:</strong>{' '}
          {hasAnyGender ? 'любой' : selectedGenders.join(', ')}
        </p>
        <p>
          • <strong>Возраст:</strong>{' '}
          {hasAnyAge
            ? 'любой'
            : `${ageMin || 'любой'} - ${ageMax || 'любой'} месяцев`}
        </p>
        <p>
          • <strong>Вес:</strong>{' '}
          {hasAnyWeight
            ? 'любой'
            : `${weightMin || 'любой'} - ${weightMax || 'любой'} кг`}
        </p>
      </div>
    </div>
  );
}
