import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAggregatedDemand, getRemainingDemand, getDemandFulfillment } from '@/hooks/useAggregatedDemand';
import { TrendingUp, MapPin, Scale, Calendar } from 'lucide-react';

export function AggregatedDemandCard() {
  const { data: demands, isLoading } = useAggregatedDemand();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Market Demand Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!demands || demands.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Market Demand Signals
          </CardTitle>
          <CardDescription>
            Aggregated buyer demand for livestock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No active demand signals at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5" />
          Market Demand Signals
        </CardTitle>
        <CardDescription>
          Aggregated buyer demand — identities are protected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demands.map((demand, idx) => {
          const remaining = getRemainingDemand(demand);
          const fulfillment = getDemandFulfillment(demand);
          
          return (
            <div 
              key={`${demand.target_week}-${demand.required_grade}-${idx}`}
              className="p-4 rounded-lg border bg-card/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{demand.target_week}</span>
                    <Badge variant="outline" className="text-xs">
                      Grade {demand.required_grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {demand.regions.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {remaining.toLocaleString()} heads
                  </p>
                  <p className="text-xs text-muted-foreground">remaining demand</p>
                </div>
              </div>
              
              {/* Fulfillment progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Market fulfillment</span>
                  <span>{fulfillment}%</span>
                </div>
                <Progress value={fulfillment} className="h-2" />
              </div>
              
              {/* Criteria hints */}
              <div className="flex flex-wrap gap-2">
                {(demand.weight_min || demand.weight_max) && (
                  <Badge variant="secondary" className="text-xs">
                    <Scale className="h-3 w-3 mr-1" />
                    {demand.weight_min ?? '—'}–{demand.weight_max ?? '—'} kg
                  </Badge>
                )}
                {(demand.age_min || demand.age_max) && (
                  <Badge variant="secondary" className="text-xs">
                    {demand.age_min ?? '—'}–{demand.age_max ?? '—'} mo
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {demand.request_count} buyer{demand.request_count > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
