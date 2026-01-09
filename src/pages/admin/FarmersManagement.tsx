import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { getAdminBreadcrumbs } from '@/lib/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useFarmers,
  useFarmerActivityLog,
  useUpdateFarmerGrading,
  useToggleFarmerRestriction,
  useFarmerBatchStats,
  useUpdateFarmerRegistration,
  Farmer,
  FarmerGrading,
} from '@/hooks/useFarmers';
import { PendingApplicationsCard, type PendingApplication } from '@/components/admin/PendingApplicationsCard';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Search,
  Users,
  AlertTriangle,
  Shield,
  ShieldOff,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  Clock,
  UserCheck,
} from 'lucide-react';

const GRADING_ORDER: FarmerGrading[] = ['observer', 'declared_supplier', 'standard_supplier'];

const getGradingLabel = (grading: FarmerGrading) => {
  switch (grading) {
    case 'observer': return 'Observer';
    case 'declared_supplier': return 'Declared Supplier';
    case 'standard_supplier': return 'Standard Supplier';
  }
};

const getGradingBadge = (grading: FarmerGrading) => {
  switch (grading) {
    case 'observer':
      return <Badge variant="outline" className="text-muted-foreground">Observer</Badge>;
    case 'declared_supplier':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Declared Supplier</Badge>;
    case 'standard_supplier':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Standard Supplier</Badge>;
  }
};

const getReliabilityBadge = (reliability: string) => {
  switch (reliability) {
    case 'high':
      return <Badge variant="outline" className="text-status-confirmed border-status-confirmed text-xs">High</Badge>;
    case 'medium':
      return <Badge variant="outline" className="text-status-soft border-status-soft text-xs">Medium</Badge>;
    case 'low':
      return <Badge variant="outline" className="text-destructive border-destructive text-xs">Low</Badge>;
  }
};

const getRegistrationStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-xs">Active</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500/10 text-amber-700 border-0 text-xs">Pending</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};


