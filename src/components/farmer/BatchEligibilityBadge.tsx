/**
 * BATCH ELIGIBILITY BADGE
 * 
 * Informational badge showing batch eligibility for nearest matching window.
 * Read-only indicator, no action buttons.
 * Neutral language, no promises or guarantees.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Info
} from 'lucide-react';
import { type Batch } from '@/hooks/useBatches';
import { type MatchingWindow } from '@/lib/matching-window';
import { getBatchWindowEligibility, type BatchEligibilityInfo } from '@/lib/batch-window-eligibility';
import { useTranslation } from 'react-i18next';

interface BatchEligibilityBadgeProps {
  batch: Batch;
  windows?: MatchingWindow[];
  compact?: boolean;
}

export function BatchEligibilityBadge({ batch, windows, compact = false }: BatchEligibilityBadgeProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  const eligibility = getBatchWindowEligibility(batch, windows);

  if (!eligibility.eligible) {
    // Don't show anything if not eligible - avoid negative messaging
    return null;
  }

  const getBadgeVariant = (urgency: BatchEligibilityInfo['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIcon = (urgency: BatchEligibilityInfo['urgency'], canConfirm: boolean) => {
    if (canConfirm) {
      return <CheckCircle2 className="h-3 w-3" />;
    }
    switch (urgency) {
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      case 'medium':
      case 'low':
        return <Clock className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getLabel = (eligibility: BatchEligibilityInfo, lang: 'ru' | 'en') => {
    if (eligibility.canConfirm) {
      return lang === 'ru' ? 'Можно подтвердить' : 'Can confirm';
    }
    
    if (eligibility.windowName) {
      return lang === 'ru' 
        ? `Подходит для "${eligibility.windowName}"`
        : `Eligible for "${eligibility.windowName}"`;
    }
    
    return lang === 'ru' ? 'Подходит для окна' : 'Window eligible';
  };

  const getTooltipText = (eligibility: BatchEligibilityInfo, lang: 'ru' | 'en') => {
    const parts: string[] = [];
    
    if (eligibility.windowName) {
      parts.push(
        lang === 'ru'
          ? `Окно: ${eligibility.windowName}`
          : `Window: ${eligibility.windowName}`
      );
    }
    
    if (eligibility.windowTargetWeek) {
      parts.push(
        lang === 'ru'
          ? `Целевая неделя: ${eligibility.windowTargetWeek}`
          : `Target week: ${eligibility.windowTargetWeek}`
      );
    }
    
    if (eligibility.canConfirm) {
      parts.push(
        lang === 'ru'
          ? 'Партия может быть подтверждена в текущем активном окне'
          : 'Batch can be confirmed in the current active window'
      );
    } else {
      parts.push(
        lang === 'ru'
          ? 'Партия соответствует критериям окна, но окно ещё не активно'
          : 'Batch matches window criteria, but window is not yet active'
      );
    }
    
    parts.push(
      lang === 'ru'
        ? 'Это информационный индикатор, не обязательство'
        : 'This is an informational indicator, not a commitment'
    );
    
    return parts.join('. ');
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getBadgeVariant(eligibility.urgency)}
              className="text-xs cursor-help"
            >
              {getIcon(eligibility.urgency, eligibility.canConfirm)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{getTooltipText(eligibility, lang)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getBadgeVariant(eligibility.urgency)}
            className="text-xs cursor-help flex items-center gap-1"
          >
            {getIcon(eligibility.urgency, eligibility.canConfirm)}
            <span>{getLabel(eligibility, lang)}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{getTooltipText(eligibility, lang)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

