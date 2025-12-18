import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReallocateMatchingVolume, type MatchingWithDetails } from '@/hooks/useMatchings';
import { ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface ReallocateVolumeDialogProps {
  matching: MatchingWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReallocateVolumeDialog({
  matching,
  open,
  onOpenChange,
}: ReallocateVolumeDialogProps) {
  const [newHeads, setNewHeads] = useState('');
  const [reason, setReason] = useState('');
  const reallocate = useReallocateMatchingVolume();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && matching) {
      setNewHeads(String(matching.heads_matched));
      setReason('');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!matching) return;
    
    const newHeadsNum = parseInt(newHeads, 10);
    if (isNaN(newHeadsNum) || newHeadsNum <= 0) return;
    if (!reason.trim()) return;

    reallocate.mutate(
      {
        matchId: matching.id,
        newHeadsMatched: newHeadsNum,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNewHeads('');
          setReason('');
        },
      }
    );
  };

  if (!matching) return null;

  const batchHeads = matching.batch?.heads || 0;
  const currentHeads = matching.heads_matched;
  const newHeadsNum = parseInt(newHeads, 10) || 0;
  const difference = newHeadsNum - currentHeads;
  const isValid = newHeadsNum > 0 && newHeadsNum !== currentHeads && reason.trim().length > 0;
  const exceedsBatch = newHeadsNum > batchHeads;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Reallocate Volume
          </DialogTitle>
          <DialogDescription>
            Adjust the matched volume for batch{' '}
            <span className="font-medium">{matching.batch?.batch_number || matching.batch_id.slice(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current allocation info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Current Allocation</span>
              <p className="font-semibold text-lg">{currentHeads} heads</p>
            </div>
            <div>
              <span className="text-muted-foreground">Batch Capacity</span>
              <p className="font-semibold text-lg">{batchHeads} heads</p>
            </div>
          </div>

          {/* New volume input */}
          <div className="space-y-2">
            <Label htmlFor="new-heads">New Volume (heads)</Label>
            <Input
              id="new-heads"
              type="number"
              min={1}
              max={batchHeads}
              value={newHeads}
              onChange={(e) => setNewHeads(e.target.value)}
              placeholder="Enter new volume"
            />
            {difference !== 0 && !isNaN(difference) && (
              <p className={`text-sm ${difference > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {difference > 0 ? '+' : ''}{difference} heads from current allocation
              </p>
            )}
          </div>

          {/* Warning for exceeding batch */}
          {exceedsBatch && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cannot allocate more than batch capacity ({batchHeads} heads)
              </AlertDescription>
            </Alert>
          )}

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="realloc-reason">Reason for Reallocation *</Label>
            <Textarea
              id="realloc-reason"
              placeholder="Explain why this volume is being adjusted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the audit log
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || exceedsBatch || reallocate.isPending}
          >
            {reallocate.isPending ? 'Saving...' : 'Update Volume'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
