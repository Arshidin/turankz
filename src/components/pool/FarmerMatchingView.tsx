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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Link2, CheckCircle2, Clock } from 'lucide-react';

interface FarmerMatchingViewProps {
  batchId?: string;
}

interface FarmerMatchingData {
  id: string;
  heads_matched: number;
  matching_date: string;
  status: string;
  finalized_at: string | null;
  target_week: string;
  required_grade: string;
}

/**
 * Farmer view of matchings - shows matched volumes without MPK identity
 */
export function FarmerMatchingView({ batchId }: FarmerMatchingViewProps) {
  const { data: matchings, isLoading } = useQuery({
    queryKey: ['farmer-matchings', batchId],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('pool_matches')
        .select(`
          id,
          heads_matched,
          matching_date,
          status,
          finalized_at,
          purchase_pool_requests:request_id (
            target_week,
            required_grade
          )
        `)
        .in('status', ['active', 'finalized'])
        .order('matching_date', { ascending: false });

      if (batchId) {
        queryBuilder = queryBuilder.eq('batch_id', batchId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        heads_matched: item.heads_matched,
        matching_date: item.matching_date,
        status: item.status,
        finalized_at: item.finalized_at,
        target_week: (item.purchase_pool_requests as any)?.target_week || '',
        required_grade: (item.purchase_pool_requests as any)?.required_grade || '',
      })) as FarmerMatchingData[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" />
            Pool Matchings
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
            <Link2 className="h-4 w-4" />
            Pool Matchings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No pool matchings yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalMatched = matchings.reduce((sum, m) => sum + m.heads_matched, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" />
            Pool Matchings
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalMatched} heads matched
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Target Week</TableHead>
              <TableHead className="text-xs">Grade</TableHead>
              <TableHead className="text-xs">Heads Matched</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchings.map(matching => (
              <TableRow key={matching.id}>
                <TableCell className="py-2 font-medium">
                  {matching.target_week}
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="text-xs">
                    {matching.required_grade}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 font-medium">
                  {matching.heads_matched}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {format(parseISO(matching.matching_date), 'MMM d, yyyy')}
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
