import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface MatchingWindowBannerProps {
  windowDate: string;
  daysRemaining: number;
  currentPoolPeriod: string;
}

export function MatchingWindowBanner({
  windowDate,
  daysRemaining,
  currentPoolPeriod,
}: MatchingWindowBannerProps) {
  const { t } = useTranslation();
  
  const urgencyColor = daysRemaining <= 2 
    ? 'border-red-500/40 bg-red-500/5' 
    : daysRemaining <= 5 
    ? 'border-amber-500/40 bg-amber-500/5' 
    : 'border-primary/30 bg-primary/5';
    
  const badgeColor = daysRemaining <= 2
    ? 'bg-red-500/10 text-red-600 border-red-500/30'
    : daysRemaining <= 5
    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
    : 'bg-primary/10 text-primary border-primary/30';

  return (
    <Card className={`${urgencyColor}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              daysRemaining <= 2 ? 'bg-red-500/10' : daysRemaining <= 5 ? 'bg-amber-500/10' : 'bg-primary/10'
            }`}>
              <Calendar className={`w-6 h-6 ${
                daysRemaining <= 2 ? 'text-red-600' : daysRemaining <= 5 ? 'text-amber-600' : 'text-primary'
              }`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('admin.nextMatchingWindow')}</p>
              <p className={`text-xl font-bold ${
                daysRemaining <= 2 ? 'text-red-600' : daysRemaining <= 5 ? 'text-amber-600' : 'text-foreground'
              }`}>
                {windowDate}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('admin.currentPeriod')}:</span>
              <span className="text-sm font-medium text-foreground">{currentPoolPeriod}</span>
            </div>
            
            <Badge variant="outline" className={badgeColor}>
              {t('admin.daysRemaining', { count: daysRemaining })}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
