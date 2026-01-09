/**
 * AdminOverrideLog Page
 *
 * Sprint 7-8: Audit log page showing all admin override actions.
 * Provides transparency and accountability for administrative actions.
 */

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAdminOverrideHistory, type AdminOverride } from '@/hooks/useAdminOverride';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ShieldAlert,
  Search,
  Filter,
  Unlock,
  Lock,
  Clock,
  Calendar,
  User,
  FileText,
  Package,
  RefreshCw,
  Info,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type OverrideType = AdminOverride['override_type'] | 'all';
type TargetType = AdminOverride['target_type'] | 'all';

const OVERRIDE_TYPE_LABELS: Record<string, { en: string; ru: string }> = {
  batch_unlock: { en: 'Batch Unlock', ru: 'Разблокировка партии' },
  window_extend: { en: 'Window Extension', ru: 'Продление окна' },
  window_adjust: { en: 'Window Adjustment', ru: 'Корректировка окна' },
};

const TARGET_TYPE_LABELS: Record<string, { en: string; ru: string }> = {
  batch: { en: 'Batch', ru: 'Партия' },
  matching_window: { en: 'Matching Window', ru: 'Окно сопоставления' },
};

const OVERRIDE_TYPE_ICONS: Record<string, React.ReactNode> = {
  batch_unlock: <Unlock className="h-4 w-4" />,
  window_extend: <Clock className="h-4 w-4" />,
  window_adjust: <Calendar className="h-4 w-4" />,
};

const OVERRIDE_TYPE_COLORS: Record<string, string> = {
  batch_unlock: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  window_extend: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  window_adjust: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
};

export default function AdminOverrideLog() {
  const [filterType, setFilterType] = useState<OverrideType>('all');
  const [filterTarget, setFilterTarget] = useState<TargetType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const lang = 'ru';

  const { data: overrides, isLoading, refetch } = useAdminOverrideHistory(
    filterTarget === 'all' ? undefined : filterTarget,
    undefined
  );

  // Apply filters
  const filteredOverrides = overrides?.filter((override) => {
    if (filterType !== 'all' && override.override_type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTarget = override.target_name?.toLowerCase().includes(query);
      const matchesReason = override.reason.toLowerCase().includes(query);
      const matchesPerformer = override.performed_by.toLowerCase().includes(query);
      if (!matchesTarget && !matchesReason && !matchesPerformer) return false;
    }
    return true;
  });

  const t = {
    title: 'Журнал административных действий',
    description: 'История всех административных переопределений и их обоснования',
    searchPlaceholder: 'Поиск по названию, причине или исполнителю...',
    filterByType: 'Тип действия',
    filterByTarget: 'Тип объекта',
    all: 'Все',
    noOverrides: 'Нет записей',
    noOverridesHelp: 'Административные действия появятся здесь после их выполнения.',
    columns: {
      date: 'Дата',
      type: 'Тип действия',
      target: 'Объект',
      change: 'Изменение',
      reason: 'Причина',
      performedBy: 'Исполнитель',
    },
    refresh: 'Обновить',
    disclaimer: 'Все административные действия записываются для обеспечения прозрачности и подотчётности.',
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'd MMM yyyy, HH:mm', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t.title}
          description={t.description}
        />

        {/* Info alert */}
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-700">
            {t.disclaimer}
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as OverrideType)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.filterByType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="batch_unlock">{OVERRIDE_TYPE_LABELS.batch_unlock.ru}</SelectItem>
                  <SelectItem value="window_extend">{OVERRIDE_TYPE_LABELS.window_extend.ru}</SelectItem>
                  <SelectItem value="window_adjust">{OVERRIDE_TYPE_LABELS.window_adjust.ru}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTarget} onValueChange={(v) => setFilterTarget(v as TargetType)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.filterByTarget} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="batch">{TARGET_TYPE_LABELS.batch.ru}</SelectItem>
                  <SelectItem value="matching_window">{TARGET_TYPE_LABELS.matching_window.ru}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  История действий
                </CardTitle>
                <CardDescription>
                  {filteredOverrides?.length || 0} записей
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : !filteredOverrides?.length ? (
              <EmptyState
                icon={FileText}
                message={t.noOverrides}
                helperText={t.noOverridesHelp}
                size="md"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[140px]">{t.columns.date}</TableHead>
                      <TableHead className="w-[160px]">{t.columns.type}</TableHead>
                      <TableHead>{t.columns.target}</TableHead>
                      <TableHead className="w-[200px]">{t.columns.change}</TableHead>
                      <TableHead>{t.columns.reason}</TableHead>
                      <TableHead className="w-[140px]">{t.columns.performedBy}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOverrides.map((override) => (
                      <TableRow key={override.id} className="group">
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <p className="font-medium tabular-nums">
                              {formatDate(override.created_at)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('gap-1.5', OVERRIDE_TYPE_COLORS[override.override_type])}
                          >
                            {OVERRIDE_TYPE_ICONS[override.override_type]}
                            {OVERRIDE_TYPE_LABELS[override.override_type]?.[lang] || override.override_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {override.target_type === 'batch' ? (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {override.target_name || override.target_id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {TARGET_TYPE_LABELS[override.target_type]?.[lang]}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="bg-muted/50">
                              {override.previous_value || '—'}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                              {override.new_value || '—'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-[300px] truncate" title={override.reason}>
                            {override.reason}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{override.performed_by}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
