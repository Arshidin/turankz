/**
 * DeliveryConditionGuide Component
 *
 * Sprint 7-8: Explains delivery compliance criteria and what is checked.
 * Helps users understand what conditions must be met for successful delivery.
 */

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Truck,
  Scale,
  Calendar,
  FileCheck,
  Thermometer,
  ShieldCheck,
  Info,
  ClipboardList,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeliveryConditionGuideProps {
  variant?: 'inline' | 'full';
  lang?: 'en' | 'ru';
  className?: string;
}

interface Condition {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  critical: boolean;
}

const DELIVERY_CONDITIONS: Condition[] = [
  {
    id: 'volume',
    icon: <Scale className="h-5 w-5" />,
    title: 'Volume Match',
    titleRu: 'Соответствие объёма',
    description: 'Delivered volume matches or exceeds the matched quantity. Minor variance (-5%) acceptable.',
    descriptionRu: 'Доставленный объём соответствует или превышает согласованное количество. Допустимое отклонение -5%.',
    critical: true,
  },
  {
    id: 'timing',
    icon: <Calendar className="h-5 w-5" />,
    title: 'Delivery Window',
    titleRu: 'Окно доставки',
    description: 'Livestock delivered within the scheduled delivery window dates.',
    descriptionRu: 'Скот доставлен в рамках запланированного окна доставки.',
    critical: true,
  },
  {
    id: 'quality',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Quality Grade',
    titleRu: 'Класс качества',
    description: 'Animals meet the specified grade requirements (Standard/Premium/Choice).',
    descriptionRu: 'Животные соответствуют указанным требованиям класса (Стандарт/Премиум/Отборный).',
    critical: true,
  },
  {
    id: 'weight',
    icon: <Scale className="h-5 w-5" />,
    title: 'Weight Range',
    titleRu: 'Весовой диапазон',
    description: 'Average weight falls within the accepted weight range specified in the request.',
    descriptionRu: 'Средний вес находится в пределах диапазона, указанного в заявке.',
    critical: false,
  },
  {
    id: 'health',
    icon: <Thermometer className="h-5 w-5" />,
    title: 'Health Certificate',
    titleRu: 'Ветеринарный сертификат',
    description: 'Valid veterinary health certificate accompanies the delivery.',
    descriptionRu: 'Доставка сопровождается действующим ветеринарным сертификатом.',
    critical: true,
  },
  {
    id: 'documentation',
    icon: <FileCheck className="h-5 w-5" />,
    title: 'Documentation',
    titleRu: 'Документация',
    description: 'All required transport and ownership documents are provided.',
    descriptionRu: 'Предоставлены все необходимые транспортные документы и документы на собственность.',
    critical: false,
  },
];

export function DeliveryConditionGuide({
  variant = 'inline',
  lang = 'ru',
  className,
}: DeliveryConditionGuideProps) {
  const t = lang === 'ru' ? {
    title: 'Критерии приёмки доставки',
    subtitle: 'Условия для успешного подтверждения',
    inlineText: 'Доставка проверяется на соответствие объёма, сроков, качества и документации.',
    critical: 'Обязательно',
    recommended: 'Рекомендуется',
    complianceNote: 'Все обязательные критерии должны быть выполнены для подтверждения доставки.',
    forFarmers: 'Для фермеров',
    forFarmersText: 'Убедитесь, что скот соответствует всем критериям до отправки. Несоответствие может привести к задержке оплаты.',
    forMpk: 'Для МПК',
    forMpkText: 'При приёмке проверьте все критерии. Отмечайте любые расхождения в комментариях к доставке.',
  } : {
    title: 'Delivery Acceptance Criteria',
    subtitle: 'Conditions for successful confirmation',
    inlineText: 'Deliveries are verified for volume, timing, quality, and documentation compliance.',
    critical: 'Required',
    recommended: 'Recommended',
    complianceNote: 'All required criteria must be met for delivery confirmation.',
    forFarmers: 'For Farmers',
    forFarmersText: 'Ensure livestock meets all criteria before dispatch. Non-compliance may delay payment.',
    forMpk: 'For MPK',
    forMpkText: 'When receiving, verify all criteria. Note any discrepancies in delivery comments.',
  };

  if (variant === 'inline') {
    return (
      <Alert className={cn('border-blue-500/30 bg-blue-500/5', className)}>
        <Truck className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">{t.title}</span>
          <span className="text-muted-foreground block mt-1">{t.inlineText}</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={cn('border-blue-500/30 bg-blue-500/5', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>

        {/* Conditions list */}
        <div className="space-y-3">
          {DELIVERY_CONDITIONS.map((condition) => (
            <div
              key={condition.id}
              className={cn(
                'p-3 rounded-lg border-2 transition-all',
                condition.critical
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-transparent bg-muted/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    condition.critical ? 'bg-amber-500/10' : 'bg-muted'
                  )}
                >
                  <span className={condition.critical ? 'text-amber-600' : 'text-muted-foreground'}>
                    {condition.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {lang === 'ru' ? condition.titleRu : condition.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        condition.critical
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {condition.critical ? t.critical : t.recommended}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'ru' ? condition.descriptionRu : condition.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance note */}
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-700">{t.complianceNote}</AlertDescription>
        </Alert>

        {/* Role-specific guidance */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-emerald-900 mb-2">{t.forFarmers}</h4>
            <p className="text-xs text-muted-foreground">{t.forFarmersText}</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">{t.forMpk}</h4>
            <p className="text-xs text-muted-foreground">{t.forMpkText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeliveryConditionGuide;
