import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useMembershipApplication } from '@/hooks/useMembershipApplication';
import {
  membershipApplicationSchema,
  type MembershipApplicationData,
  REGIONS,
  LIVESTOCK_TYPES,
  EXPERIENCE_OPTIONS,
  SOURCE_OPTIONS,
} from '@/lib/membership-validation';

interface MembershipApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipApplicationDialog({
  open,
  onOpenChange,
}: MembershipApplicationDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submitApplication = useMembershipApplication();

  const form = useForm<MembershipApplicationData>({
    resolver: zodResolver(membershipApplicationSchema),
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
      herd_size_cattle: 0,
      herd_size_sheep: 0,
      herd_size_horses: 0,
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
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: MembershipApplicationData) => {
    const { terms_accepted, data_processing_accepted, ...payload } = data;

    submitApplication.mutate(payload, {
      onSuccess: (result) => {
        form.reset();
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
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Ensure starts with 7
    let formatted = digits.startsWith('7') ? digits : '7' + digits;

    // Limit to 11 digits (7 + 10 digits)
    formatted = formatted.slice(0, 11);

    // Format as +7 XXX XXX XX XX
    let result = '+7';
    if (formatted.length > 1) {
      result += ' ' + formatted.slice(1, 4);
    }
    if (formatted.length > 4) {
      result += ' ' + formatted.slice(4, 7);
    }
    if (formatted.length > 7) {
      result += ' ' + formatted.slice(7, 9);
    }
    if (formatted.length > 9) {
      result += ' ' + formatted.slice(9, 11);
    }

    return result;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{t('membership.form.title')}</DialogTitle>
          <DialogDescription>
            {t('membership.form.description')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
              {/* Section 1: Personal Data */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t('membership.form.sections.personal')}
                </h3>

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('membership.form.fields.full_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('membership.form.placeholders.full_name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 2: Farm Data */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t('membership.form.sections.farm')}
                </h3>

                <FormField
                  control={form.control}
                  name="farm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('membership.form.fields.farm_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('membership.form.placeholders.farm_name')} {...field} />
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
                          <SelectTrigger>
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
                          <Input placeholder={t('membership.form.placeholders.district')} {...field} />
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
                          <Input placeholder={t('membership.form.placeholders.settlement')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: Livestock */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t('membership.form.sections.livestock')}
                </h3>

                <FormField
                  control={form.control}
                  name="livestock_types"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('membership.form.fields.livestock_types')}</FormLabel>
                      <div className="space-y-2">
                        {LIVESTOCK_TYPES.map((type) => (
                          <FormField
                            key={type}
                            control={form.control}
                            name="livestock_types"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), type]
                                        : field.value?.filter((v) => v !== type) || [];
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {t(`membership.form.fields.${type}`)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic herd size inputs based on selected types */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedLivestockTypes?.includes('cattle') && (
                    <FormField
                      control={form.control}
                      name="herd_size_cattle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('membership.form.fields.herd_size_cattle')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedLivestockTypes?.includes('sheep') && (
                    <FormField
                      control={form.control}
                      name="herd_size_sheep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('membership.form.fields.herd_size_sheep')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedLivestockTypes?.includes('horses') && (
                    <FormField
                      control={form.control}
                      name="herd_size_horses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('membership.form.fields.herd_size_horses')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('membership.form.fields.experience_years')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

              {/* Section 4: Additional */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                  {t('membership.form.sections.additional')}
                </h3>

                <FormField
                  control={form.control}
                  name="how_did_you_hear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('membership.form.fields.how_did_you_hear')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
              </div>

              {/* Agreements */}
              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
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
                        <FormLabel className="font-normal cursor-pointer">
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
                        <FormLabel className="font-normal cursor-pointer">
                          {t('membership.form.fields.data_processing_accepted')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  {t('membership.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitApplication.isPending
                    ? t('membership.form.submitting')
                    : t('membership.form.submit')}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
