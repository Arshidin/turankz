import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConfirmDelivery } from '@/hooks/useExecutions';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DELIVERY_CONDITIONS = [
  { value: 'excellent', label: 'Excellent - All standards met' },
  { value: 'good', label: 'Good - Minor deviations' },
  { value: 'acceptable', label: 'Acceptable - Within tolerance' },
  { value: 'requires_review', label: 'Requires Review - Issues noted' },
];

const formSchema = z.object({
  actual_delivery_date: z.date({ required_error: 'Delivery date is required' }),
  delivered_volume: z.coerce.number().min(1, 'Volume must be at least 1'),
  delivery_condition: z.string().min(1, 'Condition is required'),
  mpk_delivery_notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DeliveryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionId: string;
  matchedVolume: number;
  confirmedBy: string;
}

export function DeliveryConfirmationDialog({
  open,
  onOpenChange,
  executionId,
  matchedVolume,
  confirmedBy,
}: DeliveryConfirmationDialogProps) {
  const confirmDelivery = useConfirmDelivery();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivered_volume: matchedVolume,
      delivery_condition: '',
      mpk_delivery_notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    await confirmDelivery.mutateAsync({
      id: executionId,
      actual_delivery_date: format(data.actual_delivery_date, 'yyyy-MM-dd'),
      delivered_volume: data.delivered_volume,
      delivery_condition: data.delivery_condition,
      mpk_delivery_notes: data.mpk_delivery_notes,
      mpk_confirmed_by: confirmedBy,
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Delivery</DialogTitle>
          <DialogDescription>
            Confirm the delivery details for this execution. This will be reviewed by admin for compliance.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="actual_delivery_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Actual Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'MMM d, yyyy') : 'Select date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivered_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivered Volume (heads)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Original matched volume: {matchedVolume} heads
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DELIVERY_CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
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
              name="mpk_delivery_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any observations about the delivery..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={confirmDelivery.isPending}>
                {confirmDelivery.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Delivery
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
