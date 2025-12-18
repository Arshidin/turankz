import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useCreateMatching } from '@/hooks/useMatchings';
import { useCurrentMatchingWindow } from '@/hooks/useMatchingWindows';
import { canCreateMatching } from '@/lib/matching-lifecycle';
import type { ConfirmedBatch } from '@/hooks/useConfirmedBatches';
import type { MatchingPoolRequest } from '@/hooks/useMatchingRequests';
import { Link2, AlertTriangle, Package, Target, CheckCircle2, Loader2, Info } from 'lucide-react';

interface CreateMatchingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBatch: ConfirmedBatch | null;
  selectedRequest: MatchingPoolRequest | null;
  onSuccess?: () => void;
}

export function CreateMatchingDialog({
  open,
  onOpenChange,
  selectedBatch,
  selectedRequest,
  onSuccess,
}: CreateMatchingDialogProps) {
  const { data: matchingWindow } = useCurrentMatchingWindow();
  const createMatching = useCreateMatching();

  const [matchedVolume, setMatchedVolume] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Calculate constraints
  const maxBatchVolume = selectedBatch?.available_heads || 0;
  const maxRequestVolume = selectedRequest?.remaining_volume || 0;
  const maxVolume = Math.min(maxBatchVolume, maxRequestVolume);

  // Reset volume when selection changes
  useMemo(() => {
    if (selectedBatch && selectedRequest) {
      setMatchedVolume(maxVolume);
    }
  }, [selectedBatch?.id, selectedRequest?.id, maxVolume]);

  // Validation
  const canCreate = canCreateMatching(matchingWindow);
  
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!selectedBatch) {
      errors.push('Select a batch');
    }
    if (!selectedRequest) {
      errors.push('Select a pool request');
    }
    if (matchedVolume <= 0) {
      errors.push('Matched volume must be greater than 0');
    }
    if (matchedVolume > maxBatchVolume) {
      errors.push(`Volume exceeds batch available (${maxBatchVolume})`);
    }
    if (matchedVolume > maxRequestVolume) {
      errors.push(`Volume exceeds request remaining (${maxRequestVolume})`);
    }
    if (!canCreate.allowed) {
      errors.push(canCreate.reason || 'Cannot create matching');
    }

    return errors;
  }, [selectedBatch, selectedRequest, matchedVolume, maxBatchVolume, maxRequestVolume, canCreate]);

  const isValid = validationErrors.length === 0;

  const handleCreate = async () => {
    if (!isValid || !selectedBatch || !selectedRequest) return;

    try {
      // Create matching - status updates are handled automatically by the hook
      await createMatching.mutateAsync({
        matches: [
          {
            request_id: selectedRequest.id,
            batch_id: selectedBatch.id,
            heads_matched: matchedVolume,
          },
        ],
        matchingWindow: matchingWindow || null,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setMatchedVolume(0);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createMatching.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Create Matching
          </DialogTitle>
          <DialogDescription>
            Bind supply (batch) to demand (pool request)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Matching Window Warning */}
          {!canCreate.allowed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{canCreate.reason}</AlertDescription>
            </Alert>
          )}

          {/* Selected Batch */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Selected Batch (Supply)</Label>
            {selectedBatch ? (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedBatch.batch_number}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                    {selectedBatch.available_heads} available
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedBatch.region} · Grade {selectedBatch.grade} · {selectedBatch.heads} total heads
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                No batch selected
              </div>
            )}
          </div>

          {/* Selected Request */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Selected Request (Demand)</Label>
            {selectedRequest ? (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedRequest.request_number}</span>
                  </div>
                  <Badge className="bg-violet-500/10 text-violet-600 border-0 text-xs">
                    {selectedRequest.remaining_volume} remaining
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRequest.mpk_name} · {selectedRequest.regions.join(', ')} · Grade {selectedRequest.required_grade}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                No request selected
              </div>
            )}
          </div>

          {/* Volume Selection */}
          {selectedBatch && selectedRequest && maxVolume > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Matched Volume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={maxVolume}
                    value={matchedVolume}
                    onChange={(e) => setMatchedVolume(Math.min(maxVolume, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">/ {maxVolume} max</span>
                </div>
              </div>

              <Slider
                value={[matchedVolume]}
                onValueChange={([value]) => setMatchedVolume(value)}
                max={maxVolume}
                min={0}
                step={1}
                className="py-2"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Partial match</span>
                <span>Full match ({maxVolume})</span>
              </div>

              {matchedVolume === maxVolume && (
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Full volume match
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this matching..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
            />
          </div>

          {/* Automatic Updates Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Status updates are automatic: Batch → Matched, Request → Partial/Fulfilled based on volumes.
            </AlertDescription>
          </Alert>

          {/* Validation Errors */}
          {validationErrors.length > 0 && selectedBatch && selectedRequest && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Create Matching
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
