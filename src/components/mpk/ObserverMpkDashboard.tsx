/**
 * OBSERVER MPK DASHBOARD
 * 
 * Simplified dashboard for MPK users with Observer status (pending activation).
 * Three focused blocks: Market Overview, Price Grid, Activation Status.
 * No KPIs, counters, or action widgets.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ObserverModeBanner } from '@/components/access';
import { 
  BarChart3,
  Grid3X3,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ObserverMpkDashboardProps {
  mpkName?: string;
}

export function ObserverMpkDashboard({ mpkName }: ObserverMpkDashboardProps) {
  const blocks = [
    {
      title: 'Обзор рынка',
      description: 'Просматривайте доступные партии скота и рыночные данные. Ознакомьтесь с текущим предложением на рынке.',
      icon: BarChart3,
      link: '/mpk/market',
      linkLabel: 'Перейти к обзору рынка',
    },
    {
      title: 'Справочная ценовая сетка',
      description: 'Ознакомьтесь с текущими справочными ценами по регионам и категориям скота. Используйте для планирования закупок.',
      icon: Grid3X3,
      link: '/price-grid',
      linkLabel: 'Открыть ценовую сетку',
    },
    {
      title: 'Статус активации',
      description: 'Ваш аккаунт ожидает активации администратором. После активации вы сможете создавать заявки на закупку и участвовать в сопоставлении.',
      icon: Clock,
      link: null,
      linkLabel: null,
      isStatus: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Observer Mode Banner */}
      <ObserverModeBanner />

      {/* Information Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((block, index) => {
          const Icon = block.icon;
          const isStatusBlock = block.isStatus;

          return (
            <Card key={index} className={isStatusBlock ? 'border-amber-500/30 bg-amber-500/5' : ''}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isStatusBlock 
                      ? 'bg-amber-500/10 text-amber-600' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {block.description}
                </p>
                
                {isStatusBlock ? (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Ожидайте уведомления от администратора о завершении активации вашего аккаунта.
                    </p>
                  </div>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={block.link!}>
                      {block.linkLabel}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Что вы можете делать сейчас:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Просматривать доступные партии скота на рынке</li>
            <li>Изучать справочные цены по регионам и категориям</li>
            <li>Ознакомиться с текущим состоянием рынка</li>
          </ul>
          
          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">
            После активации аккаунта:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Создавать заявки на закупку скота</li>
            <li>Добавлять партии в отслеживание (watchlist)</li>
            <li>Участвовать в сопоставлении спроса и предложения</li>
            <li>Управлять исполнением контрактов</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

