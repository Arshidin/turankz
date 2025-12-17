import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bookmark, Trash2 } from 'lucide-react';

const watchlistItems = [
  { farmId: 'FRM-892', farmName: 'Alash Agro Farm', region: 'Almaty', heads: 45, grade: 'A', status: 'confirmed' as const, date: 'Dec 28', addedOn: 'Dec 15' },
  { farmId: 'FRM-654', farmName: 'Steppe Gold', region: 'Akmola', heads: 38, grade: 'A', status: 'soft-committed' as const, date: 'Dec 30', addedOn: 'Dec 14' },
  { farmId: 'FRM-321', farmName: 'Karaganda Cattle', region: 'Karaganda', heads: 52, grade: 'B', status: 'forecast' as const, date: 'Jan 2', addedOn: 'Dec 12' },
  { farmId: 'FRM-445', farmName: 'Eastern Plains', region: 'East KZ', heads: 30, grade: 'A', status: 'forecast' as const, date: 'Jan 5', addedOn: 'Dec 10' },
];

export default function Watchlist() {
  return (
    <MainLayout>
      <PageHeader 
        title="Watchlist" 
        description="Track farms and batches of interest for procurement planning" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{watchlistItems.length}</p>
                <p className="text-sm text-muted-foreground">Watched Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">165</p>
              <p className="text-sm text-muted-foreground">Total Heads Watched</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Ready for Request</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Watched Batches</CardTitle>
          <Button variant="outline" size="sm">
            Request Selected
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Heads</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlistItems.map((item) => (
                <TableRow key={item.farmId}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{item.farmName}</p>
                      <p className="text-xs text-muted-foreground">{item.farmId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.region}</TableCell>
                  <TableCell>{item.heads}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                      {item.grade}
                    </span>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.addedOn}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
