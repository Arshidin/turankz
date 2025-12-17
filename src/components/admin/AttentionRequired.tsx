import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, MapPin, RefreshCw, ArrowRight } from 'lucide-react';

interface AttentionItem {
  id: string;
  type: 'request_at_risk' | 'region_deficit' | 'farmer_declining' | 'mpk_stalled';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  linkTo: string;
  linkLabel: string;
}

interface AttentionRequiredProps {
  items: AttentionItem[];
}

const iconMap = {
  request_at_risk: AlertTriangle,
  region_deficit: MapPin,
  farmer_declining: TrendingDown,
  mpk_stalled: RefreshCw,
};

const severityStyles = {
  high: 'border-red-500/40 bg-red-500/5',
  medium: 'border-amber-500/40 bg-amber-500/5',
  low: 'border-slate-500/40 bg-slate-500/5',
};

const severityBadge = {
  high: 'bg-red-500/10 text-red-600 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  low: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
};

export function AttentionRequired({ items }: AttentionRequiredProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Attention Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-status-confirmed/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-status-confirmed" />
            </div>
            <p className="text-sm text-muted-foreground">No items require immediate attention</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Attention Required</CardTitle>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          {items.length} items
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = iconMap[item.type];
            
            return (
              <div
                key={item.id}
                className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${severityStyles[item.severity]}`}
              >
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.severity === 'high' ? 'bg-red-500/10' : 
                    item.severity === 'medium' ? 'bg-amber-500/10' : 'bg-slate-500/10'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      item.severity === 'high' ? 'text-red-600' : 
                      item.severity === 'medium' ? 'text-amber-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      <Badge variant="outline" className={severityBadge[item.severity]}>
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => navigate(item.linkTo)}
                >
                  {item.linkLabel}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
