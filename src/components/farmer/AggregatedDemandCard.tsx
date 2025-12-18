import { useState } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAggregatedDemand, getRemainingDemand, getDemandFulfillment } from '@/hooks/useAggregatedDemand';
import { TrendingUp, MapPin, Scale, Calendar, Users, Info } from 'lucide-react';

export function AggregatedDemandCard() {
  const { data: demands, isLoading } = useAggregatedDemand();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
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
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="font-medium text-foreground mb-1">No active demand signals</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Market demand will appear here during an active Matching Window. 
              Check back later to see what buyers are looking for.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalRemainingDemand = demands.reduce((sum, d) => sum + getRemainingDemand(d), 0);
  const uniqueRegions = [...new Set(demands.flatMap(d => d.regions))];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            Aggregated buyer demand — identities are protected
          </CardDescription>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary">{totalRemainingDemand.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">total heads needed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3">
          {demands.map((demand, idx) => {
            const remaining = getRemainingDemand(demand);
            const fulfillment = getDemandFulfillment(demand);
            
            return (
              <div 
                key={`${demand.target_week}-${demand.required_grade}-${idx}`}
                className="p-4 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Left: Key info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{demand.target_week}</span>
                      <Badge variant="outline" className="text-xs">
                        Grade {demand.required_grade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{demand.regions.join(', ')}</span>
                    </div>
                  </div>
                  
                  {/* Right: Volume */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-semibold text-primary">
                      {remaining.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">heads needed</p>
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
                
                {/* Criteria row */}
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
                    <Users className="h-3 w-3 mr-1" />
                    {demand.request_count} buyer{demand.request_count > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
