import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter } from 'lucide-react';

const batches = [
  { id: 'B-2847', heads: 45, avgWeight: '485 kg', breed: 'Angus Cross', gradeEst: 'A', status: 'confirmed' as const, targetDate: '2025-12-28' },
  { id: 'B-2845', heads: 32, avgWeight: '510 kg', breed: 'Kazakh Whiteheaded', gradeEst: 'A', status: 'soft-committed' as const, targetDate: '2025-12-30' },
  { id: 'B-2843', heads: 28, avgWeight: '472 kg', breed: 'Hereford', gradeEst: 'B', status: 'forecast' as const, targetDate: '2026-01-05' },
  { id: 'B-2841', heads: 50, avgWeight: '498 kg', breed: 'Angus Cross', gradeEst: 'A', status: 'forecast' as const, targetDate: '2026-01-10' },
  { id: 'B-2839', heads: 38, avgWeight: '462 kg', breed: 'Simmental', gradeEst: 'B', status: 'forecast' as const, targetDate: '2026-01-15' },
];

export default function LivestockBatches() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Heads</TableHead>
                <TableHead>Avg. Weight</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Est. Grade</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{batch.id}</TableCell>
                  <TableCell>{batch.heads}</TableCell>
                  <TableCell>{batch.avgWeight}</TableCell>
                  <TableCell>{batch.breed}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                      {batch.gradeEst}
                    </span>
                  </TableCell>
                  <TableCell>{batch.targetDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={batch.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
