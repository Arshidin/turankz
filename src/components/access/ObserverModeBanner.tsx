/**
 * OBSERVER MODE BANNER
 * 
 * Persistent banner for Observer users showing:
 * - Clear role label
 * - Read-only status
 * - No market participation
 * 
 * Used across all pages accessible to Observer users.
 */

import { Eye, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ObserverModeBannerProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ObserverModeBanner({ variant = 'default', className = '' }: ObserverModeBannerProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm ${className}`}>
        <Eye className="w-4 h-4 text-amber-600" />
        <span className="text-amber-700 dark:text-amber-400 font-medium">Observer</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Только просмотр</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Без участия в рынке</span>
      </div>
    );
  }

  return (
    <Alert className={`border-amber-500/30 bg-amber-500/5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-amber-600" />
        </div>
        <AlertDescription className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Режим наблюдателя
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Только просмотр
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              Участие в рынке недоступно
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Вы можете изучать платформу, но не можете совершать действия до активации профиля.
          </p>
        </AlertDescription>
      </div>
    </Alert>
  );
}
