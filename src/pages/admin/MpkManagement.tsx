import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
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
  useMpks,
  useMpkActivityLog,
  useUpdateMpkStatus,
  useToggleMpkRequestRestriction,
  useUpdateMpkMaxRequests,
  useMpkRequestStats,
  useMpkPoolRequests,
  useUpdateMpkRegistration,
  Mpk,
  MpkStatus,
  MpkRequestStats,
} from '@/hooks/useMpks';
import { PendingApplicationsCard } from '@/components/admin/PendingApplicationsCard';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Search,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  Power,
  PowerOff,
  FileText,
  TrendingDown,
  Clock,
  Loader2,
  MapPin,
  Target,
  Calendar,
} from 'lucide-react';

const getStatusBadge = (status: MpkStatus) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Active</Badge>;
    case 'restricted':
      return <Badge className="bg-status-forecast-bg text-status-forecast border-0">Restricted</Badge>;
    case 'inactive':
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  }
};

export default function MpkManagement() {
  const [selectedMpkId, setSelectedMpkId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<MpkStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [restrictionNote, setRestrictionNote] = useState('');
  const [restrictionReason, setRestrictionReason] = useState('');
  
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [newMaxRequests, setNewMaxRequests] = useState('5');
  const [limitNote, setLimitNote] = useState('');

  const { data: mpks, isLoading: mpksLoading } = useMpks();
  const { data: requestStats } = useMpkRequestStats();
  const { data: activityLog, isLoading: logLoading } = useMpkActivityLog(selectedMpkId);
  const updateStatus = useUpdateMpkStatus();
  const toggleRestriction = useToggleMpkRequestRestriction();
  const updateMaxRequests = useUpdateMpkMaxRequests();
  const updateRegistration = useUpdateMpkRegistration();

  const selectedMpk = mpks?.find(m => m.id === selectedMpkId);
  const { data: selectedMpkRequests } = useMpkPoolRequests(selectedMpk?.mpk_id || null);

  // Get stats for a specific MPK
  const getStatsForMpk = (mpkId: string): MpkRequestStats => {
    return requestStats?.[mpkId] || {
      mpk_id: mpkId,
      total: 0,
      fulfilled: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
    };
  };

  // Get unique regions for filter
  const allRegions = useMemo(() => {
    if (!mpks) return [];
    const regions = new Set<string>();
    mpks.forEach(m => m.intake_regions.forEach(r => regions.add(r)));
    return [...regions].sort();
  }, [mpks]);

  // Filter MPKs
  const filteredMpks = useMemo(() => {
    if (!mpks) return [];
    return mpks.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mpk_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchesRegion = filterRegion === 'all' || m.intake_regions.includes(filterRegion);
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [mpks, searchQuery, filterStatus, filterRegion]);

  // Calculate fulfillment rate from real data
  const getFulfillmentRate = (mpkId: string) => {
    const stats = getStatsForMpk(mpkId);
    if (stats.total === 0) return 0;
    return Math.round((stats.fulfilled / stats.total) * 100);
  };

  // Check if MPK has warning signals
  const hasWarningSignals = (mpk: Mpk) => {
    const stats = getStatsForMpk(mpk.mpk_id);
    const fulfillmentRate = getFulfillmentRate(mpk.mpk_id);
    const cancelRate = stats.total > 0 ? stats.cancelled / stats.total : 0;
    const daysSinceActivity = mpk.last_activity_at
      ? (Date.now() - new Date(mpk.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    return fulfillmentRate < 50 || cancelRate > 0.2 || mpk.request_changes_count > 10 || daysSinceActivity > 21;
  };

  const handleStatusChange = async () => {
    if (!selectedMpk || !targetStatus || !statusNote.trim()) return;
    
    await updateStatus.mutateAsync({
      mpkId: selectedMpk.id,
      newStatus: targetStatus,
      previousStatus: selectedMpk.status,
      note: statusNote,
    });
    
    setStatusDialogOpen(false);
    setStatusNote('');
    setTargetStatus(null);
  };

  const handleRestrictionToggle = async () => {
    if (!selectedMpk || !restrictionNote.trim()) return;
    
    await toggleRestriction.mutateAsync({
      mpkId: selectedMpk.id,
      isRestricted: !selectedMpk.is_request_restricted,
      reason: restrictionReason,
      note: restrictionNote,
    });
    
    setRestrictionDialogOpen(false);
    setRestrictionNote('');
    setRestrictionReason('');
  };

  const handleMaxRequestsUpdate = async () => {
    if (!selectedMpk || !limitNote.trim()) return;
    
    await updateMaxRequests.mutateAsync({
      mpkId: selectedMpk.id,
      maxRequests: parseInt(newMaxRequests),
      previousMax: selectedMpk.max_active_requests,
      note: limitNote,
    });
    
    setLimitDialogOpen(false);
    setLimitNote('');
  };

  const openStatusDialog = (status: MpkStatus) => {
    setTargetStatus(status);
    setStatusDialogOpen(true);
  };

  // Get selected MPK stats
  const selectedMpkStats = selectedMpk ? getStatsForMpk(selectedMpk.mpk_id) : null;

  return (
    <MainLayout>
      <PageHeader 
        title="MPK Management" 
        description="Control onboarding, visibility, and demand discipline of meat processing plants" 
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{mpks?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total MPKs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-status-confirmed">
              {mpks?.filter(m => m.status === 'active').length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-status-forecast">
              {mpks?.filter(m => m.status === 'restricted' || m.is_request_restricted).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Restricted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-destructive">
              {mpks?.filter(m => hasWarningSignals(m)).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Require Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Section */}
      <PendingApplicationsCard
        title="Pending MPK Applications"
        applications={(mpks || []).map(m => ({
          id: m.id,
          display_id: m.mpk_id,
          name: m.name,
          region: m.intake_regions.join(', '),
          email: null,
          created_at: m.created_at,
          registration_status: m.registration_status,
        }))}
        isLoading={mpksLoading}
        onActivate={async (id, note) => {
          const mpk = mpks?.find(m => m.id === id);
          if (!mpk) return;
          await updateRegistration.mutateAsync({
            mpkId: id,
            newStatus: 'active',
            previousStatus: mpk.registration_status,
            note,
          });
        }}
        onReject={async (id, note) => {
          const mpk = mpks?.find(m => m.id === id);
          if (!mpk) return;
          await updateRegistration.mutateAsync({
            mpkId: id,
            newStatus: 'rejected',
            previousStatus: mpk.registration_status,
            note,
          });
        }}
        isPending={updateRegistration.isPending}
      />

      {/* Helper Text */}
      <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Target className="w-4 h-4 inline mr-2" />
          MPK access and priority depend on demand consistency and fulfillment behavior. Changes are logged for audit purposes.
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: MPK List */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">MPK List</CardTitle>
                <span className="text-xs text-muted-foreground">{filteredMpks.length} MPKs</span>
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {allRegions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {mpksLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredMpks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No MPKs found for selected criteria.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterRegion('all');
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
                        <TableHead>MPK</TableHead>
                        <TableHead>Regions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Requests</TableHead>
                        <TableHead className="text-right">Fulfillment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMpks.map(mpk => {
                        const stats = getStatsForMpk(mpk.mpk_id);
                        const fulfillmentRate = getFulfillmentRate(mpk.mpk_id);
                        return (
                          <TableRow
                            key={mpk.id}
                            onClick={() => setSelectedMpkId(mpk.id)}
                            className={`cursor-pointer ${
                              mpk.id === selectedMpkId ? 'bg-primary/5' : ''
                            }`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {hasWarningSignals(mpk) && (
                                  <AlertTriangle className="w-4 h-4 text-destructive" />
                                )}
                                {mpk.is_request_restricted && (
                                  <Ban className="w-4 h-4 text-status-forecast" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">{mpk.name}</p>
                                  <p className="text-xs text-muted-foreground">{mpk.mpk_id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {mpk.intake_regions.slice(0, 2).join(', ')}
                              {mpk.intake_regions.length > 2 && ` +${mpk.intake_regions.length - 2}`}
                            </TableCell>
                            <TableCell>{getStatusBadge(mpk.status)}</TableCell>
                            <TableCell className="text-center text-sm">{stats.total}</TableCell>
                            <TableCell className="text-right">
                              <span className={`text-sm font-medium ${
                                fulfillmentRate >= 70 ? 'text-status-confirmed' : 
                                fulfillmentRate >= 50 ? 'text-status-soft' : 
                                'text-destructive'
                              }`}>
                                {stats.total > 0 ? `${fulfillmentRate}%` : '—'}
                              </span>
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
        </div>

        {/* Right Panel: Selected MPK Details */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">MPK Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedMpk ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Select an MPK to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* MPK Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedMpk.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMpk.mpk_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(selectedMpk.status)}
                      {selectedMpk.is_request_restricted && (
                        <Badge variant="outline" className="text-status-forecast border-status-forecast text-xs">
                          <Ban className="w-3 h-3 mr-1" />
                          Requests Blocked
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Summary */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intake Regions</p>
                        <p className="text-sm text-foreground">{selectedMpk.intake_regions.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Typical Volume</p>
                        <p className="text-sm text-foreground">
                          {selectedMpk.typical_volume_min && selectedMpk.typical_volume_max 
                            ? `${selectedMpk.typical_volume_min}–${selectedMpk.typical_volume_max} heads`
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Common Target Weeks</p>
                        <p className="text-sm text-foreground">
                          {selectedMpk.common_target_weeks?.join(', ') || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Demand Behavior - Real Stats */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Pool Request Stats (Live)</p>
                    {selectedMpkStats && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-status-confirmed-bg/30 rounded-lg text-center">
                          <CheckCircle2 className="w-4 h-4 text-status-confirmed mx-auto mb-1" />
                          <p className="text-lg font-semibold text-foreground">{selectedMpkStats.fulfilled}</p>
                          <p className="text-xs text-muted-foreground">Fulfilled</p>
                        </div>
                        <div className="p-3 bg-status-soft-bg/30 rounded-lg text-center">
                          <FileText className="w-4 h-4 text-status-soft mx-auto mb-1" />
                          <p className="text-lg font-semibold text-foreground">{selectedMpkStats.partial}</p>
                          <p className="text-xs text-muted-foreground">Partial</p>
                        </div>
                        <div className="p-3 bg-status-forecast-bg/30 rounded-lg text-center">
                          <Clock className="w-4 h-4 text-status-forecast mx-auto mb-1" />
                          <p className="text-lg font-semibold text-foreground">{selectedMpkStats.pending}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="p-3 bg-destructive/10 rounded-lg text-center">
                          <XCircle className="w-4 h-4 text-destructive mx-auto mb-1" />
                          <p className="text-lg font-semibold text-foreground">{selectedMpkStats.cancelled}</p>
                          <p className="text-xs text-muted-foreground">Cancelled</p>
                        </div>
                      </div>
                    )}
                    {selectedMpkStats && selectedMpkStats.total > 0 && (
                      <div className="mt-3 p-2 bg-secondary/30 rounded-lg">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Fulfillment Rate</span>
                          <span className={`font-medium ${
                            getFulfillmentRate(selectedMpk.mpk_id) >= 70 ? 'text-status-confirmed' : 
                            getFulfillmentRate(selectedMpk.mpk_id) >= 50 ? 'text-status-soft' : 
                            'text-destructive'
                          }`}>
                            {getFulfillmentRate(selectedMpk.mpk_id)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              getFulfillmentRate(selectedMpk.mpk_id) >= 70 ? 'bg-status-confirmed' : 
                              getFulfillmentRate(selectedMpk.mpk_id) >= 50 ? 'bg-status-soft' : 
                              'bg-destructive'
                            }`}
                            style={{ width: `${getFulfillmentRate(selectedMpk.mpk_id)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Requests */}
                  {selectedMpkRequests && selectedMpkRequests.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent Requests</p>
                        <div className="space-y-2 max-h-[120px] overflow-auto">
                          {selectedMpkRequests.slice(0, 5).map((req: any) => (
                            <div key={req.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded text-xs">
                              <div>
                                <span className="font-medium text-foreground">{req.request_number}</span>
                                <span className="text-muted-foreground ml-2">{req.required_volume} heads</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${
                                req.status === 'fulfilled' ? 'text-status-confirmed border-status-confirmed' :
                                req.status === 'partial' ? 'text-status-soft border-status-soft' :
                                req.status === 'pending' ? 'text-status-forecast border-status-forecast' :
                                'text-destructive border-destructive'
                              }`}>
                                {req.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Warning Alerts */}
                  {hasWarningSignals(selectedMpk) && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Demand Discipline Concern</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This MPK shows signals of inconsistent demand behavior.
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Control Actions */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Governance Controls</p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {selectedMpk.status !== 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog('active')}
                            className="flex-1"
                          >
                            <Power className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        {selectedMpk.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog('restricted')}
                            className="flex-1"
                          >
                            <TrendingDown className="w-4 h-4 mr-1" />
                            Restrict
                          </Button>
                        )}
                        {selectedMpk.status !== 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog('inactive')}
                            className="flex-1"
                          >
                            <PowerOff className="w-4 h-4 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                      <Button
                        variant={selectedMpk.is_request_restricted ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => setRestrictionDialogOpen(true)}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        {selectedMpk.is_request_restricted ? 'Enable Pool Requests' : 'Block Pool Requests'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setNewMaxRequests(selectedMpk.max_active_requests?.toString() || '5');
                          setLimitDialogOpen(true);
                        }}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Set Request Limit ({selectedMpk.max_active_requests || 'No limit'})
                      </Button>
                    </div>
                    {selectedMpk.restriction_reason && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Restriction reason: {selectedMpk.restriction_reason}
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
                      <div className="space-y-2 max-h-[150px] overflow-auto">
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change MPK Status</DialogTitle>
            <DialogDescription>
              {selectedMpk && targetStatus && (
                <>
                  Change status from <strong>{selectedMpk.status}</strong> to{' '}
                  <strong>{targetStatus}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Internal Note (required for audit)
            </label>
            <Textarea
              placeholder="Reason for this status change..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusChange}
              disabled={!statusNote.trim() || updateStatus.isPending}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Restriction Dialog */}
      <Dialog open={restrictionDialogOpen} onOpenChange={setRestrictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMpk?.is_request_restricted ? 'Enable Pool Requests' : 'Block Pool Requests'}
            </DialogTitle>
            <DialogDescription>
              {selectedMpk?.is_request_restricted
                ? 'This will allow the MPK to create new pool requests.'
                : 'This will prevent the MPK from creating new pool requests.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {!selectedMpk?.is_request_restricted && (
              <div>
                <label className="text-sm font-medium text-foreground">Restriction Reason</label>
                <Input
                  placeholder="e.g., Repeated cancellations, Low fulfillment..."
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
              variant={selectedMpk?.is_request_restricted ? 'default' : 'destructive'}
            >
              {toggleRestriction.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedMpk?.is_request_restricted ? 'Enable Requests' : 'Block Requests'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Max Requests Limit Dialog */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Maximum Active Requests</DialogTitle>
            <DialogDescription>
              Set a soft limit on how many active pool requests this MPK can have at once.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Maximum Active Requests</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newMaxRequests}
                onChange={(e) => setNewMaxRequests(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Internal Note (required for audit)
              </label>
              <Textarea
                placeholder="Reason for this limit change..."
                value={limitNote}
                onChange={(e) => setLimitNote(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLimitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMaxRequestsUpdate}
              disabled={!limitNote.trim() || updateMaxRequests.isPending}
            >
              {updateMaxRequests.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
