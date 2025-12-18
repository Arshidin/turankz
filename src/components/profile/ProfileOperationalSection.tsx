/**
 * PROFILE OPERATIONAL SECTION
 * 
 * Self-editable operational profile.
 * Changes are logged. During active matching windows, shows notice.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Save, 
  X, 
  Briefcase, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';

const DELIVERY_PERIODS = ['short_term', 'mid_term', 'long_term'] as const;

const HERD_SIZE_RANGES = [
  '1-50',
  '51-100',
  '101-250',
  '251-500',
  '500+',
];

const CAPACITY_RANGES = [
  '50-100',
  '101-250',
  '251-500',
  '501-1000',
  '1000+',
];

// Farmer form schema
const farmerFormSchema = z.object({
  contact_name: z.string().min(2, 'Contact name is required').max(100),
  phone: z.string().min(5, 'Phone number is required').max(20),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  estimated_herd_size: z.string().optional(),
  preferred_delivery_periods: z.array(z.string()).optional(),
});

// MPK form schema  
const mpkFormSchema = z.object({
  contact_person: z.string().min(2, 'Contact person is required').max(100),
  phone: z.string().min(5, 'Phone number is required').max(20),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  planned_capacity: z.string().optional(),
  preferred_delivery_periods: z.array(z.string()).optional(),
});

type FarmerFormData = z.infer<typeof farmerFormSchema>;
type MpkFormData = z.infer<typeof mpkFormSchema>;

interface FarmerOperationalData {
  type: 'farmer';
  contactName: string | null;
  phone: string | null;
  email: string | null;
  estimatedHerdSize?: string;
  preferredDeliveryPeriods?: string[];
}

interface MpkOperationalData {
  type: 'mpk';
  contactPerson?: string;
  phone?: string;
  email?: string;
  plannedCapacity?: string;
  preferredDeliveryPeriods?: string[];
  typicalVolumeMin: number | null;
  typicalVolumeMax: number | null;
  commonTargetWeeks: string[] | null;
}

type OperationalData = FarmerOperationalData | MpkOperationalData;

interface ProfileOperationalSectionProps {
  data: OperationalData;
  onSave: (updates: Partial<FarmerFormData> | Partial<MpkFormData>) => Promise<void>;
  isSaving?: boolean;
}

export function ProfileOperationalSection({ 
  data, 
  onSave, 
  isSaving = false 
}: ProfileOperationalSectionProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { data: currentWindow } = useCurrentMatchingWindow();

  const isActiveWindow = currentWindow?.status === 'active' || currentWindow?.status === 'locked';

  if (data.type === 'farmer') {
    return (
      <FarmerOperationalForm
        data={data}
        onSave={onSave}
        isSaving={isSaving}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isActiveWindow={isActiveWindow}
      />
    );
  }

  return (
    <MpkOperationalForm
      data={data}
      onSave={onSave}
      isSaving={isSaving}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isActiveWindow={isActiveWindow}
    />
  );
}

interface FormProps {
  data: FarmerOperationalData | MpkOperationalData;
  onSave: (updates: unknown) => Promise<void>;
  isSaving: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isActiveWindow: boolean;
}

function FarmerOperationalForm({ 
  data, 
  onSave, 
  isSaving, 
  isEditing, 
  setIsEditing,
  isActiveWindow 
}: FormProps & { data: FarmerOperationalData }) {
  const { t } = useTranslation();

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      contact_name: data.contactName || '',
      phone: data.phone || '',
      email: data.email || '',
      estimated_herd_size: data.estimatedHerdSize || '',
      preferred_delivery_periods: data.preferredDeliveryPeriods || [],
    },
  });

  useEffect(() => {
    form.reset({
      contact_name: data.contactName || '',
      phone: data.phone || '',
      email: data.email || '',
      estimated_herd_size: data.estimatedHerdSize || '',
      preferred_delivery_periods: data.preferredDeliveryPeriods || [],
    });
  }, [data, form]);

  const handleSave = async (formData: FarmerFormData) => {
    await onSave(formData);
    setIsEditing(false);
  };

  const toggleDeliveryPeriod = (period: string) => {
    const current = form.getValues('preferred_delivery_periods') || [];
    const updated = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    form.setValue('preferred_delivery_periods', updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {t('profile.operational.title')}
            </CardTitle>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </div>
        <CardDescription>
          {t('profile.operational.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActiveWindow && isEditing && (
          <Alert className="mb-4 border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              {t('profile.operational.activeWindowNotice')}
            </AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.operational.contactPerson')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_herd_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.operational.estimatedHerdSize')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.operational.selectRange')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HERD_SIZE_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range} {t('common.heads')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('profile.operational.herdSizeHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_delivery_periods"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('profile.operational.preferredDeliveryPeriods')}</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERY_PERIODS.map((period) => (
                        <Badge
                          key={period}
                          variant={form.watch('preferred_delivery_periods')?.includes(period) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleDeliveryPeriod(period)}
                        >
                          {t(`deliveryPeriods.${period}`)}
                        </Badge>
                      ))}
                    </div>
                    <FormDescription>
                      {t('profile.operational.deliveryPeriodsHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('common.save')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.contactPerson')}
                </p>
                <p className="font-medium">{data.contactName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('common.phone')}
                </p>
                <p className="font-medium">{data.phone || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('common.email')}
              </p>
              <p className="font-medium">{data.email || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.estimatedHerdSize')}
                </p>
                <p className="font-medium">
                  {data.estimatedHerdSize ? `${data.estimatedHerdSize} ${t('common.heads')}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.preferredDeliveryPeriods')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.preferredDeliveryPeriods && data.preferredDeliveryPeriods.length > 0 ? (
                    data.preferredDeliveryPeriods.map((period) => (
                      <Badge key={period} variant="secondary" className="text-xs">
                        {t(`deliveryPeriods.${period}`)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MpkOperationalForm({ 
  data, 
  onSave, 
  isSaving, 
  isEditing, 
  setIsEditing,
  isActiveWindow 
}: FormProps & { data: MpkOperationalData }) {
  const { t } = useTranslation();

  const form = useForm<MpkFormData>({
    resolver: zodResolver(mpkFormSchema),
    defaultValues: {
      contact_person: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      planned_capacity: data.plannedCapacity || '',
      preferred_delivery_periods: data.preferredDeliveryPeriods || [],
    },
  });

  useEffect(() => {
    form.reset({
      contact_person: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      planned_capacity: data.plannedCapacity || '',
      preferred_delivery_periods: data.preferredDeliveryPeriods || [],
    });
  }, [data, form]);

  const handleSave = async (formData: MpkFormData) => {
    await onSave(formData);
    setIsEditing(false);
  };

  const toggleDeliveryPeriod = (period: string) => {
    const current = form.getValues('preferred_delivery_periods') || [];
    const updated = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    form.setValue('preferred_delivery_periods', updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {t('profile.operational.title')}
            </CardTitle>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </div>
        <CardDescription>
          {t('profile.operational.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActiveWindow && isEditing && (
          <Alert className="mb-4 border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              {t('profile.operational.activeWindowNotice')}
            </AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.operational.contactPerson')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planned_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.operational.plannedCapacity')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.operational.selectRange')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAPACITY_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range} {t('common.heads')}/{t('common.week')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('profile.operational.capacityHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_delivery_periods"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('profile.operational.preferredDeliveryPeriods')}</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERY_PERIODS.map((period) => (
                        <Badge
                          key={period}
                          variant={form.watch('preferred_delivery_periods')?.includes(period) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleDeliveryPeriod(period)}
                        >
                          {t(`deliveryPeriods.${period}`)}
                        </Badge>
                      ))}
                    </div>
                    <FormDescription>
                      {t('profile.operational.deliveryPeriodsHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('common.save')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.contactPerson')}
                </p>
                <p className="font-medium">{data.contactPerson || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('common.phone')}
                </p>
                <p className="font-medium">{data.phone || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('common.email')}
              </p>
              <p className="font-medium">{data.email || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.plannedCapacity')}
                </p>
                <p className="font-medium">
                  {data.typicalVolumeMin && data.typicalVolumeMax 
                    ? `${data.typicalVolumeMin}–${data.typicalVolumeMax} ${t('common.heads')}/${t('common.week')}`
                    : data.plannedCapacity || '—'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t('profile.operational.preferredDeliveryPeriods')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.preferredDeliveryPeriods && data.preferredDeliveryPeriods.length > 0 ? (
                    data.preferredDeliveryPeriods.map((period) => (
                      <Badge key={period} variant="secondary" className="text-xs">
                        {t(`deliveryPeriods.${period}`)}
                      </Badge>
                    ))
                  ) : data.commonTargetWeeks && data.commonTargetWeeks.length > 0 ? (
                    data.commonTargetWeeks.map((week) => (
                      <Badge key={week} variant="secondary" className="text-xs">
                        {week}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
