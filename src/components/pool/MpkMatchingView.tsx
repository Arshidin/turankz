import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Link2, CheckCircle2, Clock, Truck, Lock, Info } from 'lucide-react';

interface MpkMatchingViewProps {
  requestId?: string;
}

interface MpkMatchingData {
  id: string;
  heads_matched: number;
  matching_date: string;
  status: string;
  finalized_at: string | null;
  batch_region: string;
  batch_grade: string;
  target_week: string;
  // Pricing - aggregated for MPK (hides farmer-specific scoring)
  total_price_per_kg: number | null;
  base_price_per_kg: number | null;
  total_premium: number | null;
  premium_locked: boolean;
}

/**
 * MPK view of matchings - shows delivery schedule without farmer identity
 */
export function MpkMatchingView({ requestId }: MpkMatchingViewProps) {
  const { data: matchings, isLoading } = useQuery({
    queryKey: ['mpk-matchings', requestId],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('pool_matches')
        .select(`
          id,
          heads_matched,
          matching_date,
          status,
          finalized_at,
          total_price_per_kg,
          base_price_per_kg,
          total_premium,
          premium_locked,
          batches:batch_id (
            region,
            grade,
            target_week
          )
        `)
        .in('status', ['active', 'finalized'])
        .order('matching_date', { ascending: false });

      if (requestId) {
        queryBuilder = queryBuilder.eq('request_id', requestId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        heads_matched: item.heads_matched,
        matching_date: item.matching_date,
        status: item.status,
        finalized_at: item.finalized_at,
        batch_region: (item.batches as any)?.region || '',
        batch_grade: (item.batches as any)?.grade || '',
        target_week: (item.batches as any)?.target_week || '',
        total_price_per_kg: item.total_price_per_kg,
        base_price_per_kg: item.base_price_per_kg,
        total_premium: item.total_premium,
        premium_locked: item.premium_locked || false,
      })) as MpkMatchingData[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Delivery Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matchings || matchings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Delivery Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No deliveries scheduled yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalMatched = matchings.reduce((sum, m) => sum + m.heads_matched, 0);
  const confirmedCount = matchings.filter(m => m.status === 'finalized').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Delivery Schedule
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary">
              {totalMatched} heads
            </Badge>
            <span className="text-muted-foreground">
              {confirmedCount}/{matchings.length} confirmed
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Region</TableHead>
                <TableHead className="text-xs">Grade</TableHead>
                <TableHead className="text-xs">Target Week</TableHead>
                <TableHead className="text-xs">Heads</TableHead>
                <TableHead className="text-xs">Price</TableHead>
                <TableHead className="text-xs">Match Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {matchings.map(matching => (
              <TableRow key={matching.id}>
                <TableCell className="py-2 font-medium">
                  {matching.batch_region}
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="text-xs">
                    {matching.batch_grade}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-sm">
                  {matching.target_week}
                </TableCell>
                <TableCell className="py-2 font-medium">
                  {matching.heads_matched}
                </TableCell>
                <TableCell className="py-2">
                  {matching.premium_locked && matching.total_price_per_kg ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Badge variant="default" className="text-xs">
                              {matching.total_price_per_kg} ₸/kg
                            </Badge>
                            {matching.total_premium && matching.total_premium > 0 && (
                              <Badge variant="secondary" className="text-xs text-emerald-600">
                                +{matching.total_premium}
                              </Badge>
                            )}
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p>Base: {matching.base_price_per_kg} ₸/kg</p>
                            <p>Premiums: +{matching.total_premium} ₸/kg</p>
                            <p className="text-muted-foreground">Price locked at finalization</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {format(parseISO(matching.matching_date), 'MMM d')}
                </TableCell>
                <TableCell className="py-2">
                  {matching.status === 'finalized' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/10 text-blue-600 border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
