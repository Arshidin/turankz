import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldAlert } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PoolRequestAdminOverrideBadgeProps {
  isModified: boolean;
  modifiedBy?: string | null;
  modifiedAt?: string | null;
  reason?: string | null;
  size?: 'sm' | 'default';
}

export function PoolRequestAdminOverrideBadge({
  isModified,
  modifiedBy,
  modifiedAt,
  reason,
  size = 'default',
}: PoolRequestAdminOverrideBadgeProps) {
  if (!isModified) return null;

  const badgeClass = size === 'sm' 
    ? 'text-xs px-1.5 py-0.5' 
    : 'text-xs';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`border-amber-500/50 text-amber-600 bg-amber-500/10 ${badgeClass}`}
          >
            <ShieldAlert className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1'} />
            Admin Modified
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px]">
          <div className="space-y-1">
            <p className="font-medium">Admin Override Applied</p>
            {modifiedBy && (
              <p className="text-xs text-muted-foreground">
                Modified by: {modifiedBy}
              </p>
            )}
            {modifiedAt && (
              <p className="text-xs text-muted-foreground">
                On: {format(parseISO(modifiedAt), 'MMM d, yyyy HH:mm')}
              </p>
            )}
            {reason && (
              <p className="text-xs mt-1 italic">
                "{reason}"
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
