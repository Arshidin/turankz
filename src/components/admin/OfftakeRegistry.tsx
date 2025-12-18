import { useState } from 'react';
import { useOfftakeRegistry, type OfftakeEntry } from '@/hooks/useOfftakeRegistry';
import { exportOfftakeCSV, exportOfftakeDetailedCSV, printOfftakePDF } from '@/lib/offtake-export';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Building2,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react';

function ComplianceBadge({ rate }: { rate: number }) {
  if (rate >= 80) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {rate}%
      </Badge>
    );
  }
  if (rate >= 50) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        {rate}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      <XCircle className="w-3 h-3 mr-1" />
      {rate}%
    </Badge>
  );
}

function OfftakeEntryRow({ entry }: { entry: OfftakeEntry }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell>
          <div>
            <span className="font-medium">{entry.mpk_name}</span>
            <span className="text-xs text-muted-foreground block">{entry.mpk_id}</span>
          </div>
        </TableCell>
        <TableCell className="text-right font-medium">
          {entry.total_heads.toLocaleString()}
        </TableCell>
        <TableCell className="text-right text-green-600">
          {entry.standard_compliant_heads.toLocaleString()}
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
          {entry.non_standard_heads.toLocaleString()}
        </TableCell>
        <TableCell>
          <ComplianceBadge rate={entry.compliance_rate} />
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {entry.delivery_periods.slice(0, 3).map(period => (
              <Badge key={period} variant="secondary" className="text-xs">
                {period}
              </Badge>
            ))}
            {entry.delivery_periods.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{entry.delivery_periods.length - 3}
              </Badge>
            )}
          </div>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <div className="px-8 py-4">
              <h4 className="text-sm font-medium mb-3">Matching Details</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Heads</TableHead>
                    <TableHead>Target Week</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Finalized</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.matchings.map(matching => (
                    <TableRow key={matching.id}>
                      <TableCell className="font-mono text-sm">
                        {matching.batch_number}
                      </TableCell>
                      <TableCell>{matching.heads_matched}</TableCell>
                      <TableCell>{matching.target_week}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{matching.grade}</Badge>
                      </TableCell>
                      <TableCell>{matching.region}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={matching.standard_status === 'standard' ? 'default' : 'secondary'}
                        >
                          {matching.standard_status || 'non_standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(matching.finalized_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OfftakeRegistry() {
  const { data, isLoading, error } = useOfftakeRegistry();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          <p className="text-destructive text-center">Failed to load offtake registry</p>
        </CardContent>
      </Card>
    );
  }

  const { entries, summary } = data || { entries: [], summary: null };

  if (!summary || entries.length === 0) {
    return (
      <EmptyState
        icon={Package}
        message="No Finalized Matchings"
        helperText="Offtake registry will populate once matchings are finalized."
      />
    );
  }

  const handleExportCSV = () => {
    exportOfftakeCSV(entries, summary);
  };

  const handleExportDetailedCSV = () => {
    exportOfftakeDetailedCSV(entries);
  };

  const handlePrintPDF = () => {
    printOfftakePDF(entries, summary);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total MPKs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total_mpks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Heads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total_heads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.total_standard_compliant.toLocaleString()} standard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Compliance Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summary.overall_compliance_rate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Standard compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Delivery Period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.delivery_period_range.earliest ? (
              <>
                <div className="text-lg font-semibold">
                  {summary.delivery_period_range.earliest}
                </div>
                <p className="text-xs text-muted-foreground">
                  to {summary.delivery_period_range.latest}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offtake Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Offtake by MPK</CardTitle>
            <CardDescription>
              Aggregated finalized matchings grouped by processing plant
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Summary CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDetailedCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Detailed CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Print PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>MPK</TableHead>
                <TableHead className="text-right">Total Heads</TableHead>
                <TableHead className="text-right">Standard</TableHead>
                <TableHead className="text-right">Non-Standard</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Delivery Periods</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(entry => (
                <OfftakeEntryRow key={entry.mpk_id} entry={entry} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
