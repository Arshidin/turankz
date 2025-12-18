import { useMatchingActivityHistory } from '@/hooks/useMatchings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import {
  History,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  User,
  Clock,
} from 'lucide-react';

interface MatchingAuditHistoryProps {
  matchId: string | null;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return <Plus className="h-3.5 w-3.5 text-blue-500" />;
    case 'finalized':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case 'cancelled':
      return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    case 'volume_reallocated':
      return <ArrowLeftRight className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <History className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return 'Matching Created';
    case 'finalized':
      return 'Matching Finalized';
    case 'cancelled':
      return 'Matching Cancelled';
    case 'volume_reallocated':
      return 'Volume Reallocated';
    default:
      return actionType.replace(/_/g, ' ');
  }
};

const getActionBadgeVariant = (actionType: string) => {
  switch (actionType) {
    case 'created':
      return 'bg-blue-500/10 text-blue-600 border-0';
    case 'finalized':
      return 'bg-emerald-500/10 text-emerald-600 border-0';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-0';
    case 'volume_reallocated':
      return 'bg-amber-500/10 text-amber-600 border-0';
    default:
      return '';
  }
};

export function MatchingAuditHistory({ matchId }: MatchingAuditHistoryProps) {
  const { data: history, isLoading } = useMatchingActivityHistory(matchId);

  if (!matchId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a matching to view audit history
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Audit History
          <Badge variant="secondary" className="ml-2 text-xs">
            {history?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!history || history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                    {getActionIcon(entry.action_type)}
                  </div>

                  <div className="space-y-1">
                    {/* Action badge and time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getActionBadgeVariant(entry.action_type)}>
                        {getActionLabel(entry.action_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(entry.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    {/* Actor */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{entry.performed_by}</span>
                    </div>

                    {/* Value changes */}
                    {(entry.previous_value || entry.new_value) && (
                      <div className="text-sm mt-1 p-2 bg-muted/50 rounded">
                        {entry.previous_value && entry.new_value ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground line-through">
                              {entry.previous_value}
                            </span>
                            <span>→</span>
                            <span className="font-medium">{entry.new_value}</span>
                          </div>
                        ) : (
                          <span>{entry.new_value || entry.previous_value}</span>
                        )}
                      </div>
                    )}

                    {/* Note/Reason */}
                    {entry.note && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
