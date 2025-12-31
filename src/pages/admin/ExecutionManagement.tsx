import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
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
import { EmptyState } from '@/components/ui/EmptyState';
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
  Receipt,
  ClipboardList,
  ArrowRight,
  Eye,
} from 'lucide-react';
import type { ExecutionStatus } from '@/lib/execution-lifecycle';
import { validateExecutionTransition } from '@/lib/execution-lifecycle';
import { cn } from '@/lib/utils';

const STATUS_TABS: { value: ExecutionStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <ClipboardList className="h-4 w-4" /> },
  { value: 'matched', label: 'Matched', icon: <Package className="h-4 w-4" /> },
  { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="h-4 w-4" /> },
  { value: 'delivered', label: 'Delivered', icon: <Truck className="h-4 w-4" /> },
  { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: 'settled', label: 'Settled', icon: <Receipt className="h-4 w-4" /> },
  { value: 'closed', label: 'Closed', icon: <Lock className="h-4 w-4" /> },
];

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

function SummaryCard({ label, value, icon, variant = 'default' }: SummaryCardProps) {
  const variantClasses = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-emerald-500/5 border-emerald-500/20',
    warning: 'bg-amber-500/5 border-amber-500/20',
  };

  return (
    <div className={cn('summary-card border', variantClasses[variant])}>
      <div className="flex items-center justify-between">
        <span className="summary-card-label">{label}</span>
        <span className="text-muted-foreground/60">{icon}</span>
      </div>
      <p className="summary-card-value">{value}</p>
    </div>
  );
}

