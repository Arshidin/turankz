import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreatePoolRequest } from '@/hooks/usePoolRequests';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';
import { useCanCreateRequests } from '@/hooks/useCurrentMpk';
import { Loader2, Info, AlertTriangle, Clock, Ban } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { LIVESTOCK_BREEDS, LIVESTOCK_GENDERS, AGE_RANGE, WEIGHT_RANGE, type AcceptanceCriteria } from '@/lib/livestock-criteria';
import { canSubmitPoolRequest } from '@/lib/pool-request-lifecycle';
import { calculateCountdown } from '@/lib/matching-window';
import { format, parseISO } from 'date-fns';
import { DeliveryPeriodSelect, type DeliveryPeriod } from '@/components/shared/DeliveryPeriodSelect';
import { AcceptanceCriteriaExplainer, AcceptanceCriteriaPreview } from '@/components/mpk/AcceptanceCriteriaExplainer';

const REGIONS = [
  'Almaty',
  'Astana',
  'Shymkent',
  'Aktobe',
  'Karaganda',
  'Pavlodar',
  'Kostanay',
  'East Kazakhstan',
  'West Kazakhstan',
  'North Kazakhstan',
];

const GRADES = ['A', 'B', 'C', 'A/B', 'B/C', 'Any'];

// Generate target week options
function getTargetWeekOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 1; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i * 7);
    const year = date.getFullYear();
    const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
    const value = `${year}-W${week.toString().padStart(2, '0')}`;
    const label = `Week ${week}, ${year}`;
    options.push({ value, label });
  }

  return options;
}

// Helper to validate target week is within reasonable range (next 12 weeks)
function validateTargetWeek(targetWeek: string): boolean {
  if (!targetWeek) return false;

  // Parse target week (format: YYYY-WXX)
  let year: number;
  let week: number;

  if (targetWeek.includes('-W')) {
    const [yearStr, weekStr] = targetWeek.split('-W');
    year = parseInt(yearStr);
    week = parseInt(weekStr);
  } else {
    return false; // Invalid format
  }

  // Calculate date from week
  const targetDate = new Date(year, 0, 1);
  targetDate.setDate(targetDate.getDate() + (week - 1) * 7);

  // Check if within next 12 weeks
  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 12 * 7); // 12 weeks from now

  // Check if not in the past and not more than 12 weeks ahead
  return targetDate >= now && targetDate <= maxDate;
}

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mpkId: string;
  mpkName: string;
  defaultCriteria?: AcceptanceCriteria;
  defaultRegions?: string[];
  commonTargetWeeks?: string[]; // Months from MPK profile (e.g., ['Январь', 'Февраль'])
}

function getFormSchema(t: (key: string) => string) {
  return z.object({
    required_volume: z.coerce.number()
      .min(1, t('newRequestDialog.validation.volumeRequired'))
      .max(10000, t('newRequestDialog.validation.volumeMax')),
    required_grade: z.string().min(1, t('newRequestDialog.validation.gradeRequired')),
    regions: z.array(z.string()).min(1, t('newRequestDialog.validation.regionsRequired')),
    target_week: z.string()
      .min(1, t('newRequestDialog.validation.targetWeekRequired'))
      .refine(
        (val) => validateTargetWeek(val),
        { message: t('newRequestDialog.validation.targetWeekRange') }
      ),
    target_delivery_period: z.enum(['short_term', 'mid_term', 'long_term']).default('short_term'),
    notes: z.string().max(500, t('newRequestDialog.validation.notesMax')).optional(),
    // Acceptance criteria - at least one field must be specified
    accepted_breeds: z.array(z.string()),
    accepted_genders: z.array(z.string()),
    age_range_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
    age_range_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
    weight_range_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
    weight_range_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
  }).refine(
    (data) => {
      // At least one acceptance criteria must be specified
      const hasBreeds = data.accepted_breeds && data.accepted_breeds.length > 0;
      const hasGenders = data.accepted_genders && data.accepted_genders.length > 0;
      const hasAgeRange = data.age_range_min !== undefined || data.age_range_max !== undefined;
      const hasWeightRange = data.weight_range_min !== undefined || data.weight_range_max !== undefined;

      return hasBreeds || hasGenders || hasAgeRange || hasWeightRange;
    },
    {
      message: t('newRequestDialog.validation.criteriaRequired'),
      path: ['accepted_breeds'], // Show error on first criteria field
    }
  );
}

