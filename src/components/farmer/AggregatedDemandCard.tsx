import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAggregatedDemand, getRemainingDemand, getDemandFulfillment } from '@/hooks/useAggregatedDemand';
import { TrendingUp, MapPin, Scale, Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';

const MAX_VISIBLE_ITEMS = 3;

export function AggregatedDemandCard() {
  const { data: demands, isLoading } = useAggregatedDemand();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!demands || demands.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">No active demand signals</p>
              <p className="text-xs">Check back during an active Matching Window</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalRemainingDemand = demands.reduce((sum, d) => sum + getRemainingDemand(d), 0);
  const uniqueRegions = [...new Set(demands.flatMap(d => d.regions))];
  const uniqueWeeks = [...new Set(demands.map(d => d.target_week))];
  
  const visibleDemands = showAll ? demands : demands.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = demands.length > MAX_VISIBLE_ITEMS;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-primary/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    Market Demand Signals
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalRemainingDemand.toLocaleString()} heads needed • {uniqueWeeks.length} week{uniqueWeeks.length !== 1 ? 's' : ''} • {uniqueRegions.length} region{uniqueRegions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {demands.length} signal{demands.length !== 1 ? 's' : ''}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            <p className="text-xs text-muted-foreground mb-3 px-1">
              Aggregated buyer demand — identities are protected
            </p>
            
            <div className="grid gap-2">
              {visibleDemands.map((demand, idx) => {
                const remaining = getRemainingDemand(demand);
                const fulfillment = getDemandFulfillment(demand);
                
                return (
                  <div 
                    key={`${demand.target_week}-${demand.required_grade}-${idx}`}
                    className="p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Key info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{demand.target_week}</span>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          Grade {demand.required_grade}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{demand.regions.join(', ')}</span>
                        </div>
                      </div>
                      
                      {/* Right: Volume & progress */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <Progress value={fulfillment} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground text-right mt-0.5">{fulfillment}% filled</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-semibold text-primary">
                            {remaining.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">heads needed</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Criteria row */}
                    <div className="flex items-center gap-2 mt-2">
                      {(demand.weight_min || demand.weight_max) && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          <Scale className="h-2.5 w-2.5 mr-1" />
                          {demand.weight_min ?? '—'}–{demand.weight_max ?? '—'} kg
                        </Badge>
                      )}
                      {(demand.age_min || demand.age_max) && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {demand.age_min ?? '—'}–{demand.age_max ?? '—'} mo
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] h-5">
                        <Users className="h-2.5 w-2.5 mr-1" />
                        {demand.request_count} buyer{demand.request_count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAll(!showAll);
                }}
              >
                {showAll ? (
                  <>Show less</>
                ) : (
                  <>Show {demands.length - MAX_VISIBLE_ITEMS} more signals</>
                )}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