export default function ExecutionManagement() {
  const [activeTab, setActiveTab] = useState<ExecutionStatus | 'all'>('all');
  const [selectedExecution, setSelectedExecution] = useState<ExecutionWithDetails | null>(null);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  
  // Get current user info for audit trail
  const { user } = useAuthContext();
  const { roleName } = useRole();
  const adminName = user?.email ? `${roleName} (${user.email.split('@')[0]})` : roleName || 'Admin';
  
  // Fetch all executions for counts, then filter for display
  const { data: allExecutions, isLoading: allLoading } = useExecutions();
  const { data: filteredExecutions, isLoading: filteredLoading } = useExecutions(
    activeTab === 'all' ? undefined : { status: activeTab }
  );
  
  const confirmCompliance = useConfirmCompliance();
  const closeExecution = useCloseExecution();

  const isLoading = activeTab === 'all' ? allLoading : filteredLoading;
  const executions = activeTab === 'all' ? allExecutions : filteredExecutions;

  const handleScheduleDelivery = (execution: ExecutionWithDetails) => {
    setSelectedExecution(execution);
    setSchedulingDialogOpen(true);
  };

  const handleCalculateSettlement = (execution: ExecutionWithDetails) => {
    setSelectedExecution(execution);
    setSettlementDialogOpen(true);
  };

  const handleConfirmCompliance = async (execution: ExecutionWithDetails) => {
    // Validate FSM transition
    const validation = validateExecutionTransition(execution.status, 'confirmed', 'admin');
    if (!validation.valid) {
      // Error will be shown by toast in the mutation
      throw new Error(validation.error);
    }
    
    await confirmCompliance.mutateAsync({
      id: execution.id,
      admin_confirmed_by: adminName,
      admin_compliance_notes: 'Compliance verified',
    });
  };

  const handleCloseExecution = async (execution: ExecutionWithDetails) => {
    // Validate FSM transition
    const validation = validateExecutionTransition(execution.status, 'closed', 'admin');
    if (!validation.valid) {
      // Error will be shown by toast in the mutation
      throw new Error(validation.error);
    }
    
    await closeExecution.mutateAsync({
      id: execution.id,
      closed_by: adminName,
      closure_notes: 'Execution completed',
    });
  };

  // Calculate summary counts
  const getStatusCounts = () => {
    if (!allExecutions) return { total: 0, matched: 0, scheduled: 0, delivered: 0, confirmed: 0, settled: 0, closed: 0 };
    const counts: Record<string, number> = { 
      total: allExecutions.length,
      matched: 0, 
      scheduled: 0, 
      delivered: 0, 
      confirmed: 0, 
      settled: 0, 
      closed: 0 
    };
    allExecutions.forEach(e => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  // Pending actions for admin: matched (needs scheduling), delivered (needs compliance confirmation), confirmed (needs settlement)
  // Note: scheduled is waiting for MPK action, not admin action
  const pendingActions = statusCounts.matched + statusCounts.delivered + statusCounts.confirmed;

  const getNextAction = (execution: ExecutionWithDetails) => {
    switch (execution.status) {
      case 'matched':
        return { label: 'Schedule Delivery', icon: <Calendar className="h-4 w-4" />, action: () => handleScheduleDelivery(execution) };
      case 'delivered':
        return { label: 'Confirm Compliance', icon: <CheckCircle2 className="h-4 w-4" />, action: () => handleConfirmCompliance(execution) };
      case 'confirmed':
        return { label: 'Calculate Settlement', icon: <Calculator className="h-4 w-4" />, action: () => handleCalculateSettlement(execution) };
      case 'settled':
        return { label: 'Close Execution', icon: <Lock className="h-4 w-4" />, action: () => handleCloseExecution(execution) };
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
        title="Contracts & Execution"
        description="Manage post-matching execution, delivery confirmation, and settlement"
      />

      {/* Important disclaimer */}
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> TURAN is not a contracting party and does not handle payments. 
          All prices shown are indicative market references. Final settlement is between parties.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Executions"
          value={statusCounts.total}
          icon={<FileText className="h-5 w-5" />}
        />
        <SummaryCard
          label="Pending Actions"
          value={pendingActions}
          icon={<ClipboardList className="h-5 w-5" />}
          variant={pendingActions > 0 ? 'warning' : 'default'}
        />
        <SummaryCard
          label="Awaiting Delivery"
          value={statusCounts.scheduled}
          icon={<Truck className="h-5 w-5" />}
          variant={statusCounts.scheduled > 0 ? 'primary' : 'default'}
        />
        <SummaryCard
          label="Completed"
          value={statusCounts.closed}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExecutionStatus | 'all')}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all' ? statusCounts.total : statusCounts[tab.value] || 0;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="gap-1.5 data-[state=active]:bg-background"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-5 min-w-5 flex items-center justify-center">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Execution Records
                  </CardTitle>
                  <CardDescription>
                    Track offtake executions from matching through settlement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 flex-1" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ))}
                </div>
              ) : !executions?.length ? (
                <EmptyState
                  icon={Package}
                  message="No executions found"
                  helperText="Executions are created automatically after matches are finalized in the Pool Matching page."
                  size="md"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead>Batch / Request</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead>Horizon</TableHead>
                        <TableHead className="w-[180px]">Progress</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead className="text-right">Settlement</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executions.map((execution) => {
                        const nextAction = getNextAction(execution);
                        return (
                          <TableRow key={execution.id} className="group">
                            <TableCell>
                              <div className="space-y-1">
                                <ExecutionStatusBadge status={execution.status} />
                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                  {format(parseISO(execution.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="font-medium text-sm">
                                  {execution.batch?.batch_number || 'Unknown Batch'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {execution.request?.request_number} • {execution.request?.mpk_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span className="font-medium">{execution.matched_volume}</span>
                              <span className="text-muted-foreground text-xs ml-1">heads</span>
                              {execution.delivered_volume && execution.delivered_volume !== execution.matched_volume && (
                                <p className="text-[10px] text-amber-600">
                                  Delivered: {execution.delivered_volume}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <DeliveryPeriodBadge period={execution.delivery_period} showMonths={false} />
                            </TableCell>
                            <TableCell>
                              <ExecutionProgress currentStatus={execution.status} size="sm" />
                            </TableCell>
                            <TableCell>
                              {execution.expected_delivery_start ? (
                                <div className="text-xs space-y-0.5">
                                  <p className="font-medium tabular-nums">
                                    {format(parseISO(execution.expected_delivery_start), 'MMM d')} – {format(parseISO(execution.expected_delivery_end!), 'MMM d')}
                                  </p>
                                  {execution.actual_delivery_date && (
                                    <p className="text-emerald-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      {format(parseISO(execution.actual_delivery_date), 'MMM d')}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Not scheduled</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {execution.settlement_indicative_total ? (
                                <div className="text-xs space-y-0.5">
                                  <p className="font-semibold text-emerald-600 tabular-nums">
                                    {execution.settlement_indicative_total.toLocaleString()} ₸/kg
                                  </p>
                                  <p className="text-muted-foreground tabular-nums">
                                    {execution.settlement_reference_price?.toLocaleString()} + {execution.settlement_premiums_applied}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {nextAction && (
                                    <>
                                      <DropdownMenuItem onClick={nextAction.action} className="gap-2">
                                        {nextAction.icon}
                                        {nextAction.label}
                                        <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
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
    </MainLayout>
  );
}