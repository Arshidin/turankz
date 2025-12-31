import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  usePriceGridVersions,
  usePriceGridCells,
  useCreatePriceGridVersion,
  useActivatePriceGridVersion,
  useUpsertPriceGridCell,
  useDeletePriceGridCell,
  useDuplicatePriceGridVersion,
  AGE_CATEGORIES,
  SEX_OPTIONS,
  BREED_GROUPS,
  type PriceGridVersion,
  type PriceGridCell,
} from '@/hooks/usePriceGrid';
import { PricingGovernanceAudit } from '@/components/admin/PricingGovernanceAudit';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  CheckCircle2,
  Copy,
  Pencil,
  Trash2,
  Grid3X3,
  Calendar,
  Power,
  ShieldCheck,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';

function VersionCard({
  version,
  isSelected,
  onSelect,
  onActivate,
  onDuplicate,
}: {
  version: PriceGridVersion;
  isSelected: boolean;
  onSelect: () => void;
  onActivate: () => void;
  onDuplicate: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{version.version_name}</CardTitle>
          {version.is_active && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Effective: {format(parseISO(version.effective_date), 'MMM d, yyyy')}
          </div>
          {version.description && (
            <p className="line-clamp-2">{version.description}</p>
          )}
        </div>
        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          {!version.is_active && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onActivate}>
              <Power className="h-3 w-3 mr-1" />
              Activate
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDuplicate}>
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateVersionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const createVersion = useCreatePriceGridVersion();

  const handleSubmit = () => {
    if (!name.trim() || !effectiveDate) return;
    createVersion.mutate(
      {
        versionName: name.trim(),
        description: description.trim() || undefined,
        effectiveDate,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setName('');
          setDescription('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Reference Grid Version</DialogTitle>
          <DialogDescription>
            Create a new version to define indicative reference pricing cells
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version Name *</Label>
            <Input
              id="version-name"
              placeholder="e.g., Q1 2025 Prices"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective Date *</Label>
            <Input
              id="effective-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this version..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !effectiveDate || createVersion.isPending}
          >
            {createVersion.isPending ? 'Creating...' : 'Create Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CellEditor({
  versionId,
  cell,
  onClose,
}: {
  versionId: string;
  cell?: PriceGridCell;
  onClose: () => void;
}) {
  const [ageCategory, setAgeCategory] = useState(cell?.age_category || '');
  const [sex, setSex] = useState(cell?.sex || '');
  const [weightMin, setWeightMin] = useState(cell?.weight_min?.toString() || '');
  const [weightMax, setWeightMax] = useState(cell?.weight_max?.toString() || '');
  const [breedGroup, setBreedGroup] = useState(cell?.breed_group || '__all__');
  const [basePrice, setBasePrice] = useState(cell?.base_price?.toString() || '');
  const [notes, setNotes] = useState(cell?.notes || '');
  const [changeReason, setChangeReason] = useState('');

  const upsertCell = useUpsertPriceGridCell();

  const handleSubmit = () => {
    if (!ageCategory || !sex || !weightMin || !weightMax || !basePrice || !changeReason.trim()) return;

    // Validation
    const weightMinNum = parseInt(weightMin, 10);
    const weightMaxNum = parseInt(weightMax, 10);
    const basePriceNum = parseInt(basePrice, 10);

    // Validate weight range
    if (isNaN(weightMinNum) || isNaN(weightMaxNum) || weightMinNum >= weightMaxNum) {
      // Error will be shown by disabled button state
      return;
    }

    // Validate price is positive
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      // Error will be shown by disabled button state
      return;
    }

    upsertCell.mutate(
      {
        versionId,
        cell: {
          age_category: ageCategory,
          sex,
          weight_min: weightMinNum,
          weight_max: weightMaxNum,
          breed_group: breedGroup === '__all__' ? null : breedGroup,
          base_price: basePriceNum,
          notes: notes || null,
        },
        changeReason: changeReason.trim(),
        previousPrice: cell?.base_price,
      },
      { onSuccess: onClose }
    );
  };

  // Validation state
  const weightMinNum = parseInt(weightMin, 10);
  const weightMaxNum = parseInt(weightMax, 10);
  const basePriceNum = parseInt(basePrice, 10);
  const isValidWeight = !isNaN(weightMinNum) && !isNaN(weightMaxNum) && weightMinNum < weightMaxNum && weightMinNum > 0 && weightMaxNum > 0;
  const isValidPrice = !isNaN(basePriceNum) && basePriceNum > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cell ? 'Update Reference Benchmark' : 'Add Reference Price Cell'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age Category *</Label>
              <Select value={ageCategory} onValueChange={setAgeCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {AGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sex *</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight Min (kg) *</Label>
              <Input
                type="number"
                min="1"
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
                placeholder="e.g., 180"
                className={weightMin && weightMax && (!isValidWeight) ? 'border-destructive' : ''}
              />
              {weightMin && weightMax && (!isValidWeight) && (
                <p className="text-xs text-destructive">Min must be less than max and both must be positive</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Weight Max (kg) *</Label>
              <Input
                type="number"
                min="1"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
                placeholder="e.g., 260"
                className={weightMin && weightMax && (!isValidWeight) ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Breed Group (optional)</Label>
            <Select value={breedGroup} onValueChange={setBreedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All breeds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All breeds</SelectItem>
                {BREED_GROUPS.map((bg) => (
                  <SelectItem key={bg.value} value={bg.value}>
                    {bg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference Price (₸/kg) *</Label>
            <Input
              type="number"
              min="1"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g., 1200"
              className={basePrice && (!isValidPrice) ? 'border-destructive' : ''}
            />
            {basePrice && (!isValidPrice) && (
              <p className="text-xs text-destructive">Price must be a positive number</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          <div className="space-y-2">
            <Label>Reason for Change *</Label>
            <Textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Explain why this price is being set or changed..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !ageCategory ||
              !sex ||
              !weightMin ||
              !weightMax ||
              !basePrice ||
              !changeReason.trim() ||
              !isValidWeight ||
              !isValidPrice ||
              upsertCell.isPending
            }
          >
            {upsertCell.isPending ? 'Saving...' : 'Save Cell'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PriceGridManagement() {
  const [activeTab, setActiveTab] = useState<'grid' | 'governance'>('grid');
  const { data: versions, isLoading: loadingVersions } = usePriceGridVersions();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const { data: cells, isLoading: loadingCells } = usePriceGridCells(selectedVersionId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCell, setEditingCell] = useState<PriceGridCell | null>(null);
  const [showAddCell, setShowAddCell] = useState(false);
  const [activateConfirm, setActivateConfirm] = useState<string | null>(null);
  const [activationReason, setActivationReason] = useState('');
  const [duplicateVersion, setDuplicateVersion] = useState<PriceGridVersion | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateDate, setDuplicateDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [sexFilter, setSexFilter] = useState<string>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'age_category' | 'sex' | 'weight_min' | 'base_price'>('age_category');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const activateVersion = useActivatePriceGridVersion();
  const deleteCell = useDeletePriceGridCell();
  const duplicate = useDuplicatePriceGridVersion();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedVersion = versions?.find((v) => v.id === selectedVersionId);

  const handleActivate = () => {
    if (!activateConfirm || !activationReason.trim()) return;
    activateVersion.mutate(
      { versionId: activateConfirm, activationReason: activationReason.trim() },
      {
        onSuccess: () => {
          setActivateConfirm(null);
          setActivationReason('');
        },
      }
    );
  };

  const handleDuplicate = () => {
    if (!duplicateVersion || !duplicateName.trim()) return;
    duplicate.mutate(
      {
        sourceVersionId: duplicateVersion.id,
        newVersionName: duplicateName.trim(),
        effectiveDate: duplicateDate,
      },
      {
        onSuccess: () => {
          setDuplicateVersion(null);
          setDuplicateName('');
        },
      }
    );
  };

  const getAgeCategoryLabel = (value: string) =>
    AGE_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getSexLabel = (value: string) =>
    SEX_OPTIONS.find((s) => s.value === value)?.label || value;

  const getBreedGroupLabel = (value: string | null) =>
    value ? BREED_GROUPS.find((b) => b.value === value)?.label || value : 'All Breeds';

  // Filter and sort cells
  const filteredAndSortedCells = useMemo(() => {
    if (!cells) return [];
    
    let filtered = cells.filter((cell) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          getAgeCategoryLabel(cell.age_category).toLowerCase().includes(query) ||
          getSexLabel(cell.sex).toLowerCase().includes(query) ||
          getBreedGroupLabel(cell.breed_group).toLowerCase().includes(query) ||
          cell.base_price.toString().includes(query) ||
          `${cell.weight_min}-${cell.weight_max}`.includes(query);
        if (!matchesSearch) return false;
      }
      
      // Age filter
      if (ageFilter !== 'all' && cell.age_category !== ageFilter) return false;
      
      // Sex filter
      if (sexFilter !== 'all' && cell.sex !== sexFilter) return false;
      
      // Breed filter
      if (breedFilter !== 'all') {
        if (breedFilter === '__all__' && cell.breed_group !== null) return false;
        if (breedFilter !== '__all__' && cell.breed_group !== breedFilter) return false;
      }
      
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'age_category':
          aValue = getAgeCategoryLabel(a.age_category);
          bValue = getAgeCategoryLabel(b.age_category);
          break;
        case 'sex':
          aValue = getSexLabel(a.sex);
          bValue = getSexLabel(b.sex);
          break;
        case 'weight_min':
          aValue = a.weight_min;
          bValue = b.weight_min;
          break;
        case 'base_price':
          aValue = a.base_price;
          bValue = b.base_price;
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
  }, [cells, searchQuery, ageFilter, sexFilter, breedFilter, sortField, sortDirection]);

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

  return (
    <MainLayout>
      <PageHeader
        title="Reference Price Grid Management"
        description="Create, edit, and activate indicative reference price grid versions"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Version
          </Button>
        }
      />

      {/* Mandatory Disclaimer for Admin */}
      <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Reference prices are indicative market benchmarks only. TURAN does not set, enforce, or guarantee transaction prices. All prices are market-oriented and participation is voluntary.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'grid' | 'governance')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Reference Grid
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Governance & Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Versions List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Versions</h3>
          {loadingVersions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : versions && versions.length > 0 ? (
            <div className="space-y-2">
              {versions.map((version) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  isSelected={selectedVersionId === version.id}
                  onSelect={() => setSelectedVersionId(version.id)}
                  onActivate={() => setActivateConfirm(version.id)}
                  onDuplicate={() => {
                    setDuplicateVersion(version);
                    setDuplicateName(`${version.version_name} (Copy)`);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No versions created yet. Create your first reference grid version.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cells Editor */}
        <div className="lg:col-span-2">
          {selectedVersionId && selectedVersion ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="h-5 w-5" />
                      {selectedVersion.version_name}
                    </CardTitle>
                    <CardDescription>
                      {filteredAndSortedCells.length} of {cells?.length || 0} reference price cells
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowAddCell(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Cell
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCells ? (
                  <Skeleton className="h-48" />
                ) : cells && cells.length > 0 ? (
                  <div className="space-y-4">
                    {/* Filters and Search */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search cells..."
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
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={ageFilter} onValueChange={setAgeFilter}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ages</SelectItem>
                            {AGE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={sexFilter} onValueChange={setSexFilter}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Sex" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sex</SelectItem>
                            {SEX_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={breedFilter} onValueChange={setBreedFilter}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Breed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Breeds</SelectItem>
                            <SelectItem value="__all__">All Breeds (generic)</SelectItem>
                            {BREED_GROUPS.map((bg) => (
                              <SelectItem key={bg.value} value={bg.value}>
                                {bg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 font-medium -ml-2"
                                onClick={() => handleSort('age_category')}
                              >
                                Age
                                {getSortIcon('age_category')}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 font-medium -ml-2"
                                onClick={() => handleSort('sex')}
                              >
                                Sex
                                {getSortIcon('sex')}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 font-medium -ml-2"
                                onClick={() => handleSort('weight_min')}
                              >
                                Weight
                                {getSortIcon('weight_min')}
                              </Button>
                            </TableHead>
                            <TableHead>Breed</TableHead>
                            <TableHead className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 font-medium -mr-2"
                                onClick={() => handleSort('base_price')}
                              >
                                Ref. Price
                                {getSortIcon('base_price')}
                              </Button>
                            </TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedCells.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No cells match the current filters
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAndSortedCells.map((cell) => (
                              <TableRow key={cell.id}>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {getAgeCategoryLabel(cell.age_category)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getSexLabel(cell.sex)}</TableCell>
                                <TableCell className="font-mono text-sm">
                                  {cell.weight_min}–{cell.weight_max} kg
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {getBreedGroupLabel(cell.breed_group)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {cell.base_price.toLocaleString()} ₸
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => setEditingCell(cell)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteConfirm(cell.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-3">No reference price cells defined yet.</p>
                    <Button variant="outline" onClick={() => setShowAddCell(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Cell
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a version to view and edit reference price cells</p>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
        </TabsContent>

        <TabsContent value="governance">
          <PricingGovernanceAudit />
        </TabsContent>
      </Tabs>
      <CreateVersionDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {/* Add/Edit Cell Dialog */}
      {(showAddCell || editingCell) && selectedVersionId && (
        <CellEditor
          versionId={selectedVersionId}
          cell={editingCell || undefined}
          onClose={() => {
            setShowAddCell(false);
            setEditingCell(null);
          }}
        />
      )}

      {/* Activate Confirmation */}
      <Dialog 
        open={!!activateConfirm} 
        onOpenChange={(open) => {
          if (!open) {
            setActivateConfirm(null);
            setActivationReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Reference Grid (Indicative)?</DialogTitle>
            <DialogDescription>
              This will deactivate any currently active reference grid and make this version the
              active indicative reference visible to all users. Reference prices are market benchmarks only.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Reason for Activation *</Label>
            <Textarea
              value={activationReason}
              onChange={(e) => setActivationReason(e.target.value)}
              placeholder="Explain why this version is being activated..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateConfirm(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleActivate}
              disabled={!activationReason.trim() || activateVersion.isPending}
            >
              {activateVersion.isPending ? 'Activating...' : 'Activate Reference Grid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Cell Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reference Price Cell?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The cell will be permanently removed from this version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  deleteCell.mutate({ cellId: deleteConfirm });
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!duplicateVersion} onOpenChange={() => setDuplicateVersion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Reference Grid Version</DialogTitle>
            <DialogDescription>
              Create a copy of "{duplicateVersion?.version_name}" with all its reference price cells.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Version Name *</Label>
              <Input
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="e.g., Q2 2025 Prices"
              />
            </div>
            <div className="space-y-2">
              <Label>Effective Date *</Label>
              <Input
                type="date"
                value={duplicateDate}
                onChange={(e) => setDuplicateDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateVersion(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicateName.trim() || duplicate.isPending}
            >
              {duplicate.isPending ? 'Duplicating...' : 'Duplicate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
