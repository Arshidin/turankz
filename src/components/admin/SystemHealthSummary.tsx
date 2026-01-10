import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  const metrics = [
    {
      label: t('admin.activeFarmers'),
      value: activeFarmers,
      icon: Users,
      description: t('admin.verifiedSuppliers'),
    },
    {
      label: t('admin.activeMpks'),
      value: activeMpks,
      icon: Building2,
      description: t('admin.processingPlants'),
    },
    {
      label: t('admin.declaredVolume'),
      value: totalDeclaredVolume.toLocaleString(),
      icon: Boxes,
      description: t('admin.headsNext3Months'),
    },
    {
      label: t('admin.activeRequests'),
      value: activePoolRequests,
      icon: FileText,
      description: t('admin.poolRequestsOpen'),
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
              <div className="w-10 h-10 bg-[var(--bg-surface-hover)] rounded-lg flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-[var(--icon-color-default)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
