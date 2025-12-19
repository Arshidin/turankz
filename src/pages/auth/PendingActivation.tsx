import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Clock, AlertCircle, CheckCircle2, XCircle, LogOut, Eye, BarChart3, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PendingActivation() {
  const navigate = useNavigate();
  const { role, registrationStatus, signOut, user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getStatusDisplay = () => {
    switch (registrationStatus) {
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-100',
          title: 'Registration submitted',
          subtitle: 'Your profile is under review by the TURAN Administration.',
          statusLabel: role === 'farmer' ? 'Observer — Pending activation' : 'Inactive — Pending activation',
        };
      case 'clarification_needed':
        return {
          icon: AlertCircle,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-100',
          title: 'Clarification Needed',
          subtitle: 'Additional information is required to complete your registration.',
          statusLabel: 'Action Required',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
          title: 'Registration Not Approved',
          subtitle: 'Your registration was not approved at this time.',
          statusLabel: 'Not Approved',
        };
      case 'active':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Account Active',
          subtitle: 'Your account is active. Redirecting...',
          statusLabel: 'Active',
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted',
          title: 'Status Unknown',
          subtitle: 'Unable to determine your registration status.',
          statusLabel: 'Unknown',
        };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  // If active, redirect to main app
  if (registrationStatus === 'active') {
    setTimeout(() => navigate('/overview'), 1000);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full ${status.bgColor} flex items-center justify-center mb-4`}>
            <StatusIcon className={`h-8 w-8 ${status.iconColor}`} />
          </div>
          <CardTitle className="text-xl">{status.title}</CardTitle>
          <CardDescription>{status.subtitle}</CardDescription>
          
          {/* Status Badge */}
          <div className="pt-3">
            <div className="inline-block px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
              <span className="text-sm font-semibold text-amber-700">{status.statusLabel}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {registrationStatus === 'pending' && role === 'farmer' && (
            <>
              {/* Access Description */}
              <div className="text-center text-sm text-muted-foreground">
                <p>You currently have read-only access.</p>
                <p>You will be able to declare livestock batches only after Admin approval.</p>
              </div>

              {/* Access Limitations List */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Current Access</p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-3 text-sm">
                    <Eye className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>View market standards and price grid</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <BarChart3 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Explore demand overview (read-only)</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>Cannot create or confirm batches yet</span>
                  </li>
                </ul>
              </div>

              {/* Next Step Expectation */}
              <Alert className="border-border bg-background">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Activation typically occurs after a brief profile review.
                  You will be notified once access is granted.
                </AlertDescription>
              </Alert>
            </>
          )}

          {registrationStatus === 'pending' && role === 'mpk' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>An Admin will review your application</li>
                  <li>You may be contacted for additional information</li>
                  <li>Once approved, you'll gain full access to the platform</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {registrationStatus === 'clarification_needed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Please check your email ({user?.email}) for instructions on what information is needed.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-4">
              <p>Logged in as: {user?.email}</p>
              <p>Role: {role === 'farmer' ? 'Farmer' : 'MPK'}</p>
            </div>

            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
