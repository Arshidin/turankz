import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoolRequests, type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { useMatchingWindows } from '@/hooks/useMatchingWindows';
import { useMpks } from '@/hooks/useMpks';
import { PoolRequestDetailSheet } from './PoolRequestDetailSheet';
import { 
  Search, 
  Filter, 
  X,
  Calendar,
  Building2,
  Target,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';

type DeliveryPeriod = 'short_term' | 'mid_term' | 'long_term';

interface PoolRequestFilters {
  search: string;
  matchingWindowId: string;
  deliveryPeriod: string;
  status: string;
  mpkId: string;
  lockStatus: string;
}

const initialFilters: PoolRequestFilters = {
  search: '',
  matchingWindowId: 'all',
  deliveryPeriod: 'all',
  status: 'all',
  mpkId: 'all',
  lockStatus: 'all',
};

const getStatusBadge = (status: PoolRequestStatus) => {
  switch (status) {
    case 'fulfilled':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Fulfilled</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Partial</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500/10 text-blue-600 border-0">Submitted</Badge>;
    case 'matching':
      return <Badge className="bg-violet-500/10 text-violet-600 border-0">Matching</Badge>;
    case 'draft':
      return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
    case 'closed':
      return <Badge className="bg-slate-500/10 text-slate-600 border-0">Closed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDeliveryPeriodLabel = (period: DeliveryPeriod | null) => {
  switch (period) {
    case 'short_term':
      return 'Short Term';
    case 'mid_term':
      return 'Mid Term';
    case 'long_term':
      return 'Long Term';
    default:
      return '—';
  }
};

const getLockStatusBadge = (request: PoolRequest) => {
  // Request is "locked" if status is fulfilled, closed, or cancelled
  const isLocked = ['fulfilled', 'closed', 'cancelled'].includes(request.status);
  
  if (isLocked) {
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
        <Lock className="h-3 w-3" />
        Locked
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1">
      <Unlock className="h-3 w-3" />
      Open
    </Badge>
  );
};

export function PoolRequestsListView() {
  const [filters, setFilters] = useState<PoolRequestFilters>(initialFilters);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const { data: requests, isLoading: requestsLoading } = usePoolRequests();
  const { data: matchingWindows } = useMatchingWindows();
  const { data: mpks } = useMpks();

  // Get unique MPKs from requests
  const uniqueMpks = useMemo(() => {
    if (!requests) return [];
    const mpkMap = new Map<string, string>();
    requests.forEach(r => {
      if (!mpkMap.has(r.mpk_id)) {
        mpkMap.set(r.mpk_id, r.mpk_name);
      }
    });
    return Array.from(mpkMap.entries()).map(([id, name]) => ({ id, name }));
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    return requests.filter(request => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          request.request_number.toLowerCase().includes(searchLower) ||
          request.mpk_name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && request.status !== filters.status) {
        return false;
      }

      // Delivery period filter
      if (filters.deliveryPeriod !== 'all' && request.target_delivery_period !== filters.deliveryPeriod) {
        return false;
      }

      // MPK filter
      if (filters.mpkId !== 'all' && request.mpk_id !== filters.mpkId) {
        return false;
      }

      // Lock status filter
      if (filters.lockStatus !== 'all') {
        const isLocked = ['fulfilled', 'closed', 'cancelled'].includes(request.status);
        if (filters.lockStatus === 'locked' && !isLocked) return false;
        if (filters.lockStatus === 'open' && isLocked) return false;
      }

      // Matching window filter - would need to join with pool_matches to implement properly
      // For now, skip if filter is set to 'all'
      
      return true;
    });
  }, [requests, filters]);

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.matchingWindowId !== 'all' ||
    filters.deliveryPeriod !== 'all' ||
    filters.status !== 'all' ||
    filters.mpkId !== 'all' ||
    filters.lockStatus !== 'all';

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDetailSheetOpen(true);
  };

  const selectedRequest = requests?.find(r => r.id === selectedRequestId) || null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs gap-1">
                <X className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="relative col-span-2 md:col-span-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID or MPK..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-8 h-9"
              />
            </div>

            {/* Matching Window */}
            <Select
              value={filters.matchingWindowId}
              onValueChange={(value) => setFilters(f => ({ ...f, matchingWindowId: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Matching Window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Windows</SelectItem>
                {matchingWindows?.map(window => (
                  <SelectItem key={window.id} value={window.id}>
                    {window.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delivery Period */}
            <Select
              value={filters.deliveryPeriod}
              onValueChange={(value) => setFilters(f => ({ ...f, deliveryPeriod: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Delivery Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="short_term">Short Term</SelectItem>
                <SelectItem value="mid_term">Mid Term</SelectItem>
                <SelectItem value="long_term">Long Term</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* MPK */}
            <Select
              value={filters.mpkId}
              onValueChange={(value) => setFilters(f => ({ ...f, mpkId: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="MPK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MPKs</SelectItem>
                {uniqueMpks.map(mpk => (
                  <SelectItem key={mpk.id} value={mpk.id}>
                    {mpk.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lock Status */}
            <Select
              value={filters.lockStatus}
              onValueChange={(value) => setFilters(f => ({ ...f, lockStatus: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Lock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredRequests.length}</span> of{' '}
          <span className="font-medium text-foreground">{requests?.length || 0}</span> requests
        </span>
      </div>

      {/* Table */}
      <Card>
        <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Request ID</TableHead>
                <TableHead>MPK</TableHead>
                <TableHead>Matching Window</TableHead>
                <TableHead>Delivery Period</TableHead>
                <TableHead className="text-right">Requested</TableHead>
                <TableHead className="text-right">Matched</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lock Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Target className="h-8 w-8 mb-2 opacity-50" />
                      <p>No pool requests found</p>
                      {hasActiveFilters && (
                        <p className="text-xs mt-1">Try adjusting your filters</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map(request => (
                  <TableRow 
                    key={request.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(request.id)}
                  >
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {request.mpk_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>{getDeliveryPeriodLabel(request.target_delivery_period)}</TableCell>
                    <TableCell className="text-right font-medium">{request.required_volume}</TableCell>
                    <TableCell className="text-right">
                      <span className={request.matched_volume > 0 ? 'text-status-confirmed font-medium' : 'text-muted-foreground'}>
                        {request.matched_volume}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{getLockStatusBadge(request)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(request.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Detail Sheet */}
      <PoolRequestDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        request={selectedRequest}
      />
    </div>
  );
}
