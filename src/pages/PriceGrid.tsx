import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useActivePriceGrid, AGE_CATEGORIES, SEX_OPTIONS, BREED_GROUPS, type PriceGridCell } from '@/hooks/usePriceGrid';
import { useRole } from '@/contexts/RoleContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { format, parseISO } from 'date-fns';
import { Info, CircleDot, Calendar, CheckCircle2, Eye } from 'lucide-react';

export default function PriceGrid() {
  const { role } = useRole();
  const { isObserver } = useAccountStatus();
  const { data: activeGrid, isLoading, error } = useActivePriceGrid();

  // Handle potential errors gracefully
  // Errors are handled by React Query's error state and displayed via toast notifications

  const getAgeCategoryLabel = (value: string) => 
    AGE_CATEGORIES.find(c => c.value === value)?.label || value;

  const getSexLabel = (value: string) => 
    SEX_OPTIONS.find(s => s.value === value)?.label || value;

  const getBreedGroupLabel = (value: string | null) => 
    value ? BREED_GROUPS.find(b => b.value === value)?.label || value : 'All Breeds';

  // Group cells by age category and sex for better visualization
  const groupedCells = useMemo(() => {
    if (!activeGrid?.cells || activeGrid.cells.length === 0) return {};
    
    type CellGroup = {
      age_category: string;
      sex: string;
      cells: PriceGridCell[];
    };
    
    return activeGrid.cells.reduce((acc, cell) => {
      const key = `${cell.age_category}-${cell.sex}`;
      if (!acc[key]) {
        acc[key] = {
          age_category: cell.age_category,
          sex: cell.sex,
          cells: [],
        };
      }
      acc[key].cells.push(cell);
      return acc;
    }, {} as Record<string, CellGroup>);
  }, [activeGrid?.cells]);
  
  // Sort groups for consistent display
  const sortedGroups = useMemo(() => {
    return Object.values(groupedCells).sort((a, b) => {
      // Sort by age category first, then by sex
      const ageOrder = ['<12_months', '12_18_months', '>18_months'];
      const ageCompare = ageOrder.indexOf(a.age_category) - ageOrder.indexOf(b.age_category);
      if (ageCompare !== 0) return ageCompare;
      return a.sex.localeCompare(b.sex);
    });
  }, [groupedCells]);

  return (
    <MainLayout>
      <PageHeader 
        title="Turan Reference Price Grid" 
        description="Indicative market benchmarks for live cattle pricing"
      />

      {/* Observer Badge */}
      {isObserver && (
        <div className="mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 gap-1.5 py-1.5 px-3">
                  <Eye className="h-3.5 w-3.5" />
                  Ориентиры · Не цена сделки
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm">
                  Ценовая сетка используется как ориентир и не гарантирует цену реализации.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Reference prices are indicative market benchmarks. Final settlement prices are determined at delivery based on market conditions. TURAN does not set, enforce, or guarantee transaction prices. Participation is voluntary.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load price grid: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* No Active Grid */}
      {!isLoading && !error && !activeGrid && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active reference price grid available.</p>
            {role === 'admin' && (
              <p className="text-sm text-muted-foreground mt-2">
                Go to Reference Price Grid Management to create and activate a reference grid.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Grid Display */}
      {activeGrid && (
        <div className="space-y-6">
          {/* Version Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <CardTitle className="text-lg">{activeGrid.version.version_name}</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Effective: {format(parseISO(activeGrid.version.effective_date), 'MMM d, yyyy')}
                </div>
              </div>
              {activeGrid.version.description && (
                <CardDescription>{activeGrid.version.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Reference Price Grid Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reference Prices (₸/kg live weight)</CardTitle>
              <CardDescription>
                Indicative prices by age category, sex, and weight range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGrid.cells.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No reference price cells defined in this grid.
                </p>
              ) : sortedGroups.length > 0 ? (
                <div className="space-y-6">
                  {sortedGroups.map((group, groupIndex) => (
                    <div key={`${group.age_category}-${group.sex}`} className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Badge variant="secondary" className="text-xs">
                          {getAgeCategoryLabel(group.age_category)}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          {getSexLabel(group.sex)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {group.cells.length} {group.cells.length === 1 ? 'cell' : 'cells'}
                        </span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Weight Range</TableHead>
                            <TableHead>Breed Group</TableHead>
                            <TableHead className="text-right">Reference Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.cells
                            .sort((a, b) => a.weight_min - b.weight_min)
                            .map((cell) => (
                              <TableRow key={cell.id}>
                                <TableCell className="font-mono text-sm">
                                  {cell.weight_min}–{cell.weight_max} kg
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {getBreedGroupLabel(cell.breed_group)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {cell.base_price.toLocaleString()} ₸/kg
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      {groupIndex < sortedGroups.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Age Category</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Weight Range</TableHead>
                      <TableHead>Breed Group</TableHead>
                      <TableHead className="text-right">Reference Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeGrid.cells.map((cell) => (
                      <TableRow key={cell.id}>
                        <TableCell>
                          <Badge variant="outline">{getAgeCategoryLabel(cell.age_category)}</Badge>
                        </TableCell>
                        <TableCell>{getSexLabel(cell.sex)}</TableCell>
                        <TableCell className="font-mono">
                          {cell.weight_min}–{cell.weight_max} kg
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getBreedGroupLabel(cell.breed_group)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-lg">
                          {cell.base_price.toLocaleString()} ₸/kg
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Usage Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    The grid provides <span className="text-foreground font-medium">indicative market benchmarks</span>, not contract prices or guaranteed rates.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Final settlement prices are determined at delivery based on market conditions and are not enforced by TURAN.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Incentive-based premiums for compliance with standards, predictability, and discipline are applied separately and reflected in indicative calculations.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
