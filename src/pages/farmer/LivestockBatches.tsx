import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, AlertCircle } from 'lucide-react';
import { useBatches, type BatchStatus } from '@/hooks/useBatches';

// Map database status to StatusBadge status
const mapStatus = (status: BatchStatus): 'forecast' | 'soft-committed' | 'confirmed' => {
  if (status === 'soft_committed') return 'soft-committed';
  if (status === 'confirmed' || status === 'delivered') return 'confirmed';
  return 'forecast';
};

export default function LivestockBatches() {
  const navigate = useNavigate();
  const { data: batches, isLoading, error } = useBatches();

  const handleRowClick = (batchNumber: string) => {
    // Extract the number from BTH-XXXX format
    const id = batchNumber.replace('BTH-', '');
    navigate(`/farmer/batch/${id}`);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Livestock Batches" 
        description="Manage and track your livestock batches for pool submission" 
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Batch Registry</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Failed to load batches. Please try again.</p>
            </div>
          ) : batches && batches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Heads</TableHead>
                  <TableHead>Avg. Weight</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Target Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow 
                    key={batch.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(batch.batch_number)}
                  >
                    <TableCell className="font-medium">{batch.batch_number}</TableCell>
                    <TableCell>{batch.heads}</TableCell>
                    <TableCell>{batch.avg_weight ? `${batch.avg_weight} kg` : '—'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                        {batch.grade}
                      </span>
                    </TableCell>
                    <TableCell>{batch.region}</TableCell>
                    <TableCell>{batch.target_week}</TableCell>
                    <TableCell>
                      <StatusBadge status={mapStatus(batch.status)} />
                    </TableCell>
                    <TableCell>
                      {batch.requires_action && (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">No batches found. Create your first batch to get started.</p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
