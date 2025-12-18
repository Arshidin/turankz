import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useMatchingRequests, type MatchingPoolRequest, type MatchingRequestFilters } from '@/hooks/useMatchingRequests';
import { Target, MapPin, Scale, Building2 } from 'lucide-react';

interface MatchingRequestsListProps {
  filters: MatchingRequestFilters;
  selectedRequestId: string | null;
  onSelectRequest: (request: MatchingPoolRequest) => void;
}

export function MatchingRequestsList({
  filters,
  selectedRequestId,
  onSelectRequest,
}: MatchingRequestsListProps) {
  const { data: requests, isLoading } = useMatchingRequests(filters);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Matching Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRemaining = requests?.reduce((sum, r) => sum + r.remaining_volume, 0) || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Pool Requests (Matching)
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {requests?.length || 0} requests · {totalRemaining} remaining
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Select a request to create matching
        </p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <ScrollArea className="h-[400px] pr-2">
          {!requests || requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No requests in matching status
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Move requests to matching status first
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => {
                const fillPercentage = Math.min(
                  100,
                  (request.matched_volume / request.required_volume) * 100
                );

                return (
                  <div
                    key={request.id}
                    onClick={() => onSelectRequest(request)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRequestId === request.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                    } ${request.remaining_volume === 0 ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{request.request_number}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{request.mpk_name}</span>
                        </div>
                      </div>
                      {request.remaining_volume === 0 ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Fulfilled
                        </Badge>
                      ) : (
                        <Badge className="bg-violet-500/10 text-violet-600 border-0 text-xs">
                          {request.remaining_volume} remaining
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.regions.join(', ')}
                      </span>
                      <span>Grade {request.required_grade}</span>
                      <span>{request.target_week}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {request.matched_volume} / {request.required_volume} matched
                        </span>
                        <span className="font-medium">{Math.round(fillPercentage)}%</span>
                      </div>
                      <Progress value={fillPercentage} className="h-1.5" />
                    </div>

                    {(request.weight_range_min || request.weight_range_max || request.age_range_min || request.age_range_max) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(request.weight_range_min || request.weight_range_max) && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            <Scale className="h-2.5 w-2.5 mr-1" />
                            {request.weight_range_min || '–'}–{request.weight_range_max || '–'} kg
                          </Badge>
                        )}
                        {(request.age_range_min || request.age_range_max) && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            {request.age_range_min || '–'}–{request.age_range_max || '–'} mo
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
