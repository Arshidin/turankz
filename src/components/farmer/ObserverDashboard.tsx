/**
 * OBSERVER DASHBOARD
 * 
 * Enhanced dashboard for Farmer users with Observer status.
 * Provides context, explanations, and guidance for new users.
 * Three focused blocks: Market Signals, Price Orientation, Participation Rules.
 * No KPIs, counters, or action widgets.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ObserverModeBanner } from '@/components/access';
import { 
  TrendingUp,
  Grid3X3,
  GraduationCap,
  ChevronRight,
  Info,
  Eye,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface ObserverDashboardProps {
  farmerName?: string;
}

export function ObserverDashboard({ farmerName }: ObserverDashboardProps) {
  const { t } = useTranslation();
  
  const blocks = [
    {
      icon: TrendingUp,
      title: t('observerDashboard.blocks.marketSignals.title'),
      description: t('observerDashboard.blocks.marketSignals.description'),
      detailedDescription: t('observerDashboard.blocks.marketSignals.detailed'),
      path: '/overview',
      color: 'blue',
      benefits: [
        t('observerDashboard.blocks.marketSignals.benefit1'),
        t('observerDashboard.blocks.marketSignals.benefit2'),
        t('observerDashboard.blocks.marketSignals.benefit3'),
      ],
    },
    {
      icon: Grid3X3,
      title: t('observerDashboard.blocks.priceGrid.title'),
      description: t('observerDashboard.blocks.priceGrid.description'),
      detailedDescription: t('observerDashboard.blocks.priceGrid.detailed'),
      path: '/price-grid',
      color: 'emerald',
      benefits: [
        t('observerDashboard.blocks.priceGrid.benefit1'),
        t('observerDashboard.blocks.priceGrid.benefit2'),
        t('observerDashboard.blocks.priceGrid.benefit3'),
      ],
    },
    {
      icon: GraduationCap,
      title: t('observerDashboard.blocks.workflow.title'),
      description: t('observerDashboard.blocks.workflow.description'),
      detailedDescription: t('observerDashboard.blocks.workflow.detailed'),
      path: '/market-workflow',
      color: 'violet',
      benefits: [
        t('observerDashboard.blocks.workflow.benefit1'),
        t('observerDashboard.blocks.workflow.benefit2'),
        t('observerDashboard.blocks.workflow.benefit3'),
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-600', 
        border: 'border-blue-500/20',
        hover: 'hover:border-blue-500/40',
      },
      emerald: { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-600', 
        border: 'border-emerald-500/20',
        hover: 'hover:border-emerald-500/40',
      },
      violet: { 
        bg: 'bg-violet-500/10', 
        text: 'text-violet-600', 
        border: 'border-violet-500/20',
        hover: 'hover:border-violet-500/40',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Observer Mode Banner */}
      <ObserverModeBanner />

      {/* Welcome Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[var(--icon-color-default)]" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t('observerDashboard.welcome.title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('observerDashboard.welcome.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">{t('observerDashboard.welcome.canDo')}</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>{t('observerDashboard.welcome.canDo1')}</li>
                  <li>{t('observerDashboard.welcome.canDo2')}</li>
                  <li>{t('observerDashboard.welcome.canDo3')}</li>
                  <li>{t('observerDashboard.welcome.canDo4')}</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">{t('observerDashboard.welcome.afterActivation')}</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>{t('observerDashboard.welcome.after1')}</li>
                  <li>{t('observerDashboard.welcome.after2')}</li>
                  <li>{t('observerDashboard.welcome.after3')}</li>
                  <li>{t('observerDashboard.welcome.after4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three focused blocks with enhanced descriptions */}
      <div className="grid gap-4 md:grid-cols-3">
        {blocks.map((block) => {
          const colors = getColorClasses(block.color);
          return (
            <Card 
              key={block.path} 
              className={`h-full border ${colors.border} ${colors.hover} transition-all group`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <block.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1">{block.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {block.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {block.detailedDescription}
                </p>
                
                {block.benefits && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Что вы узнаете:</p>
                    <ul className="space-y-1.5">
                      {block.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link to={block.path}>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50 group-hover:border-primary/30 transition-colors">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        {t('observerDashboard.goToSection')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activation Process Info */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-sm text-foreground">
              {t('observerDashboard.activation.title')}
            </p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                {t('observerDashboard.activation.description1')}
              </p>
              <p>
                {t('observerDashboard.activation.description2')}
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Quick Tips */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base">{t('observerDashboard.tips.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-amber-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('observerDashboard.tips.tip1.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('observerDashboard.tips.tip1.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-amber-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('observerDashboard.tips.tip2.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('observerDashboard.tips.tip2.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-amber-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('observerDashboard.tips.tip3.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('observerDashboard.tips.tip3.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-amber-600">4</span>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{t('observerDashboard.tips.tip4.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('observerDashboard.tips.tip4.description')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
