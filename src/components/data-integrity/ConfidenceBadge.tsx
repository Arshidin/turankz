import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { type DataConfidenceLevel, CONFIDENCE_LEVELS } from '@/hooks/useHerdStructure';

interface ConfidenceBadgeProps {
  level: DataConfidenceLevel | string;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const CONFIDENCE_CONFIG: Record<DataConfidenceLevel, { 
  icon: typeof CheckCircle2; 
  color: string;
  bgColor: string;
  reliability: string;
}> = {
  self_declared: { 
    icon: Clock, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    reliability: 'Lower reliability – Farmer-reported, not yet reviewed by admin'
  },
  reviewed: { 
    icon: AlertCircle, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    reliability: 'Medium reliability – Admin has reviewed but not independently verified'
  },
  verified: { 
    icon: CheckCircle2, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    reliability: 'High reliability – Independently verified through official records or inspection'
  },
};

export function ConfidenceBadge({ level, showTooltip = true, size = 'sm' }: ConfidenceBadgeProps) {
  const config = CONFIDENCE_CONFIG[level as DataConfidenceLevel] || CONFIDENCE_CONFIG.self_declared;
  const levelInfo = CONFIDENCE_LEVELS[level as DataConfidenceLevel] || CONFIDENCE_LEVELS.self_declared;
  const Icon = config.icon;
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'} ${config.bgColor} cursor-help`}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} mr-1 ${config.color}`} />
      {levelInfo.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{levelInfo.label}</p>
            <p className="text-xs text-muted-foreground">{config.reliability}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ConfidenceLegend() {
  return (
    <div className="flex flex-wrap gap-4 p-3 rounded-lg border bg-muted/30">
      <div className="flex items-center gap-2 text-xs">
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">Data Reliability:</span>
      </div>
      {(['self_declared', 'reviewed', 'verified'] as DataConfidenceLevel[]).map((level) => (
        <ConfidenceBadge key={level} level={level} size="md" />
      ))}
    </div>
  );
}
