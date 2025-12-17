import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Package, ClipboardList, Eye, ArrowRight } from 'lucide-react';

export function FirstActionPrompt() {
  const navigate = useNavigate();
  const { role, registrationStatus } = useAuthContext();

  // Only show for newly activated users
  if (registrationStatus !== 'active') return null;

  if (role === 'farmer') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Get Started</CardTitle>
          </div>
          <CardDescription>
            Your account is now active. Declare your first livestock batch to participate in purchase pools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/farmer/batches')} className="w-full">
            Declare Your First Batch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (role === 'mpk') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Get Started</CardTitle>
          </div>
          <CardDescription>
            Your account is now active. Create your first Watchlist or Pool Request to begin procurement.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/mpk/watchlist')} className="flex-1">
            <Eye className="mr-2 h-4 w-4" />
            Create Watchlist
          </Button>
          <Button onClick={() => navigate('/mpk/requests')} className="flex-1">
            <ClipboardList className="mr-2 h-4 w-4" />
            Pool Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
