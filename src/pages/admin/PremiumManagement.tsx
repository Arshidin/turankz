import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Award, TrendingUp, Clock, BarChart3, Edit2, History, Info } from 'lucide-react';
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

export default function PremiumManagement() {
  const { data: premiumSettings, isLoading } = usePremiumSettings();
  const { data: changeLog } = usePremiumChangeLog();
  const updatePremium = useUpdatePremium();
  const toggleActive = useTogglePremiumActive();
  
  const [editingPremium, setEditingPremium] = useState<PremiumSetting | null>(null);
  const [newValue, setNewValue] = useState('');
  const [changeReason, setChangeReason] = useState('');

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

    try {
      await updatePremium.mutateAsync({
        id: editingPremium.id,
        premium_value: value,
        previous_value: editingPremium.premium_value,
        changed_by: 'Admin',
        change_reason: changeReason,
      });
      toast.success('Premium value updated successfully');
      setEditingPremium(null);
    } catch (error) {
      toast.error('Failed to update premium value');
    }
  };

  const handleToggleActive = async (premium: PremiumSetting) => {
    try {
      await toggleActive.mutateAsync({
        id: premium.id,
        is_active: !premium.is_active,
        changed_by: 'Admin',
      });
      toast.success(`Premium ${premium.is_active ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle premium status');
    }
  };

  const getPremiumName = (id: string) => {
    return premiumSettings?.find(p => p.id === id)?.level_name || 'Unknown';
  };

  const renderPremiumTable = (type: PremiumType) => {
    const premiums = getPremiumsByType(type);
    const typeLabel = PREMIUM_TYPE_LABELS[type];
    const typeDescription = PREMIUM_TYPE_DESCRIPTIONS[type];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{typeLabel} Premium</CardTitle>
          <CardDescription>{typeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Enabled</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead className="text-right">Premium</TableHead>
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
                    No premium levels configured
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Premium Level</TableHead>
                      <TableHead>Previous Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changeLog?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No changes recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      changeLog?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{getPremiumName(log.premium_setting_id)}</TableCell>
                          <TableCell>{log.previous_value} ₸/kg</TableCell>
                          <TableCell className="font-medium">{log.new_value} ₸/kg</TableCell>
                          <TableCell>{log.changed_by}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.change_reason}</TableCell>
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
            <Button onClick={handleSave} disabled={updatePremium.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}