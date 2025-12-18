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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScheduleDelivery } from '@/hooks/useExecutions';
import { Loader2, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  expected_delivery_start: z.date({ required_error: 'Start date is required' }),
  expected_delivery_end: z.date({ required_error: 'End date is required' }),
  delivery_location: z.string().max(200).optional(),
  scheduling_notes: z.string().max(500).optional(),
}).refine(data => data.expected_delivery_end >= data.expected_delivery_start, {
  message: 'End date must be after start date',
  path: ['expected_delivery_end'],
});

type FormData = z.infer<typeof formSchema>;

interface DeliverySchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionId: string;
  scheduledBy: string;
}

export function DeliverySchedulingDialog({
  open,
  onOpenChange,
  executionId,
  scheduledBy,
}: DeliverySchedulingDialogProps) {
  const scheduleDelivery = useScheduleDelivery();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivery_location: '',
      scheduling_notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    await scheduleDelivery.mutateAsync({
      id: executionId,
      expected_delivery_start: format(data.expected_delivery_start, 'yyyy-MM-dd'),
      expected_delivery_end: format(data.expected_delivery_end, 'yyyy-MM-dd'),
      delivery_location: data.delivery_location,
      scheduling_notes: data.scheduling_notes,
      scheduled_by: scheduledBy,
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Delivery</DialogTitle>
          <DialogDescription>
            Set the expected delivery range for this execution.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-700">
            This is an indicative delivery range for planning purposes. 
            Actual delivery dates are confirmed by the MPK during execution.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expected_delivery_start"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Start</FormLabel>
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
                            {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
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
                name="expected_delivery_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected End</FormLabel>
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
                            {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="delivery_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Delivery Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Almaty Processing Facility" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    For reference only - not a binding logistics instruction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduling_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any scheduling notes..."
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
              <Button type="submit" disabled={scheduleDelivery.isPending}>
                {scheduleDelivery.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Delivery
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
