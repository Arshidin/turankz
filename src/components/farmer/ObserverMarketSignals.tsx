/**
 * OBSERVER MARKET SIGNALS
 * 
 * Aggregated, anonymized market demand view for Farmer Observers.
 * Shows indicative signals WITHOUT:
 * - MPK identities
 * - Individual Pool Requests
 * - Exact volumes per buyer
 * - Matching status
 * 
 * Purpose: Educational market awareness, NOT actionable data.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAggregatedDemand } from '@/hooks/useAggregatedDemand';
import { 
  TrendingUp, 
  MapPin, 
  Scale, 
  Calendar, 
  Info,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { ObserverModeBanner } from '@/components/access';

interface AggregatedByPeriod {
  period: string;
  totalVolume: number;
  regionCount: number;
}

interface AggregatedByRegion {
  region: string;
  totalVolume: number;
}

interface AggregatedByCategory {
  category: string;
  totalVolume: number;
}

export function ObserverMarketSignals() {
  const { data: demands, isLoading, error } = useAggregatedDemand();

  // Aggregate data by period (target_week)
  const aggregateByPeriod = (): AggregatedByPeriod[] => {
    if (!demands) return [];
    const grouped = demands.reduce((acc, d) => {
      const period = d.target_week;
      if (!acc[period]) {
        acc[period] = { period, totalVolume: 0, regions: new Set<string>() };
      }
      acc[period].totalVolume += d.total_volume;
      d.regions.forEach(r => acc[period].regions.add(r));
      return acc;
    }, {} as Record<string, { period: string; totalVolume: number; regions: Set<string> }>);
    
    return Object.values(grouped).map(g => ({
      period: g.period,
      totalVolume: g.totalVolume,
      regionCount: g.regions.size
    })).sort((a, b) => a.period.localeCompare(b.period));
  };

  // Aggregate data by region
  const aggregateByRegion = (): AggregatedByRegion[] => {
    if (!demands) return [];
    const grouped = demands.reduce((acc, d) => {
      d.regions.forEach(region => {
        if (!acc[region]) {
          acc[region] = { region, totalVolume: 0 };
        }
        // Distribute volume equally across regions for this demand
        acc[region].totalVolume += Math.round(d.total_volume / d.regions.length);
      });
      return acc;
    }, {} as Record<string, AggregatedByRegion>);
    
    return Object.values(grouped).sort((a, b) => b.totalVolume - a.totalVolume);
  };

  // Aggregate data by weight category
  const aggregateByCategory = (): AggregatedByCategory[] => {
    if (!demands) return [];
    const categories: Record<string, number> = {
      'Лёгкая (до 350 кг)': 0,
      'Средняя (350-450 кг)': 0,
      'Тяжёлая (450+ кг)': 0,
    };
    
    demands.forEach(d => {
      const avgWeight = ((d.weight_min || 300) + (d.weight_max || 500)) / 2;
      if (avgWeight < 350) {
        categories['Лёгкая (до 350 кг)'] += d.total_volume;
      } else if (avgWeight <= 450) {
        categories['Средняя (350-450 кг)'] += d.total_volume;
      } else {
        categories['Тяжёлая (450+ кг)'] += d.total_volume;
      }
    });
    
    return Object.entries(categories)
      .filter(([_, vol]) => vol > 0)
      .map(([category, totalVolume]) => ({ category, totalVolume }));
  };

  const byPeriod = aggregateByPeriod();
  const byRegion = aggregateByRegion();
  const byCategory = aggregateByCategory();
  const totalDemand = demands?.reduce((sum, d) => sum + d.total_volume, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ObserverModeBanner variant="compact" />
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Observer Mode Banner */}
      <ObserverModeBanner variant="compact" />

      {/* Main Title Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Рыночные индикативные сигналы</CardTitle>
              <CardDescription className="text-sm mt-1">
                Агрегированный спрос. Не является предложением или обязательством.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Disclaimer Banner */}
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          Данные носят индикативный характер и не создают обязательств сторон.
        </AlertDescription>
      </Alert>

      {!demands || demands.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground mb-1">Нет активных сигналов спроса</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Рыночный спрос появится здесь во время активного окна сопоставления.
                Вернитесь позже, чтобы увидеть агрегированные данные.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-3xl font-bold text-primary">
                    {totalDemand.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Общий агрегированный спрос (голов)
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-3xl font-bold text-foreground">
                    {byRegion.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Регионов с активным спросом
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-3xl font-bold text-foreground">
                    {byPeriod.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Целевых периодов поставки
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* By Period */}
          {byPeriod.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">По периодам поставки</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {byPeriod.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.period}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.regionCount} регион(ов)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-primary">
                          ~{Math.round(item.totalVolume / 10) * 10}+
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">голов</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Region */}
          {byRegion.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">По регионам</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {byRegion.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <span className="font-medium">{item.region}</span>
                      <div className="text-right">
                        <span className="font-semibold text-primary">
                          ~{Math.round(item.totalVolume / 10) * 10}+
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">голов</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Weight Category */}
          {byCategory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">По весовым категориям</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {byCategory.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <span className="font-medium">{item.category}</span>
                      <div className="text-right">
                        <span className="font-semibold text-primary">
                          ~{Math.round(item.totalVolume / 10) * 10}+
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">голов</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Notice */}
          <Card className="bg-muted/20 border-border/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Что показывают эти данные:</strong> Обобщённый спрос рынка без указания 
                    конкретных покупателей или их заявок.
                  </p>
                  <p>
                    <strong>Что скрыто:</strong> Идентификаторы МПК, индивидуальные объёмы, 
                    статусы сопоставления, контактные данные.
                  </p>
                  <p>
                    <strong>Цель:</strong> Ознакомление с рыночными тенденциями для принятия 
                    информированных решений после активации профиля.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
