/**
 * PENDING APPLICATIONS CARD
 * 
 * Shows pending farmer/MPK applications that require admin activation.
 * Used in admin management pages.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

export interface PendingApplication {
  id: string;
  display_id: string;
  name: string;
  region?: string;
  email?: string | null;
  created_at: string;
  registration_status: string;
}

interface PendingApplicationsCardProps {
  title: string;
  applications: PendingApplication[];
  isLoading: boolean;
  onActivate: (id: string, note: string) => Promise<void>;
  onReject: (id: string, note: string) => Promise<void>;
  isPending: boolean;
}

export function PendingApplicationsCard({
  title,
  applications,
  isLoading,
  onActivate,
  onReject,
  isPending,
}: PendingApplicationsCardProps) {
  const [selectedApp, setSelectedApp] = useState<PendingApplication | null>(null);
  const [action, setAction] = useState<'activate' | 'reject' | null>(null);
  const [note, setNote] = useState('');

  const pendingApps = applications.filter(a => a.registration_status === 'pending');

  const handleAction = async () => {
    if (!selectedApp || !action || !note.trim()) return;
    
    if (action === 'activate') {
      await onActivate(selectedApp.id, note);
    } else {
      await onReject(selectedApp.id, note);
    }
    
    setSelectedApp(null);
    setAction(null);
    setNote('');
  };

  const openDialog = (app: PendingApplication, actionType: 'activate' | 'reject') => {
    setSelectedApp(app);
    setAction(actionType);
  };

  if (pendingApps.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
              {pendingApps.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {pendingApps.map(app => (
                <div 
                  key={app.id} 
                  className="flex items-center justify-between p-3 bg-background border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{app.name}</span>
                      <span className="text-xs text-muted-foreground">{app.display_id}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {app.region && (
                        <span className="text-xs text-muted-foreground">{app.region}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Applied {format(new Date(app.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDialog(app, 'reject')}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => openDialog(app, 'activate')}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activation/Rejection Dialog */}
      <Dialog open={!!selectedApp && !!action} onOpenChange={() => {
        setSelectedApp(null);
        setAction(null);
        setNote('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'activate' ? 'Activate Application' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {selectedApp && (
                <>
                  {action === 'activate' ? (
                    <>
                      This will grant <strong>{selectedApp.name}</strong> full access to the platform.
                      They will be able to create and manage their records.
                    </>
                  ) : (
                    <>
                      This will reject <strong>{selectedApp.name}</strong>'s application.
                      They will be notified of this decision.
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              {action === 'activate' ? 'Activation Note' : 'Rejection Reason'} (required for audit)
            </label>
            <Textarea
              placeholder={action === 'activate' 
                ? 'e.g., Application reviewed, profile complete...'
                : 'e.g., Incomplete information, duplicate application...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedApp(null);
              setAction(null);
              setNote('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={!note.trim() || isPending}
              variant={action === 'reject' ? 'destructive' : 'default'}
              className={action === 'activate' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {action === 'activate' ? 'Confirm Activation' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}