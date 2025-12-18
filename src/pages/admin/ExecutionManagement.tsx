import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useExecutions, 
  useConfirmCompliance,
  useCloseExecution,
  type ExecutionWithDetails,
} from '@/hooks/useExecutions';
import { 
  ExecutionStatusBadge, 
  ExecutionProgress,
  DeliverySchedulingDialog,
  SettlementCalculationDialog,
} from '@/components/execution';
import { DeliveryPeriodBadge } from '@/components/shared/DeliveryPeriodSelect';
import { PricingDisclaimer } from '@/components/pricing';
import { PageHeader } from '@/components/ui/PageHeader';
import { format, parseISO } from 'date-fns';
import { 
  Package, 
  Calendar, 
  CheckCircle2, 
  Calculator,
  Lock,
  MoreHorizontal,
  Info,
  Truck,
  FileText,
} from 'lucide-react';
import type { ExecutionStatus } from '@/lib/execution-lifecycle';

const STATUS_TABS: { value: ExecutionStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Package className="h-4 w-4" /> },
  { value: 'matched', label: 'Matched', icon: <Package className="h-4 w-4" /> },
  { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="h-4 w-4" /> },
  { value: 'delivered', label: 'Delivered', icon: <Truck className="h-4 w-4" /> },
  { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: 'settled', label: 'Settled', icon: <Calculator className="h-4 w-4" /> },
  { value: 'closed', label: 'Closed', icon: <Lock className="h-4 w-4" /> },
];

export default function ExecutionManagement() {
  const [activeTab, setActiveTab] = useState<ExecutionStatus | 'all'>('all');
  const [selectedExecution, setSelectedExecution] = useState<ExecutionWithDetails | null>(null);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  
  const { data: executions, isLoading } = useExecutions(
    activeTab === 'all' ? undefined : { status: activeTab }
  );
  const confirmCompliance = useConfirmCompliance();
  const closeExecution = useCloseExecution();

  const handleScheduleDelivery = (execution: ExecutionWithDetails) => {
    setSelectedExecution(execution);
    setSchedulingDialogOpen(true);
  };

  const handleCalculateSettlement = (execution: ExecutionWithDetails) => {
    setSelectedExecution(execution);
    setSettlementDialogOpen(true);
  };

  const handleConfirmCompliance = async (execution: ExecutionWithDetails) => {
    await confirmCompliance.mutateAsync({
      id: execution.id,
      admin_confirmed_by: 'Admin',
      admin_compliance_notes: 'Compliance verified',
    });
  };

  const handleCloseExecution = async (execution: ExecutionWithDetails) => {
    await closeExecution.mutateAsync({
      id: execution.id,
      closed_by: 'Admin',
      closure_notes: 'Execution completed',
    });
  };

  const getStatusCounts = () => {
    if (!executions) return {};
    const counts: Record<string, number> = { all: executions.length };
    executions.forEach(e => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts & Execution"
        description="Manage post-matching execution, delivery confirmation, and settlement"
      />

      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-700">
          <strong>Important:</strong> TURAN is not a contracting party and does not handle payments. 
          All prices shown are indicative market references. Final settlement is between parties.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExecutionStatus | 'all')}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="gap-1.5"
            >
              {tab.icon}
              {tab.label}
              {statusCounts[tab.value] !== undefined && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {statusCounts[tab.value]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Execution Records
              </CardTitle>
              <CardDescription>
                Track offtake executions from matching through settlement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !executions?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No executions found</p>
                  <p className="text-sm">Executions are created automatically after matches are finalized</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Execution</TableHead>
                      <TableHead>Batch / Request</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Planning Horizon</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Settlement</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <ExecutionStatusBadge status={execution.status} />
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(execution.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {execution.batch?.batch_number || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {execution.request?.request_number} • {execution.request?.mpk_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{execution.matched_volume}</span>
                          <span className="text-muted-foreground text-sm"> heads</span>
                          {execution.delivered_volume && execution.delivered_volume !== execution.matched_volume && (
                            <p className="text-xs text-amber-600">
                              Delivered: {execution.delivered_volume}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <DeliveryPeriodBadge period={execution.delivery_period} showMonths={false} />
                        </TableCell>
                        <TableCell>
                          <ExecutionProgress currentStatus={execution.status} />
                        </TableCell>
                        <TableCell>
                          {execution.expected_delivery_start ? (
                            <div className="text-xs">
                              <p className="font-medium">
                                {format(parseISO(execution.expected_delivery_start), 'MMM d')} - {format(parseISO(execution.expected_delivery_end!), 'MMM d')}
                              </p>
                              {execution.actual_delivery_date && (
                                <p className="text-emerald-600">
                                  Actual: {format(parseISO(execution.actual_delivery_date), 'MMM d')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {execution.settlement_indicative_total ? (
                            <div className="text-xs">
                              <p className="font-medium text-emerald-600">
                                {execution.settlement_indicative_total} ₸/kg
                              </p>
                              <p className="text-muted-foreground">
                                (Ref: {execution.settlement_reference_price} + {execution.settlement_premiums_applied})
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {execution.status === 'matched' && (
                                <DropdownMenuItem onClick={() => handleScheduleDelivery(execution)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Delivery
                                </DropdownMenuItem>
                              )}
                              {execution.status === 'delivered' && (
                                <DropdownMenuItem onClick={() => handleConfirmCompliance(execution)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Confirm Compliance
                                </DropdownMenuItem>
                              )}
                              {execution.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleCalculateSettlement(execution)}>
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Calculate Settlement
                                </DropdownMenuItem>
                              )}
                              {execution.status === 'settled' && (
                                <DropdownMenuItem onClick={() => handleCloseExecution(execution)}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Close Execution
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PricingDisclaimer variant="inline" />

      {/* Dialogs */}
      {selectedExecution && (
        <>
          <DeliverySchedulingDialog
            open={schedulingDialogOpen}
            onOpenChange={setSchedulingDialogOpen}
            executionId={selectedExecution.id}
            scheduledBy="Admin"
          />
          <SettlementCalculationDialog
            open={settlementDialogOpen}
            onOpenChange={setSettlementDialogOpen}
            executionId={selectedExecution.id}
            suggestedReferencePrice={selectedExecution.match?.total_price_per_kg || 0}
            suggestedPremiums={selectedExecution.match?.total_premium || 0}
            deliveredVolume={selectedExecution.delivered_volume || selectedExecution.matched_volume}
            performedBy="Admin"
          />
        </>
      )}
    </div>
  );
}