export function NewRequestDialog({ open, onOpenChange, mpkId, mpkName, defaultCriteria, defaultRegions = [], commonTargetWeeks = [] }: NewRequestDialogProps) {
  const { t } = useTranslation();
  const createRequest = useCreatePoolRequest();
  const { data: matchingWindow } = useCurrentMatchingWindow();
  const canCreateRequestsResult = useCanCreateRequests();
  const weekOptions = getTargetWeekOptions();

  // Check submission validation based on matching window
  const submissionValidation = canSubmitPoolRequest(matchingWindow || null);
  const countdown = matchingWindow?.lock_date
    ? calculateCountdown(matchingWindow.lock_date)
    : null;

  // Combined can submit check (window validation + MPK restriction)
  const canSubmit = submissionValidation.canSubmit && canCreateRequestsResult.canCreate;

  const formSchema = useMemo(() => getFormSchema(t), [t]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      required_volume: undefined,
      required_grade: '',
      regions: defaultRegions || [], // Pre-fill regions from MPK profile
      target_week: matchingWindow?.target_week || '',
      target_delivery_period: 'short_term' as DeliveryPeriod,
      notes: '',
      accepted_breeds: defaultCriteria?.accepted_breeds || [],
      accepted_genders: defaultCriteria?.accepted_genders || [],
      age_range_min: defaultCriteria?.age_range_min ?? undefined,
      age_range_max: defaultCriteria?.age_range_max ?? undefined,
      weight_range_min: defaultCriteria?.weight_range_min ?? undefined,
      weight_range_max: defaultCriteria?.weight_range_max ?? undefined,
    },
  });

  // Update target week when matching window changes
  useEffect(() => {
    if (matchingWindow?.target_week && !form.getValues('target_week')) {
      form.setValue('target_week', matchingWindow.target_week);
    }
  }, [matchingWindow, form]);

  // Reset form with default values when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        required_volume: undefined,
        required_grade: '',
        regions: defaultRegions || [],
        target_week: matchingWindow?.target_week || '',
        target_delivery_period: 'short_term' as DeliveryPeriod,
        notes: '',
        accepted_breeds: defaultCriteria?.accepted_breeds || [],
        accepted_genders: defaultCriteria?.accepted_genders || [],
        age_range_min: defaultCriteria?.age_range_min ?? undefined,
        age_range_max: defaultCriteria?.age_range_max ?? undefined,
        weight_range_min: defaultCriteria?.weight_range_min ?? undefined,
        weight_range_max: defaultCriteria?.weight_range_max ?? undefined,
      });
    }
  }, [open, defaultRegions, defaultCriteria, matchingWindow?.target_week, form]);

  const onSubmit = async (data: FormData) => {
    // Double-check submission is still allowed
    if (!canSubmit) {
      return;
    }

    await createRequest.mutateAsync({
      mpk_id: mpkId,
      mpk_name: mpkName,
      required_volume: data.required_volume,
      required_grade: data.required_grade,
      regions: data.regions,
      target_week: data.target_week,
      target_delivery_period: data.target_delivery_period,
      notes: data.notes || null,
      // Acceptance criteria
      accepted_breeds: data.accepted_breeds,
      accepted_genders: data.accepted_genders,
      age_range_min: data.age_range_min || null,
      age_range_max: data.age_range_max || null,
      weight_range_min: data.weight_range_min || null,
      weight_range_max: data.weight_range_max || null,
    });

    form.reset();
    onOpenChange(false);
  };

  const selectedRegions = form.watch('regions');
  const selectedBreeds = form.watch('accepted_breeds');
  const selectedGenders = form.watch('accepted_genders');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('newRequestDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('newRequestDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {/* MPK Restriction Alert */}
        {!canCreateRequestsResult.canCreate && (
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertDescription>
              {canCreateRequestsResult.reason || t('newRequestDialog.alerts.accountRestricted')}
              {canCreateRequestsResult.maxActiveRequests && canCreateRequestsResult.activeRequestsCount !== undefined && (
                <div className="mt-2 text-sm">
                  {t('newRequestDialog.alerts.activeRequests', {
                    current: canCreateRequestsResult.activeRequestsCount,
                    max: canCreateRequestsResult.maxActiveRequests
                  })}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Submission Status Alert */}
        {canCreateRequestsResult.canCreate && !submissionValidation.canSubmit ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {submissionValidation.reason}
            </AlertDescription>
          </Alert>
        ) : canCreateRequestsResult.canCreate && countdown && !countdown.isExpired && (
          <Alert className={countdown.days === 0 ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {t('newRequestDialog.alerts.submissionDeadline', {
                  date: matchingWindow?.lock_date ? format(parseISO(matchingWindow.lock_date), 'MMM d, yyyy') : ''
                })}
              </span>
              <span className={`font-mono font-semibold ${countdown.days === 0 ? 'text-amber-600' : 'text-primary'}`}>
                {countdown.formattedShort}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Request Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="required_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newRequestDialog.fields.requiredVolume')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('newRequestDialog.fields.requiredVolumePlaceholder')}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t('newRequestDialog.fields.requiredVolumeDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newRequestDialog.fields.requiredGrade')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('newRequestDialog.fields.requiredGradePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade === 'Any' ? t('newRequestDialog.fields.gradeAny') : t('newRequestDialog.fields.gradeLabel', { grade })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      {t('newRequestDialog.fields.requiredGradeDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newRequestDialog.fields.targetWeek')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('newRequestDialog.fields.targetWeekPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {weekOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    {t('newRequestDialog.fields.targetWeekDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_delivery_period"
              render={({ field }) => (
                <DeliveryPeriodSelect
                  value={field.value}
                  onChange={field.onChange}
                  description={t('newRequestDialog.fields.targetDeliveryPeriodDescription')}
                />
              )}
            />

            <FormField
              control={form.control}
              name="regions"
              render={() => (
                <FormItem>
                  <FormLabel>{t('newRequestDialog.fields.acceptableRegions')}</FormLabel>
                  <FormDescription className="text-xs mb-2">
                    {t('newRequestDialog.fields.acceptableRegionsDescription')}
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                    {REGIONS.map((region) => (
                      <FormField
                        key={region}
                        control={form.control}
                        name="regions"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(region)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, region]);
                                  } else {
                                    field.onChange(currentValue.filter((r) => r !== region));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {region}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  {selectedRegions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('newRequestDialog.fields.regionsSelected', { count: selectedRegions.length })}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Acceptance Criteria Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium">{t('newRequestDialog.acceptanceCriteria.title')}</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t('newRequestDialog.acceptanceCriteria.tooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Acceptance Criteria Explainer */}
              <AcceptanceCriteriaExplainer variant="inline" t={t} />

              {/* Criteria Preview */}
              <AcceptanceCriteriaPreview
                selectedBreeds={form.watch('accepted_breeds')}
                selectedGenders={form.watch('accepted_genders')}
                ageMin={form.watch('age_range_min')}
                ageMax={form.watch('age_range_max')}
                weightMin={form.watch('weight_range_min')}
                weightMax={form.watch('weight_range_max')}
              />

              {/* Breeds */}
              <FormField
                control={form.control}
                name="accepted_breeds"
                render={() => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-sm">{t('newRequestDialog.acceptanceCriteria.acceptedBreeds')}</FormLabel>
                    <FormDescription className="text-xs mb-2">
                      {t('newRequestDialog.acceptanceCriteria.acceptedBreedsDescription')}
                    </FormDescription>
                    <div className="grid grid-cols-3 gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                      {LIVESTOCK_BREEDS.map((breed) => (
                        <FormField
                          key={breed}
                          control={form.control}
                          name="accepted_breeds"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(breed)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, breed]);
                                    } else {
                                      field.onChange(currentValue.filter((b) => b !== breed));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-normal cursor-pointer">
                                {breed}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    {selectedBreeds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('newRequestDialog.acceptanceCriteria.breedsSelected', { count: selectedBreeds.length })}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="accepted_genders"
                render={() => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-sm">{t('newRequestDialog.acceptanceCriteria.acceptedGenders')}</FormLabel>
                    <div className="flex flex-wrap gap-4 p-3 border rounded-lg">
                      {LIVESTOCK_GENDERS.map((gender) => (
                        <FormField
                          key={gender}
                          control={form.control}
                          name="accepted_genders"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(gender)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, gender]);
                                    } else {
                                      field.onChange(currentValue.filter((g) => g !== gender));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {gender}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              {/* Age & Weight Ranges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm">{t('newRequestDialog.acceptanceCriteria.ageRange')}</FormLabel>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('newRequestDialog.acceptanceCriteria.ageRangeDescription')}
                  </p>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="age_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('newRequestDialog.acceptanceCriteria.minPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <FormField
                      control={form.control}
                      name="age_range_max"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('newRequestDialog.acceptanceCriteria.maxPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm">{t('newRequestDialog.acceptanceCriteria.weightRange')}</FormLabel>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('newRequestDialog.acceptanceCriteria.weightRangeDescription')}
                  </p>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="weight_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('newRequestDialog.acceptanceCriteria.minPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <FormField
                      control={form.control}
                      name="weight_range_max"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('newRequestDialog.acceptanceCriteria.maxPlaceholder')}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Helper Text */}
              <div className="flex items-start gap-2 p-3 mt-4 rounded-lg bg-muted/50 border">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('newRequestDialog.acceptanceCriteria.helperText')}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    {t('newRequestDialog.acceptanceCriteria.warningText')}
                  </p>
                </div>
              </div>
              {/* Show validation error if no criteria selected */}
              {form.formState.errors.accepted_breeds && (
                <p className="text-xs text-destructive mt-2">
                  {form.formState.errors.accepted_breeds.message}
                </p>
              )}
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newRequestDialog.fields.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('newRequestDialog.fields.notesPlaceholder')}
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('newRequestDialog.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createRequest.isPending || !canSubmit}
              >
                {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!canCreateRequestsResult.canCreate ? t('newRequestDialog.buttons.accountRestricted') : t('newRequestDialog.buttons.create')}
              </Button>
              {!canCreateRequestsResult.canCreate && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {canCreateRequestsResult.reason || t('newRequestDialog.alerts.accountRestricted')}
                </p>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
