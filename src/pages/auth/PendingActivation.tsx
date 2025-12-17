import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Clock, AlertCircle, CheckCircle2, XCircle, LogOut } from 'lucide-react';
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
          title: role === 'farmer' ? 'Observer — Pending activation' : 'Inactive — Pending activation',
          description: 'Your registration is under review. You will be notified once your account is activated.',
        };
      case 'clarification_needed':
        return {
          icon: AlertCircle,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-100',
          title: 'Clarification Needed',
          description: 'Additional information is required to complete your registration. Please check your email for details.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
          title: 'Registration Not Approved',
          description: 'Your registration was not approved at this time. Please contact support for more information.',
        };
      case 'active':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Account Active',
          description: 'Your account is active. Redirecting...',
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted',
          title: 'Status Unknown',
          description: 'Unable to determine your registration status.',
        };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  // If active, redirect to main app
  if (registrationStatus === 'active') {
    setTimeout(() => navigate('/'), 1000);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full ${status.bgColor} flex items-center justify-center mb-4`}>
            <StatusIcon className={`h-8 w-8 ${status.iconColor}`} />
          </div>
          <CardTitle className="text-xl">{status.title}</CardTitle>
          <CardDescription>{status.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {registrationStatus === 'pending' && (
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
