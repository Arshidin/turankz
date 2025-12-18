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
import { useCalculateSettlement } from '@/hooks/useExecutions';
import { Loader2, Info, Calculator } from 'lucide-react';
import { PricingDisclaimer } from '@/components/pricing';

const formSchema = z.object({
  settlement_reference_price: z.coerce.number().min(1, 'Reference price is required'),
  settlement_premiums_applied: z.coerce.number().min(0, 'Premiums cannot be negative'),
  settlement_notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SettlementCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executionId: string;
  suggestedReferencePrice?: number;
  suggestedPremiums?: number;
  deliveredVolume: number;
  performedBy: string;
}

export function SettlementCalculationDialog({
  open,
  onOpenChange,
  executionId,
  suggestedReferencePrice = 0,
  suggestedPremiums = 0,
  deliveredVolume,
  performedBy,
}: SettlementCalculationDialogProps) {
  const calculateSettlement = useCalculateSettlement();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      settlement_reference_price: suggestedReferencePrice,
      settlement_premiums_applied: suggestedPremiums,
      settlement_notes: '',
    },
  });

  const watchedPrice = form.watch('settlement_reference_price') || 0;
  const watchedPremiums = form.watch('settlement_premiums_applied') || 0;
  const indicativeTotal = watchedPrice + watchedPremiums;

  const onSubmit = async (data: FormData) => {
    await calculateSettlement.mutateAsync({
      id: executionId,
      settlement_reference_price: data.settlement_reference_price,
      settlement_premiums_applied: data.settlement_premiums_applied,
      settlement_notes: data.settlement_notes,
      performed_by: performedBy,
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Indicative Settlement
          </DialogTitle>
          <DialogDescription>
            Calculate the indicative settlement based on market reference prices.
          </DialogDescription>
        </DialogHeader>

        <PricingDisclaimer variant="alert" compact />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="settlement_reference_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Price (₸/kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 2500" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Market reference at delivery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settlement_premiums_applied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premiums Applied (₸/kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 150" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Earned incentive premiums
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Indicative calculation preview */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Indicative Settlement Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Delivered Volume:</span>
                <span className="text-right font-medium">{deliveredVolume} heads</span>
                
                <span className="text-muted-foreground">Reference Price:</span>
                <span className="text-right">{watchedPrice} ₸/kg</span>
                
                <span className="text-muted-foreground">+ Premiums:</span>
                <span className="text-right text-emerald-600">+{watchedPremiums} ₸/kg</span>
                
                <span className="font-medium border-t pt-2">Indicative Total:</span>
                <span className="text-right font-semibold border-t pt-2">{indicativeTotal} ₸/kg</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="settlement_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Settlement Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any notes about this settlement calculation..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="border-blue-500/30 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700">
                TURAN does not handle payments. This is an indicative settlement 
                statement for reference only. Actual payment is settled directly 
                between parties.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={calculateSettlement.isPending}>
                {calculateSettlement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Calculate Settlement
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
