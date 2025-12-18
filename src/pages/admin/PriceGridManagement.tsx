import { useState } from 'react';
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
  const [breedGroup, setBreedGroup] = useState(cell?.breed_group || '');
  const [basePrice, setBasePrice] = useState(cell?.base_price?.toString() || '');
  const [notes, setNotes] = useState(cell?.notes || '');
  const [changeReason, setChangeReason] = useState('');

  const upsertCell = useUpsertPriceGridCell();

  const handleSubmit = () => {
    if (!ageCategory || !sex || !weightMin || !weightMax || !basePrice || !changeReason.trim()) return;

    upsertCell.mutate(
      {
        versionId,
        cell: {
          age_category: ageCategory,
          sex,
          weight_min: parseInt(weightMin, 10),
          weight_max: parseInt(weightMax, 10),
          breed_group: breedGroup || null,
          base_price: parseInt(basePrice, 10),
          notes: notes || null,
        },
        changeReason: changeReason.trim(),
        previousPrice: cell?.base_price,
      },
      { onSuccess: onClose }
    );
  };

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
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
                placeholder="e.g., 180"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight Max (kg) *</Label>
              <Input
                type="number"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
                placeholder="e.g., 260"
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
                <SelectItem value="">All breeds</SelectItem>
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
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g., 1200"
            />
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

  const activateVersion = useActivatePriceGridVersion();
  const deleteCell = useDeletePriceGridCell();
  const duplicate = useDuplicatePriceGridVersion();

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
                      {cells?.length || 0} reference price cells defined
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age</TableHead>
                        <TableHead>Sex</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Breed</TableHead>
                        <TableHead className="text-right">Ref. Price</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cells.map((cell) => (
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
                                onClick={() => deleteCell.mutate({ cellId: cell.id })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
