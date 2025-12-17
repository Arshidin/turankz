import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const pendingGrades = [
  { batchId: 'B-2850', farmId: 'FRM-654', farmName: 'Steppe Gold', heads: 42, currentGrade: '-', submitted: 'Dec 16', status: 'pending' },
  { batchId: 'B-2849', farmId: 'FRM-321', farmName: 'Karaganda Cattle', heads: 35, currentGrade: '-', submitted: 'Dec 15', status: 'pending' },
  { batchId: 'B-2848', farmId: 'FRM-778', farmName: 'Northern Herd', heads: 28, currentGrade: '-', submitted: 'Dec 14', status: 'in-review' },
];

const recentGrades = [
  { batchId: 'B-2847', farmId: 'FRM-892', farmName: 'Alash Agro Farm', heads: 45, grade: 'A', gradedBy: 'Inspector K.', gradedOn: 'Dec 14' },
  { batchId: 'B-2845', farmId: 'FRM-654', farmName: 'Steppe Gold', heads: 32, grade: 'A', gradedBy: 'Inspector M.', gradedOn: 'Dec 13' },
  { batchId: 'B-2843', farmId: 'FRM-321', farmName: 'Karaganda Cattle', heads: 28, grade: 'B', gradedBy: 'Inspector K.', gradedOn: 'Dec 12' },
  { batchId: 'B-2841', farmId: 'FRM-445', farmName: 'Eastern Plains', heads: 50, grade: 'A', gradedBy: 'Inspector S.', gradedOn: 'Dec 11' },
];

export default function GradingStatus() {
  return (
    <MainLayout>
      <PageHeader 
        title="Grading & Status" 
        description="Review and assign grades to livestock batches" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-status-forecast-bg rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-status-forecast" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-status-soft-committed-bg rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-status-soft-committed" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">1</p>
              <p className="text-sm text-muted-foreground">In Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-status-confirmed-bg rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-status-confirmed" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Completed (30d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-foreground">94%</p>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Pending Grading</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Heads</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assign Grade</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingGrades.map((item) => (
                <TableRow key={item.batchId}>
                  <TableCell className="font-medium">{item.batchId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{item.farmName}</p>
                      <p className="text-xs text-muted-foreground">{item.farmId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.heads}</TableCell>
                  <TableCell>{item.submitted}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={item.status === 'pending' ? 'forecast' : 'soft-committed'} 
                    />
                  </TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">Grade A</SelectItem>
                        <SelectItem value="b">Grade B</SelectItem>
                        <SelectItem value="c">Grade C</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm">Submit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Grading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Heads</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Graded By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGrades.map((item) => (
                <TableRow key={item.batchId}>
                  <TableCell className="font-medium">{item.batchId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{item.farmName}</p>
                      <p className="text-xs text-muted-foreground">{item.farmId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.heads}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-sm font-medium ${
                      item.grade === 'A' ? 'bg-status-confirmed-bg text-status-confirmed' :
                      item.grade === 'B' ? 'bg-status-soft-committed-bg text-status-soft-committed' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.grade}
                    </span>
                  </TableCell>
                  <TableCell>{item.gradedBy}</TableCell>
                  <TableCell>{item.gradedOn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
