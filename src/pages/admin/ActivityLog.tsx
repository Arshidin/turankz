import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Activity, Calendar, Filter, User, Package, Users, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useActivityLog,
  EVENT_TYPE_LABELS,
  ACTOR_ROLE_LABELS,
  type ActivityEventType,
  type ActorRole,
  type TargetType,
} from '@/hooks/useActivityLog';
import { cn } from '@/lib/utils';

const TARGET_TYPE_ICONS: Record<TargetType, React.ReactNode> = {
  farmer: <User className="h-4 w-4" />,
  mpk: <Users className="h-4 w-4" />,
  batch: <Package className="h-4 w-4" />,
  pool_request: <FileText className="h-4 w-4" />,
  pool_match: <Activity className="h-4 w-4" />,
};

const ACTOR_ROLE_COLORS: Record<ActorRole, string> = {
  farmer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  mpk: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  system: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
};

export default function ActivityLog() {
  const [eventTypeFilter, setEventTypeFilter] = useState<ActivityEventType | 'all'>('all');
  const [actorRoleFilter, setActorRoleFilter] = useState<ActorRole | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { entries, isLoading, error } = useActivityLog({
    eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    actorRole: actorRoleFilter === 'all' ? undefined : actorRoleFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const clearFilters = () => {
    setEventTypeFilter('all');
    setActorRoleFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = eventTypeFilter !== 'all' || actorRoleFilter !== 'all' || startDate || endDate;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Chronological record of key system events for audit and traceability"
        
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Event Type</label>
              <Select
                value={eventTypeFilter}
                onValueChange={(v) => setEventTypeFilter(v as ActivityEventType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Actor Role</label>
              <Select
                value={actorRoleFilter}
                onValueChange={(v) => setActorRoleFilter(v as ActorRole | 'all')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {Object.entries(ACTOR_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Activity}
                message={hasActiveFilters ? 'No matching events' : 'No activity recorded'}
                helperText={
                  hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'System events will appear here as actions are performed.'
                }
                actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    {entry.target_type ? TARGET_TYPE_ICONS[entry.target_type] : <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {EVENT_TYPE_LABELS[entry.event_type]}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', ACTOR_ROLE_COLORS[entry.actor_role])}
                      >
                        {entry.actor_name || ACTOR_ROLE_LABELS[entry.actor_role]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.description}
                    </p>
                    {entry.target_name && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Target: {entry.target_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {format(new Date(entry.created_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
