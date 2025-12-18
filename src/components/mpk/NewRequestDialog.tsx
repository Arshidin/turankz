import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2, Info, AlertTriangle, Clock } from 'lucide-react';
import { LIVESTOCK_BREEDS, LIVESTOCK_GENDERS, AGE_RANGE, WEIGHT_RANGE, type AcceptanceCriteria } from '@/lib/livestock-criteria';
import { canSubmitPoolRequest } from '@/lib/pool-request-lifecycle';
import { calculateCountdown } from '@/lib/matching-window';
import { format, parseISO } from 'date-fns';

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

const formSchema = z.object({
  required_volume: z.coerce.number().min(1, 'At least 1 head required').max(10000, 'Maximum 10,000 heads'),
  required_grade: z.string().min(1, 'Grade is required'),
  regions: z.array(z.string()).min(1, 'Select at least one region'),
  target_week: z.string().min(1, 'Target week is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  // Acceptance criteria
  accepted_breeds: z.array(z.string()),
  accepted_genders: z.array(z.string()),
  age_range_min: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
  age_range_max: z.coerce.number().min(AGE_RANGE.min).max(AGE_RANGE.max).optional(),
  weight_range_min: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
  weight_range_max: z.coerce.number().min(WEIGHT_RANGE.min).max(WEIGHT_RANGE.max).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mpkId: string;
  mpkName: string;
  defaultCriteria?: AcceptanceCriteria;
}

export function NewRequestDialog({ open, onOpenChange, mpkId, mpkName, defaultCriteria }: NewRequestDialogProps) {
  const createRequest = useCreatePoolRequest();
  const { data: matchingWindow } = useCurrentMatchingWindow();
  const weekOptions = getTargetWeekOptions();
  
  // Check submission validation based on matching window
  const submissionValidation = canSubmitPoolRequest(matchingWindow || null);
  const countdown = matchingWindow?.lock_date 
    ? calculateCountdown(matchingWindow.lock_date) 
    : null;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      required_volume: undefined,
      required_grade: '',
      regions: [],
      target_week: matchingWindow?.target_week || '',
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

  const onSubmit = async (data: FormData) => {
    // Double-check submission is still allowed
    if (!submissionValidation.canSubmit) {
      return;
    }
    
    await createRequest.mutateAsync({
      mpk_id: mpkId,
      mpk_name: mpkName,
      required_volume: data.required_volume,
      required_grade: data.required_grade,
      regions: data.regions,
      target_week: data.target_week,
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
          <DialogTitle>Create Purchase Request</DialogTitle>
          <DialogDescription>
            Submit a new procurement request to the pool. Matching will begin automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Submission Status Alert */}
        {!submissionValidation.canSubmit ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {submissionValidation.reason}
            </AlertDescription>
          </Alert>
        ) : countdown && !countdown.isExpired && (
          <Alert className={countdown.days === 0 ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Submission deadline: {matchingWindow?.lock_date && format(parseISO(matchingWindow.lock_date), 'MMM d, yyyy')}
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
                    <FormLabel>Required Volume (heads)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 100" 
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
                name="required_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade === 'Any' ? 'Any Grade' : `Grade ${grade}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Target Week</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target week" />
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
                    When do you need this volume delivered?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regions"
              render={() => (
                <FormItem>
                  <FormLabel>Acceptable Regions</FormLabel>
                  <FormDescription className="text-xs mb-2">
                    Select regions from which you can accept supply
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
                      {selectedRegions.length} region(s) selected
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Acceptance Criteria Section */}
            <div>
              <h4 className="text-sm font-medium mb-1">Acceptance Criteria</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Define livestock characteristics you can accept
              </p>

              {/* Breeds */}
              <FormField
                control={form.control}
                name="accepted_breeds"
                render={() => (
                  <FormItem className="mb-4">
                    <FormLabel className="text-sm">Accepted Breeds</FormLabel>
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
                        {selectedBreeds.length} breed(s) selected
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
                    <FormLabel className="text-sm">Accepted Genders</FormLabel>
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
                  <FormLabel className="text-sm">Age Range (months)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="age_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Min" 
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
                              placeholder="Max" 
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
                  <FormLabel className="text-sm">Weight Range (kg)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="weight_range_min"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Min" 
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
                              placeholder="Max" 
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
                <p className="text-xs text-muted-foreground">
                  Only batches matching acceptance criteria can be included in pool matching.
                </p>
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requirements or preferences..."
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
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRequest.isPending || !submissionValidation.canSubmit}
              >
                {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submissionValidation.canSubmit ? 'Create Request' : 'Submissions Closed'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
