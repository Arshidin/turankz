import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, Boxes, FileText } from 'lucide-react';

interface SystemHealthProps {
  activeFarmers: number;
  activeMpks: number;
  totalDeclaredVolume: number;
  activePoolRequests: number;
}

export function SystemHealthSummary({
  activeFarmers,
  activeMpks,
  totalDeclaredVolume,
  activePoolRequests,
}: SystemHealthProps) {
  const metrics = [
    {
      label: 'Active Farmers',
      value: activeFarmers,
      icon: Users,
      description: 'Verified suppliers',
    },
    {
      label: 'Active MPKs',
      value: activeMpks,
      icon: Building2,
      description: 'Processing plants',
    },
    {
      label: 'Declared Volume',
      value: totalDeclaredVolume.toLocaleString(),
      icon: Boxes,
      description: 'Heads (next 3 months)',
    },
    {
      label: 'Active Requests',
      value: activePoolRequests,
      icon: FileText,
      description: 'Pool requests open',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{metric.description}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
