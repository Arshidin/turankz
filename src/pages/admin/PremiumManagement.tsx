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
import { Award, TrendingUp, Edit2, History, Info } from 'lucide-react';
import { usePremiumSettings, useUpdatePremium, usePremiumChangeLog, PremiumSetting } from '@/hooks/usePremiums';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PremiumManagement() {
  const { data: premiumSettings, isLoading } = usePremiumSettings();
  const { data: changeLog } = usePremiumChangeLog();
  const updatePremium = useUpdatePremium();
  
  const [editingPremium, setEditingPremium] = useState<PremiumSetting | null>(null);
  const [newValue, setNewValue] = useState('');
  const [changeReason, setChangeReason] = useState('');

  const standardPremiums = premiumSettings?.filter(p => p.premium_type === 'standard') || [];
  const reliabilityPremiums = premiumSettings?.filter(p => p.premium_type === 'reliability') || [];

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
        changed_by: 'Admin', // In production, use actual user
        change_reason: changeReason,
      });
      toast.success('Premium value updated successfully');
      setEditingPremium(null);
    } catch (error) {
      toast.error('Failed to update premium value');
    }
  };

  const getPremiumName = (id: string) => {
    return premiumSettings?.find(p => p.id === id)?.level_name || 'Unknown';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Premium Management"
          description="Configure Standard and Reliability premium values"
        />

        <Tabs defaultValue="standard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="standard" className="gap-2">
              <Award className="h-4 w-4" />
              Standard Premiums
            </TabsTrigger>
            <TabsTrigger value="reliability" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Reliability Premiums
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Change History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Standard Premium (Batch-Level)</CardTitle>
                <CardDescription>
                  Premiums applied based on batch standardization and quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : (
                      standardPremiums.map((premium) => (
                        <TableRow key={premium.id}>
                          <TableCell>
                            <Badge variant={premium.level_key === 'high_standard' ? 'default' : 'secondary'}>
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
          </TabsContent>

          <TabsContent value="reliability">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reliability Premium (Farmer-Level)</CardTitle>
                <CardDescription>
                  Premiums based on farmer confirmation behavior and consistency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : (
                      reliabilityPremiums.map((premium) => (
                        <TableRow key={premium.id}>
                          <TableCell>
                            <Badge variant={premium.level_key === 'standard_supplier' ? 'default' : 'secondary'}>
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
          </TabsContent>

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
              <p className="font-medium text-foreground mb-1">Premium System Overview</p>
              <ul className="space-y-1">
                <li>• <strong>Standard Premium</strong> applies at the batch level based on quality and standardization</li>
                <li>• <strong>Reliability Premium</strong> applies at the farmer level based on confirmation behavior</li>
                <li>• Premiums are additive: Total Premium = Standard + Reliability</li>
                <li>• All changes are logged for audit purposes</li>
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
