import { ShieldCheck, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminOverrideBadgeProps {
  reason?: string | null;
  unlockedBy?: string | null;
  unlockedAt?: string | null;
  compact?: boolean;
}

export function AdminOverrideBadge({
  reason,
  unlockedBy,
  unlockedAt,
  compact = false,
}: AdminOverrideBadgeProps) {
  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              <ShieldCheck className="h-3 w-3" />
              Override
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <div className="space-y-1">
              <p className="font-medium">Admin Override Active</p>
              {unlockedBy && <p className="text-xs">By: {unlockedBy}</p>}
              {formattedDate && <p className="text-xs">At: {formattedDate}</p>}
              {reason && (
                <p className="text-xs text-muted-foreground">
                  Reason: {reason}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2">
      <ShieldCheck className="h-4 w-4 text-amber-500" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Admin Override Active
          </span>
          <Unlock className="h-3 w-3 text-amber-500" />
        </div>
        {reason && (
          <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
        )}
        {unlockedBy && formattedDate && (
          <p className="text-xs text-muted-foreground">
            By {unlockedBy} on {formattedDate}
          </p>
        )}
      </div>
    </div>
  );
}
