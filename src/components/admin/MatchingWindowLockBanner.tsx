import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useMatchingWindows } from '@/hooks/useMatchingWindows';
import { canCreateMatching, getMatchingCreationMessage } from '@/lib/matching-lifecycle';
import { Lock, Unlock, Clock, AlertTriangle } from 'lucide-react';

interface MatchingWindowLockBannerProps {
  compact?: boolean;
}

export function MatchingWindowLockBanner({ compact = false }: MatchingWindowLockBannerProps) {
  const { data: windows } = useMatchingWindows();
  
  // Find the current active or locked window
  const activeWindow = windows?.find(w => w.status === 'active' || w.status === 'locked');
  const message = getMatchingCreationMessage(activeWindow || null);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {message.canCreate ? (
          <>
            <Unlock className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Matching Enabled</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-amber-600 font-medium">Matching Locked</span>
          </>
        )}
      </div>
    );
  }

  const variant = message.variant === 'success' ? 'default' : 'destructive';
  const Icon = message.canCreate ? Unlock : message.variant === 'error' ? AlertTriangle : Lock;

  return (
    <Alert 
      variant={variant}
      className={
        message.canCreate 
          ? 'border-emerald-500/50 bg-emerald-500/10' 
          : 'border-amber-500/50 bg-amber-500/10'
      }
    >
      <Icon className={`h-4 w-4 ${message.canCreate ? 'text-emerald-600' : 'text-amber-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <span className={message.canCreate ? 'text-emerald-700' : 'text-amber-700'}>
          {message.message}
        </span>
        {activeWindow && (
          <Badge variant="outline" className="ml-4">
            {activeWindow.name} · {activeWindow.target_week}
          </Badge>
        )}
      </AlertDescription>
    </Alert>
  );
}
