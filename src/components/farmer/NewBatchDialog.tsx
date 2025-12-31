import { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCreateBatch } from '@/hooks/useBatches';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCanCreateBatches } from '@/hooks/useCurrentFarmer';
import { Loader2, Info, AlertTriangle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { LIVESTOCK_BREEDS, LIVESTOCK_GENDERS, AGE_RANGE, WEIGHT_RANGE } from '@/lib/livestock-criteria';
import { INITIAL_BATCH_STATUS, getBatchCreationInfo, BATCH_STATUS_LABELS } from '@/lib/batch-lifecycle';
import { DeliveryPeriodSelect, type DeliveryPeriod } from '@/components/shared/DeliveryPeriodSelect';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

const GRADES = ['A', 'B', 'C'];

const formSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  heads: z.coerce.number().min(1, 'At least 1 head required').max(10000, 'Maximum 10,000 heads'),
  avg_weight: z.coerce.number().min(100, 'Minimum weight is 100 kg').max(1000, 'Maximum weight is 1000 kg').optional(),
  grade: z.string().min(1, 'Grade is required'),
  target_week: z.string().min(1, 'Target week is required'),
  delivery_period: z.enum(['short_term', 'mid_term', 'long_term']).default('short_term'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  // Livestock criteria
  breed: z.string().optional(),
  gender: z.string().optional(),
  age_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
  age_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
  weight_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
  weight_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate target week options (next 12 weeks)
function getTargetWeekOptions(t: (key: string, params?: any) => string) {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i * 7);
    const year = date.getFullYear();
    const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
    const value = `${year}-W${week.toString().padStart(2, '0')}`;
    const label = t('newBatchDialog.weekFormat', { week, year });
    options.push({ value, label });
  }
  
  return options;
}

