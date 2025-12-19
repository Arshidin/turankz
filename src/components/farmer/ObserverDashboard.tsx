/**
 * OBSERVER DASHBOARD
 * 
 * Simplified dashboard for Farmer users with Observer status.
 * Three focused blocks: Market Signals, Price Orientation, Participation Rules.
 * No KPIs, counters, or action widgets.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ObserverModeBanner } from '@/components/access';
import { 
  TrendingUp,
  Grid3X3,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

interface ObserverDashboardProps {
  farmerName?: string;
}

export function ObserverDashboard({ farmerName }: ObserverDashboardProps) {
  const blocks = [
    {
      icon: TrendingUp,
      title: 'Рыночные сигналы',
      description: 'Посмотрите, как формируется спрос на рынке',
      path: '/market-signals',
      color: 'blue',
    },
    {
      icon: Grid3X3,
      title: 'Ценовые ориентиры',
      description: 'Ознакомьтесь с ценовыми ориентирами',
      path: '/price-grid',
      color: 'emerald',
    },
    {
      icon: GraduationCap,
      title: 'Правила участия',
      description: 'Узнайте, как перейти к участию',
      path: '/market-workflow',
      color: 'violet',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Observer Mode Banner */}
      <ObserverModeBanner />

      {/* Three focused blocks */}
      <div className="grid gap-4 md:grid-cols-3">
        {blocks.map((block) => {
          const colors = getColorClasses(block.color);
          return (
            <Link key={block.path} to={block.path}>
              <Card className={`h-full border ${colors.border} hover:shadow-md transition-all group cursor-pointer`}>
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                      <block.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {block.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex-1">
                      {block.description}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Перейти</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