export default function FarmersManagement() {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterGrading, setFilterGrading] = useState<string>('all');
  const [filterReliability, setFilterReliability] = useState<string>('all');
  
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
  const [gradingAction, setGradingAction] = useState<'promote' | 'demote' | null>(null);
  const [gradingNote, setGradingNote] = useState('');
  
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [restrictionNote, setRestrictionNote] = useState('');
  const [restrictionReason, setRestrictionReason] = useState('');

  const { data: farmers, isLoading: farmersLoading } = useFarmers();
  const { data: activityLog, isLoading: logLoading } = useFarmerActivityLog(selectedFarmerId);
  const updateGrading = useUpdateFarmerGrading();
  const toggleRestriction = useToggleFarmerRestriction();
  const updateRegistration = useUpdateFarmerRegistration();

  const selectedFarmer = farmers?.find(f => f.id === selectedFarmerId);
  
  // Get batch stats for the selected farmer
  const { data: batchStats, isLoading: batchStatsLoading } = useFarmerBatchStats(selectedFarmer?.user_id || null);

  // Get unique regions for filter
  const regions = useMemo(() => {
    if (!farmers) return [];
    return [...new Set(farmers.map(f => f.region))].sort();
  }, [farmers]);

  // Filter farmers
  const filteredFarmers = useMemo(() => {
    if (!farmers) return [];
    return farmers.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.farmer_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = filterRegion === 'all' || f.region === filterRegion;
      const matchesGrading = filterGrading === 'all' || f.grading === filterGrading;
      const matchesReliability = filterReliability === 'all' || f.reliability === filterReliability;
      return matchesSearch && matchesRegion && matchesGrading && matchesReliability;
    });
  }, [farmers, searchQuery, filterRegion, filterGrading, filterReliability]);

  // Check if farmer has warning signals
  const hasWarningSignals = (farmer: Farmer) => {
    const declineRate = farmer.total_confirmations + farmer.total_declines > 0
      ? farmer.total_declines / (farmer.total_confirmations + farmer.total_declines)
      : 0;
    const daysSinceActivity = farmer.last_activity_at
      ? (Date.now() - new Date(farmer.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    return declineRate > 0.3 || farmer.missed_updates >= 3 || daysSinceActivity > 10;
  };

  const canPromote = (grading: FarmerGrading) => GRADING_ORDER.indexOf(grading) < GRADING_ORDER.length - 1;
  const canDemote = (grading: FarmerGrading) => GRADING_ORDER.indexOf(grading) > 0;

  const getNextGrading = (grading: FarmerGrading, direction: 'up' | 'down'): FarmerGrading => {
    const idx = GRADING_ORDER.indexOf(grading);
    if (direction === 'up') return GRADING_ORDER[Math.min(idx + 1, GRADING_ORDER.length - 1)];
    return GRADING_ORDER[Math.max(idx - 1, 0)];
  };

  const handleGradingChange = async () => {
    if (!selectedFarmer || !gradingAction || !gradingNote.trim()) return;
    
    const newGrading = getNextGrading(selectedFarmer.grading, gradingAction === 'promote' ? 'up' : 'down');
    
    await updateGrading.mutateAsync({
      farmerId: selectedFarmer.id,
      newGrading,
      previousGrading: selectedFarmer.grading,
      note: gradingNote,
    });
    
    setGradingDialogOpen(false);
    setGradingNote('');
    setGradingAction(null);
  };

  const handleRestrictionToggle = async () => {
    if (!selectedFarmer || !restrictionNote.trim()) return;
    
    await toggleRestriction.mutateAsync({
      farmerId: selectedFarmer.id,
      isRestricted: !selectedFarmer.is_restricted,
      reason: restrictionReason,
      note: restrictionNote,
    });
    
    setRestrictionDialogOpen(false);
    setRestrictionNote('');
    setRestrictionReason('');
  };

  const openGradingDialog = (action: 'promote' | 'demote') => {
    setGradingAction(action);
    setGradingDialogOpen(true);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Farmers Management"
        description="Manage farmer base, control access, and enforce discipline through grading"
        breadcrumbs={getAdminBreadcrumbs('farmers', 'Farmers Management')}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{farmers?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Farmers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-status-confirmed">
              {farmers?.filter(f => f.grading === 'standard_supplier').length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Standard Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-status-soft">
              {farmers?.filter(f => f.grading === 'declared_supplier').length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Declared Suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-destructive">
              {farmers?.filter(f => hasWarningSignals(f)).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Require Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Section */}
      <PendingApplicationsCard
        title="Pending Farmer Applications"
        applications={(farmers || []).map(f => ({
          id: f.id,
          display_id: f.farmer_id,
          name: f.name,
          region: f.region,
          email: f.email,
          created_at: f.created_at,
          registration_status: f.registration_status,
        }))}
        isLoading={farmersLoading}
        onActivate={async (id, note) => {
          const farmer = farmers?.find(f => f.id === id);
          if (!farmer) return;
          await updateRegistration.mutateAsync({
            farmerId: id,
            newStatus: 'active',
            previousStatus: farmer.registration_status,
            note,
          });
        }}
        onReject={async (id, note) => {
          const farmer = farmers?.find(f => f.id === id);
          if (!farmer) return;
          await updateRegistration.mutateAsync({
            farmerId: id,
            newStatus: 'rejected',
            previousStatus: farmer.registration_status,
            note,
          });
        }}
        isPending={updateRegistration.isPending}
      />

      {/* Helper Text */}
      <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Shield className="w-4 h-4 inline mr-2" />
          Grading reflects reliability and directly affects pool access. Changes are logged for audit purposes.
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Farmer List */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Farmer List</CardTitle>
                <span className="text-xs text-muted-foreground">{filteredFarmers.length} farmers</span>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterGrading} onValueChange={setFilterGrading}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Grading" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="standard_supplier">Standard Supplier</SelectItem>
                    <SelectItem value="declared_supplier">Declared Supplier</SelectItem>
                    <SelectItem value="observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterReliability} onValueChange={setFilterReliability}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Reliability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {farmersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredFarmers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No farmers found for selected criteria.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterRegion('all');
                      setFilterGrading('all');
                      setFilterReliability('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Grading</TableHead>
                        <TableHead>Reliability</TableHead>
                        <TableHead className="text-right">Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFarmers.map(farmer => (
                        <TableRow
                          key={farmer.id}
                          onClick={() => setSelectedFarmerId(farmer.id)}
                          className={`cursor-pointer ${
                            farmer.id === selectedFarmerId ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {hasWarningSignals(farmer) && (
                                <AlertTriangle className="w-4 h-4 text-destructive" />
                              )}
                              {farmer.is_restricted && (
                                <ShieldOff className="w-4 h-4 text-destructive" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{farmer.name}</p>
                                <p className="text-xs text-muted-foreground">{farmer.farmer_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{farmer.region}</TableCell>
                          <TableCell>{getGradingBadge(farmer.grading)}</TableCell>
                          <TableCell>{getReliabilityBadge(farmer.reliability)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {farmer.last_activity_at 
                              ? formatDistanceToNow(new Date(farmer.last_activity_at), { addSuffix: true })
                              : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Selected Farmer Details */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Farmer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedFarmer ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a farmer to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Farmer Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedFarmer.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedFarmer.farmer_id} · {selectedFarmer.region}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getGradingBadge(selectedFarmer.grading)}
                      {selectedFarmer.is_restricted && (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Restricted
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Declared Volume Breakdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Declared Volume (Heads)</p>
                    </div>
                    {batchStatsLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : !selectedFarmer.user_id ? (
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">No linked user account</p>
                        <p className="text-xs text-muted-foreground mt-1">Batch data unavailable</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-3 bg-secondary/50 rounded-lg text-center">
                          <p className="text-xl font-semibold text-foreground">{batchStats?.total || 0}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="p-3 bg-status-confirmed-bg/30 rounded-lg text-center">
                          <p className="text-xl font-semibold text-status-confirmed">{batchStats?.confirmed || 0}</p>
                          <p className="text-xs text-muted-foreground">Confirmed</p>
                        </div>
                        <div className="p-3 bg-status-soft-bg/30 rounded-lg text-center">
                          <p className="text-xl font-semibold text-status-soft">{batchStats?.soft_committed || 0}</p>
                          <p className="text-xs text-muted-foreground">Soft</p>
                        </div>
                        <div className="p-3 bg-status-forecast-bg/30 rounded-lg text-center">
                          <p className="text-xl font-semibold text-status-forecast">{batchStats?.forecast || 0}</p>
                          <p className="text-xs text-muted-foreground">Forecast</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Behavior Signals */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Behavior Signals</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-secondary/50 rounded-lg text-center">
                        <CheckCircle2 className="w-4 h-4 text-status-confirmed mx-auto mb-1" />
                        <p className="text-lg font-semibold text-foreground">{selectedFarmer.total_confirmations}</p>
                        <p className="text-xs text-muted-foreground">Confirmations</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg text-center">
                        <XCircle className="w-4 h-4 text-destructive mx-auto mb-1" />
                        <p className="text-lg font-semibold text-foreground">{selectedFarmer.total_declines}</p>
                        <p className="text-xs text-muted-foreground">Declines</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-lg text-center">
                        <AlertCircle className="w-4 h-4 text-status-forecast mx-auto mb-1" />
                        <p className="text-lg font-semibold text-foreground">{selectedFarmer.missed_updates}</p>
                        <p className="text-xs text-muted-foreground">Missed Updates</p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alerts */}
                  {hasWarningSignals(selectedFarmer) && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Attention Required</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This farmer has behavioral signals that may require review.
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Grading Actions */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Grading Controls</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canPromote(selectedFarmer.grading)}
                        onClick={() => openGradingDialog('promote')}
                        className="flex-1"
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Promote
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canDemote(selectedFarmer.grading)}
                        onClick={() => openGradingDialog('demote')}
                        className="flex-1"
                      >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Downgrade
                      </Button>
                    </div>
                  </div>

                  {/* Restriction Control */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Access Control</p>
                    <Button
                      variant={selectedFarmer.is_restricted ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setRestrictionDialogOpen(true)}
                    >
                      {selectedFarmer.is_restricted ? (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Restore Pool Access
                        </>
                      ) : (
                        <>
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Restrict Pool Access
                        </>
                      )}
                    </Button>
                    {selectedFarmer.is_restricted && selectedFarmer.restriction_reason && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reason: {selectedFarmer.restriction_reason}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Activity Log */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Activity Log</p>
                    {logLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : activityLog?.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No activity recorded</p>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-auto">
                        {activityLog?.map(log => (
                          <div key={log.id} className="p-2 bg-secondary/30 rounded text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-foreground capitalize">
                                {log.action_type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-muted-foreground">
                                {format(new Date(log.created_at), 'MMM d, HH:mm')}
                              </span>
                            </div>
                            {log.previous_value && log.new_value && (
                              <p className="text-muted-foreground">
                                {log.previous_value} → {log.new_value}
                              </p>
                            )}
                            {log.note && (
                              <p className="text-muted-foreground mt-1 italic">"{log.note}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grading Change Dialog */}
      <Dialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {gradingAction === 'promote' ? 'Promote Farmer' : 'Downgrade Farmer'}
            </DialogTitle>
            <DialogDescription>
              {selectedFarmer && (
                <>
                  Change grading from <strong>{getGradingLabel(selectedFarmer.grading)}</strong> to{' '}
                  <strong>{getGradingLabel(getNextGrading(selectedFarmer.grading, gradingAction === 'promote' ? 'up' : 'down'))}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Internal Note (required for audit)
            </label>
            <Textarea
              placeholder="Reason for this grading change..."
              value={gradingNote}
              onChange={(e) => setGradingNote(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGradingChange}
              disabled={!gradingNote.trim() || updateGrading.isPending}
            >
              {updateGrading.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restriction Dialog */}
      <Dialog open={restrictionDialogOpen} onOpenChange={setRestrictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFarmer?.is_restricted ? 'Restore Pool Access' : 'Restrict Pool Access'}
            </DialogTitle>
            <DialogDescription>
              {selectedFarmer?.is_restricted
                ? 'This will restore the farmer\'s ability to receive pool invitations.'
                : 'This will temporarily prevent the farmer from receiving pool invitations.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {!selectedFarmer?.is_restricted && (
              <div>
                <label className="text-sm font-medium text-foreground">Restriction Reason</label>
                <Input
                  placeholder="e.g., Repeated declines, Outdated data..."
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">
                Internal Note (required for audit)
              </label>
              <Textarea
                placeholder="Additional context for this action..."
                value={restrictionNote}
                onChange={(e) => setRestrictionNote(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestrictionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestrictionToggle}
              disabled={!restrictionNote.trim() || toggleRestriction.isPending}
              variant={selectedFarmer?.is_restricted ? 'default' : 'destructive'}
            >
              {toggleRestriction.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedFarmer?.is_restricted ? 'Restore Access' : 'Apply Restriction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
