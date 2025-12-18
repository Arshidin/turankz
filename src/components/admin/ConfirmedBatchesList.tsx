import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfirmedBatches, type ConfirmedBatch, type ConfirmedBatchFilters } from '@/hooks/useConfirmedBatches';
import { useMatchingWindows } from '@/hooks/useMatchingWindows';
import { BatchDetailSheet } from './BatchDetailSheet';
import { 
  Package, 
  MapPin, 
  Scale, 
  Calendar, 
  User,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

interface ConfirmedBatchesListProps {
  filters: ConfirmedBatchFilters;
  selectedBatchId: string | null;
  onSelectBatch: (batch: ConfirmedBatch) => void;
}

function checkBatchEligibility(batch: ConfirmedBatch): { eligible: boolean; reason?: string } {
  if (batch.status !== 'confirmed') {
    return { eligible: false, reason: `Status: ${batch.status}` };
  }
  if (batch.available_heads <= 0) {
    return { eligible: false, reason: 'Fully matched' };
  }
  return { eligible: true };
}

export function ConfirmedBatchesList({
  filters,
  selectedBatchId,
  onSelectBatch,
}: ConfirmedBatchesListProps) {
  const { data: batches, isLoading } = useConfirmedBatches(filters);
  const { data: matchingWindows } = useMatchingWindows();
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState<ConfirmedBatch | null>(null);

  // Get active matching window
  const activeWindow = matchingWindows?.find(w => w.status === 'active') || null;

  const handleViewDetails = (batch: ConfirmedBatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForDetail(batch);
    setDetailSheetOpen(true);
  };

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
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAvailable = batches?.reduce((sum, b) => sum + b.available_heads, 0) || 0;

  return (
    <>
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
          <ScrollArea className="h-[500px] pr-2">
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
                {batches.map((batch) => {
                  const eligibility = checkBatchEligibility(batch);
                  const isLocked = ['matched', 'delivered', 'closed'].includes(batch.status);
                  
                  return (
                    <div
                      key={batch.id}
                      onClick={() => onSelectBatch(batch)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBatchId === batch.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                      } ${batch.available_heads === 0 ? 'opacity-50' : ''}`}
                    >
                      {/* Header: Batch ID, Farmer, Status, Lock */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-sm">{batch.batch_number}</span>
                          {batch.farmer_name && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{batch.farmer_name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* View Details Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleViewDetails(batch, e)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {/* Lock Status */}
                          {isLocked ? (
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Supply Snapshot: Volume indicators */}
                      <div className="flex items-center gap-2 mb-2">
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
                        {batch.matched_heads > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {batch.matched_heads} matched
                          </Badge>
                        )}
                      </div>

                      {/* Location & Quality info */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
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
                        {batch.delivery_period && (
                          <span className="capitalize">
                            {batch.delivery_period.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* Quality Envelope */}
                      {(batch.weight_min || batch.weight_max || batch.age_min || batch.age_max || batch.breed || batch.gender) && (
                        <div className="flex flex-wrap gap-1 mb-2">
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
                          {batch.gender && (
                            <Badge variant="outline" className="text-xs font-normal py-0">
                              {batch.gender}
                            </Badge>
                          )}
                          {batch.breed && (
                            <Badge variant="outline" className="text-xs font-normal py-0">
                              {batch.breed}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Matching Eligibility Indicator */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                          {eligibility.eligible ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-xs text-emerald-600 font-medium">Eligible</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-amber-600" />
                              <span className="text-xs text-amber-600 font-medium">
                                {eligibility.reason || 'Not Eligible'}
                              </span>
                            </>
                          )}
                        </div>
                        {/* Standard Status */}
                        {batch.standard_status && batch.standard_status !== 'non_standard' && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs py-0 ${
                              batch.standard_status === 'high_standard' 
                                ? 'text-amber-600 border-amber-300' 
                                : 'text-blue-600 border-blue-300'
                            }`}
                          >
                            {batch.standard_status === 'high_standard' ? 'High Std' : 'Standard'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Batch Detail Sheet */}
      <BatchDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        batch={selectedForDetail ? {
          ...selectedForDetail,
          farmer_name: selectedForDetail.farmer_name || undefined,
          farmer_id: selectedForDetail.farmer_id_display || undefined,
          farmer_grading: selectedForDetail.farmer_grading || undefined,
          farmer_reliability: selectedForDetail.farmer_reliability || undefined,
        } : null}
        activeMatchingWindow={activeWindow ? {
          id: activeWindow.id,
          name: activeWindow.name,
          eligible_delivery_periods: activeWindow.eligible_delivery_periods || [],
        } : null}
      />
    </>
  );
}
