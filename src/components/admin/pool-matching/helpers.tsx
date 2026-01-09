import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PoolRequestStatus } from '@/hooks/usePoolRequests';
import { MatchLevel } from '@/lib/livestock-criteria';

export type PoolHealth = 'on-track' | 'at-risk' | 'not-viable';

export const getStatusBadge = (status: PoolRequestStatus) => {
  switch (status) {
    case 'fulfilled':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Fulfilled</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Partial</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500/10 text-blue-600 border-0">Submitted</Badge>;
    case 'matching':
      return <Badge className="bg-violet-500/10 text-violet-600 border-0">Matching</Badge>;
    case 'draft':
      return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
    case 'closed':
      return <Badge className="bg-slate-500/10 text-slate-600 border-0">Closed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
  }
};

export const getReadinessBadge = (readiness: string) => {
  switch (readiness) {
    case 'confirmed':
      return <Badge variant="outline" className="text-status-confirmed border-status-confirmed text-xs">Confirmed</Badge>;
    case 'soft_committed':
      return <Badge variant="outline" className="text-status-soft border-status-soft text-xs">Soft</Badge>;
    case 'forecast':
      return <Badge variant="outline" className="text-status-forecast border-status-forecast text-xs">Forecast</Badge>;
  }
};

export const getMatchBadge = (matchLevel: MatchLevel) => {
  switch (matchLevel) {
    case 'full':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0 text-xs">Full Match</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0 text-xs">Partial Match</Badge>;
    case 'none':
      return <Badge variant="outline" className="text-muted-foreground text-xs">No Match</Badge>;
  }
};

export const getPoolHealthIndicator = (health: PoolHealth) => {
  switch (health) {
    case 'on-track':
      return (
        <div className="flex items-center gap-2 text-status-confirmed">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">On Track</span>
        </div>
      );
    case 'at-risk':
      return (
        <div className="flex items-center gap-2 text-status-soft">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">At Risk</span>
        </div>
      );
    case 'not-viable':
      return (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Not Viable</span>
        </div>
      );
  }
};
