import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, TrendingUp, AlertTriangle, Trash2, Clock, Info, Target } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  useMyMarketIntents, 
  useCreateMarketIntent,
  useDeleteMarketIntent,
  HORIZON_OPTIONS, 
  CONFIDENCE_OPTIONS, 
  COMMON_BREEDS,
  type MarketIntentHorizon,
  type IntentConfidenceLevel,
  type MarketAvailabilityIntent
} from '@/hooks/useMarketIntent';

export default function MarketIntent() {
  const { t } = useTranslation();
  const { data: intents, isLoading } = useMyMarketIntents();
  const createIntent = useCreateMarketIntent();
  const deleteIntent = useDeleteMarketIntent();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [horizon, setHorizon] = useState<MarketIntentHorizon>('3m');
  const [breed, setBreed] = useState('');
  const [heads, setHeads] = useState('');
  const [confidence, setConfidence] = useState<IntentConfidenceLevel>('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!breed || !heads || parseInt(heads) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createIntent.mutateAsync({
        horizon,
        breed,
        estimated_heads: parseInt(heads),
        confidence_level: confidence,
        notes: notes || undefined,
      });
      toast.success('Market intent submitted');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to submit intent');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIntent.mutateAsync(id);
      toast.success('Intent removed');
    } catch (error) {
      toast.error('Failed to remove intent');
    }
  };

  const resetForm = () => {
    setHorizon('3m');
    setBreed('');
    setHeads('');
    setConfidence('medium');
    setNotes('');
  };

  // Group by horizon
  const groupedIntents = intents?.reduce((acc, intent) => {
    if (!acc[intent.horizon]) acc[intent.horizon] = [];
    acc[intent.horizon].push(intent);
    return acc;
  }, {} as Record<MarketIntentHorizon, MarketAvailabilityIntent[]>) || {};

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <PageHeader
            title={t('marketIntent.title', 'Market Intent')}
            description={t('marketIntent.description', 'Signal your potential future market availability (optional, non-binding)')}
          />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('marketIntent.addIntent', 'Add Intent')}
          </Button>
        </div>

        {/* System Guardrail: Data & Outlook section disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              {t('marketIntent.disclaimer.title', 'Data & Outlook — Non-Binding Intent')}
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-0.5">
              {t('marketIntent.disclaimer.text', 'Market intents are voluntary signals only. They do not create batches or participate in matching. To commit livestock to the pool, create a batch in Market Operations → Livestock Batches.')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !intents?.length ? (
          <EmptyState
            icon={Target}
            message={t('marketIntent.noIntents', 'No market intents')}
            helperText={t('marketIntent.noIntentsDescription', 'Signal your potential future availability to help with regional planning.')}
            actionLabel={t('marketIntent.addFirst', 'Add First Intent')}
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {(['3m', '6m', '12m'] as MarketIntentHorizon[]).map(h => {
              const items = groupedIntents[h];
              if (!items?.length) return null;
              
              const totalHeads = items.reduce((sum, i) => sum + i.estimated_heads, 0);
              
              return (
                <Card key={h}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {HORIZON_OPTIONS[h].label}
                        <Badge variant="outline" className="text-xs">
                          {items.length} {items.length === 1 ? 'intent' : 'intents'}
                        </Badge>
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{totalHeads.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">estimated heads</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map(intent => (
                        <div 
                          key={intent.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium">{intent.breed}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(intent.created_at), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">{intent.estimated_heads.toLocaleString()}</div>
                              <ConfidenceBadge level={intent.confidence_level} />
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(intent.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Intent Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t('marketIntent.addIntent', 'Add Market Intent')}
              </DialogTitle>
              <DialogDescription>
                {t('marketIntent.addDescription', 'Signal your potential future market availability. This is non-binding.')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('marketIntent.horizon', 'Time Horizon')} *</Label>
                <Select value={horizon} onValueChange={(v) => setHorizon(v as MarketIntentHorizon)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HORIZON_OPTIONS).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          <span className="text-xs text-muted-foreground">— {description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('marketIntent.breed', 'Breed')} *</Label>
                <Select value={breed} onValueChange={setBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_BREEDS.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('marketIntent.estimatedHeads', 'Estimated Heads')} *</Label>
                <Input
                  type="number"
                  min={1}
                  value={heads}
                  onChange={(e) => setHeads(e.target.value)}
                  placeholder="Enter estimated count"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('marketIntent.confidence', 'Confidence Level')}</Label>
                <Select value={confidence} onValueChange={(v) => setConfidence(v as IntentConfidenceLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONFIDENCE_OPTIONS).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          <span className="text-xs text-muted-foreground">— {description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('marketIntent.notes', 'Notes')} (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context..."
                  rows={2}
                />
              </div>

              {/* Non-binding reminder */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>This intent is non-binding and will not create a batch or commitment.</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={createIntent.isPending}>
                {createIntent.isPending ? 'Submitting...' : t('marketIntent.submit', 'Submit Intent')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

function ConfidenceBadge({ level }: { level: IntentConfidenceLevel }) {
  const { label, color } = CONFIDENCE_OPTIONS[level];
  return (
    <Badge variant="outline" className={`text-[10px] ${color}`}>
      {label}
    </Badge>
  );
}
