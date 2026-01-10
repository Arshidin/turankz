/**
 * FIRST ACTION PROMPT
 * 
 * Enhanced prompt for newly activated users to guide them through their first actions.
 * Shows reminders if user hasn't completed their first action yet.
 * Can be dismissed but will reappear if conditions are met.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { usePoolRequests } from '@/hooks/usePoolRequests';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Package, ClipboardList, Eye, ArrowRight, X, Bell, Lightbulb } from 'lucide-react';

interface FirstActionPromptProps {
  /** Force show the prompt even if conditions aren't met */
  forceShow?: boolean;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
}

export function FirstActionPrompt({ forceShow = false, onDismiss }: FirstActionPromptProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, registrationStatus, user } = useAuthContext();
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState<Date | null>(null);

  // Fetch user data based on role
  const { data: batches = [] } = useBatches();
  const { data: poolRequests = [] } = usePoolRequests();
  const { data: watchlistItems = [] } = useWatchlist();

  // Check if user has completed their first action
  const hasCompletedFirstAction = useMemo(() => {
    if (role === 'farmer') {
      // Farmer has completed if they have at least one batch (excluding draft)
      return batches.some(b => b.user_id === user?.id && b.status !== 'draft');
    }
    if (role === 'mpk') {
      // MPK has completed if they have a watchlist item or a pool request
      return watchlistItems.length > 0 || poolRequests.length > 0;
    }
    return false;
  }, [role, batches, poolRequests, watchlistItems, user?.id]);

  // Check if prompt was dismissed in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedKey = `first_action_prompt_dismissed_${role}`;
      const dismissedUntilKey = `first_action_prompt_dismissed_until_${role}`;
      
      const dismissed = localStorage.getItem(dismissedKey) === 'true';
      const dismissedUntilStr = localStorage.getItem(dismissedUntilKey);
      
      if (dismissed) {
        setIsDismissed(true);
      }
      
      if (dismissedUntilStr) {
        const until = new Date(dismissedUntilStr);
        if (until > new Date()) {
          setDismissedUntil(until);
        } else {
          // Dismissal expired, clear it
          localStorage.removeItem(dismissedUntilKey);
        }
      }
    }
  }, [role]);

  // Only show for newly activated users who haven't completed first action
  if (registrationStatus !== 'active') return null;
  if (!forceShow && (hasCompletedFirstAction || isDismissed || dismissedUntil)) return null;

  const handleDismiss = (duration?: number) => {
    setIsDismissed(true);
    
    if (typeof window !== 'undefined') {
      const dismissedKey = `first_action_prompt_dismissed_${role}`;
      const dismissedUntilKey = `first_action_prompt_dismissed_until_${role}`;
      
      if (duration) {
        // Dismiss for specific duration (e.g., 24 hours)
        const until = new Date();
        until.setHours(until.getHours() + duration);
        setDismissedUntil(until);
        localStorage.setItem(dismissedUntilKey, until.toISOString());
      } else {
        // Dismiss permanently
        localStorage.setItem(dismissedKey, 'true');
      }
    }
    
    onDismiss?.();
  };

  if (role === 'farmer') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => handleDismiss(24)} // Dismiss for 24 hours
        >
          <X className="h-3 w-3" />
        </Button>
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <Package className="h-5 w-5 text-[var(--icon-color-default)]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {t('firstActionPrompt.farmer.title')}
                {dismissedUntil && (
                  <Bell className="h-4 w-4 text-amber-600" />
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('firstActionPrompt.farmer.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">{t('firstActionPrompt.farmer.whatToDo')}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{t('firstActionPrompt.farmer.step1')}</li>
                <li>{t('firstActionPrompt.farmer.step2')}</li>
                <li>{t('firstActionPrompt.farmer.step3')}</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/farmer/batches')} 
              className="flex-1"
            >
              {t('firstActionPrompt.farmer.createButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDismiss(24)}
              className="text-xs"
            >
              {t('firstActionPrompt.farmer.remindLater')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === 'mpk') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => handleDismiss(24)} // Dismiss for 24 hours
        >
          <X className="h-3 w-3" />
        </Button>
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[var(--icon-color-default)]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {t('firstActionPrompt.mpk.title')}
                {dismissedUntil && (
                  <Bell className="h-4 w-4 text-amber-600" />
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('firstActionPrompt.mpk.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">{t('firstActionPrompt.mpk.whatToDo')}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{t('firstActionPrompt.mpk.step1')}</li>
                <li>{t('firstActionPrompt.mpk.step2')}</li>
                <li>{t('firstActionPrompt.mpk.step3')}</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/mpk/watchlist')} 
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('firstActionPrompt.mpk.createWatchlist')}
            </Button>
            <Button 
              onClick={() => navigate('/mpk/requests')} 
              className="flex-1"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {t('firstActionPrompt.mpk.createRequest')}
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDismiss(24)}
              className="text-xs"
            >
              {t('firstActionPrompt.mpk.remindLater')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
