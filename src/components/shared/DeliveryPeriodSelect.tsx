import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FormControl, FormDescription, FormItem, FormLabel } from '@/components/ui/form';
import { Info } from 'lucide-react';

export type DeliveryPeriod = 'short_term' | 'mid_term' | 'long_term';

export const DELIVERY_PERIOD_OPTIONS: {
  value: DeliveryPeriod;
  label: string;
  description: string;
  months: string;
}[] = [
  {
    value: 'short_term',
    label: 'Short-term',
    description: 'Ready within the next 3 months',
    months: '0–3 months',
  },
  {
    value: 'mid_term',
    label: 'Mid-term',
    description: 'Ready within 3-6 months',
    months: '3–6 months',
  },
  {
    value: 'long_term',
    label: 'Long-term',
    description: 'Ready within 6-12 months',
    months: '6–12 months',
  },
];

export function getDeliveryPeriodLabel(period: DeliveryPeriod | null | undefined): string {
  if (!period) return 'Not specified';
  const option = DELIVERY_PERIOD_OPTIONS.find(o => o.value === period);
  return option ? `${option.label} (${option.months})` : period;
}

export function getDeliveryPeriodMonths(period: DeliveryPeriod | null | undefined): string {
  if (!period) return '';
  const option = DELIVERY_PERIOD_OPTIONS.find(o => o.value === period);
  return option?.months || '';
}

interface DeliveryPeriodSelectProps {
  value: DeliveryPeriod | '';
  onChange: (value: DeliveryPeriod) => void;
  label?: string;
  description?: string;
  showTooltip?: boolean;
  disabled?: boolean;
}

export function DeliveryPeriodSelect({
  value,
  onChange,
  label = 'Planning Horizon (Indicative)',
  description,
  showTooltip = true,
  disabled = false,
}: DeliveryPeriodSelectProps) {
  return (
    <FormItem>
      <FormLabel className="flex items-center gap-1.5">
        {label}
        {showTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[280px]">
                <p className="text-xs">
                  This is an indicative readiness horizon, not a fixed delivery date. 
                  Final delivery dates are confirmed during contract execution.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </FormLabel>
      <Select 
        value={value || undefined} 
        onValueChange={(v) => onChange(v as DeliveryPeriod)}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select planning horizon" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {DELIVERY_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground text-xs">
                  ({option.months})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <FormDescription className="text-xs">{description}</FormDescription>
      )}
    </FormItem>
  );
}

// Badge variant for displaying delivery period
import { Badge } from '@/components/ui/badge';

interface DeliveryPeriodBadgeProps {
  period: DeliveryPeriod | null | undefined;
  showMonths?: boolean;
}

export function DeliveryPeriodBadge({ period, showMonths = true }: DeliveryPeriodBadgeProps) {
  if (!period) return null;
  
  const option = DELIVERY_PERIOD_OPTIONS.find(o => o.value === period);
  if (!option) return null;
  
  const variantMap: Record<DeliveryPeriod, 'default' | 'secondary' | 'outline'> = {
    short_term: 'default',
    mid_term: 'secondary',
    long_term: 'outline',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variantMap[period]} className="text-xs">
            {option.label}
            {showMonths && (
              <span className="ml-1 opacity-70">({option.months})</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{option.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Indicative planning horizon, not a fixed date.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
