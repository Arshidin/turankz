import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, AlertCircle, Edit, Calendar, MapPin, Users } from 'lucide-react';
import { useBatch, useConfirmBatch, useUpdateBatch } from '@/hooks/useBatches';
import { toast } from '@/hooks/use-toast';

// Map database status to StatusBadge status
const mapStatus = (status: string): 'forecast' | 'soft-committed' | 'confirmed' => {
  if (status === 'soft_committed') return 'soft-committed';
  if (status === 'confirmed' || status === 'delivered') return 'confirmed';
  return 'forecast';
};

export default function BatchDetail() {
  const { batchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get('action') || 'view';
  
  const { data: batch, isLoading, error } = useBatch(batchId ? `BTH-${batchId}` : undefined);
  const confirmBatch = useConfirmBatch();
  const updateBatch = useUpdateBatch();

  const handleConfirm = async () => {
    if (!batch) return;
    
    await confirmBatch.mutateAsync(batch.id);
    navigate('/');
  };

  const handleUpdate = async () => {
    if (!batch) return;
    
    await updateBatch.mutateAsync({
      id: batch.id,
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Batch Updated',
      description: `${batch.batch_number} details have been saved.`,
    });
    navigate('/farmer/batches');
  };

  const handleAcceptInvitation = async () => {
    if (!batch) return;
    
    await updateBatch.mutateAsync({
      id: batch.id,
      status: 'soft_committed',
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Invitation Accepted',
      description: `You have accepted the pool invitation.`,
    });
    navigate('/');
  };

  const handleDeclineInvitation = async () => {
    if (!batch) return;
    
    await updateBatch.mutateAsync({
      id: batch.id,
      requires_action: false,
      action_type: null,
      mpk_interest: null,
    });
    
    toast({
      title: 'Invitation Declined',
      description: 'The pool invitation has been declined.',
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-4">
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </MainLayout>
    );
  }

  if (error || !batch) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Batch not found</p>
          <p className="text-sm text-muted-foreground mb-4">The requested batch could not be located.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getActionTitle = () => {
    switch (action) {
      case 'confirm': return 'Confirm Batch';
      case 'review': return 'Review Invitation';
      case 'update': return 'Update Batch';
      default: return 'Batch Details';
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'confirm': return 'Review batch details and confirm your commitment for the target week.';
      case 'review': return 'Review the pool invitation and decide whether to accept or decline.';
      case 'update': return 'Update batch information to ensure accurate matching.';
      default: return 'View batch information and status.';
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <PageHeader 
        title={getActionTitle()}
        description={getActionDescription()}
      />

      {/* Action Alert */}
      {action !== 'view' && (
        <Card className={`mb-6 ${
          action === 'confirm' ? 'border-status-confirmed/30 bg-status-confirmed/5' :
          action === 'review' ? 'border-status-soft-committed/30 bg-status-soft-committed/5' :
          'border-amber-500/30 bg-amber-500/5'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {action === 'confirm' && <CheckCircle2 className="w-5 h-5 text-status-confirmed flex-shrink-0" />}
              {action === 'review' && <Users className="w-5 h-5 text-status-soft-committed flex-shrink-0" />}
              {action === 'update' && <Edit className="w-5 h-5 text-amber-600 flex-shrink-0" />}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {action === 'confirm' && 'This batch is ready for confirmation'}
                  {action === 'review' && 'You have received a pool invitation'}
                  {action === 'update' && 'This batch requires updated information'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{batch.notes || 'No additional notes.'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Batch Information</CardTitle>
              <StatusBadge status={mapStatus(batch.status)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Batch ID</p>
                  <p className="text-sm font-semibold text-foreground">{batch.batch_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Number of Heads</p>
                  <p className="text-sm font-semibold text-foreground">{batch.heads}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Average Weight</p>
                  <p className={`text-sm font-semibold ${!batch.avg_weight ? 'text-amber-600' : 'text-foreground'}`}>
                    {batch.avg_weight ? `${batch.avg_weight} kg` : '—'}
                    {!batch.avg_weight && (
                      <span className="text-xs font-normal text-amber-600 ml-2">Missing</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Grade</p>
                  <Badge variant="outline">{batch.grade}</Badge>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Region</p>
                    <p className="text-sm font-medium text-foreground">{batch.region}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Target Week</p>
                    <p className="text-sm font-medium text-foreground">{batch.target_week}</p>
                  </div>
                </div>
              </div>
            </div>

            {batch.mpk_interest && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Interested Party</p>
                <p className="text-sm font-medium text-foreground">{batch.mpk_interest}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {action === 'confirm' && (
              <>
                <Button 
                  className="w-full" 
                  onClick={handleConfirm}
                  disabled={confirmBatch.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {confirmBatch.isPending ? 'Confirming...' : 'Confirm Batch'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By confirming, you commit to delivering this batch during the target week.
                </p>
              </>
            )}

            {action === 'review' && (
              <>
                <Button 
                  className="w-full" 
                  onClick={handleAcceptInvitation}
                  disabled={updateBatch.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Invitation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDeclineInvitation}
                  disabled={updateBatch.isPending}
                >
                  Decline
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Accepting commits your batch to this pool request.
                </p>
              </>
            )}

            {action === 'update' && (
              <>
                <Button 
                  className="w-full" 
                  onClick={handleUpdate}
                  disabled={updateBatch.isPending}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {updateBatch.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Ensure all information is accurate for optimal matching.
                </p>
              </>
            )}

            {action === 'view' && (
              <>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/farmer/batch/${batchId}?action=update`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Batch
                </Button>
                {batch.status === 'forecast' && (
                  <Button className="w-full" onClick={() => navigate(`/farmer/batch/${batchId}?action=confirm`)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Batch
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
