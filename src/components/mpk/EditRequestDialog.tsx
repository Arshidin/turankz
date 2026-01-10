import { useEffect, useMemo } from 'react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUpdatePoolRequest, type PoolRequest } from '@/hooks/usePoolRequests';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { AGE_RANGE, WEIGHT_RANGE } from '@/lib/livestock-criteria';
import {
  canEditField,
  canEditPoolRequest,
  getFieldLockedTooltip,
  getPoolRequestLockedTooltip,
  POOL_REQUEST_STATUS_LABELS,
  type PoolRequestLifecycleStatus,
  type PoolRequestRole,
} from '@/lib/pool-request-lifecycle';

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

function getFormSchema(t: (key: string) => string) {
  return z.object({
    required_volume: z.coerce.number()
      .min(1, t('editRequestDialog.validation.volumeRequired'))
      .max(10000, t('editRequestDialog.validation.volumeMax')),
    regions: z.array(z.string()).min(1, t('editRequestDialog.validation.regionsRequired')),
    target_week: z.string().min(1, t('editRequestDialog.validation.targetWeekRequired')),
    age_range_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional().nullable(),
    age_range_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional().nullable(),
    weight_range_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional().nullable(),
    weight_range_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional().nullable(),
  });
}

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface EditRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PoolRequest;
  userRole: PoolRequestRole;
}

interface LockedFieldWrapperProps {
  field: 'regions' | 'age_range_min' | 'age_range_max' | 'weight_range_min' | 'weight_range_max' | 'required_volume' | 'target_week';
  status: PoolRequestLifecycleStatus;
  role: PoolRequestRole;
  children: React.ReactNode;
}

function LockedFieldWrapper({ field, status, role, children }: LockedFieldWrapperProps) {
  const isLocked = !canEditField(field, status, role);
  const tooltip = getFieldLockedTooltip(field, status, role);
  
  if (!isLocked) {
    return <>{children}</>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center cursor-not-allowed">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function EditRequestDialog({ open, onOpenChange, request, userRole }: EditRequestDialogProps) {
  const { t } = useTranslation();
  const formSchema = useMemo(() => getFormSchema(t), [t]);
  const updateRequest = useUpdatePoolRequest();
  const weekOptions = getTargetWeekOptions();

  const status = request.status as PoolRequestLifecycleStatus;
  const canEdit = canEditPoolRequest(status, userRole);
  const lockedTooltip = getPoolRequestLockedTooltip(status, userRole);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      required_volume: request.required_volume,
      regions: request.regions || [],
      target_week: request.target_week,
      age_range_min: request.age_range_min ?? undefined,
      age_range_max: request.age_range_max ?? undefined,
      weight_range_min: request.weight_range_min ?? undefined,
      weight_range_max: request.weight_range_max ?? undefined,
    },
  });

  // Reset form when request changes
  useEffect(() => {
    form.reset({
      required_volume: request.required_volume,
      regions: request.regions || [],
      target_week: request.target_week,
      age_range_min: request.age_range_min ?? undefined,
      age_range_max: request.age_range_max ?? undefined,
      weight_range_min: request.weight_range_min ?? undefined,
      weight_range_max: request.weight_range_max ?? undefined,
    });
  }, [request, form]);

  const onSubmit = async (data: FormData) => {
    if (!canEdit) return;
    
    await updateRequest.mutateAsync({
      id: request.id,
      required_volume: data.required_volume,
      regions: data.regions,
      target_week: data.target_week,
      age_range_min: data.age_range_min || null,
      age_range_max: data.age_range_max || null,
      weight_range_min: data.weight_range_min || null,
      weight_range_max: data.weight_range_max || null,
    });
    
    onOpenChange(false);
  };

  const selectedRegions = form.watch('regions');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <DialogTitle>{t('editRequestDialog.title')}</DialogTitle>
            <Badge variant="outline" className="text-xs">
              {POOL_REQUEST_STATUS_LABELS[status]}
            </Badge>
          </div>
          <DialogDescription>
            {canEdit
              ? t('editRequestDialog.description.editable')
              : lockedTooltip
            }
          </DialogDescription>
        </DialogHeader>

        {!canEdit && (
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">{t('editRequestDialog.alerts.locked')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{lockedTooltip}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Volume and Target Week */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="required_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('editRequestDialog.fields.requiredVolume')}</FormLabel>
                    <LockedFieldWrapper field="required_volume" status={status} role={userRole}>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('editRequestDialog.fields.requiredVolumePlaceholder')}
                          disabled={!canEditField('required_volume', status, userRole)}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                    </LockedFieldWrapper>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('editRequestDialog.fields.deliveryPeriod')}</FormLabel>
                    <LockedFieldWrapper field="target_week" status={status} role={userRole}>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!canEditField('target_week', status, userRole)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('editRequestDialog.fields.targetWeekPlaceholder')} />
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
                    </LockedFieldWrapper>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Regions */}
            <FormField
              control={form.control}
              name="regions"
              render={() => (
                <FormItem>
                  <FormLabel>{t('editRequestDialog.fields.targetRegions')}</FormLabel>
                  <LockedFieldWrapper field="regions" status={status} role={userRole}>
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
                                  disabled={!canEditField('regions', status, userRole)}
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
                  </LockedFieldWrapper>
                  {selectedRegions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('editRequestDialog.fields.regionsSelected', { count: selectedRegions.length })}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Age & Weight Ranges */}
            <div>
              <h4 className="text-sm font-medium mb-3">{t('editRequestDialog.fields.acceptanceCriteria')}</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm">{t('editRequestDialog.fields.ageRange')}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="age_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <LockedFieldWrapper field="age_range_min" status={status} role={userRole}>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('editRequestDialog.fields.minPlaceholder')}
                                disabled={!canEditField('age_range_min', status, userRole)}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                          </LockedFieldWrapper>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <FormField
                      control={form.control}
                      name="age_range_max"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <LockedFieldWrapper field="age_range_max" status={status} role={userRole}>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('editRequestDialog.fields.maxPlaceholder')}
                                disabled={!canEditField('age_range_max', status, userRole)}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                          </LockedFieldWrapper>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm">{t('editRequestDialog.fields.weightRange')}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="weight_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <LockedFieldWrapper field="weight_range_min" status={status} role={userRole}>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('editRequestDialog.fields.minPlaceholder')}
                                disabled={!canEditField('weight_range_min', status, userRole)}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                          </LockedFieldWrapper>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <FormField
                      control={form.control}
                      name="weight_range_max"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <LockedFieldWrapper field="weight_range_max" status={status} role={userRole}>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('editRequestDialog.fields.maxPlaceholder')}
                                disabled={!canEditField('weight_range_max', status, userRole)}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                          </LockedFieldWrapper>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('editRequestDialog.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!canEdit || updateRequest.isPending}
              >
                {updateRequest.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('editRequestDialog.buttons.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
