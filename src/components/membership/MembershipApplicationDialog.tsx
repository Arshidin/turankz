import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
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
import {
  Loader2,
  User,
  MapPin,
  Beef,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useMembershipApplication } from '@/hooks/useMembershipApplication';
import {
  membershipApplicationSchema,
  type MembershipApplicationData,
  REGIONS,
  LIVESTOCK_TYPES,
  EXPERIENCE_OPTIONS,
  SOURCE_OPTIONS,
} from '@/lib/membership-validation';
import { cn } from '@/lib/utils';

interface MembershipApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 1, icon: User, titleKey: 'membership.form.steps.personal' },
  { id: 2, icon: MapPin, titleKey: 'membership.form.steps.location' },
  { id: 3, icon: Beef, titleKey: 'membership.form.steps.livestock' },
  { id: 4, icon: CheckCircle2, titleKey: 'membership.form.steps.confirm' },
] as const;

export function MembershipApplicationDialog({
  open,
  onOpenChange,
}: MembershipApplicationDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submitApplication = useMembershipApplication();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<MembershipApplicationData>({
    resolver: zodResolver(membershipApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      iin: '',
      phone: '+7 ',
      email: '',
      farm_name: '',
      region: undefined,
      district: '',
      settlement: '',
      livestock_types: [],
      herd_size_cattle: undefined,
      herd_size_sheep: undefined,
      herd_size_horses: undefined,
      experience_years: undefined,
      how_did_you_hear: undefined,
      comments: '',
      terms_accepted: false as unknown as true,
      data_processing_accepted: false as unknown as true,
    },
  });

  const selectedLivestockTypes = form.watch('livestock_types');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setCurrentStep(1);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: MembershipApplicationData) => {
    const { terms_accepted, data_processing_accepted, ...payload } = data;

    submitApplication.mutate(payload, {
      onSuccess: (result) => {
        form.reset();
        setCurrentStep(1);
        handleOpenChange(false);
        navigate('/join/success', {
          state: {
            applicationNumber: result.application_number,
            createdAt: result.created_at,
          },
        });
      },
    });
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits.startsWith('7') ? digits : '7' + digits;
    formatted = formatted.slice(0, 11);

    let result = '+7';
    if (formatted.length > 1) result += ' ' + formatted.slice(1, 4);
    if (formatted.length > 4) result += ' ' + formatted.slice(4, 7);
    if (formatted.length > 7) result += ' ' + formatted.slice(7, 9);
    if (formatted.length > 9) result += ' ' + formatted.slice(9, 11);

    return result;
  };

  // Step validation
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof MembershipApplicationData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['full_name', 'iin', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['region', 'district', 'settlement'];
        break;
      case 3:
        fieldsToValidate = ['livestock_types', 'experience_years'];
        break;
      case 4:
        fieldsToValidate = ['terms_accepted', 'data_processing_accepted'];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* Progress Header */}
        <div className="px-6 pt-6 pb-4">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive && "bg-[var(--accent-primary)] text-white scale-110",
                      isCompleted && "bg-[var(--color-success)] text-white",
                      !isActive && !isCompleted && "bg-[var(--bg-muted)] text-[var(--text-tertiary)]"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-1 mx-2 rounded-full transition-colors duration-300",
                        isCompleted ? "bg-[var(--color-success)]" : "bg-[var(--bg-muted)]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step title and description */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t(STEPS[currentStep - 1].titleKey)}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t(`membership.form.steps.${currentStep}_description`)}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 1: Personal Data */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.full_name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('membership.form.placeholders.full_name')}
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.iin')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000000000"
                            maxLength={12}
                            className="h-12"
                            {...field}
                          />
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
                        <FormLabel>{t('membership.form.fields.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+7 XXX XXX XX XX"
                            className="h-12"
                            {...field}
                            onChange={(e) => {
                              field.onChange(formatPhoneNumber(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Location Data */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="farm_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.farm_name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('membership.form.placeholders.farm_name')}
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.region')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t('membership.form.placeholders.region')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {t(`membership.regions.${region}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('membership.form.fields.district')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('membership.form.placeholders.district')}
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settlement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('membership.form.fields.settlement')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('membership.form.placeholders.settlement')}
                              className="h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Livestock Info */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="livestock_types"
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.livestock_types')}</FormLabel>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          {LIVESTOCK_TYPES.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="livestock_types"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(type);
                                return (
                                  <FormItem>
                                    <FormControl>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newValue = isChecked
                                            ? field.value?.filter((v) => v !== type) || []
                                            : [...(field.value || []), type];
                                          field.onChange(newValue);
                                        }}
                                        className={cn(
                                          "w-full p-3 rounded-lg border-2 transition-all duration-200 text-center",
                                          isChecked
                                            ? "border-[var(--accent-primary)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]"
                                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-secondary)]"
                                        )}
                                      >
                                        <span className="text-sm font-medium">
                                          {t(`membership.form.fields.${type}`)}
                                        </span>
                                      </button>
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic herd size inputs */}
                  {selectedLivestockTypes && selectedLivestockTypes.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedLivestockTypes.includes('cattle') && (
                        <FormField
                          control={form.control}
                          name="herd_size_cattle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('membership.form.fields.herd_size_cattle')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="0"
                                  className="h-10"
                                  value={field.value ?? ''}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val === '' ? undefined : parseInt(val) || undefined);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {selectedLivestockTypes.includes('sheep') && (
                        <FormField
                          control={form.control}
                          name="herd_size_sheep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('membership.form.fields.herd_size_sheep')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="0"
                                  className="h-10"
                                  value={field.value ?? ''}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val === '' ? undefined : parseInt(val) || undefined);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {selectedLivestockTypes.includes('horses') && (
                        <FormField
                          control={form.control}
                          name="herd_size_horses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('membership.form.fields.herd_size_horses')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="0"
                                  className="h-10"
                                  value={field.value ?? ''}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(val === '' ? undefined : parseInt(val) || undefined);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.experience_years')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t('membership.form.placeholders.experience')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {t(`membership.form.experience_options.${option}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="how_did_you_hear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.how_did_you_hear')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t('membership.form.placeholders.source')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SOURCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {t(`membership.form.source_options.${option}`)}
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
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('membership.form.fields.comments')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('membership.form.placeholders.comments')}
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('membership.form.fields.comments_hint')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agreements */}
                  <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                    <FormField
                      control={form.control}
                      name="terms_accepted"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {t('membership.form.fields.terms_accepted')}
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_processing_accepted"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {t('membership.form.fields.data_processing_accepted')}
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-[var(--border-subtle)]">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('membership.form.back')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="h-12"
                  >
                    {t('membership.form.cancel')}
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 px-6"
                  >
                    {t('membership.form.next')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitApplication.isPending}
                    className="h-12 px-6"
                  >
                    {submitApplication.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {submitApplication.isPending
                      ? t('membership.form.submitting')
                      : t('membership.form.submit')}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
