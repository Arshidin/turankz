import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActivePriceGrid, AGE_CATEGORIES, SEX_OPTIONS, BREED_GROUPS } from '@/hooks/usePriceGrid';
import { useRole } from '@/contexts/RoleContext';
import { format, parseISO } from 'date-fns';
import { Info, CircleDot, Calendar, CheckCircle2 } from 'lucide-react';

export default function PriceGrid() {
  const { role } = useRole();
  const { data: activeGrid, isLoading, error } = useActivePriceGrid();

  const getAgeCategoryLabel = (value: string) => 
    AGE_CATEGORIES.find(c => c.value === value)?.label || value;

  const getSexLabel = (value: string) => 
    SEX_OPTIONS.find(s => s.value === value)?.label || value;

  const getBreedGroupLabel = (value: string | null) => 
    value ? BREED_GROUPS.find(b => b.value === value)?.label || value : 'All Breeds';

  // Group cells by age category and sex for display
  const groupedCells = activeGrid?.cells.reduce((acc, cell) => {
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
  }, {} as Record<string, { age_category: string; sex: string; cells: typeof activeGrid.cells }>) || {};

  return (
    <MainLayout>
      <PageHeader 
        title="Turan Live Cattle Price Grid" 
        description="Unified market reference for live cattle pricing across the platform"
      />

      {/* Intro Note */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              This page presents a unified and transparent live cattle pricing framework used as a market reference. 
              It is informational only and does not represent final transaction prices.
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
            <p className="text-muted-foreground">No active price grid available.</p>
            {role === 'admin' && (
              <p className="text-sm text-muted-foreground mt-2">
                Go to Price Grid Management to create and activate a price grid.
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

          {/* Price Grid Table */}
          <Card>
            <CardHeader>
              <CardTitle>Base Prices (₸/kg live weight)</CardTitle>
              <CardDescription>
                Prices by age category, sex, and weight range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGrid.cells.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No price cells defined in this grid.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Age Category</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Weight Range</TableHead>
                      <TableHead>Breed Group</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
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
              <CardTitle className="text-base">Usage Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    The grid is a <span className="text-foreground font-medium">market reference</span>, not a contract price.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Final prices may include additional premiums or discounts based on specific transaction terms.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Reliability and pool participation premiums are applied separately and are not reflected in this grid.
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
