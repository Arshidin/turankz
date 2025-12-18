import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  usePoolRequestActivityHistory, 
  type PoolRequestActivityLog 
} from '@/hooks/usePoolRequestAudit';
import { 
  History, 
  ShieldAlert, 
  ArrowRight, 
  Edit, 
  Plus, 
  XCircle,
  Clock
} from 'lucide-react';

interface PoolRequestAuditHistoryProps {
  requestId: string;
  compact?: boolean;
}

const getActionIcon = (actionType: string, isAdminOverride: boolean) => {
  if (isAdminOverride) return <ShieldAlert className="h-4 w-4 text-amber-500" />;
  
  switch (actionType) {
    case 'status_change':
      return <ArrowRight className="h-4 w-4 text-blue-500" />;
    case 'field_update':
      return <Edit className="h-4 w-4 text-primary" />;
    case 'created':
      return <Plus className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case 'status_change':
      return 'Status Changed';
    case 'field_update':
      return 'Fields Updated';
    case 'admin_override':
      return 'Admin Override';
    case 'created':
      return 'Created';
    case 'cancelled':
      return 'Cancelled';
    default:
      return actionType;
  }
};

function AuditEntry({ entry }: { entry: PoolRequestActivityLog }) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-b-0">
      <div className="mt-0.5">
        {getActionIcon(entry.action_type, entry.is_admin_override)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {getActionLabel(entry.action_type)}
          </span>
          {entry.is_admin_override && (
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
              Admin Override
            </Badge>
          )}
        </div>
        
        {/* Status change display */}
        {entry.action_type === 'status_change' && entry.previous_value && entry.new_value && (
          <div className="flex items-center gap-2 mt-1 text-sm">
            <Badge variant="secondary" className="text-xs">
              {entry.previous_value}
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge variant="default" className="text-xs">
              {entry.new_value}
            </Badge>
          </div>
        )}
        
        {/* Override reason */}
        {entry.override_reason && (
          <p className="text-sm text-muted-foreground mt-1 italic">
            "{entry.override_reason}"
          </p>
        )}
        
        {/* Note */}
        {entry.note && !entry.override_reason && (
          <p className="text-sm text-muted-foreground mt-1">
            {entry.note}
          </p>
        )}
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{entry.performed_by}</span>
          <span>•</span>
          <span>{format(parseISO(entry.created_at), 'MMM d, yyyy HH:mm')}</span>
        </div>
      </div>
    </div>
  );
}

export function PoolRequestAuditHistory({ requestId, compact = false }: PoolRequestAuditHistoryProps) {
  const { data: history, isLoading } = usePoolRequestActivityHistory(requestId);

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

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayHistory = compact ? history.slice(0, 5) : history;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Audit History
          <Badge variant="secondary" className="ml-auto text-xs">
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className={compact ? 'max-h-[300px]' : 'max-h-[500px]'}>
          <div className="divide-y">
            {displayHistory.map(entry => (
              <AuditEntry key={entry.id} entry={entry} />
            ))}
          </div>
          {compact && history.length > 5 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              +{history.length - 5} more entries
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
