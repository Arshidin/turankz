import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

const farmers = [
  { id: 'FRM-892', name: 'Alash Agro Farm', region: 'Almaty', contact: 'Aibek N.', totalHeads: 450, grade: 'A', status: 'active' },
  { id: 'FRM-654', name: 'Steppe Gold', region: 'Akmola', contact: 'Berik K.', totalHeads: 320, grade: 'A', status: 'active' },
  { id: 'FRM-321', name: 'Karaganda Cattle', region: 'Karaganda', contact: 'Daulet M.', totalHeads: 280, grade: 'B', status: 'active' },
  { id: 'FRM-445', name: 'Eastern Plains', region: 'East KZ', contact: 'Erlan S.', totalHeads: 195, grade: 'A', status: 'pending' },
  { id: 'FRM-778', name: 'Northern Herd', region: 'Kostanay', contact: 'Zhanat T.', totalHeads: 410, grade: 'B', status: 'active' },
  { id: 'FRM-556', name: 'Semey Livestock', region: 'East KZ', contact: 'Ilyas O.', totalHeads: 175, grade: 'C', status: 'inactive' },
];

export default function FarmersManagement() {
  return (
    <MainLayout>
      <PageHeader 
        title="Farmers Management" 
        description="Manage registered farmers and their verification status" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-foreground">89</p>
            <p className="text-sm text-muted-foreground">Total Farmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-accent">72</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-status-forecast">12</p>
            <p className="text-sm text-muted-foreground">Pending Verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-muted-foreground">5</p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Farmer Registry</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search farmers..." className="pl-9 w-[250px]" />
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Farmer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm ID</TableHead>
                <TableHead>Farm Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Heads</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">{farmer.id}</TableCell>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>{farmer.region}</TableCell>
                  <TableCell>{farmer.contact}</TableCell>
                  <TableCell>{farmer.totalHeads}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                      {farmer.grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={
                        farmer.status === 'active' ? 'bg-status-confirmed-bg text-status-confirmed' :
                        farmer.status === 'pending' ? 'bg-status-forecast-bg text-status-forecast' :
                        'bg-muted text-muted-foreground'
                      }
                    >
                      {farmer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
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