// Generate a batch number
function generateBatchNumber() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BTH-${num}`;
}

export function NewBatchDialog({ open, onOpenChange }: NewBatchDialogProps) {
  const { t, i18n } = useTranslation();
  const createBatch = useCreateBatch();
  const { user } = useAuthContext();
  const canCreateBatches = useCanCreateBatches();
  const weekOptions = getTargetWeekOptions(t);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Get current language for lifecycle info (legacy function)
  const getCurrentLang = (): 'en' | 'ru' => {
    const lang = i18n.language || 'ru';
    return lang.startsWith('ru') ? 'ru' : 'en';
  };
  
  const lang = getCurrentLang();
  const lifecycleInfo = getBatchCreationInfo(lang);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: '',
      heads: undefined,
      avg_weight: undefined,
      grade: '',
      target_week: '',
      delivery_period: 'short_term' as DeliveryPeriod,
      notes: '',
      breed: '',
      gender: '',
      age_min: undefined,
      age_max: undefined,
      weight_min: undefined,
      weight_max: undefined,
    },
  });

  // Reset form and step when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setCurrentStep(1);
    }
    onOpenChange(isOpen);
  };

  // Step validation schemas with i18n
  const step1Schema = z.object({
    region: z.string().min(1, t('newBatchDialog.validation.regionRequired')),
    grade: z.string().min(1, t('newBatchDialog.validation.gradeRequired')),
    heads: z.coerce.number().min(1, t('newBatchDialog.validation.headsRequired')).max(10000, t('newBatchDialog.validation.headsMax')),
    target_week: z.string().min(1, t('newBatchDialog.validation.targetWeekRequired')),
  });

  const step2Schema = z.object({
    avg_weight: z.coerce.number().min(100, t('newBatchDialog.validation.avgWeightMin')).max(1000, t('newBatchDialog.validation.avgWeightMax')).optional().or(z.literal('')),
    delivery_period: z.enum(['short_term', 'mid_term', 'long_term']).default('short_term'),
    notes: z.string().max(500, t('newBatchDialog.validation.notesMax')).optional(),
  });

  const step3Schema = z.object({
    breed: z.string().optional(),
    gender: z.string().optional(),
    age_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
    age_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
    weight_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
    weight_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
  });

  const validateStep = async (step: number): Promise<boolean> => {
    const values = form.getValues();
    let schema: z.ZodSchema;
    
    if (step === 1) {
      schema = step1Schema;
    } else if (step === 2) {
      schema = step2Schema;
    } else {
      schema = step3Schema;
    }
    
    const result = await schema.safeParseAsync(values);
    if (!result.success) {
      // Set errors for current step fields
      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;
        form.setError(path as any, { message: error.message });
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      console.error('No authenticated user');
      return;
    }
    
    // Status is enforced by useCreateBatch - always starts as Draft
    // Any status value here will be ignored by the hook
    const batch = {
      batch_number: generateBatchNumber(),
      user_id: user.id, // Use authenticated user's ID for RLS compliance
      region: data.region,
      heads: data.heads,
      avg_weight: data.avg_weight || null,
      grade: data.grade,
      target_week: data.target_week,
      delivery_period: data.delivery_period,
      notes: data.notes || null,
      status: INITIAL_BATCH_STATUS, // Enforced at domain layer - cannot be overridden
      requires_action: false,
      action_type: null,
      mpk_interest: null,
      standard_status: 'non_standard',
      // Livestock criteria
      breed: data.breed || null,
      gender: data.gender || null,
      age_min: data.age_min || null,
      age_max: data.age_max || null,
      weight_min: data.weight_min || null,
      weight_max: data.weight_max || null,
    };

    createBatch.mutate(batch, {
      onSuccess: () => {
        form.reset();
        setCurrentStep(1);
        onOpenChange(false);
      },
    });
  };

  // Step titles and descriptions with i18n
  const stepTitles = {
    1: t('newBatchDialog.steps.basicInfo'),
    2: t('newBatchDialog.steps.additionalInfo'),
    3: t('newBatchDialog.steps.livestockCharacteristics'),
  };

  const stepDescriptions = {
    1: t('newBatchDialog.stepDescriptions.basicInfo'),
    2: t('newBatchDialog.stepDescriptions.additionalInfo'),
    3: t('newBatchDialog.stepDescriptions.livestockCharacteristics'),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t('newBatchDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('newBatchDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex-shrink-0 space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('newBatchDialog.stepIndicator', { current: currentStep, total: totalSteps })}
            </span>
            <span className="font-medium">{stepTitles[currentStep as keyof typeof stepTitles]}</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Observer Restriction Alert */}
        {!canCreateBatches && (
          <Alert variant="destructive" className="flex-shrink-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <span className="font-medium">{t('newBatchDialog.accessRestricted')}</span>{' '}
              {t('newBatchDialog.accessRestrictedMessage')}
            </AlertDescription>
          </Alert>
        )}

        {/* Lifecycle Info Alert - only on step 1 */}
        {currentStep === 1 && (
          <Alert className="border-primary/30 bg-primary/5 flex-shrink-0">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <span className="font-medium">{lifecycleInfo.title}:</span>{' '}
              {lifecycleInfo.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Step Description */}
        <div className="flex-shrink-0 mb-4">
          <p className="text-sm text-muted-foreground">{stepDescriptions[currentStep as keyof typeof stepDescriptions]}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.region')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.regionTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('newBatchDialog.fields.regionPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.grade')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.gradeTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('newBatchDialog.fields.gradePlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {t('newBatchDialog.fields.gradeLabel', { grade })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="heads"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.heads')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.headsTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={t('newBatchDialog.fields.headsPlaceholder')} 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.targetWeek')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.targetWeekTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('newBatchDialog.fields.targetWeekPlaceholder')} />
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
                            {t('newBatchDialog.fields.targetWeekDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Additional Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="avg_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('newBatchDialog.fields.avgWeight')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {t('newBatchDialog.fields.avgWeightTooltip')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={t('newBatchDialog.fields.avgWeightPlaceholder')} 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t('newBatchDialog.fields.avgWeightOptional')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_period"
                    render={({ field }) => (
                      <DeliveryPeriodSelect
                        value={field.value}
                        onChange={field.onChange}
                        description={t('newBatchDialog.fields.deliveryPeriodDescription')}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('newBatchDialog.fields.notes')}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {t('newBatchDialog.fields.notesTooltip')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('newBatchDialog.fields.notesPlaceholder')}
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t('newBatchDialog.fields.notesOptional')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Livestock Characteristics */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <Alert className="border-blue-500/30 bg-blue-500/5">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm">
                      {t('newBatchDialog.characteristicsInfo')}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.breed')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.breedTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('newBatchDialog.fields.breedPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LIVESTOCK_BREEDS.map((breed) => (
                                <SelectItem key={breed} value={breed}>
                                  {breed}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            {t('newBatchDialog.fields.breedOptional')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            {t('newBatchDialog.fields.gender')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {t('newBatchDialog.fields.genderTooltip')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('newBatchDialog.fields.genderPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LIVESTOCK_GENDERS.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            {t('newBatchDialog.fields.genderOptional')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-1">
                        {t('newBatchDialog.fields.ageRange')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {t('newBatchDialog.fields.ageRangeTooltip', { min: AGE_RANGE.min, max: AGE_RANGE.max })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="age_min"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={t('newBatchDialog.fields.ageMinPlaceholder')} 
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
                          name="age_max"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={t('newBatchDialog.fields.ageMaxPlaceholder')} 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormDescription className="text-xs">
                        {t('newBatchDialog.fields.ageRangeOptional')}
                      </FormDescription>
                    </div>

                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-1">
                        {t('newBatchDialog.fields.weightRange')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {t('newBatchDialog.fields.weightRangeTooltip', { min: WEIGHT_RANGE.min, max: WEIGHT_RANGE.max })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="weight_min"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={t('newBatchDialog.fields.weightMinPlaceholder')} 
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
                          name="weight_max"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={t('newBatchDialog.fields.weightMaxPlaceholder')} 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormDescription className="text-xs">
                        {t('newBatchDialog.fields.weightRangeOptional')}
                      </FormDescription>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex-shrink-0 flex justify-between gap-3 pt-4 border-t mt-4">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t('newBatchDialog.buttons.back')}
                  </Button>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)}
                >
                  {t('newBatchDialog.buttons.cancel')}
                </Button>
              </div>
              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                  >
                    {t('newBatchDialog.buttons.next')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createBatch.isPending || !canCreateBatches}
                  >
                    {createBatch.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('newBatchDialog.buttons.create')}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
