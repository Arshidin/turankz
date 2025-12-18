import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfirmedBatches, type ConfirmedBatch, type ConfirmedBatchFilters } from '@/hooks/useConfirmedBatches';
import { Package, MapPin, Scale, Calendar } from 'lucide-react';

interface ConfirmedBatchesListProps {
  filters: ConfirmedBatchFilters;
  selectedBatchId: string | null;
  onSelectBatch: (batch: ConfirmedBatch) => void;
}

export function ConfirmedBatchesList({
  filters,
  selectedBatchId,
  onSelectBatch,
}: ConfirmedBatchesListProps) {
  const { data: batches, isLoading } = useConfirmedBatches(filters);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Confirmed Batches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAvailable = batches?.reduce((sum, b) => sum + b.available_heads, 0) || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Confirmed Batches
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {batches?.length || 0} batches · {totalAvailable} available
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Select a batch to create matching
        </p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <ScrollArea className="h-[400px] pr-2">
          {!batches || batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No confirmed batches found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Adjust filters or wait for batches to be confirmed
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => onSelectBatch(batch)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBatchId === batch.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                  } ${batch.available_heads === 0 ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{batch.batch_number}</span>
                    <div className="flex items-center gap-1">
                      {batch.available_heads === 0 ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Fully matched
                        </Badge>
                      ) : batch.available_heads < batch.heads ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">
                          {batch.available_heads} / {batch.heads} avail.
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                          {batch.available_heads} heads
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {batch.region}
                    </span>
                    <span>Grade {batch.grade}</span>
                    {batch.target_week && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {batch.target_week}
                      </span>
                    )}
                  </div>

                  {(batch.weight_min || batch.weight_max || batch.age_min || batch.age_max) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(batch.weight_min || batch.weight_max) && (
                        <Badge variant="outline" className="text-xs font-normal py-0">
                          <Scale className="h-2.5 w-2.5 mr-1" />
                          {batch.weight_min || '–'}–{batch.weight_max || '–'} kg
                        </Badge>
                      )}
                      {(batch.age_min || batch.age_max) && (
                        <Badge variant="outline" className="text-xs font-normal py-0">
                          {batch.age_min || '–'}–{batch.age_max || '–'} mo
                        </Badge>
                      )}
                      {batch.breed && (
                        <Badge variant="outline" className="text-xs font-normal py-0">
                          {batch.breed}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
