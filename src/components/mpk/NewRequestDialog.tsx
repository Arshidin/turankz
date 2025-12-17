import { useState } from 'react';
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
import { useCreatePoolRequest } from '@/hooks/usePoolRequests';
import { Loader2 } from 'lucide-react';

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
});

type FormData = z.infer<typeof formSchema>;

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mpkId: string;
  mpkName: string;
}

export function NewRequestDialog({ open, onOpenChange, mpkId, mpkName }: NewRequestDialogProps) {
  const createRequest = useCreatePoolRequest();
  const weekOptions = getTargetWeekOptions();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      required_volume: undefined,
      required_grade: '',
      regions: [],
      target_week: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    await createRequest.mutateAsync({
      mpk_id: mpkId,
      mpk_name: mpkName,
      required_volume: data.required_volume,
      required_grade: data.required_grade,
      regions: data.regions,
      target_week: data.target_week,
      notes: data.notes || null,
    });
    
    form.reset();
    onOpenChange(false);
  };

  const selectedRegions = form.watch('regions');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Request</DialogTitle>
          <DialogDescription>
            Submit a new procurement request to the pool. Matching will begin automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
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
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
