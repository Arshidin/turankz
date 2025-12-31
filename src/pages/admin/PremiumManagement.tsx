import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, TrendingUp, Clock, BarChart3, Edit2, History, Info, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { 
  usePremiumSettings, 
  useUpdatePremium, 
  usePremiumChangeLog, 
  useTogglePremiumActive,
  PremiumSetting,
  PremiumType,
  PREMIUM_TYPE_LABELS,
  PREMIUM_TYPE_DESCRIPTIONS
} from '@/hooks/usePremiums';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PREMIUM_TABS: { type: PremiumType; icon: React.ReactNode; title: string }[] = [
  { type: 'standard', icon: <Award className="h-4 w-4" />, title: 'Standard Compliance' },
  { type: 'reliability', icon: <TrendingUp className="h-4 w-4" />, title: 'Reliability' },
  { type: 'predictability', icon: <Clock className="h-4 w-4" />, title: 'Predictability' },
  { type: 'volume_consistency', icon: <BarChart3 className="h-4 w-4" />, title: 'Volume Consistency' },
];

const MAX_PREMIUM_VALUE = 1000; // Maximum premium value in ₸/kg

export default function PremiumManagement() {
  const { data: premiumSettings, isLoading } = usePremiumSettings();
  const { data: changeLog } = usePremiumChangeLog();
  const updatePremium = useUpdatePremium();
  const toggleActive = useTogglePremiumActive();
  
  // Get current user info for audit trail
  const { user } = useAuthContext();
  const { roleName } = useRole();
  const adminName = user?.email ? `${roleName} (${user.email.split('@')[0]})` : roleName || 'Admin';
  
  const [editingPremium, setEditingPremium] = useState<PremiumSetting | null>(null);
  const [newValue, setNewValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; action: () => void }>({ show: false, action: () => {} });
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [premiumTypeFilter, setPremiumTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'level_name' | 'premium_value'>('premium_value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getPremiumsByType = (type: PremiumType) => 
    premiumSettings?.filter(p => p.premium_type === type) || [];

  const handleEdit = (premium: PremiumSetting) => {
    setEditingPremium(premium);
    setNewValue(premium.premium_value.toString());
    setChangeReason('');
  };

  const handleSave = async () => {
    if (!editingPremium || !changeReason.trim()) {
      toast.error('Please provide a reason for the change');
      return;
    }

    const value = parseInt(newValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid premium value');
      return;
    }

    if (value > MAX_PREMIUM_VALUE) {
      toast.error(`Premium value cannot exceed ${MAX_PREMIUM_VALUE} ₸/kg`);
      return;
    }

    // Check if change is significant (>50% or >50 ₸/kg)
    const change = Math.abs(value - editingPremium.premium_value);
    const changePercent = editingPremium.premium_value > 0 
      ? (change / editingPremium.premium_value) * 100 
      : 100;
    
    const needsConfirmation = changePercent > 50 || change > 50;

    if (needsConfirmation) {
      setConfirmDialog({
        show: true,
        action: async () => {
          try {
            await updatePremium.mutateAsync({
              id: editingPremium.id,
              premium_value: value,
              previous_value: editingPremium.premium_value,
              changed_by: adminName,
              change_reason: changeReason,
            });
            toast.success('Premium value updated successfully');
            setEditingPremium(null);
            setConfirmDialog({ show: false, action: () => {} });
          } catch (error) {
            toast.error('Failed to update premium value');
          }
        },
      });
    } else {
      try {
        await updatePremium.mutateAsync({
          id: editingPremium.id,
          premium_value: value,
          previous_value: editingPremium.premium_value,
          changed_by: adminName,
          change_reason: changeReason,
        });
        toast.success('Premium value updated successfully');
        setEditingPremium(null);
      } catch (error) {
        toast.error('Failed to update premium value');
      }
    }
  };

  const handleToggleActive = async (premium: PremiumSetting) => {
    try {
      await toggleActive.mutateAsync({
        id: premium.id,
        is_active: !premium.is_active,
        changed_by: adminName,
      });
      toast.success(`Premium ${premium.is_active ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle premium status');
    }
  };

  const getPremiumName = (id: string) => {
    return premiumSettings?.find(p => p.id === id)?.level_name || 'Unknown';
  };

  const getPremiumType = (id: string) => {
    const premium = premiumSettings?.find(p => p.id === id);
    return premium ? PREMIUM_TYPE_LABELS[premium.premium_type] : 'Unknown';
  };

  // Filter and sort premiums (function that takes type)
  const getFilteredAndSortedPremiums = (type: PremiumType) => {
    const premiums = getPremiumsByType(type);
    
    let filtered = premiums.filter((premium) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          premium.level_name.toLowerCase().includes(query) ||
          premium.description?.toLowerCase().includes(query) ||
          premium.premium_value.toString().includes(query) ||
          premium.criteria?.some(c => c.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'level_name':
          aValue = a.level_name;
          bValue = b.level_name;
          break;
        case 'premium_value':
          aValue = a.premium_value;
          bValue = b.premium_value;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
    
    return filtered;
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Filter and sort change log
  const filteredChangeLog = useMemo(() => {
    if (!changeLog) return [];
    
    let filtered = changeLog.filter((log) => {
      if (premiumTypeFilter !== 'all') {
        const premium = premiumSettings?.find(p => p.id === log.premium_setting_id);
        if (!premium || premium.premium_type !== premiumTypeFilter) return false;
      }
      return true;
    });
    
    return filtered;
  }, [changeLog, premiumSettings, premiumTypeFilter]);

  const renderPremiumTable = (type: PremiumType) => {
    const premiums = getFilteredAndSortedPremiums(type);
    const allPremiums = getPremiumsByType(type);
    const typeLabel = PREMIUM_TYPE_LABELS[type];
    const typeDescription = PREMIUM_TYPE_DESCRIPTIONS[type];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{typeLabel} Premium</CardTitle>
          <CardDescription>{typeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search premiums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Enabled</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 font-medium -ml-2"
                    onClick={() => handleSort('level_name')}
                  >
                    Level
                    {getSortIcon('level_name')}
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 font-medium -mr-2"
                    onClick={() => handleSort('premium_value')}
                  >
                    Premium
                    {getSortIcon('premium_value')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : premiums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {allPremiums.length === 0 
                      ? 'No premium levels configured'
                      : 'No premiums match the current search'}
                  </TableCell>
                </TableRow>
              ) : (
                premiums.map((premium) => (
                  <TableRow key={premium.id} className={!premium.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <Switch
                        checked={premium.is_active}
                        onCheckedChange={() => handleToggleActive(premium)}
                        disabled={toggleActive.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={premium.is_active ? 'default' : 'secondary'}>
                        {premium.level_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {premium.description}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {premium.criteria?.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {premium.premium_value > 0 ? `+${premium.premium_value}` : premium.premium_value} ₸/kg
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(premium)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Premium Rules Engine"
          description="Configure premium rules that reward desired market behavior"
        />

        <Tabs defaultValue="standard" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            {PREMIUM_TABS.map(tab => (
              <TabsTrigger key={tab.type} value={tab.type} className="gap-2">
                {tab.icon}
                {tab.title}
              </TabsTrigger>
            ))}
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Change History
            </TabsTrigger>
          </TabsList>

          {PREMIUM_TABS.map(tab => (
            <TabsContent key={tab.type} value={tab.type}>
              {renderPremiumTable(tab.type)}
            </TabsContent>
          ))}

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change History</CardTitle>
                <CardDescription>
                  Audit trail of all premium value changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter by Premium Type */}
                <div className="mb-4">
                  <Select value={premiumTypeFilter} onValueChange={setPremiumTypeFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Premium Types</SelectItem>
                      {PREMIUM_TABS.map(tab => (
                        <SelectItem key={tab.type} value={tab.type}>
                          {tab.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Premium Type</TableHead>
                      <TableHead>Premium Level</TableHead>
                      <TableHead>Previous Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChangeLog.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {changeLog?.length === 0 
                            ? 'No changes recorded yet'
                            : 'No changes match the current filter'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredChangeLog.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getPremiumType(log.premium_setting_id)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getPremiumName(log.premium_setting_id)}</TableCell>
                          <TableCell>{log.previous_value ?? 'N/A'} ₸/kg</TableCell>
                          <TableCell className="font-medium">{log.new_value ?? 'N/A'} ₸/kg</TableCell>
                          <TableCell>{log.changed_by || 'Unknown'}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.change_reason || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-dashed">
          <CardContent className="flex items-start gap-3 pt-4">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Premium Rules Engine Overview</p>
              <ul className="space-y-1">
                <li>• <strong>Standard Compliance</strong> – Batch fully matches price grid criteria</li>
                <li>• <strong>Predictability</strong> – Batch confirmed before lock_date with no post-confirmation edits</li>
                <li>• <strong>Volume Consistency</strong> – Multiple fulfilled batches over time (admin-defined thresholds)</li>
                <li>• <strong>Reliability</strong> – Based on farmer confirmation behavior and history</li>
                <li className="pt-2">Premiums are additive: <strong>Total = Standard + Predictability + Volume + Reliability</strong></li>
                <li>• Toggle the switch to enable/disable each premium level</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPremium} onOpenChange={() => setEditingPremium(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Premium Value</DialogTitle>
            <DialogDescription>
              Update the premium value for {editingPremium?.level_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Premium Value (₸/kg)</Label>
              <Input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter premium value"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason for Change *</Label>
              <Textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Explain why this premium value is being changed..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPremium(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={
                updatePremium.isPending || 
                !newValue || 
                isNaN(parseInt(newValue)) || 
                parseInt(newValue) < 0 || 
                parseInt(newValue) > MAX_PREMIUM_VALUE ||
                !changeReason.trim()
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.show} onOpenChange={(open) => !open && setConfirmDialog({ show: false, action: () => {} })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Significant Change</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to make a significant change to the premium value (more than 50% or 50 ₸/kg).
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}