import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Check, Calendar, Beef, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useCreateHerdSnapshot,
  useCheckExistingSnapshots,
  LIVESTOCK_CATEGORIES, 
  COMMON_BREEDS,
  type LivestockCategory,
  type ReportingPeriodType,
  type CreateSnapshotInput
} from '@/hooks/useHerdStructure';

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryCount {
  category: LivestockCategory;
  count: number;
  breed: string;
}

const STEPS = [
  { key: 'period', title: 'Reporting Period', icon: Calendar },
  { key: 'counts', title: 'Herd Counts', icon: Beef },
  { key: 'review', title: 'Review & Submit', icon: ClipboardCheck },
] as const;

export function HerdSnapshotWizard({ open, onOpenChange }: WizardProps) {
  const { t } = useTranslation();
  const createSnapshot = useCreateHerdSnapshot();
  const { data: existingSnapshots } = useCheckExistingSnapshots();
  
  const [step, setStep] = useState(0);
  const [periodType, setPeriodType] = useState<ReportingPeriodType>('quarterly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [defaultBreed, setDefaultBreed] = useState('');
  const [notes, setNotes] = useState('');
  const [counts, setCounts] = useState<CategoryCount[]>(
    Object.keys(LIVESTOCK_CATEGORIES).map(cat => ({
      category: cat as LivestockCategory,
      count: 0,
      breed: '',
    }))
  );

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Validate period - cannot create for future periods
  const validatePeriod = (year: number, quarter?: number, periodType?: ReportingPeriodType): { valid: boolean; error?: string } => {
    if (year > currentYear) {
      return { valid: false, error: 'Cannot create snapshot for future year' };
    }
    if (year === currentYear && periodType === 'quarterly' && quarter && quarter > currentQuarter) {
      return { valid: false, error: 'Cannot create snapshot for future quarter' };
    }
    return { valid: true };
  };

  // Check if snapshot already exists for given period/category/breed
  const checkExistingSnapshot = (category: LivestockCategory, breed: string): boolean => {
    if (!existingSnapshots) return false;
    return existingSnapshots.some(s => 
      s.reporting_year === year &&
      s.reporting_quarter === (periodType === 'quarterly' ? quarter : null) &&
      s.category === category &&
      s.breed === breed
    );
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate period
      const periodValidation = validatePeriod(year, quarter, periodType);
      if (!periodValidation.valid) {
        toast.error(periodValidation.error || 'Invalid period');
        return;
      }
      if (!defaultBreed) {
        toast.error('Please select a primary breed');
        return;
      }
    }
    if (step < STEPS.length - 1) {
      // Apply default breed to categories without breed
      if (step === 0) {
        setCounts(prev => prev.map(c => ({
          ...c,
          breed: c.breed || defaultBreed,
        })));
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Validate period before submit
    const periodValidation = validatePeriod(year, quarter, periodType);
    if (!periodValidation.valid) {
      toast.error(periodValidation.error || 'Invalid period');
      return;
    }

    const validCounts = counts.filter(c => c.count > 0);
    
    if (validCounts.length === 0) {
      toast.error('Please enter at least one category count');
      return;
    }

    const inputs: Omit<CreateSnapshotInput, 'farmer_id'>[] = validCounts.map(c => ({
      reporting_period_type: periodType,
      reporting_year: year,
      reporting_quarter: periodType === 'quarterly' ? quarter : undefined,
      breed: c.breed || defaultBreed,
      category: c.category,
      count: c.count,
      notes: notes || undefined,
    }));

    try {
      await createSnapshot.mutateAsync(inputs);
      toast.success('Herd structure snapshot submitted successfully');
      onOpenChange(false);
      resetWizard();
    } catch (error: any) {
      // Check for duplicate error
      if (error?.message?.includes('duplicate') || error?.code === '23505') {
        toast.error('A snapshot for this period, category, and breed already exists. Please update the existing snapshot or choose a different period.');
      } else {
        toast.error('Failed to submit snapshot: ' + (error?.message || 'Unknown error'));
      }
    }
  };

  const resetWizard = () => {
    setStep(0);
    setPeriodType('quarterly');
    setYear(currentYear);
    setQuarter(Math.ceil((new Date().getMonth() + 1) / 3));
    setDefaultBreed('');
    setNotes('');
    setCounts(Object.keys(LIVESTOCK_CATEGORIES).map(cat => ({
      category: cat as LivestockCategory,
      count: 0,
      breed: '',
    })));
  };

  const updateCount = (category: LivestockCategory, value: number) => {
    setCounts(prev => prev.map(c => 
      c.category === category ? { ...c, count: value } : c
    ));
  };

  const updateBreed = (category: LivestockCategory, breed: string) => {
    setCounts(prev => prev.map(c => 
      c.category === category ? { ...c, breed } : c
    ));
  };

  const totalCount = counts.reduce((sum, c) => sum + c.count, 0);
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[step].icon;
              return <StepIcon className="w-5 h-5 text-primary" />;
            })()}
            {STEPS[step].title}
          </DialogTitle>
          <DialogDescription>
            {t('herdStructure.wizardStep', 'Step {{current}} of {{total}}', { current: step + 1, total: STEPS.length })}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1" />

        <div className="py-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('herdStructure.periodType', 'Period Type')}</Label>
                <Select value={periodType} onValueChange={(v) => setPeriodType(v as ReportingPeriodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('herdStructure.year', 'Year')}</Label>
                  <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {periodType === 'quarterly' && (
                  <div className="space-y-2">
                    <Label>{t('herdStructure.quarter', 'Quarter')}</Label>
                    <Select value={quarter.toString()} onValueChange={(v) => setQuarter(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{t('herdStructure.primaryBreed', 'Primary Breed')}</Label>
                <Select value={defaultBreed} onValueChange={setDefaultBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_BREEDS.map(breed => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('herdStructure.breedNote', 'You can specify different breeds per category in the next step')}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {counts.map((item) => {
                const existingBreed = item.breed || defaultBreed;
                const hasExisting = existingBreed && checkExistingSnapshot(item.category, existingBreed);
                
                return (
                  <Card key={item.category} className={`border ${hasExisting ? 'border-amber-300 bg-amber-50/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-medium">
                            {LIVESTOCK_CATEGORIES[item.category].label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {LIVESTOCK_CATEGORIES[item.category].description}
                          </p>
                          {hasExisting && (
                            <p className="text-xs text-amber-700 mt-1 font-medium">
                              ⚠️ Snapshot already exists for this period, category, and breed
                            </p>
                          )}
                        </div>
                        <div className="w-28">
                          <Input
                            type="number"
                            min={0}
                            value={item.count || ''}
                            onChange={(e) => updateCount(item.category, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="text-right"
                          />
                        </div>
                      </div>
                      {item.count > 0 && (
                        <div className="mt-3">
                          <Select 
                            value={item.breed || defaultBreed} 
                            onValueChange={(v) => updateBreed(item.category, v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select breed" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMMON_BREEDS.map(breed => (
                                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              <div className="space-y-2">
                <Label>{t('herdStructure.additionalNotes', 'Additional Notes')} (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about this snapshot..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium">
                        {periodType === 'quarterly' ? `Q${quarter} ${year}` : year}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {periodType === 'quarterly' ? 'Quarterly' : 'Annual'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total heads</div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-2">
                    {counts.filter(c => c.count > 0).map(item => (
                      <div key={item.category} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {LIVESTOCK_CATEGORIES[item.category].label}
                        </span>
                        <span className="font-medium">
                          {item.count.toLocaleString()} ({item.breed || defaultBreed})
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {notes && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Notes:</span> {notes}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t('herdStructure.submitNotice', 'Once submitted, this snapshot cannot be modified. You can submit additional snapshots at any time.')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back', 'Back')}
          </Button>
          
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              {t('common.next', 'Next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createSnapshot.isPending || totalCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              {createSnapshot.isPending ? 'Submitting...' : t('herdStructure.submit', 'Submit Snapshot')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
